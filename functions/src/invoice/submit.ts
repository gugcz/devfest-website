/**
 * `submitInvoiceRequest` — callable the browser invoice form invokes.
 * Validates input and writes a `pending` doc to Firestore; the
 * `processInvoiceRequest` Firestore trigger does the iDoklad work.
 *
 * Keeping the write server-side means Firestore stays locked to clients
 * (firestore.rules denies all) and untrusted input is validated before it
 * ever reaches iDoklad.
 *
 * Abuse protection: `enforceAppCheck: true` makes the callable reject any
 * request without a valid Firebase App Check token (reCAPTCHA Enterprise)
 * before the handler runs — the client SDK attaches the token automatically,
 * so bots/curl that can't mint an attestation are blocked. The callable
 * protocol also handles CORS, so there's nothing to wire by hand.
 */

import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions/v2';

import { createInvoiceRequest, type InvoiceRequestInput } from './firestore.js';

const REGION = 'europe-west1';
const MAX_TICKETS = 50;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

export const submitInvoiceRequest = onCall(
	{
		region: REGION,
		enforceAppCheck: true,
		memory: '256MiB',
		timeoutSeconds: 30,
	},
	async (request) => {
		const body = (request.data ?? {}) as Record<string, unknown>;

		// Honeypot: bots fill hidden fields. Pretend success, write nothing.
		if (str(body.website)) {
			logger.info('submitInvoiceRequest honeypot tripped');
			return { ok: true };
		}

		const result = validate(body);
		if (!result.ok) {
			// `message` carries the offending field so the form can point at it.
			throw new HttpsError('invalid-argument', result.error);
		}

		try {
			const id = await createInvoiceRequest(result.value);
			logger.info('submitInvoiceRequest created invoice request', { id });
			return { ok: true, id };
		} catch (err) {
			logger.error('submitInvoiceRequest failed to write doc', err);
			throw new HttpsError('internal', 'internal');
		}
	},
);
