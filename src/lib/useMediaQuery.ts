import { useEffect, useState } from 'react';

/** `window.matchMedia(query).matches`, live. `false` on the server and on
 * the first client render — the island hydrates, then reads the media. */
export function useMediaQuery(query: string): boolean {
	const [matches, setMatches] = useState(false);
	useEffect(() => {
		const mql = window.matchMedia(query);
		const update = () => setMatches(mql.matches);
		update();
		mql.addEventListener('change', update);
		return () => mql.removeEventListener('change', update);
	}, [query]);
	return matches;
}

export const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

export function usePrefersReducedMotion(): boolean {
	return useMediaQuery(REDUCED_MOTION);
}
