/**
 * Sessionize Speakers-view client + pure normalization helpers.
 *
 * Sessionize is the org's speaker source of truth. The `refreshSpeakers`
 * scheduler fetches the Speakers view once a day and mirrors it into the
 * public-read Firestore `speakers` collection; the browser never calls
 * Sessionize directly.
 *
 * Endpoint: https://sessionize.com/api/v2/<id>/view/Speakers  (no auth, GET,
 * server-cached ~5 min). The id MUST be a JSON-format endpoint with the
 * Speakers view — an embed id returns HTML, not JSON.
 *
 * The fetch/validate/normalize and delete-guard logic below are pure and
 * exported so the highest-risk paths (a truncated response must never wipe the
 * live collection) are reviewable in isolation — this package ships no tests.
 */

const SESSIONIZE_API_BASE = 'https://sessionize.com/api/v2';

/** Raw Sessionize link as returned by the Speakers view. */
export interface SessionizeLink {
	title?: string | null;
	url?: string | null;
	linkType?: string | null;
}

/** The subset of the raw Sessionize speaker fields we consume. */
export interface SessionizeSpeaker {
	id?: string | null;
	fullName?: string | null;
	tagLine?: string | null;
	profilePicture?: string | null;
	links?: SessionizeLink[] | null;
	[key: string]: unknown;
}

/**
 * Canonical link kinds. The browser maps each kind to an icon SVG; unknown
 * Sessionize link types collapse to `web` (a globe) so nothing renders blank.
 */
export type SpeakerLinkKind =
	| 'linkedin'
	| 'x'
	| 'facebook'
	| 'instagram'
	| 'bluesky'
	| 'youtube'
	| 'github'
	| 'mastodon'
	| 'web';

/** Normalized link persisted on the speaker doc. */
export interface SpeakerLink {
	kind: SpeakerLinkKind;
	url: string;
	label: string;
}

/** The document shape written to Firestore `speakers/{id}`. */
export interface SpeakerDoc {
	/** Sessionize speaker GUID — also the Firestore doc id. */
	id: string;
	/** Index in the Sessionize array; always non-null, unique per sync. */
	order: number;
	fullName: string;
	/** Verbatim Sessionize tagline; may be empty. */
	tagLine: string;
	/** Absolute BunnyCDN URL; may be empty. */
	profilePicture: string;
	links: SpeakerLink[];
}

/** Human-readable label per kind, used when a link has no title. */
const KIND_LABEL: Record<SpeakerLinkKind, string> = {
	linkedin: 'LinkedIn',
	x: 'X',
	facebook: 'Facebook',
	instagram: 'Instagram',
	bluesky: 'Bluesky',
	youtube: 'YouTube',
	github: 'GitHub',
	mastodon: 'Mastodon',
	web: 'Website',
};

/**
 * Map a Sessionize `linkType` to a canonical kind. Sessionize emits values like
 * `Twitter`, `LinkedIn`, `Blog`, `Company_Website`, `Facebook`, `Instagram`,
 * `Sessionize`, `Other_Link`. Anything unmapped falls back to `web`.
 */
export function mapLinkKind(linkType: string | null | undefined): SpeakerLinkKind {
	switch ((linkType ?? '').trim().toLowerCase()) {
		case 'linkedin':
			return 'linkedin';
		case 'twitter':
		case 'x':
			return 'x';
		case 'facebook':
			return 'facebook';
		case 'instagram':
			return 'instagram';
		case 'bluesky':
			return 'bluesky';
		case 'youtube':
			return 'youtube';
		case 'github':
			return 'github';
		case 'mastodon':
			return 'mastodon';
		default:
			return 'web';
	}
}

/**
 * Return the url only when it is a syntactically valid http(s) URL. Guards the
 * public page against `javascript:` and other non-web schemes in user-authored
 * profile data before they ever reach Firestore or the DOM.
 */
export function sanitizeLinkUrl(url: string | null | undefined): string | null {
	if (!url) return null;
	let parsed: URL;
	try {
		parsed = new URL(url.trim());
	} catch {
		return null;
	}
	if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
	return parsed.toString();
}

function normalizeLinks(links: SessionizeLink[] | null | undefined): SpeakerLink[] {
	if (!Array.isArray(links)) return [];
	const out: SpeakerLink[] = [];
	for (const link of links) {
		const url = sanitizeLinkUrl(link?.url);
		if (!url) continue;
		const kind = mapLinkKind(link?.linkType);
		const label = (link?.title ?? '').trim() || KIND_LABEL[kind];
		out.push({ kind, url, label });
	}
	return out;
}

/**
 * Validate a parsed Sessionize response. A truncated / malformed body (or an
 * error page served with HTTP 200) must abort the sync rather than mirror
 * garbage, so this throws on anything that is not a non-empty array of objects
 * each carrying a string `id`.
 */
export function validateSpeakers(raw: unknown): SessionizeSpeaker[] {
	if (!Array.isArray(raw)) {
		throw new Error('Sessionize payload is not an array');
	}
	if (raw.length === 0) {
		throw new Error('Sessionize payload is an empty array');
	}
	for (const entry of raw) {
		if (typeof entry !== 'object' || entry === null) {
			throw new Error('Sessionize payload contains a non-object entry');
		}
		const id = (entry as SessionizeSpeaker).id;
		if (typeof id !== 'string' || id.trim() === '') {
			throw new Error('Sessionize payload contains a speaker without a string id');
		}
	}
	return raw as SessionizeSpeaker[];
}

/**
 * Project one raw speaker into the persisted doc shape. `order` is the array
 * index (unique per sync); missing text fields become empty strings so the doc
 * shape stays stable and `orderBy('order')` never omits a speaker.
 */
export function normalizeSpeaker(raw: SessionizeSpeaker, index: number): SpeakerDoc {
	return {
		id: (raw.id as string).trim(),
		order: index,
		fullName: (raw.fullName ?? '').trim(),
		tagLine: (raw.tagLine ?? '').trim(),
		profilePicture: (raw.profilePicture ?? '').trim(),
		links: normalizeLinks(raw.links),
	};
}

export function normalizeSpeakers(raw: SessionizeSpeaker[]): SpeakerDoc[] {
	return raw.map(normalizeSpeaker);
}

/**
 * Fetch + parse the Speakers view. Throws on non-200, network error, or a body
 * that is not JSON so the caller can abort without touching Firestore.
 */
export async function fetchSpeakers(endpointId: string): Promise<unknown> {
	const url = `${SESSIONIZE_API_BASE}/${endpointId}/view/Speakers`;
	const res = await fetch(url, { headers: { Accept: 'application/json' } });

	if (!res.ok) {
		const body = await res.text().catch(() => '');
		throw new Error(`Sessionize API ${res.status} ${res.statusText}: ${body.slice(0, 300)}`);
	}

	try {
		return await res.json();
	} catch (err) {
		throw new Error(`Sessionize response was not valid JSON: ${(err as Error).message}`);
	}
}

/** Fraction of the current collection a single run may delete before it is
 * treated as a suspicious (truncated) fetch and the deletes are withheld. */
export const MAX_DELETE_FRACTION = 0.5;

export interface DeletePlan {
	/** Doc ids to delete this run (empty when withheld). */
	toDelete: string[];
	/** True when the delete set was suppressed by the guard. */
	withheld: boolean;
}

/**
 * Decide which stale docs to delete, guarding against a truncated fetch wiping
 * the live collection. Deletes are withheld when the fresh set is empty, or when
 * they would remove more than `MAX_DELETE_FRACTION` of a non-empty collection.
 * Upserts always proceed; only deletions are gated.
 */
export function computeDeletePlan(existingIds: string[], freshIds: Set<string>): DeletePlan {
	const stale = existingIds.filter((id) => !freshIds.has(id));

	if (freshIds.size === 0) {
		return { toDelete: [], withheld: stale.length > 0 };
	}
	if (existingIds.length > 0 && stale.length / existingIds.length > MAX_DELETE_FRACTION) {
		return { toDelete: [], withheld: true };
	}
	return { toDelete: stale, withheld: false };
}
