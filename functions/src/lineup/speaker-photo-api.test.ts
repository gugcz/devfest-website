/** Speaker photo endpoint guards. */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { isSpeakerId, photoSource } from './speaker-photo-api.js';

describe('isSpeakerId', () => {
	it('accepts Sessionize GUIDs', () => {
		assert.equal(isSpeakerId('0a1b2c3d-4242-4242-4242-0a1b2c3d4e5f'), true);
	});

	it('refuses paths, empty and non-string ids', () => {
		assert.equal(isSpeakerId('../secrets'), false);
		assert.equal(isSpeakerId('a/b'), false);
		assert.equal(isSpeakerId(''), false);
		assert.equal(isSpeakerId(['4242']), false);
		assert.equal(isSpeakerId(undefined), false);
	});
});

describe('photoSource', () => {
	it('recognises the Storage mirror', () => {
		assert.equal(
			photoSource('https://firebasestorage.googleapis.com/v0/b/example.appspot.com/o/speakers%2F4242?alt=media&token=x'),
			'storage',
		);
	});

	it('recognises the Sessionize CDN', () => {
		assert.equal(photoSource('https://cdn.sessionize.com/image/4242-400o400o1-test.jpg'), 'sessionize');
	});

	it('refuses any other host, plain http and junk', () => {
		assert.equal(photoSource('https://example.com/photo.jpg'), null);
		assert.equal(photoSource('http://firebasestorage.googleapis.com/v0/b/x/o/y'), null);
		assert.equal(photoSource('not a url'), null);
		assert.equal(photoSource(''), null);
	});
});
