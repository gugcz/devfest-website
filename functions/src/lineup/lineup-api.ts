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

import { onRequest } from 'firebase-functions/v2/https';

import { firestore } from '../lib/admin.js';
import { cachedJsonEndpoint } from '../lib/cached-endpoint.js';
import { CACHED_ENDPOINT } from '../options.js';

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

async function readCollection(name: string): Promise<LineupDoc[]> {
	const snap = await firestore().collection(name).orderBy('order').get();
	return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function loadLineup(): Promise<LineupPayload> {
	const [speakers, sessions] = await Promise.all([
		readCollection('speakers'),
		readCollection('sessions'),
	]);
	return { speakers, sessions };
}

export const lineupApi = onRequest(
	CACHED_ENDPOINT,
	cachedJsonEndpoint<LineupPayload>({
		name: 'lineupApi',
		cacheControl: CACHE_CONTROL,
		memoTtlMs: MEMO_TTL_MS,
		fallback: { speakers: [], sessions: [] },
		load: loadLineup,
	}),
);
