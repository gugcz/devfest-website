/**
 * Minimal Slack incoming-webhook client.
 *
 * Slack expects a JSON body. The simplest payload is `{ text }`; richer
 * messages use Block Kit `blocks`.
 *
 * Docs: https://api.slack.com/messaging/webhooks
 */

export interface SlackTextPayload {
	text: string;
}

export interface SlackBlocksPayload {
	text?: string; // fallback for notifications + screen readers
	blocks: unknown[];
}

export type SlackPayload = SlackTextPayload | SlackBlocksPayload;

export async function postToSlack(webhookUrl: string, payload: SlackPayload): Promise<void> {
	const res = await fetch(webhookUrl, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	});

	if (!res.ok) {
		const body = await res.text().catch(() => '');
		throw new Error(`Slack webhook ${res.status} ${res.statusText}: ${body.slice(0, 300)}`);
	}
}
