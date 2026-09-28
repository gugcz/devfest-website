/** Room mirror: `extractRooms`. */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { extractRooms } from './sessionize-api.js';

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
