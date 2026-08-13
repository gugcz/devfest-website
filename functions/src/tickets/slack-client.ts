/**
 * Minimal Slack incoming-webhook client.
 *
 * Slack expects a JSON body. The simplest payload is `{ text }`; richer
 * messages use Block Kit `blocks`.
 *
 * Docs: https://api.slack.com/messaging/webhooks
 */

import { errorBody, fetchWithRetry } from '../lib/http.js';

export interface SlackTextPayload {
	text: string;
}

export interface SlackBlocksPayload {
	text?: string; // fallback for notifications + screen readers
	blocks: unknown[];
}

export type SlackPayload = SlackTextPayload | SlackBlocksPayload;

export async function postToSlack(webhookUrl: string, payload: SlackPayload): Promise<void> {
	// `retryUnsafe` on a POST is deliberate here and nowhere else: the worst case
	// is a duplicate line in the channel, while a dropped one is an alert (or a
	// purchase notification) nobody ever sees.
	const res = await fetchWithRetry(
		webhookUrl,
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		},
		{ label: 'Slack webhook', retryUnsafe: true },
	);

	if (!res.ok) {
		throw new Error(`Slack webhook ${res.status} ${res.statusText}: ${await errorBody(res)}`);
	}
}
