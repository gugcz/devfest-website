/**
 * Configuration for the invoice domain (iDoklad + ti.to company-funded
 * invoice-first flow).
 *
 * Credentials are **secrets** (Secret Manager) — set each once:
 *   firebase functions:secrets:set <NAME>
 *
 * Everything else is a stable code constant below (change here + redeploy)
 * — kept out of env/Secret Manager so there is nothing to configure beyond
 * the keys.
 *
 * ti.to credentials (`TITO_API_TOKEN`, `TITO_ACCOUNT_SLUG`,
 * `TITO_EVENT_SLUG`) and `SLACK_WEBHOOK_URL` are owned by the tickets
 * domain — import them from `../tickets/params.js`, do NOT redeclare.
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
export const INVOICE_FROM_EMAIL = 'devfest@gug.cz';
export const INVOICE_FROM_NAME = 'DevFest.cz';
