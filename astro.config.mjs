// @ts-check
import { fileURLToPath } from 'node:url';
import { defineConfig, fontProviders } from 'astro/config';
import firebaseHeaders from './scripts/firebase-headers.mjs';
import sitemap, { ChangeFreqEnum } from '@astrojs/sitemap';

import react from '@astrojs/react';

const BUILD_DATE = new Date().toISOString();

// Per-URL sitemap priority; anything unlisted falls back to 0.6.
/** @type {Record<string, number>} */
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

// Content-Security-Policy. Astro adds a hash for every inline script and style
// it renders; scripts/firebase-headers.mjs unions the per-page result into one
// header in firebase.json (a static build cannot send headers on its own).
// Adding a third-party script or endpoint host → add it here, with who needs it.
/** @type {import('astro').AstroUserConfig['security']} */
const security = {
    csp: {
        directives: [
            "default-src 'self'",
            "base-uri 'self'",
            "object-src 'none'",
            "frame-ancestors 'none'", // + X-Frame-Options: DENY in firebase.json for old browsers
            // NewsletterForm posts to SmartEmailing, which 302s back to devfest.cz;
            // Chrome checks every hop, and on a PR preview 'self' is the preview host.
            "form-action 'self' https://app.smartemailing.cz https://devfest.cz",
            // data: = film-grain SVG noise in the CSS; blob: = AttendingCard previews;
            // https: = /press hotlinks partner thumbnails.
            "img-src 'self' data: blob: https:",
            "worker-src 'self' blob:", // heic-to/csp spawns a blob Worker on /attending
            /** @type {`connect-src${string}`} */ ([
                "connect-src 'self'",
                // Exact hosts: *.googleapis.com / *.cloudfunctions.net are multi-tenant.
                'https://content-firebaseappcheck.googleapis.com', // App Check token exchange (invoice submit)
                'https://firebase.googleapis.com', // Analytics dynamic config
                'https://firebaseinstallations.googleapis.com', // Firebase Installations (Analytics)
                'https://europe-west1-devfest-cz-app.cloudfunctions.net', // submitInvoiceCallable
                'https://*.google-analytics.com', // GA4 beacons; EEA traffic routes to region1.google-analytics.com
                'https://*.analytics.google.com', // GA4 beacons
                'https://www.google.com/g/collect', // GA4 beacons outside the EEA (caught by the CI audit on a US runner)
                'https://www.googletagmanager.com/td', // gtag.js tag-diagnostics beacon (Safari sends it as fetch)
                'https://www.google.com/recaptcha/', // reCAPTCHA Enterprise client log
            ].join(' ')),
            // Path-scoped: the bare Google hosts also serve JSONP endpoints that
            // would let injected markup bypass the hash policy.
            // reCAPTCHA Enterprise anchor/bframe — both hosts from Google's CSP guidance.
            'frame-src https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/',
        ],
        scriptDirective: {
            resources: [
                "'self'",
                "'report-sample'", // violation events carry the first 40 chars of a blocked inline
                'https://www.google.com/recaptcha/', // reCAPTCHA enterprise.js
                'https://www.gstatic.com/recaptcha/', // reCAPTCHA recaptcha__en.js
                'https://www.googletagmanager.com/gtag/', // gtag.js (GA4)
            ],
        },
        styleDirective: {
            resources: [
                // Hashed <style> elements; 'unsafe-inline' only for style=""
                // attributes (SSR'd custom properties — hero photo vars, team
                // --i, partner --logo-w — and React style={{}}; an attribute
                // cannot run script). Engines without -elem/-attr (Safari < 15.4,
                // Firefox < 108) fall back to a bare `style-src 'self'` and lose
                // the inline fonts and vars — accepted: a `style-src` fallback
                // makes Astro warn on every build.
                { resource: "'self'", kind: 'element' },
                { resource: "'unsafe-inline'", kind: 'attribute' },
            ],
        },
    },
};

// https://astro.build/config
export default defineConfig({
    site: 'https://devfest.cz',
    trailingSlash: 'never',
    security,
    // No Markdown pages; silences Astro's "Shiki inline styles vs CSP" warning.
    markdown: { syntaxHighlight: false },
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
    build: {
        // Every inline <style> costs a hash in the site-wide CSP header
        // (scripts/firebase-headers.mjs) that churns on any CSS edit; external
        // stylesheets are covered by style-src 'self'.
        inlineStylesheets: 'never',
    },
    integrations: [
        firebaseHeaders(),
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
        build: {
            // Never inline hoisted page <script>s (Astro does under 4 kB via
            // this limit): each would need its own CSP hash, and ClientRouter
            // answers an inline module with a `data:` sentinel script that
            // script-src blocks. `undefined` keeps the default for other assets.
            assetsInlineLimit: (file) => (file.endsWith('.js') ? false : undefined),
        },
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