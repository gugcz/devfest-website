/**
 * `node --test` coverage for O-R19: a validation failure must carry the
 * offending field in `details.field`, not just in `message`, so the client
 * doesn't have to parse `message` to find it.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { invalidArgument } from './submit.js';

describe('invalidArgument', () => {
	it('carries the field name in both message and details.field', () => {
		const err = invalidArgument('companyName');

		assert.equal(err.code, 'invalid-argument');
		assert.equal(err.message, 'companyName');
		assert.deepEqual(err.details, { field: 'companyName' });
	});
});
