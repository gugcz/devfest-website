/**
 * `submitInvoiceRequest` — public HTTPS endpoint the browser invoice form
 * POSTs to. Validates input and writes a `pending` doc to Firestore; the
 * `processInvoiceRequest` Firestore trigger does the iDoklad work.
 *
 * Keeping the write server-side means Firestore stays locked to clients
 * (firestore.rules denies all) and untrusted input is validated before it
 * ever reaches iDoklad.
 */

import { logger } from 'firebase-functions/v2';
import { onRequest } from 'firebase-functions/v2/https';

import { WEBSITE_ORIGIN } from './params.js';
import { createInvoiceRequest, type InvoiceRequestInput } from './firestore.js';

const REGION = 'europe-west1';
const MAX_TICKETS = 50;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function resolveAllowedOrigin(requestOrigin: string | undefined): string {
	const configured = WEBSITE_ORIGIN;
	if (!requestOrigin) return configured;
	if (requestOrigin === configured) return requestOrigin;
	// Allow local dev origins so the form works against `npm run dev`.
	if (/^http:\/\/localhost(:\d+)?$/.test(requestOrigin)) return requestOrigin;
	return configured;
}

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

export const submitInvoiceRequest = onRequest(
	{
		region: REGION,
		memory: '256MiB',
		timeoutSeconds: 30,
		invoker: 'public',
	},
	async (req, res) => {
		const origin = resolveAllowedOrigin(req.header('origin'));
		res.set('Access-Control-Allow-Origin', origin);
		res.set('Vary', 'Origin');
		res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
		res.set('Access-Control-Allow-Headers', 'Content-Type');
		res.set('Access-Control-Max-Age', '3600');

		if (req.method === 'OPTIONS') {
			res.status(204).send('');
			return;
		}
		if (req.method !== 'POST') {
			res.status(405).json({ ok: false, error: 'method_not_allowed' });
			return;
		}

		const body = (req.body ?? {}) as Record<string, unknown>;

		// Honeypot: bots fill hidden fields. Pretend success, write nothing.
		if (str(body.website)) {
			logger.info('submitInvoiceRequest honeypot tripped');
			res.status(200).json({ ok: true });
			return;
		}

		const result = validate(body);
		if (!result.ok) {
			res.status(400).json({ ok: false, error: `invalid_${result.error}` });
			return;
		}

		try {
			const id = await createInvoiceRequest(result.value);
			logger.info('submitInvoiceRequest created invoice request', { id });
			res.status(201).json({ ok: true, id });
		} catch (err) {
			logger.error('submitInvoiceRequest failed to write doc', err);
			res.status(500).json({ ok: false, error: 'internal' });
		}
	},
);
