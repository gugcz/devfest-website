import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { checkFeatureDependencies, resolveFeatures, unlinkDisabled, type Features } from './features.ts';

const ALL_ON: Features = {
	tickets: true,
	invoice: true,
	workshops: true,
	app: true,
	invite: true,
	partners: true,
	newsletter: true,
	attending: true,
};

describe('resolveFeatures', () => {
	it('leaves the config alone with nothing off', () => {
		assert.deepEqual(resolveFeatures(ALL_ON), ALL_ON);
		assert.deepEqual(resolveFeatures(ALL_ON, ' '), ALL_ON);
	});

	it('turns off every flag in the list and nothing else', () => {
		const resolved = resolveFeatures(ALL_ON, 'workshops, partners');
		assert.equal(resolved.workshops, false);
		assert.equal(resolved.partners, false);
		assert.equal(resolved.tickets, true);
	});

	it('rejects a name that is not a flag', () => {
		assert.throws(() => resolveFeatures(ALL_ON, 'ticket'), /not a feature flag/);
	});
});

describe('checkFeatureDependencies', () => {
	it('passes with everything on and with everything off', () => {
		checkFeatureDependencies(ALL_ON);
		checkFeatureDependencies(resolveFeatures(ALL_ON, Object.keys(ALL_ON).join(',')));
	});

	it('fails in one sentence when invoice is on without tickets', () => {
		assert.throws(
			() => checkFeatureDependencies({ ...ALL_ON, tickets: false, invite: false }),
			/features\.invoice needs features\.tickets: .*Turn invoice off or tickets on/,
		);
	});

	it('fails when invite is on without tickets, and workshops without app', () => {
		assert.throws(() => checkFeatureDependencies({ ...ALL_ON, tickets: false, invoice: false }), /invite needs/);
		assert.throws(() => checkFeatureDependencies({ ...ALL_ON, app: false }), /workshops needs/);
	});
});

describe('unlinkDisabled', () => {
	const html = 'Drop your email on the <a href="/#newsletter">home page</a>, or <a href="/invoice" class="x">request an invoice</a>; see <a href="/faq">the FAQ</a>.';

	it('unwraps only the links whose flag is off', () => {
		const out = unlinkDisabled(html, { ...ALL_ON, newsletter: false });
		assert.equal(out, 'Drop your email on the home page, or <a href="/invoice" class="x">request an invoice</a>; see <a href="/faq">the FAQ</a>.');
	});

	it('leaves everything alone with every flag on', () => {
		assert.equal(unlinkDisabled(html, ALL_ON), html);
	});

	it('does not touch a longer path that merely starts the same', () => {
		const other = '<a href="/apps-we-like">apps</a>';
		assert.equal(unlinkDisabled(other, { ...ALL_ON, app: false }), other);
	});
});
