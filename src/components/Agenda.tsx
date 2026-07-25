import { useEffect, useMemo, useState } from 'react';
import type { Speaker } from '../lib/speakers';
import type { Session } from '../lib/sessions';
import {
	byStart,
	dayRange,
	formatClock,
	formatMinutes,
	isBand,
	partitionAgenda,
	placement,
	type AgendaPartition,
} from '../lib/agenda';
import { fetchAgenda } from '../lib/lineup';
import SessionDetail from './SessionDetail';
import s from './Agenda.module.scss';

type Status = 'loading' | 'ready' | 'empty' | 'error';

interface State {
	status: Status;
	sessions: Session[];
}

const INITIAL: State = { status: 'loading', sessions: [] };

/** 5-minute grid snap + row height (px per snap unit) for the proportional grid. */
const SNAP_MIN = 5;
const ROW_PX = 15;

/** Track the mobile breakpoint. Matches `Menu.astro`'s `(max-width: 760px)` —
 * the site has no shared breakpoint token, so the literal is kept in sync. */
function useIsNarrow(): boolean {
	const [narrow, setNarrow] = useState(false);
	useEffect(() => {
		const mql = window.matchMedia('(max-width: 760px)');
		const update = () => setNarrow(mql.matches);
		update();
		mql.addEventListener('change', update);
		return () => mql.removeEventListener('change', update);
	}, []);
	return narrow;
}

/** Accessible label for a talk cell — omits the room clause when unassigned. */
function talkLabel(session: Session): string {
	const time = formatClock(session.startsAt);
	const room = session.room.trim();
	return room ? `${session.title} — ${time} in ${room}` : `${session.title} — ${time}`;
}

/** Start–end wall-clock range (`09:00–09:45`), fallback end included. */
function timeRange(session: Session): string {
	const place = placement(session);
	if (!place) return '';
	return `${formatMinutes(place.startMin)}–${formatMinutes(place.endMin)}`;
}

/** Comma-joined presenter names, empties dropped. */
function speakerNames(session: Session): string {
	return session.speakers.map((sp) => sp.fullName).filter(Boolean).join(', ');
}

/* ============================ GRID ============================ */

// Each session is placed by its absolute grid row in its room column. Two
// sessions overlapping in the SAME room would render on top of each other —
// lane-splitting is an explicit non-goal (conference rooms run sequentially;
// parallel tracks are different rooms). Add it only if real data ever overlaps.
function AgendaGrid({
	partition,
	range,
	onOpen,
}: {
	partition: AgendaPartition;
	range: { start: number; end: number };
	onOpen: (session: Session) => void;
}) {
	const { columns, bands, byRoom } = partition;
	const totalRows = Math.ceil((range.end - range.start) / SNAP_MIN);

	// One header row (sticky room names) + the timed body rows.
	const gridStyle = {
		gridTemplateColumns: `4.25rem repeat(${columns.length}, minmax(9.5rem, 1fr))`,
		gridTemplateRows: `auto repeat(${totalRows}, ${ROW_PX}px)`,
	} as const;

	// Body row for a minutes value (row 1 is the header, body starts at row 2).
	const rowFor = (min: number) => 2 + Math.floor((min - range.start) / SNAP_MIN);

	// Hour ticks down the time gutter.
	const firstHour = Math.ceil(range.start / 60);
	const lastHour = Math.floor(range.end / 60);
	const ticks: number[] = [];
	for (let h = firstHour; h <= lastHour; h += 1) ticks.push(h * 60);

	// Talks + bands in one time-sorted list so DOM (reading) order matches the
	// mobile list and screen-reader order, independent of visual placement.
	const talks = columns.flatMap((room) =>
		(byRoom.get(room) ?? []).map((session) => ({ session, room })),
	);
	const placed = [
		...bands.map((session) => ({ kind: 'band' as const, session, room: '' })),
		...talks.map(({ session, room }) => ({ kind: 'talk' as const, session, room })),
	].sort((a, b) => byStart(a.session, b.session));

	return (
		<div className={s.scroller}>
			<div className={s.grid} style={gridStyle} role="presentation">
				{/* Header row: empty time-gutter corner + room names */}
				<div className={`${s.headCell} ${s.headCorner}`} aria-hidden="true" />
				{columns.map((room, i) => (
					<div key={room} className={s.headCell} style={{ gridColumn: i + 2, gridRow: 1 }}>
						{room}
					</div>
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

				{placed.map(({ kind, session, room }) => {
					const place = placement(session);
					if (!place) return null;
					const rowStart = rowFor(place.startMin);
					const rowSpan = Math.max(1, Math.round(place.spanMin / SNAP_MIN));
					const gridRow = `${rowStart} / span ${rowSpan}`;

					if (kind === 'band') {
						return (
							<div
								key={session.id}
								className={s.band}
								style={{ gridColumn: '2 / -1', gridRow }}
							>
								<span className={s.bandTime}>{timeRange(session)}</span>
								<span className={s.bandTitle}>{session.title}</span>
							</div>
						);
					}

					const colIndex = columns.indexOf(room) + 2;
					return (
						<button
							key={session.id}
							type="button"
							className={s.cell}
							style={{ gridColumn: colIndex, gridRow }}
							onClick={() => onOpen(session)}
							aria-label={talkLabel(session)}
							data-agenda-open
						>
							<span className={s.cellTime}>{timeRange(session)}</span>
							<span className={s.cellTitle}>{session.title}</span>
							{session.speakers.length > 0 && (
								<span className={s.cellSpeakers}>{speakerNames(session)}</span>
							)}
						</button>
					);
				})}
			</div>
		</div>
	);
}

/* ============================ LIST ============================ */

function AgendaList({
	partition,
	onOpen,
}: {
	partition: AgendaPartition;
	onOpen: (session: Session) => void;
}) {
	// Same timed set the grid places, from the one memoized partition (bands +
	// every room column, incl. Room-TBA) so the two layouts never drift.
	const timed = [
		...partition.bands,
		...partition.columns.flatMap((room) => partition.byRoom.get(room) ?? []),
	].sort(byStart);
	return (
		<ul className={s.list} role="list">
			{timed.map((session) => {
				const band = isBand(session);
				const names = speakerNames(session);
				const room = session.room.trim();
				const body = (
					<>
						<span className={s.itemTime}>{timeRange(session)}</span>
						<span className={s.itemMain}>
							<span className={s.itemTitle}>{session.title}</span>
							{!band && (room || names) && (
								<span className={s.itemMeta}>{[room, names].filter(Boolean).join(' · ')}</span>
							)}
						</span>
					</>
				);
				return (
					<li key={session.id}>
						{band ? (
							<div className={`${s.item} ${s.itemBand}`}>{body}</div>
						) : (
							<button
								type="button"
								className={s.item}
								onClick={() => onOpen(session)}
								aria-label={talkLabel(session)}
								data-agenda-open
							>
								{body}
							</button>
						)}
					</li>
				);
			})}
		</ul>
	);
}

/* ============================ ROOT ============================ */

export default function Agenda() {
	const [state, setState] = useState<State>(INITIAL);
	const [speakersById, setSpeakersById] = useState<Record<string, Speaker>>({});
	const [selected, setSelected] = useState<Session | null>(null);
	const isNarrow = useIsNarrow();

	useEffect(() => {
		const ac = new AbortController();
		fetchAgenda(ac.signal)
			.then(({ sessions, speakers }) => {
				setSpeakersById(Object.fromEntries(speakers.map((sp) => [sp.id, sp])));
				setState({ status: sessions.length > 0 ? 'ready' : 'empty', sessions });
			})
			.catch((err) => {
				if (ac.signal.aborted) return;
				console.warn('[agenda] Failed to load lineup:', err);
				setState((prev) => ({ ...prev, status: 'error' }));
			});
		return () => ac.abort();
	}, []);

	const partition = useMemo(() => partitionAgenda(state.sessions), [state.sessions]);
	const range = useMemo(() => dayRange(state.sessions), [state.sessions]);

	if (state.status === 'error') {
		return (
			<div className={s.status} role="alert">
				<p>The agenda is temporarily unavailable. Please check back soon.</p>
			</div>
		);
	}

	if (state.status === 'loading') {
		return (
			<p className={s.loadingStatus} role="status">
				<span className={s.loadingDot} aria-hidden="true" />
				Loading agenda
				<span className={s.loadingDots} aria-hidden="true">
					<span />
					<span />
					<span />
				</span>
			</p>
		);
	}

	// No sessions at all, or none scheduled yet → the schedule isn't published.
	if (state.status === 'empty' || range === null) {
		return (
			<div className={s.status}>
				<p>The full schedule lands closer to the event.</p>
				<a className="btn-ghost" href="/sessions">
					Browse all talks
					<span className="btn-ghost-arrow" aria-hidden="true">→</span>
				</a>
			</div>
		);
	}

	// One column (or a phone) reads better as the time-ordered list.
	const asList = isNarrow || partition.columns.length <= 1;

	return (
		<>
			<p className={s.tzNote}>All times Prague (CET)</p>

			{asList ? (
				<AgendaList partition={partition} onOpen={setSelected} />
			) : (
				<AgendaGrid partition={partition} range={range} onOpen={setSelected} />
			)}

			{partition.unscheduled.length > 0 && (
				<section className={s.unscheduled} aria-label="Not yet scheduled">
					<h3 className={s.unscheduledHead}>Not yet scheduled</h3>
					<ul className={s.unscheduledList} role="list">
						{partition.unscheduled.map((session) => (
							<li key={session.id}>
								<button
									type="button"
									className={s.unscheduledItem}
									onClick={() => setSelected(session)}
									aria-label={`View details for ${session.title}`}
								>
									{session.title}
								</button>
							</li>
						))}
					</ul>
				</section>
			)}

			<div className={s.crosslink}>
				<a className="btn-ghost" href="/sessions">
					Browse all talks
					<span className="btn-ghost-arrow" aria-hidden="true">→</span>
				</a>
			</div>

			{selected && (
				<SessionDetail
					session={selected}
					speakersById={speakersById}
					onClose={() => setSelected(null)}
				/>
			)}
		</>
	);
}
