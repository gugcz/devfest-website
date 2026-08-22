// @ts-check
import { fileURLToPath } from 'node:url';
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import react from '@astrojs/react';

const BUILD_DATE = new Date().toISOString();

// The only pages whose bytes change between two builds of the same commit: the
// lineup is read at build time (src/lib/lineup-build.ts) and the hosting
// workflow redeploys daily. Everything else is static, so stamping it with the
// build instant would have every URL claim it changed today, every day —
// Google's stated position is that it discounts `lastmod` when a site's dates
// are not trustworthy, which spends the signal on the pages that do change.
const LINEUP_PAGES = new Set([
    'https://devfest.cz/speakers',
    'https://devfest.cz/sessions',
    'https://devfest.cz/agenda',
]);

// Per-URL sitemap priority; anything unlisted falls back to 0.6.
const PRIORITY = {
    'https://devfest.cz': 1.0,
    'https://devfest.cz/speakers': 0.9,
    'https://devfest.cz/sessions': 0.9,
    'https://devfest.cz/agenda': 0.9,
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
    // `apply: 'serve'` excludes the whole plugin from a build, which is what
    // makes the flag below trustworthy.
    apply: 'serve',
    // The build-time lineup read (src/lib/lineup-build.ts) has to make the SAME
    // fixtures-or-live decision this plugin makes, or a page pre-renders one
    // thing while its island fetches another. It cannot infer that on its own:
    // `import.meta.env.DEV` is derived from `process.env.NODE_ENV`, so a shell
    // exporting NODE_ENV=development makes a production `astro build` look like
    // a dev server and publish these fixtures as the real lineup. Handing the
    // decision down as a define means the dev server is the only thing that can
    // turn it on.
    //
    // The same hook wires up DEVFEST_LIVE_API=1. With the fixtures stepped
    // aside a dev server still has no Hosting rewrite table, so `/api/*` would
    // simply 404 and the islands would silently keep whatever the build-time
    // read left them — the flag would look like it worked while the browser
    // never reached a function. Proxy the routes to the deployed site so the
    // flag means what it says.
    config() {
        const live = process.env.DEVFEST_LIVE_API === '1';
        return {
            define: { __DEVFEST_API_FIXTURES__: JSON.stringify(!live) },
            ...(live && {
                server: {
                    proxy: {
                        '/api': { target: 'https://devfest.cz', changeOrigin: true, secure: true },
                    },
                },
            }),
        };
    },
    async configureServer(server) {
        if (process.env.DEVFEST_LIVE_API === '1') return;
        const { apiFixtureMiddleware } = await import('./scripts/a11y-mocks/api.mjs');
        // Ahead of Astro's own middleware, which would answer /api/* with a 404
        // page before we ever see the request.
        server.middlewares.use(apiFixtureMiddleware);
        server.config.logger.info('  \x1b[2m/api/* served from fixtures (DEVFEST_LIVE_API=1 to proxy the deployed functions)\x1b[0m');
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
                !page.includes('/thank-you'),
            serialize(item) {
                const url = item.url.replace(/\/$/, '');
                if (LINEUP_PAGES.has(url)) {
                    item.lastmod = BUILD_DATE;
                    item.changefreq = 'daily';
                } else {
                    // No `lastmod` at all rather than a date we'd be inventing —
                    // omitting it is honest and costs nothing.
                    item.changefreq = 'monthly';
                }
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