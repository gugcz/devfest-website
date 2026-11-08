/**
 * Event facts as the pages read them, derived from `src/site.config.ts`:
 * the day's hours, the date as the site writes it, the venue and the
 * calendar links. Code that states an hour or the date reads it from here;
 * copy that repeats an hour (`src/content/faq.json`, the agenda and venue
 * notes, the countdown's screen-reader line) is kept in step by hand.
 *
 * Before the day and the venue are announced, `event.date` and `event.venue`
 * are unset: the always-present facts fall back to the season and the city,
 * and the ones that need a day or a venue throw (ADR 0011).
 */
import config from '../site.config';
import type { EventDate, Venue } from './site-config';
import { formatDate, formatTime, type DateStyle } from './dates';

const { event, site } = config;
const { timeZone } = event;

/** Whether the edition's day is announced (`event.date`). */
export const hasDate = event.date !== undefined;
/** Whether the edition's venue is announced (`event.venue`). */
export const hasVenue = event.venue !== undefined;

/**
 * The day, for code that only runs while a flag that needs one is on
 * (`src/lib/features.ts` refuses the flag without it). Throws one sentence
 * when a page reaches for a day the config does not have yet.
 */
export function eventDay(): EventDate {
	if (!event.date) {
		throw new Error('This page states the day, but src/site.config.ts has no event.date yet: keep its section off until the day is announced.');
	}
	return event.date;
}

/** The venue, like `eventDay()`: only behind a flag that needs it. */
export function eventVenue(): Venue {
	if (!event.venue) {
		throw new Error('This page states the venue, but src/site.config.ts has no event.venue yet: keep its section off until the venue is announced.');
	}
	return event.venue;
}

/** Whether `/invoice` exists in this build and still takes requests. */
export function invoicesOpen(now: number = Date.now()): boolean {
	return config.features.invoice && event.date !== undefined && now < Date.parse(event.date.invoicesClose);
}

const clock = (iso: string): string => formatTime(iso, timeZone);

/** `<event name> — <section>`, the shape most page titles take. */
export const pageTitle = (section: string): string => `${event.name} ${event.edition} — ${section}`;

/** `iso` (by default the opening keynote) in one of the site's date spellings,
 * in the event's time zone. */
export const eventDate = (style: DateStyle, iso: string = eventDay().start): string =>
	formatDate(iso, style, timeZone);

/**
 * The edition's facts. The ones that always exist read what is announced
 * (the season and city before the day and venue are); the getters below them
 * need the day or the venue and throw without it, like `eventDay()`.
 */
export const EVENT = {
	/** "DevFest.cz 2027": the brand and the edition. */
	name: `${event.name} ${event.edition}`,
	/** The date in running copy ("30 October 2027", day-month-year, never
	 * "October 30"), or the announced season ("Fall 2027") before it. */
	dateLabel: event.date ? formatDate(event.date.start, 'label', timeZone) : event.season,
	/** The date in mono stamps and meta lines (set uppercase by CSS), or the season. */
	dateShort: event.date ? formatDate(event.date.start, 'short', timeZone) : event.season,
	/** The venue's name, or the announced city before it. */
	venue: event.venue?.name ?? event.city,
	/** The venue's town, or the announced city. */
	city: event.venue?.city ?? event.city,
	/** The calendar file, built from this config while there is a day (`src/routes/calendar.ics.ts`). */
	icsUrl: '/calendar.ics',
	url: site.url,
	/** Where a visitor writes when something fails. */
	contactEmail: config.organizer.email,
	/** Registration and breakfast. The calendar entry starts here. */
	get doors(): string {
		return eventDay().doors;
	},
	/** The opening keynote: the schema.org `startDate`. */
	get start(): string {
		return eventDay().start;
	},
	/** Closing remarks end; the calendar entry ends here. */
	get end(): string {
		return eventDay().end;
	},
	get afterpartyEnd(): string {
		return eventDay().afterpartyEnd;
	},
	get doorsTime(): string {
		return clock(eventDay().doors);
	},
	get startTime(): string {
		return clock(eventDay().start);
	},
	get endTime(): string {
		return clock(eventDay().end);
	},
	get afterpartyEndTime(): string {
		return clock(eventDay().afterpartyEnd);
	},
	/** Doors to closing remarks, as the calendar entry spans it. */
	get timeLabel(): string {
		return `${clock(eventDay().doors)}–${clock(eventDay().end)} ${event.timeZoneLabel}`;
	},
	/** The band on the share cards: `30 OCT 2026 · LIBČICE NAD VLTAVOU`. */
	get cardStamp(): string {
		return `${formatDate(eventDay().start, 'stamp', timeZone)} · ${eventVenue().city.toUpperCase()}`;
	},
	/** `<city>, <country>`. */
	get address(): string {
		const venue = eventVenue();
		return `${venue.city}, ${venue.countryName}`;
	},
	/** The full postal address, for the venue page and the FAQ. */
	get street(): string {
		const venue = eventVenue();
		return `${venue.street}, ${venue.postalCode} ${venue.city}`;
	},
	get mapUrl(): string {
		return eventVenue().mapUrl;
	},
	/** Walking route from the nearest station to the venue. */
	get stationWalkUrl(): string {
		return eventVenue().stationWalkUrl;
	},
};

/** `20261030T080000Z` — the compact UTC form both ICS and Google Calendar want. */
export const toCalendarStamp = (iso: string): string =>
	new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

/** The calendar entry's description: the pitch, the day's hours, the site. */
export const calendarDescription = (): string =>
	`${event.tagline} — ${event.pitch} Registration from ${EVENT.doorsTime}, keynote at ${EVENT.startTime}, afterparty until ${EVENT.afterpartyEndTime}.\n${site.url}`;

/** `<venue>, <city>, <country>` as a calendar location. */
export const calendarLocation = (): string => {
	const venue = eventVenue();
	return `${venue.name}, ${venue.city}, ${venue.countryName}`;
};

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
