/**
 * `submitInvoiceCallable` — validates the form and writes a `pending` doc;
 * `processInvoiceTrigger` does the rest. Abuse protection, outermost first:
 * App Check with single-use tokens (every submit costs a fresh reCAPTCHA
 * assessment), a global ceiling on requests per hour (the backstop — every
 * request mints an iDoklad invoice and an email), a per-(IČO + email)
 * throttle (keyed on values the submitter picks, so a nuisance limit only),
 * `maxInstances` (fan-out).
 */

import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions/v2';

import { describeError } from '../lib/errors.js';
import { CALLABLE } from '../options.js';
import { checkInvoiceRateLimit, countRecentInvoiceRequests, createInvoiceRequest } from './firestore.js';
import { str, validate } from './validate.js';

// At most this many submissions per (company, email) inside the window.
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
// Hard ceiling across everyone inside the same window. Real volume is a
// handful of company invoices a week; 20 an hour is already an incident.
const GLOBAL_LIMIT_MAX = 20;

export const submitInvoiceCallable = onCall(
	{
		...CALLABLE,
		// App Check (reCAPTCHA Enterprise) is the gate that stops a bot minting
		// invoices and emails: the framework rejects a missing/invalid token before
		// the handler runs. Tokens are single-use (`InvoiceForm.tsx` asks for
		// limited-use tokens), so one captured token cannot be replayed — each
		// submit is its own reCAPTCHA assessment.
		enforceAppCheck: true,
		consumeAppCheckToken: true,
		// The browser is the only caller: production, the PR previews, and a dev
		// server (README: App Check debug token). App Check is the real gate;
		// this just stops other origins preflighting.
		cors: [
			/^https:\/\/(www\.)?devfest\.cz$/,
			/^https:\/\/devfest-public--pr-\d+-[a-z0-9]+\.web\.app$/,
			/^http:\/\/localhost(:\d+)?$/,
		],
	},
	async (request) => {
		const body = (request.data ?? {}) as Record<string, unknown>;

		// Honeypot: bots fill hidden fields. Pretend success, write nothing.
		if (str(body.website)) {
			logger.info('submitInvoiceCallable honeypot tripped');
			return { ok: true };
		}

		const result = validate(body);
		if (!result.ok) {
			// `message` carries the offending field so the form can point at it.
			throw new HttpsError('invalid-argument', result.error);
		}

		// Global ceiling first: the identity key below is chosen by the submitter
		// (vary the email, reset the budget), so only this bounds the total number
		// of invoices and emails a farmed token can mint.
		const recent = await countRecentInvoiceRequests(RATE_LIMIT_WINDOW_MS);
		if (recent >= GLOBAL_LIMIT_MAX) {
			logger.warn('submitInvoiceCallable global ceiling reached', { recent, max: GLOBAL_LIMIT_MAX });
			throw new HttpsError('resource-exhausted', 'rate_limited');
		}

		// Then per (company, email): a nuisance limit for the honest repeat.
		const allowed = await checkInvoiceRateLimit({
			registrationNumberIC: result.value.registrationNumberIC,
			email: result.value.email,
			max: RATE_LIMIT_MAX,
			windowMs: RATE_LIMIT_WINDOW_MS,
		});
		if (!allowed) {
			logger.warn('submitInvoiceCallable rate limited', { ic: result.value.registrationNumberIC });
			throw new HttpsError('resource-exhausted', 'rate_limited');
		}

		try {
			const id = await createInvoiceRequest(result.value);
			logger.info('submitInvoiceCallable created invoice request', { id });
			return { ok: true, id };
		} catch (err) {
			logger.error(`submitInvoiceCallable failed to write doc: ${describeError(err)}`, err);
			throw new HttpsError('internal', 'internal');
		}
	},
);
