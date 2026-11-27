import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isAppLinkPath, isTrackingHost, redactAppLink } from './tracking-gates.ts';

describe('isTrackingHost', () => {
	it('allows the production hosts and their subdomains', () => {
		assert.equal(isTrackingHost('devfest.cz'), true);
		assert.equal(isTrackingHost('www.devfest.cz'), true);
		assert.equal(isTrackingHost('devfest-public.web.app'), true);
	});

	it('keeps previews, dev and look-alikes out', () => {
		assert.equal(isTrackingHost('devfest-public--pr-1-abc.web.app'), false);
		assert.equal(isTrackingHost('localhost'), false);
		assert.equal(isTrackingHost('notdevfest.cz'), false);
	});

	it('lets the override replace the list', () => {
		assert.equal(isTrackingHost('localhost', ' localhost , example.test'), true);
		assert.equal(isTrackingHost('devfest.cz', 'localhost'), false);
	});
});

describe('app-link paths', () => {
	it('matches the sign-in link and nothing that only starts like it', () => {
		assert.equal(isAppLinkPath('/login'), true);
		assert.equal(isAppLinkPath('/login/abc123'), true);
		assert.equal(isAppLinkPath('/loginhelp'), false);
	});

	it('cuts the code, query and hash out of a sign-in URL', () => {
		assert.equal(redactAppLink('https://devfest.cz/login/abc?x=1#y'), 'https://devfest.cz/login/');
		assert.equal(redactAppLink('https://devfest.cz/faq?x=1'), 'https://devfest.cz/faq?x=1');
	});
});
