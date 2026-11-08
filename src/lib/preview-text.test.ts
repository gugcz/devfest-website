import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { previewText } from './preview-text.ts';

describe('previewText', () => {
	it('leaves an ampersand bare where it cannot start a character reference', () => {
		assert.equal(previewText('Developer conference & festival'), 'Developer conference & festival');
		assert.equal(previewText('Q&A, then & again &'), 'Q&amp;A, then & again &');
	});

	it('escapes an ampersand a parser would read as a reference', () => {
		assert.equal(previewText('&copy 2027'), '&amp;copy 2027');
		assert.equal(previewText('&amp; is five characters'), '&amp;amp; is five characters');
		assert.equal(previewText('&#38;'), '&amp;#38;');
		assert.equal(previewText('R&2'), 'R&amp;2');
	});

	it('escapes the quote that would end the attribute and the angle brackets', () => {
		assert.equal(previewText('The "<slot>" talk'), 'The &quot;&lt;slot&gt;&quot; talk');
	});

	it('leaves the rest of the text as it is', () => {
		const text = 'The Day I Left My Linux Machine Running — Women’s “HOST”, 30 October 2026…';
		assert.equal(previewText(text), text);
	});
});
