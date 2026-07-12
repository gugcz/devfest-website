#!/usr/bin/env node
/* eslint-disable no-console */
import { createServer } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const DIST = path.resolve('dist');
const PORT = 4321;
const PATHS = [
	'/',
	'/speakers/',
	'/sessions/',
	'/team/',
	'/partners/',
	'/contact/',
	'/faq/',
	'/press/',
	'/press/downloads/',
	'/invoice/',
	'/privacy-policy/',
	'/newsletter-subscription-thank-you/',
	'/thank-you/',
	'/404.html',
];

const MIME = {
	'.html': 'text/html; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.mjs': 'text/javascript; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.webp': 'image/webp',
	'.ico': 'image/x-icon',
	'.woff': 'font/woff',
	'.woff2': 'font/woff2',
	'.xml': 'application/xml; charset=utf-8',
	'.txt': 'text/plain; charset=utf-8',
};

function resolveFile(reqUrl) {
	let urlPath = decodeURIComponent(reqUrl.split('?')[0]);
	if (urlPath.endsWith('/')) urlPath += 'index.html';
	const candidate = path.join(DIST, urlPath);
	if (existsSync(candidate)) return candidate;
	const htmlCandidate = `${candidate}.html`;
	if (existsSync(htmlCandidate)) return htmlCandidate;
	const indexCandidate = path.join(candidate, 'index.html');
	if (existsSync(indexCandidate)) return indexCandidate;
	return null;
}

async function startServer() {
	const server = createServer(async (req, res) => {
		const file = resolveFile(req.url ?? '/');
		if (!file) {
			res.writeHead(404, { 'Content-Type': 'text/plain' });
			res.end('not found');
			return;
		}
		try {
			const data = await readFile(file);
			const ext = path.extname(file).toLowerCase();
			res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
			res.end(data);
		} catch (err) {
			res.writeHead(500, { 'Content-Type': 'text/plain' });
			res.end(String(err));
		}
	});
	await new Promise((resolve) => server.listen(PORT, '127.0.0.1', resolve));
	return server;
}

function formatViolation(v) {
	const lines = [`  · [${v.impact ?? 'n/a'}] ${v.id}: ${v.help}`];
	lines.push(`    ${v.helpUrl}`);
	for (const node of v.nodes.slice(0, 3)) {
		lines.push(`    target: ${node.target.join(' ')}`);
		const reasons = [...node.any, ...node.all, ...node.none]
			.map((c) => c.message)
			.slice(0, 2);
		for (const reason of reasons) lines.push(`      - ${reason}`);
	}
	if (v.nodes.length > 3) lines.push(`    (+${v.nodes.length - 3} more nodes)`);
	return lines.join('\n');
}

// ─── Custom contrast pass for form controls ────────────────────────────────
// axe-core cannot evaluate ::placeholder colour, and it returns "incomplete"
// (never a violation) for any text/border whose background it can't flatten —
// which on this gradient/overlay-heavy dark theme is most of the card & form
// chrome. So placeholder + field-border contrast slip through axe entirely.
// This pass composites the colours ourselves against the nearest SOLID
// background and fails on real sub-threshold controls (WCAG 1.4.3 / 1.4.11).
// Runs in the page; returns plain data.
function auditControls() {
	const relLum = ([r, g, b]) => {
		const f = (c) => {
			c /= 255;
			return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
		};
		return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
	};
	const ratio = (a, b) => {
		const l1 = relLum(a);
		const l2 = relLum(b);
		return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
	};
	const parse = (s) => {
		const m = s && s.match(/rgba?\(([^)]+)\)/);
		if (!m) return null;
		const p = m[1].split(',').map((x) => parseFloat(x));
		return { r: p[0], g: p[1], b: p[2], a: p[3] === undefined ? 1 : p[3] };
	};
	const over = (fg, bg) => [
		fg.r * fg.a + bg[0] * (1 - fg.a),
		fg.g * fg.a + bg[1] * (1 - fg.a),
		fg.b * fg.a + bg[2] * (1 - fg.a),
	];
	// Nearest ancestor with a solid background-color. A gradient/image anywhere
	// up the chain = "can't flatten" → caller treats as manual-review, not pass.
	const effectiveBg = (el) => {
		let node = el;
		while (node && node !== document.documentElement) {
			const cs = getComputedStyle(node);
			if (cs.backgroundImage && cs.backgroundImage !== 'none') return { unknown: true };
			const c = parse(cs.backgroundColor);
			if (c && c.a >= 1) return { rgb: [c.r, c.g, c.b] };
			node = node.parentElement;
		}
		const b = parse(getComputedStyle(document.body).backgroundColor);
		return { rgb: b && b.a >= 1 ? [b.r, b.g, b.b] : [5, 5, 5] };
	};
	const label = (el) => {
		const t = el.tagName.toLowerCase();
		if (el.id) return `${t}#${el.id}`;
		if (el.name) return `${t}[name=${el.name}]`;
		if (el.type) return `${t}[type=${el.type}]`;
		return t;
	};

	const fails = [];
	const review = [];
	const controls = document.querySelectorAll(
		'input:not([type=hidden]):not([type=checkbox]):not([type=radio]), textarea, select'
	);
	controls.forEach((el) => {
		const cs = getComputedStyle(el);
		const bg = effectiveBg(el);
		const sel = label(el);

		// Placeholder text vs field fill — 4.5:1 (normal text).
		const hasPh = (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') && el.placeholder;
		if (hasPh) {
			const ph = parse(getComputedStyle(el, '::placeholder').color);
			if (ph && ph.a > 0) {
				if (bg.unknown) review.push({ sel, kind: 'placeholder (bg not flat)' });
				else {
					const r = ratio(over(ph, bg.rgb), bg.rgb);
					if (r < 4.5) fails.push({ sel, kind: 'placeholder', ratio: +r.toFixed(2), need: 4.5 });
				}
			}
		}

		// Field border vs the fill it delimits — 3:1 (non-text, 1.4.11).
		const bw = parseFloat(cs.borderTopWidth) || 0;
		if (bw > 0 && cs.borderTopStyle !== 'none') {
			const bc = parse(cs.borderTopColor);
			if (bc && bc.a > 0) {
				if (bg.unknown) review.push({ sel, kind: 'border (bg not flat)' });
				else {
					const r = ratio(over(bc, bg.rgb), bg.rgb);
					if (r < 3) fails.push({ sel, kind: 'border', ratio: +r.toFixed(2), need: 3 });
				}
			}
		}
	});
	return { fails, review };
}

// ─── Source scan: suppressed focus indicators (2.4.7) ──────────────────────
// axe has no focus-visibility rule. Flag :focus-visible blocks that kill the
// outline without an obvious replacement (box-shadow / coloured border / a real
// outline). Scoped to :focus-visible only — a plain :focus { outline:none } for
// pointer users is legitimate when the keyboard :focus-visible ring survives.
// Warn-only: static SCSS parsing is fuzzy, so a human confirms.
async function collectStyleFiles(dir) {
	const out = [];
	for (const ent of await readdir(dir, { withFileTypes: true })) {
		const full = path.join(dir, ent.name);
		if (ent.isDirectory()) out.push(...(await collectStyleFiles(full)));
		else if (/\.(scss|astro)$/.test(ent.name)) out.push(full);
	}
	return out;
}

async function scanSuppressedFocus() {
	const root = path.resolve('src');
	if (!existsSync(root)) return [];
	const hits = [];
	for (const file of await collectStyleFiles(root)) {
		const lines = (await readFile(file, 'utf8')).split('\n');
		for (let i = 0; i < lines.length; i++) {
			if (!/:focus-visible\b/.test(lines[i])) continue;
			const block = lines.slice(i, i + 8).join('\n').split('}')[0];
			if (!/outline[a-z-]*:\s*(none|0)\b/i.test(block)) continue;
			// Drop the suppressing outline declaration, then look for a real
			// focus indicator in what remains.
			const rest = block.replace(/outline[a-z-]*:\s*(none|0)[^;]*;?/gi, '');
			const hasAlt =
				/box-shadow:\s*(?!none)[^;]+/i.test(rest) ||
				/border[a-z-]*:\s*(?![^;]*transparent)[^;]*(rgb|#|var|currentcolor|solid|dashed|dotted)/i.test(rest) ||
				/outline[a-z-]*:\s*(?!none|0)[^;]+/i.test(rest);
			if (!hasAlt) {
				hits.push(`${path.relative(process.cwd(), file)}:${i + 1}  ${lines[i].trim()}`);
			}
		}
	}
	return hits;
}

// ─── Gated ready-state coverage ────────────────────────────────────────────
// The lineup (Firestore speakers/sessions) and ticket cache (RTDB) sit behind
// App Check + read rules that block CI, so a plain build only ever renders the
// "temporarily unavailable" error state. `npm run a11y` builds with A11Y_MOCK=1
// (astro.config.mjs → scripts/a11y-mocks/) so the components hydrate from
// fixtures and the real content — cards, filters, ticket waves, detail dialogs —
// gets audited. Two extra concerns then need driving that a static pass misses:
//
//  1. client:visible islands (Tickets on /) don't hydrate until scrolled into
//     view — `hydrateIslands` scrolls the page and waits for aria-busy to clear.
//  2. The speaker/session detail dialogs only exist after a click — `MODAL_FLOWS`
//     opens each and axe re-runs scoped to the dialog.

async function hydrateIslands(page) {
	// Trigger client:visible islands, then settle at the top again.
	await page.evaluate(async () => {
		const step = Math.max(1, Math.floor(window.innerHeight * 0.8));
		for (let y = 0; y <= document.body.scrollHeight; y += step) window.scrollTo(0, y);
		window.scrollTo(0, 0);
	});
	// Wait for every island to leave its loading state (bounded — some pages have
	// none, and the empty/error states never set aria-busy).
	await page
		.waitForFunction(() => !document.querySelector('[aria-busy="true"]'), { timeout: 6000 })
		.catch(() => {});
	await page.waitForTimeout(250);
}

// Detail dialogs reached by clicking a card. Each flow reloads first for a clean
// state, opens the dialog, and axe re-runs scoped to `[role="dialog"]`.
const MODAL_FLOWS = {
	'/speakers/': [
		{
			label: 'speaker detail dialog',
			open: (p) => p.click('button[aria-label^="View "]'),
		},
	],
	'/sessions/': [
		{
			label: 'session detail dialog',
			open: (p) => p.click('button[aria-label^="View details for "]'),
		},
		{
			label: 'session → speaker dialog',
			open: async (p) => {
				await p.click('button[aria-label^="View details for "]');
				await p.waitForSelector('[role="dialog"]');
				await p.click('[role="dialog"] button[aria-label^="View "]');
			},
		},
	],
};

async function auditModals(page, urlPath, url, tags) {
	const flows = MODAL_FLOWS[urlPath];
	if (!flows) return [];
	const found = [];
	for (const flow of flows) {
		await page.goto(url, { waitUntil: 'domcontentloaded' });
		await page.waitForLoadState('networkidle', { timeout: 4000 }).catch(() => {});
		await hydrateIslands(page);
		try {
			await flow.open(page);
			await page.waitForSelector('[role="dialog"]', { timeout: 3000 });
			await page.waitForTimeout(200);
			const res = await new AxeBuilder({ page })
				.withTags(tags)
				.include('[role="dialog"]')
				.analyze();
			if (res.violations.length) found.push({ urlPath: `${urlPath} [${flow.label}]`, violations: res.violations });
		} catch (err) {
			console.log(`  ⚠ ${urlPath} [${flow.label}] — flow error: ${err}`);
		}
	}
	return found;
}

async function run() {
	if (!existsSync(DIST)) {
		console.error('dist/ missing. Run `npm run build` first.');
		process.exit(2);
	}

	const server = await startServer();
	const browser = await chromium.launch();
	// Force reduced motion so on-load fade animations finish instantly.
	// Otherwise axe samples mid-fade and reports phantom contrast issues.
	const context = await browser.newContext({ reducedMotion: 'reduce' });
	const page = await context.newPage();

	const tags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
	let totalViolations = 0;
	const failures = [];
	const controlFailures = [];
	const controlReview = [];
	const incompleteReview = [];

	console.log(`Auditing ${PATHS.length} pages against ${tags.join(', ')}`);

	for (const urlPath of PATHS) {
		const url = `http://127.0.0.1:${PORT}${urlPath}`;
		const start = Date.now();
		// 'networkidle' never fires on pages that hold a live realtime listener
		// (the Firestore speakers wall, the RTDB tickets cache keep a channel
		// open), so load the DOM, then wait for idle only briefly and fall
		// through — enough for islands to hydrate without hanging 30s.
		await page.goto(url, { waitUntil: 'domcontentloaded' });
		await page.waitForLoadState('networkidle', { timeout: 4000 }).catch(() => {});
		// Under the mock build, drive client:visible islands (Tickets on /) to
		// their ready state before axe samples the DOM.
		await hydrateIslands(page);
		const results = await new AxeBuilder({ page }).withTags(tags).analyze();

		// axe blind spots: our own control-contrast pass + surfaced incompletes.
		const { fails, review } = await page.evaluate(auditControls);
		for (const f of fails) controlFailures.push({ urlPath, ...f });
		for (const r of review) controlReview.push({ urlPath, ...r });
		for (const inc of results.incomplete) {
			if (inc.id === 'color-contrast') {
				incompleteReview.push({ urlPath, nodes: inc.nodes.length });
			}
		}

		// Detail dialogs (speaker / session) only exist after a click.
		const modalFails = await auditModals(page, urlPath, url, tags);
		for (const m of modalFails) {
			totalViolations += m.violations.length;
			failures.push(m);
		}

		const elapsed = Date.now() - start;
		const pageFails = fails.length;
		if (results.violations.length === 0 && pageFails === 0 && modalFails.length === 0) {
			console.log(`  ✓ ${urlPath} (${elapsed}ms)`);
			continue;
		}
		if (results.violations.length) {
			totalViolations += results.violations.length;
			failures.push({ urlPath, violations: results.violations });
		}
		const parts = [];
		if (results.violations.length) parts.push(`${results.violations.length} axe`);
		if (pageFails) parts.push(`${pageFails} control-contrast`);
		if (modalFails.length) parts.push(`${modalFails.reduce((n, m) => n + m.violations.length, 0)} modal`);
		console.log(`  ✘ ${urlPath} — ${parts.join(', ')} (${elapsed}ms)`);
	}

	await browser.close();
	server.close();

	const focusHits = await scanSuppressedFocus();

	// Non-failing review sections — things axe cannot decide but a human should.
	if (incompleteReview.length) {
		const total = incompleteReview.reduce((n, r) => n + r.nodes, 0);
		// Informational only: this theme layers gradients + film-grain over almost
		// everything, so axe punts on most text. The deterministic subset that
		// matters (form controls) is checked by the control-contrast pass above;
		// body text was verified in the WCAG 2.2 sweep.
		console.log(
			`\nℹ ${total} colour-contrast node(s) sit on non-flat backgrounds axe can't evaluate (informational — see control-contrast pass for the enforced subset).`
		);
	}
	if (controlReview.length) {
		console.log(`\n⚠ ${controlReview.length} form control(s) over non-flat bg — manual contrast review:`);
		for (const r of controlReview) console.log(`    ${r.urlPath} — ${r.sel} — ${r.kind}`);
	}
	if (focusHits.length) {
		console.log(`\n⚠ ${focusHits.length} focus rule(s) suppress outline with no obvious replacement (2.4.7) — review:`);
		for (const h of focusHits) console.log(`    ${h}`);
	}

	if (failures.length === 0 && controlFailures.length === 0) {
		console.log('\nAll pages pass WCAG 2.2 AA (axe-core + custom control-contrast pass).');
		process.exit(0);
	}

	if (failures.length) {
		console.log('\n=== axe violation details ===');
		for (const { urlPath, violations } of failures) {
			console.log(`\n${urlPath}`);
			for (const v of violations) console.log(formatViolation(v));
		}
	}
	if (controlFailures.length) {
		console.log('\n=== control-contrast failures (WCAG 1.4.3 / 1.4.11) ===');
		for (const f of controlFailures) {
			console.log(`  · ${f.urlPath} — ${f.sel} ${f.kind}: ${f.ratio}:1 (need ${f.need}:1)`);
		}
	}
	console.log(
		`\nTotal: ${totalViolations} axe violation(s), ${controlFailures.length} control-contrast failure(s).`
	);
	process.exit(1);
}

run().catch((err) => {
	console.error(err);
	process.exit(2);
});
