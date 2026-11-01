/**
 * Slack transport. `postToSlack` is the raw webhook call (throws);
 * `notify` is best-effort, domain-prefixed, and logs a failed delivery.
 * Docs: https://api.slack.com/messaging/webhooks
 */

import { logger } from 'firebase-functions/v2';

import { describeError } from './errors.js';
import { errorBody, fetchWithRetry } from './http.js';

export interface SlackTextPayload {
	text: string;
}

export interface SlackBlocksPayload {
	text?: string; // fallback for notifications + screen readers
	blocks: unknown[];
}

export type SlackPayload = SlackTextPayload | SlackBlocksPayload;

/** Domains that post to the channel, and the prefix each one posts under. */
export type SlackDomain = 'sessionize' | 'tickets' | 'invoices';

const DOMAIN_PREFIX: Record<SlackDomain, string> = {
	sessionize: '🎤 SESSIONIZE',
	tickets: '🎟️ TICKETS',
	invoices: '🧾 INVOICES',
};

/** Kill switch for every Slack post (reports, purchase lines, alerts). While
 * `false`, `postToSlack` logs the message at `warn` instead (it may carry a
 * code to relay by hand, like `notify`'s skip log); `true` restores Slack. */
const SLACK_ENABLED = false;

/** Escape user/upstream text before mrkdwn — `<!channel>` in a company name
 * is a mass ping. https://api.slack.com/reference/surfaces/formatting#escaping */
export function escapeMrkdwn(text: string): string {
	return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** POST a payload to an incoming webhook. Throws on a non-OK response. */
export async function postToSlack(webhookUrl: string, payload: SlackPayload): Promise<void> {
	if (!SLACK_ENABLED) {
		logger.warn('Slack disabled — message logged, not posted', { text: payload.text });
		return;
	}
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

/** Best-effort domain notification: `🎤 SESSIONIZE — <text>`. Never throws;
 * an unset URL is a no-op (logged, since it may be a missing `secrets` entry). */
export async function notify(domain: SlackDomain, webhookUrl: string, text: string): Promise<void> {
	if (!webhookUrl) {
		logger.warn(`${domain} Slack notify skipped — no webhook URL configured`, { text });
		return;
	}
	try {
		await postToSlack(webhookUrl, { text: `${DOMAIN_PREFIX[domain]} — ${text}` });
	} catch (err) {
		logger.warn(`${domain} Slack notify failed: ${describeError(err)}`, err);
	}
}
