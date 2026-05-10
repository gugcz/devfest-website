/**
 * `dailyTicketStatus` — once a day, read the cached releases from RTDB and
 * post a sales summary to Slack. Reads `/tickets` (populated by
 * `refreshTitoCache`) so this function never hits ti.to itself.
 */

import { logger } from 'firebase-functions/v2';
import { onSchedule } from 'firebase-functions/v2/scheduler';

import { db } from '../lib/admin.js';
import { SLACK_WEBHOOK_URL } from './params.js';
import { postToSlack, type SlackPayload } from './slack-client.js';

const REGION = 'europe-west1';
const TICKETS_PATH = 'tickets';

interface CachedRelease {
	id: number;
	slug: string;
	title: string;
	price: string | null;
	currency: string | null;
	quantity: number | null;
	quantity_sold: number;
	sale_status: string;
	state: string;
	sold_out: boolean;
}

interface TicketsCache {
	accountSlug: string;
	eventSlug: string;
	fetchedAt: number;
	releases: CachedRelease[];
}

interface ReleaseSummary {
	title: string;
	sold: number;
	quantity: number | null;
	soldOut: boolean;
	saleStatus: string;
	state: string;
}

interface Summary {
	totalSold: number;
	totalQuantity: number | null;
	releases: ReleaseSummary[];
	fetchedAt: number;
}

function summarize(cache: TicketsCache): Summary {
	const releases = (cache.releases ?? []).map<ReleaseSummary>((r) => ({
		title: r.title,
		sold: typeof r.quantity_sold === 'number' ? r.quantity_sold : 0,
		quantity: typeof r.quantity === 'number' ? r.quantity : null,
		soldOut: Boolean(r.sold_out) || r.sale_status === 'sold_out',
		saleStatus: r.sale_status ?? 'unknown',
		state: r.state ?? 'unknown',
	}));

	const totalSold = releases.reduce((acc, r) => acc + r.sold, 0);
	const totalQuantityKnown = releases.every((r) => typeof r.quantity === 'number');
	const totalQuantity = totalQuantityKnown
		? releases.reduce((acc, r) => acc + (r.quantity ?? 0), 0)
		: null;

	return {
		totalSold,
		totalQuantity,
		releases,
		fetchedAt: typeof cache.fetchedAt === 'number' ? cache.fetchedAt : Date.now(),
	};
}

function buildSlackMessage(summary: Summary): SlackPayload {
	const totalLabel = summary.totalQuantity == null
		? `${summary.totalSold}`
		: `${summary.totalSold} / ${summary.totalQuantity}`;

	const releaseLines = summary.releases.length === 0
		? ['_No releases cached yet — `refreshTitoCache` may not have run._']
		: summary.releases.map((r) => {
			const cap = r.quantity == null ? '?' : String(r.quantity);
			const flag = r.soldOut ? ' • *sold out*' : '';
			const status = r.saleStatus !== 'on_sale' && !r.soldOut ? ` • _${r.saleStatus}_` : '';
			return `• *${r.title}* — ${r.sold} / ${cap}${flag}${status}`;
		});

	const blocks: unknown[] = [
		{
			type: 'header',
			text: { type: 'plain_text', text: '📊 Daily ticket status', emoji: true },
		},
		{
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: `*Total sold:* ${totalLabel}`,
			},
		},
		{
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: releaseLines.join('\n'),
			},
		},
		{
			type: 'context',
			elements: [
				{
					type: 'mrkdwn',
					text: `Cache fetched: ${new Date(summary.fetchedAt).toISOString()}`,
				},
			],
		},
	];

	return {
		text: `Daily ticket status — total sold ${totalLabel}`,
		blocks,
	};
}

/**
 * Daily at 09:00 Europe/Prague. Reads the RTDB cache (no ti.to call).
 */
export const dailyTicketStatus = onSchedule(
	{
		schedule: 'every day 09:00',
		timeZone: 'Europe/Prague',
		region: REGION,
		secrets: [SLACK_WEBHOOK_URL],
		timeoutSeconds: 60,
		memory: '256MiB',
		retryCount: 1,
	},
	async () => {
		const snapshot = await db().ref(TICKETS_PATH).get();
		const cache = snapshot.val() as TicketsCache | null;

		if (!cache) {
			logger.warn('dailyTicketStatus skipped — RTDB /tickets is empty');
			await postToSlack(SLACK_WEBHOOK_URL.value(), {
				text: '⚠️ Daily ticket status — RTDB /tickets is empty. Has `refreshTitoCache` run yet?',
			});
			return;
		}

		const summary = summarize(cache);
		await postToSlack(SLACK_WEBHOOK_URL.value(), buildSlackMessage(summary));
		logger.info('dailyTicketStatus posted', {
			totalSold: summary.totalSold,
			releaseCount: summary.releases.length,
		});
	},
);
