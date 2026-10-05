import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import logoUrl from '../assets/logo.png?url';
import { eventDateISO, formatMinutes, isBand } from '../lib/agenda';
import { EVENT } from '../lib/event';
import { fetchAgenda, type Lineup } from '../lib/lineup';
import { isHostSession, type SessionSpeakerRef } from '../lib/sessions';
import { initials } from '../lib/speakers';
import {
	breakLabel,
	findColumn,
	isBreak,
	isDayOver,
	progress,
	roomFocus,
	roomSlug,
	startsIn,
	venueNow,
	type RoomNow,
	type Slot,
} from '../lib/tv';
import s from './TvScreen.module.scss';

/** The lineup endpoint is edge-cached for 15 min; polling faster costs nothing
 * and picks up a schedule fix within one cache window. */
const LINEUP_REFRESH_MS = 2 * 60_000;
const CLOCK_TICK_MS = 1_000;
/** A screen runs all day unattended: reload now and then so a deploy lands
 * and a long-lived tab can't drift. */
const RELOAD_MS = 3 * 60 * 60_000;

const PRAGUE = new Intl.DateTimeFormat('en-CA', {
	timeZone: 'Europe/Prague',
	year: 'numeric',
	month: '2-digit',
	day: '2-digit',
	hour: '2-digit',
	minute: '2-digit',
	hourCycle: 'h23',
});

interface Clock {
	date: string;
	minutes: number;
}

function pragueClock(at: Date): Clock {
	const parts = PRAGUE.formatToParts(at);
	const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
	return {
		date: `${get('year')}-${get('month')}-${get('day')}`,
		minutes: Number(get('hour')) * 60 + Number(get('minute')),
	};
}

interface Params {
	room: string;
	/** `?at=10:15` pins the clock to that time on the event day (then lets it
	 * run), so a screen can be checked before the day. */
	atMin: number | null;
}

function readParams(): Params {
	const query = new URLSearchParams(window.location.search);
	const at = /^(\d{1,2}):(\d{2})$/.exec(query.get('at') ?? '');
	return {
		room: query.get('room') ?? '',
		atMin: at ? Number(at[1]) * 60 + Number(at[2]) : null,
	};
}

/** The Prague wall clock, ticking. With `atMin` set it starts there on
 * `eventDate` instead of the real time. `phase` is how far into its minute
 * the clock was at mount, in seconds, for the sweep under the clock. */
function useClock(atMin: number | null, eventDate: string): Clock & { phase: number } {
	const [start] = useState(() => Date.now());
	const [tick, setTick] = useState(() => Date.now());
	useEffect(() => {
		// Checked every second, re-rendered only when the minute turns.
		const minuteOf = (at: number) => Math.floor((atMin === null ? at : at - start) / 60_000);
		const id = setInterval(() => {
			const at = Date.now();
			setTick((prev) => (minuteOf(prev) === minuteOf(at) ? prev : at));
		}, CLOCK_TICK_MS);
		return () => clearInterval(id);
	}, [atMin, start]);
	if (atMin === null) return { ...pragueClock(new Date(tick)), phase: (start % 60_000) / 1000 };
	return { date: eventDate, minutes: atMin + Math.floor((tick - start) / 60_000), phase: 0 };
}

/** Polls `load` every `everyMs`, keeping the last good payload on a failed read. */
function usePolled<T>(load: (signal: AbortSignal) => Promise<T>, everyMs: number, tag: string) {
	const [state, setState] = useState<{ data: T | null; failed: boolean }>({ data: null, failed: false });
	useEffect(() => {
		let ac = new AbortController();
		const run = () => {
			ac.abort();
			ac = new AbortController();
			const signal = ac.signal;
			load(signal)
				.then((data) => setState({ data, failed: false }))
				.catch((err) => {
					if (signal.aborted) return;
					console.warn(`[${tag}] refresh failed:`, err);
					setState((prev) => ({ ...prev, failed: true }));
				});
		};
		run();
		const id = setInterval(run, everyMs);
		return () => {
			clearInterval(id);
			ac.abort();
		};
		// Mount-only: `load` is a module-level function.
	}, []);
	return state;
}

/** Keep the TV from dimming, and reload every few hours. */
function useKioskUpkeep() {
	useEffect(() => {
		type WakeLock = { release: () => Promise<void> };
		const nav = navigator as Navigator & {
			wakeLock?: { request: (type: 'screen') => Promise<WakeLock> };
		};
		let lock: WakeLock | null = null;
		const acquire = () => {
			if (document.visibilityState !== 'visible' || !nav.wakeLock) return;
			nav.wakeLock
				.request('screen')
				.then((next) => {
					lock = next;
				})
				.catch(() => {});
		};
		acquire();
		document.addEventListener('visibilitychange', acquire);
		const reload = setTimeout(() => window.location.reload(), RELOAD_MS);
		return () => {
			document.removeEventListener('visibilitychange', acquire);
			clearTimeout(reload);
			lock?.release().catch(() => {});
		};
	}, []);
}

function loadLineup(signal: AbortSignal): Promise<Lineup> {
	return fetchAgenda(signal).then((lineup) => ({
		...lineup,
		sessions: lineup.sessions.filter((session) => !isHostSession(session)),
	}));
}

const DAY = new Intl.DateTimeFormat('en-GB', {
	timeZone: 'UTC',
	weekday: 'short',
	day: 'numeric',
	month: 'short',
});

/** `2026-10-30` → `Fri 30 Oct`. */
function dayLabel(date: string): string {
	const at = new Date(`${date}T12:00:00Z`);
	return Number.isNaN(at.getTime()) ? '' : DAY.format(at).replace(',', '');
}

function slotTime(slot: Slot): string {
	return `${formatMinutes(slot.place.startMin)}–${formatMinutes(slot.place.endMin)}`;
}

/** Minutes left in a live slot: `18 min left`, `1 h 5 min left`. */
function timeLeft(slot: Slot, nowMin: number | null): string {
	if (nowMin === null) return '';
	const left = Math.max(0, slot.place.endMin - nowMin);
	if (left < 60) return `${left} min left`;
	const minutes = left % 60;
	return `${Math.floor(left / 60)} h${minutes ? ` ${minutes} min` : ''} left`;
}

/** Long talk titles step down a size so they fit their line clamp. */
function titleSize(title: string): string {
	if (title.length > 70) return s.titleXl;
	if (title.length > 55) return s.titleLong;
	if (title.length > 40) return s.titleMid;
	return '';
}

/** `after the break`, `after lunch`. */
function afterBreak(gap: Slot): string {
	const label = breakLabel(gap.session);
	if (label === 'Break') return 'after the break';
	return `after ${label === 'Lunch' ? 'lunch' : label}`;
}

/** The word on a slot's chip. It steps up as the start nears, the way a
 * departures board goes from a time to Boarding: one word reads at a glance
 * where a countdown has to be parsed. Red is for Live alone. */
function chipFor(slot: Slot, live: boolean, nowMin: number | null): { text: string; live: boolean } {
	if (live) return { text: 'Live', live: true };
	if (nowMin === null) return { text: 'First up', live: false };
	if (slot.place.startMin - nowMin <= 2) return { text: 'Starting', live: false };
	return { text: 'Next', live: false };
}

function Chip({ text, live }: { text: string; live: boolean }) {
	return <span className={`${s.chip} ${live ? s.chipLive : ''}`}>{text}</span>;
}

/** The clock: Bebas digits and a seconds sweep that fills in 58.5 s and rests
 * until the minute turns, after the Swiss railway clock. */
function ClockFace({ minutes, phase, meta }: { minutes: number; phase: number; meta: string }) {
	return (
		<p className={s.clockBlock}>
			<span className={s.clock}>{formatMinutes(minutes)}</span>
			<span className={s.sweep} aria-hidden="true">
				<span style={{ animationDelay: `-${phase}s` }} />
			</span>
			<span className={s.clockMeta}>{meta}</span>
		</p>
	);
}

/** Portraits and names, and the tagline when one person gives the talk. */
function Speakers({ speakers }: { speakers: SessionSpeakerRef[] }) {
	if (speakers.length === 0) return null;
	const solo = speakers.length === 1;
	return (
		<ul className={`${s.speakers} ${solo ? '' : s.speakersMany}`}>
			{speakers.map((speaker) => (
				<li key={speaker.id} className={s.speaker}>
					{speaker.profilePicture ? (
						<img className={s.photo} src={speaker.profilePicture} alt="" />
					) : (
						<span className={s.monogram} aria-hidden="true">
							{initials(speaker.fullName) || '?'}
						</span>
					)}
					<span className={s.speakerText}>
						<span className={s.speakerName}>{speaker.fullName}</span>
						{solo && speaker.tagLine && <span className={s.speakerTag}>{speaker.tagLine}</span>}
					</span>
				</li>
			))}
		</ul>
	);
}

/** A live slot's progress: start, a thin line filling red, end. */
function Progress({ slot, nowMin, labels }: { slot: Slot; nowMin: number | null; labels: boolean }) {
	return (
		<div className={s.progressRow} aria-hidden="true">
			{labels && <span>{formatMinutes(slot.place.startMin)}</span>}
			<span className={s.progress}>
				<span style={{ transform: `scaleX(${progress(slot.place, nowMin)})` }} />
			</span>
			{labels && <span>{formatMinutes(slot.place.endMin)}</span>}
		</div>
	);
}

/** The room screen's main block: the talk on now, or the next one with its
 * countdown. A break never takes it: people on a break want what comes after,
 * so the break is a small tag beside the room name. */
function Hero({ slot, live, nowMin, note }: { slot: Slot; live: boolean; nowMin: number | null; note: string }) {
	const countdown = live ? '' : startsIn(slot.place.startMin, nowMin);
	return (
		<section className={s.hero} aria-labelledby="tv-hero-title">
			{note && <p className={s.notice}>{note}</p>}
			<p className={s.heroMeta}>
				<Chip {...chipFor(slot, live, nowMin)} />
				<span className={s.metaTime}>{slotTime(slot)}</span>
				{live && <span className={s.metaAside}>{timeLeft(slot, nowMin)}</span>}
				{countdown && <span className={s.metaAside}>Starts {countdown}</span>}
			</p>
			<h2 key={slot.session.id} id="tv-hero-title" className={`${s.heroTitle} ${s.flip} ${titleSize(slot.session.title)}`}>
				{slot.session.title}
			</h2>
			<Speakers speakers={slot.session.speakers} />
			{live && <Progress slot={slot} nowMin={nowMin} labels />}
		</section>
	);
}

/** The rail's first card: the talk after the hero in this room, with the
 * break before it named so nobody waits at the door through lunch. While the
 * hero is itself the next talk, this one is After that. */
function NextCard({
	slot,
	gap,
	nowMin,
	cramped,
	afterHero,
}: {
	slot: Slot;
	gap: Slot | null;
	nowMin: number | null;
	cramped: boolean;
	afterHero: boolean;
}) {
	const countdown = startsIn(slot.place.startMin, nowMin);
	const soon = nowMin !== null && slot.place.startMin - nowMin <= 10;
	return (
		<section className={`${s.next} ${soon ? s.nextSoon : ''} ${cramped ? s.nextCramped : ''}`} aria-labelledby="tv-next-title">
			<p className={s.nextTop}>
				<span className={s.cardLabel}>{afterHero ? 'After that' : 'Up next'}</span>
				{countdown && <span className={s.countdown}>{countdown}</span>}
			</p>
			<p className={s.nextWhen}>
				{slotTime(slot)}
				{gap && ` · ${afterBreak(gap)}`}
			</p>
			<h2 key={slot.session.id} id="tv-next-title" className={`${s.nextTitle} ${s.flip} ${titleSize(slot.session.title)}`}>
				{slot.session.title}
			</h2>
			{slot.session.speakers.length > 0 && (
				<p className={s.nextSpeakers}>{slot.session.speakers.map((sp) => sp.fullName).join(', ')}</p>
			)}
		</section>
	);
}

/** The talk a room shows in a summary: its live talk, else the next one.
 * Breaks and venue-wide sessions read the same in every room, so they are
 * skipped. */
function summarySlot(room: RoomNow): { slot: Slot; live: boolean } | null {
	const talk = (slot: Slot) => !isBand(slot.session) && !isBreak(slot.session);
	if (room.now && talk(room.now)) return { slot: room.now, live: true };
	const next = room.upcoming.find(talk);
	return next ? { slot: next, live: false } : null;
}

/** `Until 10:40` for a live talk; `11:00 · in 10 min` for the next one
 * within the hour, else just its start. Short, so it shares a line with the
 * room name. */
function summaryWhen(shown: { slot: Slot; live: boolean } | null, nowMin: number | null): string {
	if (!shown) return nowMin === null ? 'Nothing scheduled' : 'Done for today';
	const { place } = shown.slot;
	if (shown.live) return `Until ${formatMinutes(place.endMin)}`;
	const soon = nowMin !== null && place.startMin - nowMin < 60;
	return soon ? `${formatMinutes(place.startMin)} · ${startsIn(place.startMin, nowMin)}` : formatMinutes(place.startMin);
}

/** The rail under Up next: what the other rooms are showing. Titles get two
 * lines while every room fits, one line when they do not; a room that still
 * does not fit drops out whole (see `.elsewhereList`) rather than clip. */
function Elsewhere({
	rooms,
	nowMin,
	onCramped,
}: {
	rooms: RoomNow[];
	nowMin: number | null;
	onCramped: () => void;
}) {
	const items = rooms.map((room) => {
		const shown = summarySlot(room);
		return {
			key: room.column.key,
			label: room.column.label,
			when: summaryWhen(shown, nowMin),
			live: shown?.live ?? false,
			title: shown?.slot.session.title ?? '',
		};
	});
	const content = JSON.stringify(items);

	// Measured before paint, so the screen never shows the clipped version: a
	// wrapped room lands in a second column, which widens the list. When even
	// one-line titles do not fit, the Up next card gives up a line. Fonts that
	// arrive later change the measure, so they trigger a re-check.
	const list = useRef<HTMLUListElement>(null);
	const [dense, setDense] = useState(false);
	useLayoutEffect(() => setDense(false), [content]);
	useLayoutEffect(() => {
		const check = () => {
			const el = list.current;
			if (!el || el.scrollWidth <= el.clientWidth + 1) return;
			if (dense) onCramped();
			else setDense(true);
		};
		check();
		document.fonts?.addEventListener('loadingdone', check);
		return () => document.fonts?.removeEventListener('loadingdone', check);
	}, [dense, content]);

	return (
		<section className={s.elsewhere} aria-labelledby="tv-elsewhere-heading">
			<h2 id="tv-elsewhere-heading" className={s.cardLabel}>
				Other rooms
			</h2>
			<ul ref={list} className={`${s.elsewhereList} ${dense ? s.elsewhereDense : ''}`}>
				{items.map((item) => (
					<li key={item.key} className={s.elsewhereRoom}>
						<p className={s.elsewhereHead}>
							<span className={s.elsewhereName}>{item.label}</span>
							<span className={s.elsewhereMeta}>
								{item.live && <span className={s.dot} aria-hidden="true" />}
								{item.when}
							</span>
						</p>
						{item.title && (
							<p key={item.title} className={`${s.elsewhereTitle} ${s.flip}`}>
								{item.title}
							</p>
						)}
					</li>
				))}
			</ul>
		</section>
	);
}

/** The room screen's right column: Up next, then the other rooms. Every
 * room has to show, so when they do not fit the card gives up a title line;
 * that resets whenever what the rail shows changes. */
function Rail({
	next,
	gap,
	afterHero,
	others,
	nowMin,
}: {
	next: Slot | null;
	gap: Slot | null;
	afterHero: boolean;
	others: RoomNow[];
	nowMin: number | null;
}) {
	const [cramped, setCramped] = useState(false);
	const shows = [next, ...others.map((room) => summarySlot(room)?.slot ?? null)].map((slot) => slot?.session.id ?? '').join();
	useLayoutEffect(() => setCramped(false), [shows]);
	return (
		<div className={s.rail}>
			{next && <NextCard slot={next} gap={gap} nowMin={nowMin} cramped={cramped} afterHero={afterHero} />}
			{others.length > 0 && <Elsewhere rooms={others} nowMin={nowMin} onCramped={() => setCramped(true)} />}
		</div>
	);
}

/** The venue screen: a departures board, one row per room. The first column
 * is the talk on now, else the next one, so a break shows what comes after
 * it; the break itself is a small tag beside the heading. */
function Board({ rooms, nowMin }: { rooms: RoomNow[]; nowMin: number | null }) {
	const focus = rooms.map((room) => ({ room, ...roomFocus(room) }));
	const anyLive = focus.some((row) => row.live);
	return (
		<div className={`${s.board} ${rooms.length > 3 ? s.boardDense : ''}`}>
			<div className={s.boardHead} aria-hidden="true">
				<span>Room</span>
				<span>{anyLive ? 'Now' : 'Next'}</span>
				<span>{anyLive ? 'Next' : 'Then'}</span>
			</div>
			<ul className={s.boardRows}>
				{focus.map(({ room, lead, live, next, gap }) => (
					<li key={room.column.key} className={s.boardRow}>
						<h2 className={s.boardRoom}>{room.column.label}</h2>
						<div className={s.boardCell}>
							{lead ? (
								<>
									<p className={s.boardMeta}>
										<Chip {...chipFor(lead, live, nowMin)} />
										<span className={s.boardMetaText}>
											{live
												? `Until ${formatMinutes(lead.place.endMin)}`
												: `${formatMinutes(lead.place.startMin)}${nowMin === null ? '' : ` · ${startsIn(lead.place.startMin, nowMin)}`}`}
											{lead.session.speakers.length > 0 &&
												` · ${lead.session.speakers.map((sp) => sp.fullName).join(', ')}`}
										</span>
									</p>
									<p key={lead.session.id} className={`${s.boardTitle} ${s.flip} ${titleSize(lead.session.title)}`}>
										{lead.session.title}
									</p>
									{live && <Progress slot={lead} nowMin={nowMin} labels={false} />}
								</>
							) : (
								<p className={s.boardMeta}>{nowMin === null ? 'Nothing scheduled' : 'Done for today'}</p>
							)}
						</div>
						<div className={s.boardCell}>
							{next ? (
								<>
									<p className={s.boardMeta}>
										<span className={s.boardMetaText}>
											{formatMinutes(next.place.startMin)}
											{gap
												? ` · ${afterBreak(gap)}`
												: nowMin !== null &&
													next.place.startMin - nowMin < 60 &&
													` · ${startsIn(next.place.startMin, nowMin)}`}
										</span>
									</p>
									<p key={next.session.id} className={`${s.boardTitleSm} ${s.flip} ${titleSize(next.session.title)}`}>
										{next.session.title}
									</p>
								</>
							) : (
								lead && <p className={s.boardMeta}>Last of the day</p>
							)}
						</div>
					</li>
				))}
			</ul>
		</div>
	);
}

export default function TvScreen() {
	const [params, setParams] = useState<Params | null>(null);
	useEffect(() => setParams(readParams()), []);
	useKioskUpkeep();

	const lineup = usePolled(loadLineup, LINEUP_REFRESH_MS, 'tv-lineup');

	const sessions = lineup.data?.sessions ?? [];
	const eventDate = useMemo(() => eventDateISO(sessions), [sessions]);
	const clock = useClock(params?.atMin ?? null, eventDate);
	const nowMin = eventDate && clock.date === eventDate ? clock.minutes : null;

	const rooms = useMemo(
		() => venueNow(sessions, lineup.data?.rooms ?? [], nowMin),
		[sessions, lineup.data?.rooms, nowMin],
	);
	const column = params?.room ? findColumn(rooms.map((r) => r.column), params.room) : null;
	const here = column ? (rooms.find((r) => r.column.key === column.key) ?? null) : null;
	const others = rooms.filter((r) => r !== here);
	const dayOver = isDayOver(rooms, nowMin);
	const beforeDay = nowMin === null && eventDate !== '' && clock.date < eventDate;
	const dayNote = beforeDay ? `${EVENT.dateLabel} · ${EVENT.venue}` : '';

	// Room screen: the hero is the talk on now, else the next one; the card
	// under it is the talk after that.
	const focus = here ? roomFocus(here) : null;
	const hero = focus?.lead ?? null;
	// A break on now: the room's own, or on the board one that spans the venue.
	const pause = focus
		? focus.pause
		: (rooms.map((room) => roomFocus(room).pause).find((slot) => slot && isBand(slot.session)) ?? null);

	return (
		<div className={s.screen}>
			<header className={s.header}>
				<img className={s.logo} src={logoUrl} alt="DevFest.cz 2026" />
				<div className={s.titleRow}>
					<h1 className={s.heading}>{here ? here.column.label : 'Agenda'}</h1>
					{pause && (
						<p className={s.pause}>
							{breakLabel(pause.session)} until {formatMinutes(pause.place.endMin)}
						</p>
					)}
				</div>
				<ClockFace
					minutes={clock.minutes}
					phase={clock.phase}
					meta={lineup.failed && lineup.data !== null ? 'Reconnecting…' : dayLabel(clock.date)}
				/>
			</header>

			{lineup.data === null ? (
				<p className={s.status}>{lineup.failed ? 'Agenda unavailable, retrying…' : 'Loading agenda…'}</p>
			) : (
				<main className={s.main}>
					{params?.room && !column && (
						<p className={s.notice}>
							Unknown room “{params.room}”. Use one of: {rooms.map((r) => roomSlug(r.column.label)).join(', ')}
						</p>
					)}
					{dayNote && !hero && <p className={s.notice}>{dayNote}</p>}

					{here && focus ? (
						<div className={s.roomGrid}>
							{hero ? (
								<Hero slot={hero} live={focus.live} nowMin={nowMin} note={dayNote} />
							) : (
								<div className={s.wrap}>
									<p className={s.heroTitle}>
										{dayOver ? 'That’s a wrap.' : nowMin === null ? 'Agenda coming soon.' : 'That’s it in here.'}
									</p>
									<p className={s.wrapLine}>
										{dayOver
											? 'Thank you for coming to DevFest.cz 2026.'
											: nowMin === null
												? 'Talks for this room are being scheduled.'
												: 'The rest of the day is in the other rooms.'}
									</p>
								</div>
							)}
							{(focus.next || others.length > 0) && (
								<Rail next={focus.next} gap={focus.gap} afterHero={!focus.live} others={others} nowMin={nowMin} />
							)}
						</div>
					) : (
						<Board rooms={rooms} nowMin={nowMin} />
					)}
				</main>
			)}
		</div>
	);
}
