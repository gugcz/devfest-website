/**
 * Invoice domain config. Credentials are secrets
 * (`firebase functions:secrets:set <NAME>`); everything else is a code
 * constant. ti.to params come from `../tickets/params.js`,
 * `SLACK_WEBHOOK_URL` from `../lib/params.js` — never redeclare.
 */

import { defineSecret } from 'firebase-functions/params';

// ── Secrets (firebase functions:secrets:set) ────────────────────────────
// iDoklad OAuth client credentials (Nastavení → Aplikace → API).
export const IDOKLAD_CLIENT_ID = defineSecret('IDOKLAD_CLIENT_ID');
export const IDOKLAD_CLIENT_SECRET = defineSecret('IDOKLAD_CLIENT_SECRET');
// Resend API key for the discount-code email. Set to enable email; if the
// stored value is empty, the code is still posted to Slack + stored on the doc.
export const RESEND_API_KEY = defineSecret('RESEND_API_KEY');

// ── Stable config (constants) ───────────────────────────────────────────
// Substring (case-insensitive) identifying the company-funded ti.to
// releases. The invoice price is taken automatically from the active
// matching release; the 100%-off code is scoped to every matching release.
export const INVOICE_RELEASE_MATCH = 'company funded';

// VAT rate (percent): backs the net unit price out of the ti.to gross and
// picks the iDoklad VatRateType (21 → Basic, 0 → Zero). GUG is a VAT payer.
export const INVOICE_VAT_RATE = 21;

// Days until the invoice is due.
export const INVOICE_DUE_DAYS = 14;

// Discount-code email sender. The domain MUST be verified in Resend.
export const INVOICE_FROM_EMAIL = 'noreply@devfest.cz';
export const INVOICE_FROM_NAME = 'DevFest.cz';
