/**
 * The shape of `src/site.config.ts`: every fact about the edition, the
 * organizer and the deployment that more than one place reads. A fact used
 * once stays where it is used.
 *
 * Which fields change when: a **new edition** edits `event` (name stays) and
 * nothing else; a **new chapter** edits every block, plus the Firebase
 * project in `.firebaserc` / `firebase.json` and the functions' own copy of
 * these facts (ADR 0010).
 */
import type { Features } from './features';

export interface Venue {
	name: string;
	street: string;
	postalCode: string;
	city: string;
	/** schema.org `addressRegion`. */
	region: string;
	/** ISO 3166-1 alpha-2, for schema.org `addressCountry`. */
	country: string;
	/** The country as copy writes it ("Czech Republic"). */
	countryName: string;
	mapUrl: string;
	/** Walking route from the nearest station to the venue. */
	stationWalkUrl: string;
}

/** The day, once it is announced. ISO 8601 with the local offset. */
export interface EventDate {
	/** Registration and breakfast open. */
	doors: string;
	/** The opening keynote: the schema.org `startDate`. */
	start: string;
	/** Closing remarks end. */
	end: string;
	afterpartyEnd: string;
	/** Company invoices stop being taken. `INVOICES_CLOSE` in
	 * `functions/src/invoice/submit.ts` repeats it; keep in step. */
	invoicesClose: string;
}

export interface EventConfig {
	/** The brand, without the year: "DevFest.cz". */
	name: string;
	/** The year; `EVENT.name` appends it to `name`. */
	edition: number;
	hashtag: string;
	/** When, as announced before there is a day: "Fall 2027". */
	season: string;
	/** Where, as announced before there is a venue: "Prague". */
	city: string;
	/** IANA zone every time is in; dates are formatted in it. */
	timeZone: string;
	/** What copy writes after a time ("CET"). One edition, one label. */
	timeZoneLabel: string;
	/** The day. Unset until announced: nothing that needs a day renders, and
	 * the flags that need one (`src/lib/features.ts`) cannot be on. */
	date?: EventDate;
	/** One line under the name, sentence case: "Developer conference & festival". */
	tagline: string;
	/** How many developers the day is for (the venue's audience). Unset until
	 * the venue is known. */
	audience?: number;
	/** What the edition is, one sentence in lower case after the tagline
	 * ("Developer conference & festival: <pitch>"), used in meta, the footer
	 * and calendar text. */
	pitch: string;
	/** The venue. Unset until announced; `venue` (the flag) needs it. */
	venue?: Venue;
}

export interface OrganizerConfig {
	/** Short form for copy: "GUG.cz". */
	name: string;
	/** Legal form for JSON-LD, invoices and the footer: "GUG.cz, z.s.". */
	legalName: string;
	url: string;
	email: string;
	repoUrl: string;
}

/** The Firebase web app config, as the console prints it. Public by design. */
export interface FirebaseWebConfig {
	apiKey: string;
	authDomain: string;
	databaseURL: string;
	projectId: string;
	storageBucket: string;
	messagingSenderId: string;
	appId: string;
	measurementId: string;
}

export interface SiteDeployConfig {
	/** Canonical origin, no trailing slash. Also Astro's `site`. */
	url: string;
	firebase: FirebaseWebConfig;
	/** Region every Cloud Function deploys to. */
	functionsRegion: string;
	/** Hosting site id; also the preview-channel host prefix. */
	hostingSite: string;
	/** Hosts (and their subdomains) that report into production analytics. */
	analyticsHosts: readonly string[];
	/** reCAPTCHA Enterprise key id for App Check. Public like `apiKey`. */
	appCheckSiteKey: string;
}

export interface AppsConfig {
	/** Android application id. */
	android: string;
	/** Numeric App Store id. */
	iosId: string;
	/** The app's PWA origin, allowed to read `/api/lineup` cross-origin. */
	pwaUrl: string;
}

export interface SiteConfig {
	event: EventConfig;
	organizer: OrganizerConfig;
	site: SiteDeployConfig;
	apps: AppsConfig;
	/** The sections this build has; a flag off removes routes, links and
	 * sections (`src/lib/features.ts` lists the flags and what needs what). */
	features: Features;
}
