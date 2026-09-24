/**
 * `submitInvoiceCallable` — validates the form and writes a `pending` doc;
 * `processInvoiceTrigger` does the rest. Abuse protection: App Check, a
 * global hourly ceiling, a per-(IČO + email) throttle,
 * `maxInstances`.
 */

import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions/v2';

import { describeError } from '../lib/errors.js';
import { CALLABLE } from '../options.js';
import { checkInvoiceRateLimit, countRecentInvoiceRequests, createInvoiceRequest } from './firestore.js';
import { str, validate } from './validate.js';

// Per (company, email) inside the window.
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
// Across everyone inside the window — every request mints an invoice + email.
const GLOBAL_LIMIT_MAX = 20;

export const submitInvoiceCallable = onCall(
	{
		...CALLABLE,
		// App Check (reCAPTCHA Enterprise) rejects bots before the handler runs.
		// Not single-use: consuming tokens needs an extra IAM role on the runtime
		// service account and 401s every submit without it. The global ceiling
		// below bounds what a replayed token can do.
		enforceAppCheck: true,
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

		// Global ceiling first — the identity key below is chosen by the submitter.
		const recent = await countRecentInvoiceRequests(RATE_LIMIT_WINDOW_MS);
		if (recent >= GLOBAL_LIMIT_MAX) {
			logger.warn('submitInvoiceCallable global ceiling reached', { recent, max: GLOBAL_LIMIT_MAX });
			throw new HttpsError('resource-exhausted', 'rate_limited');
		}

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
