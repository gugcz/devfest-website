#!/usr/bin/env node
/* eslint-disable no-console */
import { createServer } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { chromium, webkit, firefox } from 'playwright';
import { API_FIXTURES } from './a11y-mocks/api.mjs';

const DIST = path.resolve('dist');
const PORT = 4399;
const MIME = { '.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon','.woff':'font/woff','.woff2':'font/woff2','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8' };

function resolveFile(reqUrl) {
	let urlPath = decodeURIComponent(reqUrl.split('?')[0].split('#')[0]);
	if (urlPath.endsWith('/')) urlPath += 'index.html';
	const c = path.join(DIST, urlPath);
	if (existsSync(c) && !existsSync(path.join(c, 'index.html'))) return c;
	if (existsSync(`${c}.html`)) return `${c}.html`;
	if (existsSync(path.join(c, 'index.html'))) return path.join(c, 'index.html');
	return null;
}

const DELAY_MS = Number(process.env.API_DELAY_MS ?? 400);

async function startServer() {
	const server = createServer(async (req, res) => {
		const p = (req.url ?? '/').split('?')[0];
		if (p in API_FIXTURES) {
			// Real endpoints answer over the network; a zero-latency fixture would
			// hide the very shift this measures.
			await new Promise((r) => setTimeout(r, DELAY_MS));
			res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
			res.end(API_FIXTURES[p]);
			return;
		}
		const file = resolveFile(req.url ?? '/');
		if (!file) { res.writeHead(404); res.end('not found'); return; }
		res.writeHead(200, {
			'Content-Type': MIME[path.extname(file)] ?? 'application/octet-stream',
			// A cached bundle from an earlier build silently invalidates a run.
			'Cache-Control': 'no-store',
		});
		res.end(await readFile(file));
	});
	await new Promise((r) => server.listen(PORT, r));
	return server;
}

const VIEWPORTS = [
	{ label: '1440x900', width: 1440, height: 900 },
	{ label: '820x1180', width: 820, height: 1180 },
	{ label: '390x844', width: 390, height: 844 },
];
const TARGETS = [
	{ hash: '#tickets', heading: '#tickets-heading' },
	{ hash: '#newsletter', heading: '#newsletter h2' },
];
const ENGINES = process.env.ENGINE ? { [process.env.ENGINE]: { chromium, webkit, firefox }[process.env.ENGINE] } : { chromium, webkit, firefox };

async function settle(page) {
	await page.waitForLoadState('networkidle');
	await page.waitForTimeout(1200);
}

/**
 * Wait until the scroll position has stopped moving. A fixed delay measures a
 * smooth jump mid-flight and reports a miss that isn't one.
 */
async function quiet(page, { stableMs = 700, capMs = 8000 } = {}) {
	await page.evaluate(
		({ stableMs, capMs }) =>
			new Promise((resolve) => {
				const deadline = performance.now() + capMs;
				let last = window.scrollY;
				let since = performance.now();
				const tick = () => {
					const y = window.scrollY;
					if (y !== last) {
						last = y;
						since = performance.now();
					}
					if (performance.now() - since >= stableMs || performance.now() > deadline) resolve();
					else requestAnimationFrame(tick);
				};
				requestAnimationFrame(tick);
			}),
		{ stableMs, capMs }
	);
}

async function measure(page, heading) {
	return page.evaluate((sel) => {
		const el = document.querySelector(sel);
		if (!el) return null;
		const header = document.querySelector('.site-header');
		return {
			top: Math.round(el.getBoundingClientRect().top),
			bar: header ? Math.round(header.getBoundingClientRect().height) : 0,
		};
	}, heading);
}

/**
 * THE BAR'S OWN HEIGHT IS AN INVARIANT, SO IT IS A CHECK.
 *
 * `--header-h` is what every anchor offset is measured against, and the CSS
 * formula behind it stopped describing the bar once `.header-actions` was
 * allowed to wrap (DEVF-31 / #311): at a 32px root the property was out by 39px
 * at 320px and 141px at 1024px. `Menu.astro` now measures the bar and writes
 * the real height over it — this sweep is what keeps that true rather than
 * true-on-the-day-it-was-measured.
 *
 * Chromium only, and no anchor jumps: this measures layout, not scrolling. The
 * routes x widths x roots matrix is 168 checks, but only 14 page loads — the
 * widths are a viewport resize inside one document, not a reload.
 */
const HEADER_WIDTHS = [320, 360, 375, 768, 1024, 1440];
const HEADER_ROOTS = [16, 32];
const HEADER_ROUTES = [
	'/',
	'/speakers/',
	'/sessions/',
	'/agenda/',
	'/team/',
	'/partners/',
	'/contact/',
	'/faq/',
	'/press/',
	'/press/downloads/',
	'/invoice/',
	'/privacy-policy/',
	'/thank-you/',
	'/404.html',
];

/**
 * `src/lib/anchor.ts` MUST BE EXACTLY ONE CHUNK.
 *
 * Two importers pull it in (`BaseLayout.astro` and `Menu.astro`), and if the
 * bundler ever emits a copy per importer, `invalidateAnchorOffsets()` clears a
 * different module than the one holding the memo — a silent no-op, with the
 * deep-link hold reading a stale offset. This is an assert rather than the
 * one-off grep it started as, because a one-off grep is the same class of
 * silent no-op: the obvious probe (`landingOffset`) returns ZERO files, since
 * esbuild renames local identifiers. `performance.getEntriesByType('navigation')`
 * is the only occurrence in `src/`, and esbuild renames neither a property name
 * nor a string literal, so it survives minification.
 *
 * The ARGUMENT is part of the probe, not decoration: bare `getEntriesByType`
 * also matches react-dom's own chunk (`client.*.js` calls it for its resource
 * timings), which would make the count 2 and the assert permanently red.
 * The quote style is not fixed either — the minifier rewrites `'navigation'`
 * as a template literal — hence the character class.
 */
const CHUNK_PROBE = /getEntriesByType\(\s*['"`]navigation['"`]\s*\)/;

async function countProbeChunks() {
	const dir = path.join(DIST, '_astro');
	const files = (await readdir(dir)).filter((f) => f.endsWith('.js'));
	const hits = [];
	for (const f of files) {
		if (CHUNK_PROBE.test(await readFile(path.join(dir, f), 'utf8'))) hits.push(f);
	}
	return hits;
}

async function headerSweep(port) {
	const browser = await chromium.launch();
	const ctx = await browser.newContext({ viewport: { width: HEADER_WIDTHS[0], height: 800 } });
	const page = await ctx.newPage();
	// The fixture server delays `/api/*` by 400ms on purpose — that latency is
	// what the anchor half of this file measures, and this half has no use for
	// it: the bar's height owes nothing to the lineup. Answer those from the
	// same fixtures with no delay, and `load` is a sufficient wait instead of
	// `networkidle`. Answered, not aborted: an aborted fetch renders the
	// islands' "unavailable" state, and the standing-overflow report below is
	// about the real page, not that one (aborting invented three 320px rows).
	// Two consequences, harmless today but worth naming: an `/api/**` path with
	// no fixture falls through to the fixture server, which 404s it into the
	// same "unavailable" state (no such path exists right now), and `load` does
	// not guarantee a rendered island. Neither touches the asserts — the bar's
	// height owes nothing to the data — but if the standing-overflow rows below
	// ever flicker, this is the reason.
	await page.route('**/api/**', (route) => {
		const body = API_FIXTURES[new URL(route.request().url()).pathname];
		if (body === undefined) return route.continue();
		return route.fulfill({ status: 200, contentType: 'application/json; charset=utf-8', body });
	});
	const bad = [];
	const warn = [];
	let checks = 0;
	// Route outside, width inside: the widths are a viewport resize, not a new
	// document, so one `page.goto` per route covers all six (84 -> 14 loads).
	for (const route of HEADER_ROUTES) {
		// The first width has to be in place BEFORE the load, so that the
		// document the root-16 assertion below sees is one the observer has only
		// ever seen at that width.
		await page.setViewportSize({ width: HEADER_WIDTHS[0], height: 800 });
		await page.goto(`http://localhost:${port}${route}`, { waitUntil: 'load' });
		for (const [index, width] of HEADER_WIDTHS.entries()) {
			if (index > 0) await page.setViewportSize({ width, height: 800 });
			for (const root of HEADER_ROOTS) {
				// `--header-h` MUST NOT BE WRITTEN AT A 16px ROOT.
				//
				// The drift check below passes whether or not the property was
				// written, so on its own it does not cover “the offsets #310
				// established cannot move”. This does — but only on a virgin
				// document: once the root-32 pass has forced a write, the observer
				// is obliged to write the corrected value back when the root
				// returns to 16, so a later width would fail an emptiness check
				// for the right reason. Hence the first width, first root, right
				// after the load, once per route.
				// Literal 16, not `HEADER_ROOTS[0]`: the claim is about the 16px
				// root itself, so it must not hang on the array's order — reorder
				// it to [32, 16] and the indexed form would assert emptiness at a
				// 32px root and fail for a reason that isn't a regression.
				const virgin = index === 0 && root === 16;
				const result = await page.evaluate(
					async ({ rootPx, virgin }) => {
						// A text-only zoom, which is what wraps the actions.
						document.documentElement.style.fontSize = `${rootPx}px`;
						// Two frames: one for the layout the root change causes, one for
						// the `requestAnimationFrame` the observer writes its value in.
						await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
						await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
						const header = document.querySelector('.site-header');
						// `--header-h` is unregistered, so its computed value is a token
						// stream — lay an element out against it to read it as pixels.
						const probe = document.createElement('div');
						probe.style.cssText =
							'position:absolute;top:0;left:0;width:0;height:var(--header-h);visibility:hidden;pointer-events:none';
						document.body.appendChild(probe);
						const declared = probe.getBoundingClientRect().height;
						probe.remove();
						const out = {
							declared,
							actual: header ? header.getBoundingClientRect().height : 0,
							// The inline property is the observer's only footprint: empty
							// means it decided the formula was already right.
							written: virgin ? document.documentElement.style.getPropertyValue('--header-h') : null,
							// DEVF-31: the wrap exists to keep the bar inside 320px at a
							// 32px root. Guard it here rather than trusting it stayed fixed.
							scrollWidth: document.documentElement.scrollWidth,
							innerWidth: window.innerWidth,
						};
						document.documentElement.style.fontSize = '';
						return out;
					},
					{ rootPx: root, virgin }
				);
				checks++;
				const drift = Math.abs(result.declared - result.actual);
				if (drift > 1) bad.push({ route, width, root, ...result, kind: `--header-h off by ${drift.toFixed(1)}px` });
				if (virgin && result.written !== '')
					bad.push({ route, width, root, ...result, kind: `--header-h written at root ${root} ("${result.written}")` });
				// Reported, not asserted. At a 32px root the running band's strip
				// (`.ticker-item`, `Ticker.astro`) measures past the viewport on every
				// page that carries it — 1069px inside 1024px — and it did so before
				// this measurement existed. `html { overflow-x: clip }` means nothing
				// actually scrolls, so it is a standing overflow, not a live bug; it is
				// printed so it can't be discovered twice. Tracked as DEVF-49.
				if (result.scrollWidth > result.innerWidth)
					warn.push({ route, width, root, ...result, kind: `overflow ${result.scrollWidth} > ${result.innerWidth}` });
			}
		}
	}
	await ctx.close();
	await browser.close();
	return { bad, warn, checks };
}

const server = await startServer();
const rows = [];
for (const [engineName, engine] of Object.entries(ENGINES)) {
	for (const vp of VIEWPORTS) {
		// One browser per engine/viewport: sharing a browser across contexts let a
		// stale bundle and a stray open nav panel leak between runs.
		const browser = await engine.launch();

		// In-page jumps, from the top of the page, on a page that has settled.
		const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
		const page = await ctx.newPage();
		await page.goto(`http://localhost:${PORT}/`);
		await settle(page);
		for (const t of TARGETS) {
			await page.evaluate(() => window.scrollTo(0, 0));
			await page.waitForTimeout(300);
			await page.click(`.hero-actions a[href="${t.hash}"]`);
			await quiet(page);
			rows.push({ engine: engineName, vp: vp.label, target: t.hash, mode: 'in-page', ...(await measure(page, t.heading)) });
		}
		await ctx.close();

		// A soft navigation from a subpage — ClientRouter swaps the document and
		// resolves the hash itself. `/invoice` is the one page that links to a
		// home-page anchor.
		{
			const c3 = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
			const p3 = await c3.newPage();
			await p3.goto(`http://localhost:${PORT}/invoice/`);
			await settle(p3);
			await p3.click('a[href="/#tickets"]');
			await p3.waitForTimeout(600);
			await settle(p3);
			await quiet(p3);
			rows.push({ engine: engineName, vp: vp.label, target: '#tickets', mode: 'subpage-nav', ...(await measure(p3, '#tickets-heading')) });
			await c3.close();
		}

		// Deep links: a fresh document with the hash already in the URL.
		for (const t of TARGETS) {
			const c2 = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
			const p2 = await c2.newPage();
			await p2.goto(`http://localhost:${PORT}/${t.hash}`);
			await settle(p2);
			await quiet(p2);
			rows.push({ engine: engineName, vp: vp.label, target: t.hash, mode: 'deep-link', ...(await measure(p2, t.heading)) });
			await c2.close();
		}

		await browser.close();
	}
}
const chunks = await countProbeChunks();
const header = await headerSweep(PORT);
await new Promise((r) => server.close(r));

// An anchor jump should land the heading just clear of the bar. The in-page
// jumps this repo already had land 24-26px under it, so that is the band.
let bad = 0;
console.log('engine     viewport   target      mode        headingTop  bar   offsetFromBar');
for (const r of rows) {
	const off = r.top - r.bar;
	const ok = off >= 0 && off <= 60;
	if (!ok) bad++;
	console.log(
		`${r.engine.padEnd(10)} ${r.vp.padEnd(10)} ${r.target.padEnd(11)} ${r.mode.padEnd(11)} ${String(r.top).padStart(6)}  ${String(r.bar).padStart(4)}  ${String(off).padStart(6)}${ok ? '' : '  <-- OFF'}`
	);
}
console.log(bad === 0 ? '\nAll anchor landings within 0-60px of the bar.' : `\n${bad} landing(s) out of range.`);

console.log(
	`\nheader: ${header.checks} checks (${HEADER_ROUTES.length} routes x ${HEADER_WIDTHS.length} widths x roots ${HEADER_ROOTS.join('/')}px, ${HEADER_ROUTES.length} page loads)`
);
for (const b of [...header.bad, ...header.warn]) {
	console.log(
		`  ${b.route.padEnd(28)} ${String(b.width).padStart(4)}px  root ${String(b.root).padStart(2)}  declared ${b.declared.toFixed(1)}  actual ${b.actual.toFixed(1)}  <-- ${b.kind}`
	);
}
console.log(
	`\nanchor chunk: ${chunks.length} file(s) in dist/_astro carry the module (${chunks.join(', ') || 'none'})${
		chunks.length === 1 ? '' : '  <-- must be exactly 1'
	}`
);
console.log(
	header.bad.length === 0
		? `--header-h within 1px of the real bar everywhere${header.warn.length ? ` (${header.warn.length} standing overflow(s) above, not asserted)` : ''}.`
		: `${header.bad.length} header check(s) failed.`
);

process.exit(bad === 0 && header.bad.length === 0 && chunks.length === 1 ? 0 : 1);
