/**
 * Parameters shared by more than one domain. Domain-specific config stays in
 * `<domain>/params.ts`; a domain must never import a param from a sibling domain.
 *
 * The param NAME is what binds to Secret Manager, so moving a definition between
 * files changes nothing about deployment or the stored secret.
 */

import { defineSecret } from 'firebase-functions/params';

/** Slack incoming webhook (https://api.slack.com/apps → Incoming Webhooks).
 * A function that alerts must list it in `secrets`, or `.value()` is empty. */
export const SLACK_WEBHOOK_URL = defineSecret('SLACK_WEBHOOK_URL');
