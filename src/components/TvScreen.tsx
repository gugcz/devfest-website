import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import logoUrl from '../assets/logo.png?url';
import { eventDateISO, formatMinutes, isBand, roomKey } from '../lib/agenda';
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
	type RoomFocus,
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
const RELOAD_MS = 15 * 60_000;
/** How long the credits band holds one page of partner logos. */
const PARTNER_GROUP_MS = 8_000;

/** One page of the credits band's partner loop: a tier, or part of a big
 * one, resolved at build by `tv.astro`. `w` is the mark's equal-area width
 * in `--u`; a `dark` master sits on a white card. */
export interface PartnerGroup {
	label: string;
	logos: { name: string; src: string; w: number; dark: boolean }[];
}

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
	/** `?rotate=90` or `?rotate=270` turns the screen a quarter clockwise or
	 * counter-clockwise, for a TV hung on its side that still reports
	 * landscape. */
	rotate: '90' | '270' | null;
}

function readParams(): Params {
	const query = new URLSearchParams(window.location.search);
	const at = /^(\d{1,2}):(\d{2})$/.exec(query.get('at') ?? '');
	const rotate = query.get('rotate');
	return {
		room: query.get('room') ?? '',
		atMin: at ? Number(at[1]) * 60 + Number(at[2]) : null,
		rotate: rotate === '90' || rotate === '270' ? rotate : null,
	};
}

/** The Prague wall clock, ticking. With `atMin` set it starts there on
 * `eventDate` instead of the real time. */
function useClock(atMin: number | null, eventDate: string): Clock {
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

/** Whether the screen hangs on its side: the viewport's orientation, swapped
 * by a quarter `rotate`. The rail measures what fits, so it starts over when
 * the screen turns. */
function usePortrait(rotated: boolean): boolean {
	const [portrait, setPortrait] = useState(false);
	useEffect(() => {
		const query = window.matchMedia('(orientation: portrait)');
		const update = () => setPortrait(query.matches);
		update();
		query.addEventListener('change', update);
		return () => query.removeEventListener('change', update);
	}, []);
	return rotated ? !portrait : portrait;
}

/** Bumps when a web font finishes loading: text measured in the fallback
 * face has to be measured again. */
function useFontEpoch(): number {
	const [epoch, setEpoch] = useState(0);
	useEffect(() => {
		const bump = () => setEpoch((e) => e + 1);
		document.fonts?.addEventListener('loadingdone', bump);
		return () => document.fonts?.removeEventListener('loadingdone', bump);
	}, []);
	return epoch;
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

const TITLE_SIZES = ['', s.titleMid, s.titleLong, s.titleXl];

/** Long talk titles step down a size so they fit their line clamp; `step`
 * takes them one further where another line shares their room. */
function titleSize(title: string, step = 0): string {
	const size = [40, 55, 70].filter((length) => title.length > length).length + step;
	return TITLE_SIZES[Math.min(size, TITLE_SIZES.length - 1)];
}

/** `after the break`, `after lunch`. */
function afterBreak(gap: Slot): string {
	const label = breakLabel(gap.session);
	return label === 'Break' ? 'after the break' : `after ${label.toLowerCase()}`;
}

/** The room a shared session is held in, named on the other rooms' screens
 * (the kick-off in Moonshine, on the Speakeasy screen). Empty in its own room
 * and for a break that has no room. */
function heldIn(slot: Slot | null, here: string, rooms: RoomNow[]): string {
	const key = slot ? roomKey(slot.session) : '';
	if (!slot || !key || key === here) return '';
	return rooms.find((room) => room.column.key === key)?.column.label ?? slot.session.room.trim();
}

/** A line's parts that have something to say, `·` between them. */
const joinNote = (...parts: string[]) => parts.filter(Boolean).join(' · ');

/** A line in the note voice with its figures in mono, the way the site sets
 * a time or a count inside typewriter text (`.fig`). */
function Note({ text }: { text: string }) {
	return (
		<>
			{text.split(/(\d+(?:[:–]\d+)*)/).map((part, i) =>
				i % 2 ? (
					<span key={i} className={s.fig}>
						{part}
					</span>
				) : (
					part
				),
			)}
		</>
	);
}

/** The state word on a slot. It steps up as the start nears, the way a
 * departures board goes from a time to Boarding: one word reads at a glance
 * where a countdown has to be parsed. Red is for Live now alone. */
function flagFor(slot: Slot, live: boolean, nowMin: number | null): string {
	if (live) return 'Live now';
	if (nowMin === null) return 'First up';
	if (slot.place.startMin - nowMin <= 2) return 'Starting';
	return 'Next';
}

function Flag({ text, live }: { text: string; live: boolean }) {
	return <span className={`${s.flag} ${live ? s.flagLive : ''}`}>{text}</span>;
}

/** A talk this close to its start gets its countdown ringed. */
const SOON_MIN = 10;

const isSoon = (slot: Slot, nowMin: number | null) => nowMin !== null && slot.place.startMin - nowMin <= SOON_MIN;

/** The red grease pencil, the page's one mark: a ring round the countdown
 * to a talk inside ten minutes (the hero's while it is the next talk, else
 * Up next's), or a stroke under the day's sign-off. */
const GREASE = {
	ring: { box: '0 0 200 140', d: 'M30 34 C 60 6, 150 4, 186 34 C 204 60, 196 112, 150 128 C 100 142, 30 134, 12 100 C 0 72, 14 44, 58 22' },
	underline: { box: '0 0 200 20', d: 'M4 12 C 50 6, 110 4, 196 9 M 30 16 C 80 12, 140 12, 180 14' },
};

function Grease({ mark }: { mark: keyof typeof GREASE }) {
	return (
		<svg className={`grease ${s[mark]}`} viewBox={GREASE[mark].box} preserveAspectRatio="none" aria-hidden="true" focusable="false">
			<path d={GREASE[mark].d} />
		</svg>
	);
}

/** Portraits as paper prints, the frame number and the start time on the
 * edge, each name beside its print, and the tagline when one person gives
 * the talk. */
function Speakers({ speakers, start }: { speakers: SessionSpeakerRef[]; start: number }) {
	if (speakers.length === 0) return null;
	const solo = speakers.length === 1;
	return (
		<ul className={`${s.speakers} ${solo ? '' : s.speakersMany}`}>
			{speakers.map((speaker, i) => (
				<li key={speaker.id} className={s.speaker}>
					<span className={s.print} aria-hidden="true">
						<span className={s.printPhoto}>
							{speaker.profilePicture ? (
								<img src={speaker.profilePicture} alt="" />
							) : (
								<span className={s.monogram}>{initials(speaker.fullName) || '?'}</span>
							)}
						</span>
						<span className={s.printEdge}>
							<span>{String(i + 1).padStart(2, '0')}</span>
							<span>{formatMinutes(start)}</span>
						</span>
					</span>
					<span className={s.speakerText}>
						<span className={s.speakerName}>{speaker.fullName}</span>
						{solo && speaker.tagLine && <span className={s.speakerTag}>{speaker.tagLine}</span>}
					</span>
				</li>
			))}
		</ul>
	);
}

/** A live slot's progress: a spine filling with ink. */
function Progress({ slot, nowMin }: { slot: Slot; nowMin: number | null }) {
	return (
		<span className={s.progress} aria-hidden="true">
			<span style={{ transform: `scaleX(${progress(slot.place, nowMin)})` }} />
		</span>
	);
}

/** The room screen's main block: the talk on now, or the next one with its
 * countdown, on the screen's one paper slip, the speakers' prints under it.
 * A break never takes it: people on a break want what comes after, so the
 * break is a small tag beside the room name. */
function Hero({ slot, live, where, nowMin }: { slot: Slot; live: boolean; where: string; nowMin: number | null }) {
	const countdown = live ? '' : startsIn(slot.place.startMin, nowMin);
	const aside = live ? timeLeft(slot, nowMin) : countdown && `Starts ${countdown}`;
	return (
		<section className={`${s.hero} ${where ? s.heroElsewhere : ''}`} aria-labelledby="tv-hero-title">
			<div className={s.heroSlip}>
				<p className={s.heroMeta}>
					<Flag text={flagFor(slot, live, nowMin)} live={live} />
					<span className={s.time}>{slotTime(slot)}</span>
					{aside && (
						<span className={s.heroAside}>
							<Note text={aside} />
							{!live && isSoon(slot, nowMin) && <Grease mark="ring" />}
						</span>
					)}
				</p>
				{live && <Progress slot={slot} nowMin={nowMin} />}
				<h2 id="tv-hero-title" className={`${s.heroTitle} ${titleSize(slot.session.title, where ? 1 : 0)}`}>
					{slot.session.title}
				</h2>
				{where && (
					<p className={s.heroWhere}>
						<Note text={`In ${where}`} />
					</p>
				)}
			</div>
			<Speakers speakers={slot.session.speakers} start={slot.place.startMin} />
		</section>
	);
}

/** The rail's first block, on the table beside the hero's slip: the talk
 * after the hero in this room, with the break before it named so nobody
 * waits at the door through lunch. While the hero is itself the next talk,
 * this one is After that. */
function NextCard({
	slot,
	gap,
	where,
	nowMin,
	cramped,
	afterHero,
}: {
	slot: Slot;
	gap: Slot | null;
	where: string;
	nowMin: number | null;
	cramped: boolean;
	afterHero: boolean;
}) {
	const countdown = startsIn(slot.place.startMin, nowMin);
	// While the hero is itself the next talk, its countdown carries the ring.
	const soon = !afterHero && isSoon(slot, nowMin);
	return (
		<section className={`${s.next} ${cramped ? s.nextCramped : ''}`} aria-labelledby="tv-next-title">
			<p className={s.nextTop}>
				<span className={s.nextLabel}>{afterHero ? 'After that' : 'Up next'}</span>
				{countdown && (
					<span className={s.countdown}>
						<Note text={countdown} />
						{soon && <Grease mark="ring" />}
					</span>
				)}
			</p>
			<p className={s.nextWhen}>
				<span className={s.time}>{slotTime(slot)}</span>
				{gap && <span className={s.nextGap}>{afterBreak(gap)}</span>}
				{where && <span className={s.nextGap}>in {where}</span>}
			</p>
			<h2 id="tv-next-title" className={`${s.nextTitle} ${titleSize(slot.session.title)}`}>
				{slot.session.title}
			</h2>
			{slot.session.speakers.length > 0 && (
				<p className={s.nextSpeakers}>{slot.session.speakers.map((sp) => sp.fullName).join(', ')}</p>
			)}
		</section>
	);
}

/** The talk a room shows in a summary: its live talk, else the next one.
 * Breaks are skipped, and so is a shared session held in another room: it
 * belongs on the line of the room it is in (the afterparty under Moonshine). */
function summarySlot(room: RoomNow): { slot: Slot; live: boolean } | null {
	const talk = (slot: Slot) =>
		!isBreak(slot.session) && (!isBand(slot.session) || roomKey(slot.session) === room.column.key);
	if (room.now && talk(room.now)) return { slot: room.now, live: true };
	const next = room.upcoming.find(talk);
	return next ? { slot: next, live: false } : null;
}

/** A room with nothing (more) to show. */
function emptyLabel(nowMin: number | null): string {
	return nowMin === null ? 'Nothing scheduled' : 'Done for today';
}

/** One other room on the rail: its name, the talk it shows, and when. */
interface RoomLine {
	key: string;
	label: string;
	when: string;
	live: boolean;
	title: string;
}

function roomLines(rooms: RoomNow[], nowMin: number | null): RoomLine[] {
	return rooms.map((room) => {
		const shown = summarySlot(room);
		return {
			key: room.column.key,
			label: room.column.label,
			when: shown ? boardWhen(shown.slot, shown.live, null, nowMin) : emptyLabel(nowMin),
			live: shown?.live ?? false,
			title: shown?.slot.session.title ?? '',
		};
	});
}

/** How hard the rail squeezes so every other room shows: their titles drop
 * to one line first, then the Up next slip gives up a title line and its
 * speakers. */
const FIT_FULL = 0;
const FIT_DENSE = 1;
const FIT_CRAMPED = 2;

/** The rail under Up next: what the other rooms are showing. A room that
 * still does not fit drops out whole (see `.elsewhereList`) rather than
 * clip. The list is measured before paint, so the screen never shows the
 * clipped version: a wrapped room lands in a second column, which widens
 * the list, and the rail squeezes a step. */
function Elsewhere({
	lines,
	fit,
	measure,
	onOverflow,
}: {
	lines: RoomLine[];
	fit: number;
	measure: string;
	onOverflow: () => void;
}) {
	const list = useRef<HTMLUListElement>(null);
	useLayoutEffect(() => {
		const el = list.current;
		if (el && el.scrollWidth > el.clientWidth + 1) onOverflow();
	}, [fit, measure]);

	return (
		<section className={s.elsewhere} aria-labelledby="tv-elsewhere-heading">
			<h2 id="tv-elsewhere-heading" className={s.nextLabel}>
				Other rooms
			</h2>
			<ul ref={list} className={`${s.elsewhereList} ${fit > FIT_FULL ? s.elsewhereDense : ''}`}>
				{lines.map((item) => (
					<li key={item.key} className={s.elsewhereRoom}>
						<p className={s.elsewhereHead}>
							<span className={s.elsewhereName}>{item.label}</span>
							<span className={s.elsewhereMeta}>
								{item.live && <span className={s.dot} aria-hidden="true" />}
								<Note text={item.when} />
							</span>
						</p>
						{item.title && <p className={s.elsewhereTitle}>{item.title}</p>}
					</li>
				))}
			</ul>
		</section>
	);
}

/** The band under every screen: the organiser, then the partners a page at
 * a time, in ladder order, then the hashtag to post with. Every mark keeps its own colours; a dark one sits
 * on a white card. */
function Credits({ partners, organizerLogo }: { partners: PartnerGroup[]; organizerLogo: string }) {
	const [index, setIndex] = useState(0);
	useEffect(() => {
		if (partners.length < 2) return;
		const id = setInterval(() => setIndex((i) => (i + 1) % partners.length), PARTNER_GROUP_MS);
		return () => clearInterval(id);
	}, [partners.length]);
	const group = partners[index % Math.max(partners.length, 1)];
	return (
		<footer className={s.credits}>
			<p className={s.organizer}>
				<span className={s.creditLabel}>Organized by</span>
				<img className={s.organizerLogo} src={organizerLogo} alt="GUG.cz" />
			</p>
			{group && (
				<div key={index} className={`${s.partnerGroup} ${s.fade}`}>
					<p className={s.creditLabel}>{group.label}</p>
					<ul className={s.partnerLogos}>
						{group.logos.map((logo) => (
							<li key={logo.name}>
								<img
									className={`${s.partnerLogo} ${logo.dark ? s.logoDark : ''}`}
									src={logo.src}
									alt={logo.name}
									style={{ '--w': logo.w } as CSSProperties}
								/>
							</li>
						))}
					</ul>
				</div>
			)}
			<p className={s.hashtag}>
				<span className={s.creditLabel}>Post with</span>
				<span className={s.hashtagText}>#DevFestCZ</span>
			</p>
		</footer>
	);
}

/** The room screen's right column: Up next, then the other rooms. Every
 * room has to show, so the rail squeezes until they fit; it starts over
 * whenever what it shows changes or a web font arrives (the measure was
 * taken in the fallback face). */
function Rail({
	next,
	gap,
	nextWhere,
	afterHero,
	others,
	nowMin,
}: {
	next: Slot | null;
	gap: Slot | null;
	nextWhere: string;
	afterHero: boolean;
	others: RoomNow[];
	nowMin: number | null;
}) {
	const fonts = useFontEpoch();
	const lines = roomLines(others, nowMin);
	const measure = JSON.stringify([next?.session.id, lines, fonts]);
	// The squeeze belongs to one measure: a new one starts at FIT_FULL in the
	// same render, so a stale step never reaches the screen.
	const [squeeze, setSqueeze] = useState({ measure, fit: FIT_FULL });
	const fit = squeeze.measure === measure ? squeeze.fit : FIT_FULL;
	const onOverflow = () =>
		setSqueeze((prev) => {
			const from = prev.measure === measure ? prev.fit : FIT_FULL;
			return from >= FIT_CRAMPED ? prev : { measure, fit: from + 1 };
		});
	return (
		<div className={s.rail}>
			{next && (
				<NextCard
					slot={next}
					gap={gap}
					where={nextWhere}
					nowMin={nowMin}
					cramped={fit >= FIT_CRAMPED}
					afterHero={afterHero}
				/>
			)}
			{lines.length > 0 && <Elsewhere lines={lines} fit={fit} measure={measure} onOverflow={onOverflow} />}
		</div>
	);
}

/** `Until 10:40` for a live talk; for a coming one its start, then the
 * break before it or the countdown within the hour. */
function boardWhen(slot: Slot, live: boolean, gap: Slot | null, nowMin: number | null): string {
	const { startMin, endMin } = slot.place;
	if (live) return `Until ${formatMinutes(endMin)}`;
	if (gap) return `${formatMinutes(startMin)} · ${afterBreak(gap)}`;
	const soon = nowMin !== null && startMin - nowMin < 60;
	return soon ? `${formatMinutes(startMin)} · ${startsIn(startMin, nowMin)}` : formatMinutes(startMin);
}

/** A board row's first column: the talk on now, else the next one, on a
 * paper slip. */
function BoardNow({
	lead,
	live,
	where,
	nowMin,
}: {
	lead: Slot | null;
	live: boolean;
	where: string;
	nowMin: number | null;
}) {
	if (!lead) {
		return (
			<div className={s.boardCell}>
				<p className={s.boardMeta}>{emptyLabel(nowMin)}</p>
			</div>
		);
	}
	const speakers = lead.session.speakers.map((sp) => sp.fullName).join(', ');
	return (
		<div className={`${s.boardCell} ${s.boardNow}`}>
			<p className={s.boardMeta}>
				<Flag text={flagFor(lead, live, nowMin)} live={live} />
				<span className={s.boardMetaText}>
					<Note text={joinNote(boardWhen(lead, live, null, nowMin), where)} />
				</span>
				{speakers && <span className={s.boardWho}>{speakers}</span>}
			</p>
			<p className={`${s.boardTitle} ${titleSize(lead.session.title)}`}>{lead.session.title}</p>
			{live && <Progress slot={lead} nowMin={nowMin} />}
		</div>
	);
}

/** A board row's second column, on the table: the talk after the first. */
function BoardNext({
	next,
	gap,
	where,
	live,
	last,
	nowMin,
}: {
	next: Slot | null;
	gap: Slot | null;
	where: string;
	live: boolean;
	last: boolean;
	nowMin: number | null;
}) {
	if (!next) {
		return <div className={`${s.boardCell} ${s.boardNext}`}>{last && <p className={s.boardMeta}>Last of the day</p>}</div>;
	}
	// In the narrow column the room says more than a countdown.
	const when = joinNote(boardWhen(next, false, gap, where ? null : nowMin), where);
	return (
		<div className={`${s.boardCell} ${s.boardNext}`}>
			<p className={s.boardMeta}>
				<span className={s.boardCellLabel}>{live ? 'Next' : 'Then'}</span>
				<span className={s.boardMetaText}>
					<Note text={when} />
				</span>
			</p>
			<p className={`${s.boardTitleSm} ${titleSize(next.session.title)}`}>{next.session.title}</p>
		</div>
	);
}

/** The venue screen: a departures board, one row per room. The first column
 * is the talk on now, else the next one, so a break shows what comes after
 * it; the break itself is a small tag beside the heading. Each cell names
 * its own state, so the board needs no column heads. */
function Board({ rooms, nowMin }: { rooms: RoomNow[]; nowMin: number | null }) {
	const focus = rooms.map((room) => ({ room, ...roomFocus(room) }));
	return (
		<div className={`${s.board} ${rooms.length > 3 ? s.boardDense : ''}`}>
			<ul className={s.boardRows}>
				{focus.map(({ room, lead, live, next, gap }) => (
					<li key={room.column.key} className={s.boardRow}>
						<h2 className={s.boardRoom}>{room.column.label}</h2>
						<BoardNow lead={lead} live={live} where={heldIn(lead, room.column.key, rooms)} nowMin={nowMin} />
						<BoardNext
							next={next}
							gap={gap}
							where={heldIn(next, room.column.key, rooms)}
							live={live}
							last={lead !== null}
							nowMin={nowMin}
						/>
					</li>
				))}
			</ul>
		</div>
	);
}

/** The lineup, the clock and every room's now and next, kept current. */
function useVenue(atMin: number | null) {
	const lineup = usePolled(loadLineup, LINEUP_REFRESH_MS, 'tv-lineup');
	const sessions = lineup.data?.sessions ?? [];
	const eventDate = useMemo(() => eventDateISO(sessions), [sessions]);
	const clock = useClock(atMin, eventDate);
	const nowMin = eventDate && clock.date === eventDate ? clock.minutes : null;
	const roomList = lineup.data?.rooms;
	const rooms = useMemo(() => venueNow(sessions, roomList ?? [], nowMin), [sessions, roomList, nowMin]);
	const dayAhead = nowMin === null && eventDate !== '' && clock.date < eventDate ? eventDate : '';
	return { lineup, clock, nowMin, rooms, dayAhead };
}

/** The room a `?room=` value names, the rest of the venue, and the value
 * itself when it names no room. */
function pickRoom(rooms: RoomNow[], wanted: string): { here: RoomNow | null; others: RoomNow[]; unknown: string } {
	const column = wanted ? findColumn(rooms.map((r) => r.column), wanted) : null;
	const here = column ? (rooms.find((r) => r.column.key === column.key) ?? null) : null;
	return { here, others: rooms.filter((r) => r !== here), unknown: wanted && !column ? wanted : '' };
}

/** A break on now: the room's own, or on the board one that spans the venue. */
function pauseNow(focus: RoomFocus | null, rooms: RoomNow[]): Slot | null {
	if (focus) return focus.pause;
	return rooms.map((room) => roomFocus(room).pause).find((slot) => slot && isBand(slot.session)) ?? null;
}

/** The tag beside the heading: a break on now (`Lunch until 12:50`), or
 * before the day, when and where it is (`Fri 30 Oct · Uhelný Mlýn`). */
function headerTag(pause: Slot | null, dayAhead: string): string {
	if (pause) return `${breakLabel(pause.session)} until ${formatMinutes(pause.place.endMin)}`;
	return dayAhead ? `${dayLabel(dayAhead)} · ${EVENT.venue}` : '';
}

/** What a room screen says once nothing more is scheduled in it. */
function wrapCopy(dayOver: boolean, nowMin: number | null): { title: string; line: string } {
	if (dayOver) return { title: 'That’s a wrap.', line: `Thank you for coming to ${EVENT.name}.` };
	if (nowMin === null) return { title: 'Agenda coming soon.', line: 'Talks for this room are being scheduled.' };
	return { title: 'That’s it in here.', line: 'The rest of the day is in the other rooms.' };
}

function Header({ heading, tag, clock, meta }: { heading: string; tag: string; clock: Clock; meta: string }) {
	return (
		<header className={s.header}>
			<img className={s.logo} src={logoUrl} alt={EVENT.name} />
			<div className={s.titleRow}>
				<h1 className={s.heading}>{heading}</h1>
				{tag && (
					<p className={s.pause}>
						<Note text={tag} />
					</p>
				)}
			</div>
			<p className={s.clockBlock}>
				<span className={s.clockMeta}>
					<Note text={meta} />
				</span>
				<span className={s.clock}>{formatMinutes(clock.minutes)}</span>
			</p>
		</header>
	);
}

/** A screen pinned to one room: the hero is the talk on now, else the next
 * one; the card under it is the talk after that. */
function RoomScreen({
	here,
	focus,
	rooms,
	others,
	nowMin,
	dayOver,
	portrait,
}: {
	here: string;
	focus: RoomFocus;
	rooms: RoomNow[];
	others: RoomNow[];
	nowMin: number | null;
	dayOver: boolean;
	portrait: boolean;
}) {
	const hero = focus.lead;
	const wrap = wrapCopy(dayOver, nowMin);
	return (
		<div className={`${s.roomGrid} ${hero ? '' : s.roomGridWrap}`}>
			{hero ? (
				<Hero slot={hero} live={focus.live} where={heldIn(hero, here, rooms)} nowMin={nowMin} />
			) : (
				<div className={s.wrap}>
					<p className={s.wrapTitle}>
						{wrap.title}
						{dayOver && <Grease mark="underline" />}
					</p>
					<p className={s.wrapLine}>
						<Note text={wrap.line} />
					</p>
				</div>
			)}
			{(focus.next || others.length > 0) && (
				<Rail
					key={portrait ? 'portrait' : 'landscape'}
					next={focus.next}
					gap={focus.gap}
					nextWhere={heldIn(focus.next, here, rooms)}
					afterHero={!focus.live}
					others={others}
					nowMin={nowMin}
				/>
			)}
		</div>
	);
}

export default function TvScreen({
	partners = [],
	organizerLogo,
}: {
	partners?: PartnerGroup[];
	organizerLogo: string;
}) {
	const [params, setParams] = useState<Params | null>(null);
	useEffect(() => setParams(readParams()), []);
	useKioskUpkeep();
	const portrait = usePortrait(params?.rotate != null);

	const { lineup, clock, nowMin, rooms, dayAhead } = useVenue(params?.atMin ?? null);
	const { here, others, unknown } = pickRoom(rooms, params?.room ?? '');
	const focus = here ? roomFocus(here) : null;
	const reconnecting = lineup.failed && lineup.data !== null;

	return (
		<div className={s.frame} data-rotate={params?.rotate}>
			<div className={s.screen}>
				<Header
					heading={here?.column.label ?? 'Agenda'}
					tag={headerTag(pauseNow(focus, rooms), dayAhead)}
					clock={clock}
					meta={reconnecting ? 'Reconnecting…' : dayLabel(clock.date)}
				/>
				{lineup.data === null ? (
					<p className={s.status}>{lineup.failed ? 'Agenda unavailable, retrying…' : 'Loading agenda…'}</p>
				) : (
					<main className={s.main}>
						{unknown && (
							<p className={s.notice}>
								Unknown room “{unknown}”. Use one of: {rooms.map((r) => roomSlug(r.column.label)).join(', ')}
							</p>
						)}
						{here && focus ? (
							<RoomScreen
								here={here.column.key}
								focus={focus}
								rooms={rooms}
								others={others}
								nowMin={nowMin}
								dayOver={isDayOver(rooms, nowMin)}
								portrait={portrait}
							/>
						) : (
							<Board rooms={rooms} nowMin={nowMin} />
						)}
					</main>
				)}
				<Credits partners={partners} organizerLogo={organizerLogo} />
			</div>
		</div>
	);
}
