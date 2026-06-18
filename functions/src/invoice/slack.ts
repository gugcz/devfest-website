/**
 * Best-effort Slack notifications for the invoice flow.
 *
 * Reuses the tickets-domain incoming-webhook client. These posts are
 * informational only — a Slack failure must never break the money flow,
 * so `notify` swallows errors after logging them.
 */

import { logger } from 'firebase-functions/v2';

import { postToSlack } from '../tickets/slack-client.js';

const PREFIX = '🧾 FAKTURY';

export async function notify(webhookUrl: string, text: string): Promise<void> {
	if (!webhookUrl) return;
	try {
		await postToSlack(webhookUrl, { text: `${PREFIX} — ${text}` });
	} catch (err) {
		logger.warn('invoice Slack notify failed', err);
	}
}
