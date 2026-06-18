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
	IDOKLAD_APP_ID,
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
import { listAwaitingPayment, updateInvoice, type InvoiceRecord } from './firestore.js';
import { notify } from './slack.js';

const REGION = 'europe-west1';

export const pollPaidInvoices = onSchedule(
	{
		schedule: 'every 1 hours',
		timeZone: 'Europe/Prague',
		region: REGION,
		secrets: [IDOKLAD_CLIENT_ID, IDOKLAD_CLIENT_SECRET, TITO_API_TOKEN, SLACK_WEBHOOK_URL],
		memory: '256MiB',
		timeoutSeconds: 300,
	},
	async () => {
		const awaiting = await listAwaitingPayment();
		if (awaiting.length === 0) return;

		const idokladCfg: IdokladConfig = {
			clientId: IDOKLAD_CLIENT_ID.value(),
			clientSecret: IDOKLAD_CLIENT_SECRET.value(),
			appId: IDOKLAD_APP_ID.value() || undefined,
		};
		const titoCfg: TitoConfig = {
			token: TITO_API_TOKEN.value(),
			accountSlug: TITO_ACCOUNT_SLUG.value(),
			eventSlug: TITO_EVENT_SLUG.value(),
		};
		const slackUrl = SLACK_WEBHOOK_URL.value();

		let completed = 0;
		for (const record of awaiting) {
			try {
				if (record.data.idokladInvoiceId == null) continue;
				const status = await getInvoicePaymentStatus(idokladCfg, record.data.idokladInvoiceId);
				if (!isPaidStatus(status)) continue;
				await completeInvoice(record, idokladCfg, titoCfg, slackUrl);
				completed += 1;
			} catch (err) {
				const message = err instanceof Error ? err.message : String(err);
				logger.error('pollPaidInvoices: failed to complete invoice', { id: record.id, message });
				await notify(slackUrl, `❌ ${record.data.companyName} — chyba po zaplacení: ${message}`);
			}
		}
		logger.info('pollPaidInvoices done', { checked: awaiting.length, completed });
	},
);

async function completeInvoice(
	record: InvoiceRecord,
	idokladCfg: IdokladConfig,
	titoCfg: TitoConfig,
	slackUrl: string,
): Promise<void> {
	const { id, data } = record;

	const releases = await resolveCompanyFundedReleases(titoCfg, INVOICE_RELEASE_MATCH.value());
	const releaseIds = releases.map((r) => r.id);
	if (releaseIds.length === 0) {
		throw new Error(`No ti.to release matched "${INVOICE_RELEASE_MATCH.value()}"`);
	}

	const code = buildDiscountCode(data.companyName, id.slice(-6));
	const created = await createDiscountCode(titoCfg, {
		code,
		quantity: data.countTickets,
		releaseIds,
	});
	const link = discountRedeemUrl(titoCfg, created.code);

	let discountEmailSent = false;
	try {
		const mail = buildDiscountEmail({
			code: created.code,
			link,
			ticketCount: data.countTickets,
			companyName: data.companyName,
		});
		const result = await sendEmail(
			{
				apiKey: RESEND_API_KEY.value(),
				fromEmail: INVOICE_FROM_EMAIL.value(),
				fromName: INVOICE_FROM_NAME.value(),
			},
			{ to: data.email, subject: mail.subject, text: mail.text, html: mail.html },
		);
		discountEmailSent = result.sent;
	} catch (mailErr) {
		logger.warn('completeInvoice: discount email failed', mailErr);
	}

	await updateInvoice(id, {
		status: 'completed',
		discountCode: created.code,
		discountLink: link,
		discountEmailSent,
		errorMessage: null,
	});

	const emailNote = discountEmailSent
		? 'kód odeslán e-mailem'
		: `⚠️ e-mail neodeslán — pošlete kód ručně: ${created.code} (${link})`;
	await notify(
		slackUrl,
		`${data.companyName} — zaplaceno, vygenerován kód ${created.code} ` +
			`pro ${data.countTickets}× vstupenku; ${emailNote}`,
	);
	logger.info('completeInvoice completed', { id, code: created.code });
}
