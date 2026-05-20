/**
 * `titoWebhook` — receives ti.to webhook deliveries, verifies the HMAC
 * signature, and posts a Slack notification when a registration finishes.
 *
 * Configure ti.to → Customize → Webhook Endpoints with the deployed URL
 * and the same security token stored in `TITO_WEBHOOK_SECRET`. Subscribe
 * to `registration.finished` — that event fires once per completed order
 * and already contains the full list of tickets purchased.
 */

import { logger } from 'firebase-functions/v2';
import { onRequest } from 'firebase-functions/v2/https';

import { SLACK_WEBHOOK_URL, TITO_WEBHOOK_SECRET } from './params.js';
import { postToSlack, type SlackPayload } from './slack-client.js';
import {
	TITO_EVENT_HEADER,
	TITO_SIGNATURE_HEADER,
	fullName,
	verifyTitoSignature,
	type TitoWebhookEvent,
	type TitoWebhookPayload,
} from './tito-webhook.js';

const REGION = 'europe-west1';

const NOTIFY_EVENT: TitoWebhookEvent = 'registration.finished';

function formatPrice(price: string | null | undefined, currency: string | null | undefined): string | null {
	if (!price) return null;
	const numeric = Number(price);
	if (!Number.isFinite(numeric)) return price;
	const code = (currency ?? 'CZK').toUpperCase();
	try {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: code,
			maximumFractionDigits: numeric % 1 === 0 ? 0 : 2,
		}).format(numeric);
	} catch {
		return `${numeric} ${code}`;
	}
}

function summarizeTickets(tickets: TitoWebhookPayload[] | undefined): string | null {
	if (!tickets || tickets.length === 0) return null;
	const counts = new Map<string, number>();
	for (const ticket of tickets) {
		const title = ticket.release_title?.trim() || 'Unknown release';
		counts.set(title, (counts.get(title) ?? 0) + 1);
	}
	const lines: string[] = [];
	for (const [title, count] of counts) {
		lines.push(count > 1 ? `• ${count}× ${title}` : `• ${title}`);
	}
	return lines.join('\n');
}

function buildSlackMessage(payload: TitoWebhookPayload): SlackPayload {
	const ticketCount = payload.tickets_count ?? payload.tickets?.length ?? 1;
	const headline = `🎟️ Registration finished — ${ticketCount} ticket(s)`;

	const fields: { type: 'mrkdwn'; text: string }[] = [];

	const buyer = fullName(payload);
	fields.push({ type: 'mrkdwn', text: `*Name:*\n${buyer}` });

	if (payload.email) fields.push({ type: 'mrkdwn', text: `*Email:*\n${payload.email}` });

	const ticketSummary = summarizeTickets(payload.tickets);
	if (ticketSummary) {
		fields.push({ type: 'mrkdwn', text: `*Tickets:*\n${ticketSummary}` });
	}

	const priceLabel = formatPrice(payload.total ?? payload.price, payload.currency);
	if (priceLabel) fields.push({ type: 'mrkdwn', text: `*Price:*\n${priceLabel}` });

	const reference = payload.registration_reference ?? payload.reference;
	if (reference) fields.push({ type: 'mrkdwn', text: `*Reference:*\n${reference}` });

	const blocks: unknown[] = [
		{
			type: 'header',
			text: { type: 'plain_text', text: headline, emoji: true },
		},
		{
			type: 'section',
			fields,
		},
		{
			type: 'context',
			elements: [
				{
					type: 'mrkdwn',
					text: `tito · \`${NOTIFY_EVENT}\` · ${new Date().toISOString()}`,
				},
			],
		},
	];

	return {
		text: `${headline} — ${buyer}${payload.email ? ` <${payload.email}>` : ''}`,
		blocks,
	};
}

export const titoWebhook = onRequest(
	{
		region: REGION,
		secrets: [TITO_WEBHOOK_SECRET, SLACK_WEBHOOK_URL],
		memory: '256MiB',
		timeoutSeconds: 30,
		// ti.to needs to reach this without an OIDC token.
		invoker: 'public',
		// Body parsing is fine for our use; we read `req.rawBody` for HMAC.
	},
	async (req, res) => {
		if (req.method !== 'POST') {
			res.status(405).send('Method Not Allowed');
			return;
		}

		const signature = (req.header(TITO_SIGNATURE_HEADER) ?? '').trim();
		const eventName = (req.header(TITO_EVENT_HEADER) ?? '').trim() as TitoWebhookEvent;

		if (!signature || !eventName) {
			logger.warn('titoWebhook missing signature or event header', {
				hasSignature: Boolean(signature),
				hasEvent: Boolean(eventName),
			});
			res.status(400).send('Missing required headers');
			return;
		}

		const rawBody: Buffer | undefined = (req as unknown as { rawBody?: Buffer }).rawBody;
		if (!rawBody) {
			logger.error('titoWebhook missing rawBody — cannot verify signature');
			res.status(400).send('Missing body');
			return;
		}

		if (!verifyTitoSignature(TITO_WEBHOOK_SECRET.value(), rawBody, signature)) {
			logger.warn('titoWebhook signature mismatch', { event: eventName });
			res.status(401).send('Invalid signature');
			return;
		}

		// Only post to Slack for registration.finished; ack everything else
		// with 200 so ti.to doesn't keep retrying.
		if (eventName !== NOTIFY_EVENT) {
			logger.debug('titoWebhook ignored event', { event: eventName });
			res.status(200).send('ignored');
			return;
		}

		let payload: TitoWebhookPayload;
		try {
			payload = (req.body ?? JSON.parse(rawBody.toString('utf8'))) as TitoWebhookPayload;
		} catch (err) {
			logger.error('titoWebhook failed to parse body', err);
			res.status(400).send('Bad JSON');
			return;
		}

		try {
			const message = buildSlackMessage(payload);
			await postToSlack(SLACK_WEBHOOK_URL.value(), message);
			logger.info('titoWebhook posted to Slack', {
				event: eventName,
				reference: payload.registration_reference ?? payload.reference ?? null,
			});
			res.status(200).send('ok');
		} catch (err) {
			logger.error('titoWebhook failed to notify Slack', err);
			// 500 lets ti.to retry the delivery.
			res.status(500).send('Slack post failed');
		}
	},
);
