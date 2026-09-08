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

// Edge cache (shared): 15 min fresh, then a SHORT stale window while revalidating.
//
// The stale window used to be a day (`stale-while-revalidate=86400`), on the
// reasoning that `refreshSessionizeScheduled` only runs daily. That backfired the
// first time the schedule landed: Hosting `Vary`s on `accept-encoding`, so the
// compressed variant every real browser asks for is its own cache entry, and that
// entry kept being served stale — the site showed a lineup with no times (`/agenda`
// rendered its "schedule lands closer to the event" empty state) while the origin
// had the full timetable. A day-long stale window means any sync — a new talk, a
// room change, the schedule itself — can be invisible for a day with nothing in the
// logs to show for it, and no way to force it out but a hosting redeploy.
//
// 5 minutes still absorbs the revalidation burst (that is what the in-instance memo
// below is for) and keeps the edge answering essentially every request, but bounds
// how long a stale lineup can survive. `max-age=0` keeps browsers revalidating.
//
// The fresh window is 15 min rather than the sync's own daily cadence: a talk edited
// in Sessionize is usually followed by a forced run of `refreshSessionizeScheduled`,
// and an hour of edge freshness made that look like nothing had happened. 15 min is
// still ~4 origin revalidations an hour per edge, which the memo below collapses.
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
