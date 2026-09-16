#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * CSP regression gate. Serves `dist/` with the Content-Security-Policy header
 * from `firebase.json` and drives the built site in headless Chromium the way
 * a visitor does — including what a route-by-route check cannot see:
 * `<ClientRouter />` keeps one document alive across navigations, so a policy
 * that passes every direct load can still break the page you click to.
 *
 *   npm run csp     (builds first; CI runs `astro build` + this)
 *
 * Steps: direct-load every route → click through every route from `/` without
 * a reload → accept the cookie banner. Any `securitypolicyviolation` or
 * enforced CSP console error fails the run. (Whether firebase.json is fresh is
 * CI's `git diff` after the build — the build writes it.)
 * Built with `PUBLIC_ANALYTICS_ALLOWED_HOSTS=127.0.0.1` (CI does), the accept
 * step boots gtag.js for real; its beacons are aborted before they leave the
 * machine — CSP is checked before routing, so a blocked one still fails.
 */
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { PATHS, startDistServer } from './lib/dist-server.mjs';

const PORT = 4322;
const ORIGIN = `http://127.0.0.1:${PORT}`;
const BEACONS = /^https:\/\/([a-z0-9-]+\.)?(google-analytics\.com|analytics\.google\.com)\/|^https:\/\/www\.googletagmanager\.com\/td/;

const findings = [];
let step = 'startup';
const fail = (detail) => findings.push(`[${step}] ${detail}`);

async function drain(page) {
	for (const v of await page.evaluate(() => window.__cspViolations.splice(0))) {
		fail(`${v.effectiveDirective} blocked ${v.blockedURI || '(inline)'}${v.sample ? ` sample="${v.sample}"` : ''} on ${v.documentURI}`);
	}
}

// Network quiet (bounded) and client:visible islands scrolled into view.
async function settle(page) {
	await page.waitForLoadState('networkidle', { timeout: 4000 }).catch(() => {});
	await page.evaluate(async () => {
		for (let y = 0; y <= document.body.scrollHeight; y += window.innerHeight) window.scrollTo(0, y);
		window.scrollTo(0, 0);
	});
	await page.waitForTimeout(300);
}

async function run() {
	const firebase = JSON.parse(await readFile('firebase.json', 'utf8'));
	const header = firebase.hosting.headers
		.flatMap((h) => h.headers)
		.find((h) => h.key === 'Content-Security-Policy').value;

	const server = await startDistServer({ port: PORT, headers: { 'Content-Security-Policy': header } });
	const browser = await chromium.launch();
	const context = await browser.newContext({ reducedMotion: 'reduce' });
	await context.route(BEACONS, (route) => route.abort());
	await context.addInitScript(() => {
		window.__cspViolations = [];
		document.addEventListener('securitypolicyviolation', (e) => {
			window.__cspViolations.push({
				effectiveDirective: e.effectiveDirective,
				blockedURI: e.blockedURI,
				sample: e.sample,
				documentURI: e.documentURI,
			});
		});
	});
	const page = await context.newPage();
	// Enforced blocks of *our* policy only: Chromium also relays report-only
	// findings from Google's reCAPTCHA frame, and blocks inside that frame are
	// its policy. A worker's block surfaces only here, not as a page event.
	page.on('console', (msg) => {
		const text = msg.text();
		const url = msg.location()?.url ?? '';
		if (!/content security policy/i.test(text) || /report[ -]only/i.test(text)) return;
		if (url && !url.startsWith(ORIGIN) && !url.startsWith(`blob:${ORIGIN}`)) return;
		fail(text);
	});
	const marker = `csp-audit-${Date.now()}`;

	try {
		console.log(`Direct loads (${PATHS.length} routes)`);
		for (const urlPath of PATHS) {
			step = `direct ${urlPath}`;
			const before = findings.length;
			await page.goto(`${ORIGIN}${urlPath}`, { waitUntil: 'domcontentloaded' });
			await settle(page);
			await drain(page);
			console.log(`  ${findings.length === before ? '✓' : '✘'} ${urlPath}`);
		}

		// ClientRouter intercepts any same-origin anchor click. The window
		// marker proves the document was swapped, not reloaded — a reload
		// would silently turn this back into a direct-load test.
		console.log('\nClientRouter click-through from /');
		await page.goto(`${ORIGIN}/`, { waitUntil: 'domcontentloaded' });
		await settle(page);
		await page.evaluate((m) => (window.__cspAuditMarker = m), marker);
		const hops = PATHS.filter((p) => p !== '/').map((p) => p.replace(/\/$/, '')).concat('/');
		for (const target of hops) {
			step = `hop → ${target}`;
			const before = findings.length;
			await page.evaluate((href) => {
				const a = Object.assign(document.createElement('a'), { href });
				document.body.append(a);
				a.click();
				a.remove();
			}, target);
			await page.waitForFunction((t) => location.pathname === t, target, { timeout: 10000 });
			await settle(page);
			if ((await page.evaluate(() => window.__cspAuditMarker)) !== marker) {
				fail('was a full reload — soft navigation not exercised');
				await page.evaluate((m) => (window.__cspAuditMarker = m), marker);
			}
			await drain(page);
			console.log(`  ${findings.length === before ? '✓' : '✘'} ${target}`);
		}

		step = 'cookie accept';
		const before = findings.length;
		await page.click('#cookie-accept');
		await settle(page);
		await drain(page);
		console.log(`\n${findings.length === before ? '✓' : '✘'} cookie banner: accept`);
	} finally {
		await browser.close();
		server.close();
	}

	if (findings.length === 0) {
		console.log('\nCSP: no violations across direct loads and ClientRouter navigations.');
		return;
	}
	console.log(`\n=== ${findings.length} CSP finding(s) ===`);
	for (const f of findings) console.log(`  · ${f}`);
	process.exit(1);
}

run().catch((err) => {
	console.error(err);
	process.exit(2);
});
