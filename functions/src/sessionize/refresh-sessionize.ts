/**
 * Scheduled trigger that mirrors Sessionize into public-read Firestore. Fetches
 * the All-data view and (today) writes the `speakers` array into the `speakers`
 * collection; the website reads it directly so visitor traffic never hits
 * Sessionize. Sessions / rooms / categories are on the wire but not yet
 * persisted — add a collection + guarded sync when they're needed.
 *
 * The write is a single atomic batch (upserts + guarded deletes) so a live
 * `onSnapshot` subscriber never streams a half-synced state. A truncated or
 * malformed Sessionize response aborts before any write — see
 * `sessionize-api.ts` for the validation + delete-guard rationale.
 */

import { logger } from 'firebase-functions/v2';
import { onSchedule } from 'firebase-functions/v2/scheduler';

import { firestore } from '../lib/admin.js';
import { SLACK_WEBHOOK_URL } from '../tickets/params.js';
import { postToSlack } from '../tickets/slack-client.js';
import { SESSIONIZE_ENDPOINT_ID } from './params.js';
import {
	computeDeletePlan,
	extractSpeakers,
	fetchAll,
	normalizeSpeakers,
	type SpeakerDoc,
} from './sessionize-api.js';

const REGION = 'europe-west1';
const SPEAKERS_COLLECTION = 'speakers';
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

interface SyncResult {
	upserted: number;
	deleted: number;
	deletesWithheld: boolean;
}

async function syncSessionize(): Promise<SyncResult> {
	const endpointId = SESSIONIZE_ENDPOINT_ID.value();
	if (!endpointId) {
		throw new Error('Missing config: set the SESSIONIZE_ENDPOINT_ID secret.');
	}

	logger.info('Fetching Sessionize All-data view');
	const all = await fetchAll(endpointId);
	const speakers: SpeakerDoc[] = normalizeSpeakers(extractSpeakers(all));

	const collection = firestore().collection(SPEAKERS_COLLECTION);

	// listDocuments() returns refs without reading document bodies — cheap way
	// to diff the current id set against the fresh one.
	const existingRefs = await collection.listDocuments();
	const existingIds = existingRefs.map((ref) => ref.id);
	const freshIds = new Set(speakers.map((s) => s.id));
	const plan = computeDeletePlan(existingIds, freshIds);

	// One atomic batch = one consistent snapshot for the live `onSnapshot`
	// subscriber. NOTE: a WriteBatch hard-caps at 500 ops, so
	// speakers.length + toDelete.length must stay < 500 — trivially true at the
	// expected ~30–60 speakers. Chunk into multiple batches if the roster ever
	// approaches that ceiling.
	const batch = firestore().batch();
	for (const speaker of speakers) {
		batch.set(collection.doc(speaker.id), speaker);
	}
	for (const id of plan.toDelete) {
		batch.delete(collection.doc(id));
	}
	await batch.commit();

	const result: SyncResult = {
		upserted: speakers.length,
		deleted: plan.toDelete.length,
		deletesWithheld: plan.withheld,
	};

	logger.info(
		`Wrote /${SPEAKERS_COLLECTION} (upserted=${result.upserted}, deleted=${result.deleted}, withheld=${result.deletesWithheld})`,
	);

	if (plan.withheld) {
		await notify(
			`Delete guard tripped — held stale-speaker deletes (fresh=${freshIds.size}, existing=${existingIds.length}). Possible truncated Sessionize response.`,
		);
	}

	return result;
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
