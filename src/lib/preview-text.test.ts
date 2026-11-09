import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { previewMeta, previewText } from './preview-text.ts';

describe('previewText', () => {
	it('leaves an ampersand bare where it cannot start a character reference', () => {
		assert.equal(previewText('Developer conference & festival'), 'Developer conference & festival');
		assert.equal(previewText('then & again &'), 'then & again &');
		assert.equal(previewText('&;'), '&;');
		// Only an ASCII letter can start a named reference.
		assert.equal(previewText('&é'), '&é');
	});

	it('escapes an ampersand a parser would read as a reference', () => {
		assert.equal(previewText('Q&A'), 'Q&amp;A');
		assert.equal(previewText('&copy 2027'), '&amp;copy 2027');
		assert.equal(previewText('&amp; is five characters'), '&amp;amp; is five characters');
		assert.equal(previewText('&#38; &#x26;'), '&amp;#38; &amp;#x26;');
		assert.equal(previewText('R&2'), 'R&amp;2');
	});

	it('escapes the quote that would end the attribute and the angle brackets', () => {
		assert.equal(previewText('The "<slot>" talk'), 'The &quot;&lt;slot&gt;&quot; talk');
		assert.equal(previewText('</title><script>'), '&lt;/title&gt;&lt;script&gt;');
	});

	it('leaves a bare ampersand bare beside the entities it adds', () => {
		assert.equal(previewText('&"<>'), '&&quot;&lt;&gt;');
	});

	it('leaves the rest of the text as it is', () => {
		const text = "The Day I Left My Linux Machine Running — Women's “HOST”, 30 October 2026…";
		assert.equal(previewText(text), text);
		assert.equal(previewText(''), '');
	});
});

describe('previewMeta', () => {
	it('writes a name or a property tag with its content escaped', () => {
		assert.equal(
			previewMeta({ property: 'og:title' }, 'Conference & festival "2027"'),
			'<meta property="og:title" content="Conference & festival &quot;2027&quot;" />',
		);
		assert.equal(
			previewMeta({ name: 'description' }, 'R&D <today>'),
			'<meta name="description" content="R&amp;D &lt;today&gt;" />',
		);
	});
});
