/**
 * `/calendar.ics`: the event as one calendar entry, built from
 * `src/site.config.ts` so the dates can never drift from the page. Apple
 * Calendar, Outlook and the rest open the file; Google Calendar gets the
 * template URL (`googleCalendarUrl` in `src/lib/event.ts`) instead.
 */
import type { APIRoute } from 'astro';
import config from '../site.config';
import { calendarDescription, calendarLocation, EVENT, toCalendarStamp } from '../lib/event';

/** RFC 5545 TEXT: backslash, comma and semicolon escaped, newlines as `\n`. */
const escapeText = (text: string): string =>
	text.replace(/\\/g, '\\\\').replace(/([,;])/g, '\\$1').replace(/\r?\n/g, '\\n');

/** RFC 5545 §3.1: a content line is at most 75 octets; the rest continues on
 * the next line after one space. Split on octets, never inside a UTF-8
 * sequence. */
function fold(line: string): string {
	const bytes = Buffer.from(line, 'utf-8');
	if (bytes.length <= 75) return line;
	const parts: string[] = [];
	let start = 0;
	while (start < bytes.length) {
		// The first line takes 75 octets, every continuation 74 plus its space.
		let end = Math.min(bytes.length, start + (start === 0 ? 75 : 74));
		while (end < bytes.length && (bytes[end] & 0xc0) === 0x80) end--;
		parts.push(bytes.subarray(start, end).toString('utf-8'));
		start = end;
	}
	return parts.join('\r\n ');
}

/** "DevFest.cz 2026" → "devfest-cz-2026", for the UID. */
const slug = (text: string): string =>
	text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');

export const GET: APIRoute = () => {
	const lines = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		`PRODID:-//${config.organizer.name}//${EVENT.name}//EN`,
		'CALSCALE:GREGORIAN',
		'METHOD:PUBLISH',
		'BEGIN:VEVENT',
		`UID:${slug(EVENT.name)}@${new URL(config.site.url).hostname}`,
		`DTSTAMP:${toCalendarStamp(new Date().toISOString())}`,
		'SEQUENCE:1',
		`DTSTART:${toCalendarStamp(EVENT.doors)}`,
		`DTEND:${toCalendarStamp(EVENT.end)}`,
		`SUMMARY:${escapeText(EVENT.name)}`,
		`DESCRIPTION:${escapeText(calendarDescription())}`,
		`LOCATION:${escapeText(calendarLocation())}`,
		`URL:${EVENT.url}`,
		'END:VEVENT',
		'END:VCALENDAR',
	];
	return new Response(`${lines.map(fold).join('\r\n')}\r\n`, {
		headers: { 'Content-Type': 'text/calendar; charset=utf-8' },
	});
};
