import { useEffect, useMemo, useState } from 'react';
import { type Speaker } from '../lib/speakers';
import { fetchLineup } from '../lib/lineup';
import { shuffle } from '../lib/shuffle';
import SpeakerPhoto from './SpeakerPhoto';
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
	return (
		<a
			className={`${s.tile} develop`}
			href="/speakers"
			aria-label={`${speaker.fullName} — see the full lineup`}
		>
			<span className={s.thumb}>
				<SpeakerPhoto
					speaker={speaker}
					photoClass={s.photo}
					monogramClass={s.monogram}
					width={220}
					height={275}
				/>
				<span className={s.scrim} aria-hidden="true" />
				<span className={s.vignette} aria-hidden="true" />
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
 * nothing until the lineup fetch resolves (and on an empty roster) so the home
 * page stays clean pre-announce.
 */
export default function SpeakersTeaser() {
	const [speakers, setSpeakers] = useState<Speaker[]>([]);
	const [status, setStatus] = useState<Status>('loading');
	const [offset, setOffset] = useState(0);
	const [paused, setPaused] = useState(false);
	const reduceMotion = usePrefersReducedMotion();

	useEffect(() => {
		const ac = new AbortController();
		fetchLineup(ac.signal)
			.then(({ speakers: next }) => {
				setSpeakers(next);
				setStatus(next.length > 0 ? 'ready' : 'empty');
			})
			.catch((err) => {
				if (ac.signal.aborted) return;
				console.warn('[speakers-teaser] Failed to load lineup:', err);
				setStatus('error');
			});
		return () => ac.abort();
	}, []);

	// Shuffle once per roster so the starting window — and rotation order — is
	// random on every load. Keyed on the id set so it only reshuffles when the
	// roster actually changes, not on every re-render or rotation tick.
	const displaySpeakers = useMemo(() => shuffle(speakers), [speakers.map((sp) => sp.id).join('|')]);

	const total = displaySpeakers.length;
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

	const shown = Array.from({ length: size }, (_, i) => displaySpeakers[(offset + i) % total]);

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
				{/* Title left, the lede and the way out right — NOT the
				    eyebrow-over-title-over-lede stack the ticket section and the
				    facts band were also running. Three sections sharing one head
				    shape down one page is what reads as a template, and the
				    stack left the right half of every section empty. */}
				<div className="head-split head-split--ruled">
					<h2 id="lineup-teaser-title" className="display head-title">
						The <span className="red">speakers.</span>
					</h2>
					<div className={s.headSide}>
						<p className="head-note">New names hit the wall as they&rsquo;re confirmed.</p>
						<a className={s.allLink} href="/speakers">See all speakers</a>
					</div>
				</div>

				<ul className={s.wall} role="list" key={offset}>
					{shown.map((speaker, i) => (
						// `--i` staggers the develop animation, so a rotation deals the
						// new set out one print at a time instead of swapping all four.
						<li key={speaker.id} style={{ '--i': i } as React.CSSProperties}>
							<Thumb speaker={speaker} />
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}
