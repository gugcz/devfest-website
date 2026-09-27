/**
 * `speakerPhotoApi` — `/api/speaker-photo?id=<speakerId>` serves a speaker's
 * portrait from devfest.cz's own origin, for the `/speaker-card` canvas.
 *
 * A canvas can only export an image whose server sends CORS headers. The
 * lineup's `profilePicture` is either our Storage mirror (App Check enforced,
 * so a bare browser fetch gets 401) or the Sessionize CDN (no CORS). Served
 * same-origin, neither matters. `<img>` elsewhere keeps using the URL as is.
 *
 * Only the photo on the speaker's own doc is served — the `id` picks a doc,
 * never a URL — so this cannot be used to proxy arbitrary hosts.
 */

import { getStorage } from 'firebase-admin/storage';
import { logger } from 'firebase-functions/v2';
import { onRequest } from 'firebase-functions/v2/https';

import { adminApp, firestore } from '../lib/admin.js';
import { describeError } from '../lib/errors.js';
import { fetchWithRetry } from '../lib/http.js';
import { CACHED_ENDPOINT } from '../options.js';
import { acceptedImageType, isMirrorableUrl } from '../sessionize/mirror-images.js';

// A day at the edge, an hour in the browser: a photo changes only when the
// speaker updates it in Sessionize, and the card is a once-per-speaker tool.
const CACHE_CONTROL = 'public, max-age=3600, s-maxage=86400';
const MAX_BYTES = 10 * 1024 * 1024;
const STORAGE_HOST = 'firebasestorage.googleapis.com';

/** Sessionize speaker GUIDs; anything else is refused before a Firestore read. */
export function isSpeakerId(id: unknown): id is string {
	return typeof id === 'string' && /^[A-Za-z0-9-]{1,64}$/.test(id);
}

interface Photo {
	bytes: Buffer;
	contentType: string;
}

/** Which source a doc's `profilePicture` points at, or `null` if neither. */
export function photoSource(url: string): 'storage' | 'sessionize' | null {
	try {
		const { protocol, hostname } = new URL(url);
		if (protocol === 'https:' && hostname === STORAGE_HOST) return 'storage';
	} catch {
		return null;
	}
	return isMirrorableUrl(url) ? 'sessionize' : null;
}

async function readFromStorage(speakerId: string): Promise<Photo | null> {
	// Same object the sync's mirror writes (`speakers/{id}`); the Admin SDK is
	// not subject to App Check.
	const file = getStorage(adminApp).bucket().file(`speakers/${speakerId}`);
	const [[bytes], [metadata]] = await Promise.all([file.download(), file.getMetadata()]);
	const contentType = acceptedImageType(typeof metadata.contentType === 'string' ? metadata.contentType : null);
	return contentType ? { bytes, contentType } : null;
}

async function readFromSessionize(url: string): Promise<Photo | null> {
	const res = await fetchWithRetry(url, { headers: { Accept: 'image/*' } }, { label: 'speaker photo', attempts: 2 });
	if (!res.ok) throw new Error(`download ${res.status} ${res.statusText}`);
	const contentType = acceptedImageType(res.headers.get('content-type'));
	if (!contentType) return null;
	const bytes = Buffer.from(await res.arrayBuffer());
	if (bytes.byteLength === 0 || bytes.byteLength > MAX_BYTES) return null;
	return { bytes, contentType };
}

export const speakerPhotoApi = onRequest(CACHED_ENDPOINT, async (req, res) => {
	if (req.method !== 'GET' && req.method !== 'HEAD') {
		res.set('Allow', 'GET, HEAD');
		res.status(405).send('Method Not Allowed');
		return;
	}
	const id = req.query.id;
	if (!isSpeakerId(id)) {
		res.set('Cache-Control', 'no-store');
		res.status(400).send('Bad Request');
		return;
	}
	try {
		const doc = await firestore().collection('speakers').doc(id).get();
		const url = doc.get('profilePicture');
		const source = typeof url === 'string' ? photoSource(url.trim()) : null;
		const photo =
			source === 'storage'
				? await readFromStorage(id)
				: source === 'sessionize'
					? await readFromSessionize(url.trim())
					: null;
		if (!photo) {
			// Short-lived: a speaker may add a photo in Sessionize later.
			res.set('Cache-Control', 'public, max-age=300, s-maxage=300');
			res.status(404).send('Not Found');
			return;
		}
		res.set('Cache-Control', CACHE_CONTROL);
		res.set('Content-Type', photo.contentType);
		res.set('X-Content-Type-Options', 'nosniff');
		res.status(200).send(photo.bytes);
	} catch (err) {
		logger.error(`speakerPhotoApi read failed for ${id}: ${describeError(err)}`, err);
		res.set('Cache-Control', 'no-store');
		res.status(502).send('Bad Gateway');
	}
});
