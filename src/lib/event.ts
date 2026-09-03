/**
 * The handful of event facts the post-purchase page has to state exactly:
 * when it starts, when it ends, and where. They also appear in the Event
 * JSON-LD in `BaseLayout.astro` — keep the two in step (the schema block is
 * the one Google reads, this one is what a visitor puts in their calendar).
 *
 * Times are Prague local with an explicit offset. October 30 is after the DST
 * switch, so CET (+01:00) is correct — do not "fix" it to +02:00.
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
		details: `Prague's developer conference & festival — Web, Mobile, Cybersecurity, AI/ML.\n${EVENT.url}`,
		location: `${EVENT.venue}, ${EVENT.address}`,
	});
	return `https://calendar.google.com/calendar/render?${params.toString()}`;
};
