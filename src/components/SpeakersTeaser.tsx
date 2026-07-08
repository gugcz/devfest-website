import { useEffect, useState } from 'react';
import { initials, speakerFromDoc, type Speaker } from '../lib/speakers';
import s from './SpeakersTeaser.module.scss';

type Status = 'loading' | 'ready' | 'empty' | 'error';

const ROTATE_MS = 3800;

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

/**
 * Home-page teaser: a single speaker spotlight that auto-rotates through the
 * live `speakers` collection. Renders nothing until data is ready, so the home
 * page stays clean before the lineup is announced or if the read fails.
 */
export default function SpeakersTeaser() {
	const [speakers, setSpeakers] = useState<Speaker[]>([]);
	const [status, setStatus] = useState<Status>('loading');
	const [current, setCurrent] = useState(0);
	const [paused, setPaused] = useState(false);
	const [failed, setFailed] = useState<Record<string, boolean>>({});
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

	// Keep the pointer in range if the list shrinks between syncs.
	useEffect(() => {
		if (current >= speakers.length && speakers.length > 0) setCurrent(0);
	}, [speakers.length, current]);

	// Auto-rotate — paused on hover/focus and when the user prefers reduced motion.
	useEffect(() => {
		if (status !== 'ready' || speakers.length < 2 || paused || reduceMotion) return;
		const id = setInterval(() => {
			setCurrent((c) => (c + 1) % speakers.length);
		}, ROTATE_MS);
		return () => clearInterval(id);
	}, [status, speakers.length, paused, reduceMotion]);

	if (status !== 'ready' || speakers.length === 0) return null;

	const speaker = speakers[current] ?? speakers[0];
	const showPhoto = Boolean(speaker.profilePicture) && !failed[speaker.id];
	const total = String(speakers.length).padStart(2, '0');
	const position = String(current + 1).padStart(2, '0');

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
					<p className={s.eyebrow}>On the bill</p>
					<h2 id="lineup-teaser-title" className={s.heading}>
						The <span className={s.red}>speakers.</span>
					</h2>
				</div>

				<a
					className={s.spotlightLink}
					href="/speakers"
					aria-label={`See the full speaker lineup — currently featuring ${speaker.fullName}`}
				>
					<div className={s.spotlight} key={speaker.id}>
						<div className={s.portrait}>
							{showPhoto ? (
								<img
									className={s.photo}
									src={speaker.profilePicture}
									alt=""
									loading="lazy"
									decoding="async"
									width={320}
									height={400}
									onError={() => setFailed((f) => ({ ...f, [speaker.id]: true }))}
								/>
							) : (
								<span className={s.monogram} aria-hidden="true">
									{initials(speaker.fullName) || '?'}
								</span>
							)}
						</div>
						<div className={s.info}>
							<span className={s.kicker}>Speaker</span>
							<p className={s.name}>{speaker.fullName}</p>
							{speaker.tagLine && <p className={s.tag}>{speaker.tagLine}</p>}
						</div>
					</div>
				</a>

				<div className={s.foot}>
					{!reduceMotion && speakers.length > 1 && (
						<span className={s.progress} aria-hidden="true">
							<span
								key={current}
								className={s.bar}
								style={{
									animationDuration: `${ROTATE_MS}ms`,
									animationPlayState: paused ? 'paused' : 'running',
								}}
							/>
						</span>
					)}
					<span className={s.counter} aria-hidden="true">
						{position} / {total}
					</span>
					<a className={s.cta} href="/speakers">
						Full lineup
						<span className={s.ctaArrow} aria-hidden="true">↗</span>
					</a>
				</div>
			</div>
		</section>
	);
}
