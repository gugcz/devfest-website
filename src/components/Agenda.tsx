import { useEffect, useMemo, useState } from 'react';
import { initials, type Speaker } from '../lib/speakers';
import { visitorCategories, type Session } from '../lib/sessions';
import {
	byStart,
	dayRange,
	eventDateISO,
	formatClock,
	formatMinutes,
	isBand,
	nowState,
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

/** Up to three visitor-facing category values (Track / Level / …) for a talk. */
function talkTags(session: Session): string[] {
	return visitorCategories(session)
		.flatMap((category) => category.values)
		.slice(0, 3);
}

/** Small speaker photos (up to three, overlapping) with a monogram fallback —
 * the /sessions card stack sized down for the timetable. Decorative: the names
 * carry the accessible info, so this is aria-hidden. */
function TalkAvatars({ session }: { session: Session }) {
	const shown = session.speakers.slice(0, 3);
	if (shown.length === 0) return null;
	return (
		<span className={s.avatars} aria-hidden="true">
			{shown.map((sp) =>
				sp.profilePicture ? (
					<img
						key={sp.id}
						className={s.avatar}
						src={sp.profilePicture}
						alt=""
						loading="lazy"
						decoding="async"
						width={24}
						height={24}
						onError={(e) => {
							(e.currentTarget as HTMLImageElement).style.visibility = 'hidden';
						}}
					/>
				) : (
					<span key={sp.id} className={`${s.avatar} ${s.avatarMono}`}>
						{initials(sp.fullName) || '?'}
					</span>
				),
			)}
		</span>
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

/* ============================ GRID ============================ */

// Each session is placed by its absolute grid row in its room column. Two
// sessions overlapping in the SAME room would render on top of each other —
// lane-splitting is an explicit non-goal (conference rooms run sequentially;
// parallel tracks are different rooms). Add it only if real data ever overlaps.
function AgendaGrid({
	partition,
	range,
	liveIds,
	comingUpIds,
	nowMin,
	onOpen,
}: {
	partition: AgendaPartition;
	range: { start: number; end: number };
	liveIds: Set<string>;
	comingUpIds: Set<string>;
	nowMin: number | null;
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
								className={`${s.band} ${liveIds.has(session.id) ? s.bandLive : ''}`}
								style={{ gridColumn: '2 / -1', gridRow }}
							>
								<span className={s.bandTime}>{timeRange(session)}</span>
								<span className={s.bandTitle}>{session.title}</span>
								<NowBadge live={liveIds.has(session.id)} coming={false} />
							</div>
						);
					}

					const colIndex = columns.indexOf(room) + 2;
					const live = liveIds.has(session.id);
					return (
						<button
							key={session.id}
							type="button"
							className={`${s.cell} ${live ? s.cellLive : ''}`}
							style={{ gridColumn: colIndex, gridRow }}
							onClick={() => onOpen(session)}
							aria-label={talkLabel(session)}
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
		...partition.columns.flatMap((room) => partition.byRoom.get(room) ?? []),
	].sort(byStart);
	return (
		<ul className={s.list} role="list">
			{timed.map((session) => {
				const band = isBand(session);
				const names = speakerNames(session);
				const room = session.room.trim();
				const live = liveIds.has(session.id);
				const body = (
					<>
						<span className={s.itemTime}>{timeRange(session)}</span>
						<span className={s.itemMain}>
							<span className={s.itemTitleRow}>
								<span className={s.itemTitle}>{session.title}</span>
								<NowBadge live={live} coming={!band && comingUpIds.has(session.id)} />
							</span>
							{!band && <TalkTags session={session} />}
							{!band && (room || names) && (
								<span className={s.itemFoot}>
									<TalkAvatars session={session} />
									<span className={s.itemMeta}>{[room, names].filter(Boolean).join(' · ')}</span>
								</span>
							)}
						</span>
					</>
				);
				return (
					<li key={session.id}>
						{band ? (
							<div className={`${s.item} ${s.itemBand} ${live ? s.itemLive : ''}`}>{body}</div>
						) : (
							<button
								type="button"
								className={`${s.item} ${live ? s.itemLive : ''}`}
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
	// Event-day "now" line + live/coming-up badges (hooks must run before the
	// early returns below).
	const eventDate = useMemo(() => eventDateISO(state.sessions), [state.sessions]);
	const nowMin = useNowMinutes(eventDate);
	const now = useMemo(() => nowState(state.sessions, nowMin), [state.sessions, nowMin]);

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
				<AgendaList
					partition={partition}
					liveIds={now.liveIds}
					comingUpIds={now.comingUpIds}
					onOpen={setSelected}
				/>
			) : (
				<AgendaGrid
					partition={partition}
					range={range}
					liveIds={now.liveIds}
					comingUpIds={now.comingUpIds}
					nowMin={nowMin}
					onOpen={setSelected}
				/>
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
