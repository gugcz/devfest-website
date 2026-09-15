/**
 * Event facts for the calendar links. Keep in step with the Event JSON-LD in
 * `BaseLayout.astro`. October 30 is after the DST switch: CET (+01:00) is
 * correct — do not "fix" it to +02:00.
 */
export const EVENT = {
	name: 'DevFest.cz 2026',
	start: '2026-10-30T09:00:00+01:00',
	end: '2026-10-30T20:00:00+01:00',
	/** Human date + time, as written everywhere else on the site. */
	dateLabel: '30 October 2026',
	timeLabel: '09:00 — 20:00 CET',
	venue: 'Uhelný Mlýn',
	address: 'Libčice nad Vltavou, Czech Republic',
	mapUrl: 'https://maps.app.goo.gl/W5bcH4BgFQ1B8QAm8',
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
		dates: `${toCalendarStamp(EVENT.start)}/${toCalendarStamp(EVENT.end)}`,
		details: `Prague's developer conference & festival — AI agents, generative UI, cloud & backends, mobile & web accessibility, and the humans behind it. Registration from 08:00.\n${EVENT.url}`,
		location: `${EVENT.venue}, ${EVENT.address}`,
	});
	return `https://calendar.google.com/calendar/render?${params.toString()}`;
};
