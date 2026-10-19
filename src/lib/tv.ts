/**
 * Pure helpers for `/tv`, the unlisted venue-screen page. A screen is either
 * pinned to one room (`?room=`) and shows what is on there now and next, or
 * shows the whole venue. Times come from `agenda.ts`, so the screen reads the
 * same Prague wall clock as `/agenda`.
 */
import {
	isLongRunning,
	partitionAgenda,
	placement,
	slotColumns,
	type AgendaColumn,
	type Placement,
} from './agenda';
import type { Room, Session } from './sessions';

/** A session with its place on the day's timeline. */
export interface Slot {
	session: Session;
	place: Placement;
}

/** What one room has on: the live slot (if any) and what follows it. */
export interface RoomNow {
	column: AgendaColumn;
	now: Slot | null;
	/** Upcoming slots in start order, the room's own talks and venue-wide bands. */
	upcoming: Slot[];
}

/** `Main Hall` → `main-hall`, `Sál Č. 2` → `sal-c-2`; what a `?room=` value
 * is matched against besides the Sessionize room id. */
export function roomSlug(name: string): string {
	return name
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

/** The column a `?room=` value names, by Sessionize id or by name slug. */
export function findColumn(columns: AgendaColumn[], param: string): AgendaColumn | null {
	const wanted = param.trim();
	if (!wanted) return null;
	const slug = roomSlug(wanted);
	return (
		columns.find((column) => column.key === wanted) ??
		columns.find((column) => roomSlug(column.label) === slug) ??
		null
	);
}

function toSlots(sessions: Session[]): Slot[] {
	const slots: Slot[] = [];
	for (const session of sessions) {
		const place = placement(session);
		if (place) slots.push({ session, place });
	}
	return slots.sort((a, b) => a.place.startMin - b.place.startMin || a.session.order - b.session.order);
}

/**
 * Now / upcoming for every room. `nowMin === null` means it is not the event
 * day: nothing is live and the whole day is upcoming. A room's own talk beats
 * a band running at the same time (a workshop that runs through lunch stays
 * the room's "now"). A room open all day (the lounge) is no slot, as on
 * `/agenda`.
 */
export function venueNow(sessions: Session[], rooms: Room[], nowMin: number | null): RoomNow[] {
	const partition = partitionAgenda(sessions, rooms);
	const bandSlots = toSlots(partition.bands);
	return slotColumns(partition).map((column) => {
		const slotted = (partition.byRoom.get(column.key) ?? []).filter((session) => !isLongRunning(session));
		const own = toSlots(slotted);
		const isLive = (slot: Slot) =>
			nowMin !== null && slot.place.startMin <= nowMin && nowMin < slot.place.endMin;
		const now = own.find(isLive) ?? bandSlots.find(isLive) ?? null;
		const from = now ? now.place.endMin : (nowMin ?? Number.NEGATIVE_INFINITY);
		const upcoming = toSlots(
			[...own, ...bandSlots]
				.filter((slot) => slot !== now && slot.place.startMin >= from)
				.map((slot) => slot.session),
		);
		return { column, now, upcoming };
	});
}

/** The pauses, read off a service session's title, and what a screen calls
 * each. First match wins: "Registration and coffee" is a registration. */
const PAUSES: [RegExp, string][] = [
	[/\bregist|\bcheck-?in\b/i, 'Registration'],
	[/\blunch\b|oběd/i, 'Lunch'],
	[/\bbreakfast\b|snídaně/i, 'Breakfast'],
	[/\bbreak\b|\bcoffee\b|\bpause\b|přestávka|pauza/i, 'Break'],
];

/** Never a pause, whatever else the title says ("Kick-off & coffee"). */
const PROGRAMME = /\bkick-?off\b|\bkeynote\b/i;

function pauseLabel(session: Session): string | null {
	if (!session.isServiceSession || PROGRAMME.test(session.title)) return null;
	return PAUSES.find(([pattern]) => pattern.test(session.title))?.[1] ?? null;
}

/** Breaks, lunch and registration: the slots people wait through. Kick-off,
 * lightning talks, closing remarks and the afterparty are there to be at, so
 * they lead like a talk even when Sessionize files them as service sessions. */
export function isBreak(session: Session): boolean {
	return pauseLabel(session) !== null;
}

/** `Break 20` → `Break`, `Lunch break` → `Lunch`: what a screen calls a pause. */
export function breakLabel(session: Session): string {
	return pauseLabel(session) ?? session.title;
}

/** What a screen leads with for one room. During a break people want what
 * comes after it, so a break never leads: it is the `pause` beside the next
 * talk. "Talk" here is anything on the agenda that is not a pause: a kick-off
 * or the afterparty leads too. */
export interface RoomFocus {
	/** The talk on now, else the next one. */
	lead: Slot | null;
	live: boolean;
	/** A break running now, while `lead` waits for it to end. */
	pause: Slot | null;
	/** The talk after `lead`. */
	next: Slot | null;
	/** A break between `lead` and `next`. */
	gap: Slot | null;
}

export function roomFocus(room: RoomNow): RoomFocus {
	const talks = room.upcoming.filter((slot) => !isBreak(slot.session));
	const onNow = room.now && !isBreak(room.now.session) ? room.now : null;
	const lead = onNow ?? talks[0] ?? null;
	// The first talk once the lead is over: a shared session that starts
	// inside a long workshop is not that room's next.
	const next = lead
		? (talks.find((slot) => slot !== lead && slot.place.startMin >= lead.place.endMin) ?? null)
		: null;
	const gap =
		lead && next
			? (room.upcoming.find(
					(slot) =>
						isBreak(slot.session) &&
						slot.place.startMin >= lead.place.endMin &&
						slot.place.endMin <= next.place.startMin,
				) ?? null)
			: null;
	const pause = room.now && isBreak(room.now.session) ? room.now : null;
	return { lead, live: onNow !== null, pause, next, gap };
}

/** True once the last session of the day has ended. */
export function isDayOver(rooms: RoomNow[], nowMin: number | null): boolean {
	if (nowMin === null) return false;
	return rooms.every((room) => room.now === null && room.upcoming.length === 0);
}

/** `in 5 min`, `in 1 h 20 min`, or `now` — how far a start is from `nowMin`. */
export function startsIn(startMin: number, nowMin: number | null): string {
	if (nowMin === null) return '';
	const diff = startMin - nowMin;
	if (diff <= 0) return 'now';
	if (diff < 60) return `in ${diff} min`;
	const hours = Math.floor(diff / 60);
	const minutes = diff % 60;
	return minutes ? `in ${hours} h ${minutes} min` : `in ${hours} h`;
}

/** Share of a live slot already elapsed, 0–1. */
export function progress(place: Placement, nowMin: number | null): number {
	if (nowMin === null) return 0;
	const span = place.endMin - place.startMin;
	if (span <= 0) return 0;
	return Math.min(1, Math.max(0, (nowMin - place.startMin) / span));
}
