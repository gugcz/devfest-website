import { useEffect, useState } from 'react';

export type RemoteStatus = 'loading' | 'ready' | 'empty' | 'error';

export interface RemoteDataState<T> {
	status: RemoteStatus;
	data: T | null;
}

/**
 * The fetch state machine shared by every data-backed island: an
 * AbortController-guarded effect, `.catch(console.warn)`, and the
 * loading/ready/empty/error status each one used to re-derive by hand (see
 * R-D1 in the code review). `load` is handed the effect's `AbortSignal`
 * directly — `fetchLineup` / `fetchAgenda` / `fetchTickets` are already that
 * shape, so most call sites pass them straight through.
 *
 * Runs `load` once, on mount — none of the current call sites' `load`
 * closures depend on props/state that would need to re-trigger a fetch, so
 * this mirrors the `useEffect(() => { … }, [])` every copy used before.
 *
 * `opts.isEmpty` decides whether a successful load counts as `'ready'` or
 * `'empty'` — pass the same predicate the call site used to hand-roll (an
 * empty array, a `null` cache, …). Omit it for a call site that has no
 * concept of "empty" (it always resolves to `'ready'`).
 */
export function useRemoteData<T>(
	load: (signal: AbortSignal) => Promise<T>,
	opts: { isEmpty?: (data: T) => boolean; logLabel: string },
): RemoteDataState<T> {
	const [state, setState] = useState<RemoteDataState<T>>({ status: 'loading', data: null });

	useEffect(() => {
		const ac = new AbortController();
		load(ac.signal)
			.then((data) => {
				const empty = opts.isEmpty?.(data) ?? false;
				setState({ status: empty ? 'empty' : 'ready', data });
			})
			.catch((err) => {
				if (ac.signal.aborted) return;
				console.warn(opts.logLabel, err);
				setState((prev) => ({ ...prev, status: 'error' }));
			});
		return () => ac.abort();
		// Deliberately run once on mount: see the doc comment above.
	}, []);

	return state;
}
