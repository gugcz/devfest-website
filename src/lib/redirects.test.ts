import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { builtPath, shadowedPaths, type HostingRedirect } from './redirects.ts';

describe('shadowedPaths', () => {
	const redirects: HostingRedirect[] = [
		{ regex: '^/(agenda|speakers)$', destination: '/2026/:1', type: 302 },
		{ regex: '^/(speakers|talks)/([^/]+)$', destination: '/2026/:1/:2', type: 301 },
		{ source: '/workshops', destination: '/2026/agenda', type: 302 },
		{ source: '/invite/:member', destination: '/', type: 302 },
	];

	it('finds nothing while every redirected path is unbuilt', () => {
		assert.deepEqual(shadowedPaths(redirects, ['/', '/faq', '/team', '/2026/agenda']), []);
	});

	it('names each built page a regex or a source would hide', () => {
		assert.deepEqual(shadowedPaths(redirects, ['/agenda', '/talks/42', '/workshops', '/invite/jane']), [
			'/agenda → /2026/:1',
			'/talks/42 → /2026/:1/:2',
			'/workshops → /2026/agenda',
			'/invite/jane → /',
		]);
	});

	it('matches whole paths only', () => {
		assert.deepEqual(shadowedPaths(redirects, ['/agenda-2025', '/workshops/old', '/speakers/42/photo']), []);
	});

	it('finds nothing for the pages this build has with firebase.json as committed', () => {
		const { hosting } = JSON.parse(readFileSync(new URL('../../firebase.json', import.meta.url), 'utf8')) as {
			hosting: { redirects: HostingRedirect[] };
		};
		const alwaysBuilt = ['/', '/faq', '/team', '/contact', '/press', '/press/downloads', '/privacy-policy', '/code-of-conduct'];
		// A 2027 share page is not one of 2026's, so the 301s by id leave it alone.
		alwaysBuilt.push('/speakers/a-2027-speaker', '/talks/2027001');
		assert.deepEqual(shadowedPaths(hosting.redirects, alwaysBuilt), []);
	});
});

describe('builtPath', () => {
	it('maps a built file to the URL Hosting serves it at', () => {
		assert.equal(builtPath('index.html'), '/');
		assert.equal(builtPath('faq/index.html'), '/faq');
		assert.equal(builtPath('404.html'), '/404');
		assert.equal(builtPath('calendar.ics'), '/calendar.ics');
		assert.equal(builtPath('speakers/42/index.html'), '/speakers/42');
	});

	it('leaves out the archives and the assets', () => {
		assert.equal(builtPath('2026/agenda/index.html'), null);
		assert.equal(builtPath('2026'), null);
		assert.equal(builtPath('_astro/x.js'), null);
	});
});
