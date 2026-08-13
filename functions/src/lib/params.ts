/**
 * Parameters shared by more than one domain.
 *
 * Domain-specific config stays in `<domain>/params.ts` — this file holds only
 * what several domains genuinely share, so nobody has to import a secret from
 * a sibling domain to use it. (Every domain alerts to the same Slack channel;
 * `SLACK_WEBHOOK_URL` used to live in `tickets/params.ts`, which made the
 * sessionize and invoice domains depend on the tickets domain for it.)
 *
 * The param NAME is what binds to Secret Manager, so moving a definition
 * between files changes nothing about deployment or the stored secret.
 */

import { defineSecret } from 'firebase-functions/params';

/**
 * Slack incoming webhook — every domain's alerts and reports go here.
 * Create one at https://api.slack.com/apps → Incoming Webhooks.
 *
 * Any function that alerts must list it in its `secrets: []`, otherwise
 * `.value()` is empty at runtime and the notification silently no-ops.
 */
export const SLACK_WEBHOOK_URL = defineSecret('SLACK_WEBHOOK_URL');
