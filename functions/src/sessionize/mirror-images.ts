/**
 * Mirror speaker photos into Storage `speakers/{id}`; returns speakerId →
 * download-token URL (public regardless of rules). Idempotent via source URL
 * in custom metadata. Best-effort: failures fall back to the Sessionize URL
 * and never break the sync.
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

/** Where Sessionize serves profile pictures (`cdn.sessionize.com/image/…`
 * today). The function fetches whatever URL the payload names, so the host
 * is pinned to sessionize.com and its subdomains: a payload is data, not a
 * licence to make the function download from anywhere. */
const SOURCE_HOST_RE = /(^|\.)sessionize\.com$/i;

/** Raster types only — an SVG would be stored and served verbatim from the
 * Storage origin, which is a script container, not a photo. */
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']);

/** Only mirror an https source on a Sessionize host; anything else keeps its
 * original URL in the doc (the browser loads it as before). Exported for tests. */
export function isMirrorableUrl(url: string): boolean {
	try {
		const { protocol, hostname } = new URL(url);
		return protocol === 'https:' && SOURCE_HOST_RE.test(hostname);
	} catch {
		return false;
	}
}

/** `image/jpeg; charset=…` → `image/jpeg`; `''` when unusable. */
export function acceptedImageType(contentType: string | null): string | null {
	const type = (contentType ?? '').split(';')[0].trim().toLowerCase();
	return IMAGE_TYPES.has(type) ? type : null;
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
	const contentType = acceptedImageType(res.headers.get('content-type'));
	if (!contentType) throw new Error(`unexpected content-type ${res.headers.get('content-type') ?? '(none)'}`);
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

/** Mirror every speaker's photo. Map covers only successes; never throws. */
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
		.filter((t) => t.id && isMirrorableUrl(t.url));

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
