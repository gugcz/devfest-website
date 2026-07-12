/**
 * Browser-safe session types + presentation helpers.
 *
 * The daily `refreshSessionize` Cloud Function (functions/src/sessionize/)
 * writes documents into the public-read Firestore `sessions` collection, each
 * embedding a summary of its presenters (`speakers[]`). The shapes here mirror
 * the subset of that `SessionDoc` the UI renders. Browser-safe: types and pure
 * helpers only — no Firebase import (the island wires the read via
 * `getFirestoreDb()`).
 *
 * ⚠️ Persisted shape lives in `functions/src/sessionize/sessionize-api.ts`
 * (`SessionDoc` / `SessionSpeakerRef`) — the two live across the src/ ↔
 * functions/ build boundary and share no package. Keep them in sync.
 */

/** A presenter embedded on a session — the reverse of a speaker's `sessions[]`.
 * `id` cross-references a `speakers/{id}` doc. */
export interface SessionSpeakerRef {
	id: string;
	fullName: string;
	/** May be empty — the row omits the tagline when so. */
	tagLine: string;
	/** Absolute BunnyCDN URL; may be empty (→ monogram fallback). */
	profilePicture: string;
}

/** A resolved category group on a session, e.g. `{ name: 'Track', values:
 * ['Web', 'AI/ML'] }`. Backs the session-list filter facets. */
export interface SessionCategory {
	name: string;
	values: string[];
}

export interface Session {
	/** Sessionize session id — also the Firestore doc id. */
	id: string;
	/** Sort key: index in the Sessionize array. */
	order: number;
	title: string;
	/** Full abstract; may be empty. */
	description: string;
	/** ISO 8601 start; may be empty before the agenda is scheduled. */
	startsAt: string;
	/** ISO 8601 end; may be empty before the agenda is scheduled. */
	endsAt: string;
	/** Room name; may be empty before the agenda is scheduled. */
	room: string;
	/** Breaks / lunch / registration — carry no speakers; filtered from the grid. */
	isServiceSession: boolean;
	speakers: SessionSpeakerRef[];
	/** Resolved Sessionize categories (Track / Level / Format …); may be empty. */
	categories: SessionCategory[];
}

function isString(value: unknown): value is string {
	return typeof value === 'string';
}

function asStr(value: unknown): string {
	return isString(value) ? value : '';
}

function coerceSpeaker(raw: unknown): SessionSpeakerRef | null {
	if (typeof raw !== 'object' || raw === null) return null;
	const record = raw as Record<string, unknown>;
	const id = record.id;
	if (!isString(id) || !id.trim()) return null;
	return {
		id,
		fullName: asStr(record.fullName),
		tagLine: asStr(record.tagLine),
		profilePicture: asStr(record.profilePicture),
	};
}

function coerceCategory(raw: unknown): SessionCategory | null {
	if (typeof raw !== 'object' || raw === null) return null;
	const record = raw as Record<string, unknown>;
	const name = asStr(record.name);
	const values = Array.isArray(record.values)
		? record.values.filter(isString).map((v) => v.trim()).filter(Boolean)
		: [];
	if (!name || values.length === 0) return null;
	return { name, values };
}

/**
 * Defensively coerce a Firestore document into a `Session`. The collection is
 * written only by `refreshSessionize`, but the client still normalizes so a
 * partially-shaped doc renders (or degrades) instead of throwing in the island.
 */
export function sessionFromDoc(id: string, data: Record<string, unknown>): Session {
	const speakers = Array.isArray(data.speakers)
		? (data.speakers.map(coerceSpeaker).filter(Boolean) as SessionSpeakerRef[])
		: [];
	const categories = Array.isArray(data.categories)
		? (data.categories.map(coerceCategory).filter(Boolean) as SessionCategory[])
		: [];
	return {
		id,
		order: typeof data.order === 'number' ? data.order : Number.MAX_SAFE_INTEGER,
		title: asStr(data.title),
		description: asStr(data.description),
		startsAt: asStr(data.startsAt),
		endsAt: asStr(data.endsAt),
		room: asStr(data.room),
		isServiceSession: data.isServiceSession === true,
		speakers,
		categories,
	};
}

/** A filter facet: one category group and every distinct value seen across the
 * session list, in first-seen order. */
export interface SessionFacet {
	name: string;
	values: string[];
}

/**
 * Collect the filter facets present across a session list — one per category
 * group, with the distinct values that actually occur (so the UI never offers a
 * chip that matches nothing). Groups/values keep first-seen order.
 */
export function collectFacets(sessions: Session[]): SessionFacet[] {
	const groups = new Map<string, Set<string>>();
	const order: string[] = [];
	for (const session of sessions) {
		for (const category of session.categories) {
			let set = groups.get(category.name);
			if (!set) {
				set = new Set<string>();
				groups.set(category.name, set);
				order.push(category.name);
			}
			for (const value of category.values) set.add(value);
		}
	}
	return order.map((name) => ({ name, values: Array.from(groups.get(name) ?? []) }));
}

/** Active filter selections: category-group name → chosen values. */
export type SessionFilters = Record<string, string[]>;

/** Lowercased haystack for the free-text search: title, abstract, speaker names,
 * category values. */
function searchHaystack(session: Session): string {
	return [
		session.title,
		session.description,
		...session.speakers.map((s) => s.fullName),
		...session.categories.flatMap((c) => c.values),
	]
		.join(' ')
		.toLowerCase();
}

/**
 * Match a session against the text query AND the selected facet values. Within a
 * group the selected values are OR-ed; across groups they are AND-ed (standard
 * faceted filtering). An empty query / no selections match everything.
 */
export function matchesFilters(session: Session, query: string, filters: SessionFilters): boolean {
	const q = query.trim().toLowerCase();
	if (q && !searchHaystack(session).includes(q)) return false;

	for (const [group, chosen] of Object.entries(filters)) {
		if (chosen.length === 0) continue;
		const category = session.categories.find((c) => c.name === group);
		const values = category?.values ?? [];
		if (!chosen.some((value) => values.includes(value))) return false;
	}
	return true;
}

/** True when any facet or search text is active — drives the "clear" affordance
 * and the filtered-empty copy. */
export function hasActiveFilters(query: string, filters: SessionFilters): boolean {
	return query.trim().length > 0 || Object.values(filters).some((v) => v.length > 0);
}

/** Only real talks belong in the public grid — drop service slots and any
 * doc left title-less by a partial sync. */
export function isDisplayableSession(session: Session): boolean {
	return !session.isServiceSession && session.title.trim().length > 0;
}
