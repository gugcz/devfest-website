/** Which company-funded release prices an invoice and which its code unlocks. */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { TitoRelease } from '../tickets/tito-api.js';
import { pickInvoicedReleases, pickPricingRelease } from './tito-discount.js';

const early: TitoRelease = {
	id: 1,
	slug: 'early-bird-company-funded',
	title: 'Early bird — Company funded',
	start_at: '2026-04-01T00:00:00+02:00',
	expired: true,
};
// Closed to the public but still on sale, so paid invoices can redeem it.
const regular: TitoRelease = {
	id: 2,
	slug: 'regular-company-funded',
	title: 'Regular — Company funded',
	start_at: '2026-07-01T00:00:00+02:00',
	secret: true,
};
const lazy: TitoRelease = {
	id: 3,
	slug: 'lazy-bird-company-funded',
	title: 'Lazy bird — Company funded',
	start_at: '2026-09-30T12:00:00+02:00',
};
const all = [early, regular, lazy];

const at = (iso: string) => Date.parse(iso);

describe('pickPricingRelease', () => {
	it('prices from the public wave, never a secret one', () => {
		assert.equal(pickPricingRelease(all)?.id, lazy.id);
		// Even when the public wave has no start date to compare on.
		assert.equal(pickPricingRelease([regular, { ...lazy, start_at: null }])?.id, lazy.id);
	});

	it('falls back to secret releases when nothing else matches', () => {
		assert.equal(pickPricingRelease([regular])?.id, regular.id);
		assert.equal(pickPricingRelease([]), null);
	});
});

describe('pickInvoicedReleases', () => {
	it('scopes the code to the release stored at issue time', () => {
		assert.deepEqual(pickInvoicedReleases(all, { releaseId: regular.id }), [regular]);
		assert.deepEqual(pickInvoicedReleases(all, { releaseId: lazy.id }), [lazy]);
	});

	it('infers the wave of an invoice issued before the release was stored', () => {
		const ids = (requestedAt: string) =>
			pickInvoicedReleases(all, { requestedAtMs: at(requestedAt) }).map((r) => r.id);
		assert.deepEqual(ids('2026-09-20T10:00:00+02:00'), [regular.id]);
		assert.deepEqual(ids('2026-10-01T10:00:00+02:00'), [lazy.id]);
	});

	it('falls back to every release when the wave is gone or unknown', () => {
		// Early bird has expired: its code would unlock nothing.
		assert.deepEqual(pickInvoicedReleases(all, { requestedAtMs: at('2026-05-01T00:00:00+02:00') }), all);
		assert.deepEqual(pickInvoicedReleases(all, { releaseId: 4242 }), all);
		assert.deepEqual(pickInvoicedReleases(all, {}), all);
	});
});
