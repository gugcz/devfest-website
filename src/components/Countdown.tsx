import { Fragment, useEffect, useState } from 'react';
import s from './Countdown.module.scss';

const TARGET = new Date('2026-10-30T09:00:00+01:00').getTime();

interface TimeLeft {
	days: string;
	hours: string;
	minutes: string;
	seconds: string;
}

function calcTimeLeft(): TimeLeft {
	const diff = TARGET - Date.now();

	if (diff <= 0) {
		return { days: '0', hours: '00', minutes: '00', seconds: '00' };
	}

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

const INITIAL_TIME: TimeLeft = { days: '0', hours: '00', minutes: '00', seconds: '00' };

interface Props {
	/**
	 * `069d 22h 43m 21s` on one line instead of four labelled stubs separated
	 * by colons. The suffix is real rendered text on the unit, not a stylesheet
	 * `::after` — a generated-content suffix reads fine visually but is
	 * invisible to anything that inspects the DOM text.
	 */
	compact?: boolean;
}

export default function Countdown({ compact = false }: Props) {
	const [time, setTime] = useState<TimeLeft>(INITIAL_TIME);

	useEffect(() => {
		setTime(calcTimeLeft());
		const id = setInterval(() => setTime(calcTimeLeft()), 1000);
		return () => clearInterval(id);
	}, []);

	// The clock is decorative — screen readers get the static "doors open"
	// sentence instead. A per-second aria-label would spam AT without adding
	// value, since the exact date is already given.
	//
	// Set as one continuous readout (069:22:43:21) rather than four bordered
	// stubs: the stub carried a red header strip and a stamped-in digit
	// animation per tick, which read as chrome around the number instead of
	// the number itself.
	return (
		<>
			<span className={s.srOnly}>Doors open on 30 October 2026 at 9:00 AM Central European Time.</span>
			<div className={`${s.countdown} ${compact ? s.countdownCompact : ''}`} aria-hidden="true">
				{UNITS.map(({ key, label, suffix }, i) => (
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
