import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { adEventsFor, parseConversionIds } from './ad-events.ts';

describe('parseConversionIds', () => {
	it('reads event:id pairs and drops malformed ones', () => {
		assert.deepEqual(parseConversionIds(' begin_checkout:4242 , sign_up:x, :7, lead, generate_lead:-1'), {
			begin_checkout: 4242,
		});
	});

	it('reads nothing from an unset variable', () => {
		assert.deepEqual(parseConversionIds(''), {});
	});
});

describe('adEventsFor', () => {
	const ids = { begin_checkout: 4242, ticket_purchase_confirmed: 4343 };

	it('sends a checkout to both tags, with its value and currency to Meta', () => {
		assert.deepEqual(adEventsFor('begin_checkout', { value: 1990, currency: 'CZK', items: [] }, ids), [
			{ tag: 'meta', event: 'InitiateCheckout', params: { value: 1990, currency: 'CZK' } },
			{ tag: 'linkedin', conversionId: 4242 },
		]);
	});

	it('sends the purchase without a value: the ti.to redirect has none', () => {
		assert.deepEqual(adEventsFor('ticket_purchase_confirmed', undefined, ids), [
			{ tag: 'meta', event: 'Purchase' },
			{ tag: 'linkedin', conversionId: 4343 },
		]);
	});

	it('drops a value that comes without its currency', () => {
		assert.deepEqual(adEventsFor('generate_lead', { value: 5000 }, {}), [{ tag: 'meta', event: 'Lead' }]);
	});

	it('maps the newsletter sign-up, and skips LinkedIn without an id', () => {
		assert.deepEqual(adEventsFor('sign_up', { method: 'newsletter' }, ids), [
			{ tag: 'meta', event: 'CompleteRegistration' },
		]);
	});

	it('keeps every other event with GA4 alone', () => {
		assert.deepEqual(adEventsFor('page_view', {}, ids), []);
	});
});
