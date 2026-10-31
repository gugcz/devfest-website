import { fileURLToPath } from 'node:url';
import { defineConfig, fontProviders } from 'astro/config';
import sitemap, { ChangeFreqEnum } from '@astrojs/sitemap';

import react from '@astrojs/react';
import type { Plugin } from 'vite';
import config from './src/site.config';

const BUILD_DATE = new Date().toISOString();

// Per-path sitemap priority; anything unlisted falls back to 0.6.
const PRIORITY: Record<string, number> = {
    '': 1.0,
    '/speakers': 0.9,
    '/agenda': 0.9,
    '/partners': 0.8,
    '/faq': 0.7,
    '/venue': 0.7,
    '/team': 0.7,
    '/contact': 0.6,
    '/attending': 0.6,
    '/invoice': 0.5,
    '/press/downloads': 0.5,
    '/code-of-conduct': 0.4,
    '/privacy-policy': 0.3,
    '/delete-account': 0.2,
};

// Accessibility-audit mock mode. Page data comes from `/api/*`, served from
// fixtures by scripts/a11y.mjs. The one Firebase module still on the path is
// App Check (inits on every load); under A11Y_MOCK=1 `firebase/app-check` is
// aliased to a no-op so headless CI doesn't load reCAPTCHA.
const a11yMock = process.env.A11Y_MOCK === '1';
const mock = (rel: string): string => fileURLToPath(new URL(rel, import.meta.url));
const a11yMockAlias: Record<string, string> = a11yMock
    ? {
          'firebase/app-check': mock('./scripts/a11y-mocks/app-check.mjs'),
      }
    : {};

// The venue TVs (`/tv`) run Chromium years old. Astro builds for `esnext`,
// which ships `?.` and `??` as written and lets the CSS minifier fold
// longhands into `inset`. Chrome 63 is the floor Astro's islands need anyway
// (module scripts and dynamic `import()`). CSS is emitted by the server
// builds too, so every environment gets the CSS target; only the browser
// bundle gets the JS one (the server keeps its top-level `await`).
const legacyBrowserTarget = (): Plugin => ({
    name: 'devfest:legacy-browser-target',
    configEnvironment(name) {
        return { build: { cssTarget: 'chrome63', ...(name === 'client' && { target: 'chrome63' }) } };
    },
});

// `/api/lineup` and `/api/tickets` are Hosting rewrites in production (see
// CLAUDE.md "Browser data access"). A dev server has no rewrite table, so
// every data-backed island would render "unavailable". Serve the audit's
// fixtures from the same routes — one module, so local and CI agree.
//
// `DEVFEST_LIVE_API=1 npm run dev` hits the deployed functions instead —
// needed when changing the functions themselves.
const devApiMocks = (): Plugin => ({
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
    site: config.site.url,
    trailingSlash: 'never',
    // Self-hosted, build-time-optimised replacements for the three brand faces
    // that used to come from the fonts.googleapis.com <link> in BaseLayout.astro.
    // Weights/styles mirror exactly what that css2 URL requested. Only the three
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
            // Google ships Special Elite in Latin only, so every č ř š ž ě ů
            // fell through to the generated metric fallback — Arial at 117% —
            // and "Libčice" printed as "LibČice". JetBrains Mono (latin-ext
            // loaded above) takes those letters instead: a brand face, and a
            // monospace whose 0.6em advance sits close to Special Elite's, so
            // it also stands in without a reflow while the typewriter loads.
            // Unquoted on purpose: Astro quotes only values with spaces, so
            // the var() lands in `--font-special-elite` as a live reference.
            fallbacks: ['var(--font-jetbrains-mono)', 'monospace'],
            optimizedFallbacks: false,
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
                !page.includes('/invite/') &&
                // Same three-part secrecy for the speakers' share-card tool
                // (src/pages/speaker-card.astro).
                !page.includes('/speaker-card') &&
                // And for the venue TV screens (src/pages/tv.astro).
                !/\/tv\/?$/.test(page) &&
                // And for the page that catches the app's sign-in links
                // (src/pages/login/).
                !/\/login\/?$/.test(page) &&
                // Their OG cards are a generated asset, not a page — never a
                // sitemap entry regardless of `/invite/`'s own secrecy.
                !page.includes('/og/invite/') &&
                // Retired URLs that only redirect (Sessions → /agenda#talks,
                // Press → /contact#press). `/press/downloads` is a real page.
                !/\/(sessions|press)\/?$/.test(page),
            serialize(item) {
                item.lastmod = BUILD_DATE;
                item.changefreq = ChangeFreqEnum.WEEKLY;
                const path = item.url.replace(/\/$/, '').replace(config.site.url, '');
                item.priority = PRIORITY[path] ?? 0.6;
                return item;
            },
        }),
        react(),
    ],
    vite: {
        plugins: [devApiMocks(), legacyBrowserTarget()],
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