/** Room mirror: `extractRooms`; speaker roster merge: `mergeSpeakerRosters`. */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { extractRooms, mergeSpeakerRosters } from './sessionize-api.js';

describe('extractRooms', () => {
	it('keeps every room, empty ones included, in Sessionize sort order', () => {
		const rooms = extractRooms({
			sessions: [{ id: '1', roomId: 101 }],
			rooms: [
				{ id: 103, name: 'Lab', sort: 2 },
				{ id: 101, name: 'Main Hall', sort: 0 },
				{ id: 102, name: ' Room B ', sort: 1 },
			],
		});
		assert.deepEqual(rooms, [
			{ id: '101', order: 0, name: 'Main Hall' },
			{ id: '102', order: 1, name: 'Room B' },
			{ id: '103', order: 2, name: 'Lab' },
		]);
	});

	it('falls back to array order and skips nameless, id-less and repeated rooms', () => {
		const rooms = extractRooms({
			rooms: [
				{ id: 2, name: 'Second' },
				{ id: 1, name: 'First' },
				{ id: 3, name: '' },
				{ name: 'No id' },
				{ id: 2, name: 'Duplicate' },
				null,
			],
		});
		assert.deepEqual(rooms, [
			{ id: '2', order: 0, name: 'Second' },
			{ id: '1', order: 1, name: 'First' },
		]);
	});

	it('is empty for a Speakers-view array or a payload without rooms', () => {
		assert.deepEqual(extractRooms([{ id: 'sp' }]), []);
		assert.deepEqual(extractRooms({ sessions: [] }), []);
		assert.deepEqual(extractRooms({ rooms: 'nope' }), []);
	});
});

describe('mergeSpeakerRosters', () => {
	const all = [
		{ id: 'a', fullName: 'Ada Example', sessions: [101] },
		{ id: 'b', fullName: 'Bob Example', sessions: [102] },
	];

	it('adds speakers only the Speakers view lists, in its order, keeping All entries', () => {
		const merged = mergeSpeakerRosters(all, [
			{ id: 'host', fullName: 'Hana Host', sessions: [{ id: 900, name: 'HOST' }] },
			{ id: 'b', fullName: 'Bob Example', sessions: [{ id: 102, name: 'Short title' }] },
			{ id: 'a', fullName: 'Ada Example', sessions: [{ id: 101, name: 'Short title' }] },
		]);
		assert.deepEqual(
			merged.map((sp) => sp.id),
			['host', 'b', 'a'],
		);
		assert.equal(merged[1], all[1]);
		assert.equal(merged[2], all[0]);
	});

	it('keeps All-only speakers and skips malformed or repeated Speakers-view entries', () => {
		const merged = mergeSpeakerRosters(all, [
			{ id: 'b' },
			{ id: 'b' },
			null,
			'junk',
			{ id: '' },
			{ fullName: 'No id' },
		]);
		assert.deepEqual(
			merged.map((sp) => sp.id),
			['b', 'a'],
		);
	});

	it('returns the All roster unchanged without a Speakers view', () => {
		assert.equal(mergeSpeakerRosters(all, null), all);
		assert.equal(mergeSpeakerRosters(all, { speakers: [] }), all);
	});
});
