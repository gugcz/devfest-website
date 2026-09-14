/**
 * `lineupApi` — public HTTP endpoint serving the speaker + session lineup.
 *
 * The browser must NOT read Firestore with the client SDK (blocks on an App
 * Check token, ~30s on mobile). Admin SDK here removes the wait. Two cache
 * layers: `s-maxage` for the Hosting CDN, plus an in-instance memo to
 * coalesce the revalidation burst.
 *
 * Wire shape: `{ speakers: [{ id, ...doc }], sessions: [{ id, ...doc }] }` —
 * raw docs, parsed by the browser's `speakerFromDoc` / `sessionFromDoc`.
 */

import { onRequest } from 'firebase-functions/v2/https';

import { firestore } from '../lib/admin.js';
import { cachedJsonEndpoint } from '../lib/cached-endpoint.js';
import { CACHED_ENDPOINT } from '../options.js';

// Edge cache: 15 min fresh, then a SHORT stale window while revalidating.
//
// The stale window used to be a day. Hosting `Vary`s on `accept-encoding`, so
// the compressed variant is its own cache entry, and that entry kept serving
// stale: `/agenda` showed no times while the origin had the full timetable,
// with nothing in the logs and no fix but a redeploy. 5 min still absorbs the
// revalidation burst (the memo below) but bounds how long stale survives.
// `max-age=0` keeps browsers revalidating.
//
// 15 min fresh, not the sync's daily cadence: a Sessionize edit is usually
// followed by a forced sync, and an hour of freshness hid it.
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
