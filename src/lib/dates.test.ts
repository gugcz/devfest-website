import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formatDate, formatTime } from './dates.ts';

const TZ = 'Europe/Prague';
// After the autumn DST switch: +01:00 is CET.
const DOORS = '2026-10-30T08:00:00+01:00';

describe('formatDate', () => {
	it('writes the six spellings the site uses', () => {
		assert.equal(formatDate(DOORS, 'label', TZ), '30 October 2026');
		assert.equal(formatDate(DOORS, 'short', TZ), '30 Oct 2026');
		assert.equal(formatDate(DOORS, 'slash', TZ), '30 / 10 / 26');
		assert.equal(formatDate(DOORS, 'dots', TZ), '30.10.2026');
		assert.equal(formatDate(DOORS, 'stamp', TZ), '30 OCT 2026');
		assert.equal(formatDate(DOORS, 'iso', TZ), '2026-10-30');
	});

	it('pads a single-digit day and month only where the stamp does', () => {
		const spring = '2027-05-05T10:00:00+02:00';
		assert.equal(formatDate(spring, 'label', TZ), '5 May 2027');
		assert.equal(formatDate(spring, 'slash', TZ), '05 / 05 / 27');
		assert.equal(formatDate(spring, 'iso', TZ), '2027-05-05');
	});

	it('reads the calendar day in the event zone, not in UTC', () => {
		// 23:30 UTC is already the next day in Prague.
		assert.equal(formatDate('2026-10-29T23:30:00Z', 'iso', TZ), '2026-10-30');
	});

	it('does not write September as "Sept"', () => {
		assert.equal(formatDate('2026-09-10T10:00:00+02:00', 'short', TZ), '10 Sep 2026');
	});
});

describe('formatTime', () => {
	it('writes the local clock with the zone applied', () => {
		assert.equal(formatTime(DOORS, TZ), '08:00');
		assert.equal(formatTime('2026-10-30T18:00:00Z', TZ), '19:00');
		// Summer: the same UTC instant is an hour later on the wall.
		assert.equal(formatTime('2026-07-01T18:00:00Z', TZ), '20:00');
	});

	it('never writes 24:00 for midnight', () => {
		assert.equal(formatTime('2026-10-30T23:00:00Z', TZ), '00:00');
	});
});
