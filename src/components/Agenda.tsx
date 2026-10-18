import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { speakerNames, visitorCategories, type Room, type Session } from '../lib/sessions';
import {
	byStart,
	eventDateISO,
	formatClock,
	formatMinutes,
	isBand,
	nowState,
	partitionAgenda,
	placement,
	placements as sessionPlacements,
	roomKey,
	type AgendaColumn,
	type AgendaPartition,
	type Placement,
} from '../lib/agenda';
import { fetchAgenda, speakersById } from '../lib/lineup';
import { useRemote } from '../lib/useRemote';
import { useMediaQuery } from '../lib/useMediaQuery';
import SessionDetail from './SessionDetail';
import { EmptyState, ErrorState, LoadingState } from './DataState';
import s from './Agenda.module.scss';

// THE DAY AS SLIPS ON THE TABLE. Desktop: the rooms are columns under their
// tapes, every talk is a paper slip set at its start time and running to its
// end, and a break is a quiet typewriter line across the rooms. The sheet is
// NOT to scale: one row per moment something starts or ends, each as tall as
// what sits in it, so a lunch never outweighs the talks around it. Phone: the
// same day as one list, grouped by start time, each slip taped with its room.

/** A speakerless service session in a room that runs at least this long (the
 * lounge open 09:45–17:00) is "open all day", not a slot: one dark block down
 * its room's column, start to end. It never counts as live or coming up: a
 * lounge open through lunch must not hide "Next" all day. */
const LONG_RUN_MIN = 180;

/** The note line on an open-all-day block, grid and list alike. */
const ALL_DAY_NOTE = 'Open all day, drop in any time';

/** Sessionize placeholder titles for a slot nobody fills yet ("Talk TBA"). */
const OPEN_SLOT_RE = /\b(tba|tbd)\b/i;

/** Stable empty roster, so the memos below don't recompute on every render
 * before the payload lands. */
const EMPTY_SESSIONS: Session[] = [];
const EMPTY_ROOMS: Room[] = [];

/** Width at or below which the sheet becomes the time-grouped list. */
const NARROW = '(max-width: 720px)';

/** A standing note under a room's tape, keyed by its Sessionize name
 * (lowercased). Sessionize rooms carry no description, so it lives here —
 * rename the room there and this key must follow. */
const ROOM_NOTES: Record<string, string> = {
	'crime lab': 'Workshops only',
};

/** Barely-set-down tilts for the slips, cycled down the day. A fraction of
 * `--tilt-1`, so the sheet stays legible. */
const TILTS = [s.tiltA, s.tiltB, s.tiltC, s.tiltD];

/** A speakerless service session in a room, long enough to be "open all day"
 * rather than a slot (see {@link LONG_RUN_MIN}). Bands stay bands. */
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

/** What an entry is on the sheet: a line across the rooms, a slot held open,
 * a room open all day, or a talk (the only control). */
type EntryKind = 'band' | 'open' | 'allDay' | 'talk';

function entryKind(session: Session): EntryKind {
	if (isBand(session)) return 'band';
	if (isOpenSlot(session)) return 'open';
	if (isLongRunning(session)) return 'allDay';
	return 'talk';
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
 * Minutes-of-day for "now", or `null` when it's not the event day (so nothing
 * is marked live off-event). Ticks every 30s.
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

/** Accessible label for a talk slip — omits the room clause when unassigned. */
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

/** The slip's right-hand edge: track and length, `AI · 40 min`, in the note voice. */
function trackLength(session: Session): string {
	const categories = visitorCategories(session);
	const track = (categories.find((c) => c.name.toLowerCase() === 'track') ?? categories[0])?.values[0];
	const place = placement(session);
	const length = place ? `${place.endMin - place.startMin} min` : '';
	return [track, length].filter(Boolean).join(' · ');
}

/** A room's sessions are all open-all-day blocks (the lounge). */
function isAllDayRoom(sessions: Session[]): boolean {
	return sessions.length > 0 && sessions.every(isLongRunning);
}

/** The note under a room's tape: its standing note, "Open all day" for the
 * lounge, "Talks TBA" for a room with nothing in it yet (an empty column all
 * day reads as a failed load), else none. */
function roomNote(label: string, sessions: Session[]): string | null {
	const standing = ROOM_NOTES[label.trim().toLowerCase()];
	if (standing) return standing;
	if (isAllDayRoom(sessions)) return 'Open all day';
	return sessions.length === 0 ? 'Talks TBA' : null;
}

/** The columns on the sheet: the picked room alone, or every room, with the
 * open-all-day rooms last, so a break line spans the rooms that pause. */
function sheetColumns(partition: AgendaPartition, room: string | null): AgendaColumn[] {
	const picked = partition.columns.filter((column) => room === null || column.key === room);
	const allDay = (column: AgendaColumn) => isAllDayRoom(partition.byRoom.get(column.key) ?? []);
	return [...picked.filter((c) => !allDay(c)), ...picked.filter(allDay)];
}

/** "Live now" in red, or "Next" in the slip's dim ink; nothing otherwise. */
function Flag({ live, coming }: { live: boolean; coming: boolean }) {
	if (live) return <span className={`${s.flag} ${s.flagLive}`}>Live now</span>;
	if (coming) return <span className={s.flag}>Next</span>;
	return null;
}

/** A band: a quiet typewriter line across the rooms. The evening programme
 * (anything after the last talk) is set louder and names its room. */
function BandLine({
	session,
	loud,
	room,
	live,
	style,
}: {
	session: Session;
	loud: boolean;
	room: string;
	live: boolean;
	style?: CSSProperties;
}) {
	return (
		<p className={`${s.band} ${loud ? s.bandLoud : ''} ${live ? s.bandLive : ''}`} style={style}>
			<span className={s.bandTime}>{timeRange(session)}</span> <span className={s.bandTitle}>{session.title}</span>
			{loud && room && <span className={s.bandWhere}> {room}</span>}
			{live && <span className={`${s.flag} ${s.flagLive} ${s.bandFlag}`}> Live now</span>}
		</p>
	);
}

/** The paper slip for a talk: time and track on the edge, the title typed,
 * the speakers in Bebas. The whole slip opens the session sheet. */
function TalkSlip({
	session,
	room,
	live,
	coming,
	tilt,
	taped,
	style,
	onOpen,
}: {
	session: Session;
	room: string;
	live: boolean;
	coming: boolean;
	tilt: string;
	taped: boolean;
	style?: CSSProperties;
	onOpen: (session: Session) => void;
}) {
	const names = speakerNames(session);
	return (
		<button
			type="button"
			className={`${s.slip} ${tilt}`}
			style={style}
			onClick={() => onOpen(session)}
			aria-label={talkLabel(session, room)}
			data-agenda-open
		>
			{taped && room && (
				<span className={`tape ${s.slipTape}`} aria-hidden="true">
					{room}
				</span>
			)}
			<span className={s.edge}>
				<span>{timeRange(session)}</span>
				<span className={s.edgeNote}>{trackLength(session)}</span>
			</span>
			<span className={s.title}>{session.title}</span>
			{names && <span className={s.who}>{names}</span>}
			<Flag live={live} coming={coming} />
		</button>
	);
}

/** The lounge: one dark block, open all day. Information, not a control. */
function AllDayBlock({
	session,
	room,
	taped,
	style,
}: {
	session: Session;
	room: string;
	taped: boolean;
	style?: CSSProperties;
}) {
	return (
		<div className={s.allDay} style={style}>
			<div className={s.allDayIn}>
				{taped && room && (
					<span className={`tape ${s.slipTape}`} aria-hidden="true">
						{room}
					</span>
				)}
				<span className={s.edge}>
					<span>{timeRange(session)}</span>
					{taped && <span className={s.edgeNote}>All day</span>}
				</span>
				<span className={s.title}>{session.title}</span>
				<span className={s.allDayNote}>{ALL_DAY_NOTE}</span>
				{room && !taped && <span className="sr-only">{room}</span>}
			</div>
		</div>
	);
}

/** A slot held open: a dashed outline where a slip will go. */
function OpenSlot({ session, room, style }: { session: Session; room: string; style?: CSSProperties }) {
	return (
		<div className={s.open} style={style}>
			<span className={s.openTime}>{timeRange(session)}</span>
			{/* On the sheet the column names the room; in the list it is said. */}
			<span>
				Slot open{room && <span className={style ? 'sr-only' : undefined}>, {room}</span>}
			</span>
		</div>
	);
}

/** Shared per-render facts every entry reads. */
interface SheetState {
	liveIds: Set<string>;
	comingUpIds: Set<string>;
	/** The last talk's end: a band from here on is the evening programme. */
	lastTalkEnd: number;
	onOpen: (session: Session) => void;
}

/** One entry, wherever it sits: the grid passes its cell, the list none. */
function Entry({
	session,
	room,
	index,
	taped,
	style,
	sheet,
}: {
	session: Session;
	room: string;
	index: number;
	taped: boolean;
	style?: CSSProperties;
	sheet: SheetState;
}) {
	const live = sheet.liveIds.has(session.id);
	switch (entryKind(session)) {
		case 'band': {
			const loud = (placement(session)?.startMin ?? 0) >= sheet.lastTalkEnd;
			return <BandLine session={session} loud={loud} room={room} live={live} style={style} />;
		}
		case 'open':
			return <OpenSlot session={session} room={room} style={style} />;
		case 'allDay':
			return <AllDayBlock session={session} room={room} taped={taped} style={style} />;
		default:
			return (
				<TalkSlip
					session={session}
					room={room}
					live={live}
					coming={sheet.comingUpIds.has(session.id)}
					tilt={TILTS[index % TILTS.length]}
					taped={taped}
					style={style}
					onOpen={sheet.onOpen}
				/>
			);
	}
}

/** Every timed entry the sheet places — bands plus the shown rooms — in
 * reading order, each with its room's name. */
function sheetEntries(
	partition: AgendaPartition,
	columns: AgendaColumn[],
	labels: Map<string, string>,
): { session: Session; room: string; column: number }[] {
	return [
		...partition.bands.map((session) => ({ session, room: labels.get(roomKey(session)) ?? '', column: 0 })),
		...columns.flatMap((column, i) =>
			(partition.byRoom.get(column.key) ?? []).map((session) => ({ session, room: column.label, column: i + 1 })),
		),
	].sort((a, b) => byStart(a.session, b.session));
}

/* ============================ GRID ============================ */

/** The columns a band runs across: from the first room up to the first one
 * still busy at that time (a workshop running through a break), so the line
 * never runs under a slip. All the pausing rooms when the first is busy. */
function bandColumns(band: Placement, columns: AgendaColumn[], regular: number, partition: AgendaPartition): string {
	const busy = columns.slice(0, regular).findIndex((column) =>
		(partition.byRoom.get(column.key) ?? []).some((session) => {
			const place = placement(session);
			return place !== null && place.startMin < band.endMin && place.endMin > band.startMin;
		}),
	);
	return `2 / ${2 + (busy > 0 ? busy : regular)}`;
}

// Two sessions overlapping in the SAME room would sit on top of each other —
// lane-splitting is an explicit non-goal (a room runs one thing at a time;
// parallel tracks are different rooms).
function AgendaGrid({
	partition,
	columns,
	labels,
	placements,
	sheet,
}: {
	partition: AgendaPartition;
	columns: AgendaColumn[];
	labels: Map<string, string>;
	/** Every timed session's placement, keyed by id. */
	placements: Map<string, Placement>;
	sheet: SheetState;
}) {
	const regular = columns.filter((c) => !isAllDayRoom(partition.byRoom.get(c.key) ?? [])).length;
	// The lounge alone has no room that pauses, so it takes no break lines.
	const entries = sheetEntries(partition, columns, labels).filter(
		({ session, column }) => placements.has(session.id) && (regular > 0 || column !== 0),
	);

	// One grid line per moment something starts or ends; row 1 holds the tapes.
	const moments = [
		...new Set(entries.flatMap(({ session }) => {
			const place = placements.get(session.id);
			return place ? [place.startMin, place.endMin] : [];
		})),
	].sort((a, b) => a - b);
	const line = new Map(moments.map((min, i) => [min, i + 2]));
	const rowOf = (session: Session) => {
		const place = placements.get(session.id);
		return place ? `${line.get(place.startMin)} / ${line.get(place.endMin)}` : 'auto';
	};

	// The gutter names each start (the lounge's opening aside); red where
	// something on the sheet is live.
	const starts = new Map<number, boolean>();
	for (const { session } of entries) {
		const start = placements.get(session.id)?.startMin;
		if (start === undefined || isLongRunning(session)) continue;
		starts.set(start, (starts.get(start) ?? false) || sheet.liveIds.has(session.id));
	}

	const allDay = columns.length - regular;
	const gridStyle = {
		gridTemplateColumns: [
			'var(--gutter-col)',
			regular > 0 ? `repeat(${regular}, minmax(0, 1fr))` : '',
			allDay > 0 ? `repeat(${allDay}, minmax(0, var(--all-day-fr)))` : '',
		].join(' '),
		gridTemplateRows: `auto repeat(${Math.max(1, moments.length - 1)}, auto)`,
	} as const;

	let talks = 0;
	return (
		<div className={`${s.grid} ${columns.length === 1 ? s.gridSingle : ''}`} style={gridStyle}>
			{columns.map((column, i) => {
				const note = roomNote(column.label, partition.byRoom.get(column.key) ?? []);
				return (
					<div key={column.key} className={s.head} style={{ gridColumn: i + 2, gridRow: 1 }}>
						<span className={`tape ${s.headTape}`}>{column.label}</span>
						{note && <span className={s.headNote}>{note}</span>}
					</div>
				);
			})}

			{[...starts].map(([min, live]) => (
				<span
					key={`t-${min}`}
					className={`${s.tick} ${live ? s.tickLive : ''}`}
					style={{ gridColumn: 1, gridRow: line.get(min) }}
					aria-hidden="true"
				>
					{formatMinutes(min)}
				</span>
			))}

			{entries.map(({ session, room, column }) => {
				const kind = entryKind(session);
				const index = kind === 'talk' ? talks++ : 0;
				const place = placements.get(session.id);
				const gridColumn = column === 0 && place ? bandColumns(place, columns, regular, partition) : column + 1;
				const style = { gridColumn, gridRow: rowOf(session) };
				return (
					<Entry key={session.id} session={session} room={room} index={index} taped={false} style={style} sheet={sheet} />
				);
			})}
		</div>
	);
}

/* ============================ LIST ============================ */

/** Entries grouped by start minute, in order. */
function groupByStart(entries: { session: Session; room: string }[]) {
	const groups = new Map<number, { session: Session; room: string }[]>();
	for (const entry of entries) {
		const start = placement(entry.session)?.startMin ?? -1;
		groups.set(start, [...(groups.get(start) ?? []), entry]);
	}
	return [...groups];
}

function AgendaList({
	partition,
	columns,
	labels,
	nowMin,
	sheet,
}: {
	partition: AgendaPartition;
	columns: AgendaColumn[];
	labels: Map<string, string>;
	nowMin: number | null;
	sheet: SheetState;
}) {
	const groups = groupByStart(sheetEntries(partition, columns, labels));
	let talks = 0;
	return (
		<ol className={s.list} role="list">
			{groups.map(([start, entries]) => {
				// A moment with only a break in it is a quiet line, no heading.
				if (entries.every(({ session }) => isBand(session))) {
					return entries.map(({ session, room }) => (
						<li key={session.id}>
							<Entry session={session} room={room} index={0} taped sheet={sheet} />
						</li>
					));
				}
				const live = nowMin !== null && entries.some(({ session }) => sheet.liveIds.has(session.id));
				return (
					<li key={start} className={s.group}>
						<h3 className={`${s.groupTime} ${live ? s.groupLive : ''}`}>
							{formatMinutes(start)}
							{live && nowMin !== null && <span className={s.groupNow}>Now {formatMinutes(nowMin)}</span>}
						</h3>
						{entries.map(({ session, room }) => (
							<Entry
								key={session.id}
								session={session}
								room={room}
								index={entryKind(session) === 'talk' ? talks++ : 0}
								taped
								sheet={sheet}
							/>
						))}
					</li>
				);
			})}
		</ol>
	);
}

/* ============================ ROOT ============================ */

/** The room filter: every room, or one. No counts, just the names. */
function RoomFilter({
	columns,
	room,
	onPick,
}: {
	columns: AgendaColumn[];
	room: string | null;
	onPick: (room: string | null) => void;
}) {
	const options = [{ key: null, label: 'All rooms' }, ...columns];
	return (
		<ul className={s.rooms} aria-label="Filter by room">
			{options.map((option) => (
				<li key={option.key ?? 'all'}>
					<button
						type="button"
						className={s.room}
						aria-pressed={room === option.key}
						onClick={() => onPick(option.key)}
					>
						{option.label}
					</button>
				</li>
			))}
		</ul>
	);
}

export default function Agenda() {
	const { status, data } = useRemote(fetchAgenda, 'agenda', (l) => l.sessions.length === 0);
	const [selected, setSelected] = useState<Session | null>(null);
	const [room, setRoom] = useState<string | null>(null);
	const isNarrow = useMediaQuery(NARROW);

	const sessions = data?.sessions ?? EMPTY_SESSIONS;
	const rooms = data?.rooms ?? EMPTY_ROOMS;
	const profiles = useMemo(() => speakersById(data?.speakers ?? []), [data]);
	const partition = useMemo(() => partitionAgenda(sessions, rooms), [sessions, rooms]);
	const labels = useMemo(
		() => new Map(partition.columns.map((column) => [column.key, column.label])),
		[partition],
	);
	const columns = useMemo(() => sheetColumns(partition, room), [partition, room]);
	// What can be live or coming up: everything but an open-all-day room, which
	// would count as "a talk on now" from morning to evening.
	const slotted = useMemo(() => sessions.filter((session) => !isLongRunning(session)), [sessions]);
	const placements = useMemo(() => sessionPlacements(sessions), [sessions]);
	const lastTalkEnd = useMemo(
		() =>
			Math.max(
				...slotted.filter((x) => entryKind(x) === 'talk').map((x) => placements.get(x.id)?.endMin ?? 0),
				0,
			),
		[slotted, placements],
	);
	// Event-day "now" (hooks must run before the early returns below).
	const eventDate = useMemo(() => eventDateISO(sessions), [sessions]);
	const nowMin = useNowMinutes(eventDate);
	const now = useMemo(() => nowState(slotted, nowMin), [slotted, nowMin]);

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
	if (status === 'empty' || placements.size === 0) {
		return (
			<EmptyState action={{ href: '#talks', label: 'Browse all talks' }}>
				<p>The full schedule lands closer to the event.</p>
			</EmptyState>
		);
	}

	const sheet: SheetState = { ...now, lastTalkEnd, onOpen: setSelected };

	return (
		<>
			<div className={s.bar}>
				{partition.columns.length > 1 && <RoomFilter columns={partition.columns} room={room} onPick={setRoom} />}
				<p className={s.tz}>All times Prague (CET)</p>
			</div>

			{isNarrow ? (
				<AgendaList partition={partition} columns={columns} labels={labels} nowMin={nowMin} sheet={sheet} />
			) : (
				<AgendaGrid partition={partition} columns={columns} labels={labels} placements={placements} sheet={sheet} />
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
