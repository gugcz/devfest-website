import { useEffect, useMemo, useState } from 'react';
import { speakerNames, visitorCategories, type Room, type Session } from '../lib/sessions';
import {
	byStart,
	dayRange,
	eventDateISO,
	formatClock,
	formatMinutes,
	isBand,
	nowState,
	partitionAgenda,
	placements as sessionPlacements,
	roomKey,
	type AgendaPartition,
	type Placement,
} from '../lib/agenda';
import { fetchAgenda, speakersById } from '../lib/lineup';
import { useRemote } from '../lib/useRemote';
import SessionDetail from './SessionDetail';
import SpeakerStack from './SpeakerStack';
import { EmptyState, ErrorState, LoadingState } from './DataState';
import s from './Agenda.module.scss';

/** Stable empty roster, so the memos below don't recompute on every render
 * before the payload lands. */
const EMPTY_SESSIONS: Session[] = [];
const EMPTY_ROOMS: Room[] = [];

/** A standing note beside a room's name in the room filter, keyed by its
 * Sessionize name (lowercased). Sessionize rooms carry no description, so it
 * lives here — rename the room there and this key must follow. */
const ROOM_NOTES: Record<string, string> = {
	'crime lab': 'Workshops',
};

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

/* ========================= PROGRAMME ========================= */

/** One line of the printed programme: everything that starts at one minute.
 * Parallel talks sit side by side in it; a break is a row of its own. */
interface ProgrammeRow {
	startMin: number;
	sessions: Session[];
}

/** The timed sessions grouped by start minute, in order. With a room picked,
 * only that room's talks stay, and the breaks: they stop the whole day. */
function programmeRows(
	partition: AgendaPartition,
	placements: Map<string, Placement>,
	room: string | null,
): ProgrammeRow[] {
	const talks = partition.columns
		.filter((column) => room === null || column.key === room)
		.flatMap((column) => partition.byRoom.get(column.key) ?? []);
	const rows = new Map<number, Session[]>();
	for (const session of [...partition.bands, ...talks].sort(byStart)) {
		const start = placements.get(session.id)?.startMin;
		if (start === undefined) continue;
		rows.set(start, [...(rows.get(start) ?? []), session]);
	}
	return [...rows].map(([startMin, sessions]) => ({ startMin, sessions }));
}

/** The row the red "Now" rule sits on: the last one that has started. */
function nowRowStart(rows: ProgrammeRow[], nowMin: number | null): number | null {
	if (nowMin === null) return null;
	const started = rows.filter((row) => row.startMin <= nowMin);
	return started.length > 0 ? started[started.length - 1].startMin : null;
}

/** A break, a lunch, registration: a band nobody speaks in. A plenum session
 * with speakers (the keynote) is a talk on the programme, not a pause. */
function isQuiet(session: Session): boolean {
	return isBand(session) && session.speakers.length === 0;
}

/** "Moonshine · 40 min" under a talk; either half drops when unknown. */
function slotMeta(room: string, place: Placement | undefined): string {
	const length = place ? `${place.endMin - place.startMin} min` : '';
	return [room, length].filter(Boolean).join(' · ');
}

/** The room filter over the programme. Rooms with nothing in them yet stay
 * out of it: a button that empties the page reads as a broken load. */
function RoomFilter({
	partition,
	room,
	onPick,
}: {
	partition: AgendaPartition;
	room: string | null;
	onPick: (room: string | null) => void;
}) {
	const rooms = partition.columns.filter((column) => (partition.byRoom.get(column.key) ?? []).length > 0);
	if (rooms.length <= 1) return null;
	const options = [{ key: null, label: 'All rooms', note: null }, ...rooms.map((column) => ({
		key: column.key,
		label: column.label,
		note: ROOM_NOTES[column.label.trim().toLowerCase()] ?? null,
	}))];
	return (
		<div className={s.filter} role="group" aria-label="Show one room">
			{options.map((option) => (
				<button
					key={option.key ?? 'all'}
					type="button"
					className={s.filterButton}
					aria-pressed={room === option.key}
					onClick={() => onPick(option.key)}
				>
					{option.label}
					{option.note && <span className={s.filterNote}>{option.note}</span>}
				</button>
			))}
		</div>
	);
}

function Slot({
	session,
	room,
	place,
	live,
	coming,
	onOpen,
}: {
	session: Session;
	room: string;
	place: Placement | undefined;
	live: boolean;
	coming: boolean;
	onOpen: (session: Session) => void;
}) {
	if (isQuiet(session)) {
		return (
			<div className={`${s.slot} ${s.slotBand}`}>
				<span className={s.bandTitle}>{session.title}</span>
				<NowBadge live={live} coming={false} />
			</div>
		);
	}
	const names = speakerNames(session);
	return (
		<button
			type="button"
			className={`${s.slot} ${live ? s.slotLive : ''}`}
			onClick={() => onOpen(session)}
			aria-label={talkLabel(session, room)}
			data-agenda-open
		>
			<span className={s.slotTitle}>{session.title}</span>
			{names && (
				<span className={s.slotFoot}>
					<TalkAvatars session={session} />
					<span className={s.slotNames}>{names}</span>
				</span>
			)}
			<span className={s.slotMeta}>
				{slotMeta(room, place)}
				<NowBadge live={live} coming={coming} />
			</span>
			<TalkTags session={session} />
		</button>
	);
}

function Programme({
	partition,
	placements,
	liveIds,
	comingUpIds,
	nowMin,
	onOpen,
}: {
	partition: AgendaPartition;
	placements: Map<string, Placement>;
	liveIds: Set<string>;
	comingUpIds: Set<string>;
	nowMin: number | null;
	onOpen: (session: Session) => void;
}) {
	const [room, setRoom] = useState<string | null>(null);
	const rows = programmeRows(partition, placements, room);
	const labels = roomLabels(partition);
	const nowAt = nowRowStart(rows, nowMin);

	return (
		<>
			<RoomFilter partition={partition} room={room} onPick={setRoom} />
			<ol className={s.programme}>
				{rows.map((row) => {
					const quiet = row.sessions.every(isQuiet);
					const isNow = row.startMin === nowAt;
					return (
						<li
							key={row.startMin}
							className={`${s.row} ${quiet ? s.rowQuiet : ''} ${isNow ? s.rowNow : ''}`}
						>
							{isNow && nowMin !== null && <span className={s.nowLabel}>Now {formatMinutes(nowMin)}</span>}
							<span className={s.time}>{formatMinutes(row.startMin)}</span>
							<div className={`${s.slots} ${row.sessions.length > 1 ? s.slotsParallel : ''}`}>
								{row.sessions.map((session) => (
									<Slot
										key={session.id}
										session={session}
										room={labels.get(roomKey(session)) ?? ''}
										place={placements.get(session.id)}
										live={liveIds.has(session.id)}
										coming={comingUpIds.has(session.id)}
										onOpen={onOpen}
									/>
								))}
							</div>
						</li>
					);
				})}
			</ol>
		</>
	);
}

/* ============================ ROOT ============================ */

export default function Agenda() {
	const { status, data } = useRemote(fetchAgenda, 'agenda', (l) => l.sessions.length === 0);
	const [selected, setSelected] = useState<Session | null>(null);

	const sessions = data?.sessions ?? EMPTY_SESSIONS;
	const rooms = data?.rooms ?? EMPTY_ROOMS;
	const profiles = useMemo(() => speakersById(data?.speakers ?? []), [data]);
	const partition = useMemo(() => partitionAgenda(sessions, rooms), [sessions, rooms]);
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

	return (
		<>
			<p className={s.tzNote}>All times Prague (CET)</p>

			<Programme
				partition={partition}
				placements={placements}
				liveIds={now.liveIds}
				comingUpIds={now.comingUpIds}
				nowMin={nowMin}
				onOpen={setSelected}
			/>

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
