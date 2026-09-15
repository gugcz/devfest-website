/** `/invoice` body validation. */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { validate } from './validate.js';

const valid = {
	companyName: 'Acme Example s.r.o.',
	registrationNumberIC: '12345678',
	registrationNumberDIC: 'CZ12345678',
	street: 'Example 1',
	city: 'Praha',
	zip: '110 00',
	country: 'CZ',
	email: 'billing@example.com',
	countTickets: 3,
};

describe('validate', () => {
	it('accepts a complete body and normalises registration ids', () => {
		const result = validate({ ...valid, registrationNumberIC: ' 123 45 678 ', registrationNumberDIC: 'CZ 12345678' });
		assert.equal(result.ok, true);
		if (!result.ok) return;
		assert.equal(result.value.registrationNumberIC, '12345678');
		assert.equal(result.value.registrationNumberDIC, 'CZ12345678');
		assert.equal(result.value.countTickets, 3);
	});

	it('keeps the separators real registers use', () => {
		for (const id of ['FN123456a', '01-09-123456', 'HRB/12345', 'IT01234567890']) {
			assert.equal(validate({ ...valid, registrationNumberIC: id }).ok, true, id);
		}
	});

	it('rejects filter syntax and control characters in registration ids', () => {
		for (const id of ['12345678~or~Id~gt~0', '1234|5678', '1234\u00005678', '~12345678', '<b>1</b>', '']) {
			const result = validate({ ...valid, registrationNumberIC: id });
			assert.deepEqual(result, { ok: false, error: 'registrationNumberIC' }, JSON.stringify(id));
		}
		assert.deepEqual(validate({ ...valid, registrationNumberDIC: 'CZ~1' }), {
			ok: false,
			error: 'registrationNumberDIC',
		});
	});

	it('treats a blank DIČ as absent', () => {
		const result = validate({ ...valid, registrationNumberDIC: '  ' });
		assert.equal(result.ok, true);
		if (result.ok) assert.equal(result.value.registrationNumberDIC, null);
	});

	it('names the first offending field', () => {
		assert.deepEqual(validate({ ...valid, email: 'not-an-email' }), { ok: false, error: 'email' });
		assert.deepEqual(validate({ ...valid, countTickets: 0 }), { ok: false, error: 'countTickets' });
		assert.deepEqual(validate({ ...valid, countTickets: '51' }), { ok: false, error: 'countTickets' });
		assert.deepEqual(validate({ ...valid, companyName: 'x'.repeat(201) }), { ok: false, error: 'companyName' });
	});

	it('parses a numeric string ticket count and defaults the country', () => {
		const result = validate({ ...valid, countTickets: '2', country: '' });
		assert.equal(result.ok, true);
		if (!result.ok) return;
		assert.equal(result.value.countTickets, 2);
		assert.equal(result.value.country, 'CZ');
	});
});
