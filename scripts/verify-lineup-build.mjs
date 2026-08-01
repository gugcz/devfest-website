/**
 * Post-build guard: fail the deploy if the lineup did not make it into `dist`.
 *
 * `src/lib/lineup-build.ts` soft-fails on purpose — a `/api/lineup` outage must
 * not block an unrelated hotfix from shipping. The cost of that choice is that a
 * build can quietly produce a site with no prerendered speakers, and deploying
 * it would pull already-indexed content (and, after the detail routes land,
 * already-indexed URLs) out from under Google.
 *
 * So the tolerance lives here instead: the build stays green, and the deploy
 * step refuses to publish a `dist` that lost content the API is still serving.
 * The previous deploy stays live, and the next scheduled run self-heals.
 *
 * Passes when the API itself reports an empty roster — "no speakers announced
 * yet" is a legitimate state, not a regression.
 *
 * Usage: node scripts/verify-lineup-build.mjs [distDir]
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const DIST = process.argv[2] ?? 'dist';
const ORIGIN = process.env.LINEUP_API_ORIGIN ?? 'https://devfest.cz';
const SPEAKERS_PAGE = join(DIST, 'speakers', 'index.html');

/** Undo the entity escaping Astro applies to text nodes, so names with
 * apostrophes/ampersands still compare equal. */
function decode(html) {
	return html
		.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
		.replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
		.replace(/&quot;/g, '"')
		.replace(/&apos;/g, "'")
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&amp;/g, '&');
}

function fail(message) {
	console.error(`\n✗ ${message}\n`);
	process.exit(1);
}

const url = `${ORIGIN}/api/lineup`;
let expected = [];
try {
	const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	const data = await res.json();
	expected = (Array.isArray(data.speakers) ? data.speakers : [])
		.map((doc) => (typeof doc?.fullName === 'string' ? doc.fullName.trim() : ''))
		.filter(Boolean);
} catch (err) {
	// The API being unreachable from CI tells us nothing about `dist`. Deploying
	// is the lesser risk: the build either has last-good prerendered content or
	// the islands fall back to fetching at runtime, same as before this guard.
	console.warn(`⚠ Could not reach ${url} to verify the build (${err}). Skipping check.`);
	process.exit(0);
}

if (expected.length === 0) {
	console.log('✓ Lineup API reports no speakers yet — nothing to verify.');
	process.exit(0);
}

let page;
try {
	page = decode(await readFile(SPEAKERS_PAGE, 'utf8'));
} catch {
	fail(`${SPEAKERS_PAGE} is missing — the build did not produce a speakers page.`);
}

const missing = expected.filter((name) => !page.includes(name));
if (missing.length > 0) {
	fail(
		`${missing.length}/${expected.length} speakers are missing from ${SPEAKERS_PAGE}:\n` +
			missing.map((name) => `    - ${name}`).join('\n') +
			`\n\n  The build could not read ${url}, so it produced a site with no ` +
			`prerendered lineup.\n  Refusing to deploy over the live site. Re-run once the API is healthy.`,
	);
}

console.log(`✓ All ${expected.length} speakers are prerendered into ${SPEAKERS_PAGE}.`);
