/**
 * Best-effort Slack notifications for the invoice flow.
 *
 * Reuses the tickets-domain incoming-webhook client. These posts are
 * informational only — a Slack failure must never break the money flow,
 * so `notify` swallows errors after logging them.
 */

import { logger } from 'firebase-functions/v2';

import { describeError } from '../lib/errors.js';
import { postToSlack } from '../tickets/slack-client.js';

const PREFIX = '🧾 INVOICES';

export async function notify(webhookUrl: string, text: string): Promise<void> {
	if (!webhookUrl) return;
	try {
		await postToSlack(webhookUrl, { text: `${PREFIX} — ${text}` });
	} catch (err) {
		// Swallowed on purpose — but named, so a lost alert doesn't look like a
		// delivered one when someone asks why nobody was told.
		logger.warn(`invoice Slack notify failed: ${describeError(err)}`, err);
	}
}
