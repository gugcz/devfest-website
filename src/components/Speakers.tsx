import { useEffect, useState } from 'react';
import { initials, speakerFromDoc, type Speaker } from '../lib/speakers';
import SpeakerDetail from './SpeakerDetail';
import s from './Speakers.module.scss';

type Status = 'loading' | 'ready' | 'empty' | 'error';

interface State {
	status: Status;
	speakers: Speaker[];
}

const INITIAL: State = { status: 'loading', speakers: [] };

function SpeakerCard({ speaker, onOpen }: { speaker: Speaker; onOpen: (speaker: Speaker) => void }) {
	// A present-but-broken CDN URL (404 / timeout) falls back to the monogram,
	// same as a speaker with no photo at all.
	const [imageFailed, setImageFailed] = useState(false);
	const showPhoto = Boolean(speaker.profilePicture) && !imageFailed;
	const index = String(speaker.order + 1).padStart(2, '0');

	return (
		<li>
			<button
				type="button"
				className={s.card}
				onClick={() => onOpen(speaker)}
				aria-label={`View ${speaker.fullName}'s profile`}
			>
				<span className={s.media}>
					{showPhoto ? (
						<img
							className={s.photo}
							src={speaker.profilePicture}
							alt=""
							loading="lazy"
							decoding="async"
							width={400}
							height={500}
							onError={() => setImageFailed(true)}
						/>
					) : (
						<span className={s.monogram} aria-hidden="true">
							{initials(speaker.fullName) || '?'}
						</span>
					)}
					<span className={s.grain} aria-hidden="true" />
				</span>
				<span className={s.body}>
					<span className={s.index} aria-hidden="true">
						{index}
					</span>
					<span className={s.name}>{speaker.fullName}</span>
					{/* Always rendered (even when empty) so every card reserves the same
					    two-line slot and card heights stay uniform across the grid. */}
					<span className={s.tagline}>{speaker.tagLine}</span>
					<span className={s.more}>
						View profile
						<span className={s.moreArrow} aria-hidden="true">→</span>
					</span>
				</span>
			</button>
		</li>
	);
}

export default function Speakers() {
	const [state, setState] = useState<State>(INITIAL);
	const [selected, setSelected] = useState<Speaker | null>(null);

	useEffect(() => {
		let unsubscribe: (() => void) | null = null;
		let cancelled = false;
		(async () => {
			try {
				const [{ getFirestoreDb }, { collection, onSnapshot, orderBy, query }] = await Promise.all([
					import('../lib/firebase'),
					import('firebase/firestore'),
				]);
				if (cancelled) return;
				const db = getFirestoreDb();
				const speakersQuery = query(collection(db, 'speakers'), orderBy('order'));
				unsubscribe = onSnapshot(
					speakersQuery,
					(snapshot) => {
						const speakers = snapshot.docs.map((doc) => speakerFromDoc(doc.id, doc.data()));
						setState({ status: speakers.length > 0 ? 'ready' : 'empty', speakers });
					},
					(err) => {
						console.warn('[speakers] Failed to read speakers from Firestore:', err);
						setState((prev) => ({ ...prev, status: 'error' }));
					},
				);
			} catch (err) {
				console.warn('[speakers] Failed to load Firebase modules:', err);
				if (!cancelled) setState((prev) => ({ ...prev, status: 'error' }));
			}
		})();
		return () => {
			cancelled = true;
			unsubscribe?.();
		};
	}, []);

	// If the live list changes while a speaker is open, keep the dialog in sync
	// (or close it if that speaker is gone).
	useEffect(() => {
		if (!selected) return;
		const fresh = state.speakers.find((sp) => sp.id === selected.id);
		if (fresh && fresh !== selected) setSelected(fresh);
		else if (!fresh && state.status === 'ready') setSelected(null);
	}, [state.speakers, state.status, selected]);

	if (state.status === 'error') {
		return (
			<div className={s.status} role="alert">
				<p>The lineup is temporarily unavailable. Please check back soon.</p>
			</div>
		);
	}

	if (state.status === 'loading') {
		return (
			<p className={s.loadingStatus} role="status">
				<span className={s.loadingDot} aria-hidden="true" />
				Loading lineup
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
				<p>Lineup announced soon.</p>
			</div>
		);
	}

	return (
		<>
			<ul className={s.grid} role="list">
				{state.speakers.map((speaker) => (
					<SpeakerCard key={speaker.id} speaker={speaker} onOpen={setSelected} />
				))}
				<li>
					<article className={s.moreCard} aria-label="More speakers to be announced">
						<span className={s.moreDots} aria-hidden="true">
							<span />
							<span />
							<span />
						</span>
						<span className={s.moreKicker}>Case open</span>
						<p className={s.moreText}>More speakers announced soon</p>
					</article>
				</li>
			</ul>
			{selected && <SpeakerDetail speaker={selected} onClose={() => setSelected(null)} />}
		</>
	);
}
