/**
 * Routes behind a feature flag. Astro builds every file under `src/pages/`,
 * so a page a flag can remove lives under `src/routes/` (same nesting, so its
 * relative imports are unchanged) and is injected here only when its flag is
 * on (`injectRoute`, Astro integrations reference). Off means off: no HTML,
 * no sitemap entry. `/calendar.ics` exists only while the edition has a day
 * (`DATED_ROUTES`).
 */
import type { AstroIntegration } from 'astro';
import type { FeatureFlag, Features } from '../lib/features';

interface Route {
	/** The URL pattern, Astro's file-path syntax (`/foo/[bar]`). */
	pattern: string;
	/** The file under `src/routes/`. */
	entrypoint: string;
}

const ROUTES: Record<FeatureFlag, readonly Route[]> = {
	lineup: [
		{ pattern: '/agenda', entrypoint: 'agenda.astro' },
		{ pattern: '/speakers', entrypoint: 'speakers.astro' },
		{ pattern: '/speakers/[id]', entrypoint: 'speakers/[id].astro' },
		{ pattern: '/talks/[id]', entrypoint: 'talks/[id].astro' },
		{ pattern: '/sessions', entrypoint: 'sessions.astro' },
		{ pattern: '/tv', entrypoint: 'tv.astro' },
	],
	venue: [{ pattern: '/venue', entrypoint: 'venue.astro' }],
	tickets: [{ pattern: '/thank-you', entrypoint: 'thank-you.astro' }],
	invoice: [{ pattern: '/invoice', entrypoint: 'invoice.astro' }],
	workshops: [{ pattern: '/workshops', entrypoint: 'workshops.astro' }],
	app: [
		{ pattern: '/app', entrypoint: 'app.astro' },
		{ pattern: '/login', entrypoint: 'login/index.astro' },
		{ pattern: '/delete-account', entrypoint: 'delete-account.astro' },
	],
	invite: [
		{ pattern: '/invite/[member]', entrypoint: 'invite/[member].astro' },
		{ pattern: '/og/invite/[member].jpg', entrypoint: 'og/invite/[member].jpg.ts' },
	],
	partners: [{ pattern: '/partners', entrypoint: 'partners.astro' }],
	newsletter: [
		{ pattern: '/newsletter-subscription-thank-you', entrypoint: 'newsletter-subscription-thank-you.astro' },
	],
	attending: [
		{ pattern: '/attending', entrypoint: 'attending.astro' },
		{ pattern: '/speaker-card', entrypoint: 'speaker-card.astro' },
	],
};

/** Routes that state the day: built only while `event.date` is set. */
const DATED_ROUTES: readonly Route[] = [{ pattern: '/calendar.ics', entrypoint: 'calendar.ics.ts' }];

export default function featureRoutes(features: Features, dated: boolean): AstroIntegration {
	return {
		name: 'devfest:feature-routes',
		hooks: {
			'astro:config:setup': ({ injectRoute, logger }) => {
				const inject = ({ pattern, entrypoint }: Route) =>
					injectRoute({ pattern, entrypoint: new URL(`../routes/${entrypoint}`, import.meta.url) });
				for (const [flag, routes] of Object.entries(ROUTES) as [FeatureFlag, readonly Route[]][]) {
					if (features[flag]) {
						routes.forEach(inject);
						continue;
					}
					logger.info(`${flag} off: ${routes.map((r) => r.pattern).join(', ')} not built`);
				}
				if (dated) DATED_ROUTES.forEach(inject);
				else logger.info(`no event.date: ${DATED_ROUTES.map((r) => r.pattern).join(', ')} not built`);
			},
		},
	};
}
