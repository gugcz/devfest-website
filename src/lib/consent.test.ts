import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import { clearConsent, CONSENT_KEY, cookieDomains, readConsent, storeConsent } from './consent.ts';

const store = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', {
	configurable: true,
	value: {
		getItem: (key: string) => store.get(key) ?? null,
		setItem: (key: string, value: string) => void store.set(key, value),
		removeItem: (key: string) => void store.delete(key),
	},
});

describe('clearConsent', () => {
	beforeEach(() => store.clear());

	it('forgets an accept, so the banner asks again', () => {
		storeConsent('accepted');
		clearConsent();
		assert.equal(readConsent(), null);
		assert.equal(store.has(CONSENT_KEY), false);
	});

	it('forgets a decline', () => {
		storeConsent('declined');
		clearConsent();
		assert.equal(readConsent(), null);
	});
});

describe('cookieDomains', () => {
	it('lists the host and every parent domain, never the bare TLD', () => {
		assert.deepEqual(cookieDomains('www.devfest.cz'), ['www.devfest.cz', 'devfest.cz']);
		assert.deepEqual(cookieDomains('devfest.cz'), ['devfest.cz']);
	});

	it('lists nothing for a single-label host', () => {
		assert.deepEqual(cookieDomains('localhost'), []);
	});
});
