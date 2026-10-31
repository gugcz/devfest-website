/** The CORS lists derived from the site mirror. */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { allowedOrigin } from './lib/cors.js';
import { APP_ORIGINS, SITE_ORIGINS, eventName } from './site.js';

describe('eventName', () => {
	it('joins the brand and the edition like the site does', () => {
		assert.equal(eventName(), 'DevFest.cz 2026');
	});
});

describe('SITE_ORIGINS', () => {
	it('accepts the site, its www alias, a PR preview and a dev server', () => {
		for (const origin of [
			'https://devfest.cz',
			'https://www.devfest.cz',
			'https://devfest-public--pr-12-ab3cd9.web.app',
			'http://localhost:4321',
		]) {
			assert.equal(allowedOrigin(origin, SITE_ORIGINS), origin);
		}
	});

	it('rejects other origins, look-alikes and the app', () => {
		for (const origin of [
			'https://evil.example',
			'https://devfest.cz.evil.example',
			'https://devfest-public--pr-12-ab3cd9.web.app.evil.example',
			'https://devfest-cz-app--pr-1-abc.web.app',
			'http://devfest.cz',
			'https://app.devfest.cz',
			'https://www.app.devfest.cz',
			'https://localhost:4321',
		]) {
			assert.equal(allowedOrigin(origin, SITE_ORIGINS), null);
		}
	});
});

describe('APP_ORIGINS', () => {
	it('accepts both app domains and a dev server', () => {
		for (const origin of [
			'https://app.devfest.cz',
			'https://devfest-cz-app.web.app',
			'http://localhost:5173',
		]) {
			assert.equal(allowedOrigin(origin, APP_ORIGINS), origin);
		}
	});

	it('rejects the site, a www-prefixed app host, https localhost and others', () => {
		for (const origin of [
			'https://devfest.cz',
			'https://www.app.devfest.cz',
			'https://localhost:4321',
			'https://evil.example',
		]) {
			assert.equal(allowedOrigin(origin, APP_ORIGINS), null);
		}
	});
});
