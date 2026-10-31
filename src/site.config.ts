/**
 * Every fact about this edition that the site states more than once. Code
 * reads from here (`src/lib/event.ts` derives `EVENT` from it); copy never
 * repeats a value this file holds. The shape and what changes per edition
 * versus per chapter: `src/lib/site-config.ts`. The Cloud Functions cannot
 * import this file and keep their own copy of what they need (today
 * `INVOICES_CLOSE` in `functions/src/invoice/submit.ts`; one mirror module
 * is planned, ADR 0010); change both.
 *
 * The event is after the autumn DST switch, so `+01:00` is right; do not
 * "fix" it to `+02:00`.
 */
import type { SiteConfig } from './lib/site-config';

const config: SiteConfig = {
	event: {
		name: 'DevFest.cz',
		edition: 2026,
		hashtag: '#DevFestCZ',
		timeZone: 'Europe/Prague',
		timeZoneLabel: 'CET',
		doors: '2026-10-30T08:00:00+01:00',
		start: '2026-10-30T09:00:00+01:00',
		end: '2026-10-30T19:00:00+01:00',
		afterpartyEnd: '2026-10-30T23:00:00+01:00',
		invoicesClose: '2026-10-30T07:00:00+01:00',
		tagline: "Prague's developer conference & festival",
		pitch:
			'AI agents, generative UI, cloud & backends, mobile & web accessibility, and the humans behind it.',
		previousEditionUrl: 'https://2025.devfest.cz',
		venue: {
			name: 'Uhelný Mlýn',
			street: 'Areál Šroubáren 860',
			postalCode: '252 66',
			city: 'Libčice nad Vltavou',
			region: 'Central Bohemia',
			country: 'CZ',
			countryName: 'Czech Republic',
			mapUrl: 'https://maps.app.goo.gl/W5bcH4BgFQ1B8QAm8',
			stationWalkUrl: 'https://maps.app.goo.gl/95BeQWKRnyoXTXMF9',
		},
	},
	organizer: {
		name: 'GUG.cz',
		legalName: 'GUG.cz, z.s.',
		url: 'https://gug.cz',
		email: 'devfest@gug.cz',
		repoUrl: 'https://github.com/gugcz/devfest-website',
	},
	site: {
		url: 'https://devfest.cz',
		firebase: {
			apiKey: 'AIzaSyB7lXxnVicSWTtUe9CbVUarm2MwFVRMucU',
			authDomain: 'devfest-cz-app.firebaseapp.com',
			databaseURL: 'https://devfest-cz-app-default-rtdb.europe-west1.firebasedatabase.app',
			projectId: 'devfest-cz-app',
			storageBucket: 'devfest-cz-app.firebasestorage.app',
			messagingSenderId: '544417536046',
			appId: '1:544417536046:web:a238af229f95f75c2aa7bf',
			measurementId: 'G-L5NK2S2EZ0',
		},
		functionsRegion: 'europe-west1',
		hostingSite: 'devfest-public',
		analyticsHosts: ['devfest.cz', 'devfest-public.web.app', 'devfest-public.firebaseapp.com'],
		appCheckSiteKey: '6LdOhSYtAAAAALPcqSZIJoT7i7c6B5SOiByWChra',
	},
	apps: {
		android: 'cz.devfest.app',
		iosId: '6818298786',
		pwaUrl: 'https://app.devfest.cz',
	},
};

export default config;
