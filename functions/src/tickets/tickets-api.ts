/**
 * `ticketsApi` — public HTTP endpoint serving the cached ti.to release roadmap as
 * JSON. Same pattern as `lineupApi`: the browser hits this instead of RTDB, so no
 * Firebase SDK and no App Check sit on the content path.
 * `refreshTicketsScheduled` writes `/tickets` hourly; this only reads it.
 *
 * A tighter edge TTL than the lineup (tickets sell out mid-sale), plus the
 * in-instance memo to coalesce revalidation reads.
 *
 * The one function in this codebase that does NOT scale to zero: `minInstances:
 * 1` keeps a warm container so a CDN revalidation never pays a cold start. It
 * revalidates far more often than the lineup (300s TTL vs 900s), and every
 * revalidating request is a real visitor waiting on the ticket roadmap.
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
	// Deliberate override of the preset's scale-to-zero — see the file comment.
	{ ...CACHED_ENDPOINT, minInstances: 1 },
	cachedJsonEndpoint<TicketsCache>({
		name: 'ticketsApi',
		cacheControl: CACHE_CONTROL,
		memoTtlMs: MEMO_TTL_MS,
		fallback: EMPTY,
		load: loadTickets,
	}),
);
