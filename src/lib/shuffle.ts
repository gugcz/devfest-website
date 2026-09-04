/**
 * Fisher–Yates shuffle — returns a new array so the source order stays intact.
 *
 * Used wherever a list must not give one entry a permanent top-of-page
 * advantage: the session grid is randomized once per page load, and the home
 * page's speaker wall starts on a random set rather than the first four by
 * `order`.
 */
export function shuffle<T>(items: readonly T[]): T[] {
	const out = items.slice();
	for (let i = out.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[out[i], out[j]] = [out[j], out[i]];
	}
	return out;
}
