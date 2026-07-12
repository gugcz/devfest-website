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

/**
 * Defensively coerce a Firestore document into a `Session`. The collection is
 * written only by `refreshSessionize`, but the client still normalizes so a
 * partially-shaped doc renders (or degrades) instead of throwing in the island.
 */
export function sessionFromDoc(id: string, data: Record<string, unknown>): Session {
	const speakers = Array.isArray(data.speakers)
		? (data.speakers.map(coerceSpeaker).filter(Boolean) as SessionSpeakerRef[])
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
	};
}

/** Only real talks belong in the public grid — drop service slots and any
 * doc left title-less by a partial sync. */
export function isDisplayableSession(session: Session): boolean {
	return !session.isServiceSession && session.title.trim().length > 0;
}

/**
 * Format a session's schedule slot for display, e.g. `Fri 30 Oct · 10:00–10:45`
 * or just `10:00–10:45` when both ends share a day. Returns `''` when no valid
 * start is set (the agenda isn't scheduled yet), so callers can omit the meta
 * line. Times render in the event's Europe/Prague zone regardless of the
 * viewer's locale.
 */
export function formatSessionTime(startsAt: string, endsAt: string): string {
	const start = parseDate(startsAt);
	if (!start) return '';
	const end = parseDate(endsAt);

	const day = new Intl.DateTimeFormat('en-GB', {
		weekday: 'short',
		day: 'numeric',
		month: 'short',
		timeZone: EVENT_TZ,
	}).format(start);
	const startTime = formatTime(start);
	if (!end) return `${day} · ${startTime}`;
	return `${day} · ${startTime}–${formatTime(end)}`;
}

const EVENT_TZ = 'Europe/Prague';

function parseDate(iso: string): Date | null {
	if (!iso.trim()) return null;
	const date = new Date(iso);
	return Number.isNaN(date.getTime()) ? null : date;
}

function formatTime(date: Date): string {
	return new Intl.DateTimeFormat('en-GB', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
		timeZone: EVENT_TZ,
	}).format(date);
}
