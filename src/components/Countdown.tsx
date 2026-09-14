import { Fragment, useEffect, useState } from 'react';
import s from './Countdown.module.scss';

const TARGET = new Date('2026-10-30T09:00:00+01:00').getTime();

interface TimeLeft {
	days: string;
	hours: string;
	minutes: string;
	seconds: string;
}

/** Pre-hydration value, and what the clock settles on once doors open. */
const ZERO: TimeLeft = { days: '0', hours: '00', minutes: '00', seconds: '00' };

function calcTimeLeft(): TimeLeft {
	const diff = TARGET - Date.now();

	if (diff <= 0) return ZERO;

	return {
		days: String(Math.floor(diff / (1000 * 60 * 60 * 24))),
		hours: String(Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0'),
		minutes: String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0'),
		seconds: String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0'),
	};
}

const UNITS: { key: keyof TimeLeft; label: string; suffix: string }[] = [
	{ key: 'days', label: 'Days', suffix: 'd' },
	{ key: 'hours', label: 'Hrs', suffix: 'h' },
	{ key: 'minutes', label: 'Min', suffix: 'm' },
	{ key: 'seconds', label: 'Sec', suffix: 's' },
];

interface Props {
	/** `069d 22h 43m 21s` on one line. The suffix is real DOM text, not a
	 * `::after` — generated content is invisible to anything reading the DOM. */
	compact?: boolean;
	/**
	 * Drop the seconds — `54D 10H 34M`. Seconds ticking beside the hero's
	 * rotating topic is a second clock in the same shot. The 15s interval is
	 * slack so a stale minute never survives long.
	 */
	showSeconds?: boolean;
}

export default function Countdown({ compact = false, showSeconds = true }: Props) {
	const [time, setTime] = useState<TimeLeft>(ZERO);
	const units = showSeconds ? UNITS : UNITS.filter((u) => u.key !== 'seconds');

	useEffect(() => {
		setTime(calcTimeLeft());
		const id = setInterval(() => setTime(calcTimeLeft()), showSeconds ? 1000 : 15000);
		return () => clearInterval(id);
	}, [showSeconds]);

	// The clock is decorative — screen readers get the static "doors open"
	// sentence; a per-second aria-label would spam AT. One continuous readout
	// rather than four bordered stubs, which read as chrome around the number.
	return (
		<>
			<span className={s.srOnly}>Doors open on 30 October 2026 at 9:00 AM Central European Time.</span>
			<div className={`${s.countdown} ${compact ? s.countdownCompact : ''}`} aria-hidden="true">
				{units.map(({ key, label, suffix }, i) => (
					<Fragment key={key}>
						{!compact && i > 0 && <span className={s.sep}>:</span>}
						<div className={`${s.unit} ${compact ? s.unitCompact : ''}`}>
							<span className={`${s.value} ${compact && key === 'days' ? s.valueDays : ''}`}>{time[key]}</span>
							<span className={s.label}>{compact ? suffix : label}</span>
						</div>
					</Fragment>
				))}
			</div>
		</>
	);
}
