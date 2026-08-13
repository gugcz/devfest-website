/**
 * `submitInvoiceCallable` — callable the browser invoice form invokes.
 * Validates input and writes a `pending` doc to Firestore; the
 * `processInvoiceTrigger` Firestore trigger does the iDoklad work.
 *
 * Keeping the write server-side means Firestore stays locked to clients
 * (firestore.rules denies all) and untrusted input is validated before it
 * ever reaches iDoklad.
 *
 * Abuse protection (layered, because App Check alone is attestation, not a
 * throttle):
 *   - `enforceAppCheck: true` rejects any request without a valid Firebase
 *     App Check token (reCAPTCHA Enterprise) before the handler runs — blocks
 *     bots/curl that can't mint an attestation.
 *   - a per-(IČO + email) sliding-window rate limit caps how many invoices +
 *     emails one company can drive (cost / sending-reputation abuse).
 *   - `maxInstances` caps fan-out on the shared billing project.
 * (Token replay protection — `consumeAppCheckToken` + limited-use client
 * tokens — is intentionally NOT enabled: low-threat site, not worth the
 * client/server coupling.)
 * The callable protocol also handles CORS, so there's nothing to wire by hand.
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
		// Tighter than the project ceiling — a human filling in a company form does
		// not need ten concurrent instances, and each one issues real invoices.
		maxInstances: 10,
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
