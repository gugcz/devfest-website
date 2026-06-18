/**
 * Configuration parameters for the invoice domain (iDoklad + ti.to
 * company-funded invoice-first flow).
 *
 * Secrets live in Secret Manager:
 *   firebase functions:secrets:set <NAME>
 *
 * Non-secret strings come from functions/.env or `--set-env-vars`.
 *
 * ti.to credentials (`TITO_API_TOKEN`, `TITO_ACCOUNT_SLUG`,
 * `TITO_EVENT_SLUG`) and `SLACK_WEBHOOK_URL` are owned by the tickets
 * domain — import them from `../tickets/params.js`, do NOT redeclare.
 */

import { defineSecret, defineString } from 'firebase-functions/params';

// ── iDoklad OAuth 2.0 (Client Credentials Flow) ─────────────────────────
// Create credentials in iDoklad → Settings → API (klientské přihlašovací
// údaje). Client Credentials issues a ~2h bearer token with no refresh.
export const IDOKLAD_CLIENT_ID = defineSecret('IDOKLAD_CLIENT_ID');
export const IDOKLAD_CLIENT_SECRET = defineSecret('IDOKLAD_CLIENT_SECRET');

// Optional `application_id` some iDoklad partner setups require on the
// token request. Empty default → omitted from the request.
export const IDOKLAD_APP_ID = defineString('IDOKLAD_APP_ID', { default: '' });

// ── Invoice business rules ──────────────────────────────────────────────
// Substring (case-insensitive) identifying the company-funded ti.to
// releases. The invoice price is taken from the active matching release,
// and the 100%-off code is scoped to every matching release id.
export const INVOICE_RELEASE_MATCH = defineString('INVOICE_RELEASE_MATCH', {
	default: 'company funded',
});

// VAT rate (percent) used to (a) back out the net unit price from the
// ti.to gross price and (b) pick the iDoklad VatRateType (21 → Basic,
// 0 → Zero). GUG is a VAT payer → 21.
export const INVOICE_VAT_RATE = defineString('INVOICE_VAT_RATE', { default: '21' });

// Days until the invoice is due.
export const INVOICE_DUE_DAYS = defineString('INVOICE_DUE_DAYS', { default: '14' });

// ── Discount-code delivery email (optional) ─────────────────────────────
// The invoice itself is emailed by iDoklad (with the PDF attached). The
// 100%-off code email is sent via the Resend HTTP API when this key is
// present; if absent, the code is still posted to Slack + stored on the
// doc so an organizer can relay it manually.
//
// Declared as a (non-secret) string with an empty default so the feature
// is genuinely optional — no deploy friction when email is not wired up.
// The `INVOICE_FROM_EMAIL` domain must be verified in Resend.
export const RESEND_API_KEY = defineString('RESEND_API_KEY', { default: '' });

export const INVOICE_FROM_EMAIL = defineString('INVOICE_FROM_EMAIL', {
	default: 'devfest@gug.cz',
});
export const INVOICE_FROM_NAME = defineString('INVOICE_FROM_NAME', {
	default: 'DevFest.cz',
});

// ── CORS ────────────────────────────────────────────────────────────────
// Allowed origin for the browser `submitInvoiceRequest` endpoint.
export const WEBSITE_ORIGIN = defineString('WEBSITE_ORIGIN', {
	default: 'https://devfest.cz',
});
