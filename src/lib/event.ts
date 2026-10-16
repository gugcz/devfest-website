/**
 * Event facts: the day's hours, the date as the site writes it, the venue and
 * the calendar links. Every page that states an hour or the date reads it
 * from here. Keep in step with the Event JSON-LD in `BaseLayout.astro` and
 * with `public/devfest-cz-2026.ics`.
 *
 * The hours come from the published agenda (Sessionize): breakfast and
 * registration 08:00, kick-off 08:45, opening keynote 09:00, lightning talks
 * and closing remarks until 19:00, afterparty 19:00 to 23:00.
 *
 * October 30 is after the DST switch: CET (+01:00) is correct — do not "fix"
 * it to +02:00.
 */
const DOORS = '2026-10-30T08:00:00+01:00';
const KEYNOTE = '2026-10-30T09:00:00+01:00';
const CLOSE = '2026-10-30T19:00:00+01:00';
const AFTERPARTY_END = '2026-10-30T23:00:00+01:00';

/** `HH:MM` read straight off an event-local ISO string (no time-zone math). */
const clock = (iso: string): string => iso.slice(11, 16);

export const EVENT = {
	name: 'DevFest.cz 2026',
	/** Registration and breakfast. The calendar entry starts here. */
	doors: DOORS,
	/** The opening keynote: the schema.org `startDate`. */
	start: KEYNOTE,
	/** Closing remarks end; the calendar entry ends here. */
	end: CLOSE,
	afterpartyEnd: AFTERPARTY_END,
	doorsTime: clock(DOORS),
	startTime: clock(KEYNOTE),
	endTime: clock(CLOSE),
	afterpartyEndTime: clock(AFTERPARTY_END),
	/** The date in running copy. Day-month-year everywhere, never "October 30". */
	dateLabel: '30 October 2026',
	/** The date in mono stamps and meta lines (set uppercase by CSS). */
	dateShort: '30 Oct 2026',
	/** Doors to closing remarks, as the calendar entry spans it. */
	timeLabel: `${clock(DOORS)}–${clock(CLOSE)} CET`,
	venue: 'Uhelný Mlýn',
	address: 'Libčice nad Vltavou, Czech Republic',
	/** The full postal address, for the venue page and the FAQ. */
	street: 'Areál Šroubáren 860, 252 66 Libčice nad Vltavou',
	mapUrl: 'https://maps.app.goo.gl/W5bcH4BgFQ1B8QAm8',
	/** Walking route from Libčice nad Vltavou station to the venue. */
	stationWalkUrl: 'https://maps.app.goo.gl/95BeQWKRnyoXTXMF9',
	/** The calendar file served from `public/`. */
	icsUrl: '/devfest-cz-2026.ics',
	url: 'https://devfest.cz',
} as const;

/** `20261030T080000Z` — the compact UTC form both ICS and Google Calendar want. */
const toCalendarStamp = (iso: string): string =>
	new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

/**
 * "Add to Google Calendar" template URL. The `.ics` download covers Apple
 * Calendar, Outlook and everything else; this one exists because the single
 * most common calendar in this audience opens a web app, not a file.
 */
export const googleCalendarUrl = (): string => {
	const params = new URLSearchParams({
		action: 'TEMPLATE',
		text: EVENT.name,
		dates: `${toCalendarStamp(EVENT.doors)}/${toCalendarStamp(EVENT.end)}`,
		details: `Prague's developer conference & festival — AI agents, generative UI, cloud & backends, mobile & web accessibility, and the humans behind it. Registration from ${EVENT.doorsTime}, keynote at ${EVENT.startTime}, afterparty until ${EVENT.afterpartyEndTime}.\n${EVENT.url}`,
		location: `${EVENT.venue}, ${EVENT.address}`,
	});
	return `https://calendar.google.com/calendar/render?${params.toString()}`;
};
