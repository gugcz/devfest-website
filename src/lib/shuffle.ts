/** Fisher–Yates shuffle, returns a new array. Used so no session or speaker
 * gets a permanent top-of-page advantage. */
export function shuffle<T>(items: readonly T[]): T[] {
	const out = items.slice();
	for (let i = out.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[out[i], out[j]] = [out[j], out[i]];
	}
	return out;
}
