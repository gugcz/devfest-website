import { useEffect, useMemo, useState } from 'react';
import { type Speaker } from '../lib/speakers';
import {
	collectFacets,
	hasActiveFilters,
	matchesFilters,
	visitorCategories,
	type Session,
	type SessionFilters,
} from '../lib/sessions';
import { fetchLineup } from '../lib/lineup';
import SessionDetail from './SessionDetail';
import SpeakerPhoto from './SpeakerPhoto';
import { EmptyState, ErrorState, LoadingState } from './DataState';
import s from './Sessions.module.scss';

type Status = 'loading' | 'ready' | 'empty' | 'error';

interface State {
	status: Status;
	sessions: Session[];
}

const INITIAL: State = { status: 'loading', sessions: [] };

/** Fisher–Yates shuffle — returns a new array so the source order stays intact.
 * Sessions are randomized once per page load so no track/room gets a permanent
 * top-of-grid advantage. */
function shuffle<T>(items: T[]): T[] {
	const out = items.slice();
	for (let i = out.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[out[i], out[j]] = [out[j], out[i]];
	}
	return out;
}

/** Up to three overlapping speaker avatars, monogram fallback per speaker. */
function SpeakerStack({ session }: { session: Session }) {
	const shown = session.speakers.slice(0, 3);
	const extra = session.speakers.length - shown.length;
	return (
		<span className={s.stack} aria-hidden="true">
			{shown.map((speaker) => (
				<SpeakerPhoto
					key={speaker.id}
					speaker={speaker}
					photoClass={s.avatar}
					monogramClass={`${s.avatar} ${s.avatarMono}`}
					width={40}
					height={40}
				/>
			))}
			{extra > 0 && <span className={`${s.avatar} ${s.avatarMore}`}>+{extra}</span>}
		</span>
	);
}

function SessionCard({ session, onOpen }: { session: Session; onOpen: (session: Session) => void }) {
	const names = session.speakers.map((sp) => sp.fullName).filter(Boolean).join(', ');
	// Lead the card with the primary track (falls back to the room, then a generic
	// label).
	const kicker = visitorCategories(session)[0]?.values[0] || session.room || 'Talk';

	return (
		<li>
			<button
				type="button"
				className={`field-row field-row--link ${s.card}`}
				onClick={() => onOpen(session)}
				aria-label={`View details for ${session.title}`}
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
			</button>
		</li>
	);
}

export default function Sessions() {
	const [state, setState] = useState<State>(INITIAL);
	// Full speaker profiles keyed by id, from the same /api/lineup fetch, so the
	// session → speaker drill-down in SessionDetail renders from data already on
	// the page instead of a second read.
	const [speakersById, setSpeakersById] = useState<Record<string, Speaker>>({});
	const [selected, setSelected] = useState<Session | null>(null);
	const [query, setQuery] = useState('');
	const [filters, setFilters] = useState<SessionFilters>({});

	useEffect(() => {
		const ac = new AbortController();
		fetchLineup(ac.signal)
			.then(({ sessions, speakers }) => {
				setSpeakersById(Object.fromEntries(speakers.map((sp) => [sp.id, sp])));
				const ordered = shuffle(sessions);
				setState({ status: ordered.length > 0 ? 'ready' : 'empty', sessions: ordered });
			})
			.catch((err) => {
				if (ac.signal.aborted) return;
				console.warn('[sessions] Failed to load lineup:', err);
				setState((prev) => ({ ...prev, status: 'error' }));
			});
		return () => ac.abort();
	}, []);

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
			<ErrorState>
				<p>The programme won't come up right now. Reload, or take it up with devfest@gug.cz.</p>
			</ErrorState>
		);
	}

	if (state.status === 'loading') {
		return <LoadingState label="Developing the programme" />;
	}

	if (state.status === 'empty') {
		return (
			<EmptyState action={{ href: '/#newsletter', label: 'Get notified' }}>
				<p>Sessions announced soon.</p>
			</EmptyState>
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
				<EmptyState>
					<p>No sessions match your filters.</p>
					<button type="button" className={s.clearInline} onClick={clearFilters}>
						Clear filters
					</button>
				</EmptyState>
			) : (
				<ul className={`field ${s.grid}`} role="list">
					{filtered.map((session) => (
						<SessionCard key={session.id} session={session} onOpen={setSelected} />
					))}
					{!active && (
						<li>
							<article className={`field-row ${s.moreCard}`} aria-label="More sessions to be announced">
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
					onClose={() => setSelected(null)}
				/>
			)}
		</>
	);
}
