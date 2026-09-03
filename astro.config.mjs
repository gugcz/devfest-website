// @ts-check
import { fileURLToPath } from 'node:url';
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import react from '@astrojs/react';

const BUILD_DATE = new Date().toISOString();

// Per-URL sitemap priority; anything unlisted falls back to 0.6.
const PRIORITY = {
    'https://devfest.cz': 1.0,
    'https://devfest.cz/speakers': 0.9,
    'https://devfest.cz/sessions': 0.9,
    'https://devfest.cz/partners': 0.8,
    'https://devfest.cz/faq': 0.7,
    'https://devfest.cz/team': 0.7,
    'https://devfest.cz/press': 0.6,
    'https://devfest.cz/contact': 0.6,
    'https://devfest.cz/invoice': 0.5,
    'https://devfest.cz/press/downloads': 0.5,
    'https://devfest.cz/privacy-policy': 0.3,
};

// Accessibility-audit mock mode. All page data (speakers, sessions, tickets) is
// fetched from cached `/api/*` endpoints, which scripts/a11y.mjs serves from
// fixtures — no Firebase SDK on the content path. The one Firebase module still
// pulled in is App Check (reCAPTCHA Enterprise), which `initAnalytics` triggers
// on every page load; under A11Y_MOCK=1 we alias `firebase/app-check` to a
// no-op so headless CI doesn't try to load reCAPTCHA. Off by default — a normal
// build never resolves this alias.
const a11yMock = process.env.A11Y_MOCK === '1';
const mock = (rel) => fileURLToPath(new URL(rel, import.meta.url));
const a11yMockAlias = a11yMock
    ? {
          'firebase/app-check': mock('./scripts/a11y-mocks/app-check.mjs'),
      }
    : {};

// `/api/lineup` and `/api/tickets` are Firebase Hosting rewrites in production
// (see CLAUDE.md "Browser data access"). A dev server has no rewrite table, so
// those fetches 404 and every data-backed island — the lineup, the agenda
// timetable, the ticket waves — renders its "unavailable" state instead of the
// UI you are working on. Serve the audit's fixtures from the same routes so
// `npm run dev` shows real content.
//
// Same payloads the axe sweep uses, from one module, so local and CI can't
// disagree about what the endpoints return.
//
// Opt out with `DEVFEST_LIVE_API=1 npm run dev` to hit the deployed functions
// instead — needed when you are changing the functions themselves.
const devApiMocks = () => ({
    name: 'devfest:dev-api-fixtures',
    apply: 'serve',
    async configureServer(server) {
        if (process.env.DEVFEST_LIVE_API === '1') return;
        const { apiFixtureMiddleware } = await import('./scripts/a11y-mocks/api.mjs');
        // Ahead of Astro's own middleware, which would answer /api/* with a 404
        // page before we ever see the request.
        server.middlewares.use(apiFixtureMiddleware);
        server.config.logger.info('  \x1b[2m/api/* served from fixtures (DEVFEST_LIVE_API=1 to use the deployed functions)\x1b[0m');
    },
});

// https://astro.build/config
export default defineConfig({
    site: 'https://devfest.cz',
    trailingSlash: 'never',
    // Self-hosted, build-time-optimised replacements for the three brand faces
    // that used to come from the fonts.googleapis.com <link> in BaseLayout.astro.
    // Weights/styles mirror exactly what that css2 URL requested. Only the four
    // brand fonts are allowed — never add a fourth family here.
    fonts: [
        {
            provider: fontProviders.google(),
            name: 'Bebas Neue',
            cssVariable: '--font-bebas-neue',
            weights: [400],
            styles: ['normal'],
            subsets: ['latin', 'latin-ext'],
        },
        {
            provider: fontProviders.google(),
            name: 'JetBrains Mono',
            cssVariable: '--font-jetbrains-mono',
            weights: [400, 500],
            styles: ['normal'],
            subsets: ['latin', 'latin-ext'],
        },
        {
            provider: fontProviders.google(),
            name: 'Special Elite',
            cssVariable: '--font-special-elite',
            weights: [400],
            styles: ['normal'],
        },
    ],
    image: {
        layout: 'constrained',
        // responsiveStyles defaults to false — without it the `layout` prop
        // emits srcset/sizes but no resize CSS, so images ignore the layout.
        responsiveStyles: true,
    },
    prefetch: {
        prefetchAll: true,
        defaultStrategy: 'hover',
    },
    integrations: [
        sitemap({
            filter: (page) =>
                !page.includes('/newsletter-subscription-thank-you') &&
                !page.includes('/thank-you') &&
                // The team's personal invitation pages are unlisted: `noindex`,
                // out of the sitemap, and linked from nowhere on the site. All
                // three together are what "secret" means here — see
                // src/pages/invite/[member].astro.
                !page.includes('/invite/'),
            serialize(item) {
                item.lastmod = BUILD_DATE;
                item.changefreq = 'weekly';
                const url = item.url.replace(/\/$/, '');
                item.priority = PRIORITY[url] ?? 0.6;
                return item;
            },
        }),
        react(),
    ],
    vite: {
        plugins: [devApiMocks()],
        resolve: {
            alias: a11yMockAlias,
        },
        server: {
            fs: {
                // Allow Vite dev to read from parent dirs (needed for git-worktree
                // setups where node_modules sits above the working tree).
                allow: ['..', '../..', '../../..'],
            },
        },
    },
});