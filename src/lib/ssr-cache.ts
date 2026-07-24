/**
 * Cache-Control policy for the on-demand speaker/session routes, in one place so
 * `speakers.astro` and `sessions.astro` can't drift.
 *
 * Firebase Hosting serves dynamic (function) responses as `private` — uncached —
 * unless the handler sets `Cache-Control` explicitly. A *populated* render is
 * safe to cache at the edge (the lineup changes ~daily); a *failed or empty*
 * read must never be cached, or a transient Firestore blip would pin the
 * "temporarily unavailable" / "announced soon" state at the CDN for the full TTL.
 */

// ~1h fresh at the edge, then served stale for up to a day while a background
// revalidation refreshes — matches the daily cadence of `refreshSessionize`.
const POPULATED = 'public, s-maxage=3600, stale-while-revalidate=86400';

/**
 * Apply the content cache policy to an on-demand response. Pass `ok = true` only
 * when the render has real data; a failed/empty read is marked `no-store`.
 */
export function applyContentCache(response: { headers: Headers }, ok: boolean): void {
	response.headers.set('Cache-Control', ok ? POPULATED : 'no-store');
}
