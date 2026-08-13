/**
 * `ticketsApi` — public HTTP endpoint that serves the cached ti.to release
 * roadmap as JSON for the website to `fetch()`.
 *
 * Same pattern as `lineupApi`: the browser used to read RTDB `/tickets` with the
 * Firebase SDK (which pulls in App Check); it now hits this plain HTTP endpoint
 * instead, so no Firebase SDK / App Check on the content path. `refreshTicketsScheduled`
 * writes `/tickets` hourly via the Admin SDK; this only reads it.
 *
 * Caching: served behind the Hosting rewrite `/api/tickets` with a short
 * `s-maxage` (tickets sell out mid-sale, so a tighter TTL than the daily lineup),
 * plus an in-instance memo to coalesce revalidation reads. The underlying RTDB
 * cache itself only changes hourly, so the edge TTL adds little real staleness.
 */

import { onRequest } from 'firebase-functions/v2/https';

import { db } from '../lib/admin.js';
import { cachedJsonEndpoint } from '../lib/cached-endpoint.js';
import { CACHED_ENDPOINT } from '../options.js';

// The RTDB path `refreshTicketsScheduled` writes (see refresh-cache.ts).
const TICKETS_PATH = 'tickets';

// Shorter than the lineup: a sold-out wave should surface within minutes.
const CACHE_CONTROL = 'public, max-age=0, s-maxage=300, stale-while-revalidate=3600';
const MEMO_TTL_MS = 60 * 1000;

interface TicketsCache {
	accountSlug: string;
	eventSlug: string;
	releases: unknown[];
}

const EMPTY: TicketsCache = { accountSlug: '', eventSlug: '', releases: [] };

async function loadTickets(): Promise<TicketsCache> {
	const snap = await db().ref(TICKETS_PATH).once('value');
	return (snap.val() as TicketsCache | null) ?? EMPTY;
}

export const ticketsApi = onRequest(
	CACHED_ENDPOINT,
	cachedJsonEndpoint<TicketsCache>({
		name: 'ticketsApi',
		cacheControl: CACHE_CONTROL,
		memoTtlMs: MEMO_TTL_MS,
		fallback: EMPTY,
		load: loadTickets,
	}),
);
