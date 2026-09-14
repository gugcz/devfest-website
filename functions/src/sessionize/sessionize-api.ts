/**
 * Sessionize "All data" client + pure normalization helpers.
 * `refreshSessionizeScheduled` mirrors Sessionize into Firestore daily; the
 * browser never calls Sessionize.
 *
 * Endpoint: https://sessionize.com/api/v2/<id>/view/<View> (no auth, GET,
 * server-cached ~5 min). Endpoints are per-view: an id serves only the view(s)
 * it was created for; any other view returns a 400 HTML page. "All data" is an
 * OBJECT (`{ speakers, sessions, rooms, categories, questions }`); "Speakers"
 * is a bare ARRAY. `fetchSessionizePayload` tries All, then falls back to
 * Speakers; extractors accept either. The id MUST be a JSON endpoint — an
 * embed id returns HTML.
 *
 * Two cross-referenced collections: `speakers` (with `sessions[]`) and
 * `sessions` (with `speakers[]`). Sessions exist only in the All view; a
 * Speakers-view fallback yields an empty session set, which the delete-guard
 * preserves. `rooms[]` is only an id → name lookup (`buildRoomMap`).
 *
 * Fetch/validate/normalize and delete-guard logic is pure and exported so the
 * highest-risk path (a truncated response must never wipe a live collection)
 * stays reviewable.
 */

import { describeError } from '../lib/errors.js';
import { errorBody, fetchWithRetry } from '../lib/http.js';

const SESSIONIZE_API_BASE = 'https://sessionize.com/api/v2';

export interface SessionizeLink {
	title?: string | null;
	url?: string | null;
	linkType?: string | null;
}

/** Raw Sessionize speaker (All view). Only normalized fields are typed; the
 * index signature keeps the object open. */
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

/** Raw Sessionize session (All view). `speakers` is an array of GUID strings
 * (grouped views may inline `{ id, name }` — `resolveSessionSpeakers` handles
 * both). Only normalized fields are typed. */
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

/** The All-data envelope. `rooms` + `categories` are consumed as id → label
 * lookups for the sessions; `questions` is unused. */
export interface SessionizeAll {
	speakers?: unknown;
	sessions?: unknown;
	rooms?: unknown;
	categories?: unknown;
	questions?: unknown;
}

/**
 * Canonical link kinds. The browser maps each to an icon; unknown Sessionize
 * link types collapse to `web` (globe) so nothing renders blank.
 *
 * ⚠️ Keep in sync with `src/lib/speakers.ts` (`SpeakerLinkKind`,
 * `KNOWN_KINDS`, `SPEAKER_ICON_PATHS`) — functions/ and src/ share no package.
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

export interface SpeakerLink {
	kind: SpeakerLinkKind;
	url: string;
	label: string;
}

/** A talk resolved to title + abstract. The All view gives a speaker only
 * session ids; details are joined from the top-level `sessions[]`. */
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
 * Firestore `speakers/{id}` doc. `links` is sanitized + kind-mapped (raw URLs
 * never persisted, so a `javascript:` href can't reach the DOM). `sessions`
 * resolve to `{ id, name }`. Raw `categories` and `questionAnswers` are dropped:
 * this doc is served verbatim by public `/api/lineup`, and `questionAnswers`
 * can carry private survey data. The writer stamps `syncedAt` (see
 * `commitCollection`).
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
}

/** Compact speaker summary embedded on each session doc (reverse of
 * `SpeakerSession`), so a sessions consumer renders presenters without a
 * second read. */
export interface SessionSpeakerRef {
	/** Sessionize speaker GUID — matches a `speakers/{id}` doc. */
	id: string;
	fullName: string;
	tagLine: string;
	profilePicture: string;
}

/** A resolved category group on a session, e.g. `{ name: 'Track', values:
 * ['Web', 'AI/ML'] }`. Sessionize gives only flat `categoryItems` ids;
 * `buildCategoryMap` resolves them. Backs the session filters. */
export interface SessionCategory {
	name: string;
	values: string[];
}

/**
 * Firestore `sessions/{id}` doc. `speakers[]` resolved to `SessionSpeakerRef`,
 * `categoryItems` resolved to `categories`. Raw `questionAnswers` dropped (doc
 * is served verbatim by public `/api/lineup`). Service sessions (breaks,
 * lunch) are kept with empty `speakers[]` and `isServiceSession: true`. The
 * writer stamps `syncedAt` (see `commitCollection`).
 */
export interface SessionDoc {
	/** Sessionize session id (stringified) — also the Firestore doc id. */
	id: string;
	/** Index in the Sessionize array; stable tiebreaker for `startsAt` sorts. */
	order: number;
	title: string;
	description: string;
	/** ISO 8601 local start / end; may be empty before scheduling. */
	startsAt: string;
	endsAt: string;
	room: string;
	roomId: string;
	isServiceSession: boolean;
	isPlenumSession: boolean;
	/** Sessionize workflow status (e.g. `Accepted`); may be empty. */
	status: string;
	speakers: SessionSpeakerRef[];
	categories: SessionCategory[];
	liveUrl: string;
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

/** Map a Sessionize `linkType` (`Twitter`, `LinkedIn`, `Blog`,
 * `Company_Website`, `Other_Link`, …) to a canonical kind; unmapped → `web`. */
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

/** Return the url only when it is a valid http(s) URL — blocks `javascript:`
 * and other schemes in user-authored profile data. Embedded userinfo
 * (`user:pass@`) is stripped. */
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
	// Dedupe on kind+url: duplicate icons would also collide React keys.
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

/** Validate the speakers array. Throws unless it is a non-empty array of
 * objects with unique string `id`s — a malformed body aborts the sync. */
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
		// Doc id = speaker id; a duplicate would silently overwrite in the batch.
		const key = id.trim();
		if (seenIds.has(key)) {
			throw new Error(`Sessionize speakers contains a duplicate speaker id: ${key}`);
		}
		seenIds.add(key);
	}
	return raw as SessionizeSpeaker[];
}

/** Pull the validated speaker list from either payload shape (All view
 * object or Speakers view array). Throws on anything else so the caller aborts
 * without writing. */
export function extractSpeakers(payload: unknown): SessionizeSpeaker[] {
	if (Array.isArray(payload)) {
		return validateSpeakers(payload);
	}
	if (typeof payload === 'object' && payload !== null) {
		return validateSpeakers((payload as SessionizeAll).speakers);
	}
	throw new Error('Sessionize payload is neither an array nor an object');
}

/** Build id → { title, abstract } from the All payload's top-level
 * `sessions[]`. Empty map for the Speakers view, which inlines `{ id, name }`
 * on each speaker. */
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

/** Resolve a speaker's `sessions` to `{ id, name, description }` from bare
 * ids (All view, via `sessionMap`) or inlined objects (Speakers view).
 * Unresolvable titles are dropped. */
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
 * Project a raw speaker into the persisted doc. `order` = array index; missing
 * scalars become '' / false so the shape stays stable. `profilePicture` is
 * replaced by the Storage mirror URL from `imageMap` when present (see
 * `mirror-images.ts`).
 */
export function normalizeSpeaker(
	raw: SessionizeSpeaker,
	index: number,
	sessionMap: Map<string, SessionDetail>,
	imageMap: Map<string, string> = new Map(),
): SpeakerDoc {
	const id = (raw.id as string).trim();
	return {
		id,
		order: index,
		firstName: asString(raw.firstName),
		lastName: asString(raw.lastName),
		fullName: asString(raw.fullName),
		bio: asString(raw.bio),
		tagLine: asString(raw.tagLine),
		profilePicture: imageMap.get(id) || asString(raw.profilePicture),
		isTopSpeaker: raw.isTopSpeaker === true,
		links: normalizeLinks(raw.links),
		sessions: resolveSessions(raw.sessions, sessionMap),
	};
}

export function normalizeSpeakers(
	raw: SessionizeSpeaker[],
	sessionMap: Map<string, SessionDetail> = new Map(),
	imageMap: Map<string, string> = new Map(),
): SpeakerDoc[] {
	return raw.map((speaker, index) => normalizeSpeaker(speaker, index, sessionMap, imageMap));
}

// ── Sessions ────────────────────────────────────────────────────────────────
// Mirror of the speaker path. Sessions live only in the All view, so these
// helpers tolerate an absent/empty set (return []) — the delete-guard, not a
// throw, protects the live collection.

interface SpeakerSummary {
	fullName: string;
	tagLine: string;
	profilePicture: string;
}

/** Build speaker GUID → summary from the All payload's `speakers[]`. Empty
 * map for a non-All payload. `profilePicture` uses the Storage mirror URL
 * from `imageMap` when present. */
export function buildSpeakerSummaryMap(
	payload: unknown,
	imageMap: Map<string, string> = new Map(),
): Map<string, SpeakerSummary> {
	const map = new Map<string, SpeakerSummary>();
	if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) return map;
	const speakers = (payload as SessionizeAll).speakers;
	if (!Array.isArray(speakers)) return map;
	for (const entry of speakers) {
		if (typeof entry !== 'object' || entry === null) continue;
		const record = entry as Record<string, unknown>;
		if (record.id == null) continue;
		const id = String(record.id);
		map.set(id, {
			fullName: asString(record.fullName),
			tagLine: asString(record.tagLine),
			profilePicture: imageMap.get(id) || asString(record.profilePicture),
		});
	}
	return map;
}

/** Validate the sessions array. Unlike `validateSpeakers`, absent or empty is
 * allowed (returns []) — Speakers-view fallback, or no sessions scheduled yet;
 * the delete-guard preserves the collection. Present-but-malformed throws. */
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
		// Doc id = session id; a duplicate would silently overwrite in the batch.
		const key = String(id).trim();
		if (seenIds.has(key)) {
			throw new Error(`Sessionize sessions contains a duplicate session id: ${key}`);
		}
		seenIds.add(key);
	}
	return raw as SessionizeSession[];
}

/** Pull the validated session list. Returns [] for the Speakers view (bare
 * array) rather than throwing — the run still syncs speakers. */
export function extractSessions(payload: unknown): SessionizeSession[] {
	if (Array.isArray(payload)) return [];
	if (typeof payload === 'object' && payload !== null) {
		return validateSessions((payload as SessionizeAll).sessions);
	}
	return [];
}

/** Resolve a session's `speakers` (bare GUIDs via `speakerMap`, or inlined
 * `{ id, name }`) to `SessionSpeakerRef` summaries, deduped on id. */
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
 * Build roomId → name from the All payload's `rooms[]`.
 *
 * Our event ships sessions with `roomId` set and `room` EMPTY. Without this
 * lookup every talk persisted `room: ''`, so `/agenda` saw one Room-TBA column
 * and fell back to the stacked list instead of the time × room grid.
 */
export function buildRoomMap(payload: unknown): Map<string, string> {
	const map = new Map<string, string>();
	if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) return map;
	const rooms = (payload as SessionizeAll).rooms;
	if (!Array.isArray(rooms)) return map;
	for (const room of rooms) {
		if (typeof room !== 'object' || room === null) continue;
		const record = room as Record<string, unknown>;
		if (record.id == null) continue;
		const name = asString(record.name) || asString(record.title);
		if (!name) continue;
		map.set(String(record.id), name);
	}
	return map;
}

/** A category item resolved to its group title + label. */
interface CategoryItem {
	group: string;
	name: string;
}

/** Build itemId → { group, name } from the All payload's `categories[]`
 * (`[{ title, items: [{ id, name }] }]`). Empty map when none configured or
 * for a non-All payload. */
export function buildCategoryMap(payload: unknown): Map<string, CategoryItem> {
	const map = new Map<string, CategoryItem>();
	if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) return map;
	const categories = (payload as SessionizeAll).categories;
	if (!Array.isArray(categories)) return map;
	for (const group of categories) {
		if (typeof group !== 'object' || group === null) continue;
		const record = group as Record<string, unknown>;
		const groupName = asString(record.title) || asString(record.name);
		const items = record.items;
		if (!Array.isArray(items)) continue;
		for (const item of items) {
			if (typeof item !== 'object' || item === null) continue;
			const itemRecord = item as Record<string, unknown>;
			if (itemRecord.id == null) continue;
			const name = asString(itemRecord.name) || asString(itemRecord.title);
			if (!name) continue;
			map.set(String(itemRecord.id), { group: groupName, name });
		}
	}
	return map;
}

/** Resolve flat `categoryItems` ids into grouped `SessionCategory[]`
 * (first-seen group order, labels deduped). Unknown ids skipped; inlined
 * `{ name }` objects tolerated. */
function resolveSessionCategories(
	raw: unknown,
	categoryMap: Map<string, CategoryItem>,
): SessionCategory[] {
	if (!Array.isArray(raw)) return [];
	const groups = new Map<string, Set<string>>();
	const order: string[] = [];
	const add = (group: string, name: string) => {
		if (!name) return;
		let set = groups.get(group);
		if (!set) {
			set = new Set<string>();
			groups.set(group, set);
			order.push(group);
		}
		set.add(name);
	};
	for (const item of raw) {
		if (typeof item === 'number' || typeof item === 'string') {
			const resolved = categoryMap.get(String(item));
			if (resolved) add(resolved.group, resolved.name);
			continue;
		}
		if (typeof item === 'object' && item !== null) {
			const record = item as Record<string, unknown>;
			const resolved = record.id != null ? categoryMap.get(String(record.id)) : undefined;
			const name = resolved?.name || asString(record.name) || asString(record.title);
			add(resolved?.group ?? '', name);
		}
	}
	return order.map((group) => ({ name: group, values: Array.from(groups.get(group) ?? []) }));
}

/** Project a raw session into the persisted doc. `order` = array index
 * (tiebreaker for `startsAt` sorts); missing scalars become '' / false.
 * `speakers` / `categoryItems` / `roomId` resolved via the maps. */
export function normalizeSession(
	raw: SessionizeSession,
	index: number,
	speakerMap: Map<string, SpeakerSummary>,
	categoryMap: Map<string, CategoryItem>,
	roomMap: Map<string, string> = new Map(),
): SessionDoc {
	const roomId = raw.roomId != null ? String(raw.roomId).trim() : '';
	return {
		id: String(raw.id).trim(),
		order: index,
		title: asString(raw.title),
		description: asString(raw.description),
		startsAt: asString(raw.startsAt),
		endsAt: asString(raw.endsAt),
		// The inline name when Sessionize sends one, else the `rooms[]` lookup.
		room: asString(raw.room) || roomMap.get(roomId) || '',
		roomId,
		isServiceSession: raw.isServiceSession === true,
		isPlenumSession: raw.isPlenumSession === true,
		status: asString(raw.status),
		speakers: resolveSessionSpeakers(raw.speakers, speakerMap),
		categories: resolveSessionCategories(raw.categoryItems, categoryMap),
		liveUrl: asString(raw.liveUrl),
		recordingUrl: asString(raw.recordingUrl),
	};
}

export function normalizeSessions(
	raw: SessionizeSession[],
	speakerMap: Map<string, SpeakerSummary> = new Map(),
	categoryMap: Map<string, CategoryItem> = new Map(),
	roomMap: Map<string, string> = new Map(),
): SessionDoc[] {
	return raw.map((session, index) =>
		normalizeSession(session, index, speakerMap, categoryMap, roomMap),
	);
}

/** Extract the bare endpoint id from the secret. Accepts a full Sessionize
 * URL too (`https://sessionize.com/api/v2/<id>[/view/All]`) — base and
 * `/view/<View>` are added here, so a URL would otherwise double the path. */
export function parseEndpointId(raw: string | null | undefined): string {
	const trimmed = (raw ?? '').trim();
	if (!trimmed) return '';
	// Full Sessionize URL, with or without a trailing /view/<View>.
	const match = trimmed.match(/sessionize\.com\/api\/v2\/([^/\s?#]+)/i);
	if (match) return match[1];
	// Bare id, possibly with a trailing "/view/…", query, or slash.
	return trimmed.replace(/[/?#].*$/, '');
}

/** GET one Sessionize view with retries (a transient fault here once cost a
 * whole day of lineup freshness). Non-OK responses are returned as-is so the
 * caller can fall back to the Speakers view on the deterministic 400. */
async function fetchView(endpointId: string, view: string): Promise<Response> {
	return fetchWithRetry(
		`${SESSIONIZE_API_BASE}/${endpointId}/view/${view}`,
		{ headers: { Accept: 'application/json' } },
		{ label: `Sessionize ${view} view` },
	);
}

/** Fetch + parse the Sessionize payload: try All, fall back to Speakers on
 * non-OK. Throws when both fail or the body is not JSON, so the caller aborts
 * without touching Firestore. */
export async function fetchSessionizePayload(rawEndpointId: string): Promise<unknown> {
	const endpointId = parseEndpointId(rawEndpointId);
	if (!endpointId) throw new Error('Missing or empty Sessionize endpoint id');

	let res = await fetchView(endpointId, 'All');
	if (!res.ok) {
		const allStatus = res.status;
		res = await fetchView(endpointId, 'Speakers');
		if (!res.ok) {
			throw new Error(
				`Sessionize API rejected both views for id "${endpointId}" (All=${allStatus}, Speakers=${res.status} ${res.statusText}): ${await errorBody(res, 200)}`,
			);
		}
	}

	try {
		return await res.json();
	} catch (err) {
		// Almost always an embed id returning HTML — say so, or it reads as an outage.
		throw new Error(
			`Sessionize response was not valid JSON (is "${endpointId}" a JSON API endpoint id?): ${describeError(err)}`,
			{ cause: err },
		);
	}
}

/** Max fraction of the collection one run may delete before the fetch is
 * treated as truncated and deletes are withheld. */
export const MAX_DELETE_FRACTION = 0.5;

export interface DeletePlan {
	/** Doc ids to delete this run (empty when withheld). */
	toDelete: string[];
	/** True when the delete set was suppressed by the guard. */
	withheld: boolean;
}

/** Decide which stale docs to delete. Withheld when they would remove more
 * than `MAX_DELETE_FRACTION` of a non-empty collection. Upserts always proceed. */
export function computeDeletePlan(existingIds: string[], freshIds: Set<string>): DeletePlan {
	const stale = existingIds.filter((id) => !freshIds.has(id));

	// An empty fresh set is caught too: every id is stale, ratio = 1, withheld.
	if (existingIds.length > 0 && stale.length / existingIds.length > MAX_DELETE_FRACTION) {
		return { toDelete: [], withheld: stale.length > 0 };
	}
	return { toDelete: stale, withheld: false };
}
