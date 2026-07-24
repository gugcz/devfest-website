/**
 * Mock of the `firebase-admin` surface `src/lib/firebase-admin.ts` uses, wired in
 * only under `A11Y_MOCK=1` (see astro.config.mjs — aliased for both
 * `firebase-admin/app` and `firebase-admin/firestore`). Replays
 * scripts/a11y-mocks/fixtures.mjs so the server-side speaker/session reads (the
 * /speakers + /sessions grids and the homepage teaser) resolve deterministically
 * during the mock build, and the prerendered ready-state HTML gets audited.
 *
 * Exports exactly the names `firebase-admin.ts` imports — nothing else.
 */
import { SESSIONS, SPEAKERS } from './fixtures.mjs';

const BY_PATH = {
	speakers: SPEAKERS,
	sessions: SESSIONS,
};

// firebase-admin/app
export function initializeApp() {
	return { __mock: 'admin-app' };
}
export function getApps() {
	return [];
}

// firebase-admin/firestore — the query chain the callers use is
// `collection(path).orderBy(field).get()`. Constraints are ignored; fixtures are
// pre-ordered by `order`, matching the real `orderBy('order')`.
function makeQuery(path) {
	return {
		orderBy() {
			return this;
		},
		async get() {
			const items = BY_PATH[path] ?? [];
			return {
				docs: items.map((it) => ({ id: it.id, data: () => it.data })),
			};
		},
	};
}

export function getFirestore() {
	return {
		collection(path) {
			return makeQuery(path);
		},
	};
}
