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
		return { days: '000', hours: '00', minutes: '00', seconds: '00' };
	}

	return {
		days: String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(3, '0'),
		hours: String(Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0'),
		minutes: String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0'),
		seconds: String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0'),
	};
}

const UNITS: { key: keyof TimeLeft; label: string }[] = [
	{ key: 'days', label: 'Days' },
	{ key: 'hours', label: 'Hrs' },
	{ key: 'minutes', label: 'Min' },
	{ key: 'seconds', label: 'Sec' },
];

const INITIAL_TIME: TimeLeft = { days: '000', hours: '00', minutes: '00', seconds: '00' };

export default function Countdown() {
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
			<div className={s.countdown} aria-hidden="true">
				{UNITS.map(({ key, label }, i) => (
					<Fragment key={key}>
						{i > 0 && <span className={s.sep}>:</span>}
						<div className={s.unit}>
							<span className={s.value}>{time[key]}</span>
							<span className={s.label}>{label}</span>
						</div>
					</Fragment>
				))}
			</div>
		</>
	);
}
