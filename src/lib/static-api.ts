/**
 * BUILD-TIME READS of the public production `/api/*` endpoints. Imported only
 * from `.astro` frontmatter and static endpoints, so it runs in Node during
 * `astro build` and never ships to the client. The build has no Firestore
 * credentials and needs none: it reads what any browser reads.
 *
 * Never throws. A failed read returns `null` and the page renders without
 * that data — the islands still load it live in the browser.
 */

const ORIGIN = 'https://devfest.cz';

/**
 * One GET of `/api/<path>` as JSON. `override` (an env var's value) points a
 * local build at another copy, a fixture server; the accessibility build
 * (`A11Y_MOCK=1`) runs on fixtures and reads nothing.
 */
export async function readStaticApi(path: string, override?: string): Promise<unknown> {
	if (process.env.A11Y_MOCK === '1') return null;
	const url = override || `${ORIGIN}/api/${path}`;
	try {
		const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
		if (!res.ok) {
			console.warn(`[build] /api/${path} read failed: ${res.status}; building without it`);
			return null;
		}
		return await res.json();
	} catch (err) {
		console.warn(`[build] /api/${path} read failed: ${String(err)}; building without it`);
		return null;
	}
}

/** The day the build read the API, for "as of" lines next to what it read. */
export const BUILD_DAY = new Intl.DateTimeFormat('en-GB', {
	day: 'numeric',
	month: 'long',
	year: 'numeric',
	timeZone: 'Europe/Prague',
}).format(new Date());
