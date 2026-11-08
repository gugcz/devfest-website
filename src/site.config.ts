/**
 * Every fact about this edition that the site states more than once. Code
 * reads from here (`src/lib/event.ts` derives `EVENT` from it); copy never
 * repeats a value this file holds. The shape and what changes per edition
 * versus per chapter: `src/lib/site-config.ts`. The Cloud Functions cannot
 * import this file and keep their own copy of what they need (today
 * `INVOICES_CLOSE` in `functions/src/invoice/submit.ts`; one mirror module
 * is planned, ADR 0010); change both.
 *
 * Times carry the local offset: `+01:00` after the autumn DST switch,
 * `+02:00` before it.
 */
import type { SiteConfig } from './lib/site-config';
import { checkFeatureDependencies, resolveFeatures } from './lib/features';

/**
 * `PUBLIC_FEATURES_OFF=workshops,invoice` turns flags off for one build (the
 * flags-off check, `scripts/flags-off-build.mjs`); `PUBLIC_FEATURES_ON` turns
 * them on (an archive build, `scripts/archive.mjs`). Read through
 * `import.meta.env` so the client bundle sees the same answer as the build;
 * plain Node (the Astro config loader, tests) has no `import.meta.env`.
 */
const buildVariable = (name: 'PUBLIC_FEATURES_OFF' | 'PUBLIC_FEATURES_ON'): string =>
	import.meta.env?.[name] ?? (typeof process === 'undefined' ? '' : (process.env[name] ?? ''));

const config: SiteConfig = {
	event: {
		name: 'DevFest.cz',
		edition: 2027,
		hashtag: '#DevFestCZ',
		// Announced: the season and the city. The day, the venue and its
		// audience follow once they are; until then the sections that need
		// them stay off (`features` below).
		season: 'Fall 2027',
		city: 'Prague',
		timeZone: 'Europe/Prague',
		timeZoneLabel: 'CET',
		tagline: "Prague's developer conference & festival",
		pitch:
			'AI agents, generative UI, cloud & backends, mobile & web accessibility, and the humans behind it.',
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
	features: resolveFeatures(
		{
			// 2027 is announced for the fall in Prague; no day, venue or lineup
			// yet. The 2026 edition is archived at /2026 (ADR 0011). A flag
			// turns on once its section is ready, and its redirect in
			// firebase.json goes in the same change. The app is not promoted
			// until it carries the 2027 edition.
			lineup: false,
			venue: false,
			tickets: false,
			invoice: false,
			workshops: false,
			app: false,
			invite: false,
			partners: false,
			newsletter: true,
			attending: false,
		},
		buildVariable('PUBLIC_FEATURES_OFF'),
		buildVariable('PUBLIC_FEATURES_ON'),
	),
};

checkFeatureDependencies(config.features, config.event);

export default config;
