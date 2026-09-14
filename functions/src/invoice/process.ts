/**
 * `processInvoiceTrigger` — onCreate for `invoices/{id}`: resolve the
 * company-funded release (price) → find/create iDoklad contact → create
 * invoice → email it → record + Slack. Payment is handled later by
 * `pollPaidInvoicesScheduled`.
 */

import { logger } from 'firebase-functions/v2';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';

import { describeError } from '../lib/errors.js';
import { SLACK_WEBHOOK_URL } from '../lib/params.js';
import { escapeMrkdwn, notify } from '../lib/slack.js';
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
import { buildInvoiceEmail, formatDueDate } from './email.js';
import { claimInvoiceForIssuing, updateInvoice, type InvoiceDoc } from './firestore.js';


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
			// Firestore delivers create events at least once. Only the delivery
			// that flips `pending` → `processing` issues the invoice; a replay sees
			// the doc already claimed and does nothing — never a second iDoklad
			// invoice. Inside the try so a failed transaction lands in `error` +
			// Slack like every other fault, not a doc stuck at `pending`.
			if (!(await claimInvoiceForIssuing(id))) {
				logger.info('processInvoiceTrigger duplicate delivery ignored', { id });
				return;
			}

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
			const contact = await findOrCreateContact(idokladCfg, {
				companyName: doc.companyName,
				identificationNumber: doc.registrationNumberIC,
				vatIdentificationNumber: doc.registrationNumberDIC,
				street: doc.street,
				city: doc.city,
				postalCode: doc.zip,
				email: doc.email,
			});
			const contactId = contact.id;

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

			// 4. Email the invoice via iDoklad (PDF attached). Copy lives in
			//    `email.ts` next to the discount-code message, so the two mails a
			//    company receives read as one voice.
			let invoiceEmailSent = false;
			try {
				const mail = buildInvoiceEmail({
					companyName: doc.companyName,
					ticketCount: doc.countTickets,
					invoiceNumber: invoice.number,
					variableSymbol: invoice.variableSymbol,
					dueDate: formatDueDate(invoice.dueDate),
				});
				// Always the submitted address, never the contact's stored one —
				// a reused contact is read-only for the form (see `findOrCreateContact`).
				const result = await sendInvoiceByEmail(idokladCfg, invoice.id, {
					subject: mail.subject,
					body: mail.body,
					recipients: [doc.email],
				});
				// Only iDoklad's own `IsSuccess: true` counts as sent. An
				// unconfirmed send is reported as unsent, so Slack asks for a manual
				// send instead of quietly claiming delivery.
				invoiceEmailSent = result.confirmed;
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
				// A reused contact keeps its stored details; `contactDiffers` names the
				// form fields that disagree, so the doc says so, not only a Slack line.
				contactReused: contact.reused,
				contactDiffers: contact.differing,
				errorMessage: null,
			});

			const linkNote = invoiceEmailSent
				? ''
				: `\n⚠️ email could not be sent — send invoice ${invoice.number ?? invoice.id} manually`;
			// A reused contact is never edited from the form, so the invoice carries
			// its stored details. When the form disagrees, a human decides whether
			// the company moved or a stranger typed someone else's IČO.
			const contactNote = contact.differing.length === 0
				? ''
				: `\n⚠️ existing iDoklad contact ${contactId} reused — submitted ` +
					`${contact.differing.join(', ')} differ from the stored record; the invoice ` +
					`carries the stored details and was mailed to the submitted address. Review in iDoklad.`;
			await notify(
				'invoices',
				slackUrl,
				`${escapeMrkdwn(doc.companyName)} — invoice ${invoice.number ?? invoice.id} issued ` +
					`(${doc.countTickets}× ticket, VS ${invoice.variableSymbol ?? '—'})${linkNote}${contactNote}`,
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
				`❌ ${escapeMrkdwn(doc.companyName)} — invoice creation failed (id ${id}); see logs`,
			);
		}
	},
);
