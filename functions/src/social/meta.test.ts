/** Meta Graph parsing for `/api/social`. */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { mergePosts, parseFacebook, parseInstagram } from './meta.js';

describe('parseFacebook', () => {
	it('keeps posts with text or a picture, tagged with the page name', () => {
		const posts = parseFacebook(
			{
				data: [
					{ id: '4242_1', message: ' Doors open ', created_time: '2026-10-30T07:00:00+0000', full_picture: '' },
					{ id: '4242_2', created_time: '2026-10-30T07:05:00+0000', full_picture: 'https://example.com/a.jpg' },
					{ id: '4242_3', created_time: '2026-10-30T07:10:00+0000' },
					{ message: 'no id' },
				],
			},
			'Acme Example',
		);
		assert.deepEqual(
			posts.map((p) => [p.id, p.text, p.image, p.author, p.source]),
			[
				['fb:4242_1', 'Doors open', '', 'Acme Example', 'facebook'],
				['fb:4242_2', '', 'https://example.com/a.jpg', 'Acme Example', 'facebook'],
			],
		);
	});

	it('survives a junk body', () => {
		assert.deepEqual(parseFacebook(null, ''), []);
		assert.deepEqual(parseFacebook({ data: 'nope' }, ''), []);
	});
});

describe('parseInstagram', () => {
	it('uses the thumbnail for a video and drops the author on hashtag posts', () => {
		const raw = {
			data: [
				{ id: '1', caption: 'Talk!', media_type: 'VIDEO', media_url: 'https://example.com/v.mp4', thumbnail_url: 'https://example.com/v.jpg', timestamp: '2026-10-30T08:00:00+0000', username: 'acme' },
				{ id: '2', caption: '', media_type: 'IMAGE', media_url: 'https://example.com/i.jpg', timestamp: '2026-10-30T08:01:00+0000', username: 'acme' },
			],
		};
		const own = parseInstagram(raw, 'instagram');
		assert.equal(own[0].image, 'https://example.com/v.jpg');
		assert.equal(own[1].image, 'https://example.com/i.jpg');
		assert.equal(own[0].author, 'acme');
		assert.equal(parseInstagram(raw, 'hashtag')[0].author, '');
	});
});

describe('mergePosts', () => {
	it('sorts newest first and drops the account post repeated in the hashtag list', () => {
		const own = parseInstagram({ data: [{ id: '1', caption: 'a', timestamp: '2026-10-30T08:00:00+0000' }] }, 'instagram');
		const tag = parseInstagram(
			{
				data: [
					{ id: '1', caption: 'a', timestamp: '2026-10-30T08:00:00+0000' },
					{ id: '9', caption: 'b', timestamp: '2026-10-30T09:00:00+0000' },
				],
			},
			'hashtag',
		);
		assert.deepEqual(
			mergePosts([own, tag]).map((p) => [p.id, p.source]),
			[
				['ig:9', 'hashtag'],
				['ig:1', 'instagram'],
			],
		);
	});
});
