import { useEffect, useMemo, useState } from 'react';
import { type Speaker } from '../lib/speakers';
import { useRemoteData } from '../lib/useRemoteData';
import { visitorCategories, type Session } from '../lib/sessions';
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
import { fetchAgenda, type Lineup } from '../lib/lineup';
import SessionDetail from './SessionDetail';
import SpeakerAvatars from './SpeakerAvatars';
import { EmptyState, ErrorState, LoadingState } from './DataState';
import s from './Agenda.module.scss';

/** 5-minute grid snap + row height (px per snap unit) for the proportional grid.
 *
 * ROW_REM sets how much room a talk gets, and therefore how big its type can be.
 * At 15px a 30-minute talk was 90px tall and its contents needed 98 — already
 * clipping, with everything set at the smallest steps on the ramp to try to fit.
 * 1.625rem gives a half-hour talk 156px at the default root, which carries the
 * title at a readable size with its time, tags and speakers under it. It is the
 * row's MINIMUM: a row grows past it when the talk in it needs the space.
 *
 * In `rem`, NOT px: the row is the container for text, so it has to grow with
 * the text. At a 32px root (a 200% text-only zoom) fixed 26px rows left eight
 * cells overflowing their slot and one with no room for its title at all. */
const SNAP_MIN = 5;
const ROW_REM = 1.625;

/** Rows a non-talk strip gets, however long it runs.
 *
 * Bands and dead time carry one mono line, so drawing them to scale spends the
 * page on nothing: the afterparty runs 18:30–00:00 and at scale is twenty times
 * the height of the talk above it, and lunch alone is 80 minutes of hatch. Two
 * rows is that one line plus its padding. Talks stay proportional — the point of
 * the sheet is comparing them. */
const NON_TALK_ROWS = 2;

/** Track the width below which the timetable becomes the time-ordered list.
 *
 * NOT the site's phone breakpoint: this one is about the room columns, not the
 * page. A column is `minmax(9.5rem, 1fr)`, so from 1024 down a four-room day
 * renders ~150px columns and the Bebas titles truncate mid-word inside them —
 * the table survives, but nothing in it can be read. The list carries the same
 * day at those widths with the titles at full `--fs-row-sm`, so the grid is
 * only used where its columns are legible. */
function useIsNarrow(): boolean {
	const [narrow, setNarrow] = useState(false);
	useEffect(() => {
		const mql = window.matchMedia('(max-width: 1024px)');
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
	return (
		<SpeakerAvatars
			speakers={session.speakers}
			max={3}
			size={24}
			photoClass={s.avatar}
			monogramClass={`${s.avatar} ${s.avatarMono}`}
			wrapperClassName={s.avatars}
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
				{columns.map((column, i) => (
					<div key={column.key} className={s.headCell} style={{ gridColumn: i + 2, gridRow: 1 }}>
						{column.label}
					</div>
				))}

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
			{timed.map((session) => {
				const band = isBand(session);
				const names = speakerNames(session);
				const room = labels.get(roomKey(session)) ?? '';
				const live = liveIds.has(session.id);
				const time = timeParts(session);
				const body = (
					<>
						<span className={s.itemTime}>
							<span>{time?.from}</span>
							<span>{time?.to}</span>
						</span>
						<span className={s.itemMain}>
							<span className={s.itemTitleRow}>
								<span className={s.itemTitle}>{session.title}</span>
								<NowBadge live={live} coming={!band && comingUpIds.has(session.id)} />
							</span>
							{!band && <TalkTags session={session} />}
							{!band && (room || names) && (
								<span className={s.itemFoot}>
									<TalkAvatars session={session} />
									{/* The speakers carry the row's ink and the room sits under them, on
									    its own line: joined by a dot they wrapped mid-phrase on a phone,
									    which is where this line does its work — telling two parallel
									    talks apart. */}
									<span className={s.itemMeta}>
										{names && <span className={s.itemNames}>{names}</span>}
										{room && <span className={s.itemRoom}>{room}</span>}
									</span>
								</span>
							)}
						</span>
					</>
				);
				return (
					<li key={session.id}>
						{band ? (
							<div className={`field-row ${s.item} ${s.itemBand} ${live ? s.itemLive : ''}`}>{body}</div>
						) : (
							<button
								type="button"
								className={`field-row field-row--link ${s.item} ${live ? s.itemLive : ''}`}
								onClick={() => onOpen(session)}
								aria-label={talkLabel(session, room)}
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
	const { status, data } = useRemoteData<Lineup>(fetchAgenda, {
		isEmpty: (lineup) => lineup.sessions.length === 0,
		logLabel: '[agenda] Failed to load lineup:',
	});
	const sessions = data?.sessions ?? [];
	const speakersById = useMemo<Record<string, Speaker>>(
		() => (data ? Object.fromEntries(data.speakers.map((sp) => [sp.id, sp])) : {}),
		[data],
	);
	const [selected, setSelected] = useState<Session | null>(null);
	const isNarrow = useIsNarrow();

	const partition = useMemo(() => partitionAgenda(sessions), [sessions]);
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
			<EmptyState action={{ href: '/sessions', label: 'Browse all talks' }}>
				<p>The full schedule lands closer to the event.</p>
			</EmptyState>
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
					placements={placements}
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
					<ul className={`field ${s.unscheduledList}`} role="list">
						{partition.unscheduled.map((session) => (
							<li key={session.id}>
								<button
									type="button"
									className={`field-row field-row--link ${s.unscheduledItem}`}
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
