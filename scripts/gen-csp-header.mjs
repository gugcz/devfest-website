#!/usr/bin/env node
/* eslint-disable no-console */
// Post-build step (see package.json `build`). Astro's `security.csp` hashes
// every inline <style>/<script> per page and writes a per-page <meta> CSP —
// on a static build there's no adapter to carry a response header, so meta
// is Astro's only destination. A meta CSP locks to the page that set it:
// <ClientRouter/> soft navigation keeps enforcing the first page's hashes,
// so a later page's own hashes never take effect (DEVF-64) — losing that
// page's styles/scripts, not just the specific violation reported.
//
// Fix: union every page's hashes into one site-wide `Content-Security-Policy`
// response header in firebase.json — enforced once per document, so it
// survives soft nav — and strip the now-redundant per-page meta so the two
// policies can't intersect (a browser enforces the intersection of multiple
// CSPs) and reintroduce the bug.
//
// Hashes are computed directly from the inline <script>/<style> elements in
// the built HTML, not parsed out of Astro's meta: Astro's own CSP tracking
// misses `is:inline` scripts (e.g. the `.js` bootstrap in BaseLayout.astro —
// it opts out of Astro's processing precisely to run synchronously before
// paint, so Astro never sees it to hash it). Hashing the rendered output
// ourselves catches everything the browser will actually enforce, with no
// dependency on which inline elements Astro's tracker does or doesn't cover.
import { createHash } from 'node:crypto';
import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { CSP_DIRECTIVES, CSP_FRAME_ANCESTORS, CSP_SCRIPT_BASE, CSP_STYLE_BASE, CSP_STYLE_ATTR } from './csp.config.mjs';

const DIST = path.resolve('dist');
const FIREBASE_JSON = path.resolve('firebase.json');

const CSP_META_RE = /<meta http-equiv="content-security-policy" content="[^"]*">/i;
const SCRIPT_RE = /<script((?:\s+[^>]*)?)>([\s\S]*?)<\/script>/gi;
const STYLE_RE = /<style(?:\s+[^>]*)?>([\s\S]*?)<\/style>/gi;
// script-src hashing only applies to elements that actually execute as a
// script — data-island types like JSON-LD (`application/ld+json`) don't run
// and browsers don't gate them on script-src, so they're skipped here too.
const EXECUTABLE_SCRIPT_TYPES = new Set(['', 'module', 'text/javascript', 'application/javascript', 'application/ecmascript']);

/** @param {string} dir */
async function collectHtmlFiles(dir) {
	const entries = await readdir(dir, { withFileTypes: true });
	const files = await Promise.all(
		entries.map((entry) => {
			const full = path.join(dir, entry.name);
			if (entry.isDirectory()) return collectHtmlFiles(full);
			return entry.name.endsWith('.html') ? [full] : [];
		}),
	);
	return files.flat();
}

/** @param {string} content */
function sha256(content) {
	return `'sha256-${createHash('sha256').update(content, 'utf8').digest('base64')}'`;
}

const files = await collectHtmlFiles(DIST);
const scriptHashes = new Set();
const styleHashes = new Set();
let pagesWithCsp = 0;

for (const file of files) {
	const html = await readFile(file, 'utf8');
	if (CSP_META_RE.test(html)) pagesWithCsp += 1;

	for (const match of html.matchAll(SCRIPT_RE)) {
		const [, attrs, content] = match;
		if (/\bsrc\s*=/.test(attrs) || !content.trim()) continue;
		const typeMatch = attrs.match(/\btype\s*=\s*"([^"]*)"/i);
		const type = (typeMatch?.[1] ?? '').toLowerCase();
		if (!EXECUTABLE_SCRIPT_TYPES.has(type)) continue;
		scriptHashes.add(sha256(content));
	}
	for (const [, content] of html.matchAll(STYLE_RE)) {
		if (content.trim()) styleHashes.add(sha256(content));
	}

	await writeFile(file, html.replace(CSP_META_RE, ''));
}

if (pagesWithCsp === 0) {
	throw new Error(`gen-csp-header: no per-page CSP <meta> found across ${files.length} HTML file(s) in dist/ — did Astro's CSP output change shape?`);
}

const cspHeader = [
	...CSP_DIRECTIVES,
	CSP_FRAME_ANCESTORS,
	`script-src ${[...CSP_SCRIPT_BASE, ...[...scriptHashes].sort()].join(' ')}`,
	`style-src ${[...CSP_STYLE_BASE, ...[...styleHashes].sort()].join(' ')}`,
	`style-src-attr ${CSP_STYLE_ATTR}`,
].join('; ');

const firebaseJson = JSON.parse(await readFile(FIREBASE_JSON, 'utf8'));
const headerEntry = firebaseJson.hosting.headers.find((h) => h.source === '**');
const cspHeaderDef = headerEntry.headers.find((h) => h.key === 'Content-Security-Policy');
if (!cspHeaderDef) throw new Error("gen-csp-header: firebase.json has no 'Content-Security-Policy' header entry under source '**' to update.");
cspHeaderDef.value = cspHeader;

await writeFile(FIREBASE_JSON, `${JSON.stringify(firebaseJson, null, 2)}\n`);

console.log(`gen-csp-header: ${pagesWithCsp}/${files.length} page(s) had a CSP meta (now stripped); unioned ${scriptHashes.size} script hash(es), ${styleHashes.size} style hash(es) into firebase.json.`);
