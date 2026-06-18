/**
 * `processInvoiceRequest` — Firestore onCreate trigger for `invoices/{id}`.
 *
 * Runs the invoice half of the pipeline:
 *   1. resolve the active company-funded ti.to release (for price)
 *   2. find/create the iDoklad contact (company)
 *   3. create the iDoklad issued invoice (net line + VAT)
 *   4. ask iDoklad to email the invoice (PDF attached, pay by bank transfer)
 *   5. record everything + notify Slack
 *
 * The payment half (generate + deliver the 100%-off code) is driven later
 * by the `pollPaidInvoices` scheduler — iDoklad has no webhooks.
 */

import { logger } from 'firebase-functions/v2';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';

import {
	SLACK_WEBHOOK_URL,
	TITO_ACCOUNT_SLUG,
	TITO_API_TOKEN,
	TITO_EVENT_SLUG,
} from '../tickets/params.js';
import { releaseTitle } from '../tickets/tito-api.js';
import {
	IDOKLAD_APP_ID,
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
import { notify } from './slack.js';

const REGION = 'europe-west1';

export const processInvoiceRequest = onDocumentCreated(
	{
		region: REGION,
		document: 'invoices/{invoiceId}',
		secrets: [IDOKLAD_CLIENT_ID, IDOKLAD_CLIENT_SECRET, TITO_API_TOKEN, SLACK_WEBHOOK_URL],
		memory: '256MiB',
		timeoutSeconds: 120,
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

			// 1. Resolve the company-funded release for price.
			const releases = await resolveCompanyFundedReleases(titoCfg, INVOICE_RELEASE_MATCH.value());
			const release = pickPricingRelease(releases);
			if (!release) {
				throw new Error(
					`No ti.to release matched "${INVOICE_RELEASE_MATCH.value()}" — cannot price invoice`,
				);
			}

			const vatRate = Number(INVOICE_VAT_RATE.value()) || 0;
			const dueDays = Number(INVOICE_DUE_DAYS.value()) || 14;
			const unitPriceNet = releaseNetUnitPrice(release, vatRate);

			// 2. Contact (company).
			const idokladCfg: IdokladConfig = {
				clientId: IDOKLAD_CLIENT_ID.value(),
				clientSecret: IDOKLAD_CLIENT_SECRET.value(),
				appId: IDOKLAD_APP_ID.value() || undefined,
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
					subject: 'Faktura za vstupenky DevFest.cz 2026',
					body: [
						`Dobrý den,`,
						``,
						`děkujeme za objednávku ${doc.countTickets} vstupenek na DevFest.cz 2026.`,
						`V příloze najdete fakturu k úhradě bankovním převodem.`,
						``,
						`Po zaplacení vám zašleme slevový kód pro vyzvednutí vstupenek na ti.to.`,
						``,
						`Tým DevFest.cz`,
					].join('\n'),
				});
				invoiceEmailSent = true;
			} catch (mailErr) {
				logger.warn('processInvoiceRequest: iDoklad email failed', mailErr);
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
				: `\n⚠️ e-mail se nepodařilo odeslat — pošlete fakturu ${invoice.number ?? invoice.id} ručně`;
			await notify(
				slackUrl,
				`${doc.companyName} — vystavena faktura ${invoice.number ?? invoice.id} ` +
					`(${doc.countTickets}× vstupenka, VS ${invoice.variableSymbol ?? '—'})${linkNote}`,
			);
			logger.info('processInvoiceRequest invoiced', { id, invoiceId: invoice.id });
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			logger.error('processInvoiceRequest failed', err);
			await updateInvoice(id, { status: 'error', errorMessage: message });
			await notify(slackUrl, `❌ ${doc.companyName} — chyba při vystavení faktury: ${message}`);
		}
	},
);
