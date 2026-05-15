#!/usr/bin/env node
/* eslint-disable no-console */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const DIST = path.resolve('dist');
const PORT = 4321;
const PATHS = [
	'/',
	'/partners/',
	'/contact/',
	'/privacy-policy/',
	'/newsletter-subscription-thank-you/',
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

	console.log(`Auditing ${PATHS.length} pages against ${tags.join(', ')}`);

	for (const urlPath of PATHS) {
		const url = `http://127.0.0.1:${PORT}${urlPath}`;
		const start = Date.now();
		await page.goto(url, { waitUntil: 'networkidle' });
		const results = await new AxeBuilder({ page }).withTags(tags).analyze();
		const elapsed = Date.now() - start;
		if (results.violations.length === 0) {
			console.log(`  ✓ ${urlPath} (${elapsed}ms)`);
			continue;
		}
		totalViolations += results.violations.length;
		failures.push({ urlPath, violations: results.violations });
		console.log(`  ✘ ${urlPath} — ${results.violations.length} violations (${elapsed}ms)`);
	}

	await browser.close();
	server.close();

	if (failures.length === 0) {
		console.log('\nAll pages pass WCAG 2.2 AA (axe-core ruleset).');
		process.exit(0);
	}

	console.log('\n=== Violation details ===');
	for (const { urlPath, violations } of failures) {
		console.log(`\n${urlPath}`);
		for (const v of violations) console.log(formatViolation(v));
	}
	console.log(`\nTotal violations: ${totalViolations}`);
	process.exit(1);
}

run().catch((err) => {
	console.error(err);
	process.exit(2);
});
