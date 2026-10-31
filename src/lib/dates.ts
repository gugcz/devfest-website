/**
 * The date and the clock as the site writes them, formatted in the event's
 * time zone from an ISO 8601 string. One style per spelling the site uses in
 * more than one place; a page never slices or pads a date itself.
 */

export type DateStyle =
	/** `30 October 2026` — running copy. Day-month-year, never "October 30". */
	| 'label'
	/** `30 Oct 2026` — mono stamps and meta lines (uppercased by CSS where needed). */
	| 'short'
	/** `30 / 10 / 26` — the case-file stamp in the menu and the detail sheets. */
	| 'slash'
	/** `30.10.2026` — the share cards. */
	| 'dots'
	/** `30 OCT 2026` — the canvas cards' band. */
	| 'stamp'
	/** `2026-10-30` — `datetime` attributes. */
	| 'iso';

interface DateParts {
	day: number;
	month: number;
	year: number;
	monthLong: string;
	monthShort: string;
}

/** Calendar fields of `iso` as seen in `timeZone`. `en-US` for the month
 * names: `en-GB` abbreviates September as "Sept". */
function dateParts(iso: string, timeZone: string): DateParts {
	const date = new Date(iso);
	const numeric = new Intl.DateTimeFormat('en-US', {
		timeZone,
		day: 'numeric',
		month: 'numeric',
		year: 'numeric',
	}).formatToParts(date);
	const value = (type: string): string => numeric.find((part) => part.type === type)?.value ?? '';
	return {
		day: Number(value('day')),
		month: Number(value('month')),
		year: Number(value('year')),
		monthLong: new Intl.DateTimeFormat('en-US', { timeZone, month: 'long' }).format(date),
		monthShort: new Intl.DateTimeFormat('en-US', { timeZone, month: 'short' }).format(date),
	};
}

const pad = (n: number): string => String(n).padStart(2, '0');

/** `iso` written in `style`, in the event's `timeZone`. */
export function formatDate(iso: string, style: DateStyle, timeZone: string): string {
	const { day, month, year, monthLong, monthShort } = dateParts(iso, timeZone);
	switch (style) {
		case 'label':
			return `${day} ${monthLong} ${year}`;
		case 'short':
			return `${day} ${monthShort} ${year}`;
		case 'slash':
			return `${pad(day)} / ${pad(month)} / ${pad(year % 100)}`;
		case 'dots':
			return `${pad(day)}.${pad(month)}.${year}`;
		case 'stamp':
			return `${day} ${monthShort.toUpperCase()} ${year}`;
		case 'iso':
			return `${year}-${pad(month)}-${pad(day)}`;
	}
}

/** `HH:MM` of `iso` on a 24-hour clock in `timeZone`. */
export function formatTime(iso: string, timeZone: string): string {
	return new Intl.DateTimeFormat('en-GB', {
		timeZone,
		hour: '2-digit',
		minute: '2-digit',
		hourCycle: 'h23',
	}).format(new Date(iso));
}
