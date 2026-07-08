/**
 * Configuration parameters for the sessionize domain.
 *
 * Secrets are stored in Secret Manager and configured with
 *   firebase functions:secrets:set <NAME>
 *
 * The Slack webhook is NOT redefined here — `refresh-sessionize.ts` imports
 * `SLACK_WEBHOOK_URL` from the tickets domain (`tickets/params.ts` is the single
 * source of truth for it; the invoice domain reuses it the same way).
 */

import { defineSecret } from 'firebase-functions/params';

// Sessionize JSON endpoint id for the DevFest.cz event's "All data" view.
// Unauthenticated but treated as sensitive per Sessionize docs, so it lives in
// Secret Manager rather than a plain string param. The endpoint MUST be created
// as JSON format with the "All data" view — an embed id returns HTML, not JSON.
// Fetched at: https://sessionize.com/api/v2/<id>/view/All
export const SESSIONIZE_ENDPOINT_ID = defineSecret('SESSIONIZE_ENDPOINT_ID');
