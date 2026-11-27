import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import {
	clearConsent,
	CONSENT_KEY,
	cookieDomains,
	deleteAnalyticsData,
	deleteMarketingData,
	hasAnalyticsConsent,
	hasMarketingConsent,
	readConsent,
	storeConsent,
} from './consent.ts';

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

describe('consent levels', () => {
	beforeEach(() => store.clear());

	it('reads nothing as consent while undecided', () => {
		assert.equal(hasAnalyticsConsent(), false);
		assert.equal(hasMarketingConsent(), false);
	});

	it('reads "Analytics only" (and every older accept) as no ads consent', () => {
		storeConsent('accepted');
		assert.equal(hasAnalyticsConsent(), true);
		assert.equal(hasMarketingConsent(), false);
	});

	it('reads "Allow all" as both', () => {
		storeConsent('accepted-marketing');
		assert.equal(readConsent(), 'accepted-marketing');
		assert.equal(hasAnalyticsConsent(), true);
		assert.equal(hasMarketingConsent(), true);
	});

	it('reads a decline as neither', () => {
		storeConsent('declined');
		assert.equal(hasAnalyticsConsent(), false);
		assert.equal(hasMarketingConsent(), false);
	});

	it('never reads an unknown value as consent', () => {
		store.set(CONSENT_KEY, 'accepted-everything');
		assert.equal(readConsent(), null);
		assert.equal(hasMarketingConsent(), false);
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

describe('deleteAnalyticsData', () => {
	const written: string[] = [];
	const stub = (name: string, value: unknown) =>
		Object.defineProperty(globalThis, name, { configurable: true, value });

	beforeEach(() => {
		written.length = 0;
		stub('location', { hostname: 'www.devfest.cz' });
		stub('document', {
			get cookie() {
				return '_ga=GA1.1.1; theme=dark; _ga_ABC123=GS1';
			},
			set cookie(value: string) {
				written.push(value);
			},
		});
	});

	it('expires every _ga cookie on the host and each parent domain, nothing else', async () => {
		stub('indexedDB', {
			deleteDatabase: () => {
				const request: Record<string, () => void> = {};
				queueMicrotask(() => request.onsuccess());
				return request;
			},
		});
		await deleteAnalyticsData();
		const expired = written.map((line) => line.split('=')[0]);
		assert.deepEqual([...new Set(expired)], ['_ga', '_ga_ABC123']);
		assert.ok(written.includes('_ga=; Max-Age=0; path=/'));
		assert.ok(written.includes('_ga=; Max-Age=0; path=/; domain=www.devfest.cz'));
		assert.ok(written.includes('_ga_ABC123=; Max-Age=0; path=/; domain=devfest.cz'));
	});

	it('resolves when the database delete is blocked by an open connection', async () => {
		stub('indexedDB', {
			deleteDatabase: () => {
				const request: Record<string, () => void> = {};
				queueMicrotask(() => request.onblocked());
				return request;
			},
		});
		await deleteAnalyticsData();
	});

	it('resolves when IndexedDB is unavailable', async () => {
		stub('indexedDB', {
			deleteDatabase: () => {
				throw new Error('SecurityError');
			},
		});
		await deleteAnalyticsData();
	});
});

describe('deleteMarketingData', () => {
	const written: string[] = [];
	const stub = (name: string, value: unknown) =>
		Object.defineProperty(globalThis, name, { configurable: true, value });

	beforeEach(() => {
		written.length = 0;
		store.clear();
		stub('location', { hostname: 'www.devfest.cz' });
		stub('document', {
			get cookie() {
				return '_fbp=fb.1.1; _ga=GA1.1.1; li_fat_id=x; theme=dark';
			},
			set cookie(value: string) {
				written.push(value);
			},
		});
	});

	it('expires the ad cookies on the host and each parent domain, not analytics or the rest', () => {
		deleteMarketingData();
		const expired = written.map((line) => line.split('=')[0]);
		assert.deepEqual([...new Set(expired)], ['_fbp', 'li_fat_id']);
		assert.ok(written.includes('_fbp=; Max-Age=0; path=/; domain=devfest.cz'));
	});

	it("removes LinkedIn's Ads id from localStorage", () => {
		store.set('li_adsId', 'abc');
		deleteMarketingData();
		assert.equal(store.has('li_adsId'), false);
	});
});
