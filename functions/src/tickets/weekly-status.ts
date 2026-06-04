/**
 * Ticket status reports — twice a week, fetch releases directly from the ti.to
 * Admin API and post a sales summary to Slack. The cron runs only twice a week
 * so the extra ti.to requests are negligible (2/week, well under the 60/min
 * limit), and reading live data avoids any staleness from the hourly cache.
 *
 * Two scheduled functions share one handler (`runTicketStatus`): App Engine
 * cron can't express two different times-of-day in a single expression, so
 * Monday 09:00 and Thursday 18:00 are separate `onSchedule` exports.
 */

import { logger } from 'firebase-functions/v2';
import { onSchedule } from 'firebase-functions/v2/scheduler';

import {
	SLACK_WEBHOOK_URL,
	TITO_ACCOUNT_SLUG,
	TITO_API_TOKEN,
	TITO_EVENT_SLUG,
} from './params.js';
import { postToSlack, type SlackPayload } from './slack-client.js';
import {
	deriveSaleStatus,
	fetchAllReleases,
	releaseTitle,
	type DerivedSaleStatus,
	type TitoRelease,
} from './tito-api.js';

const REGION = 'europe-west1';

interface ReleaseSummary {
	title: string;
	sold: number;
	quantity: number | null;
	soldOut: boolean;
	saleStatus: DerivedSaleStatus;
}

interface Summary {
	totalSold: number;
	totalQuantity: number | null;
	releases: ReleaseSummary[];
	fetchedAt: number;
}

function summarize(releases: TitoRelease[]): Summary {
	const summaries = releases.map<ReleaseSummary>((r) => ({
		title: releaseTitle(r),
		sold: r.quantity_sold ?? r.tickets_count ?? 0,
		quantity: r.quantity ?? null,
		soldOut: Boolean(r.sold_out),
		saleStatus: deriveSaleStatus(r),
	}));

	const totalSold = summaries.reduce((acc, r) => acc + r.sold, 0);
	const totalQuantityKnown = summaries.every((r) => r.quantity !== null);
	const totalQuantity = totalQuantityKnown
		? summaries.reduce((acc, r) => acc + (r.quantity ?? 0), 0)
		: null;

	return {
		totalSold,
		totalQuantity,
		releases: summaries,
		fetchedAt: Date.now(),
	};
}

const STATUS_LABEL: Record<DerivedSaleStatus, string> = {
	on_sale: 'on sale',
	sold_out: 'sold out',
	paused: 'paused',
	not_yet_on_sale: 'not yet on sale',
	ended: 'sales ended',
	archived: 'archived',
};

function buildSlackMessage(summary: Summary): SlackPayload {
	const totalLabel = summary.totalQuantity == null
		? `${summary.totalSold}`
		: `${summary.totalSold} / ${summary.totalQuantity}`;

	const releaseLines = summary.releases.length === 0
		? ['_No releases returned by ti.to._']
		: summary.releases.map((r) => {
			const cap = r.quantity == null ? '?' : String(r.quantity);
			// `sold_out` gets a bold flag; everything else gets an italic
			// status suffix so the reader can see *why* it's not buyable.
			if (r.soldOut) {
				return `• *${r.title}* — ${r.sold} / ${cap} • *sold out*`;
			}
			if (r.saleStatus === 'on_sale') {
				return `• *${r.title}* — ${r.sold} / ${cap} • _on sale_`;
			}
			return `• *${r.title}* — ${r.sold} / ${cap} • _${STATUS_LABEL[r.saleStatus]}_`;
		});

	const blocks: unknown[] = [
		{
			type: 'header',
			text: { type: 'plain_text', text: '📊 Ticket status', emoji: true },
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
					text: `Fetched live from ti.to · ${new Date(summary.fetchedAt).toISOString()}`,
				},
			],
		},
	];

	return {
		text: `Ticket status — total sold ${totalLabel}`,
		blocks,
	};
}

/** Shared cron options for both status-report schedules. */
const SCHEDULE_OPTS = {
	timeZone: 'Europe/Prague',
	region: REGION,
	secrets: [SLACK_WEBHOOK_URL, TITO_API_TOKEN],
	timeoutSeconds: 120,
	memory: '256MiB' as const,
	retryCount: 1,
};

/** Fetch live releases from ti.to and post a sales summary to Slack. */
async function runTicketStatus(): Promise<void> {
	const token = TITO_API_TOKEN.value();
	const accountSlug = TITO_ACCOUNT_SLUG.value();
	const eventSlug = TITO_EVENT_SLUG.value();

	if (!token || !accountSlug || !eventSlug) {
		throw new Error(
			'Missing config: TITO_API_TOKEN secret and TITO_ACCOUNT_SLUG / TITO_EVENT_SLUG params must be set.',
		);
	}

	const releases = await fetchAllReleases({ token, accountSlug, eventSlug });
	const summary = summarize(releases);
	await postToSlack(SLACK_WEBHOOK_URL.value(), buildSlackMessage(summary));

	logger.info('ticket status posted', {
		totalSold: summary.totalSold,
		releaseCount: summary.releases.length,
	});
}

/** Monday at 09:00 Europe/Prague. Fetches live data from ti.to (no RTDB). */
export const weeklyTicketStatus = onSchedule(
	{ ...SCHEDULE_OPTS, schedule: 'every monday 09:00' },
	runTicketStatus,
);

/** Thursday at 18:00 Europe/Prague. Fetches live data from ti.to (no RTDB). */
export const thursdayTicketStatus = onSchedule(
	{ ...SCHEDULE_OPTS, schedule: 'every thursday 18:00' },
	runTicketStatus,
);
