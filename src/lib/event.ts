/**
 * Event facts as the pages read them, derived from `src/site.config.ts`:
 * the day's hours, the date as the site writes it, the venue and the
 * calendar links. Code that states an hour or the date reads it from here;
 * copy that repeats an hour (`src/content/faq.json`, the agenda and venue
 * notes, the countdown's screen-reader line) is kept in step by hand.
 *
 * The hours come from the published agenda (Sessionize): breakfast and
 * registration 08:00, kick-off 08:45, opening keynote 09:00, lightning talks
 * and closing remarks until 19:00, afterparty 19:00 to 23:00.
 */
import config from '../site.config';
import { formatDate, formatTime, type DateStyle } from './dates';

const { event, site } = config;
const { venue, timeZone } = event;

/** Whether `/invoice` still takes requests. */
export function invoicesOpen(now: number = Date.now()): boolean {
	return now < Date.parse(event.invoicesClose);
}

const clock = (iso: string): string => formatTime(iso, timeZone);

/** `<event name> — <section>`, the shape most page titles take. */
export const pageTitle = (section: string): string => `${event.name} ${event.edition} — ${section}`;

/** `iso` in one of the site's date spellings, in the event's time zone. */
export const eventDate = (style: DateStyle, iso: string = event.start): string =>
	formatDate(iso, style, timeZone);

export const EVENT = {
	/** "DevFest.cz 2026": the brand and the edition. */
	name: `${event.name} ${event.edition}`,
	/** Registration and breakfast. The calendar entry starts here. */
	doors: event.doors,
	/** The opening keynote: the schema.org `startDate`. */
	start: event.start,
	/** Closing remarks end; the calendar entry ends here. */
	end: event.end,
	afterpartyEnd: event.afterpartyEnd,
	doorsTime: clock(event.doors),
	startTime: clock(event.start),
	endTime: clock(event.end),
	afterpartyEndTime: clock(event.afterpartyEnd),
	/** The date in running copy. Day-month-year everywhere, never "October 30". */
	dateLabel: formatDate(event.start, 'label', timeZone),
	/** The date in mono stamps and meta lines (set uppercase by CSS). */
	dateShort: formatDate(event.start, 'short', timeZone),
	/** Doors to closing remarks, as the calendar entry spans it. */
	timeLabel: `${clock(event.doors)}–${clock(event.end)} ${event.timeZoneLabel}`,
	venue: venue.name,
	address: `${venue.city}, ${venue.countryName}`,
	/** The full postal address, for the venue page and the FAQ. */
	street: `${venue.street}, ${venue.postalCode} ${venue.city}`,
	mapUrl: venue.mapUrl,
	/** Walking route from the nearest station to the venue. */
	stationWalkUrl: venue.stationWalkUrl,
	/** The calendar file, built from this config (`src/pages/calendar.ics.ts`). */
	icsUrl: '/calendar.ics',
	url: site.url,
	/** Where a visitor writes when something fails. */
	contactEmail: config.organizer.email,
	/** The band on the share cards: `30 OCT 2026 · LIBČICE NAD VLTAVOU`. */
	cardStamp: `${formatDate(event.start, 'stamp', timeZone)} · ${venue.city.toUpperCase()}`,
} as const;

/** `20261030T080000Z` — the compact UTC form both ICS and Google Calendar want. */
export const toCalendarStamp = (iso: string): string =>
	new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

/** The calendar entry's description: the pitch, the day's hours, the site. */
export const calendarDescription = (): string =>
	`${event.tagline} — ${event.pitch} Registration from ${EVENT.doorsTime}, keynote at ${EVENT.startTime}, afterparty until ${EVENT.afterpartyEndTime}.\n${site.url}`;

/** `<venue>, <city>, <country>` as a calendar location. */
export const calendarLocation = (): string => `${venue.name}, ${venue.city}, ${venue.countryName}`;

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
		details: calendarDescription(),
		location: `${EVENT.venue}, ${EVENT.address}`,
	});
	return `https://calendar.google.com/calendar/render?${params.toString()}`;
};
