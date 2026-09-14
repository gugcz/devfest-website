/**
 * `lineupApi` — public endpoint serving `{ speakers, sessions }` as raw docs
 * (`{ id, ...doc }`), read via Admin SDK so the browser never waits on an App
 * Check token. See `cached-endpoint.ts` for the caching.
 */

import { onRequest } from 'firebase-functions/v2/https';

import { firestore } from '../lib/admin.js';
import { cachedJsonEndpoint } from '../lib/cached-endpoint.js';
import { CACHED_ENDPOINT } from '../options.js';

// Edge cache: 15 min fresh (a forced sync should surface in minutes), then a
// SHORT stale window — a day-long one once served a stale compressed variant
// (Hosting `Vary`s on `accept-encoding`) with no fix but a redeploy.
// `max-age=0` keeps browsers revalidating.
const CACHE_CONTROL = 'public, max-age=0, s-maxage=900, stale-while-revalidate=300';

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
