/**
 * Static server for the built site, shared by the axe sweep (`scripts/a11y.mjs`)
 * and the CSP gate (`scripts/csp-audit.mjs`). Serves `dist/` the way Hosting
 * does (`cleanUrls`, directory indexes) and answers `/api/*` from the fixtures
 * (CI has no Cloud Functions — see `a11y-mocks/api.mjs`).
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { statSync } from 'node:fs';
import path from 'node:path';
import { API_FIXTURES } from '../a11y-mocks/api.mjs';

export const DIST = path.resolve('dist');

/** Every route the audits cover — one entry per template. */
export const PATHS = [
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
	'/attending/',
	'/privacy-policy/',
	// One of the personal invitation pages. They are the same template
	// with a different photograph and one different line, so auditing one
	// audits all of them — and this is the only page where type sits over a
	// photograph, which is exactly the contrast case worth watching.
	'/invite/eliska-cejpova/',
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

const isFile = (p) => {
	try {
		return statSync(p).isFile();
	} catch {
		return false;
	}
};

// `/x/` → x/index.html, `/x` → x.html or x/index.html (Hosting `cleanUrls`
// plus directory indexes). ClientRouter navigates to the extensionless form
// the links carry, so both spellings have to resolve.
function resolveFile(reqUrl) {
	let urlPath = decodeURIComponent(reqUrl.split('?')[0]);
	if (urlPath.endsWith('/')) urlPath += 'index.html';
	const candidate = path.join(DIST, urlPath);
	if (isFile(candidate)) return candidate;
	const htmlCandidate = `${candidate}.html`;
	if (isFile(htmlCandidate)) return htmlCandidate;
	const indexCandidate = path.join(candidate, 'index.html');
	if (isFile(indexCandidate)) return indexCandidate;
	return null;
}

/**
 * @param {object} opts
 * @param {number} opts.port
 * @param {Record<string, string>} [opts.headers] Extra response headers on
 *   every response — the CSP gate passes the header it is testing.
 * @returns {Promise<import('node:http').Server>}
 */
export async function startDistServer({ port, headers = {} }) {
	const server = createServer(async (req, res) => {
		const reqPath = (req.url ?? '/').split('?')[0];
		if (reqPath in API_FIXTURES) {
			res.writeHead(200, { ...headers, 'Content-Type': 'application/json; charset=utf-8' });
			res.end(API_FIXTURES[reqPath]);
			return;
		}
		const file = resolveFile(req.url ?? '/');
		if (!file) {
			res.writeHead(404, { ...headers, 'Content-Type': 'text/plain' });
			res.end('not found');
			return;
		}
		try {
			const data = await readFile(file);
			const ext = path.extname(file).toLowerCase();
			res.writeHead(200, { ...headers, 'Content-Type': MIME[ext] || 'application/octet-stream' });
			res.end(data);
		} catch (err) {
			res.writeHead(500, { ...headers, 'Content-Type': 'text/plain' });
			res.end(String(err));
		}
	});
	await new Promise((resolve) => server.listen(port, '127.0.0.1', resolve));
	return server;
}
