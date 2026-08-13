/**
 * `lineupApi` — public HTTP endpoint that serves the speaker + session lineup as
 * JSON for the website to `fetch()`.
 *
 * Why this exists: the browser used to read the `speakers` / `sessions` Firestore
 * collections with the client SDK, which blocks the first read on an App Check
 * (reCAPTCHA Enterprise) token — slow on mobile (~30s observed). Reading here via
 * the Admin SDK (which bypasses App Check + rules) and having the browser hit a
 * plain HTTP endpoint instead removes that token wait entirely, and stays
 * compatible with enforcing App Check on Firestore later.
 *
 * Two layers of caching keep Firestore reads and function invocations low:
 *  - **CDN**: served behind the Hosting rewrite `/api/lineup` with a `s-maxage`
 *    `Cache-Control`, so most requests are answered from the edge and the
 *    function runs only on a cache miss / revalidation.
 *  - **In-instance memo**: a warm instance coalesces the burst of revalidation
 *    reads it sees so they don't each hit Firestore. Short TTL — the CDN is the
 *    real cache; the memo only smooths bursts.
 *
 * The wire shape is `{ speakers: [{ id, ...doc }], sessions: [{ id, ...doc }] }`
 * — raw docs, so the browser reuses its existing `speakerFromDoc` /
 * `sessionFromDoc` parsers (src/lib/) and no parsing logic is duplicated here.
 */

import { logger } from 'firebase-functions/v2';
import { onRequest } from 'firebase-functions/v2/https';

import { firestore } from '../lib/admin.js';
import { describeError } from '../lib/errors.js';

const REGION = 'europe-west1';

// Edge cache (shared): 1h fresh, then served stale for a day while revalidating —
// matches the daily cadence of `refreshSessionizeScheduled`. `max-age=0` keeps browsers
// revalidating so a redeploy/purge shows promptly.
const CACHE_CONTROL = 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400';

// In-instance memo TTL. Deliberately short: the CDN `s-maxage` above is the real
// cache, this only stops a warm instance re-reading Firestore for every
// concurrent revalidation.
const MEMO_TTL_MS = 5 * 60 * 1000;

interface LineupDoc {
	id: string;
	[field: string]: unknown;
}

interface LineupPayload {
	speakers: LineupDoc[];
	sessions: LineupDoc[];
}

let memo: { at: number; payload: LineupPayload } | null = null;

async function readCollection(name: string): Promise<LineupDoc[]> {
	const snap = await firestore().collection(name).orderBy('order').get();
	return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function loadLineup(): Promise<LineupPayload> {
	const now = Date.now();
	if (memo && now - memo.at < MEMO_TTL_MS) return memo.payload;
	const [speakers, sessions] = await Promise.all([
		readCollection('speakers'),
		readCollection('sessions'),
	]);
	const payload: LineupPayload = { speakers, sessions };
	memo = { at: now, payload };
	return payload;
}

export const lineupApi = onRequest(
	{
		region: REGION,
		invoker: 'public',
		memory: '256MiB',
		timeoutSeconds: 30,
		// Keep one instance warm. A cold start here is a container boot + Node/Admin
		// SDK init on the critical path of the first uncached lineup fetch — seconds
		// of blank speaker/session grid for whoever trips the CDN revalidation. The
		// long `s-maxage` means traffic is bursty and sparse, which is exactly the
		// shape that would otherwise cold-start almost every time. The warm instance
		// also preserves the in-instance memo below between bursts.
		minInstances: 1,
	},
	async (req, res) => {
		try {
			const payload = await loadLineup();
			res.set('Cache-Control', CACHE_CONTROL);
			res.json(payload);
		} catch (err) {
			logger.error(`lineupApi read failed: ${describeError(err)}`, err);
			// Never cache an error — the browser falls back to its "unavailable" state
			// and a retry can hit a healthy instance.
			res.set('Cache-Control', 'no-store');
			res.status(503).json({ speakers: [], sessions: [] });
		}
	},
);
