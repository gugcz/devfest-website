/**
 * `pollPaidInvoices` — scheduled payment poller.
 *
 * iDoklad has NO webhooks, so we cannot be pushed a "paid" event. Instead
 * this runs hourly, lists the invoices still awaiting payment, and asks
 * iDoklad for each one's PaymentStatus. When an invoice is paid we mint
 * the 100%-off ti.to code and deliver it.
 *
 *   list invoiced docs → check PaymentStatus → (paid) mint code →
 *   email the code → record + notify Slack.
 *
 * Completion flips the doc to `completed`, so a paid invoice is processed
 * exactly once even though the poller re-runs.
 */

import { logger } from 'firebase-functions/v2';
import { onSchedule } from 'firebase-functions/v2/scheduler';

import {
	SLACK_WEBHOOK_URL,
	TITO_ACCOUNT_SLUG,
	TITO_API_TOKEN,
	TITO_EVENT_SLUG,
} from '../tickets/params.js';
import {
	IDOKLAD_CLIENT_ID,
	IDOKLAD_CLIENT_SECRET,
	INVOICE_FROM_EMAIL,
	INVOICE_FROM_NAME,
	INVOICE_RELEASE_MATCH,
	RESEND_API_KEY,
} from './params.js';
import {
	getInvoicePaymentStatus,
	isPaidStatus,
	type IdokladConfig,
} from './idoklad-api.js';
import {
	buildDiscountCode,
	createDiscountCode,
	discountRedeemUrl,
	resolveCompanyFundedReleases,
	type TitoConfig,
} from './tito-discount.js';
import { buildDiscountEmail, sendEmail } from './email.js';
import {
	claimInvoiceForProcessing,
	listAwaitingPayment,
	releaseInvoiceClaim,
	updateInvoice,
	type InvoiceRecord,
} from './firestore.js';
import { notify } from './slack.js';

const REGION = 'europe-west1';

export const pollPaidInvoices = onSchedule(
	{
		schedule: 'every 1 hours',
		timeZone: 'Europe/Prague',
		region: REGION,
		secrets: [IDOKLAD_CLIENT_ID, IDOKLAD_CLIENT_SECRET, RESEND_API_KEY, TITO_API_TOKEN, SLACK_WEBHOOK_URL],
		memory: '256MiB',
		timeoutSeconds: 300,
	},
	async () => {
		const awaiting = await listAwaitingPayment();
		if (awaiting.length === 0) return;

		const idokladCfg: IdokladConfig = {
			clientId: IDOKLAD_CLIENT_ID.value(),
			clientSecret: IDOKLAD_CLIENT_SECRET.value(),
		};
		const titoCfg: TitoConfig = {
			token: TITO_API_TOKEN.value(),
			accountSlug: TITO_ACCOUNT_SLUG.value(),
			eventSlug: TITO_EVENT_SLUG.value(),
		};
		const slackUrl = SLACK_WEBHOOK_URL.value();

		let completed = 0;
		for (const record of awaiting) {
			if (record.data.idokladInvoiceId == null) continue;

			let status: number;
			try {
				status = await getInvoicePaymentStatus(idokladCfg, record.data.idokladInvoiceId);
			} catch (err) {
				const message = err instanceof Error ? err.message : String(err);
				logger.error('pollPaidInvoices: payment status check failed', { id: record.id, message });
				continue;
			}
			if (!isPaidStatus(status)) continue;

			// Atomically claim invoiced→processing so the code is minted once
			// even if a previous run already picked this doc up.
			if (!(await claimInvoiceForProcessing(record.id))) continue;

			try {
				await completeInvoice(record, titoCfg, slackUrl);
				completed += 1;
			} catch (err) {
				const message = err instanceof Error ? err.message : String(err);
				logger.error('pollPaidInvoices: failed to complete invoice', { id: record.id, message });
				// Revert to `invoiced` so the next poll retries. Safe to re-run:
				// the code is persisted the instant it's minted, so completeInvoice
				// never mints a second one.
				await releaseInvoiceClaim(record.id, message);
				// Keep upstream error detail in logs only — don't echo (potential
				// PII) into the Slack channel.
				await notify(slackUrl, `❌ ${record.data.companyName} — post-payment processing failed (id ${record.id}); see logs`);
			}
		}
		logger.info('pollPaidInvoices done', { checked: awaiting.length, completed });
	},
);

async function completeInvoice(
	record: InvoiceRecord,
	titoCfg: TitoConfig,
	slackUrl: string,
): Promise<void> {
	const { id, data } = record;

	// Idempotent mint: if a code was already created on a prior (partial) run,
	// reuse it instead of minting a second one. The code is deterministic, so a
	// re-mint would otherwise collide on ti.to.
	let code = data.discountCode ?? null;
	let link = data.discountLink ?? null;

	if (!code) {
		const releases = await resolveCompanyFundedReleases(titoCfg, INVOICE_RELEASE_MATCH);
		const releaseIds = releases.map((r) => r.id);
		if (releaseIds.length === 0) {
			throw new Error(`No ti.to release matched "${INVOICE_RELEASE_MATCH}"`);
		}

		const created = await createDiscountCode(titoCfg, {
			code: buildDiscountCode(data.companyName, id.slice(-6)),
			quantity: data.countTickets,
			releaseIds,
		});
		code = created.code;
		link = discountRedeemUrl(titoCfg, created.code);

		// Persist the code BEFORE attempting delivery, so a later failure never
		// re-mints — the next run sees the code and skips creation.
		await updateInvoice(id, { discountCode: code, discountLink: link });
	}

	let discountEmailSent = false;
	try {
		const mail = buildDiscountEmail({
			code,
			link: link ?? '',
			ticketCount: data.countTickets,
			companyName: data.companyName,
		});
		const result = await sendEmail(
			{
				apiKey: RESEND_API_KEY.value(),
				fromEmail: INVOICE_FROM_EMAIL,
				fromName: INVOICE_FROM_NAME,
			},
			{ to: data.email, subject: mail.subject, text: mail.text, html: mail.html },
		);
		discountEmailSent = result.sent;
	} catch (mailErr) {
		logger.warn('completeInvoice: discount email failed', mailErr);
	}

	await updateInvoice(id, {
		status: 'completed',
		discountCode: code,
		discountLink: link,
		discountEmailSent,
		errorMessage: null,
	});

	const emailNote = discountEmailSent
		? 'code emailed'
		: `⚠️ email not sent — send code manually: ${code} (${link})`;
	await notify(
		slackUrl,
		`${data.companyName} — paid, code ${code} generated ` +
			`for ${data.countTickets}× ticket; ${emailNote}`,
	);
	logger.info('completeInvoice completed', { id, code });
}
