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
 * THE BAR'S HEIGHT IS AN INVARIANT, SO IT IS A CHECK.
 *
 * Every anchor offset is measured against `--header-h`, and the CSS formula
 * stopped describing the bar once `.header-actions` could wrap (DEVF-31 /
 * #311): at a 32px root it was out by 39px at 320px and 141px at 1024px.
 * `Menu.astro` now measures the bar and writes the real height; this sweep
 * keeps that true.
 *
 * Chromium only, no anchor jumps — this measures layout. 660 checks but only
 * 15 page loads: widths are a viewport resize, not a reload.
 *
 * THE RASTER IS DENSE ON PURPOSE. A 6-width x 2-root sample missed a real
 * fault (DEVF-49: the organizer link wrapped mid-word, but only between
 * 1060–1260px at a 32px root). Roots 20 and 24 are common browser settings,
 * and an `em` threshold (`Footer.scss`) crosses somewhere between 16 and 32.
 */
const HEADER_WIDTHS = [320, 360, 375, 500, 768, 960, 1024, 1100, 1200, 1280, 1440];
const HEADER_ROOTS = [16, 20, 24, 32];
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
	'/newsletter-subscription-thank-you/',
	'/404.html',
];

/**
 * `src/lib/anchor.ts` MUST BE EXACTLY ONE CHUNK.
 *
 * Two importers (`BaseLayout.astro`, `Menu.astro`). If the bundler emits a
 * copy per importer, `invalidateAnchorOffsets()` clears a different module
 * than the one holding the memo — a silent no-op with a stale offset.
 *
 * Probe: `performance.getEntriesByType('navigation')` is the only occurrence
 * in `src/`, and esbuild renames neither property names nor string literals
 * (a local identifier like `landingOffset` returns ZERO files). The ARGUMENT
 * matters: bare `getEntriesByType` also matches react-dom's chunk. Quote
 * style varies under the minifier — hence the character class.
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
	// The fixture server delays `/api/*` by 400ms for the anchor half; this
	// half doesn't need it (the bar's height owes nothing to the lineup), so
	// answer from the same fixtures with no delay and wait on `load`.
	// Answered, not aborted: an aborted fetch renders the "unavailable" state,
	// and the overflow assert is about the real page. `load` does not
	// guarantee a rendered island — if the overflow assert ever flickers,
	// this is why.
	await page.route('**/api/**', (route) => {
		const body = API_FIXTURES[new URL(route.request().url()).pathname];
		if (body === undefined) return route.continue();
		return route.fulfill({ status: 200, contentType: 'application/json; charset=utf-8', body });
	});
	// THE ROOT IS ENLARGED THE WAY A READER ENLARGES IT — the browser's default
	// font size over CDP, not `html { font-size: 32px }`. A media query's `em`
	// resolves against the INITIAL font-size (this setting); an inline style
	// moves `rem` but leaves every `em` query alone, so the footer's `60em`
	// collapse would never fire and this sweep would report a false overflow.
	// `standard` only — nothing on this site reads the `fixed` monospace default.
	const cdp = await ctx.newCDPSession(page);
	await cdp.send('Page.enable');
	const setRootFontSize = (px) => cdp.send('Page.setFontSizes', { fontSizes: { standard: px } });
	const bad = [];
	let checks = 0;
	// Route outside, width inside: the widths are a viewport resize, not a new
	// document, so one `page.goto` per route covers all eleven (165 -> 15 loads).
	for (const route of HEADER_ROUTES) {
		// The first width has to be in place BEFORE the load, so that the
		// document the root-16 assertion below sees is one the observer has only
		// ever seen at that width.
		await page.setViewportSize({ width: HEADER_WIDTHS[0], height: 800 });
		// …and so does the root, for the same reason: the document must load at
		// the size the virgin assertion below is about.
		await setRootFontSize(16);
		await page.goto(`http://localhost:${port}${route}`, { waitUntil: 'load' });
		for (const [index, width] of HEADER_WIDTHS.entries()) {
			if (index > 0) await page.setViewportSize({ width, height: 800 });
			for (const root of HEADER_ROOTS) {
				// `--header-h` MUST NOT BE WRITTEN AT A 16px ROOT — that is what
				// keeps the offsets #310 established from moving. Only checkable
				// on a virgin document: once the root-32 pass forces a write, the
				// observer must write the corrected value back at 16. Hence first
				// width, first root, once per route. Literal 16, not
				// `HEADER_ROOTS[0]`: the claim is about the 16px root itself.
				const virgin = index === 0 && root === 16;
				// A text-only zoom, which is what wraps the actions — set as the
				// browser's own default size, not from script. See `setRootFontSize`.
				await setRootFontSize(root);
				const result = await page.evaluate(
					async ({ rootPx, virgin }) => {
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
							// The simulation asserts itself: a CDP setting that silently
							// stopped applying would turn every root but 16 into a rerun of
							// the 16px pass, and 495 of these checks would go green for the
							// wrong reason.
							rootPx: parseFloat(getComputedStyle(document.documentElement).fontSize),
						};
						return out;
					},
					{ rootPx: root, virgin }
				);
				checks++;
				if (Math.abs(result.rootPx - root) > 0.5)
					bad.push({ route, width, root, ...result, kind: `root is ${result.rootPx}px, asked for ${root}px` });
				const drift = Math.abs(result.declared - result.actual);
				if (drift > 1) bad.push({ route, width, root, ...result, kind: `--header-h off by ${drift.toFixed(1)}px` });
				if (virgin && result.written !== '')
					bad.push({ route, width, root, ...result, kind: `--header-h written at root ${root} ("${result.written}")` });
				// ASSERTED, not reported (DEVF-49): at a 32px root every route with
				// a footer once measured 1069px inside 1024px — the organizer link's
				// `nowrap` token, fixed by the footer's `em` breakpoints.
				//
				// An assert because `html { overflow-x: clip }` makes a regression
				// INVISIBLE: nothing scrolls, this number is the only symptom.
				// (`clip` is also why the number is readable — `hidden` would make
				// html a scroll container and report `scrollWidth === innerWidth`.)
				//
				// WHICH IS ALSO HOW TO FAKE A PASS: any ancestor with `overflow:
				// hidden`/`clip` stops overflow propagating to the document. A row
				// that goes green after a change that only added an `overflow`
				// did not get fixed. Same reason the metric is
				// `documentElement.scrollWidth`, not an element's.
				if (result.scrollWidth > result.innerWidth)
					bad.push({ route, width, root, ...result, kind: `overflow ${result.scrollWidth} > ${result.innerWidth}` });
			}
		}
	}
	await ctx.close();
	await browser.close();
	return { bad, checks };
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
for (const b of header.bad) {
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
		? '--header-h within 1px of the real bar everywhere, and no route overflows its viewport.'
		: `${header.bad.length} header check(s) failed.`
);

process.exit(bad === 0 && header.bad.length === 0 && chunks.length === 1 ? 0 : 1);
