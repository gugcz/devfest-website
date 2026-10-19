import { useEffect, useState } from 'react';
import { EVENT } from '../lib/event';
import s from './Countdown.module.scss';

const START = new Date(EVENT.start).getTime();
const END = new Date(EVENT.end).getTime();

const DAY = 86_400_000;
const HOUR = 3_600_000;
const MINUTE = 60_000;

type Phase = 'pending' | 'counting' | 'live' | 'over';

const pad = (n: number): string => String(n).padStart(2, '0');

/** `10d 14h 22m 05s`, or without the seconds when motion is reduced. */
function timeLeft(diff: number, seconds: boolean): string {
	const d = Math.floor(diff / DAY);
	const h = pad(Math.floor((diff % DAY) / HOUR));
	const m = pad(Math.floor((diff % HOUR) / MINUTE));
	const base = `${d}d ${h}h ${m}m`;
	return seconds ? `${base} ${pad(Math.floor((diff % MINUTE) / 1000))}s` : base;
}

function phaseAt(now: number): Phase {
	if (now < START) return 'counting';
	return now < END ? 'live' : 'over';
}

/**
 * The time to the opening keynote, typed into the hero's facts line after
 * the date. The one thing on the site that moves on its own: it ticks by
 * the second, and under reduced motion drops the seconds so nothing ticks.
 * The figure is `aria-hidden`; screen readers get the static sentence.
 * Before hydration the item holds its box, so the line does not reflow.
 */
export default function Countdown() {
	const [now, setNow] = useState<number | null>(null);
	const [seconds, setSeconds] = useState(true);

	useEffect(() => {
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
		const sync = () => setSeconds(!reduce.matches);
		sync();
		reduce.addEventListener('change', sync);
		return () => reduce.removeEventListener('change', sync);
	}, []);

	useEffect(() => {
		const tick = () => {
			const t = Date.now();
			setNow(t);
			// Nothing left to show once the day is over.
			if (t >= END) clearInterval(id);
		};
		// Without seconds a 15s refresh keeps a stale minute from lingering.
		const id = setInterval(tick, seconds ? 1000 : 15_000);
		tick();
		return () => clearInterval(id);
	}, [seconds]);

	const phase: Phase = now === null ? 'pending' : phaseAt(now);

	if (phase === 'over') return null;

	if (phase === 'live') {
		return (
			<p className={s.countdown}>
				<span className={s.value}>Live now</span>
			</p>
		);
	}

	return (
		<p className={`${s.countdown} ${phase === 'pending' ? s.pending : ''}`}>
			<span className="sr-only">
				Opening keynote on {EVENT.dateLabel} at {EVENT.startTime} CET.
			</span>
			<span className={s.label} aria-hidden="true">Keynote in</span>
			<span className={s.figure} aria-hidden="true">
				{now === null ? '00d 00h 00m 00s' : timeLeft(START - now, seconds)}
			</span>
		</p>
	);
}
