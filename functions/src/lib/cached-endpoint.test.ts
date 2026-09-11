/**
 * `node --test` coverage for `cachedJsonEndpoint`'s in-flight coalescing
 * (O-F3): concurrent misses used to each call `spec.load()` because the memo
 * only tracked the resolved payload, not a pending promise.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { cachedJsonEndpoint } from './cached-endpoint.js';

function fakeRes() {
	const res: { statusCode: number; headers: Record<string, string>; body: unknown } = {
		statusCode: 200,
		headers: {},
		body: undefined,
	};
	return {
		res,
		set(key: string, value: string) {
			res.headers[key] = value;
		},
		status(code: number) {
			res.statusCode = code;
			return this;
		},
		json(payload: unknown) {
			res.body = payload;
		},
	};
}

describe('cachedJsonEndpoint', () => {
	it('coalesces concurrent misses into one upstream load', async () => {
		let loadCalls = 0;
		const handler = cachedJsonEndpoint({
			name: 'test',
			cacheControl: 'public, max-age=1',
			memoTtlMs: 60_000,
			fallback: null,
			load: async () => {
				loadCalls += 1;
				await new Promise((resolve) => setTimeout(resolve, 10));
				return { ok: true };
			},
		});

		const responses = await Promise.all(
			Array.from({ length: 5 }, () => {
				const mock = fakeRes();
				return handler({} as never, mock as never).then(() => mock.res);
			}),
		);

		assert.equal(loadCalls, 1);
		for (const res of responses) {
			assert.deepEqual(res.body, { ok: true });
			assert.equal(res.statusCode, 200);
		}
	});

	it('does not cache a rejection as a pending success', async () => {
		let loadCalls = 0;
		const handler = cachedJsonEndpoint<{ ok: boolean } | { unavailable: boolean }>({
			name: 'test',
			cacheControl: 'public, max-age=1',
			memoTtlMs: 60_000,
			fallback: { unavailable: true },
			load: async () => {
				loadCalls += 1;
				if (loadCalls === 1) throw new Error('upstream down');
				return { ok: true };
			},
		});

		const first = fakeRes();
		await handler({} as never, first as never);
		assert.equal(first.res.statusCode, 503);
		assert.deepEqual(first.res.body, { unavailable: true });

		const second = fakeRes();
		await handler({} as never, second as never);
		assert.equal(second.res.statusCode, 200);
		assert.deepEqual(second.res.body, { ok: true });
		assert.equal(loadCalls, 2);
	});
});
