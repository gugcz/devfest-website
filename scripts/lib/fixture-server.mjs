/**
 * The static server both audit scripts (a11y.mjs, anchor-measure.mjs) run
 * against a `dist/` build, answering `/api/*` from the shared fixtures
 * (`a11y-mocks/api.mjs`) instead of the real Cloud Functions CI has no access
 * to. Was two independent copies that had already diverged on MIME coverage,
 * dir-vs-file precedence, and Cache-Control — accidental differences, not
 * decisions either script made on purpose.
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

import { API_FIXTURES } from '../a11y-mocks/api.mjs';

const DIST = path.resolve('dist');

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
	let urlPath = decodeURIComponent(reqUrl.split('?')[0].split('#')[0]);
	if (urlPath.endsWith('/')) urlPath += 'index.html';
	const candidate = path.join(DIST, urlPath);
	if (existsSync(candidate)) return candidate;
	const htmlCandidate = `${candidate}.html`;
	if (existsSync(htmlCandidate)) return htmlCandidate;
	const indexCandidate = path.join(candidate, 'index.html');
	if (existsSync(indexCandidate)) return indexCandidate;
	return null;
}

/**
 * Start the shared fixture-backed static server.
 *
 * @param {object} opts
 * @param {number} opts.port
 * @param {number} [opts.delayMs] - Artificial latency before an `/api/*`
 *   fixture response. The anchor sweep measures layout shift caused by that
 *   latency; a zero-latency fixture would hide the very thing it measures.
 * @param {string} [opts.cacheControl] - `Cache-Control` on every response.
 *   The anchor sweep needs `no-store` — a cached bundle from an earlier build
 *   would silently invalidate a run; the a11y sweep needs none.
 * @returns {Promise<import('node:http').Server>}
 */
export async function startFixtureServer({ port, delayMs = 0, cacheControl }) {
	const server = createServer(async (req, res) => {
		const reqPath = (req.url ?? '/').split('?')[0];
		if (reqPath in API_FIXTURES) {
			if (delayMs > 0) await new Promise((resolve) => setTimeout(resolve, delayMs));
			const headers = { 'Content-Type': 'application/json; charset=utf-8' };
			if (cacheControl) headers['Cache-Control'] = cacheControl;
			res.writeHead(200, headers);
			res.end(API_FIXTURES[reqPath]);
			return;
		}
		const file = resolveFile(req.url ?? '/');
		if (!file) {
			res.writeHead(404, { 'Content-Type': 'text/plain' });
			res.end('not found');
			return;
		}
		try {
			const data = await readFile(file);
			const ext = path.extname(file).toLowerCase();
			const headers = { 'Content-Type': MIME[ext] || 'application/octet-stream' };
			if (cacheControl) headers['Cache-Control'] = cacheControl;
			res.writeHead(200, headers);
			res.end(data);
		} catch (err) {
			res.writeHead(500, { 'Content-Type': 'text/plain' });
			res.end(String(err));
		}
	});
	await new Promise((resolve) => server.listen(port, '127.0.0.1', resolve));
	return server;
}
