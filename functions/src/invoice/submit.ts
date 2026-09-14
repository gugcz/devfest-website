/**
 * `submitInvoiceCallable` — validates the form and writes a `pending` doc;
 * `processInvoiceTrigger` does the rest. Abuse protection: App Check
 * (attestation), a per-(IČO + email) rate limit (throttle), `maxInstances`
 * (fan-out). Token replay protection deliberately not enabled.
 */

import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions/v2';

import { describeError } from '../lib/errors.js';
import { CALLABLE } from '../options.js';
import { checkInvoiceRateLimit, createInvoiceRequest, type InvoiceRequestInput } from './firestore.js';

const MAX_TICKETS = 50;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// At most this many submissions per (company, email) inside the window.
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

type ValidationResult =
	| { ok: true; value: InvoiceRequestInput }
	| { ok: false; error: string };

function str(v: unknown): string {
	return typeof v === 'string' ? v.trim() : '';
}

function validate(body: Record<string, unknown>): ValidationResult {
	const companyName = str(body.companyName);
	const registrationNumberIC = str(body.registrationNumberIC);
	const registrationNumberDIC = str(body.registrationNumberDIC);
	const street = str(body.street);
	const city = str(body.city);
	const zip = str(body.zip);
	const country = str(body.country) || 'CZ';
	const email = str(body.email);
	const countRaw = body.countTickets;
	const countTickets = typeof countRaw === 'number' ? countRaw : parseInt(String(countRaw), 10);

	if (!companyName || companyName.length > 200) return { ok: false, error: 'companyName' };
	if (!registrationNumberIC || registrationNumberIC.length > 32) return { ok: false, error: 'registrationNumberIC' };
	if (registrationNumberDIC.length > 32) return { ok: false, error: 'registrationNumberDIC' };
	if (!street || street.length > 200) return { ok: false, error: 'street' };
	if (!city || city.length > 200) return { ok: false, error: 'city' };
	if (!zip || zip.length > 20) return { ok: false, error: 'zip' };
	if (country.length > 64) return { ok: false, error: 'country' };
	if (!email || email.length > 200 || !EMAIL_RE.test(email)) return { ok: false, error: 'email' };
	if (!Number.isInteger(countTickets) || countTickets < 1 || countTickets > MAX_TICKETS) {
		return { ok: false, error: 'countTickets' };
	}

	return {
		ok: true,
		value: {
			companyName,
			registrationNumberIC,
			registrationNumberDIC: registrationNumberDIC || null,
			street,
			city,
			zip,
			country,
			email,
			countTickets,
		},
	};
}

export const submitInvoiceCallable = onCall(
	{
		...CALLABLE,
		// App Check (reCAPTCHA Enterprise) is the gate that stops a bot minting
		// invoices and emails: the framework rejects a missing/invalid token before
		// the handler runs.
		enforceAppCheck: true,
		// The browser is the only caller: production and the PR previews. App
		// Check is the real gate; this just stops other origins preflighting.
		cors: [/^https:\/\/(www\.)?devfest\.cz$/, /^https:\/\/devfest-public--pr-\d+-[a-z0-9]+\.web\.app$/],
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

		// Throttle per (company, email) so one valid App Check token can't drive
		// unbounded invoice + email creation.
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
