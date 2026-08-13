/**
 * Scheduled trigger that mirrors Sessionize into public-read Firestore. Fetches
 * the All-data view once a day and writes two cross-referenced collections so
 * the website reads them live and visitor traffic never hits Sessionize:
 *   - `speakers` — each speaker doc embeds its `sessions[]`.
 *   - `sessions` — each session doc embeds its `speakers[]`.
 * Speaker photos are mirrored into Firebase Storage first (see
 * `mirror-images.ts`) and the stored URLs are written onto both collections, so
 * every asset the website serves is cached on Firebase, not Sessionize's CDN.
 * The All view's `rooms` is on the wire but not yet persisted — add a collection
 * + guarded sync when it's needed.
 *
 * Each collection is written as its own atomic batch (upserts + guarded
 * deletes) so a live `onSnapshot` subscriber never streams a half-synced state.
 * A truncated or malformed Sessionize response aborts before any write — see
 * `sessionize-api.ts` for the validation + delete-guard rationale. Sessions are
 * only present in the All view; a Speakers-view fallback yields an empty session
 * set, which the delete-guard preserves rather than wipes.
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
 * (upserts + guarded deletes). Generic over the doc shape so the caller passes
 * `SpeakerDoc[]` / `SessionDoc[]` and the write is type-checked end to end.
 * Each doc is stamped with a server-side `syncedAt` (mirrors the invoice
 * domain's `createdAt`/`updatedAt`) so consumers can gauge mirror staleness.
 *
 * NOTE: a WriteBatch hard-caps at 500 ops, so docs.length + toDelete.length
 * must stay < 500 — trivially true at the expected ~30–80 speakers/sessions.
 * Chunk into multiple batches if either set ever approaches that ceiling.
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

	// Mirror speaker photos into Firebase Storage and serve those URLs, so every
	// asset is cached on Firebase (not Sessionize's CDN). Best-effort: any id not
	// in the map falls back to its raw Sessionize URL. Done before normalization
	// so both the speaker docs and the sessions' embedded speaker refs get the
	// Firebase URL.
	const rawSpeakers = extractSpeakers(payload);
	const imageMap = await mirrorSpeakerImages(rawSpeakers);

	// Speakers embed their sessions; sessions embed their speakers.
	const sessionMap = buildSessionMap(payload);
	const speakers = normalizeSpeakers(rawSpeakers, sessionMap, imageMap);

	const speakerMap = buildSpeakerSummaryMap(payload, imageMap);
	const categoryMap = buildCategoryMap(payload);
	const sessions = normalizeSessions(extractSessions(payload), speakerMap, categoryMap);

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
