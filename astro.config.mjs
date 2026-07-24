// @ts-check
import { fileURLToPath } from 'node:url';
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import react from '@astrojs/react';
import node from '@astrojs/node';

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

// Accessibility-audit mock mode. The public lineup (Firestore speakers /
// sessions) and ticket cache (RTDB) are gated behind App Check + read rules
// that block CI, so the axe sweep would only ever see the "temporarily
// unavailable" error state. Under A11Y_MOCK=1 we swap the Firebase read modules
// for the fixture replayers in scripts/a11y-mocks/ so the built output serves
// deterministic content: `firebase-admin` backs the server-side speaker/session
// reads (the on-demand /speakers + /sessions handler and the build-time homepage
// teaser); `firebase/database` + `firebase/app-check` back the client Tickets
// island. scripts/a11y.mjs then runs that built SSR handler so the on-demand
// grids get audited. Off by default — a normal build never resolves these aliases.
const a11yMock = process.env.A11Y_MOCK === '1';
const mock = (rel) => fileURLToPath(new URL(rel, import.meta.url));
const a11yMockAlias = a11yMock
    ? {
          'firebase-admin/app': mock('./scripts/a11y-mocks/firebase-admin.mjs'),
          'firebase-admin/firestore': mock('./scripts/a11y-mocks/firebase-admin.mjs'),
          'firebase/database': mock('./scripts/a11y-mocks/database.mjs'),
          'firebase/app-check': mock('./scripts/a11y-mocks/app-check.mjs'),
      }
    : {};

// https://astro.build/config
export default defineConfig({
    site: 'https://devfest.cz',
    trailingSlash: 'never',
    // Node adapter for on-demand rendering. Output stays 'static' (default) —
    // only the routes that `export const prerender = false` (speakers, sessions)
    // render on demand; everything else prerenders. Middleware mode emits a
    // Connect-style handler at dist/server/entry.mjs that the `renderPages`
    // Cloud Function wraps (see ssr/ + firebase.json rewrites).
    adapter: node({ mode: 'middleware' }),
    // Self-hosted, build-time-optimised replacements for the four brand faces
    // that used to come from the fonts.googleapis.com <link> in BaseLayout.astro.
    // Weights/styles mirror exactly what that css2 URL requested. Only the four
    // brand fonts are allowed — never add a fifth family here.
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
            name: 'IM Fell English',
            cssVariable: '--font-im-fell-english',
            weights: [400],
            styles: ['normal', 'italic'],
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
        // Keep firebase-admin out of the SSR bundle. It has native/gRPC bits and
        // ships protobuf assets that don't survive bundling; the renderPages
        // function installs it from ssr/package.json instead. (Under A11Y_MOCK the
        // resolve.alias below intercepts it with a fixture replayer first.)
        ssr: {
            external: ['firebase-admin'],
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