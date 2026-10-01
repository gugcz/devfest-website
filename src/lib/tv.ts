/**
 * Pure helpers for `/tv`, the unlisted venue-screen page. A screen is either
 * pinned to one room (`?room=`) and shows what is on there now and next, or
 * shows the whole venue. Times come from `agenda.ts`, so the screen reads the
 * same Prague wall clock as `/agenda`.
 */
import {
	partitionAgenda,
	placement,
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
 * the room's "now").
 */
export function venueNow(sessions: Session[], rooms: Room[], nowMin: number | null): RoomNow[] {
	const { columns, bands, byRoom } = partitionAgenda(sessions, rooms);
	const bandSlots = toSlots(bands);
	return columns.map((column) => {
		const own = toSlots(byRoom.get(column.key) ?? []);
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
