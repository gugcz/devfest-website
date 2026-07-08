import { useEffect, useState } from 'react';
import { initials, speakerFromDoc, type Speaker } from '../lib/speakers';
import s from './SpeakersTeaser.module.scss';

type Status = 'loading' | 'ready' | 'empty' | 'error';

// Tiles shown on the home wall before collapsing the rest into a "+N more" tile.
const MAX_TILES = 11;

function Thumb({ speaker }: { speaker: Speaker }) {
	const [imageFailed, setImageFailed] = useState(false);
	const showPhoto = Boolean(speaker.profilePicture) && !imageFailed;
	const index = String(speaker.order + 1).padStart(2, '0');

	return (
		<a className={s.tile} href="/speakers" aria-label={`${speaker.fullName} — see the full lineup`}>
			<span className={s.thumb}>
				{showPhoto ? (
					<img
						className={s.photo}
						src={speaker.profilePicture}
						alt=""
						loading="lazy"
						decoding="async"
						width={220}
						height={275}
						onError={() => setImageFailed(true)}
					/>
				) : (
					<span className={s.monogram} aria-hidden="true">
						{initials(speaker.fullName) || '?'}
					</span>
				)}
			</span>
			<span className={s.meta}>
				<span className={s.index} aria-hidden="true">
					{index}
				</span>
				<span className={s.tname}>{speaker.fullName}</span>
			</span>
		</a>
	);
}

/**
 * Home-page "lineup wall": a grid of grayscale speaker mugshots (a noir suspects
 * board) linking to the full /speakers page. Renders nothing until Firestore is
 * ready, so the home page stays clean before the lineup is announced.
 */
export default function SpeakersTeaser() {
	const [speakers, setSpeakers] = useState<Speaker[]>([]);
	const [status, setStatus] = useState<Status>('loading');

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
						const next = snapshot.docs.map((doc) => speakerFromDoc(doc.id, doc.data()));
						setSpeakers(next);
						setStatus(next.length > 0 ? 'ready' : 'empty');
					},
					(err) => {
						console.warn('[speakers-teaser] Failed to read speakers from Firestore:', err);
						setStatus('error');
					},
				);
			} catch (err) {
				console.warn('[speakers-teaser] Failed to load Firebase modules:', err);
				if (!cancelled) setStatus('error');
			}
		})();
		return () => {
			cancelled = true;
			unsubscribe?.();
		};
	}, []);

	if (status !== 'ready' || speakers.length === 0) return null;

	const shown = speakers.slice(0, MAX_TILES);
	const remaining = speakers.length - shown.length;

	return (
		<section className={s.teaser} aria-labelledby="lineup-teaser-title">
			<div className={s.inner}>
				<div className={s.head}>
					<p className={s.eyebrow}>On the bill</p>
					<h2 id="lineup-teaser-title" className={s.heading}>
						The <span className={s.red}>speakers.</span>
					</h2>
					<p className={s.lede}>{speakers.length} confirmed so far — more names on the wall soon.</p>
				</div>

				<ul className={s.wall} role="list">
					{shown.map((speaker) => (
						<li key={speaker.id}>
							<Thumb speaker={speaker} />
						</li>
					))}
					<li>
						<a className={s.moreTile} href="/speakers" aria-label="See the full speaker lineup">
							<span className={s.moreNum}>{remaining > 0 ? `+${remaining}` : 'All'}</span>
							<span className={s.moreLabel}>{remaining > 0 ? 'more' : 'the lineup'}</span>
							<span className={s.moreArrow} aria-hidden="true">↗</span>
						</a>
					</li>
				</ul>
			</div>
		</section>
	);
}
