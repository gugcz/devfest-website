import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { rebase, rebaseHtml } from './base.ts';

describe('rebase', () => {
	it('moves a root-relative path under the base', () => {
		assert.equal(rebase('/agenda', '/2026'), '/2026/agenda');
		assert.equal(rebase('/speakers?speaker=42', '/2026'), '/2026/speakers?speaker=42');
		assert.equal(rebase('/_astro/x.js', '/2026'), '/2026/_astro/x.js');
	});

	it('lands the root and its fragments on the base, without a trailing slash', () => {
		assert.equal(rebase('/', '/2026'), '/2026');
		assert.equal(rebase('/#tickets', '/2026'), '/2026#tickets');
		assert.equal(rebase('/?a=1', '/2026'), '/2026?a=1');
	});

	it('leaves a path already under the base alone', () => {
		assert.equal(rebase('/2026', '/2026'), '/2026');
		assert.equal(rebase('/2026/agenda', '/2026'), '/2026/agenda');
		assert.equal(rebase('/2026#news', '/2026'), '/2026#news');
	});

	it('does not mistake a sibling path for the base', () => {
		assert.equal(rebase('/2026-recap', '/2026'), '/2026/2026-recap');
	});

	it('leaves absolute, protocol-relative, fragment and mail URLs alone', () => {
		for (const url of ['https://devfest.cz/agenda', '//cdn.example.com/a.js', '#talks', 'mailto:billing@example.com', 'agenda']) {
			assert.equal(rebase(url, '/2026'), url);
		}
	});

	it('is the identity without a base', () => {
		assert.equal(rebase('/agenda', ''), '/agenda');
	});
});

describe('rebaseHtml', () => {
	it('rebases link, source and form attributes', () => {
		const html = '<a href="/agenda">A</a><img src="/gallery/a.webp" alt=""><form action="/search"></form>';
		assert.equal(
			rebaseHtml(html, '/2026'),
			'<a href="/2026/agenda">A</a><img src="/2026/gallery/a.webp" alt=""><form action="/2026/search"></form>',
		);
	});

	it('rebases every candidate of a srcset', () => {
		const html = '<img srcset="/a.webp 1x, /b.webp 2x" src="/a.webp">';
		assert.equal(rebaseHtml(html, '/2026'), '<img srcset="/2026/a.webp 1x, /2026/b.webp 2x" src="/2026/a.webp">');
	});

	it('leaves text, absolute URLs and attributes already rebased alone', () => {
		const html =
			'<p>See /agenda</p><a href="https://devfest.cz/">Now</a><a href="/2026/faq">FAQ</a><meta content="/agenda" name="x">';
		assert.equal(rebaseHtml(html, '/2026'), html);
	});

	it('is the identity without a base', () => {
		const html = '<a href="/agenda">A</a>';
		assert.equal(rebaseHtml(html, ''), html);
	});
});
