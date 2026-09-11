/**
 * Scheduled trigger that refreshes the RTDB tickets cache from the ti.to
 * Admin API. The website reads `/tickets` directly so visitor traffic never
 * hits ti.to.
 */

import { logger } from 'firebase-functions/v2';
import { onSchedule } from 'firebase-functions/v2/scheduler';

import { db } from '../lib/admin.js';
import { stageError } from '../lib/errors.js';
import { SLACK_WEBHOOK_URL } from '../lib/params.js';
import { runBackground } from '../lib/run.js';
import { SCHEDULED } from '../options.js';
import { requireTitoConfig, TITO_API_TOKEN } from './params.js';
import { fetchAllReleases, isWebsiteVisible, projectRelease } from './tito-api.js';

const TICKETS_PATH = 'tickets';

async function syncTickets(): Promise<void> {
	const cfg = requireTitoConfig();

	logger.info(`Fetching ti.to releases for ${cfg.accountSlug}/${cfg.eventSlug}`);
	const raw = await fetchAllReleases(cfg);
	const visible = raw.filter(isWebsiteVisible);
	const releases = visible.map(projectRelease);

	const payload = {
		accountSlug: cfg.accountSlug,
		eventSlug: cfg.eventSlug,
		fetchedAt: Date.now(),
		releases,
	};

	// Label the write: a raw RTDB error is otherwise indistinguishable from a
	// ti.to one in the log, and only one of those is ours to fix.
	try {
		await db().ref(TICKETS_PATH).set(payload);
	} catch (err) {
		throw stageError(`RTDB write to /${TICKETS_PATH}`, err);
	}
	logger.info(
		`Wrote /${TICKETS_PATH} (visible=${releases.length}, dropped=${raw.length - releases.length}, fetchedAt=${payload.fetchedAt})`,
	);
}

/**
 * Hourly scheduled refresh. ti.to advertises a 60 req/min rate limit per
 * token; one request per hour is well under that.
 */
export const refreshTicketsScheduled = onSchedule(
	{
		...SCHEDULED,
		schedule: 'every 1 hours',
		secrets: [TITO_API_TOKEN, SLACK_WEBHOOK_URL],
	},
	() =>
		runBackground(
			{
				name: 'refreshTicketsScheduled',
				domain: 'tickets',
				// The site keeps serving the previous cache, so a failed run degrades
				// to stale prices rather than an empty ticket roadmap.
				failureNote: '`/tickets` cache left at its previous contents, retry within the hour',
			},
			syncTickets,
		),
);
