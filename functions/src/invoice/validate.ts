/** Validation of the `/invoice` form body. Pure — no Firebase imports. */

import type { InvoiceRequestInput } from './firestore.js';

const MAX_TICKETS = 50;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// IČO / DIČ / foreign ids. No `~` or `|` — iDoklad filter syntax.
const REGISTRATION_ID_RE = /^[0-9A-Za-z][0-9A-Za-z./-]{0,31}$/;
// Newlines, control and bidi/format characters. These fields land in the
// invoice email body and Slack, where a line break forges a whole paragraph.
const CONTROL_RE = /[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/u;
// Invisible characters a paste from a PDF or web page brings along (soft
// hyphen, zero-width space, LRM/RLM, word joiner, BOM). Harmless, so they are
// dropped before CONTROL_RE rather than failing a real visitor.
const PASTE_NOISE_RE = /[\u00AD\u200B\u200E\u200F\u2060\uFEFF]/g;

export type ValidationResult =
	| { ok: true; value: InvoiceRequestInput }
	| { ok: false; error: string };

export function str(v: unknown): string {
	return typeof v === 'string' ? v.replace(PASTE_NOISE_RE, '').trim() : '';
}

/** "123 45 678" → "12345678". */
function registrationId(v: unknown): string {
	return str(v).replace(/\s+/g, '');
}

export function validate(body: Record<string, unknown>): ValidationResult {
	const companyName = str(body.companyName);
	const registrationNumberIC = registrationId(body.registrationNumberIC);
	const registrationNumberDIC = registrationId(body.registrationNumberDIC);
	const street = str(body.street);
	const city = str(body.city);
	const zip = str(body.zip);
	const country = str(body.country) || 'CZ';
	const email = str(body.email);
	const countRaw = body.countTickets;
	const countTickets = typeof countRaw === 'number' ? countRaw : parseInt(String(countRaw), 10);

	if (!companyName || companyName.length > 200 || CONTROL_RE.test(companyName)) {
		return { ok: false, error: 'companyName' };
	}
	if (!REGISTRATION_ID_RE.test(registrationNumberIC)) return { ok: false, error: 'registrationNumberIC' };
	if (registrationNumberDIC && !REGISTRATION_ID_RE.test(registrationNumberDIC)) {
		return { ok: false, error: 'registrationNumberDIC' };
	}
	if (!street || street.length > 200 || CONTROL_RE.test(street)) return { ok: false, error: 'street' };
	if (!city || city.length > 200 || CONTROL_RE.test(city)) return { ok: false, error: 'city' };
	if (!zip || zip.length > 20 || CONTROL_RE.test(zip)) return { ok: false, error: 'zip' };
	if (country.length > 64 || CONTROL_RE.test(country)) return { ok: false, error: 'country' };
	if (!email || email.length > 200 || !EMAIL_RE.test(email) || CONTROL_RE.test(email)) {
		return { ok: false, error: 'email' };
	}
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
