/** Workshop seat counting and waitlist order. */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { allSeats, parseLimit, standing, type WorkshopNode } from './roster.js';

const reg = (at: number) => ({ at, name: 'Jane Example', email: 'jane@example.com', reference: 'ABCD-1' });

const full: WorkshopNode = {
	limit: 2,
	registrations: { c: reg(3), a: reg(1), b: reg(2), d: reg(4) },
};

describe('parseLimit', () => {
	it('accepts a positive integer, also typed as a string', () => {
		assert.equal(parseLimit(20), 20);
		assert.equal(parseLimit(' 15 '), 15);
	});

	it('treats anything else as not open', () => {
		for (const raw of [0, -3, 2.5, '', 'twenty', null, undefined, true]) assert.equal(parseLimit(raw), null);
	});
});

describe('allSeats', () => {
	it('counts seats and the waitlist, and skips workshops without a limit', () => {
		assert.deepEqual(allSeats({ w1: full, w2: { registrations: { a: reg(1) } }, w3: { limit: 10 } }), {
			w1: { limit: 2, taken: 2, waiting: 2 },
			w3: { limit: 10, taken: 0, waiting: 0 },
		});
	});

	it('survives an empty tree', () => {
		assert.deepEqual(allSeats(null), {});
	});
});

describe('standing', () => {
	it('seats the earliest sign-ups and queues the rest in order', () => {
		assert.deepEqual(standing(full, 'a'), { state: 'confirmed' });
		assert.deepEqual(standing(full, 'b'), { state: 'confirmed' });
		assert.deepEqual(standing(full, 'c'), { state: 'waiting', position: 1 });
		assert.deepEqual(standing(full, 'd'), { state: 'waiting', position: 2 });
		assert.deepEqual(standing(full, 'x'), { state: 'none' });
	});

	it('moves the waitlist up when someone leaves or the limit grows', () => {
		const { a: _gone, ...rest } = full.registrations ?? {};
		assert.deepEqual(standing({ ...full, registrations: rest }, 'c'), { state: 'confirmed' });
		assert.deepEqual(standing({ ...full, limit: 3 }, 'c'), { state: 'confirmed' });
	});
});
