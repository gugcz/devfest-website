import { useMemo, useState } from 'react';
import {
	collectFacets,
	hasActiveFilters,
	matchesFilters,
	speakerNames,
	visitorCategories,
	type Session,
	type SessionFilters,
} from '../lib/sessions';
import { fetchLineup, speakersById } from '../lib/lineup';
import { shuffle } from '../lib/shuffle';
import { useRemote } from '../lib/useRemote';
import SessionDetail from './SessionDetail';
import SpeakerStack from './SpeakerStack';
import { EmptyState, ErrorState, LoadingState } from './DataState';
import s from './Sessions.module.scss';

function SessionCard({ session, onOpen }: { session: Session; onOpen: (session: Session) => void }) {
	const names = speakerNames(session);
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
					<SpeakerStack
						speakers={session.speakers}
						className={s.stack}
						avatarClass={s.avatar}
						monogramClass={`${s.avatar} ${s.avatarMono}`}
						moreClass={`${s.avatar} ${s.avatarMore}`}
						size={40}
					/>
					<span className={s.names}>{names || 'Speaker to be announced'}</span>
				</span>
			</button>
		</li>
	);
}

export default function Sessions() {
	const { status, data } = useRemote(fetchLineup, 'sessions', (l) => l.sessions.length === 0);
	const [selected, setSelected] = useState<Session | null>(null);
	const [query, setQuery] = useState('');
	const [filters, setFilters] = useState<SessionFilters>({});

	// Shuffled once per payload so no talk gets a permanent top-of-page slot.
	const sessions = useMemo(() => shuffle(data?.sessions ?? []), [data]);
	const profiles = useMemo(() => speakersById(data?.speakers ?? []), [data]);
	const facets = useMemo(() => collectFacets(sessions), [sessions]);
	const filtered = useMemo(
		() => sessions.filter((session) => matchesFilters(session, query, filters)),
		[sessions, query, filters],
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

	if (status === 'error') {
		return (
			<ErrorState>
				<p>The programme won't come up right now. Reload, or take it up with devfest@gug.cz.</p>
			</ErrorState>
		);
	}

	if (status === 'loading') {
		return <LoadingState label="Developing the programme" />;
	}

	if (status === 'empty') {
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
					speakersById={profiles}
					onClose={() => setSelected(null)}
				/>
			)}
		</>
	);
}
