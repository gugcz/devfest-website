/**
 * Scheduled trigger that mirrors Sessionize into public-read Firestore. Fetches
 * the All-data view once a day and writes two cross-referenced collections so
 * the website reads them live and visitor traffic never hits Sessionize:
 *   - `speakers` — each speaker doc embeds its `sessions[]`.
 *   - `sessions` — each session doc embeds its `speakers[]`.
 * The All view's `rooms` / `categories` are on the wire but not yet persisted —
 * add a collection + guarded sync when they're needed.
 *
 * Each collection is written as its own atomic batch (upserts + guarded
 * deletes) so a live `onSnapshot` subscriber never streams a half-synced state.
 * A truncated or malformed Sessionize response aborts before any write — see
 * `sessionize-api.ts` for the validation + delete-guard rationale. Sessions are
 * only present in the All view; a Speakers-view fallback yields an empty session
 * set, which the delete-guard preserves rather than wipes.
 */

import { logger } from 'firebase-functions/v2';
import { onSchedule } from 'firebase-functions/v2/scheduler';

import { firestore } from '../lib/admin.js';
import { SLACK_WEBHOOK_URL } from '../tickets/params.js';
import { postToSlack } from '../tickets/slack-client.js';
import { SESSIONIZE_ENDPOINT_ID } from './params.js';
import {
	buildSessionMap,
	buildSpeakerSummaryMap,
	computeDeletePlan,
	extractSessions,
	extractSpeakers,
	fetchSessionizePayload,
	normalizeSessions,
	normalizeSpeakers,
} from './sessionize-api.js';

const REGION = 'europe-west1';
const SPEAKERS_COLLECTION = 'speakers';
const SESSIONS_COLLECTION = 'sessions';
const SLACK_PREFIX = '🎤 SESSIONIZE';

/** Best-effort Slack alert — never masks the caller's real error. */
async function notify(text: string): Promise<void> {
	const webhookUrl = SLACK_WEBHOOK_URL.value();
	if (!webhookUrl) return;
	try {
		await postToSlack(webhookUrl, { text: `${SLACK_PREFIX} — ${text}` });
	} catch (err) {
		logger.warn('sessionize Slack notify failed', err);
	}
}

interface CollectionSync {
	collection: string;
	upserted: number;
	deleted: number;
	deletesWithheld: boolean;
	/** Id counts surfaced in the delete-guard alert. */
	freshCount: number;
	existingCount: number;
}

/**
 * Mirror one set of docs into a collection as a single atomic batch (upserts +
 * guarded deletes). NOTE: a WriteBatch hard-caps at 500 ops, so
 * docs.length + toDelete.length must stay < 500 — trivially true at the
 * expected ~30–80 speakers/sessions. Chunk into multiple batches if either set
 * ever approaches that ceiling.
 */
async function commitCollection(name: string, docs: { id: string }[]): Promise<CollectionSync> {
	const collection = firestore().collection(name);

	// listDocuments() returns refs without reading document bodies — cheap way
	// to diff the current id set against the fresh one.
	const existingRefs = await collection.listDocuments();
	const existingIds = existingRefs.map((ref) => ref.id);
	const freshIds = new Set(docs.map((d) => d.id));
	const plan = computeDeletePlan(existingIds, freshIds);

	const batch = firestore().batch();
	for (const doc of docs) {
		batch.set(collection.doc(doc.id), doc);
	}
	for (const id of plan.toDelete) {
		batch.delete(collection.doc(id));
	}
	await batch.commit();

	const result: CollectionSync = {
		collection: name,
		upserted: docs.length,
		deleted: plan.toDelete.length,
		deletesWithheld: plan.withheld,
		freshCount: freshIds.size,
		existingCount: existingIds.length,
	};

	logger.info(
		`Wrote /${name} (upserted=${result.upserted}, deleted=${result.deleted}, withheld=${result.deletesWithheld})`,
	);

	if (plan.withheld) {
		await notify(
			`Delete guard tripped on /${name} — held stale deletes (fresh=${result.freshCount}, existing=${result.existingCount}). Possible truncated Sessionize response.`,
		);
	}

	return result;
}

async function syncSessionize(): Promise<CollectionSync[]> {
	const endpointId = SESSIONIZE_ENDPOINT_ID.value();
	if (!endpointId) {
		throw new Error('Missing config: set the SESSIONIZE_ENDPOINT_ID secret.');
	}

	logger.info('Fetching Sessionize data');
	const payload = await fetchSessionizePayload(endpointId);

	// Speakers embed their sessions; sessions embed their speakers.
	const sessionMap = buildSessionMap(payload);
	const speakers = normalizeSpeakers(extractSpeakers(payload), sessionMap);

	const speakerMap = buildSpeakerSummaryMap(payload);
	const sessions = normalizeSessions(extractSessions(payload), speakerMap);

	// Speakers first: `extractSpeakers` throws on an empty/invalid roster, so a
	// failed fetch aborts before either collection is touched. `extractSessions`
	// tolerates an empty set (Speakers-view fallback), and the delete-guard keeps
	// a truncated run from wiping the live /sessions collection.
	const speakersResult = await commitCollection(SPEAKERS_COLLECTION, speakers);
	const sessionsResult = await commitCollection(SESSIONS_COLLECTION, sessions);

	return [speakersResult, sessionsResult];
}

/**
 * Daily scheduled refresh. Sessionize server-caches the All-data view ~5 min;
 * one request per day is trivial load.
 */
export const refreshSessionize = onSchedule(
	{
		schedule: 'every day 06:00',
		timeZone: 'Europe/Prague',
		region: REGION,
		secrets: [SESSIONIZE_ENDPOINT_ID, SLACK_WEBHOOK_URL],
		timeoutSeconds: 120,
		memory: '256MiB',
		retryCount: 1,
	},
	async () => {
		try {
			await syncSessionize();
		} catch (err) {
			// Alert best-effort, then rethrow the ORIGINAL error so the failure
			// surfaces in logs / retries and yesterday's data stays intact.
			await notify(`Sync failed: ${(err as Error).message}`);
			throw err;
		}
	},
);
