/**
 * Build-time lineup read.
 *
 * Imported only from `.astro` frontmatter, so it runs in Node during
 * `astro build` and never ships to the client — the browser keeps using
 * `lineup.ts` (`fetch('/api/lineup')`) for live refreshes.
 *
 * Why this exists: `/speakers`, `/sessions` and `/agenda` rendered entirely
 * client-side, so the HTML crawlers received contained zero speaker names and
 * zero talk titles — the highest-value keyword content on a conference site was
 * invisible to every crawler that does not execute JS, and delayed for the ones
 * that do. Reading the same cached endpoint here lets the islands ship
 * server-rendered markup and hydrate over it, and lets `getStaticPaths` mint a
 * real page per speaker and per session.
 *
 * Freshness: the built HTML is a snapshot of whenever the site was last built.
 * `refreshSessionizeScheduled` writes Firestore daily at 06:00 Europe/Prague and
 * `.github/workflows/scheduled-rebuild.yml` redeploys after it, so the static
 * copy trails the source by at most a day — and the islands re-fetch on load, so
 * a visitor always sees current data even mid-window.
 */
import { speakerFromDoc, type Speaker } from './speakers';
import { isAgendaSession, isDisplayableSession, sessionFromDoc, type Session } from './sessions';

/**
 * Origin serving `/api/lineup`. Defaults to production because that is the only
 * always-on copy of the data — PR previews and local builds legitimately read
 * live content. Override for a staging project.
 */
const ORIGIN = process.env.LINEUP_API_ORIGIN ?? 'https://devfest.cz';

/** Generous: this runs once per build, and a slow cold start beats an empty site. */
const TIMEOUT_MS = 20_000;

export interface BuildLineup {
	speakers: Speaker[];
	/** Talks only — mirrors `fetchLineup`, backing `/speakers` and `/sessions`. */
	sessions: Session[];
	/** Talks plus service/plenum bands — mirrors `fetchAgenda`, backing `/agenda`. */
	agendaSessions: Session[];
}

const EMPTY: BuildLineup = { speakers: [], sessions: [], agendaSessions: [] };

interface WireDoc {
	id?: unknown;
	[field: string]: unknown;
}

function parseDocs<T>(raw: unknown, parse: (id: string, data: Record<string, unknown>) => T): T[] {
	if (!Array.isArray(raw)) return [];
	return raw.map((item) => {
		const doc = (item ?? {}) as WireDoc;
		return parse(typeof doc.id === 'string' ? doc.id : '', doc as Record<string, unknown>);
	});
}

async function load(): Promise<BuildLineup> {
	// The a11y audit builds with no network and serves its own fixtures to the
	// islands at runtime; skip the fetch so the build doesn't wait out a timeout.
	if (process.env.A11Y_MOCK === '1') return EMPTY;

	const url = `${ORIGIN}/api/lineup`;
	try {
		const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const data = (await res.json()) as { speakers?: unknown; sessions?: unknown };

		// `lineupApi` already returns both collections `orderBy('order')`; sorting
		// again here just makes the build independent of that guarantee, so the
		// prerendered order can never disagree with the order the island fetches
		// (a disagreement would visibly re-shuffle the grid right after hydration).
		const byOrder = <T extends { order: number }>(items: T[]) =>
			items.slice().sort((a, b) => a.order - b.order);

		const speakers = byOrder(parseDocs(data.speakers, speakerFromDoc));
		const sessions = byOrder(parseDocs(data.sessions, sessionFromDoc));

		return {
			speakers,
			sessions: sessions.filter(isDisplayableSession),
			agendaSessions: sessions.filter(isAgendaSession),
		};
	} catch (err) {
		// Soft-fail on purpose. A hard failure would block every deploy — including
		// unrelated hotfixes — on an unrelated API outage, and the islands still
		// hydrate from `/api/lineup` in the browser, so visitors lose nothing. What
		// IS lost is the prerendered markup and the per-speaker/per-session routes,
		// which is why `scheduled-rebuild.yml` gates its deploy on the built output
		// actually containing those pages.
		console.warn(
			`[lineup-build] Could not read ${url} — building without prerendered lineup. ` +
				`Speaker/session detail pages will be MISSING from this build. Cause:`,
			err,
		);
		return EMPTY;
	}
}

let cached: Promise<BuildLineup> | null = null;

/**
 * The lineup as of build time. Memoised, so the half-dozen pages that need it
 * (`/speakers`, `/sessions`, `/agenda`, `/`, and both `[slug]` routes) share a
 * single HTTP round-trip per build rather than one each.
 */
export function getBuildLineup(): Promise<BuildLineup> {
	cached ??= load();
	return cached;
}
