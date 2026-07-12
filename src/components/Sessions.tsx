import { useEffect, useMemo, useState } from 'react';
import { initials } from '../lib/speakers';
import {
	collectFacets,
	hasActiveFilters,
	isDisplayableSession,
	matchesFilters,
	sessionFromDoc,
	visitorCategories,
	type Session,
	type SessionFilters,
} from '../lib/sessions';
import SessionDetail from './SessionDetail';
import s from './Sessions.module.scss';

type Status = 'loading' | 'ready' | 'empty' | 'error';

interface State {
	status: Status;
	sessions: Session[];
}

const INITIAL: State = { status: 'loading', sessions: [] };

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

function SessionCard({ session, onOpen }: { session: Session; onOpen: (session: Session) => void }) {
	const names = session.speakers.map((sp) => sp.fullName).filter(Boolean).join(', ');
	// Lead the card with the primary track (falls back to the room, then a generic
	// label).
	const kicker = visitorCategories(session)[0]?.values[0] || session.room || 'Talk';

	return (
		<li>
			<button
				type="button"
				className={s.card}
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
	const [selected, setSelected] = useState<Session | null>(null);
	const [query, setQuery] = useState('');
	const [filters, setFilters] = useState<SessionFilters>({});

	useEffect(() => {
		let unsubscribe: (() => void) | null = null;
		let cancelled = false;
		(async () => {
			try {
				const [{ getFirestoreDb }, { collection, onSnapshot, orderBy, query: fsQuery }] =
					await Promise.all([import('../lib/firebase'), import('firebase/firestore')]);
				if (cancelled) return;
				const db = getFirestoreDb();
				const sessionsQuery = fsQuery(collection(db, 'sessions'), orderBy('order'));
				unsubscribe = onSnapshot(
					sessionsQuery,
					(snapshot) => {
						const sessions = snapshot.docs
							.map((doc) => sessionFromDoc(doc.id, doc.data()))
							.filter(isDisplayableSession);
						setState({ status: sessions.length > 0 ? 'ready' : 'empty', sessions });
					},
					(err) => {
						console.warn('[sessions] Failed to read sessions from Firestore:', err);
						setState((prev) => ({ ...prev, status: 'error' }));
					},
				);
			} catch (err) {
				console.warn('[sessions] Failed to load Firebase modules:', err);
				if (!cancelled) setState((prev) => ({ ...prev, status: 'error' }));
			}
		})();
		return () => {
			cancelled = true;
			unsubscribe?.();
		};
	}, []);

	// If the live list changes while a session is open, keep the dialog in sync
	// (or close it if that session is gone).
	useEffect(() => {
		if (!selected) return;
		const fresh = state.sessions.find((se) => se.id === selected.id);
		if (fresh && fresh !== selected) setSelected(fresh);
		else if (!fresh && state.status === 'ready') setSelected(null);
	}, [state.sessions, state.status, selected]);

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
				<p>The sessions list is temporarily unavailable. Please check back soon.</p>
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
						<SessionCard key={session.id} session={session} onOpen={setSelected} />
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
			{selected && <SessionDetail session={selected} onClose={() => setSelected(null)} />}
		</>
	);
}
