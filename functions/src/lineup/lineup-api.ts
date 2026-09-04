/**
 * `lineupApi` — public HTTP endpoint serving the speaker + session lineup as JSON.
 *
 * The browser must NOT read Firestore with the client SDK: that blocks the first
 * read on an App Check (reCAPTCHA Enterprise) token, which cost ~30s on mobile.
 * Reading here via the Admin SDK (which bypasses App Check + rules) removes the
 * wait, and keeps enforcing App Check on Firestore later an option.
 *
 * Two caching layers keep reads and invocations low: a `s-maxage` `Cache-Control`
 * so Hosting's CDN answers most requests from the edge, plus a short in-instance
 * memo so a warm instance coalesces the revalidation burst.
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
