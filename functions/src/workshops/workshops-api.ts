/**
 * `workshopsApi` — public seat counts for the workshops open for registration
 * (`/api/workshops`). Seats only: who registered never leaves the callable.
 * A short TTL, since a visitor deciding whether to sign up reads this; the
 * callable answers with fresh numbers once they are signed in.
 */

import { onRequest } from 'firebase-functions/v2/https';

import { db } from '../lib/admin.js';
import { cachedJsonEndpoint } from '../lib/cached-endpoint.js';
import { CACHED_ENDPOINT } from '../options.js';
import { allSeats, WORKSHOPS_PATH, type WorkshopNode, type WorkshopSeats } from './roster.js';

const CACHE_CONTROL = 'public, max-age=0, s-maxage=30, stale-while-revalidate=300';
const MEMO_TTL_MS = 15 * 1000;

interface WorkshopsPayload {
	workshops: Record<string, WorkshopSeats>;
}

async function loadWorkshops(): Promise<WorkshopsPayload> {
	const snap = await db().ref(WORKSHOPS_PATH).once('value');
	return { workshops: allSeats(snap.val() as Record<string, WorkshopNode> | null) };
}

export const workshopsApi = onRequest(
	CACHED_ENDPOINT,
	cachedJsonEndpoint<WorkshopsPayload>({
		name: 'workshopsApi',
		cacheControl: CACHE_CONTROL,
		memoTtlMs: MEMO_TTL_MS,
		fallback: { workshops: {} },
		load: loadWorkshops,
	}),
);
