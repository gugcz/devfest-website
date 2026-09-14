/**
 * `ticketsApi` — public endpoint serving the RTDB `/tickets` cache. Tighter
 * TTL than the lineup (sell-outs surface faster). The one function that
 * does NOT scale to zero: it revalidates often and the cold-start request is
 * a real visitor waiting on the roadmap.
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
