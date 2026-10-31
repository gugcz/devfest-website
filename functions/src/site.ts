/**
 * The functions' copy of the site's public facts. Mirrors `src/site.config.ts`
 * (ADR 0010, docs/adr/0010-site-config-and-feature-flags.md): same shape,
 * same key names, the subset the functions need. The functions build is its
 * own tsconfig with `rootDir: src`, so it cannot import that file; the two
 * are kept in step by hand. Every event, organizer, origin or date the
 * functions need is read from here, never written as a literal in code.
 */

import type { AllowedOrigin } from './lib/cors.js';

export const SITE = {
	event: {
		/** Brand without the year; `eventName()` adds the edition. */
		name: 'DevFest.cz',
		edition: 2026,
		tagline: "Prague's developer conference & festival",
		/** Schedules are authored in the event's local time. */
		timeZone: 'Europe/Prague',
		/** No invoice requests from the event morning on; the site hides the form at the same moment. */
		invoicesClose: '2026-10-30T07:00:00+01:00',
	},
	organizer: {
		legalName: 'GUG.cz, z.s.',
		email: 'devfest@gug.cz',
	},
	site: {
		/** Must be the bare https apex: no port, no `www.`, no trailing slash. */
		url: 'https://devfest.cz',
		/** Firebase Hosting site; its PR previews are `<hostingSite>--pr-<n>-<hash>.web.app`. */
		hostingSite: 'devfest-public',
		/** Closest region to the event; every function deploys here. */
		functionsRegion: 'europe-west1',
	},
	apps: {
		/** The mobile app's PWA. */
		pwaUrl: 'https://app.devfest.cz',
	},
} as const;

/** Facts only the functions need; no key on the site side. */
export const FUNCTIONS_ONLY = {
	/** The event date as the e-mails print it. */
	dateLine: 'Friday, 30 October 2026',
	/** The venue line as the e-mails print it. */
	venue: 'Uhelný Mlýn, Libčice nad Vltavou',
	/** Transactional sender; the domain must be verified in Resend. */
	fromEmail: 'noreply@devfest.cz',
	fromName: 'DevFest.cz',
	/** The PWA's second Hosting origin (one Hosting site under two domains). */
	appHostingOrigin: 'https://devfest-cz-app.web.app',
} as const;

/** Brand with the year, as it appears in e-mails and invoice lines. */
export function eventName(): string {
	return `${SITE.event.name} ${SITE.event.edition}`;
}

/** The site's hostname without scheme (`devfest.cz`). */
export const SITE_HOST = new URL(SITE.site.url).hostname;

const LOCALHOST = /^http:\/\/localhost(:\d+)?$/;

function escapeRegExp(s: string): string {
	return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Origins allowed to call the browser-facing callables: the site (with and
 * without `www.`), its Hosting PR previews, and a dev server. Mutable only
 * because `onCall`'s `cors` option refuses a `readonly` array; never push to it.
 */
export const SITE_ORIGINS: AllowedOrigin[] = [
	new RegExp(`^https://(www\\.)?${escapeRegExp(SITE_HOST)}$`),
	new RegExp(`^https://${escapeRegExp(SITE.site.hostingSite)}--pr-\\d+-[a-z0-9]+\\.web\\.app$`),
	LOCALHOST,
];

/** Origins allowed to read the lineup cross-origin: the app and its dev server. */
export const APP_ORIGINS: readonly AllowedOrigin[] = [
	SITE.apps.pwaUrl,
	FUNCTIONS_ONLY.appHostingOrigin,
	LOCALHOST,
];
