/**
 * Mock of the `firebase/database` surface the islands use, wired in only under
 * `A11Y_MOCK=1` (see astro.config.mjs). Replays the ticket cache from
 * scripts/a11y-mocks/fixtures.mjs into `onValue` so the Tickets island renders
 * its full pricing-wave roadmap for the axe sweep.
 */
import { TICKETS } from './fixtures.mjs';

const BY_PATH = {
	tickets: TICKETS,
};

export function getDatabase() {
	return { __mock: 'database' };
}

export function ref(_db, path) {
	return { __path: path };
}

export function onValue(reference, onNext) {
	const value = BY_PATH[reference?.__path] ?? null;
	queueMicrotask(() => onNext({ val: () => value }));
	return () => {};
}
