/**
 * Pure, framework-free helpers for the `/agenda` timetable. Isolated from the
 * React island for review clarity — the time math is the highest-risk part of
 * the feature (getting the time zone wrong silently shifts the whole schedule).
 * No test runner exists in this repo (see CLAUDE.md), so the real guard is the
 * manual Prague-vs-foreign-zone check in the plan; keeping the math here keeps
 * it reviewable.
 *
 * Time zone: Sessionize emits `startsAt`/`endsAt` as event-LOCAL ISO strings
 * (`2026-10-30T09:00:00`, no offset — verified against live `/api/lineup`). We
 * therefore read the wall-clock `HH:MM` straight off the string and never build
 * a `Date`, which would reinterpret a naive string in the visitor's zone and
 * shift every time. If Sessionize ever starts emitting an offset (`…+02:00`),
 * `parseLocalMinutes` ignores it (the persisted value is already Prague-local);
 * a true cross-zone value would instead need `Intl.DateTimeFormat` pinned to
 * `Europe/Prague`. The event is single-day, so a minutes-from-midnight model is
 * sufficient — the calendar date is not used for placement.
 */
import type { Session } from './sessions';

/** Assumed length of a session whose `endsAt` is missing or not after its start. */
const FALLBACK_DURATION_MIN = 30;
/** Floor on a rendered span so a lightning talk stays tall enough to read/tap. */
const MIN_SPAN_MIN = 15;

/** Column key used for talks that are timed but have no room assigned yet. */
const ROOM_TBA = 'Room TBA';

const TIME_RE = /T(\d{2}):(\d{2})/;

/**
 * Minutes from midnight for the wall-clock time in an event-local ISO string,
 * or `null` when the string is empty / unparseable. Reads the `HH:MM` directly
 * (no `Date`) so the result is the Prague wall-clock regardless of the
 * visitor's zone.
 */
export function parseLocalMinutes(iso: string): number | null {
	const match = TIME_RE.exec(iso);
	if (!match) return null;
	const hours = Number(match[1]);
	const minutes = Number(match[2]);
	if (hours > 23 || minutes > 59) return null;
	return hours * 60 + minutes;
}

/** Wall-clock label (`09:00`) for minutes-from-midnight. */
export function formatMinutes(total: number): string {
	const hours = Math.floor(total / 60);
	const minutes = total % 60;
	return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/** Wall-clock label (`09:00`) for an event-local ISO string; `''` when unset. */
export function formatClock(iso: string): string {
	const total = parseLocalMinutes(iso);
	return total === null ? '' : formatMinutes(total);
}

/** True when a session has a usable start time (and therefore a grid position). */
function isTimed(session: Session): boolean {
	return parseLocalMinutes(session.startsAt) !== null;
}

/** True when a session renders as a full-width band (break / lunch / keynote). */
export function isBand(session: Session): boolean {
	return session.isServiceSession || session.isPlenumSession;
}

/** A session placed on the day's timeline (minutes from midnight). */
export interface Placement {
	startMin: number;
	/** End used for layout: real end when after start, else start + fallback. */
	endMin: number;
	/** Rendered span, floored at {@link MIN_SPAN_MIN}. */
	spanMin: number;
}

/**
 * Compute a timed session's placement. Returns `null` for an untimed session.
 * A missing / non-positive duration falls back to {@link FALLBACK_DURATION_MIN};
 * the rendered span is floored at {@link MIN_SPAN_MIN}.
 */
export function placement(session: Session): Placement | null {
	const startMin = parseLocalMinutes(session.startsAt);
	if (startMin === null) return null;
	const rawEnd = parseLocalMinutes(session.endsAt);
	const endMin = rawEnd !== null && rawEnd > startMin ? rawEnd : startMin + FALLBACK_DURATION_MIN;
	const spanMin = Math.max(MIN_SPAN_MIN, endMin - startMin);
	return { startMin, endMin, spanMin };
}

/** Deterministic order for reading (mobile list + a11y): start time, then the
 * Sessionize array order as a stable tiebreaker. */
export function byStart(a: Session, b: Session): number {
	const sa = parseLocalMinutes(a.startsAt) ?? Number.MAX_SAFE_INTEGER;
	const sb = parseLocalMinutes(b.startsAt) ?? Number.MAX_SAFE_INTEGER;
	if (sa !== sb) return sa - sb;
	return a.order - b.order;
}

/**
 * The day's time bounds across every timed session (bands included), or `null`
 * when nothing is scheduled. `start` is the earliest start; `end` is the latest
 * layout end (fallback-adjusted).
 */
export function dayRange(sessions: Session[]): { start: number; end: number } | null {
	let start = Number.POSITIVE_INFINITY;
	let end = Number.NEGATIVE_INFINITY;
	for (const session of sessions) {
		const place = placement(session);
		if (!place) continue;
		if (place.startMin < start) start = place.startMin;
		if (place.endMin > end) end = place.endMin;
	}
	return end > start ? { start, end } : null;
}

/**
 * Distinct room names for the grid's columns, in first-seen order across timed,
 * non-band talks sorted by start. Talks with no room are excluded (they get the
 * {@link ROOM_TBA} column instead, added by {@link partitionAgenda}).
 */
function roomColumns(sessions: Session[]): string[] {
	const seen = new Set<string>();
	const columns: string[] = [];
	for (const session of [...sessions].sort(byStart)) {
		if (!isTimed(session) || isBand(session)) continue;
		const room = session.room.trim();
		if (!room || seen.has(room)) continue;
		seen.add(room);
		columns.push(room);
	}
	return columns;
}

/** The agenda split into its render groups. */
export interface AgendaPartition {
	/** Column order for the grid (real rooms, then a `Room TBA` column if used). */
	columns: string[];
	/** Timed service / plenum sessions (full-width bands), sorted by start. */
	bands: Session[];
	/** Timed talks per room column, each list sorted by start. */
	byRoom: Map<string, Session[]>;
	/** Timed talks with no room, sorted by start (rendered in the TBA column). */
	roomTba: Session[];
	/** Displayable sessions without a start time, sorted by array order. */
	unscheduled: Session[];
}

/**
 * Partition agenda sessions into bands, per-room talk lists, a Room-TBA list,
 * and the not-yet-scheduled remainder. Input is expected to be
 * `isAgendaSession`-filtered (title present; service + plenum kept).
 */
export function partitionAgenda(sessions: Session[]): AgendaPartition {
	const columns = roomColumns(sessions);
	const byRoom = new Map<string, Session[]>();
	for (const room of columns) byRoom.set(room, []);

	const bands: Session[] = [];
	const roomTba: Session[] = [];
	const unscheduled: Session[] = [];

	for (const session of sessions) {
		if (!isTimed(session)) {
			unscheduled.push(session);
			continue;
		}
		if (isBand(session)) {
			bands.push(session);
			continue;
		}
		const room = session.room.trim();
		if (room) {
			byRoom.get(room)?.push(session);
		} else {
			roomTba.push(session);
		}
	}

	bands.sort(byStart);
	roomTba.sort(byStart);
	unscheduled.sort((a, b) => a.order - b.order);
	for (const list of byRoom.values()) list.sort(byStart);

	const finalColumns = roomTba.length > 0 ? [...columns, ROOM_TBA] : columns;
	if (roomTba.length > 0) byRoom.set(ROOM_TBA, roomTba);

	return { columns: finalColumns, bands, byRoom, roomTba, unscheduled };
}

/** Event date (`YYYY-MM-DD`) taken from the first timed session, or '' when
 * nothing is scheduled. Single-day assumption (see the module header). */
export function eventDateISO(sessions: Session[]): string {
	for (const session of sessions) {
		const match = /^(\d{4}-\d{2}-\d{2})/.exec(session.startsAt);
		if (match) return match[1];
	}
	return '';
}

/** Which sessions are happening now, and — during a pause — which start next. */
export interface NowState {
	/** Session ids currently spanning `nowMin` (talks and bands). */
	liveIds: Set<string>;
	/** When no talk is live (a pause/break), the id(s) of the next talk(s) to
	 * start; empty while a talk is live or when nothing is scheduled. */
	comingUpIds: Set<string>;
}

/**
 * Classify sessions against the current minute-of-day. A session is "live" when
 * `nowMin` falls in its [start, end). "Coming up" only applies during a pause —
 * when no talk is live — and marks the next talk(s) to start (bands never count
 * as coming up). `nowMin === null` (not event day) yields empty sets.
 */
export function nowState(sessions: Session[], nowMin: number | null): NowState {
	const liveIds = new Set<string>();
	const comingUpIds = new Set<string>();
	if (nowMin === null) return { liveIds, comingUpIds };

	let talkLive = false;
	for (const session of sessions) {
		const place = placement(session);
		if (!place) continue;
		if (place.startMin <= nowMin && nowMin < place.endMin) {
			liveIds.add(session.id);
			if (!isBand(session)) talkLive = true;
		}
	}

	if (!talkLive) {
		let soonest = Number.POSITIVE_INFINITY;
		for (const session of sessions) {
			if (isBand(session)) continue;
			const place = placement(session);
			if (place && place.startMin > nowMin && place.startMin < soonest) soonest = place.startMin;
		}
		if (Number.isFinite(soonest)) {
			for (const session of sessions) {
				if (isBand(session)) continue;
				const place = placement(session);
				if (place && place.startMin === soonest) comingUpIds.add(session.id);
			}
		}
	}

	return { liveIds, comingUpIds };
}
