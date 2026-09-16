// @ts-check
import { fileURLToPath } from 'node:url';
import { defineConfig, fontProviders } from 'astro/config';
import sitemap, { ChangeFreqEnum } from '@astrojs/sitemap';

import react from '@astrojs/react';
import { CSP_ALGORITHM, CSP_DIRECTIVES, CSP_SCRIPT_BASE, CSP_STYLE_BASE, CSP_STYLE_ATTR } from './scripts/csp.config.mjs';

const BUILD_DATE = new Date().toISOString();

// Per-URL sitemap priority; anything unlisted falls back to 0.6.
/** @type {Record<string, number>} */
const PRIORITY = {
    'https://devfest.cz': 1.0,
    'https://devfest.cz/speakers': 0.9,
    'https://devfest.cz/sessions': 0.9,
    'https://devfest.cz/partners': 0.8,
    'https://devfest.cz/faq': 0.7,
    'https://devfest.cz/team': 0.7,
    'https://devfest.cz/press': 0.6,
    'https://devfest.cz/contact': 0.6,
    'https://devfest.cz/attending': 0.6,
    'https://devfest.cz/invoice': 0.5,
    'https://devfest.cz/press/downloads': 0.5,
    'https://devfest.cz/privacy-policy': 0.3,
};

// Accessibility-audit mock mode. Page data comes from `/api/*`, served from
// fixtures by scripts/a11y.mjs. The one Firebase module still on the path is
// App Check (inits on every load); under A11Y_MOCK=1 `firebase/app-check` is
// aliased to a no-op so headless CI doesn't load reCAPTCHA.
const a11yMock = process.env.A11Y_MOCK === '1';
/** @param {string} rel */
const mock = (rel) => fileURLToPath(new URL(rel, import.meta.url));
/** @type {Record<string, string>} */
const a11yMockAlias = a11yMock
    ? {
          'firebase/app-check': mock('./scripts/a11y-mocks/app-check.mjs'),
      }
    : {};

// `/api/lineup` and `/api/tickets` are Hosting rewrites in production (see
// CLAUDE.md "Browser data access"). A dev server has no rewrite table, so
// every data-backed island would render "unavailable". Serve the audit's
// fixtures from the same routes — one module, so local and CI agree.
//
// `DEVFEST_LIVE_API=1 npm run dev` hits the deployed functions instead —
// needed when changing the functions themselves.
/** @returns {import('vite').Plugin} */
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

// CSP. Astro hashes every inline script/style per page and writes a per-page
// <meta> here (no adapter on a static build, so meta is the only destination
// it can target) — no 'unsafe-inline' scripts/style elements. A postbuild
// step (scripts/gen-csp-header.mjs) unions those per-page hashes into one
// site-wide `Content-Security-Policy` response header in firebase.json and
// strips this meta from the built HTML: a meta CSP is locked to the page
// that set it, so <ClientRouter/> soft navigation strands it on the first
// page visited and every later page's own hashes stop applying (DEVF-64).
// Hosts: google.com/gstatic.com = reCAPTCHA, googletagmanager/analytics = GA4,
// googleapis/cloudfunctions/firebasedatabase = Firebase, smartemailing = newsletter.
/** @type {Exclude<NonNullable<import('astro').AstroUserConfig['security']>['csp'], boolean | undefined>} */
const csp = {
    algorithm: CSP_ALGORITHM,
    directives: CSP_DIRECTIVES,
    scriptDirective: {
        resources: CSP_SCRIPT_BASE,
    },
    styleDirective: {
        // Elements hashed; style attributes (hero custom properties, the
        // reCAPTCHA Enterprise badge) stay allowed via style-src-attr.
        resources: [...CSP_STYLE_BASE, { resource: CSP_STYLE_ATTR, kind: 'attribute' }],
    },
};

// https://astro.build/config
export default defineConfig({
    site: 'https://devfest.cz',
    trailingSlash: 'never',
    security: { csp },
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
                !page.includes('/invite/') &&
                // Their OG cards are a generated asset, not a page — never a
                // sitemap entry regardless of `/invite/`'s own secrecy.
                !page.includes('/og/invite/'),
            serialize(item) {
                item.lastmod = BUILD_DATE;
                item.changefreq = ChangeFreqEnum.WEEKLY;
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