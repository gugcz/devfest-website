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

// Sessionize JSON API endpoint id for the DevFest.cz event (e.g. `h826z24u`).
// Unauthenticated but treated as sensitive per Sessionize docs, so it lives in
// Secret Manager rather than a plain string param. Must be a JSON API endpoint
// exposing the "All data" and/or "Speakers" view — an embed id returns HTML.
// The value may be the bare id OR a full URL (`https://sessionize.com/api/v2/
// <id>` / `.../<id>/view/All`); `parseEndpointId` extracts the id either way.
export const SESSIONIZE_ENDPOINT_ID = defineSecret('SESSIONIZE_ENDPOINT_ID');
