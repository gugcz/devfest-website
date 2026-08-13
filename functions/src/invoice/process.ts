/**
 * `processInvoiceTrigger` — Firestore onCreate trigger for `invoices/{id}`.
 *
 * Runs the invoice half of the pipeline:
 *   1. resolve the active company-funded ti.to release (for price)
 *   2. find/create the iDoklad contact (company)
 *   3. create the iDoklad issued invoice (net line + VAT)
 *   4. ask iDoklad to email the invoice (PDF attached, pay by bank transfer)
 *   5. record everything + notify Slack
 *
 * The payment half (generate + deliver the 100%-off code) is driven later
 * by the `pollPaidInvoicesScheduled` scheduler — iDoklad has no webhooks.
 */

import { logger } from 'firebase-functions/v2';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';

import { describeError } from '../lib/errors.js';
import { SLACK_WEBHOOK_URL } from '../lib/params.js';
import { notify } from '../lib/slack.js';
import { TRIGGER } from '../options.js';
import { TITO_ACCOUNT_SLUG, TITO_API_TOKEN, TITO_EVENT_SLUG } from '../tickets/params.js';
import { releaseTitle } from '../tickets/tito-api.js';
import {
	IDOKLAD_CLIENT_ID,
	IDOKLAD_CLIENT_SECRET,
	INVOICE_DUE_DAYS,
	INVOICE_RELEASE_MATCH,
	INVOICE_VAT_RATE,
} from './params.js';
import {
	createInvoice,
	findOrCreateContact,
	sendInvoiceByEmail,
	type IdokladConfig,
} from './idoklad-api.js';
import {
	pickPricingRelease,
	releaseNetUnitPrice,
	resolveCompanyFundedReleases,
	type TitoConfig,
} from './tito-discount.js';
import { updateInvoice, type InvoiceDoc } from './firestore.js';


export const processInvoiceTrigger = onDocumentCreated(
	{
		...TRIGGER,
		document: 'invoices/{invoiceId}',
		secrets: [IDOKLAD_CLIENT_ID, IDOKLAD_CLIENT_SECRET, TITO_API_TOKEN, SLACK_WEBHOOK_URL],
	},
	async (event) => {
		const snap = event.data;
		if (!snap) return;
		const id = event.params.invoiceId;
		const doc = snap.data() as InvoiceDoc;
		const slackUrl = SLACK_WEBHOOK_URL.value();

		try {
			const titoCfg: TitoConfig = {
				token: TITO_API_TOKEN.value(),
				accountSlug: TITO_ACCOUNT_SLUG.value(),
				eventSlug: TITO_EVENT_SLUG.value(),
			};

			// 1. Resolve the company-funded release — price comes straight
			//    from ti.to (no manual pricing anywhere).
			const releases = await resolveCompanyFundedReleases(titoCfg, INVOICE_RELEASE_MATCH);
			const release = pickPricingRelease(releases);
			if (!release) {
				throw new Error(
					`No ti.to release matched "${INVOICE_RELEASE_MATCH}" — cannot price invoice`,
				);
			}

			const vatRate = INVOICE_VAT_RATE;
			const dueDays = INVOICE_DUE_DAYS;
			const unitPriceNet = releaseNetUnitPrice(release, vatRate);

			// 2. Contact (company).
			const idokladCfg: IdokladConfig = {
				clientId: IDOKLAD_CLIENT_ID.value(),
				clientSecret: IDOKLAD_CLIENT_SECRET.value(),
			};
			const contactId = await findOrCreateContact(idokladCfg, {
				companyName: doc.companyName,
				identificationNumber: doc.registrationNumberIC,
				vatIdentificationNumber: doc.registrationNumberDIC,
				street: doc.street,
				city: doc.city,
				postalCode: doc.zip,
				email: doc.email,
			});

			// 3. Invoice.
			const invoice = await createInvoice(idokladCfg, {
				contactId,
				dueDays,
				description: 'DevFest.cz 2026',
				line: {
					name: `${releaseTitle(release)} — DevFest.cz 2026`,
					quantity: doc.countTickets,
					unitPriceNet,
					vatRatePercent: vatRate,
				},
			});

			// 4. Email the invoice via iDoklad (PDF attached).
			let invoiceEmailSent = false;
			try {
				await sendInvoiceByEmail(idokladCfg, invoice.id, {
					subject: 'Your DevFest.cz 2026 invoice',
					body: [
						`Hi,`,
						``,
						`thank you for your order of ${doc.countTickets} ticket(s) for DevFest.cz 2026.`,
						`Attached is your invoice, payable by bank transfer.`,
						``,
						`Once it's paid we'll send you a discount code to claim your tickets on ti.to.`,
						``,
						`The DevFest.cz team`,
					].join('\n'),
				});
				invoiceEmailSent = true;
			} catch (mailErr) {
				// Non-fatal: the invoice exists, it just wasn't mailed. The Slack line
				// below tells the organizer to send it manually — this names why.
				logger.warn(`processInvoiceTrigger: iDoklad email failed: ${describeError(mailErr)}`, mailErr);
			}

			// 5. Persist + notify.
			await updateInvoice(id, {
				status: 'invoiced',
				idokladContactId: contactId,
				idokladInvoiceId: invoice.id,
				idokladInvoiceNumber: invoice.number,
				variableSymbol: invoice.variableSymbol,
				invoiceEmailSent,
				errorMessage: null,
			});

			const linkNote = invoiceEmailSent
				? ''
				: `\n⚠️ email could not be sent — send invoice ${invoice.number ?? invoice.id} manually`;
			await notify(
				'invoices',
				slackUrl,
				`${doc.companyName} — invoice ${invoice.number ?? invoice.id} issued ` +
					`(${doc.countTickets}× ticket, VS ${invoice.variableSymbol ?? '—'})${linkNote}`,
			);
			logger.info('processInvoiceTrigger invoiced', { id, invoiceId: invoice.id });
		} catch (err) {
			const message = describeError(err);
			logger.error(`processInvoiceTrigger failed: ${message}`, err);
			// errorMessage stays in Firestore (server-only, deny-all rules). The
			// Slack channel gets a generic line — upstream error bodies can echo
			// submitted PII (IČO/DIČ/address), so they don't belong there.
			await updateInvoice(id, { status: 'error', errorMessage: message });
			await notify(
				'invoices',
				slackUrl,
				`❌ ${doc.companyName} — invoice creation failed (id ${id}); see logs`,
			);
		}
	},
);
