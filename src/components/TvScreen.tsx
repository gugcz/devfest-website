import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import logoUrl from '../assets/logo.png?url';
import { eventDateISO, formatMinutes, isBand } from '../lib/agenda';
import { EVENT } from '../lib/event';
import { fetchAgenda, type Lineup } from '../lib/lineup';
import { isHostSession, type SessionSpeakerRef } from '../lib/sessions';
import { initials } from '../lib/speakers';
import { findColumn, isDayOver, progress, startsIn, venueNow, type RoomNow, type Slot } from '../lib/tv';
import s from './TvScreen.module.scss';

/** The lineup endpoint is edge-cached for 15 min; polling faster costs nothing
 * and picks up a schedule fix within one cache window. */
const LINEUP_REFRESH_MS = 2 * 60_000;
const CLOCK_TICK_MS = 5_000;
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
 * `eventDate` instead of the real time. */
function useClock(atMin: number | null, eventDate: string): Clock {
	const [start] = useState(() => Date.now());
	const [tick, setTick] = useState(() => Date.now());
	useEffect(() => {
		const id = setInterval(() => setTick(Date.now()), CLOCK_TICK_MS);
		return () => clearInterval(id);
	}, []);
	if (atMin === null) return pragueClock(new Date(tick));
	return { date: eventDate, minutes: atMin + Math.floor((tick - start) / 60_000) };
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

function isBreak(slot: Slot): boolean {
	return isBand(slot.session) || slot.session.isServiceSession;
}

/** `lg`: portraits, and the tagline when one person gives the talk; `md`:
 * names only. */
function Speakers({ speakers, size }: { speakers: SessionSpeakerRef[]; size: 'lg' | 'md' }) {
	if (speakers.length === 0) return null;
	const solo = speakers.length === 1;
	return (
		<ul className={`${s.speakers} ${s[`speakers-${size}`]} ${solo ? '' : s.speakersMany}`}>
			{speakers.map((speaker) => (
				<li key={speaker.id} className={s.speaker}>
					{size === 'lg' &&
						(speaker.profilePicture ? (
							<img className={s.photo} src={speaker.profilePicture} alt="" />
						) : (
							<span className={s.monogram} aria-hidden="true">
								{initials(speaker.fullName) || '?'}
							</span>
						))}
					<span className={s.speakerText}>
						<span className={s.speakerName}>{speaker.fullName}</span>
						{size === 'lg' && solo && speaker.tagLine && <span className={s.speakerTag}>{speaker.tagLine}</span>}
					</span>
				</li>
			))}
		</ul>
	);
}

/** The room screen's main block: the talk on now, or — between talks and
 * before the day — the next one with its countdown. */
function Hero({ slot, live, nowMin, note }: { slot: Slot; live: boolean; nowMin: number | null; note: string }) {
	const countdown = live ? '' : startsIn(slot.place.startMin, nowMin);
	return (
		<section className={`${s.hero} ${isBreak(slot) ? s.heroBreak : ''}`} aria-labelledby="tv-hero-title">
			{note && <p className={s.notice}>{note}</p>}
			<p className={s.heroMeta}>
				<span className={s.state}>
					{live && <span className={s.dot} aria-hidden="true" />}
					{live ? 'Now' : nowMin === null ? 'First up' : 'Up next'}
				</span>
				<span className={s.metaTime}>{slotTime(slot)}</span>
				{live && <span className={s.metaAside}>{timeLeft(slot, nowMin)}</span>}
				{countdown && <span className={s.metaAside}>Starts {countdown}</span>}
			</p>
			<h2 id="tv-hero-title" className={`${s.heroTitle} ${titleSize(slot.session.title)}`}>
				{slot.session.title}
			</h2>
			<Speakers speakers={slot.session.speakers} size="lg" />
			{live && (
				<div className={s.progress} aria-hidden="true">
					<span style={{ transform: `scaleX(${progress(slot.place, nowMin)})` }} />
				</div>
			)}
		</section>
	);
}

/** The rail's first card: what comes after the hero in this room. */
function NextCard({ slot, nowMin }: { slot: Slot; nowMin: number | null }) {
	const countdown = startsIn(slot.place.startMin, nowMin);
	return (
		<section className={s.next} aria-labelledby="tv-next-title">
			<p className={s.nextTop}>
				<span className={s.cardLabel}>
					Up next&ensp;<span className={s.metaTime}>{formatMinutes(slot.place.startMin)}</span>
				</span>
				{countdown && <span className={s.countdown}>{countdown}</span>}
			</p>
			<h2 id="tv-next-title" className={`${s.nextTitle} ${titleSize(slot.session.title)}`}>
				{slot.session.title}
			</h2>
			<Speakers speakers={slot.session.speakers} size="md" />
		</section>
	);
}

/** What the slot a room shows in a summary is: its live talk, else the next
 * one. A venue-wide band reads the same in every room, so it is skipped. */
function summarySlot(room: RoomNow): { slot: Slot; live: boolean } | null {
	if (room.now && !isBand(room.now.session)) return { slot: room.now, live: true };
	const next = room.upcoming.find((slot) => !isBand(slot.session));
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
function Elsewhere({ rooms, nowMin }: { rooms: RoomNow[]; nowMin: number | null }) {
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
	// wrapped room lands in a second column, which widens the list. Fonts that
	// arrive later change the measure, so they trigger a re-check.
	const list = useRef<HTMLUListElement>(null);
	const [dense, setDense] = useState(false);
	useLayoutEffect(() => setDense(false), [content]);
	useLayoutEffect(() => {
		if (dense) return;
		const check = () => {
			const el = list.current;
			if (el && el.scrollWidth > el.clientWidth + 1) setDense(true);
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
						{item.title && <p className={s.elsewhereTitle}>{item.title}</p>}
					</li>
				))}
			</ul>
		</section>
	);
}

/** The venue screen: a departures-board row per room, Now and Next. */
function Board({ rooms, nowMin }: { rooms: RoomNow[]; nowMin: number | null }) {
	return (
		<div className={`${s.board} ${rooms.length > 3 ? s.boardDense : ''}`}>
			<div className={s.boardHead} aria-hidden="true">
				<span>Room</span>
				<span>Now</span>
				<span>Next</span>
			</div>
			<ul className={s.boardRows}>
				{rooms.map((room) => {
					const next = room.upcoming[0] ?? null;
					return (
						<li key={room.column.key} className={s.boardRow}>
							<h2 className={s.boardRoom}>{room.column.label}</h2>
							<div className={s.boardCell}>
								{room.now ? (
									<>
										<p className={`${s.boardTitle} ${isBreak(room.now) ? s.boardBreak : ''}`}>
											{room.now.session.title}
										</p>
										<p className={s.boardMeta}>
											<span className={s.dot} aria-hidden="true" /> Until {formatMinutes(room.now.place.endMin)}
											{room.now.session.speakers.length > 0 &&
												` · ${room.now.session.speakers.map((sp) => sp.fullName).join(', ')}`}
										</p>
									</>
								) : (
									<p className={s.boardMeta}>
										{nowMin === null ? 'Starts ' + (next ? formatMinutes(next.place.startMin) : 'later') : 'Between talks'}
									</p>
								)}
							</div>
							<div className={s.boardCell}>
								{next ? (
									<>
										<p className={`${s.boardTitleSm} ${isBreak(next) ? s.boardBreak : ''}`}>{next.session.title}</p>
										<p className={s.boardMeta}>
											{formatMinutes(next.place.startMin)}
											{nowMin !== null && ` · ${startsIn(next.place.startMin, nowMin)}`}
										</p>
									</>
								) : (
									<p className={s.boardMeta}>{room.now ? 'Last of the day' : 'Done for today'}</p>
								)}
							</div>
						</li>
					);
				})}
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

	// Room screen: the hero is the live slot, else the next one; the card
	// under it is whatever follows the hero.
	const hero = here ? (here.now ?? here.upcoming[0] ?? null) : null;
	const queue = here ? (here.now ? here.upcoming : here.upcoming.slice(1)) : [];

	return (
		<div className={s.screen}>
			<header className={s.header}>
				<img className={s.logo} src={logoUrl} alt="DevFest.cz 2026" />
				<h1 className={s.heading}>{here ? here.column.label : 'Programme'}</h1>
				<p className={s.clockBlock}>
					<span className={s.clock}>{formatMinutes(clock.minutes)}</span>
					<span className={s.clockMeta}>
						{lineup.failed && lineup.data !== null ? 'Reconnecting…' : dayLabel(clock.date)}
					</span>
				</p>
			</header>

			{lineup.data === null ? (
				<p className={s.status}>{lineup.failed ? 'Programme unavailable, retrying…' : 'Loading programme…'}</p>
			) : (
				<main className={s.main}>
					{params?.room && !column && (
						<p className={s.notice}>
							Unknown room “{params.room}”. Use one of: {rooms.map((r) => r.column.key).join(', ')}
						</p>
					)}
					{dayNote && !hero && <p className={s.notice}>{dayNote}</p>}

					{here ? (
						<div className={s.roomGrid}>
							{hero ? (
								<Hero slot={hero} live={hero === here.now} nowMin={nowMin} note={dayNote} />
							) : (
								<div className={s.wrap}>
									<p className={s.heroTitle}>
										{dayOver ? 'That’s a wrap.' : nowMin === null ? 'Programme soon.' : 'That’s it in here.'}
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
							{(queue[0] || others.length > 0) && (
								<div className={s.rail}>
									{queue[0] && <NextCard slot={queue[0]} nowMin={nowMin} />}
									{others.length > 0 && <Elsewhere rooms={others} nowMin={nowMin} />}
								</div>
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
