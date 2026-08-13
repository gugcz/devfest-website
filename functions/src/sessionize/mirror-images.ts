/**
 * Mirror Sessionize speaker photos into Firebase Storage so the website serves
 * every asset off Firebase instead of Sessionize's BunnyCDN.
 *
 * `mirrorSpeakerImages` downloads each speaker's `profilePicture`, uploads it to
 * `speakers/{speakerId}` in the default Storage bucket, and returns a
 * speakerId → served-URL map. The served URL is a Firebase download-token URL
 * (`firebasestorage.googleapis.com/…?alt=media&token=…`), which is publicly
 * readable regardless of Storage security rules — so no rules change is needed.
 *
 * Idempotent: each object stores the source URL in its custom metadata. A run
 * re-downloads a photo only when its Sessionize URL changed (or the object is
 * missing); otherwise it reuses the existing object + token. So steady-state
 * runs do one cheap metadata read per speaker and no downloads.
 *
 * Best-effort: a per-speaker failure (network, oversize, Storage error) is
 * logged and falls back to the original Sessionize URL for that speaker; the
 * whole feature no-ops (returns an empty map) if Storage itself is unreachable,
 * so image mirroring can never break the core Sessionize sync.
 */

import { randomUUID } from 'node:crypto';

import { getStorage } from 'firebase-admin/storage';
import { logger } from 'firebase-functions/v2';

import { adminApp } from '../lib/admin.js';
import { describeError } from '../lib/errors.js';
import { fetchWithRetry } from '../lib/http.js';
import type { SessionizeSpeaker } from './sessionize-api.js';

const STORAGE_PREFIX = 'speakers';
/** Refuse to buffer a runaway response; real portraits are well under this. */
const MAX_BYTES = 10 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 20_000;
/** Parallel downloads. Small — the roster is ~30–60 and we're kind to the CDN. */
const CONCURRENCY = 6;

/** Only mirror real http(s) sources; anything else is left as-is. */
function isHttpUrl(url: string): boolean {
	try {
		const { protocol } = new URL(url);
		return protocol === 'http:' || protocol === 'https:';
	} catch {
		return false;
	}
}

function tokenUrl(bucketName: string, objectPath: string, token: string): string {
	return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(objectPath)}?alt=media&token=${token}`;
}

interface BucketLike {
	name: string;
	file: (path: string) => FileLike;
}

interface FileLike {
	getMetadata: () => Promise<[Record<string, unknown>]>;
	save: (data: Buffer, options: Record<string, unknown>) => Promise<void>;
}

/**
 * Mirror one speaker photo and return its served URL. Reuses the existing
 * object when it was already mirrored from the same source; otherwise downloads
 * + uploads. Throws on any failure so the caller can fall back to the original.
 */
async function mirrorOne(bucket: BucketLike, speakerId: string, sourceUrl: string): Promise<string> {
	const objectPath = `${STORAGE_PREFIX}/${speakerId}`;
	const file = bucket.file(objectPath);

	// Idempotency: skip the download when the stored source matches. Capture any
	// existing token so a re-upload keeps the SAME URL (no 403 window, no doc
	// churn) even when the photo bytes change.
	let existingToken = '';
	try {
		const [meta] = await file.getMetadata();
		const custom = (meta.metadata ?? {}) as Record<string, string>;
		existingToken = (custom.firebaseStorageDownloadTokens ?? '').split(',')[0];
		if (custom.sourceUrl === sourceUrl && existingToken) {
			return tokenUrl(bucket.name, objectPath, existingToken);
		}
	} catch {
		// 404 (never mirrored) or a transient metadata error — fall through and
		// (re)upload below.
	}

	// Two attempts, not the default three: a photo that stays unreachable just
	// falls back to the Sessionize CDN URL, so it isn't worth holding the roster
	// up for — the sync waits on every one of these.
	const res = await fetchWithRetry(
		sourceUrl,
		{ headers: { Accept: 'image/*' } },
		{ label: `speaker photo ${speakerId}`, attempts: 2, timeoutMs: FETCH_TIMEOUT_MS },
	);
	if (!res.ok) throw new Error(`download ${res.status} ${res.statusText}`);
	const contentType = res.headers.get('content-type') || 'image/jpeg';
	if (!contentType.startsWith('image/')) throw new Error(`unexpected content-type ${contentType}`);
	// Reject an oversize body before buffering when the length is advertised;
	// the post-read check below is the backstop for chunked / length-less bodies.
	const declaredLength = Number(res.headers.get('content-length'));
	if (declaredLength > MAX_BYTES) throw new Error(`image too large (${declaredLength} bytes)`);
	const bytes = Buffer.from(await res.arrayBuffer());
	if (bytes.byteLength === 0) throw new Error('empty image body');
	if (bytes.byteLength > MAX_BYTES) throw new Error(`image too large (${bytes.byteLength} bytes)`);

	const token = existingToken || randomUUID();
	await file.save(bytes, {
		resumable: false,
		contentType,
		metadata: {
			contentType,
			cacheControl: 'public, max-age=86400',
			metadata: { firebaseStorageDownloadTokens: token, sourceUrl },
		},
	});
	return tokenUrl(bucket.name, objectPath, token);
}

/** Run `fn` over `items` with a fixed worker pool. */
async function mapWithConcurrency<T, R>(
	items: T[],
	limit: number,
	fn: (item: T) => Promise<R>,
): Promise<R[]> {
	const results: R[] = new Array(items.length);
	let cursor = 0;
	const worker = async () => {
		while (true) {
			const index = cursor++;
			if (index >= items.length) return;
			results[index] = await fn(items[index]);
		}
	};
	await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
	return results;
}

/**
 * Mirror every speaker's photo into Firebase Storage. Returns a speakerId →
 * served-URL map covering only the speakers whose photo was successfully
 * mirrored; callers fall back to the raw Sessionize URL for any id not present.
 * Never throws — a total Storage failure yields an empty map.
 */
export async function mirrorSpeakerImages(
	speakers: SessionizeSpeaker[],
): Promise<Map<string, string>> {
	const map = new Map<string, string>();

	let bucket: BucketLike;
	try {
		bucket = getStorage(adminApp).bucket() as unknown as BucketLike;
	} catch (err) {
		logger.warn(
			`sessionize image mirror: Storage unavailable, using source URLs: ${describeError(err)}`,
			err,
		);
		return map;
	}

	const targets = speakers
		.map((speaker) => ({
			id: typeof speaker.id === 'string' ? speaker.id.trim() : '',
			url: typeof speaker.profilePicture === 'string' ? speaker.profilePicture.trim() : '',
		}))
		.filter((t) => t.id && isHttpUrl(t.url));

	let mirrored = 0;
	await mapWithConcurrency(targets, CONCURRENCY, async ({ id, url }) => {
		try {
			map.set(id, await mirrorOne(bucket, id, url));
			mirrored += 1;
		} catch (err) {
			logger.warn(
				`sessionize image mirror failed for ${id}, using source URL: ${describeError(err)}`,
				err,
			);
		}
	});

	logger.info(`Mirrored ${mirrored}/${targets.length} speaker photos into Storage`);
	return map;
}
