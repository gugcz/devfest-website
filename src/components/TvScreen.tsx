import { useEffect, useMemo, useState } from 'react';
import logoUrl from '../assets/logo.png?url';
import { eventDateISO, formatMinutes, isBand } from '../lib/agenda';
import { BLUESKY_HANDLE, fetchSocialPosts, timeAgo, type SocialPost } from '../lib/bluesky';
import { fetchAgenda, type Lineup } from '../lib/lineup';
import { isHostSession, type SessionSpeakerRef } from '../lib/sessions';
import { initials } from '../lib/speakers';
import { findColumn, isDayOver, progress, startsIn, venueNow, type RoomNow, type Slot } from '../lib/tv';
import s from './TvScreen.module.scss';

/** The lineup endpoint is edge-cached for 15 min; polling faster costs nothing
 * and picks up a schedule fix within one cache window. */
const LINEUP_REFRESH_MS = 2 * 60_000;
const SOCIAL_REFRESH_MS = 5 * 60_000;
const SOCIAL_ROTATE_MS = 15_000;
const SOCIAL_MAX = 8;
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

function slotTime(slot: Slot): string {
	return `${formatMinutes(slot.place.startMin)} – ${formatMinutes(slot.place.endMin)}`;
}

function Speakers({ speakers, size }: { speakers: SessionSpeakerRef[]; size: 'lg' | 'sm' }) {
	if (speakers.length === 0) return null;
	return (
		<ul className={`${s.speakers} ${size === 'lg' ? s.speakersLg : ''}`}>
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
						{size === 'lg' && speaker.tagLine && (
							<span className={s.speakerTag}>{speaker.tagLine}</span>
						)}
					</span>
				</li>
			))}
		</ul>
	);
}

/** Long talk titles step down a size so they fit in three lines. */
function titleSize(title: string): string {
	if (title.length > 70) return s.titleLong;
	if (title.length > 38) return s.titleMid;
	return '';
}

/** The big "on now" / "up next" block of a room screen. */
function Feature({
	slot,
	label,
	nowMin,
	live,
}: {
	slot: Slot;
	label: string;
	nowMin: number | null;
	live: boolean;
}) {
	const band = isBand(slot.session) || slot.session.isServiceSession;
	const when = live ? slotTime(slot) : `${slotTime(slot)} · ${startsIn(slot.place.startMin, nowMin)}`;
	return (
		<article className={`${s.feature} ${live ? s.featureLive : ''} ${band ? s.featureBand : ''}`}>
			<p className={s.eyebrow}>
				{live && <span className={s.dot} aria-hidden="true" />}
				<span>{label}</span>
				<span className={s.when}>{when.replace(/ · $/, '')}</span>
			</p>
			<h2 className={`${live ? s.titleNow : s.titleNext} ${titleSize(slot.session.title)}`}>
				{slot.session.title}
			</h2>
			<Speakers speakers={slot.session.speakers} size={live ? 'lg' : 'sm'} />
			{live && (
				<div className={s.progress} aria-hidden="true">
					<span style={{ transform: `scaleX(${progress(slot.place, nowMin)})` }} />
				</div>
			)}
		</article>
	);
}

/** One room as a compact column (venue screen) or a row (side panel). */
function RoomSummary({ room, nowMin, compact }: { room: RoomNow; nowMin: number | null; compact: boolean }) {
	// A venue-wide band (lunch, keynote) is the same in every room; a side
	// row says what comes after it instead.
	const now = compact && room.now && isBand(room.now.session) ? null : room.now;
	const next = (compact ? room.upcoming.find((slot) => !isBand(slot.session)) : room.upcoming[0]) ?? null;
	return (
		<li className={compact ? s.roomRow : s.roomCol}>
			<h3 className={s.roomName}>{room.column.label}</h3>
			{now ? (
				<div className={s.roomSlot}>
					<p className={s.slotMeta}>
						<span className={s.dot} aria-hidden="true" /> Now · until {formatMinutes(now.place.endMin)}
					</p>
					<p className={s.slotTitle}>{now.session.title}</p>
					{!compact && <Speakers speakers={now.session.speakers} size="sm" />}
				</div>
			) : null}
			{next && (!compact || !now) ? (
				<div className={s.roomSlot}>
					<p className={s.slotMeta}>
						Next · {formatMinutes(next.place.startMin)} {nowMin !== null && `· ${startsIn(next.place.startMin, nowMin)}`}
					</p>
					<p className={s.slotTitle}>{next.session.title}</p>
					{!compact && <Speakers speakers={next.session.speakers} size="sm" />}
				</div>
			) : null}
			{!now && !next && <p className={s.slotMeta}>Done for today</p>}
			{!compact &&
				room.upcoming.slice(1, 4).map((slot) => (
					<p key={slot.session.id} className={s.later}>
						<span className={s.laterTime}>{formatMinutes(slot.place.startMin)}</span>
						{slot.session.title}
					</p>
				))}
		</li>
	);
}

function Social({ posts, now }: { posts: SocialPost[] | null; now: number }) {
	const shown = (posts ?? []).slice(0, SOCIAL_MAX);
	const [index, setIndex] = useState(0);
	useEffect(() => {
		if (shown.length < 2) return;
		const id = setInterval(() => setIndex((i) => (i + 1) % shown.length), SOCIAL_ROTATE_MS);
		return () => clearInterval(id);
	}, [shown.length]);

	const post = shown.length > 0 ? shown[index % shown.length] : null;
	return (
		<section className={s.social} aria-labelledby="tv-social-heading">
			<h2 id="tv-social-heading" className={s.panelLabel}>
				On Bluesky · @{BLUESKY_HANDLE}
			</h2>
			{post ? (
				<article key={post.id} className={s.post}>
					<p className={s.postMeta}>
						{post.avatar && <img className={s.avatar} src={post.avatar} alt="" />}
						<span className={s.postAuthor}>{post.authorName}</span>
						<span>{timeAgo(post.createdAt, now)}</span>
					</p>
					{post.text && <p className={s.postText}>{post.text}</p>}
					{post.image && <img className={s.postImage} src={post.image} alt={post.imageAlt} />}
					{shown.length > 1 && (
						<ol className={s.pager} aria-hidden="true">
							{shown.map((p, i) => (
								<li key={p.id} className={i === index % shown.length ? s.pagerOn : ''} />
							))}
						</ol>
					)}
				</article>
			) : (
				<div className={s.follow}>
					<p className={s.followLine}>Share your DevFest.</p>
					<p className={s.followHandles}>
						<span>Bluesky @{BLUESKY_HANDLE}</span>
						<span>X @devfest_cz</span>
						<span>LinkedIn GUG.cz</span>
					</p>
				</div>
			)}
		</section>
	);
}

export default function TvScreen() {
	const [params, setParams] = useState<Params | null>(null);
	useEffect(() => setParams(readParams()), []);
	useKioskUpkeep();

	const lineup = usePolled(loadLineup, LINEUP_REFRESH_MS, 'tv-lineup');
	const social = usePolled(fetchSocialPosts, SOCIAL_REFRESH_MS, 'tv-social');

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

	const heading = here ? here.column.label : 'Programme';
	const next = here?.upcoming[0] ?? null;

	return (
		<div className={s.screen}>
			<header className={s.header}>
				<img className={s.logo} src={logoUrl} alt="DevFest.cz 2026" />
				<h1 className={s.heading}>{heading}</h1>
				<p className={s.clock} aria-label="Current time">
					{formatMinutes(clock.minutes)}
				</p>
			</header>

			{lineup.data === null ? (
				<p className={s.status}>{lineup.failed ? 'Programme unavailable, retrying…' : 'Loading programme…'}</p>
			) : (
				<div className={here ? s.roomLayout : s.venueLayout}>
					<main className={s.main}>
						{params?.room && !column && (
							<p className={s.notice}>
								Unknown room “{params.room}”. Use one of:{' '}
								{rooms.map((r) => r.column.key).join(', ')}
							</p>
						)}
						{beforeDay && <p className={s.notice}>30 October 2026 · Uhelný Mlýn</p>}

						{here ? (
							<>
								{here.now ? (
									<Feature slot={here.now} label="Now" nowMin={nowMin} live />
								) : null}
								{next && (
									<Feature
										slot={next}
										label={here.now ? 'Up next' : nowMin === null ? 'First up' : 'Up next'}
										nowMin={nowMin}
										live={false}
									/>
								)}
								{!here.now && !next && (
									<div className={s.wrap}>
										<p className={s.titleNow}>{dayOver ? 'That’s a wrap.' : 'Nothing more in this room.'}</p>
										<p className={s.wrapLine}>Thank you for coming to DevFest.cz 2026.</p>
									</div>
								)}
								{here.upcoming.length > 1 && (
									<ol className={s.laterList}>
										{here.upcoming.slice(1, 5).map((slot) => (
											<li key={slot.session.id} className={s.later}>
												<span className={s.laterTime}>{formatMinutes(slot.place.startMin)}</span>
												{slot.session.title}
											</li>
										))}
									</ol>
								)}
							</>
						) : (
							<ul className={s.venueGrid} style={{ ['--cols' as string]: rooms.length || 1 }}>
								{rooms.map((room) => (
									<RoomSummary key={room.column.key} room={room} nowMin={nowMin} compact={false} />
								))}
							</ul>
						)}
					</main>

					<aside className={s.side}>
						{here && others.length > 0 && (
							<section aria-labelledby="tv-venue-heading">
								<h2 id="tv-venue-heading" className={s.panelLabel}>
									Elsewhere at DevFest
								</h2>
								<ul className={s.roomRows}>
									{others.map((room) => (
										<RoomSummary key={room.column.key} room={room} nowMin={nowMin} compact />
									))}
								</ul>
							</section>
						)}
						<Social posts={social.data} now={Date.now()} />
					</aside>
				</div>
			)}
		</div>
	);
}
