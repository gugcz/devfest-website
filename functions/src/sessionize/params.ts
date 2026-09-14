/** Sessionize domain params (`firebase functions:secrets:set <NAME>`).
 * `SLACK_WEBHOOK_URL` lives in `lib/params.ts`, not here. */

import { defineSecret } from 'firebase-functions/params';

// Sessionize JSON API endpoint id (treated as sensitive per Sessionize docs).
// Must expose the "All data" / "Speakers" view — an embed id returns HTML.
// Bare id or full URL; `parseEndpointId` handles both.
export const SESSIONIZE_ENDPOINT_ID = defineSecret('SESSIONIZE_ENDPOINT_ID');
