/**
 * Configuration parameters for the tickets domain.
 *
 * Secrets are stored in Secret Manager and configured with
 *   firebase functions:secrets:set <NAME>
 *
 * Non-secret strings can be set per-environment via
 *   functions/.env
 * or with `--set-env-vars` on `firebase deploy`.
 */

import { defineSecret, defineString } from 'firebase-functions/params';

// ti.to Admin API token — used by `refreshTitoCache` to read releases.
export const TITO_API_TOKEN = defineSecret('TITO_API_TOKEN');

// ti.to event slugs — non-sensitive.
export const TITO_ACCOUNT_SLUG = defineString('TITO_ACCOUNT_SLUG', { default: '' });
export const TITO_EVENT_SLUG = defineString('TITO_EVENT_SLUG', { default: '' });

// ti.to webhook security token — used by `titoWebhook` to verify the
// `Tito-Signature` header. Found in the ti.to admin under
// Customize → Webhook Endpoints.
export const TITO_WEBHOOK_SECRET = defineSecret('TITO_WEBHOOK_SECRET');

// Slack incoming webhook URL — used by `titoWebhook` to post purchase
// notifications. Create one at https://api.slack.com/apps → Incoming Webhooks.
export const SLACK_WEBHOOK_URL = defineSecret('SLACK_WEBHOOK_URL');
