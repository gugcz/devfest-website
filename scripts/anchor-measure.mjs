#!/usr/bin/env node
/* eslint-disable no-console */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
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
process.exit(bad === 0 ? 0 : 1);
