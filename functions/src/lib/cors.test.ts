/** CORS origin matching for the cross-origin `/api/*` reads. */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { allowedOrigin } from './cors.js';

const ALLOWED = ['https://app.example.com', /^http:\/\/localhost(:\d+)?$/];

describe('allowedOrigin', () => {
	it('echoes a listed origin', () => {
		assert.equal(allowedOrigin('https://app.example.com', ALLOWED), 'https://app.example.com');
	});

	it('echoes a localhost dev origin on any port', () => {
		assert.equal(allowedOrigin('http://localhost:5173', ALLOWED), 'http://localhost:5173');
		assert.equal(allowedOrigin('http://localhost', ALLOWED), 'http://localhost');
	});

	it('refuses other origins, look-alikes and a missing header', () => {
		assert.equal(allowedOrigin('https://evil.example.com', ALLOWED), null);
		assert.equal(allowedOrigin('https://app.example.com.evil.test', ALLOWED), null);
		assert.equal(allowedOrigin('http://app.example.com', ALLOWED), null);
		assert.equal(allowedOrigin('http://localhost.evil.test', ALLOWED), null);
		assert.equal(allowedOrigin(undefined, ALLOWED), null);
		assert.equal(allowedOrigin('', ALLOWED), null);
	});
});
