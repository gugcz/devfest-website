import { useEffect, useMemo, useState } from 'react';
import { speakerNames, visitorCategories, type Room, type Session } from '../lib/sessions';
import {
	byStart,
	dayRange,
	eventDateISO,
	formatClock,
	formatMinutes,
	idleSpans,
	isBand,
	nowState,
	nonTalkSpans,
	partitionAgenda,
	placement,
	placements as sessionPlacements,
	rowScale,
	roomKey,
	type AgendaPartition,
	type Placement,
} from '../lib/agenda';
import { fetchAgenda, speakersById } from '../lib/lineup';
import { useRemote } from '../lib/useRemote';
import { useMediaQuery } from '../lib/useMediaQuery';
import SessionDetail from './SessionDetail';
import SpeakerStack from './SpeakerStack';
import { EmptyState, ErrorState, LoadingState } from './DataState';
import s from './Agenda.module.scss';

/** 5-minute grid snap + minimum row height. `rem`, NOT px: rows contain
 * text and must grow with it under text zoom. 1.625rem gives a half-hour
 * talk 156px, enough for title, time, tags and speakers. */
const SNAP_MIN = 5;
const ROW_REM = 1.625;

/** How tall a non-talk strip (a band or dead time) runs: compressed and capped,
 * because at full scale a lunch is two talks tall and the afterparty
 * (19:00–23:00) sixteen. Two rows (one mono line plus padding) for a coffee
 * break, three for anything 40 minutes or longer. A break is a pause on the
 * sheet, not a block that outweighs the talks around it. */
const NON_TALK_ROWS = { minPerRow: 20, minRows: 2, maxRows: 3 } as const;

/** A speakerless service session in a room that runs at least this long (the
 * lounge open 09:45–17:35) is not a slot on the sheet: as a column it was one
 * card the height of the day. It rides in the strip above the grid instead. */
const LONG_RUN_MIN = 180;

/** Sessionize placeholder titles for a slot nobody fills yet ("Talk TBA"). */
const OPEN_SLOT_RE = /\b(tba|tbd)\b/i;

/** Stable empty roster, so the memos below don't recompute on every render
 * before the payload lands. */
const EMPTY_SESSIONS: Session[] = [];
const EMPTY_ROOMS: Room[] = [];

/** Width below which the timetable becomes the time-ordered list. NOT the
 * site's phone breakpoint — this is about room columns: below 1024 a
 * four-room day renders ~150px columns and Bebas titles truncate mid-word. */
const NARROW = '(max-width: 1024px)';

/** A standing note beside a room's name, keyed by its Sessionize name
 * (lowercased). Sessionize rooms carry no description, so it lives here —
 * rename the room there and this key must follow. */
const ROOM_NOTES: Record<string, RoomNote> = {
	'crime lab': { text: 'Workshops only' },
};

interface RoomNote {
	text: string;
	href?: string;
}

/** The note beside a column's name: the room's standing note, else "Talks
 * TBA" for a room with nothing slotted in it yet (an empty column all day
 * reads as a failed load), else none. */
function roomNote(label: string, talks: Session[]): RoomNote | null {
	return ROOM_NOTES[label.trim().toLowerCase()] ?? (talks.length === 0 ? { text: 'Talks TBA' } : null);
}

/** A speakerless service session in a room, long enough to be "open all day"
 * rather than a slot (see {@link LONG_RUN_MIN}). Bands keep their own strip. */
function isLongRunning(session: Session): boolean {
	if (!session.isServiceSession || session.speakers.length > 0 || isBand(session)) return false;
	const place = placement(session);
	return place !== null && place.endMin - place.startMin >= LONG_RUN_MIN;
}

/** A slot held for a talk that is not announced yet: no speaker, and a
 * placeholder title. Shown as an empty slot, never as a talk called "Talk TBA". */
function isOpenSlot(session: Session): boolean {
	return (
		!isBand(session) &&
		!session.isServiceSession &&
		session.speakers.length === 0 &&
		OPEN_SLOT_RE.test(session.title)
	);
}

/** The long-running sessions pulled out of the sheet, and the sessions and
 * rooms left for it. A room that only holds long-running sessions loses its
 * column; a room that also has slots keeps it. */
function splitLongRunning(
	sessions: Session[],
	rooms: Room[],
): { allDay: Session[]; sessions: Session[]; rooms: Room[] } {
	const allDay = sessions.filter(isLongRunning).sort(byStart);
	if (allDay.length === 0) return { allDay, sessions, rooms };
	const rest = sessions.filter((session) => !allDay.includes(session));
	const busyRooms = new Set(rest.map(roomKey));
	const railRooms = new Set(allDay.map(roomKey).filter((key) => !busyRooms.has(key)));
	return { allDay, sessions: rest, rooms: rooms.filter((room) => !railRooms.has(room.id.trim())) };
}

/** Current wall-clock in Europe/Prague as { date: 'YYYY-MM-DD', minutes }.
 * Uses Intl (not the raw Date fields) so it's the event-local time, not the
 * visitor's zone. */
function pragueNow(): { date: string; minutes: number } {
	const parts = new Intl.DateTimeFormat('en-CA', {
		timeZone: 'Europe/Prague',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		hourCycle: 'h23',
	}).formatToParts(new Date());
	const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
	return {
		date: `${get('year')}-${get('month')}-${get('day')}`,
		minutes: Number(get('hour')) * 60 + Number(get('minute')),
	};
}

/**
 * Minutes-of-day for "now", or `null` when it's not the event day (so the grid
 * shows no live line off-event). Ticks every 30s.
 */
function useNowMinutes(eventDate: string): number | null {
	const [nowMin, setNowMin] = useState<number | null>(null);
	useEffect(() => {
		const compute = (): number | null => {
			if (!eventDate) return null;
			const { date, minutes } = pragueNow();
			return date === eventDate ? minutes : null;
		};
		setNowMin(compute());
		const id = setInterval(() => setNowMin(compute()), 30_000);
		return () => clearInterval(id);
	}, [eventDate]);
	return nowMin;
}

/** Column heading per column key — the room name, or its numbered stand-in. */
function roomLabels(partition: AgendaPartition): Map<string, string> {
	return new Map(partition.columns.map((column) => [column.key, column.label]));
}

/** Accessible label for a talk cell — omits the room clause when unassigned. */
function talkLabel(session: Session, room: string): string {
	const time = formatClock(session.startsAt);
	return room ? `${session.title} — ${time} in ${room}` : `${session.title} — ${time}`;
}

/** Start–end wall-clock range (`09:00–09:45`), fallback end included. */
function timeRange(session: Session): string {
	const place = placement(session);
	if (!place) return '';
	return `${formatMinutes(place.startMin)}–${formatMinutes(place.endMin)}`;
}

/** The same range split for the list, where it is set on two lines. The dash
 * stays on the first line, so the text content is still `09:50–10:30` and a
 * screen reader reads the range, not two loose numbers. */
function timeParts(session: Session): { from: string; to: string } | null {
	const place = placement(session);
	if (!place) return null;
	return { from: `${formatMinutes(place.startMin)}–`, to: formatMinutes(place.endMin) };
}

/** Up to three visitor-facing category values (Track / Level / …) for a talk. */
function talkTags(session: Session): string[] {
	return visitorCategories(session)
		.flatMap((category) => category.values)
		.slice(0, 3);
}

/** The /sessions card stack sized down for the timetable. */
function TalkAvatars({ session }: { session: Session }) {
	return (
		<SpeakerStack
			speakers={session.speakers}
			className={s.avatars}
			avatarClass={s.avatar}
			monogramClass={`${s.avatar} ${s.avatarMono}`}
			size={24}
		/>
	);
}

/** Tag pills for a talk's categories; renders nothing when there are none. */
function TalkTags({ session }: { session: Session }) {
	const tags = talkTags(session);
	if (tags.length === 0) return null;
	return (
		<span className={s.tags}>
			{tags.map((tag) => (
				<span key={tag} className={s.tag}>
					{tag}
				</span>
			))}
		</span>
	);
}

/** "Live now" (pulsing) or "Coming up" badge; nothing when neither applies. */
function NowBadge({ live, coming }: { live: boolean; coming: boolean }) {
	if (live) {
		return (
			<span className={`${s.badge} ${s.badgeLive}`}>
				<span className={s.liveDot} aria-hidden="true" />
				Live now
			</span>
		);
	}
	if (coming) return <span className={`${s.badge} ${s.badgeComing}`}>Coming up</span>;
	return null;
}

/** Long-running rooms in one strip above the sheet: time, what, where. */
function AllDayStrip({ sessions, labels }: { sessions: Session[]; labels: Map<string, string> }) {
	if (sessions.length === 0) return null;
	return (
		<ul className={s.allDay} aria-label="Running all day">
			{sessions.map((session) => (
				<li key={session.id} className={s.allDayItem}>
					<span className={s.allDayTime}>{timeRange(session)}</span>
					<span className={s.allDayTitle}>{session.title}</span>
					<span className={s.allDayRoom}>{session.room.trim() || labels.get(roomKey(session)) || ''}</span>
				</li>
			))}
		</ul>
	);
}

/* ============================ GRID ============================ */

// Each session is placed by its absolute grid row in its room column. Two
// sessions overlapping in the SAME room would render on top of each other —
// lane-splitting is an explicit non-goal (conference rooms run sequentially;
// parallel tracks are different rooms). Add it only if real data ever overlaps.
function AgendaGrid({
	partition,
	placements,
	range,
	liveIds,
	comingUpIds,
	nowMin,
	onOpen,
}: {
	partition: AgendaPartition;
	/** Every timed session's placement, keyed by id. */
	placements: Map<string, Placement>;
	range: { start: number; end: number };
	liveIds: Set<string>;
	comingUpIds: Set<string>;
	nowMin: number | null;
	onOpen: (session: Session) => void;
}) {
	const { columns, bands, byRoom } = partition;
	const timed = [...bands, ...columns.flatMap((column) => byRoom.get(column.key) ?? [])];

	// Dead time — no room has anything on. Hatched, so an unscheduled stretch
	// reads as the day being quiet rather than as a hole in the sheet.
	const idle = idleSpans(timed, range, placements);

	// The sheet runs to scale through the talks and compresses everywhere else,
	// so a break, a lunch and a five-hour afterparty are all one strip tall.
	const scale = rowScale(range, nonTalkSpans(timed, range, placements), SNAP_MIN, NON_TALK_ROWS);
	const rowFor = scale.rowFor;

	// One header row (sticky room names) + the timed body rows.
	const gridStyle = {
		gridTemplateColumns: `4.25rem repeat(${columns.length}, minmax(9.5rem, 1fr))`,
		// `minmax(…, auto)`, not a fixed height: the row is the container for a
		// talk's title, and a title is never cut to fit its slot. A 20-minute talk
		// whose title runs to three lines grows the rows it spans, and because
		// every column shares those rows the tracks stay aligned.
		gridTemplateRows: `auto repeat(${scale.totalRows}, minmax(${ROW_REM}rem, auto))`,
	} as const;

	// Hour ticks down the time gutter — never one inside a compressed strip,
	// where the sheet is no longer to scale and the numeral would lie.
	const firstHour = Math.ceil(range.start / 60);
	const lastHour = Math.floor(range.end / 60);
	const ticks: number[] = [];
	for (let h = firstHour; h <= lastHour; h += 1) {
		if (!scale.isCompressed(h * 60)) ticks.push(h * 60);
	}

	// Talks + bands in one time-sorted list so DOM (reading) order matches the
	// mobile list and screen-reader order, independent of visual placement.
	const talks = columns.flatMap((column) =>
		(byRoom.get(column.key) ?? []).map((session) => ({ session, column })),
	);
	const placed = [
		...bands.map((session) => ({ kind: 'band' as const, session, column: null })),
		...talks.map(({ session, column }) => ({ kind: 'talk' as const, session, column })),
	].sort((a, b) => byStart(a.session, b.session));

	return (
		<div className={s.scroller}>
			<div className={s.grid} style={gridStyle} role="presentation">
				{/* Header row: empty time-gutter corner + room names */}
				<div className={`${s.headCell} ${s.headCorner}`} aria-hidden="true" />
				{columns.map((column, i) => {
					const note = roomNote(column.label, byRoom.get(column.key) ?? []);
					return (
						<div key={column.key} className={s.headCell} style={{ gridColumn: i + 2, gridRow: 1 }}>
							<span className={s.headLabel}>{column.label}</span>
							{note?.href && (
								<a className={`${s.headNote} ${s.headLink}`} href={note.href}>
									{note.text}
								</a>
							)}
							{note && !note.href && <span className={s.headNote}>{note.text}</span>}
						</div>
					);
				})}

				{/* The sheet's ruling, behind everything (z 0): a hairline down
				    each room column and one across each hour. Both are closed over
				    by the entries and by the hatched dead-time strips, which are
				    opaque — an earlier version left the strips translucent and the
				    column rule ran straight through every full-width band.
				    Decorative: the times and rooms are in the ticks, the head cells
				    and every talk's aria-label. */}
				{columns.slice(1).map((column, i) => (
					<div
						key={`col-${column.key}`}
						className={s.colRule}
						style={{ gridColumn: i + 3, gridRow: '2 / -1' }}
						aria-hidden="true"
					/>
				))}
				{ticks.map((min) => (
					<div
						key={`rule-${min}`}
						className={s.hourRule}
						style={{ gridColumn: '1 / -1', gridRow: rowFor(min) }}
						aria-hidden="true"
					/>
				))}

				{/* Dead time, hatched across every room. Opaque, so it closes over
				    the column rules rather than letting them run through it. */}
				{idle.map((span) => (
					<div
						key={`idle-${span.startMin}`}
						className={s.idle}
						style={{
							gridColumn: '2 / -1',
							gridRow: `${rowFor(span.startMin)} / ${rowFor(span.endMin)}`,
						}}
						aria-hidden="true"
					/>
				))}

				{/* Time gutter ticks */}
				{ticks.map((min) => (
					<div
						key={`tick-${min}`}
						className={s.tick}
						style={{ gridColumn: 1, gridRow: rowFor(min) }}
					>
						{formatMinutes(min)}
					</div>
				))}

				{placed.map(({ kind, session, column }) => {
					const place = placements.get(session.id);
					if (!place) return null;
					const rowStart = rowFor(place.startMin);
					const rowSpan = Math.max(1, rowFor(place.endMin) - rowStart);
					const gridRow = `${rowStart} / span ${rowSpan}`;

					if (kind === 'band') {
						return (
							<div
								key={session.id}
								className={`${s.band} ${liveIds.has(session.id) ? s.bandLive : ''}`}
								style={{ gridColumn: '2 / -1', gridRow }}
							>
								<span className={s.bandTime}>{timeRange(session)}</span>
								<span className={s.bandTitle}>{session.title}</span>
								<NowBadge live={liveIds.has(session.id)} coming={false} />
							</div>
						);
					}

					const colIndex = columns.findIndex((c) => c.key === column?.key) + 2;
					if (isOpenSlot(session)) {
						return (
							<div key={session.id} className={s.slotOpen} style={{ gridColumn: colIndex, gridRow }}>
								<span className={s.cellTime}>{timeRange(session)}</span>
								<span className={s.slotOpenLabel}>Slot open</span>
							</div>
						);
					}
					const live = liveIds.has(session.id);
					return (
						<button
							key={session.id}
							type="button"
							className={`${s.cell} ${live ? s.cellLive : ''}`}
							style={{ gridColumn: colIndex, gridRow }}
							onClick={() => onOpen(session)}
							aria-label={talkLabel(session, column?.label ?? '')}
							data-agenda-open
						>
							<span className={s.cellHead}>
								<span className={s.cellTime}>{timeRange(session)}</span>
								<NowBadge live={live} coming={comingUpIds.has(session.id)} />
							</span>
							<span className={s.cellTitle}>{session.title}</span>
							<TalkTags session={session} />
							{session.speakers.length > 0 && (
								<span className={s.cellFoot}>
									<TalkAvatars session={session} />
									<span className={s.cellSpeakers}>{speakerNames(session)}</span>
								</span>
							)}
						</button>
					);
				})}

				{/* Current-time line — event day only (or ?now= preview). Decorative
				    overlay; the "Now" text conveys it to AT. */}
				{nowMin !== null && nowMin >= range.start && nowMin <= range.end && (
					<div className={s.nowLine} style={{ gridColumn: '1 / -1', gridRow: rowFor(nowMin) }}>
						<span className={s.nowLabel}>Now</span>
					</div>
				)}
			</div>
		</div>
	);
}

/* ============================ LIST ============================ */

// The narrow layout is a run sheet, not a second copy of "Every talk": time,
// title and room per slot, the breaks between them, and a tap opens the same
// session sheet. Abstracts, tags, photos, search and filters live in the list
// under it — on a phone the two used to repeat every talk at full size.

/** One run-sheet row: a band (information), an open slot, or a talk (control). */
function ListRow({
	session,
	room,
	live,
	coming,
	onOpen,
}: {
	session: Session;
	room: string;
	live: boolean;
	coming: boolean;
	onOpen: (session: Session) => void;
}) {
	const time = timeParts(session);
	const clock = (
		<span className={s.itemTime}>
			<span>{time?.from}</span>
			<span>{time?.to}</span>
		</span>
	);

	if (isBand(session) || isOpenSlot(session)) {
		const open = isOpenSlot(session);
		return (
			<div className={`field-row ${s.item} ${s.itemBand} ${live ? s.itemLive : ''}`}>
				{clock}
				<span className={s.itemMain}>
					<span className={s.itemTitleRow}>
						<span className={s.itemTitle}>{open ? 'Slot open' : session.title}</span>
						<NowBadge live={live && !open} coming={false} />
					</span>
					{open && room && <span className={s.itemRoom}>{room}</span>}
				</span>
			</div>
		);
	}

	return (
		<button
			type="button"
			className={`field-row field-row--link ${s.item} ${live ? s.itemLive : ''}`}
			onClick={() => onOpen(session)}
			aria-label={talkLabel(session, room)}
			data-agenda-open
		>
			{clock}
			<span className={s.itemMain}>
				<span className={s.itemTitleRow}>
					<span className={s.itemTitle}>{session.title}</span>
					<NowBadge live={live} coming={coming} />
				</span>
				{room && <span className={s.itemRoom}>{room}</span>}
			</span>
		</button>
	);
}

function AgendaList({
	partition,
	liveIds,
	comingUpIds,
	onOpen,
}: {
	partition: AgendaPartition;
	liveIds: Set<string>;
	comingUpIds: Set<string>;
	onOpen: (session: Session) => void;
}) {
	// Same timed set the grid places, from the one memoized partition (bands +
	// every room column, incl. Room-TBA) so the two layouts never drift.
	const timed = [
		...partition.bands,
		...partition.columns.flatMap((column) => partition.byRoom.get(column.key) ?? []),
	].sort(byStart);
	const labels = roomLabels(partition);
	return (
		<ul className={`field ${s.list}`} role="list">
			{timed.map((session) => (
				<li key={session.id}>
					<ListRow
						session={session}
						room={labels.get(roomKey(session)) ?? ''}
						live={liveIds.has(session.id)}
						coming={comingUpIds.has(session.id)}
						onOpen={onOpen}
					/>
				</li>
			))}
		</ul>
	);
}

/* ============================ ROOT ============================ */

export default function Agenda() {
	const { status, data } = useRemote(fetchAgenda, 'agenda', (l) => l.sessions.length === 0);
	const [selected, setSelected] = useState<Session | null>(null);
	const isNarrow = useMediaQuery(NARROW);

	const split = useMemo(
		() => splitLongRunning(data?.sessions ?? EMPTY_SESSIONS, data?.rooms ?? EMPTY_ROOMS),
		[data],
	);
	const { sessions, rooms, allDay } = split;
	const profiles = useMemo(() => speakersById(data?.speakers ?? []), [data]);
	const partition = useMemo(() => partitionAgenda(sessions, rooms), [sessions, rooms]);
	const allRoomNames = useMemo(
		() => new Map((data?.rooms ?? EMPTY_ROOMS).map((room) => [room.id.trim(), room.name.trim()])),
		[data],
	);
	const placements = useMemo(() => sessionPlacements(sessions), [sessions]);
	const range = useMemo(() => dayRange(sessions), [sessions]);
	// Event-day "now" line + live/coming-up badges (hooks must run before the
	// early returns below).
	const eventDate = useMemo(() => eventDateISO(sessions), [sessions]);
	const nowMin = useNowMinutes(eventDate);
	const now = useMemo(() => nowState(sessions, nowMin), [sessions, nowMin]);

	if (status === 'error') {
		return (
			<ErrorState>
				<p>The agenda won't come up right now. Reload, or take it up with devfest@gug.cz.</p>
			</ErrorState>
		);
	}

	if (status === 'loading') {
		return <LoadingState label="Developing the agenda" />;
	}

	// No sessions at all, or none scheduled yet → the schedule isn't published.
	if (status === 'empty' || range === null) {
		return (
			<EmptyState action={{ href: '#talks', label: 'Browse all talks' }}>
				<p>The full schedule lands closer to the event.</p>
			</EmptyState>
		);
	}

	// One column (or a phone) reads better as the time-ordered list.
	const asList = isNarrow || partition.columns.length <= 1;

	return (
		<>
			<p className={s.tzNote}>All times Prague (CET)</p>
			<AllDayStrip sessions={allDay} labels={allRoomNames} />

			{asList ? (
				<AgendaList
					partition={partition}
					liveIds={now.liveIds}
					comingUpIds={now.comingUpIds}
					onOpen={setSelected}
				/>
			) : (
				<AgendaGrid
					partition={partition}
					placements={placements}
					range={range}
					liveIds={now.liveIds}
					comingUpIds={now.comingUpIds}
					nowMin={nowMin}
					onOpen={setSelected}
				/>
			)}

			{selected && (
				<SessionDetail
					session={selected}
					speakersById={profiles}
					onClose={() => setSelected(null)}
				/>
			)}
		</>
	);
}
