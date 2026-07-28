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

import { logger } from 'firebase-functions/v2';
import { onRequest } from 'firebase-functions/v2/https';

import { db } from '../lib/admin.js';

const REGION = 'europe-west1';
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

let memo: { at: number; payload: TicketsCache } | null = null;

async function loadTickets(): Promise<TicketsCache> {
	const now = Date.now();
	if (memo && now - memo.at < MEMO_TTL_MS) return memo.payload;
	const snap = await db().ref(TICKETS_PATH).once('value');
	const payload = (snap.val() as TicketsCache | null) ?? EMPTY;
	memo = { at: now, payload };
	return payload;
}

export const ticketsApi = onRequest(
	{
		region: REGION,
		invoker: 'public',
		memory: '256MiB',
		timeoutSeconds: 30,
		// Keep one instance warm — same reasoning as `lineupApi`, and it matters more
		// here: the 5min `s-maxage` means the CDN revalidates far more often, so
		// without a warm instance a visitor regularly eats the cold start while the
		// ticket roadmap (and the `/invoice` price estimate) sits empty.
		minInstances: 1,
	},
	async (req, res) => {
		try {
			const payload = await loadTickets();
			res.set('Cache-Control', CACHE_CONTROL);
			res.json(payload);
		} catch (err) {
			logger.error('ticketsApi read failed', err);
			res.set('Cache-Control', 'no-store');
			res.status(503).json(EMPTY);
		}
	},
);
