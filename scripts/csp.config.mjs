// Single source of truth for the static (non-hash) CSP directives, shared by
// astro.config.mjs (per-page hash computation at build time) and
// scripts/gen-csp-header.mjs (site-wide header emitted after build). Kept in
// one file so the two can't drift.

export const CSP_ALGORITHM = 'SHA-256';

/** @typedef {Exclude<NonNullable<import('astro').AstroUserConfig['security']>['csp'], boolean | undefined>} AstroCspConfig */

// Directives that carry no build-time hashes — identical on every page.
/** @type {AstroCspConfig['directives']} */
export const CSP_DIRECTIVES = [
	"default-src 'self'",
	"base-uri 'self'",
	"object-src 'none'",
	"manifest-src 'self'",
	// Broad: /press hotlinks thumbnails from partner sites.
	"img-src 'self' data: blob: https:",
	"font-src 'self' data:",
	"worker-src 'self' blob:",
	"connect-src 'self' https://*.googleapis.com https://*.firebasedatabase.app wss://*.firebasedatabase.app https://*.cloudfunctions.net https://*.google-analytics.com https://*.analytics.google.com https://www.google.com https://www.gstatic.com",
	"frame-src https://www.google.com https://www.youtube.com",
	"form-action 'self' https://app.smartemailing.cz",
];

// `frame-ancestors` is ignored by browsers inside a <meta> CSP, so it's kept
// out of CSP_DIRECTIVES (Astro's per-page meta) and added only when the
// site-wide header is assembled.
export const CSP_FRAME_ANCESTORS = "frame-ancestors 'none'";

// Base script-src resources (hosts + flags). Build-time inline-script hashes
// get unioned onto this at header-generation time.
export const CSP_SCRIPT_BASE = ["'self'", "'wasm-unsafe-eval'", 'https://www.google.com', 'https://www.gstatic.com', 'https://www.googletagmanager.com', 'https://*.google-analytics.com'];

// Base style-src resources; build-time inline-style hashes get unioned in.
export const CSP_STYLE_BASE = ["'self'"];

// Style attributes (hero custom properties, reCAPTCHA badge) stay allowed —
// only style *elements* are hash-enforced.
export const CSP_STYLE_ATTR = "'unsafe-inline'";
