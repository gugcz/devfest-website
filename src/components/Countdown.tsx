import { Fragment, useEffect, useRef, useState } from 'react';
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

const UNITS: { key: keyof TimeLeft; label: string; code: string }[] = [
	{ key: 'days', label: 'Days', code: 'DD' },
	{ key: 'hours', label: 'Hours', code: 'HR' },
	{ key: 'minutes', label: 'Minutes', code: 'MN' },
	{ key: 'seconds', label: 'Seconds', code: 'SC' },
];

interface StampDigitProps {
	value: string;
	idx: number;
	code: string;
}

function StampDigit({ value, idx, code }: StampDigitProps) {
	const [prev, setPrev] = useState(value);
	const [animKey, setAnimKey] = useState(0);
	const settleTimeoutRef = useRef<number | undefined>(undefined);

	useEffect(() => {
		if (value !== prev) {
			setAnimKey((k) => k + 1);
			window.clearTimeout(settleTimeoutRef.current);
			settleTimeoutRef.current = window.setTimeout(() => setPrev(value), 220);
		}
		return () => window.clearTimeout(settleTimeoutRef.current);
	}, [value, prev]);

	const stamping = value !== prev;
	const tilt = idx % 2 === 0 ? '-0.45deg' : '0.5deg';

	return (
		<div
			className={`${s.card} ${stamping ? s.cardJolting : ''}`}
			style={{ '--card-tilt': tilt } as React.CSSProperties}
		>
			<div className={s.cardStamp} aria-hidden="true">
				<span className={s.cardStampText}>{code}</span>
			</div>
			<span
				className={`${s.digit} ${stamping ? s.digitStamping : ''}`}
				key={animKey}
			>
				{value}
			</span>
		</div>
	);
}

export default function Countdown() {
	const [time, setTime] = useState<TimeLeft>(calcTimeLeft);

	useEffect(() => {
		const id = setInterval(() => setTime(calcTimeLeft()), 1000);
		return () => clearInterval(id);
	}, []);

	const daysNum = parseInt(time.days, 10);
	const hoursNum = parseInt(time.hours, 10);
	const minutesNum = parseInt(time.minutes, 10);
	const secondsNum = parseInt(time.seconds, 10);

	return (
		<div
			className={s.countdown}
			role="timer"
			aria-live="polite"
			aria-atomic="true"
			aria-label={`Time until doors open: ${daysNum} days, ${hoursNum} hours, ${minutesNum} minutes, ${secondsNum} seconds`}
		>
			{UNITS.map(({ key, label, code }) => (
				<Fragment key={key}>
					<div className={s.unit} aria-hidden="true">
						<div className={s.cards}>
							{time[key].split('').map((d, idx) => (
								<StampDigit key={`${key}-${idx}`} value={d} idx={idx} code={code} />
							))}
						</div>
						<span className={s.label}>{label}</span>
					</div>
				</Fragment>
			))}
		</div>
	);
}
