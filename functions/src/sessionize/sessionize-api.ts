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
 * endpoint doesn't expose returns a 400 HTML page. We need the speaker AND
 * session records: the "All data" view (an OBJECT `{ speakers, sessions, rooms,
 * categories, questions }`) carries both, while the "Speakers" view (a bare
 * ARRAY of speaker objects) carries only speakers — so `fetchSessionizePayload`
 * tries All first, falls back to Speakers, and `extractSpeakers` /
 * `extractSessions` accept whatever the payload holds. The id MUST be a
 * JSON-format endpoint; an embed id returns HTML, not JSON.
 *
 * Scope: two collections are mirrored, cross-referenced so each side embeds a
 * summary of the other:
 *   - `speakers` — the full speaker record, each carrying `sessions[]`
 *     ({ id, name, description }) resolved from the payload's top-level
 *     `sessions[]` via `buildSessionMap`.
 *   - `sessions` — the session record, each carrying `speakers[]`
 *     ({ id, fullName, tagLine, profilePicture }) resolved from the payload's
 *     top-level `speakers[]` via `buildSpeakerSummaryMap`.
 * Sessions are only present in the All view; a Speakers-view fallback yields an
 * empty session set, which the delete-guard preserves rather than wipes. The
 * All view's `rooms` / `categories` are still ignored — add a collection +
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

/**
 * Raw Sessionize session from the All view. In the All view a session's
 * `speakers` is an array of speaker GUID strings (grouped views may inline
 * `{ id, name }` objects instead — `resolveSessionSpeakers` handles both). Only
 * the fields we normalize are typed; the index signature keeps it open.
 */
export interface SessionizeSession {
	id?: string | number | null;
	title?: string | null;
	description?: string | null;
	startsAt?: string | null;
	endsAt?: string | null;
	room?: string | null;
	roomId?: string | number | null;
	isServiceSession?: boolean | null;
	isPlenumSession?: boolean | null;
	status?: string | null;
	speakers?: unknown[] | null;
	categoryItems?: unknown[] | null;
	questionAnswers?: unknown[] | null;
	liveUrl?: string | null;
	recordingUrl?: string | null;
	[key: string]: unknown;
}

/** The All-data envelope. Only `speakers` + `sessions` are consumed today. */
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

/** A talk resolved to its title + abstract. The All view gives a speaker only
 * session ids; the details live in the payload's top-level `sessions[]`, joined
 * here. */
export interface SpeakerSession {
	id: string;
	name: string;
	/** Talk abstract; may be empty (e.g. from the Speakers view). */
	description: string;
}

interface SessionDetail {
	name: string;
	description: string;
}

/**
 * The document written to Firestore `speakers/{id}` — the FULL Sessionize
 * speaker record. `links` is the sanitized + kind-mapped form (raw link URLs
 * are never persisted, so a `javascript:` href can't reach the DOM). `sessions`
 * are resolved to `{ id, name }` (title joined from the All payload). The other
 * relational arrays (`categories` / `questionAnswers`) are stored as-is for
 * downstream use; nothing renders them yet.
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
	sessions: SpeakerSession[];
	categories: unknown[];
	questionAnswers: unknown[];
}

/**
 * Compact speaker summary embedded on each session doc — the reverse of
 * `SpeakerSession`. Resolved from the payload's top-level `speakers[]` so a
 * sessions consumer can render presenter names/photos without a second read.
 */
export interface SessionSpeakerRef {
	/** Sessionize speaker GUID — matches a `speakers/{id}` doc. */
	id: string;
	fullName: string;
	/** Speaker tagline; may be empty. */
	tagLine: string;
	/** Absolute BunnyCDN URL; may be empty. */
	profilePicture: string;
}

/**
 * The document written to Firestore `sessions/{id}` — the Sessionize session
 * record with its `speakers[]` resolved to `SessionSpeakerRef` summaries
 * (cross-reference to the `speakers` collection). `categoryItems` /
 * `questionAnswers` are stored as-is for downstream use; nothing renders them
 * yet. Service sessions (breaks, lunch) are kept with an empty `speakers[]` and
 * `isServiceSession: true` so consumers can filter them out.
 */
export interface SessionDoc {
	/** Sessionize session id (stringified) — also the Firestore doc id. */
	id: string;
	/** Index in the Sessionize array; stable tiebreaker for `startsAt` sorts. */
	order: number;
	title: string;
	/** Talk abstract; may be empty. */
	description: string;
	/** ISO 8601 local start; may be empty before scheduling. */
	startsAt: string;
	/** ISO 8601 local end; may be empty before scheduling. */
	endsAt: string;
	/** Room name; may be empty before scheduling. */
	room: string;
	/** Room id (stringified); may be empty. */
	roomId: string;
	isServiceSession: boolean;
	isPlenumSession: boolean;
	/** Sessionize workflow status (e.g. `Accepted`); may be empty. */
	status: string;
	speakers: SessionSpeakerRef[];
	categoryItems: unknown[];
	questionAnswers: unknown[];
	/** Live-stream URL; may be empty. */
	liveUrl: string;
	/** Recording URL; may be empty. */
	recordingUrl: string;
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
 * Build an id→{title, abstract} map from the All payload's top-level
 * `sessions[]`. In the All view a speaker carries only session ids (e.g.
 * `[1282231]`); the title + abstract live here. Returns an empty map for the
 * Speakers view (a bare array), which already inlines `{ id, name }` on each
 * speaker (no abstract).
 */
export function buildSessionMap(payload: unknown): Map<string, SessionDetail> {
	const map = new Map<string, SessionDetail>();
	if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) return map;
	const sessions = (payload as SessionizeAll).sessions;
	if (!Array.isArray(sessions)) return map;
	for (const entry of sessions) {
		if (typeof entry !== 'object' || entry === null) continue;
		const record = entry as Record<string, unknown>;
		if (record.id == null) continue;
		const name = (
			(typeof record.title === 'string' && record.title) ||
			(typeof record.name === 'string' && record.name) ||
			''
		).trim();
		if (!name) continue;
		const description = (
			(typeof record.description === 'string' && record.description) ||
			(typeof record.abstract === 'string' && record.abstract) ||
			''
		).trim();
		map.set(String(record.id), { name, description });
	}
	return map;
}

/**
 * Resolve a speaker's `sessions` to `{ id, name, description }`, handling both
 * wire shapes: bare ids (All view) looked up in `sessionMap`, or inlined
 * `{ id, name/title, description }` objects (Speakers view). Sessions whose
 * title can't be resolved are dropped.
 */
function resolveSessions(raw: unknown, sessionMap: Map<string, SessionDetail>): SpeakerSession[] {
	if (!Array.isArray(raw)) return [];
	const out: SpeakerSession[] = [];
	for (const item of raw) {
		if (typeof item === 'number' || typeof item === 'string') {
			const id = String(item);
			const detail = sessionMap.get(id);
			if (detail?.name) out.push({ id, name: detail.name, description: detail.description });
			continue;
		}
		if (typeof item === 'object' && item !== null) {
			const record = item as Record<string, unknown>;
			const id = record.id != null ? String(record.id) : '';
			const detail = id ? sessionMap.get(id) : undefined;
			const name = (
				(typeof record.name === 'string' && record.name) ||
				(typeof record.title === 'string' && record.title) ||
				detail?.name ||
				''
			).trim();
			if (!name) continue;
			const description = (
				(typeof record.description === 'string' && record.description) ||
				detail?.description ||
				''
			).trim();
			out.push({ id, name, description });
		}
	}
	return out;
}

/**
 * Project one raw speaker into the persisted FULL doc shape. `order` is the
 * array index (unique per sync); missing scalars become empty strings / false
 * so the doc shape stays stable and `orderBy('order')` never omits a speaker.
 * `sessions` are resolved via `sessionMap`; other relational arrays are stored
 * as-is.
 */
export function normalizeSpeaker(
	raw: SessionizeSpeaker,
	index: number,
	sessionMap: Map<string, SessionDetail>,
): SpeakerDoc {
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
		sessions: resolveSessions(raw.sessions, sessionMap),
		categories: asArray(raw.categories),
		questionAnswers: asArray(raw.questionAnswers),
	};
}

export function normalizeSpeakers(
	raw: SessionizeSpeaker[],
	sessionMap: Map<string, SessionDetail> = new Map(),
): SpeakerDoc[] {
	return raw.map((speaker, index) => normalizeSpeaker(speaker, index, sessionMap));
}

// ── Sessions ────────────────────────────────────────────────────────────────
// The mirror image of the speaker path above: sessions carry speaker refs,
// speakers carry session refs. Sessions live only in the All view; the Speakers
// view (a bare array) has none, so the extract/normalize helpers below tolerate
// an absent/empty session set (returning []) — the delete-guard, not a throw,
// is what protects the live `sessions` collection from a truncated fetch.

/** The speaker fields embedded on each session doc. */
interface SpeakerSummary {
	fullName: string;
	tagLine: string;
	profilePicture: string;
}

/**
 * Build a speaker-GUID → summary map from the payload's top-level `speakers[]`.
 * Accepts either payload shape (the All object or the bare Speakers array) so a
 * session's speaker refs resolve to name/photo. Returns an empty map when no
 * speakers are present.
 */
export function buildSpeakerSummaryMap(payload: unknown): Map<string, SpeakerSummary> {
	const map = new Map<string, SpeakerSummary>();
	const speakers = Array.isArray(payload)
		? payload
		: typeof payload === 'object' && payload !== null
			? (payload as SessionizeAll).speakers
			: null;
	if (!Array.isArray(speakers)) return map;
	for (const entry of speakers) {
		if (typeof entry !== 'object' || entry === null) continue;
		const record = entry as Record<string, unknown>;
		if (record.id == null) continue;
		map.set(String(record.id), {
			fullName: asString(record.fullName),
			tagLine: asString(record.tagLine),
			profilePicture: asString(record.profilePicture),
		});
	}
	return map;
}

/**
 * Validate the sessions array from the All payload. Unlike `validateSpeakers`,
 * an ABSENT or EMPTY set is allowed (returns []): sessions are missing whenever
 * the endpoint served the Speakers view instead of All, and an event may have
 * no scheduled sessions yet — the delete-guard preserves the collection in both
 * cases. A present-but-malformed body still throws so garbage never mirrors.
 */
export function validateSessions(raw: unknown): SessionizeSession[] {
	if (raw == null) return [];
	if (!Array.isArray(raw)) {
		throw new Error('Sessionize sessions is not an array');
	}
	const seenIds = new Set<string>();
	for (const entry of raw) {
		if (typeof entry !== 'object' || entry === null) {
			throw new Error('Sessionize sessions contains a non-object entry');
		}
		const id = (entry as SessionizeSession).id;
		if ((typeof id !== 'string' && typeof id !== 'number') || String(id).trim() === '') {
			throw new Error('Sessionize sessions contains a session without an id');
		}
		// Doc id = session id, so a duplicate would silently overwrite one session
		// in the write batch (and collide its `order`). Abort instead of dropping.
		const key = String(id).trim();
		if (seenIds.has(key)) {
			throw new Error(`Sessionize sessions contains a duplicate session id: ${key}`);
		}
		seenIds.add(key);
	}
	return raw as SessionizeSession[];
}

/**
 * Pull the validated session list out of a Sessionize payload. Only the All
 * view (an OBJECT) carries sessions; the Speakers view (a bare ARRAY) has none,
 * so returns [] for it rather than throwing — the run still syncs speakers.
 */
export function extractSessions(payload: unknown): SessionizeSession[] {
	if (Array.isArray(payload)) return [];
	if (typeof payload === 'object' && payload !== null) {
		return validateSessions((payload as SessionizeAll).sessions);
	}
	return [];
}

/**
 * Resolve a session's `speakers` to `SessionSpeakerRef` summaries, handling both
 * wire shapes: bare GUID strings (All view) looked up in `speakerMap`, or
 * inlined `{ id, name }` objects (grouped views). Refs are deduped on id;
 * unresolved ids still keep the link (id + best-effort name) since the id alone
 * cross-references a `speakers/{id}` doc.
 */
function resolveSessionSpeakers(
	raw: unknown,
	speakerMap: Map<string, SpeakerSummary>,
): SessionSpeakerRef[] {
	if (!Array.isArray(raw)) return [];
	const out: SessionSpeakerRef[] = [];
	const seen = new Set<string>();
	for (const item of raw) {
		let id = '';
		let inlineName = '';
		if (typeof item === 'number' || typeof item === 'string') {
			id = String(item);
		} else if (typeof item === 'object' && item !== null) {
			const record = item as Record<string, unknown>;
			id = record.id != null ? String(record.id) : '';
			inlineName = asString(record.name) || asString(record.fullName);
		}
		if (!id || seen.has(id)) continue;
		seen.add(id);
		const summary = speakerMap.get(id);
		out.push({
			id,
			fullName: summary?.fullName || inlineName,
			tagLine: summary?.tagLine ?? '',
			profilePicture: summary?.profilePicture ?? '',
		});
	}
	return out;
}

/**
 * Project one raw session into the persisted doc shape. `order` is the array
 * index (stable tiebreaker for `startsAt` sorts); missing scalars become empty
 * strings / false so the doc shape stays stable. `speakers` are resolved via
 * `speakerMap`; `categoryItems` / `questionAnswers` are stored as-is.
 */
export function normalizeSession(
	raw: SessionizeSession,
	index: number,
	speakerMap: Map<string, SpeakerSummary>,
): SessionDoc {
	return {
		id: String(raw.id).trim(),
		order: index,
		title: asString(raw.title),
		description: asString(raw.description),
		startsAt: asString(raw.startsAt),
		endsAt: asString(raw.endsAt),
		room: asString(raw.room),
		roomId: raw.roomId != null ? String(raw.roomId).trim() : '',
		isServiceSession: raw.isServiceSession === true,
		isPlenumSession: raw.isPlenumSession === true,
		status: asString(raw.status),
		speakers: resolveSessionSpeakers(raw.speakers, speakerMap),
		categoryItems: asArray(raw.categoryItems),
		questionAnswers: asArray(raw.questionAnswers),
		liveUrl: asString(raw.liveUrl),
		recordingUrl: asString(raw.recordingUrl),
	};
}

export function normalizeSessions(
	raw: SessionizeSession[],
	speakerMap: Map<string, SpeakerSummary> = new Map(),
): SessionDoc[] {
	return raw.map((session, index) => normalizeSession(session, index, speakerMap));
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
 * Fetch + parse the full Sessionize payload. Sessionize endpoints are
 * provisioned per-view, so the configured id may serve the "All data" view, the
 * "Speakers" view, or both — try All first and fall back to Speakers on a
 * non-OK response. Only the All view carries sessions; a Speakers-view fallback
 * yields speakers but no sessions. Throws on network error, timeout, both views
 * failing, or a body that is not JSON, so the caller aborts without touching
 * Firestore.
 */
export async function fetchSessionizePayload(rawEndpointId: string): Promise<unknown> {
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
