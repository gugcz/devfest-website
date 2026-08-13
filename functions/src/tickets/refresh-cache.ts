/**
 * Scheduled trigger that refreshes the RTDB tickets cache from the ti.to
 * Admin API. The website reads `/tickets` directly so visitor traffic never
 * hits ti.to.
 */

import { logger } from 'firebase-functions/v2';
import { onSchedule } from 'firebase-functions/v2/scheduler';

import { db } from '../lib/admin.js';
import { stageError } from '../lib/errors.js';
import { TITO_ACCOUNT_SLUG, TITO_API_TOKEN, TITO_EVENT_SLUG } from './params.js';
import { fetchAllReleases, isWebsiteVisible, projectRelease } from './tito-api.js';

const REGION = 'europe-west1';
const TICKETS_PATH = 'tickets';

interface SyncResult {
	count: number;
	fetchedAt: number;
}

async function syncTickets(): Promise<SyncResult> {
	const token = TITO_API_TOKEN.value();
	const accountSlug = TITO_ACCOUNT_SLUG.value();
	const eventSlug = TITO_EVENT_SLUG.value();

	if (!token || !accountSlug || !eventSlug) {
		throw new Error(
			'Missing config: ensure TITO_API_TOKEN secret and TITO_ACCOUNT_SLUG / TITO_EVENT_SLUG params are set.',
		);
	}

	logger.info(`Fetching ti.to releases for ${accountSlug}/${eventSlug}`);
	const raw = await fetchAllReleases({ token, accountSlug, eventSlug });
	const visible = raw.filter(isWebsiteVisible);
	const releases = visible.map(projectRelease);

	const payload = {
		accountSlug,
		eventSlug,
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

	return { count: releases.length, fetchedAt: payload.fetchedAt };
}

/**
 * Hourly scheduled refresh. ti.to advertises a 60 req/min rate limit per
 * token; one request per hour is well under that.
 */
export const refreshTicketsScheduled = onSchedule(
	{
		schedule: 'every 1 hours',
		timeZone: 'Europe/Prague',
		region: REGION,
		secrets: [TITO_API_TOKEN],
		timeoutSeconds: 120,
		memory: '256MiB',
		retryCount: 1,
	},
	async () => {
		await syncTickets();
	},
);
