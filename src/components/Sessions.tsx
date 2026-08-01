import { useEffect, useMemo, useState } from 'react';
import { initials, type Speaker } from '../lib/speakers';
import {
	collectFacets,
	hasActiveFilters,
	matchesFilters,
	shuffle,
	visitorCategories,
	type Session,
	type SessionFilters,
} from '../lib/sessions';
import { fetchLineup } from '../lib/lineup';
import { sessionPath, sessionSlugs } from '../lib/slug';
import SessionDetail from './SessionDetail';
import s from './Sessions.module.scss';

type Status = 'loading' | 'ready' | 'empty' | 'error';

interface State {
	status: Status;
	sessions: Session[];
}

const INITIAL: State = { status: 'loading', sessions: [] };

/** True when both lists hold exactly the same session ids, in any order. */
function sameSessions(a: Session[], b: Session[]): boolean {
	if (a.length !== b.length) return false;
	const ids = new Set(a.map((session) => session.id));
	return b.every((session) => ids.has(session.id));
}

/** Up to three overlapping speaker avatars, monogram fallback per speaker. */
function SpeakerStack({ session }: { session: Session }) {
	const shown = session.speakers.slice(0, 3);
	const extra = session.speakers.length - shown.length;
	return (
		<span className={s.stack} aria-hidden="true">
			{shown.map((speaker) =>
				speaker.profilePicture ? (
					<img
						key={speaker.id}
						className={s.avatar}
						src={speaker.profilePicture}
						alt=""
						loading="lazy"
						decoding="async"
						width={40}
						height={40}
						onError={(e) => {
							(e.currentTarget as HTMLImageElement).style.visibility = 'hidden';
						}}
					/>
				) : (
					<span key={speaker.id} className={`${s.avatar} ${s.avatarMono}`}>
						{initials(speaker.fullName) || '?'}
					</span>
				),
			)}
			{extra > 0 && <span className={`${s.avatar} ${s.avatarMore}`}>+{extra}</span>}
		</span>
	);
}

/**
 * Modifier keys / non-primary buttons mean the visitor is asking the BROWSER to
 * handle the link (new tab, new window) — never intercept those.
 */
function wantsDefaultNavigation(event: React.MouseEvent): boolean {
	return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

function SessionCard({
	session,
	href,
	onOpen,
}: {
	session: Session;
	/** Canonical page for this talk. */
	href: string | null;
	onOpen: (session: Session) => void;
}) {
	const names = session.speakers.map((sp) => sp.fullName).filter(Boolean).join(', ');
	// Lead the card with the primary track (falls back to the room, then a generic
	// label).
	const kicker = visitorCategories(session)[0]?.values[0] || session.room || 'Talk';

	return (
		<li>
			{/*
				A real <a> to /sessions/<slug>: crawlable, middle-clickable, and
				copyable out of the address bar. The dialog stays the default
				experience by intercepting the plain click.
			*/}
			<a
				className={s.card}
				href={href ?? undefined}
				onClick={(event) => {
					if (wantsDefaultNavigation(event)) return;
					event.preventDefault();
					onOpen(session);
				}}
				aria-label={`View details for ${session.title}`}
				data-track="view_session"
				data-track-session={session.title}
			>
				<span className={s.top}>
					<span className={s.kicker}>{kicker}</span>
				</span>

				<span className={s.title}>{session.title}</span>

				{session.description && <span className={s.excerpt}>{session.description}</span>}

				<span className={s.foot}>
					{session.speakers.length > 0 && <SpeakerStack session={session} />}
					<span className={s.names}>{names || 'Speaker to be announced'}</span>
				</span>
			</a>
		</li>
	);
}

export default function Sessions({
	initialSessions = [],
	initialSpeakers = [],
}: {
	initialSessions?: Session[];
	initialSpeakers?: Speaker[];
}) {
	// Seeded from the build-time lineup (src/lib/lineup-build.ts) so the grid is
	// in the server-rendered HTML: titles and abstracts reach crawlers, and there
	// is no loading state before hydration.
	const [state, setState] = useState<State>(() =>
		initialSessions.length > 0 ? { status: 'ready', sessions: initialSessions } : INITIAL,
	);
	// Full speaker profiles keyed by id, from the same /api/lineup fetch, so the
	// session → speaker drill-down in SessionDetail renders from data already on
	// the page instead of a second read.
	const [speakersById, setSpeakersById] = useState<Record<string, Speaker>>(() =>
		Object.fromEntries(initialSpeakers.map((sp) => [sp.id, sp])),
	);
	const [selected, setSelected] = useState<Session | null>(null);
	const [query, setQuery] = useState('');
	const [filters, setFilters] = useState<SessionFilters>({});

	useEffect(() => {
		const ac = new AbortController();
		fetchLineup(ac.signal)
			.then(({ sessions, speakers }) => {
				setSpeakersById(Object.fromEntries(speakers.map((sp) => [sp.id, sp])));
				setState((prev) => {
					// Same talks as the prerendered grid → keep the order already on
					// screen. Re-shuffling identical data would rearrange a grid the
					// visitor is mid-read of, for no gain. Only a genuine change
					// (a talk added or pulled since the build) re-rolls the order.
					if (sameSessions(prev.sessions, sessions)) return prev;
					const ordered = shuffle(sessions);
					return { status: ordered.length > 0 ? 'ready' : 'empty', sessions: ordered };
				});
			})
			.catch((err) => {
				if (ac.signal.aborted) return;
				console.warn('[sessions] Failed to load lineup:', err);
				// A prerendered grid on screen beats an error panel.
				setState((prev) => (prev.sessions.length > 0 ? prev : { ...prev, status: 'error' }));
			});
		return () => ac.abort();
	}, []);

	// Same derivation the build used for `getStaticPaths`, over the same data, so
	// every card href resolves to a page that exists. A talk added since the last
	// build links to a page that isn't there yet; the click opens the dialog
	// regardless, and the daily rebuild closes the gap.
	const slugs = useMemo(() => sessionSlugs(state.sessions), [state.sessions]);
	const facets = useMemo(() => collectFacets(state.sessions), [state.sessions]);
	const filtered = useMemo(
		() => state.sessions.filter((session) => matchesFilters(session, query, filters)),
		[state.sessions, query, filters],
	);
	const active = hasActiveFilters(query, filters);

	const toggleValue = (group: string, value: string) => {
		setFilters((prev) => {
			const current = prev[group] ?? [];
			const next = current.includes(value)
				? current.filter((v) => v !== value)
				: [...current, value];
			return { ...prev, [group]: next };
		});
	};

	const clearFilters = () => {
		setQuery('');
		setFilters({});
	};

	if (state.status === 'error') {
		return (
			<div className={s.status} role="alert">
				<p>The programme won't come up right now. Reload, or take it up with devfest@gug.cz.</p>
			</div>
		);
	}

	if (state.status === 'loading') {
		return (
			<p className={s.loadingStatus} role="status">
				<span className={s.loadingDot} aria-hidden="true" />
				Loading sessions
				<span className={s.loadingDots} aria-hidden="true">
					<span />
					<span />
					<span />
				</span>
			</p>
		);
	}

	if (state.status === 'empty') {
		return (
			<div className={s.status}>
				<p>Sessions announced soon.</p>
			</div>
		);
	}

	return (
		<>
			<div className={s.filters}>
				<div className={s.searchRow}>
					<div className={s.search}>
						<svg className={s.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
							<circle cx="11" cy="11" r="7" />
							<path d="m20 20-3.2-3.2" strokeLinecap="round" />
						</svg>
						<input
							type="search"
							className={s.searchInput}
							placeholder="Search talks, speakers, topics"
							aria-label="Search sessions"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
						/>
					</div>
					<output className={s.count}>
						{filtered.length} {filtered.length === 1 ? 'session' : 'sessions'}
					</output>
				</div>

				{facets.map((facet) => (
					<div key={facet.name} className={s.facet}>
						<span className={s.facetLabel}>{facet.name}</span>
						<div className={s.chips} role="group" aria-label={facet.name}>
							{facet.values.map((value) => {
								const on = (filters[facet.name] ?? []).includes(value);
								return (
									<button
										key={value}
										type="button"
										className={`${s.chip} ${on ? s.chipOn : ''}`}
										aria-pressed={on}
										onClick={() => toggleValue(facet.name, value)}
									>
										{value}
									</button>
								);
							})}
						</div>
					</div>
				))}

				{active && (
					<button type="button" className={s.clear} onClick={clearFilters}>
						Clear filters
					</button>
				)}
			</div>

			{filtered.length === 0 ? (
				<div className={s.status}>
					<p>No sessions match your filters.</p>
					<button type="button" className={s.clearInline} onClick={clearFilters}>
						Clear filters
					</button>
				</div>
			) : (
				<ul className={s.grid} role="list">
					{filtered.map((session) => (
						<SessionCard
							key={session.id}
							session={session}
							href={sessionPath(slugs, session.id)}
							onOpen={setSelected}
						/>
					))}
					{!active && (
						<li>
							<article className={s.moreCard} aria-label="More sessions to be announced">
								<span className={s.moreDots} aria-hidden="true">
									<span />
									<span />
									<span />
								</span>
								<span className={s.moreKicker}>Docket open</span>
								<p className={s.moreText}>More sessions announced soon</p>
							</article>
						</li>
					)}
				</ul>
			)}
			{selected && (
				<SessionDetail
					session={selected}
					speakersById={speakersById}
					href={sessionPath(slugs, selected.id)}
					onClose={() => setSelected(null)}
				/>
			)}
		</>
	);
}
