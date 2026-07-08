/**
 * Sessionize "All data" client + pure normalization helpers.
 *
 * Sessionize is the org's source of truth. The `refreshSessionize` scheduler
 * fetches the All-data view once a day and mirrors it into public-read
 * Firestore; the browser never calls Sessionize directly.
 *
 * Endpoint: https://sessionize.com/api/v2/<id>/view/<View>  (no auth, GET,
 * server-cached ~5 min). Sessionize endpoints are provisioned per-view, so a
 * given id serves only the view(s) it was created for; requesting a view the
 * endpoint doesn't expose returns a 400 HTML page. We only need the speaker
 * records, and BOTH the "All data" view (an OBJECT `{ speakers, sessions,
 * rooms, categories, questions }`) and the "Speakers" view (a bare ARRAY of the
 * same speaker objects) carry them — so `fetchSpeakersPayload` tries All first,
 * falls back to Speakers, and `extractSpeakers` accepts either shape. The id
 * MUST be a JSON-format endpoint; an embed id returns HTML, not JSON.
 *
 * Scope: only speakers are mirrored (into the `speakers` collection). The All
 * view's `sessions` / `rooms` / `categories` are ignored — add a collection +
 * guarded sync when they're needed.
 *
 * The fetch/validate/normalize and delete-guard logic below are pure and
 * exported so the highest-risk paths (a truncated response must never wipe the
 * live collection) are reviewable in isolation — this package ships no tests.
 */

const SESSIONIZE_API_BASE = 'https://sessionize.com/api/v2';

/** Raw Sessionize link as returned by the All view. */
export interface SessionizeLink {
	title?: string | null;
	url?: string | null;
	linkType?: string | null;
}

/**
 * Raw Sessionize speaker from the All view. Only the fields we normalize
 * explicitly are typed; the index signature keeps the object open so unmapped
 * fields don't need a type change to be read.
 */
export interface SessionizeSpeaker {
	id?: string | null;
	firstName?: string | null;
	lastName?: string | null;
	fullName?: string | null;
	bio?: string | null;
	tagLine?: string | null;
	profilePicture?: string | null;
	isTopSpeaker?: boolean | null;
	links?: SessionizeLink[] | null;
	sessions?: unknown[] | null;
	categories?: unknown[] | null;
	questionAnswers?: unknown[] | null;
	[key: string]: unknown;
}

/** The All-data envelope. Only `speakers` is consumed today. */
export interface SessionizeAll {
	speakers?: unknown;
	sessions?: unknown;
	rooms?: unknown;
	categories?: unknown;
	questions?: unknown;
}

/**
 * Canonical link kinds. The browser maps each kind to an icon SVG; unknown
 * Sessionize link types collapse to `web` (a globe) so nothing renders blank.
 *
 * ⚠️ Keep in sync with `src/lib/speakers.ts` (its `SpeakerLinkKind`,
 * `KNOWN_KINDS`, and `SPEAKER_ICON_PATHS`) — the two live across the
 * functions/ ↔ src/ build boundary and share no package. Adding a kind means
 * editing both files.
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

/**
 * The document written to Firestore `speakers/{id}` — the FULL Sessionize
 * speaker record. `links` is the sanitized + kind-mapped form (raw link URLs
 * are never persisted, so a `javascript:` href can't reach the DOM). The
 * relational arrays (`sessions` / `categories` / `questionAnswers`) are stored
 * as-is for downstream use; nothing renders them yet.
 */
export interface SpeakerDoc {
	/** Sessionize speaker GUID — also the Firestore doc id. */
	id: string;
	/** Index in the Sessionize array; always non-null, unique per sync. */
	order: number;
	firstName: string;
	lastName: string;
	fullName: string;
	bio: string;
	/** Verbatim Sessionize tagline; may be empty. */
	tagLine: string;
	/** Absolute BunnyCDN URL; may be empty. */
	profilePicture: string;
	isTopSpeaker: boolean;
	links: SpeakerLink[];
	sessions: unknown[];
	categories: unknown[];
	questionAnswers: unknown[];
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
 * profile data before they ever reach Firestore or the DOM. Embedded userinfo
 * (`user:pass@`) is stripped so credentials can't ride into a public `href`.
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
	parsed.username = '';
	parsed.password = '';
	return parsed.toString();
}

function normalizeLinks(links: SessionizeLink[] | null | undefined): SpeakerLink[] {
	if (!Array.isArray(links)) return [];
	const out: SpeakerLink[] = [];
	// Dedupe on kind+url so a profile listing the same link twice doesn't render
	// two identical icons (and collide the React list keys in Speakers.tsx).
	const seen = new Set<string>();
	for (const link of links) {
		const url = sanitizeLinkUrl(link?.url);
		if (!url) continue;
		const kind = mapLinkKind(link?.linkType);
		const dedupeKey = `${kind} ${url}`;
		if (seen.has(dedupeKey)) continue;
		seen.add(dedupeKey);
		const label = (link?.title ?? '').trim() || KIND_LABEL[kind];
		out.push({ kind, url, label });
	}
	return out;
}

function asString(value: unknown): string {
	return typeof value === 'string' ? value.trim() : '';
}

function asArray(value: unknown): unknown[] {
	return Array.isArray(value) ? value : [];
}

/**
 * Validate the speakers array from the All payload. A truncated / malformed
 * body must abort the sync rather than mirror garbage, so this throws on
 * anything that is not a non-empty array of objects each carrying a unique
 * string `id`.
 */
export function validateSpeakers(raw: unknown): SessionizeSpeaker[] {
	if (!Array.isArray(raw)) {
		throw new Error('Sessionize speakers is not an array');
	}
	if (raw.length === 0) {
		throw new Error('Sessionize speakers array is empty');
	}
	const seenIds = new Set<string>();
	for (const entry of raw) {
		if (typeof entry !== 'object' || entry === null) {
			throw new Error('Sessionize speakers contains a non-object entry');
		}
		const id = (entry as SessionizeSpeaker).id;
		if (typeof id !== 'string' || id.trim() === '') {
			throw new Error('Sessionize speakers contains a speaker without a string id');
		}
		// Doc id = speaker id, so a duplicate would silently overwrite one speaker
		// in the write batch (and collide its `order`). Abort instead of dropping.
		const key = id.trim();
		if (seenIds.has(key)) {
			throw new Error(`Sessionize speakers contains a duplicate speaker id: ${key}`);
		}
		seenIds.add(key);
	}
	return raw as SessionizeSpeaker[];
}

/**
 * Pull the validated speaker list out of a Sessionize payload, accepting either
 * shape: the "All data" view returns an OBJECT (`{ speakers, sessions, … }`);
 * the "Speakers" view returns a bare ARRAY of the same speaker objects. Throws
 * on anything else (e.g. an embed id returned HTML, or a truncated body) so the
 * caller aborts without writing.
 */
export function extractSpeakers(payload: unknown): SessionizeSpeaker[] {
	if (Array.isArray(payload)) {
		return validateSpeakers(payload);
	}
	if (typeof payload === 'object' && payload !== null) {
		return validateSpeakers((payload as SessionizeAll).speakers);
	}
	throw new Error('Sessionize payload is neither an array nor an object');
}

/**
 * Project one raw speaker into the persisted FULL doc shape. `order` is the
 * array index (unique per sync); missing scalars become empty strings / false
 * so the doc shape stays stable and `orderBy('order')` never omits a speaker.
 * Relational arrays are stored as-is.
 */
export function normalizeSpeaker(raw: SessionizeSpeaker, index: number): SpeakerDoc {
	return {
		id: (raw.id as string).trim(),
		order: index,
		firstName: asString(raw.firstName),
		lastName: asString(raw.lastName),
		fullName: asString(raw.fullName),
		bio: asString(raw.bio),
		tagLine: asString(raw.tagLine),
		profilePicture: asString(raw.profilePicture),
		isTopSpeaker: raw.isTopSpeaker === true,
		links: normalizeLinks(raw.links),
		sessions: asArray(raw.sessions),
		categories: asArray(raw.categories),
		questionAnswers: asArray(raw.questionAnswers),
	};
}

export function normalizeSpeakers(raw: SessionizeSpeaker[]): SpeakerDoc[] {
	return raw.map(normalizeSpeaker);
}

/**
 * Extract the bare endpoint id from the configured secret. Tolerates the value
 * being pasted as a full Sessionize URL (e.g.
 * `https://sessionize.com/api/v2/h826z24u` or `.../h826z24u/view/All`) rather
 * than just `h826z24u` — the base + `/view/<View>` are always added here, so a
 * URL in the secret would otherwise double the path and 400.
 */
export function parseEndpointId(raw: string | null | undefined): string {
	const trimmed = (raw ?? '').trim();
	if (!trimmed) return '';
	// Full Sessionize URL, with or without a trailing /view/<View>.
	const match = trimmed.match(/sessionize\.com\/api\/v2\/([^/\s?#]+)/i);
	if (match) return match[1];
	// Bare id, possibly with a trailing "/view/…", query, or slash.
	return trimmed.replace(/[/?#].*$/, '');
}

/** GET one Sessionize view. Fails fast on a hung connection rather than riding
 * the 120s function timeout. */
async function fetchView(endpointId: string, view: string): Promise<Response> {
	return fetch(`${SESSIONIZE_API_BASE}/${endpointId}/view/${view}`, {
		headers: { Accept: 'application/json' },
		signal: AbortSignal.timeout(15_000),
	});
}

/**
 * Fetch + parse the speaker payload. Sessionize endpoints are provisioned
 * per-view, so the configured id may serve the "All data" view, the "Speakers"
 * view, or both — try All first and fall back to Speakers on a non-OK response.
 * Throws on network error, timeout, both views failing, or a body that is not
 * JSON, so the caller aborts without touching Firestore.
 */
export async function fetchSpeakersPayload(rawEndpointId: string): Promise<unknown> {
	const endpointId = parseEndpointId(rawEndpointId);
	if (!endpointId) throw new Error('Missing or empty Sessionize endpoint id');

	let res = await fetchView(endpointId, 'All');
	if (!res.ok) {
		const allStatus = res.status;
		res = await fetchView(endpointId, 'Speakers');
		if (!res.ok) {
			const body = await res.text().catch(() => '');
			throw new Error(
				`Sessionize API failed for id "${endpointId}" (All=${allStatus}, Speakers=${res.status} ${res.statusText}): ${body.slice(0, 200)}`,
			);
		}
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
 * the live collection. Deletes are withheld when they would remove more than
 * `MAX_DELETE_FRACTION` of a non-empty collection. Upserts always proceed; only
 * deletions are gated.
 */
export function computeDeletePlan(existingIds: string[], freshIds: Set<string>): DeletePlan {
	const stale = existingIds.filter((id) => !freshIds.has(id));

	// An empty or heavily-truncated fresh set is caught here too: with the fresh
	// set empty, every existing id is stale (ratio = 1 > MAX_DELETE_FRACTION), so
	// the guard withholds without needing a separate empty-set branch.
	if (existingIds.length > 0 && stale.length / existingIds.length > MAX_DELETE_FRACTION) {
		return { toDelete: [], withheld: stale.length > 0 };
	}
	return { toDelete: stale, withheld: false };
}
