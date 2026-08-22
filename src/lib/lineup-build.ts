/**
 * Build-time read of the speaker/session lineup.
 *
 * Why this exists: `/speakers`, `/sessions` and `/agenda` are three of the most
 * search-valuable pages on the site — speaker names and talk titles are exactly
 * what people search for — and until now their HTML contained a heading and a
 * "loading" paragraph. Everything else arrived from `/api/lineup` after
 * hydration. Googlebot renders JavaScript and would eventually see it; nothing
 * else in the crawler population reliably does (Bing, Slack/social unfurls, the
 * LLM crawlers), and even Google indexes the pre-render first.
 *
 * So the same endpoint the browser hits is read once at build time and passed
 * into the islands as their initial state. Astro server-renders `client:load`
 * components, so the lineup lands in the static HTML; the island's own
 * `fetch('/api/lineup')` still runs on mount and replaces the snapshot, which is
 * what keeps a visitor current between deploys. The snapshot is only ever as
 * fresh as the last build — that is fine for crawlers and invisible to humans.
 *
 * A failed read is loud, and on a CI build it is FATAL (see the catch at the
 * bottom of this file): a green deploy that silently drops every speaker and
 * talk out of the HTML and deletes the `ItemList` graphs is worse than a red
 * one. `LINEUP_BUILD_OPTIONAL=1` — which the PR-preview workflow sets, and the
 * production workflow exposes as its `skip_lineup` input — downgrades it to the
 * warning-and-empty-arrays behaviour, i.e. exactly the state these pages
 * shipped in before this module existed. Outside CI it is always a warning.
 */
import { parseDocs } from './lineup';
import { speakerFromDoc, type Speaker } from './speakers';
import { isAgendaSession, isDisplayableSession, sessionFromDoc, type Session } from './sessions';

export interface BuildLineup {
	speakers: Speaker[];
	/** Visitor-facing talks — service sessions dropped (`/sessions`). */
	sessions: Session[];
	/** Timetable sessions — breaks/keynotes kept (`/agenda`). */
	agenda: Session[];
}

const EMPTY: BuildLineup = { speakers: [], sessions: [], agenda: [] };

/** Overridable so a preview build can point at another origin. */
const ENDPOINT = process.env.LINEUP_BUILD_ENDPOINT ?? 'https://devfest.cz/api/lineup';

/**
 * The dev server and the a11y build already serve `/api/*` from
 * `scripts/a11y-mocks/api.mjs` (see astro.config.mjs). Read the same module
 * directly here rather than fetching production, so what the page pre-renders
 * locally matches what the island fetches locally.
 *
 * `__DEVFEST_API_FIXTURES__` is defined by that same dev-server plugin and by
 * nothing else, which is the point. Do NOT re-derive dev-ness here from
 * `import.meta.env.DEV` or `NODE_ENV`: both resolve from `process.env.NODE_ENV`
 * (Vite sets `DEV` from it even for a build), so any shell exporting
 * NODE_ENV=development would make a production build publish these fixtures as
 * the real lineup — Ada Lovelace and Alan Turing in the HTML and the JSON-LD,
 * exit code 0. A `apply: 'serve'` plugin cannot run during a build, so a flag
 * it defines cannot be true during one.
 */
declare const __DEVFEST_API_FIXTURES__: boolean | undefined;

const useFixtures =
	process.env.A11Y_MOCK === '1' ||
	(typeof __DEVFEST_API_FIXTURES__ !== 'undefined' && __DEVFEST_API_FIXTURES__ === true);

/** Thrown for a non-OK response, carrying the status so the retry can judge it. */
class HttpStatusError extends Error {
	constructor(readonly status: number) {
		super(`lineup build fetch failed: ${status}`);
	}
}

async function fetchOnce(): Promise<{ speakers?: unknown; sessions?: unknown }> {
	// A hung endpoint must not hang the build.
	const res = await fetch(ENDPOINT, { signal: AbortSignal.timeout(15_000) });
	if (!res.ok) throw new HttpStatusError(res.status);
	return (await res.json()) as { speakers?: unknown; sessions?: unknown };
}

const ATTEMPTS = 3;
/** Backoff before attempt N+1: 1s, then 2s. */
const RETRY_BASE_DELAY_MS = 1_000;

/** A 4xx is deterministic — a wrong URL or a removed route does not heal. */
function isRetryable(err: unknown): boolean {
	if (!(err instanceof HttpStatusError)) return true; // network fault / bad body
	return err.status === 429 || err.status >= 500;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function readRaw(): Promise<{ speakers?: unknown; sessions?: unknown }> {
	if (useFixtures) {
		// A dev server takes this path constantly and says so in its own banner;
		// a BUILD taking it means A11Y_MOCK is set, and a fixture-backed build
		// that reaches `dist/` publishes invented people as the lineup. Say so.
		if (typeof __DEVFEST_API_FIXTURES__ === 'undefined') {
			console.warn(
				`\n[lineup-build] ⚠ A11Y_MOCK=1 — pre-rendering the lineup from FIXTURES.\n` +
					`[lineup-build]   This output must not be deployed (\`npm run a11y\` builds to dist-a11y).\n`
			);
		}
		const { API_FIXTURES } = await import('../../scripts/a11y-mocks/api.mjs');
		return JSON.parse(API_FIXTURES['/api/lineup']);
	}
	// Same shape as `functions/src/lib/http.ts`: 3 attempts, 1s/2s backoff, and
	// no retry on a 4xx. The read is a CI-fatal gate now, so a retry that fires
	// 3ms later — before a cold start finishes or a CDN revalidation race
	// settles — turns transient faults into red builds without absorbing any of
	// them. A GET is idempotent, so retrying is free.
	let lastError: unknown;
	for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
		try {
			return await fetchOnce();
		} catch (err) {
			lastError = err;
			if (attempt === ATTEMPTS || !isRetryable(err)) break;
			const delay = RETRY_BASE_DELAY_MS * attempt;
			console.warn(`[lineup-build] ${describe(err)} — retrying in ${delay}ms (${attempt}/${ATTEMPTS - 1})`);
			await sleep(delay);
		}
	}
	throw lastError;
}

function describe(err: unknown): string {
	if (!(err instanceof Error)) return String(err);
	// undici reports every network fault as "fetch failed" and hides the real
	// reason (ENOTFOUND, UND_ERR_CONNECT_TIMEOUT, …) in `cause`. Same reasoning
	// as `functions/src/lib/errors.ts`, which is not importable from here.
	const cause = (err as { cause?: unknown }).cause as
		| { code?: unknown; errors?: Array<{ code?: unknown }> }
		| undefined;
	// A refused connection arrives as an AggregateError whose per-address errors
	// carry the code, so read through that too.
	// `errors` is only an array on an AggregateError; anything else reaching this
	// path would make `.find` throw from inside the handler that is supposed to
	// be producing the failure message.
	const aggregated = Array.isArray(cause?.errors) ? cause.errors.find((e) => e?.code) : undefined;
	const code = cause?.code ?? aggregated?.code;
	return code ? `${err.message} (${String(code)})` : err.message;
}

/**
 * One read per build, shared by `/speakers`, `/sessions` and `/agenda`.
 *
 * Only a SUCCESSFUL read is memoised. A build renders every page in one pass,
 * so the difference is invisible there — but `astro dev` keeps this module for
 * the whole session, and caching the failure meant one blip with
 * `DEVFEST_LIVE_API=1` left every later render (and every edit-reload) with no
 * pre-rendered lineup and no explanation until the server was restarted.
 */
let inflight: Promise<BuildLineup> | null = null;

export function getBuildLineup(): Promise<BuildLineup> {
	inflight ??= readRaw()
		.then((data) => {
			const speakers = parseDocs(data.speakers, speakerFromDoc);
			const all = parseDocs(data.sessions, sessionFromDoc);
			return {
				speakers,
				sessions: all.filter(isDisplayableSession),
				agenda: all.filter(isAgendaSession),
			};
		})
		.catch((err) => {
			// Loud, and fatal in CI. A silent fallback here is a green deploy that
			// quietly drops every speaker and talk out of the HTML *and* deletes
			// the ItemList graphs — the exact symptom Search Console reports as
			// items disappearing, with nothing in the build log to explain it. The
			// only automated check on a PR is `npm run a11y`, which runs against
			// fixtures and can never catch this.
			//
			// Set LINEUP_BUILD_OPTIONAL=1 to ship anyway (an urgent hosting deploy
			// while `/api/lineup` is down is a legitimate thing to want).
			const reason = describe(err);
			console.error(
				`\n[lineup-build] ✗ Could not read ${ENDPOINT}: ${reason}\n` +
					`[lineup-build]   /speakers, /sessions and /agenda will ship WITHOUT their\n` +
					`[lineup-build]   pre-rendered lineup and WITHOUT their structured data.\n`
			);
			if (process.env.CI) {
				if (process.env.LINEUP_BUILD_OPTIONAL !== '1') {
					throw new Error(
						`lineup pre-render failed in CI: ${reason} — re-run this workflow with the ` +
							`\`skip_lineup\` input (or set LINEUP_BUILD_OPTIONAL=1) to deploy without it`
					);
				}
				// A green run whose log says "✓ Complete" forty lines after the
				// banner is how a LINEUP_BUILD_OPTIONAL left switched on goes
				// unnoticed for a month. An annotation surfaces in the run summary.
				console.log(
					`::warning title=Lineup pre-render skipped::${reason} — /speakers, /sessions and /agenda ` +
						`shipped without their pre-rendered lineup and structured data`
				);
			}
			inflight = null;
			return EMPTY;
		});
	return inflight;
}
