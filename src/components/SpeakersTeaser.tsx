import { useEffect, useState } from 'react';
import { initials, speakerFromDoc, type Speaker } from '../lib/speakers';
import s from './SpeakersTeaser.module.scss';

type Status = 'loading' | 'ready' | 'empty' | 'error';

// Speakers shown at once on the home wall; the visible set rotates through the
// full roster over time (rotation kicks in once there are more than this).
const WALL_SIZE = 4;
const ROTATE_MS = 5000;

function usePrefersReducedMotion(): boolean {
	const [reduce, setReduce] = useState(false);
	useEffect(() => {
		const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
		const update = () => setReduce(mql.matches);
		update();
		mql.addEventListener('change', update);
		return () => mql.removeEventListener('change', update);
	}, []);
	return reduce;
}

function Thumb({ speaker }: { speaker: Speaker }) {
	const [imageFailed, setImageFailed] = useState(false);
	const showPhoto = Boolean(speaker.profilePicture) && !imageFailed;

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
				<span className={s.grain} aria-hidden="true" />
			</span>
			<span className={s.plate}>
				<span className={s.tname}>{speaker.fullName}</span>
			</span>
		</a>
	);
}

/**
 * Home-page "case wall": a small set of speaker mugshots that rotates through
 * the full roster over time, plus a link to the full /speakers page. Renders
 * nothing until Firestore is ready so the home page stays clean pre-announce.
 */
export default function SpeakersTeaser() {
	const [speakers, setSpeakers] = useState<Speaker[]>([]);
	const [status, setStatus] = useState<Status>('loading');
	const [offset, setOffset] = useState(0);
	const [paused, setPaused] = useState(false);
	const reduceMotion = usePrefersReducedMotion();

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

	const total = speakers.length;
	const size = Math.min(WALL_SIZE, total);
	const canRotate = total > WALL_SIZE;

	// Advance the visible window through the roster (wrapping) so the wall keeps
	// changing. Paused on hover/focus and when reduced motion is preferred.
	useEffect(() => {
		if (status !== 'ready' || !canRotate || paused || reduceMotion) return;
		const id = setInterval(() => {
			setOffset((o) => (o + size) % total);
		}, ROTATE_MS);
		return () => clearInterval(id);
	}, [status, canRotate, paused, reduceMotion, size, total]);

	// Keep the window valid if the roster shrinks between syncs.
	useEffect(() => {
		if (total > 0 && offset >= total) setOffset(0);
	}, [total, offset]);

	if (status !== 'ready' || total === 0) return null;

	const shown = Array.from({ length: size }, (_, i) => speakers[(offset + i) % total]);

	return (
		<section
			className={s.teaser}
			aria-labelledby="lineup-teaser-title"
			onMouseEnter={() => setPaused(true)}
			onMouseLeave={() => setPaused(false)}
			onFocus={() => setPaused(true)}
			onBlur={() => setPaused(false)}
		>
			<div className={s.inner}>
				<div className={s.head}>
					<p className={s.eyebrow}>Now speaking</p>
					<h2 id="lineup-teaser-title" className={s.heading}>
						The <span className={s.red}>speakers.</span>
					</h2>
					<p className={s.lede}>New names hit the wall as they&rsquo;re confirmed.</p>
				</div>

				<ul className={s.wall} role="list" key={offset}>
					{shown.map((speaker) => (
						<li key={speaker.id}>
							<Thumb speaker={speaker} />
						</li>
					))}
				</ul>

				<div className={s.foot}>
					<a className={s.allLink} href="/speakers">
						See all speakers
						<span className={s.allArrow} aria-hidden="true">↗</span>
					</a>
				</div>
			</div>
		</section>
	);
}
