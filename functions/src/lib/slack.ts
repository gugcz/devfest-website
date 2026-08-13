/**
 * Slack: the transport, plus the one way to send a notification.
 *
 * `postToSlack` is the raw incoming-webhook call — it throws, and callers that
 * care (the ti.to purchase webhook, the status reports) handle that themselves.
 * `notify` is what everything else wants: prefixed by domain, best-effort, and
 * loud in the log when delivery fails, so a lost alert never looks like a
 * delivered one.
 *
 * The domain prefix table lives here rather than in each domain, so the channel
 * reads consistently and a new domain can't invent a fourth style.
 *
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

/** POST a payload to an incoming webhook. Throws on a non-OK response. */
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

/**
 * Best-effort domain notification: `🎤 SESSIONIZE — <text>`.
 *
 * Never throws — a Slack outage must not fail a sync or, worse, the money flow.
 * An unset webhook URL is a no-op (local runs, or a function that forgot to
 * list `SLACK_WEBHOOK_URL` in its `secrets`), which is why a failure is logged
 * rather than swallowed.
 */
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
