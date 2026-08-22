import { useEffect, useState } from 'react';

/**
 * The lifecycle every pre-rendered lineup island shares: seed from the
 * server-rendered props, refetch on mount, and degrade only when there is
 * nothing on screen to lose.
 *
 * It exists as one hook because it was three hand-rolled copies (Speakers,
 * Sessions, Agenda) and they had already drifted — the Sessions copy grew an
 * order-preserving short-circuit that could strand the island on its loading
 * state and could throw away freshly fetched data. Anything that changes about
 * this policy (a staleness marker, a revalidation interval, a retry) belongs
 * here, once.
 *
 * See `src/lib/lineup-build.ts` for why the islands are handed data as props at
 * all.
 */
export type PrerenderStatus = 'loading' | 'ready' | 'empty' | 'error';

export interface PrerenderedFetch<T> {
	status: PrerenderStatus;
	items: T[];
}

export function usePrerenderedFetch<T>({
	initial,
	load,
	label,
	order,
}: {
	/** Server-rendered items. Empty means the build-time read found nothing. */
	initial: T[];
	/** The runtime read. Rejects → the island keeps whatever it already shows. */
	load: (signal: AbortSignal) => Promise<T[]>;
	/** Log prefix, e.g. `speakers`. */
	label: string;
	/**
	 * Optional re-ordering of the FRESH items, given the order currently on
	 * screen. It may reorder, never substitute: returning the previous array
	 * would pin the page to the build-time snapshot and silently discard the
	 * updates the refetch exists to deliver.
	 */
	order?: (next: T[], current: T[]) => T[];
}): PrerenderedFetch<T> {
	// Lazy initialiser: the prop is read on the first render only, so a refetch
	// can never be clobbered by it.
	const [state, setState] = useState<PrerenderedFetch<T>>(() =>
		initial.length > 0 ? { status: 'ready', items: initial } : { status: 'loading', items: [] },
	);

	// Mount-only, like the hand-rolled effects it replaces: `load` and `order`
	// are closures the island redefines every render, and re-running on their
	// identity would refetch on every keystroke in the session filter.
	useEffect(() => {
		const ac = new AbortController();
		load(ac.signal)
			.then((next) => {
				// Status always follows the response, so an endpoint that has gone
				// empty resolves to the empty state rather than leaving a page that
				// started empty spinning forever.
				setState((prev) => ({
					status: next.length > 0 ? 'ready' : 'empty',
					items: order ? order(next, prev.items) : next,
				}));
			})
			.catch((err) => {
				if (ac.signal.aborted) return;
				console.warn(`[${label}] Failed to load lineup:`, err);
				// A failed refetch must not delete what the server already rendered.
				// These pages ship the lineup in their HTML, so falling straight into
				// the error state would take a fully-painted grid off the screen a
				// moment after it appeared — and hand a JS-rendering crawler an error
				// string in place of the content it was just given.
				setState((prev) => (prev.items.length > 0 ? prev : { ...prev, status: 'error' }));
			});
		return () => ac.abort();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return state;
}
