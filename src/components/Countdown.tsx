import { useEffect, useState } from 'react';
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
		return { days: '00', hours: '00', minutes: '00', seconds: '00' };
	}

	return {
		days: String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, '0'),
		hours: String(Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0'),
		minutes: String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0'),
		seconds: String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0'),
	};
}

const UNITS: { key: keyof TimeLeft; label: string }[] = [
	{ key: 'days', label: 'Days' },
	{ key: 'hours', label: 'Hours' },
	{ key: 'minutes', label: 'Minutes' },
	{ key: 'seconds', label: 'Seconds' },
];

export default function Countdown() {
	const [time, setTime] = useState<TimeLeft>(calcTimeLeft);

	useEffect(() => {
		const id = setInterval(() => setTime(calcTimeLeft()), 1000);
		return () => clearInterval(id);
	}, []);

	return (
		<div className={s.countdown}>
			{UNITS.map(({ key, label }, i) => (
				<>
					{i > 0 && <div key={`sep-${key}`} className={s.separator}>:</div>}
					<div key={key} className={s.unit}>
						<span className={s.value}>{time[key]}</span>
						<span className={s.label}>{label}</span>
					</div>
				</>
			))}
		</div>
	);
}
