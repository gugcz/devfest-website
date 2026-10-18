import { useCallback, useEffect, useMemo, useState } from 'react';
import {
	collectFacets,
	hasActiveFilters,
	matchesFilters,
	speakerNames,
	visitorCategories,
	type Session,
	type SessionFilters,
	type SessionSpeakerRef,
} from '../lib/sessions';
import { initials } from '../lib/speakers';
import { byStart, formatMinutes, placement } from '../lib/agenda';
import { fetchLineup, speakersById } from '../lib/lineup';
import { useRemote } from '../lib/useRemote';
import { TALK_PARAM } from '../lib/share';
import SessionDetail from './SessionDetail';
import SpeakerPhoto from './SpeakerPhoto';
import { EmptyState, ErrorState, LoadingState } from './DataState';
import s from './Sessions.module.scss';

/** The talk's time (`10:00–10:45`, null before it is scheduled) and its
 * room. Sessionize can leave `room` blank and carry only the id, hence the
 * lookup. */
function whenParts(session: Session, roomNames: Map<string, string>): { time: string | null; room: string } {
	const place = placement(session);
	const time = place ? `${formatMinutes(place.startMin)}–${formatMinutes(place.endMin)}` : null;
	return { time, room: session.room.trim() || roomNames.get(session.roomId) || '' };
}

/** `10:00–10:45, Main Hall` once a talk is scheduled; `Time TBA` (plus the
 * room, if it has one) before. */
function whenLabel(session: Session, roomNames: Map<string, string>): string {
	const { time, room } = whenParts(session, roomNames);
	return [time ?? 'Time TBA', room].filter(Boolean).join(', ');
}

/** Up to three overlapping speaker avatars. The initials sit UNDER each photo,
 * so a circle still reading a name while a lazy photo loads, or when it never
 * paints, never shows as an empty disc. Decorative — the names carry it. */
function CardAvatars({ speakers }: { speakers: SessionSpeakerRef[] }) {
	const shown = speakers.slice(0, 3);
	if (shown.length === 0) return null;
	const extra = speakers.length - shown.length;
	return (
		<span className={s.stack} aria-hidden="true">
			{shown.map((speaker) => (
				<span key={speaker.id} className={`${s.avatar} ${s.avatarMono}`}>
					{initials(speaker.fullName)}
					{/* A failed photo falls back to the initials already under it. */}
					<SpeakerPhoto
						speaker={speaker}
						photoClass={s.avatarImg}
						monogramClass={s.avatarNone}
						width={40}
						height={40}
					/>
				</span>
			))}
			{extra > 0 && <span className={`${s.avatar} ${s.avatarMore}`}>+{extra}</span>}
		</span>
	);
}

/** Slip tilts, cycled down the list: a fraction of `--tilt-1`. */
const TILTS = [s.tiltA, s.tiltB, s.tiltC, s.tiltD];

function SessionCard({
	session,
	when,
	tilt,
	onOpen,
}: {
	session: Session;
	when: { time: string | null; room: string };
	tilt: string;
	onOpen: (session: Session) => void;
}) {
	const names = speakerNames(session);
	// The track; the room travels with the time. Mono sets the time only;
	// the words on the edge are notes.
	const kicker = visitorCategories(session)[0]?.values[0] || 'Talk';
	const where = [when.time ? '' : 'Time TBA', when.room].filter(Boolean).join(', ');

	return (
		<li>
			<button
				type="button"
				className={`${s.card} ${tilt}`}
				onClick={() => onOpen(session)}
				aria-label={`View details for ${session.title}`}
			>
				<span className={s.top}>
					<span>
						{when.time && <span className={s.when}>{when.time}</span>}
						{where && <span>{when.time ? `, ${where}` : where}</span>}
					</span>
					<span className={s.kicker}>{kicker}</span>
				</span>

				<span className={s.title}>{session.title}</span>

				{session.description && <span className={s.excerpt}>{session.description}</span>}

				<span className={s.foot}>
					<CardAvatars speakers={session.speakers} />
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

	const open = useCallback((session: Session) => setSelected(session), []);
	const close = useCallback(() => setSelected(null), []);

	// A `?talk=` link (what `/talks/<id>` and the old `/sessions?talk=` forward
	// to) opens that talk's sheet once the lineup has loaded.
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
				<ul className={s.grid} role="list">
					{filtered.map((session, i) => (
						<SessionCard
							key={session.id}
							session={session}
							when={whenParts(session, roomNames)}
							tilt={TILTS[i % TILTS.length]}
							onOpen={open}
						/>
					))}
					{!active && (
						<li>
							<article className={s.moreCard} aria-label="More sessions to be announced">
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
