/** Attribution fields read off ti.to webhook payloads. */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { discountCodes, trackingSource } from './tito-webhook.js';

describe('discountCodes', () => {
	it('prefers the registration-level code', () => {
		assert.deepEqual(
			discountCodes({ discount_code: 'EXAMPLE10', tickets: [{ discount_code_used: 'OTHER' }] }),
			['EXAMPLE10'],
		);
	});

	it('falls back to the distinct codes on the tickets', () => {
		assert.deepEqual(
			discountCodes({
				tickets: [
					{ discount_code_used: 'EXAMPLE10' },
					{ discount_code_used: 'EXAMPLE10' },
					{ discount_code_used: '' },
					{},
				],
			}),
			['EXAMPLE10'],
		);
	});

	it('is null without a code', () => {
		assert.equal(discountCodes({ discount_code: '  ', tickets: [{ discount_code_used: null }] }), null);
		assert.equal(discountCodes({}), null);
	});
});

describe('trackingSource', () => {
	it('returns the trimmed source or null', () => {
		assert.equal(trackingSource({ source: ' newsletter ' }), 'newsletter');
		assert.equal(trackingSource({ source: '' }), null);
		assert.equal(trackingSource({ source: null }), null);
		assert.equal(trackingSource({}), null);
	});
});
