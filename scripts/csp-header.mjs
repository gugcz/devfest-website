#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Content-Security-Policy — source of truth.
 *
 * The CSP ships as an HTTP header from `firebase.json`, never as a `<meta>`:
 * `<ClientRouter />` keeps one document alive across navigations and per-page
 * meta policies stack, blocking the next page's styles. One header for the
 * whole site must carry the hash of every inline `<script>` and `<style>` on
 * every page, so this runs after `astro build` and rewrites that header line.
 *
 *   node scripts/csp-header.mjs   rewrite firebase.json (part of `npm run build`)
 *
 * Adding a third-party script or endpoint host → edit DIRECTIVES. Hashes are
 * regenerated on every build; don't hand-edit them.
 */
import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = path.resolve('dist');
const FIREBASE_JSON = path.resolve('firebase.json');

/** One source per line so each host can say who needs it. */
const DIRECTIVES = [
	['default-src', "'self'"],
	['base-uri', "'self'"],
	['object-src', "'none'"],
	['frame-ancestors', "'none'"], // + X-Frame-Options: DENY for old browsers
	[
		'form-action',
		"'self'",
		'https://app.smartemailing.cz', // NewsletterForm posts there
		'https://devfest.cz', // …then 302s back here. Preview channels only: Chrome checks every hop and 'self' is the preview host there
	],
	[
		'img-src',
		"'self'",
		'data:', // film-grain SVG noise in BaseLayout.scss / team.scss
		'blob:', // AttendingCard previews (object URLs)
		'https:', // /press hotlinks partner thumbnails
	],
	['worker-src', "'self'", 'blob:'], // heic-to/csp spawns a blob Worker on /attending
	[
		'connect-src',
		"'self'",
		// Exact hosts: *.googleapis.com / *.cloudfunctions.net are multi-tenant.
		'https://content-firebaseappcheck.googleapis.com', // App Check token exchange (invoice submit)
		'https://firebase.googleapis.com', // Analytics dynamic config
		'https://firebaseinstallations.googleapis.com', // Firebase Installations (Analytics)
		'https://europe-west1-devfest-cz-app.cloudfunctions.net', // submitInvoiceCallable
		'https://*.google-analytics.com', // GA4 beacons; EEA traffic routes to region1.google-analytics.com
		'https://*.analytics.google.com', // GA4 beacons
		'https://www.googletagmanager.com/td', // gtag.js tag-diagnostics beacon (Safari sends it as fetch)
		'https://www.google.com/recaptcha/', // reCAPTCHA Enterprise client log
	],
	// Path-scoped: the bare hosts also serve JSONP endpoints that would let
	// injected markup bypass the hash policy.
	['frame-src', 'https://www.google.com/recaptcha/'], // reCAPTCHA Enterprise anchor/bframe
	[
		'script-src',
		"'self'",
		"'report-sample'", // violation events carry the first 40 chars of a blocked inline
		'https://www.google.com/recaptcha/', // reCAPTCHA enterprise.js
		'https://www.gstatic.com/recaptcha/', // reCAPTCHA recaptcha__en.js
		'https://www.googletagmanager.com/gtag/', // gtag.js (GA4)
		// + a hash per inline <script> in dist
	],
	['style-src', "'self'", "'report-sample'"], // + a hash per inline <style> in dist
	// SSR'd style="" attributes carry CSS custom properties (hero photo vars,
	// team --i, partner --logo-w) and React style={{}}; attributes can't run
	// script. Engines without style-src-attr (Safari < 15.4, Firefox < 108)
	// fall back to style-src and drop them — cosmetic only.
	['style-src-attr', "'unsafe-inline'"],
];

// Script types the browser executes; `application/ld+json` and other data
// blocks are inert and need no hash.
const EXECUTABLE = new Set(['', 'module', 'text/javascript']);

const sha256 = (text) => `'sha256-${createHash('sha256').update(text).digest('base64')}'`;

async function htmlFiles(dir) {
	const out = [];
	for (const ent of await readdir(dir, { withFileTypes: true })) {
		const full = path.join(dir, ent.name);
		if (ent.isDirectory()) out.push(...(await htmlFiles(full)));
		else if (ent.name.endsWith('.html')) out.push(full);
	}
	return out;
}

/**
 * Hash every executable inline `<script>` and every `<style>` under `dist/`.
 * A regex is enough for Astro's output: no `>` inside attributes, and JSON-LD
 * escapes `<` so a `</script>` never appears inside a body. Anything the
 * regex gets wrong shows up as a violation in `csp-audit.mjs`.
 */
export async function computePolicy() {
	const files = await htmlFiles(DIST);
	if (files.length === 0) throw new Error('no .html under dist/ — run `astro build` first');
	const scripts = new Set();
	const styles = new Set();
	for (const file of files) {
		const html = await readFile(file, 'utf8');
		for (const [, attrs, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
			if (/\ssrc\s*=/i.test(attrs)) continue;
			const type = (attrs.match(/\btype\s*=\s*["']?([^"'\s>]*)/i)?.[1] ?? '').toLowerCase();
			if (EXECUTABLE.has(type)) scripts.add(sha256(body));
		}
		for (const [, body] of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) styles.add(sha256(body));
	}
	const extra = { 'script-src': [...scripts].sort(), 'style-src': [...styles].sort() };
	const policy = DIRECTIVES.map(([name, ...src]) => [name, ...src, ...(extra[name] ?? [])].join(' ')).join('; ');
	return { policy, pages: files.length, scripts: scripts.size, styles: styles.size };
}

// The one line this script owns in firebase.json — replaced textually so the
// file's formatting and every other header stay untouched.
const HEADER_LINE = /("key":\s*"Content-Security-Policy",\s*"value":\s*)"((?:[^"\\]|\\.)*)"/;

/** The header value currently in `firebase.json`. */
export async function currentPolicy() {
	const text = await readFile(FIREBASE_JSON, 'utf8');
	const m = text.match(HEADER_LINE);
	if (!m) throw new Error('no Content-Security-Policy header in firebase.json');
	return { text, value: JSON.parse(`"${m[2]}"`) };
}

async function main() {
	const { policy, pages, scripts, styles } = await computePolicy();
	const { text, value } = await currentPolicy();
	const counts = `${scripts} script + ${styles} style hash(es) from ${pages} page(s)`;
	if (value === policy) {
		console.log(`CSP: ${counts} — firebase.json unchanged`);
		return;
	}
	await writeFile(FIREBASE_JSON, text.replace(HEADER_LINE, (_, prefix) => prefix + JSON.stringify(policy)));
	console.log(`CSP: ${counts} — firebase.json updated`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	main().catch((err) => {
		console.error(err.message ?? err);
		process.exit(2);
	});
}
