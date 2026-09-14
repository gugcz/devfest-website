/**
 * Daily scheduled mirror of Sessionize into Firestore:
 *   - `speakers` — each doc embeds its `sessions[]`.
 *   - `sessions` — each doc embeds its `speakers[]`.
 * Speaker photos are mirrored into Storage first (`mirror-images.ts`) and
 * those URLs written onto both collections. `rooms` is not persisted.
 *
 * Each collection is one atomic batch (upserts + guarded deletes), so a
 * reader never sees a half-synced state. A truncated/malformed response
 * aborts before any write (see `sessionize-api.ts`). A Speakers-view
 * fallback yields no sessions; the delete-guard preserves them.
 */

import { FieldValue } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v2';
import { onSchedule } from 'firebase-functions/v2/scheduler';

import { firestore } from '../lib/admin.js';
import { stageError } from '../lib/errors.js';
import { SLACK_WEBHOOK_URL } from '../lib/params.js';
import { runBackground } from '../lib/run.js';
import { notify } from '../lib/slack.js';
import { SCHEDULED } from '../options.js';
import { mirrorSpeakerImages } from './mirror-images.js';
import { SESSIONIZE_ENDPOINT_ID } from './params.js';
import {
	buildCategoryMap,
	buildRoomMap,
	buildSessionMap,
	buildSpeakerSummaryMap,
	computeDeletePlan,
	extractSessions,
	extractSpeakers,
	fetchSessionizePayload,
	normalizeSessions,
	normalizeSpeakers,
} from './sessionize-api.js';

const SPEAKERS_COLLECTION = 'speakers';
const SESSIONS_COLLECTION = 'sessions';

/**
 * Mirror one typed set of docs into a collection as a single atomic batch
 * (upserts + guarded deletes). Each doc is stamped with a server-side
 * `syncedAt`. A WriteBatch caps at 500 ops — fine at ~30–80 docs; chunk if
 * either set ever approaches that.
 */
async function commitCollection<T extends { id: string }>(name: string, docs: T[]): Promise<void> {
	const collection = firestore().collection(name);

	// listDocuments() returns refs without reading document bodies — cheap way
	// to diff the current id set against the fresh one.
	const existingRefs = await collection.listDocuments();
	const existingIds = existingRefs.map((ref) => ref.id);
	const freshIds = new Set(docs.map((d) => d.id));
	const plan = computeDeletePlan(existingIds, freshIds);

	const batch = firestore().batch();
	for (const doc of docs) {
		batch.set(collection.doc(doc.id), { ...doc, syncedAt: FieldValue.serverTimestamp() });
	}
	for (const id of plan.toDelete) {
		batch.delete(collection.doc(id));
	}
	// Name the stage on the way out: a raw Firestore error (`5 NOT_FOUND`,
	// `7 PERMISSION_DENIED`) reads identically to a Sessionize one in the Slack
	// alert, and the two have completely different fixes.
	try {
		await batch.commit();
	} catch (err) {
		throw stageError(`Firestore write to /${name}`, err);
	}

	logger.info(
		`Wrote /${name} (upserted=${docs.length}, deleted=${plan.toDelete.length}, withheld=${plan.withheld})`,
	);

	if (plan.withheld) {
		// Not a failure — the guard did its job — but a human should check whether
		// Sessionize really lost those records, so it alerts on its own.
		await notify(
			'sessionize',
			SLACK_WEBHOOK_URL.value(),
			`⚠️ Delete guard tripped on /${name} — held stale deletes (fresh=${freshIds.size}, existing=${existingIds.length}). Possible truncated Sessionize response.`,
		);
	}
}

async function syncSessionize(): Promise<void> {
	const endpointId = SESSIONIZE_ENDPOINT_ID.value();
	if (!endpointId) {
		throw new Error('Missing config: set the SESSIONIZE_ENDPOINT_ID secret.');
	}

	logger.info('Fetching Sessionize data');
	const payload = await fetchSessionizePayload(endpointId);

	// Mirror speaker photos into Storage. Best-effort: an id missing from the
	// map falls back to the raw Sessionize URL. Done before normalization so
	// both speaker docs and sessions' embedded refs get the Firebase URL.
	const rawSpeakers = extractSpeakers(payload);
	const imageMap = await mirrorSpeakerImages(rawSpeakers);

	// Speakers embed their sessions; sessions embed their speakers.
	const sessionMap = buildSessionMap(payload);
	const speakers = normalizeSpeakers(rawSpeakers, sessionMap, imageMap);

	const speakerMap = buildSpeakerSummaryMap(payload, imageMap);
	const categoryMap = buildCategoryMap(payload);
	// Sessions carry a `roomId` and (for this event) no inline room name, so the
	// column names on /agenda come from the payload's top-level `rooms[]`.
	const roomMap = buildRoomMap(payload);
	const sessions = normalizeSessions(extractSessions(payload), speakerMap, categoryMap, roomMap);

	// Speakers first: `extractSpeakers` throws on an empty/invalid roster, so a
	// failed fetch aborts before either collection is touched. `extractSessions`
	// tolerates an empty set (Speakers-view fallback), and the delete-guard keeps
	// a truncated run from wiping the live /sessions collection.
	await commitCollection(SPEAKERS_COLLECTION, speakers);
	await commitCollection(SESSIONS_COLLECTION, sessions);
}

/**
 * Daily scheduled refresh. Sessionize server-caches the All-data view ~5 min;
 * one request per day is trivial load.
 */
export const refreshSessionizeScheduled = onSchedule(
	{
		...SCHEDULED,
		schedule: 'every day 06:00',
		secrets: [SESSIONIZE_ENDPOINT_ID, SLACK_WEBHOOK_URL],
		// Both raised above the shared defaults: the first run downloads the whole
		// speaker roster into Storage. Steady-state runs are far quicker (only
		// changed photos re-download).
		timeoutSeconds: 300,
		memory: '512MiB',
	},
	() =>
		runBackground(
			{
				name: 'refreshSessionizeScheduled',
				domain: 'sessionize',
				// Yesterday's mirror stays live and correct, so this is a
				// freshness problem, not an outage — nobody needs to act tonight.
				failureNote: 'live speakers/sessions left untouched, next run 06:00 Europe/Prague',
			},
			syncSessionize,
		),
);
