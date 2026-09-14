/**
 * Pure validation of the `/invoice` form body — no Firebase imports, so it is
 * unit-testable and the callable stays a thin shell around it.
 */

import type { InvoiceRequestInput } from './firestore.js';

const MAX_TICKETS = 50;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Company registration ids (IČO, DIČ, foreign equivalents): letters, digits
// and the separators real registers use. Whitespace is stripped first. Rules
// out `~` and `|`, which the iDoklad filter syntax would otherwise parse.
const REGISTRATION_ID_RE = /^[0-9A-Za-z][0-9A-Za-z./-]{0,31}$/;

export type ValidationResult =
	| { ok: true; value: InvoiceRequestInput }
	| { ok: false; error: string };

export function str(v: unknown): string {
	return typeof v === 'string' ? v.trim() : '';
}

/** Registration ids as typed ("123 45 678") → as stored ("12345678"). */
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

	if (!companyName || companyName.length > 200) return { ok: false, error: 'companyName' };
	if (!REGISTRATION_ID_RE.test(registrationNumberIC)) return { ok: false, error: 'registrationNumberIC' };
	if (registrationNumberDIC && !REGISTRATION_ID_RE.test(registrationNumberDIC)) {
		return { ok: false, error: 'registrationNumberDIC' };
	}
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
