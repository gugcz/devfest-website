/**
 * Pure, framework-free helpers for the `/agenda` timetable. The time math lives
 * here rather than in the island because getting the zone wrong silently shifts
 * the whole schedule.
 *
 * Two shapes come off the wire and both must land on the Prague wall clock:
 *
 * - a NAIVE event-local string (`2026-10-30T09:00:00`, no offset) — read the
 *   `HH:MM` straight off the string, never through a `Date`, which would
 *   reinterpret it in the visitor's zone;
 * - a ZONED string (`2026-10-30T08:00:00Z`, or an explicit offset) — an instant,
 *   which must go through `Intl.DateTimeFormat` pinned to `Europe/Prague`.
 *   Reading `HH:MM` off one of these is what put the whole day an hour early:
 *   the schedule is stored in UTC, so `08:00Z` rendered as 08:00 instead of the
 *   09:00 the room actually starts at.
 *
 * The event is single-day, so minutes-from-midnight is enough for placement.
 */
import type { Session } from './sessions';

/** Assumed length of a session whose `endsAt` is missing or not after its start. */
const FALLBACK_DURATION_MIN = 30;
const MINUTES_PER_DAY = 24 * 60;
/** Floor on a rendered span so a lightning talk stays tall enough to read/tap. */
const MIN_SPAN_MIN = 15;

/** Label for the column holding talks that are timed but have no room at all. */
const ROOM_TBA = 'Room TBA';

/**
 * A grid column: the value talks are grouped by, and what heads the column.
 *
 * Grouping is by `roomId`, not by the room NAME. Sessionize sends a scheduled
 * session an empty `room` and only the id, so keying on the name collapsed the
 * whole day into one Room-TBA column — which is what made `/agenda` fall back
 * to the stacked list on desktop. The name is used for the heading whenever
 * Sessionize does send one; otherwise the columns are numbered in the order
 * they first appear, which at least tells a visitor the tracks run in parallel.
 */
export interface AgendaColumn {
	key: string;
	label: string;
}

/**
 * The value a talk is grouped by: its room id, falling back to the room name
 * for data that carries a name and no id. `''` means no room at all.
 */
export function roomKey(session: Session): string {
	return session.roomId.trim() || session.room.trim();
}

const TIME_RE = /T(\d{2}):(\d{2})/;
const DATE_RE = /^(\d{4}-\d{2}-\d{2})/;
/** Trailing `Z` or `±HH[:]MM` — the string is an instant, not a wall clock. */
const ZONED_RE = /(?:Z|[+-]\d{2}:?\d{2})$/i;

const PRAGUE_PARTS = new Intl.DateTimeFormat('en-CA', {
	timeZone: 'Europe/Prague',
	year: 'numeric',
	month: '2-digit',
	day: '2-digit',
	hour: '2-digit',
	minute: '2-digit',
	hourCycle: 'h23',
});

/**
 * The Prague wall clock for an ISO string: `{ date: 'YYYY-MM-DD', minutes }`,
 * or `null` when the string is empty / unparseable. A naive string is already a
 * wall clock and is read as-is; a zoned one is converted (see the module header).
 */
function pragueParts(iso: string): { date: string; minutes: number } | null {
	if (!iso) return null;

	if (ZONED_RE.test(iso)) {
		const at = new Date(iso);
		if (Number.isNaN(at.getTime())) return null;
		const parts = PRAGUE_PARTS.formatToParts(at);
		const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
		const hours = Number(get('hour'));
		const minutes = Number(get('minute'));
		if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
		return {
			date: `${get('year')}-${get('month')}-${get('day')}`,
			minutes: hours * 60 + minutes,
		};
	}

	const time = TIME_RE.exec(iso);
	if (!time) return null;
	const hours = Number(time[1]);
	const minutes = Number(time[2]);
	if (hours > 23 || minutes > 59) return null;
	return { date: DATE_RE.exec(iso)?.[1] ?? '', minutes: hours * 60 + minutes };
}

/**
 * Minutes from midnight of the Prague wall clock for an ISO string, or `null`
 * when the string is empty / unparseable — the visitor's own zone never enters
 * into it.
 */
export function parseLocalMinutes(iso: string): number | null {
	return pragueParts(iso)?.minutes ?? null;
}

/** Wall-clock label (`09:00`) for minutes-from-midnight. Past-midnight values
 * wrap (the afterparty's 1440 is `00:00`, not `24:00`). */
export function formatMinutes(total: number): string {
	const wrapped = ((total % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
	const hours = Math.floor(wrapped / 60);
	const minutes = wrapped % 60;
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

/**
 * True when a session renders as a full-width band (break / lunch / keynote).
 *
 * A plenum session always is one. A service session only is one when it has no
 * room: a room-scoped placeholder ("TBD Talk" held in one track) is a cell in
 * its own column — as a band it would stripe across the sheet and bury the real
 * talk running opposite it.
 */
export function isBand(session: Session): boolean {
	return session.isPlenumSession || (session.isServiceSession && !roomKey(session));
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
	const start = pragueParts(session.startsAt);
	if (start === null) return null;
	const end = pragueParts(session.endsAt);

	// An end past midnight (the afterparty finishes at 00:00) is a SMALLER
	// minutes-from-midnight than its start, which read as "no duration" and
	// silently shrank the session to the fallback. Carry the day difference so
	// the end stays after the start; `formatMinutes` wraps it back for display.
	let rawEnd = end?.minutes ?? null;
	if (end !== null && rawEnd !== null && rawEnd <= start.minutes && end.date > start.date) {
		rawEnd += MINUTES_PER_DAY;
	}

	const startMin = start.minutes;
	const endMin =
		rawEnd !== null && rawEnd > startMin ? rawEnd : startMin + FALLBACK_DURATION_MIN;
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

/** Every timed session's placement, keyed by id. Untimed sessions are absent. */
export function placements(sessions: Session[]): Map<string, Placement> {
	const map = new Map<string, Placement>();
	for (const session of sessions) {
		const place = placement(session);
		if (place) map.set(session.id, place);
	}
	return map;
}

/** A stretch of the day with nothing on it in ANY room, in minutes. */
export interface IdleSpan {
	startMin: number;
	endMin: number;
}

/**
 * The stretches of `range` that no session occupies — the sheet's dead time.
 *
 * The grid draws these hatched, the way it draws a break: on a proportional
 * timetable an empty half-hour is otherwise indistinguishable from a half-hour
 * whose talks simply haven't been announced, and the ruling made free time read
 * as scheduled. A room sitting idle while another room runs a talk is NOT dead
 * time — only a span where the whole day is quiet counts.
 */
export function idleSpans(
	sessions: Session[],
	range: { start: number; end: number },
	placements: Map<string, Placement>,
): IdleSpan[] {
	const busy: IdleSpan[] = [];
	for (const session of sessions) {
		const place = placements.get(session.id);
		if (!place) continue;
		busy.push({ startMin: place.startMin, endMin: place.endMin });
	}
	busy.sort((a, b) => a.startMin - b.startMin);

	const spans: IdleSpan[] = [];
	let cursor = range.start;
	for (const span of busy) {
		if (span.startMin > cursor) spans.push({ startMin: cursor, endMin: Math.min(span.startMin, range.end) });
		if (span.endMin > cursor) cursor = span.endMin;
		if (cursor >= range.end) break;
	}
	if (cursor < range.end) spans.push({ startMin: cursor, endMin: range.end });

	return spans.filter((span) => span.endMin > span.startMin);
}

/**
 * The day's time bounds across every timed session (bands included), or `null`
 * when nothing is scheduled. `start` is the earliest start; `end` is the latest
 * layout end (fallback-adjusted).
 */
export function dayRange(sessions: Session[]): { start: number; end: number } | null {
	let start = Number.POSITIVE_INFINITY;
	let end = Number.NEGATIVE_INFINITY;
	for (const place of placements(sessions).values()) {
		if (place.startMin < start) start = place.startMin;
		if (place.endMin > end) end = place.endMin;
	}
	return end > start ? { start, end } : null;
}

/**
 * The grid's columns, in first-seen order across timed, non-band talks sorted
 * by start. Room-less talks are excluded (they get the {@link ROOM_TBA} column
 * instead, added by {@link partitionAgenda}). A column with no name from
 * Sessionize is numbered by its position.
 */
function roomColumns(sessions: Session[]): AgendaColumn[] {
	const labels = new Map<string, string>();
	for (const session of [...sessions].sort(byStart)) {
		if (!isTimed(session) || isBand(session)) continue;
		const key = roomKey(session);
		if (!key) continue;
		const name = session.room.trim();
		// First seen wins the slot; a later name fills in for an unnamed column.
		if (!labels.has(key) || (name && !labels.get(key))) labels.set(key, name);
	}
	return Array.from(labels, ([key, name], index) => ({
		key,
		label: name || `Room ${index + 1}`,
	}));
}

/** The agenda split into its render groups. */
export interface AgendaPartition {
	/** Column order for the grid (real rooms, then a `Room TBA` column if used). */
	columns: AgendaColumn[];
	/** Timed service / plenum sessions (full-width bands), sorted by start. */
	bands: Session[];
	/** Timed talks per room column, keyed by the column's `key`, sorted by start. */
	byRoom: Map<string, Session[]>;
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
	for (const column of columns) byRoom.set(column.key, []);

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
		const key = roomKey(session);
		if (key) {
			byRoom.get(key)?.push(session);
		} else {
			roomTba.push(session);
		}
	}

	bands.sort(byStart);
	roomTba.sort(byStart);
	unscheduled.sort((a, b) => a.order - b.order);
	for (const list of byRoom.values()) list.sort(byStart);

	const finalColumns =
		roomTba.length > 0 ? [...columns, { key: ROOM_TBA, label: ROOM_TBA }] : columns;
	if (roomTba.length > 0) byRoom.set(ROOM_TBA, roomTba);

	return { columns: finalColumns, bands, byRoom, unscheduled };
}

/**
 * The spans of the day that carry no talk — every band (break, lunch, keynote,
 * the afterparty) plus the dead time between them, merged and sorted.
 *
 * A band that OVERLAPS a talk is left out: the grid compresses these spans, and
 * compressing one that a room is running a talk through would drag the talk off
 * its own start time.
 */
export function nonTalkSpans(
	sessions: Session[],
	range: { start: number; end: number },
	placed: Map<string, Placement>,
): IdleSpan[] {
	const talks: IdleSpan[] = [];
	const bands: IdleSpan[] = [];
	for (const session of sessions) {
		const place = placed.get(session.id);
		if (!place) continue;
		(isBand(session) ? bands : talks).push({ startMin: place.startMin, endMin: place.endMin });
	}

	const free = bands.filter(
		(band) => !talks.some((talk) => talk.startMin < band.endMin && talk.endMin > band.startMin),
	);
	const spans = [...free, ...idleSpans(sessions, range, placed)].sort((a, b) => a.startMin - b.startMin);

	// Kept SEPARATE, never merged: each strip is compressed on its own, so a run
	// of consecutive breaks is a strip each rather than one strip's worth of rows
	// split between them. Overlaps are dropped instead (the mapping below walks
	// the spans in order and cannot straddle two at once).
	const ordered: IdleSpan[] = [];
	for (const span of spans) {
		const last = ordered[ordered.length - 1];
		if (last && span.startMin < last.endMin) continue;
		ordered.push({ ...span });
	}
	return ordered;
}

/** Minutes-to-grid-row mapping for the timetable. */
export interface RowScale {
	/** Body rows the sheet needs (the header row is not counted). */
	totalRows: number;
	/** Absolute grid row for a minutes value (body rows start at 2). */
	rowFor(min: number): number;
	/** True when `min` falls strictly inside a compressed span. */
	isCompressed(min: number): boolean;
}

/**
 * Build the minutes → row mapping.
 *
 * The sheet is proportional through the talks and COMPRESSED everywhere else:
 * each span in `compressed` gets at most `maxSpanRows` rows however long it runs.
 * Drawn to scale, a 5½-hour afterparty is twenty times the height of the talk
 * above it and the day's actual content is squeezed into the top third of a page
 * of empty hatch; an 80-minute lunch does the same on a smaller scale. Every
 * strip that carries a single line of text gets the height of a single line of
 * text, and the talks keep the space.
 *
 * A span shorter than `maxSpanRows` is left alone rather than stretched up to it
 * — a five-minute gap should not open to the height of lunch.
 */
export function rowScale(
	range: { start: number; end: number },
	compressed: IdleSpan[],
	snapMin: number,
	maxSpanRows: number,
): RowScale {
	const stops = compressed
		.map((span) => ({
			...span,
			rows: Math.min(maxSpanRows, Math.max(1, Math.round((span.endMin - span.startMin) / snapMin))),
		}))
		.sort((a, b) => a.startMin - b.startMin);

	const rowFor = (min: number): number => {
		let rows = 0;
		let cursor = range.start;
		for (const stop of stops) {
			if (min <= stop.startMin) break;
			rows += Math.max(0, Math.round((stop.startMin - cursor) / snapMin));
			cursor = stop.startMin;
			if (min >= stop.endMin) {
				rows += stop.rows;
				cursor = stop.endMin;
				continue;
			}
			// Inside a compressed span: scale within the rows it was given.
			const through = (min - stop.startMin) / (stop.endMin - stop.startMin);
			return 2 + rows + Math.round(through * stop.rows);
		}
		return 2 + rows + Math.max(0, Math.round((min - cursor) / snapMin));
	};

	return {
		totalRows: rowFor(range.end) - 2,
		rowFor,
		isCompressed: (min) => stops.some((stop) => min > stop.startMin && min < stop.endMin),
	};
}

/** Event date (`YYYY-MM-DD`, Prague) taken from the first timed session, or ''
 * when nothing is scheduled. Single-day assumption (see the module header).
 * Goes through `pragueParts` so a UTC-stored evening slot can't report the
 * wrong calendar day and silently kill the live line. */
export function eventDateISO(sessions: Session[]): string {
	for (const session of sessions) {
		const date = pragueParts(session.startsAt)?.date;
		if (date) return date;
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
