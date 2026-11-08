/**
 * BUILD-TIME READS of the public production `/api/*` endpoints. Imported only
 * from `.astro` frontmatter and static endpoints, so it runs in Node during
 * `astro build` and never ships to the client. The build has no Firestore
 * credentials and needs none: it reads what any browser reads.
 *
 * Never throws. A failed read returns `null` and the page renders without
 * that data — the islands still load it live in the browser.
 *
 * An archive build (`npm run archive`) sets `ARCHIVE_DATA` to the directory
 * the edition's reads were frozen into and reads `<name>.json` from there:
 * production has moved on to the next edition.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const ORIGIN = 'https://devfest.cz';

/**
 * One GET of `/api/<name>` as JSON. `override` (an env var's value) points a
 * local build at another copy, a fixture server; the accessibility build
 * (`A11Y_MOCK=1`) runs on fixtures and reads nothing.
 */
export async function readStaticApi(name: string, override?: string): Promise<unknown> {
	if (process.env.A11Y_MOCK === '1') return null;
	if (process.env.ARCHIVE_DATA) return readFrozen(process.env.ARCHIVE_DATA, name);
	const url = override || `${ORIGIN}/api/${name}`;
	try {
		const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
		if (!res.ok) {
			console.warn(`[build] /api/${name} read failed: ${res.status}; building without it`);
			return null;
		}
		return await res.json();
	} catch (err) {
		console.warn(`[build] /api/${name} read failed: ${String(err)}; building without it`);
		return null;
	}
}

/** `<dir>/<name>.json`, or `null` when the archive froze no such read. */
async function readFrozen(dir: string, name: string): Promise<unknown> {
	try {
		return JSON.parse(await readFile(path.join(dir, `${name}.json`), 'utf8')) as unknown;
	} catch {
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
