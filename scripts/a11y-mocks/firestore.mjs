/**
 * Mock of the `firebase/firestore` surface the islands use, wired in only under
 * `A11Y_MOCK=1` (see astro.config.mjs). Replays scripts/a11y-mocks/fixtures.mjs
 * into `onSnapshot` / `getDoc` so the speakers + sessions ready-state renders
 * deterministically for the axe sweep. Exports exactly the names the components
 * and src/lib/firebase.ts import — nothing else.
 */
import { SESSIONS, SPEAKERS, SPEAKERS_BY_ID } from './fixtures.mjs';

const BY_PATH = {
	speakers: SPEAKERS,
	sessions: SESSIONS,
};

export function getFirestore() {
	return { __mock: 'firestore' };
}

export function collection(_db, path) {
	return { __path: path };
}

export function orderBy(field) {
	return { __orderBy: field };
}

export function query(coll) {
	// Constraints (orderBy) are ignored — fixtures are pre-ordered.
	return coll;
}

export function onSnapshot(ref, onNext) {
	const items = BY_PATH[ref?.__path] ?? [];
	const snapshot = {
		docs: items.map((it) => ({ id: it.id, data: () => it.data })),
	};
	// Async to mirror the real SDK (state flips after the mount effect commits).
	queueMicrotask(() => onNext(snapshot));
	return () => {};
}

export function doc(_db, coll, id) {
	return { __coll: coll, __id: id };
}

export function getDoc(ref) {
	const found = ref?.__coll === 'speakers' ? SPEAKERS_BY_ID[ref.__id] : undefined;
	return Promise.resolve({
		exists: () => Boolean(found),
		id: ref?.__id,
		data: () => found?.data ?? {},
	});
}
