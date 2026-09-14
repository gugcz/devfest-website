import { useEffect, useState } from 'react';

/** The four states of every data-backed island; each maps to one branch of
 * `DataState` (`loading` / `error` / `empty`) or the real render. */
export type RemoteStatus = 'loading' | 'ready' | 'empty' | 'error';

export interface Remote<T> {
	status: RemoteStatus;
	/** The last successful payload; `null` until the first one lands. Kept
	 * across a later `error` so a stale roster beats an empty screen. */
	data: T | null;
}

/**
 * One fetch on mount, aborted on unmount, into `{ status, data }`. Every
 * island used to inline the same AbortController / then / catch / warn
 * block; the only real variation was the fetcher and the "empty" test.
 *
 * `load` runs exactly once — it is read at mount, so an inline arrow is
 * fine. `isEmpty` decides `empty` vs `ready` on a successful load.
 */
export function useRemote<T>(
	load: (signal: AbortSignal) => Promise<T>,
	tag: string,
	isEmpty: (data: T) => boolean,
): Remote<T> {
	const [remote, setRemote] = useState<Remote<T>>({ status: 'loading', data: null });

	useEffect(() => {
		const ac = new AbortController();
		load(ac.signal)
			.then((data) => {
				setRemote({ status: isEmpty(data) ? 'empty' : 'ready', data });
			})
			.catch((err) => {
				if (ac.signal.aborted) return;
				console.warn(`[${tag}] Failed to load:`, err);
				setRemote((prev) => ({ ...prev, status: 'error' }));
			});
		return () => ac.abort();
		// Mount-only by design: see the doc comment.
	}, []);

	return remote;
}
