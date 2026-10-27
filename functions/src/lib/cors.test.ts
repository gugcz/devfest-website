/** CORS origin matching for the cross-origin `/api/*` reads. */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Response } from 'express';
import type { Request } from 'firebase-functions/v2/https';

import { cachedJsonEndpoint } from './cached-endpoint.js';
import { allowedOrigin, applyReadCors } from './cors.js';

// Shaped like lineupApi's list: one site under two domains, plus localhost.
const ALLOWED = [
	'https://app.example.com',
	'https://app-example.web.app',
	/^http:\/\/localhost(:\d+)?$/,
];

describe('allowedOrigin', () => {
	it('echoes either listed domain of the same site', () => {
		assert.equal(allowedOrigin('https://app.example.com', ALLOWED), 'https://app.example.com');
		assert.equal(allowedOrigin('https://app-example.web.app', ALLOWED), 'https://app-example.web.app');
	});

	it('echoes a localhost dev origin on any port', () => {
		assert.equal(allowedOrigin('http://localhost:5173', ALLOWED), 'http://localhost:5173');
		assert.equal(allowedOrigin('http://localhost', ALLOWED), 'http://localhost');
	});

	it('refuses other origins, look-alikes and a missing header', () => {
		assert.equal(allowedOrigin('https://evil.example.com', ALLOWED), null);
		assert.equal(allowedOrigin('https://app.example.com.evil.test', ALLOWED), null);
		assert.equal(allowedOrigin('http://app.example.com', ALLOWED), null);
		assert.equal(allowedOrigin('http://localhost.evil.test', ALLOWED), null);
		assert.equal(allowedOrigin(undefined, ALLOWED), null);
		assert.equal(allowedOrigin('', ALLOWED), null);
	});
});

/** Just enough of Express's request and response to record what CORS sets. */
function fakeExchange(method: string, origin?: string) {
	const headers: Record<string, string> = {};
	const vary: string[] = [];
	const sent = { status: 200, ended: false, body: undefined as unknown };
	const req = { method, get: (name: string) => (name === 'Origin' ? origin : undefined) };
	const res = {
		vary: (field: string) => (vary.push(field), res),
		set: (name: string, value: string) => ((headers[name] = value), res),
		status: (code: number) => ((sent.status = code), res),
		end: () => ((sent.ended = true), res),
		send: (body: unknown) => ((sent.body = body), (sent.ended = true), res),
		json: (body: unknown) => ((sent.body = body), (sent.ended = true), res),
	};
	return {
		req: req as unknown as Request,
		res: res as unknown as Response,
		headers,
		vary,
		sent,
	};
}

describe('applyReadCors', () => {
	it('answers a listed origin\'s preflight with 204 and the allowed methods', () => {
		const x = fakeExchange('OPTIONS', 'https://app.example.com');
		assert.equal(applyReadCors(x.req, x.res, ALLOWED), true);
		assert.equal(x.sent.status, 204);
		assert.equal(x.sent.ended, true);
		assert.equal(x.headers['Access-Control-Allow-Origin'], 'https://app.example.com');
		assert.equal(x.headers['Access-Control-Allow-Methods'], 'GET, HEAD');
		assert.deepEqual(x.vary, ['Origin']);
	});

	it('echoes a listed origin on a GET and lets the handler answer it', () => {
		const x = fakeExchange('GET', 'http://localhost:4321');
		assert.equal(applyReadCors(x.req, x.res, ALLOWED), false);
		assert.equal(x.headers['Access-Control-Allow-Origin'], 'http://localhost:4321');
		assert.equal(x.sent.ended, false);
		assert.deepEqual(x.vary, ['Origin']);
	});

	it('varies on Origin but grants nothing to a refused or missing origin', () => {
		for (const origin of ['https://evil.example.com', undefined]) {
			const x = fakeExchange('GET', origin);
			assert.equal(applyReadCors(x.req, x.res, ALLOWED), false);
			assert.equal(x.headers['Access-Control-Allow-Origin'], undefined);
			assert.deepEqual(x.vary, ['Origin']);
		}
	});

	it('leaves a refused origin\'s preflight to the endpoint, which answers 405', async () => {
		const handler = cachedJsonEndpoint({
			name: 'testApi',
			cacheControl: 'no-store',
			memoTtlMs: 0,
			fallback: {},
			load: async () => ({}),
			corsOrigins: ALLOWED,
		});
		const x = fakeExchange('OPTIONS', 'https://evil.example.com');
		await handler(x.req, x.res);
		assert.equal(x.sent.status, 405);
		assert.equal(x.headers['Allow'], 'GET, HEAD');
		assert.equal(x.headers['Access-Control-Allow-Origin'], undefined);
		assert.deepEqual(x.vary, ['Origin']);
	});
});
