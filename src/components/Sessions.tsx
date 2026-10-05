import { useCallback, useEffect, useMemo, useState } from 'react';
import {
	collectFacets,
	hasActiveFilters,
	matchesFilters,
	speakerNames,
	visitorCategories,
	type Session,
	type SessionFilters,
} from '../lib/sessions';
import { byStart, formatMinutes, placement } from '../lib/agenda';
import { fetchLineup, speakersById } from '../lib/lineup';
import { useRemote } from '../lib/useRemote';
import SessionDetail from './SessionDetail';
import SpeakerStack from './SpeakerStack';
import { EmptyState, ErrorState, LoadingState } from './DataState';
import s from './Sessions.module.scss';

/** The query parameter that names an open talk, so a speaker can link
 * straight to theirs: `/agenda?talk=<sessionize id>` (the old `/sessions?talk=` redirects there). */
const TALK_PARAM = 'talk';

/** `10:00–10:45, Main Hall` once a talk is scheduled; `''` before. Sessionize
 * can leave `room` blank and carry only the id, hence the lookup. */
function whenLabel(session: Session, roomNames: Map<string, string>): string {
	const place = placement(session);
	const time = place ? `${formatMinutes(place.startMin)}–${formatMinutes(place.endMin)}` : '';
	const room = session.room.trim() || roomNames.get(session.roomId) || '';
	return [time, room].filter(Boolean).join(', ');
}

/** Mirror the open sheet in the address bar without adding a history entry. */
function syncTalkParam(id: string | null) {
	const url = new URL(window.location.href);
	if (id) url.searchParams.set(TALK_PARAM, id);
	else url.searchParams.delete(TALK_PARAM);
	window.history.replaceState(window.history.state, '', url);
}

function SessionCard({
	session,
	when,
	onOpen,
}: {
	session: Session;
	when: string;
	onOpen: (session: Session) => void;
}) {
	const names = speakerNames(session);
	// The track; the room now travels with the time in `when`.
	const kicker = visitorCategories(session)[0]?.values[0] || 'Talk';

	return (
		<li>
			<button
				type="button"
				className={`field-row field-row--link ${s.card}`}
				onClick={() => onOpen(session)}
				aria-label={`View details for ${session.title}`}
			>
				<span className={s.top}>
					{when && <span className={s.when}>{when}</span>}
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

	// Programme order: start time, then Sessionize's own order for talks not
	// yet slotted. It used to be shuffled per load, which also reshuffled the
	// filter chips built from it and left a returning visitor nothing to find
	// twice.
	const sessions = useMemo(() => [...(data?.sessions ?? [])].sort(byStart), [data]);
	const profiles = useMemo(() => speakersById(data?.speakers ?? []), [data]);
	const roomNames = useMemo(
		() => new Map((data?.rooms ?? []).map((room) => [room.id, room.name])),
		[data],
	);
	const facets = useMemo(() => collectFacets(sessions), [sessions]);
	const filtered = useMemo(
		() => sessions.filter((session) => matchesFilters(session, query, filters)),
		[sessions, query, filters],
	);
	const active = hasActiveFilters(query, filters);
	const anyChip = Object.values(filters).some((values) => values.length > 0);

	const open = useCallback((session: Session) => {
		setSelected(session);
		syncTalkParam(session.id);
	}, []);
	const close = useCallback(() => {
		setSelected(null);
		syncTalkParam(null);
	}, []);

	// A `?talk=` link opens that talk's sheet once the lineup has loaded.
	useEffect(() => {
		const id = new URLSearchParams(window.location.search).get(TALK_PARAM);
		if (!id) return;
		const match = sessions.find((session) => session.id === id);
		if (match) setSelected(match);
	}, [sessions]);

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

				{/* One clear control at a time: with no results the empty state
				    below carries it, next to the sentence that explains why. */}
				{active && filtered.length > 0 && (
					<button type="button" className={s.clear} onClick={clearFilters}>
						{anyChip ? 'Clear filters' : 'Clear search'}
					</button>
				)}
			</div>

			{filtered.length === 0 ? (
				<EmptyState>
					<p>
						{anyChip
							? 'No session matches these filters. Remove one, or clear them all.'
							: `No session mentions “${query.trim()}”. Try a speaker's name or a topic.`}
					</p>
					<button type="button" className={s.clearInline} onClick={clearFilters}>
						{anyChip ? 'Clear filters' : 'Clear search'}
					</button>
				</EmptyState>
			) : (
				<ul className={`field ${s.grid}`} role="list">
					{filtered.map((session) => (
						<SessionCard key={session.id} session={session} when={whenLabel(session, roomNames)} onOpen={open} />
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
					when={whenLabel(selected, roomNames)}
					speakersById={profiles}
					onClose={close}
				/>
			)}
		</>
	);
}
