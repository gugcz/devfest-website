import { useEffect, useState } from 'react';

/** Shared by `usePrefersReducedMotion` below and `Speakers.tsx`'s imperative
 * one-shot `canMorph()` check — same query text, one place. */
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * React to a `matchMedia` query, updating live as it flips. Three components
 * had their own copy of this exact effect (`addEventListener('change', …)`
 * + an initial sync read) for three different queries.
 */
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

/** Whether the visitor has asked for reduced motion — reactive, unlike the
 * one-shot check `Speakers.tsx`'s `canMorph()` does inside a click handler
 * (which stays imperative on purpose; it reads the same query text). */
export function usePrefersReducedMotion(): boolean {
	return useMediaQuery(REDUCED_MOTION_QUERY);
}
