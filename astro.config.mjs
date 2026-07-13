// @ts-check
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
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

// Accessibility-audit mock mode. The public lineup (Firestore speakers /
// sessions) and ticket cache (RTDB) are gated behind App Check + read rules
// that block CI, so the axe sweep only ever sees the "temporarily unavailable"
// error state. Under A11Y_MOCK=1, swap the Firebase read modules for the fixture
// replayers in scripts/a11y-mocks/ so the hydrated content gets audited. Off by
// default — a normal build never resolves these aliases.
const a11yMock = process.env.A11Y_MOCK === '1';
const mock = (rel) => fileURLToPath(new URL(rel, import.meta.url));
const a11yMockAlias = a11yMock
    ? {
          'firebase/firestore': mock('./scripts/a11y-mocks/firestore.mjs'),
          'firebase/database': mock('./scripts/a11y-mocks/database.mjs'),
          'firebase/app-check': mock('./scripts/a11y-mocks/app-check.mjs'),
      }
    : {};

// https://astro.build/config
export default defineConfig({
    site: 'https://devfest.cz',
    trailingSlash: 'never',
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