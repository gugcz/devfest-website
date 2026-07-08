import { useEffect, useState } from 'react';
import { initials, SPEAKER_ICON_PATHS, speakerFromDoc, type Speaker } from '../lib/speakers';
import s from './Speakers.module.scss';

type Status = 'loading' | 'ready' | 'empty' | 'error';

interface State {
	status: Status;
	speakers: Speaker[];
}

const INITIAL: State = { status: 'loading', speakers: [] };

function SpeakerCard({ speaker }: { speaker: Speaker }) {
	// A present-but-broken CDN URL (404 / timeout) falls back to the monogram,
	// same as a speaker with no photo at all.
	const [imageFailed, setImageFailed] = useState(false);
	const showPhoto = Boolean(speaker.profilePicture) && !imageFailed;
	const index = String(speaker.order + 1).padStart(2, '0');

	return (
		<li>
			<article className={s.card}>
				<div className={s.portrait}>
					{showPhoto ? (
						<img
							className={s.photo}
							src={speaker.profilePicture}
							alt={speaker.fullName}
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
					<span className={s.scrim} aria-hidden="true" />
					<span className={s.index} aria-hidden="true">
						{index}
					</span>
					<div className={s.caption}>
						<h3 className={s.name}>{speaker.fullName}</h3>
						{speaker.tagLine && <p className={s.tagline}>{speaker.tagLine}</p>}
						{speaker.links.length > 0 && (
							<ul className={s.links}>
								{speaker.links.map((link) => (
									<li key={`${link.kind}-${link.url}`}>
										<a
											className={s.link}
											href={link.url}
											aria-label={`${speaker.fullName} — ${link.label}`}
											title={link.label}
											target="_blank"
											rel="noopener noreferrer"
										>
											<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
												<path d={SPEAKER_ICON_PATHS[link.kind]} />
											</svg>
										</a>
									</li>
								))}
							</ul>
						)}
					</div>
				</div>
			</article>
		</li>
	);
}

export default function Speakers() {
	const [state, setState] = useState<State>(INITIAL);

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
		<ul className={s.grid} role="list">
			{state.speakers.map((speaker) => (
				<SpeakerCard key={speaker.id} speaker={speaker} />
			))}
		</ul>
	);
}
