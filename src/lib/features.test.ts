import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { checkFeatureDependencies, resolveFeatures, unlinkDisabled, type Features } from './features.ts';

const ALL_ON: Features = {
	lineup: true,
	venue: true,
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
		assert.throws(() => resolveFeatures(ALL_ON, '', 'lineups'), /PUBLIC_FEATURES_ON names "lineups"/);
	});

	it('turns on every flag in the on list, and off wins over on', () => {
		const before = { ...ALL_ON, lineup: false, partners: false };
		const resolved = resolveFeatures(before, 'partners', 'lineup, partners');
		assert.equal(resolved.lineup, true);
		assert.equal(resolved.partners, false);
	});
});

describe('checkFeatureDependencies', () => {
	const DAY_AND_VENUE = { date: {}, venue: {} };
	const NOTHING_ANNOUNCED = {};
	const ALL_OFF = resolveFeatures(ALL_ON, Object.keys(ALL_ON).join(','));

	it('passes with everything on and everything announced, and with everything off', () => {
		checkFeatureDependencies(ALL_ON, DAY_AND_VENUE);
		checkFeatureDependencies(ALL_OFF, NOTHING_ANNOUNCED);
	});

	it('fails in one sentence when invoice is on without tickets', () => {
		assert.throws(
			() => checkFeatureDependencies({ ...ALL_ON, tickets: false, invite: false }, DAY_AND_VENUE),
			/features\.invoice needs features\.tickets: .*Turn invoice off or tickets on/,
		);
	});

	it('fails when invite is on without tickets, and workshops without app or lineup', () => {
		assert.throws(() => checkFeatureDependencies({ ...ALL_ON, tickets: false, invoice: false }, DAY_AND_VENUE), /invite needs/);
		assert.throws(() => checkFeatureDependencies({ ...ALL_ON, app: false }, DAY_AND_VENUE), /workshops needs features\.app/);
		assert.throws(() => checkFeatureDependencies({ ...ALL_ON, lineup: false }, DAY_AND_VENUE), /workshops needs features\.lineup/);
	});

	it('fails when a section that states the day or the venue is on before it is announced', () => {
		assert.throws(
			() => checkFeatureDependencies({ ...ALL_OFF, tickets: true }, NOTHING_ANNOUNCED),
			/features\.tickets needs event\.date: .*set event\.date/,
		);
		assert.throws(() => checkFeatureDependencies({ ...ALL_OFF, venue: true }, { date: {} }), /venue needs event\.venue/);
		assert.throws(() => checkFeatureDependencies({ ...ALL_OFF, attending: true }, { date: {} }), /attending needs event\.venue/);
		assert.throws(() => checkFeatureDependencies({ ...ALL_OFF, tickets: true }, { date: {} }), /tickets needs event\.venue/);
		assert.throws(() => checkFeatureDependencies({ ...ALL_OFF, lineup: true }, NOTHING_ANNOUNCED), /lineup needs event\.date/);
		assert.throws(() => checkFeatureDependencies({ ...ALL_OFF, venue: true }, { venue: {} }), /venue needs event\.date/);
		checkFeatureDependencies({ ...ALL_OFF, partners: true, app: true, newsletter: true }, NOTHING_ANNOUNCED);
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

	it('unwraps the programme\'s pages while the lineup is off', () => {
		const lineup = 'See <a href="/agenda#talks">the agenda</a> and <a href="/speakers">the speakers</a>.';
		assert.equal(unlinkDisabled(lineup, { ...ALL_ON, lineup: false }), 'See the agenda and the speakers.');
	});

	it('does not touch a longer path that merely starts the same', () => {
		const other = '<a href="/apps-we-like">apps</a>';
		assert.equal(unlinkDisabled(other, { ...ALL_ON, app: false }), other);
	});
});
