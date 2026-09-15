/** Photo mirror guards. */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { acceptedImageType, isMirrorableUrl } from './mirror-images.js';

describe('isMirrorableUrl', () => {
	it('accepts https on sessionize.com and its subdomains', () => {
		assert.equal(isMirrorableUrl('https://cdn.sessionize.com/image/8db9-400o400o1-test4.jpg'), true);
		assert.equal(isMirrorableUrl('https://sessionize.com/image/x.jpg'), true);
		assert.equal(isMirrorableUrl('https://CDN.Sessionize.COM/image/x.jpg'), true);
	});

	it('rejects other hosts, look-alikes, plain http and junk', () => {
		for (const url of [
			'http://cdn.sessionize.com/image/x.jpg',
			'https://evil.example/sessionize.com/x.jpg',
			'https://sessionize.com.evil.example/x.jpg',
			'https://notsessionize.com/x.jpg',
			'https://169.254.169.254/computeMetadata/v1/',
			'javascript:alert(1)',
			'',
			'not a url',
		]) {
			assert.equal(isMirrorableUrl(url), false, url);
		}
	});
});

describe('acceptedImageType', () => {
	it('normalises a raster content-type', () => {
		assert.equal(acceptedImageType('image/jpeg'), 'image/jpeg');
		assert.equal(acceptedImageType('Image/PNG; charset=binary'), 'image/png');
		assert.equal(acceptedImageType('image/webp'), 'image/webp');
	});

	it('refuses SVG, non-images and a missing header', () => {
		assert.equal(acceptedImageType('image/svg+xml'), null);
		assert.equal(acceptedImageType('text/html'), null);
		assert.equal(acceptedImageType(null), null);
		assert.equal(acceptedImageType(''), null);
	});
});
