/**
 * BUILD-TIME LINEUP for the share pages (`/talks/<id>`, `/speakers/<id>`).
 * Imported only from `.astro` frontmatter, so it runs in Node during
 * `astro build` and never ships to the client. Reads the same public
 * `/api/lineup` the browser does, from production: the build has no Firestore
 * credentials and needs none.
 *
 * Never throws. A failed read builds no share pages, and `404.astro` forwards
 * their links to the sheet instead — the link still works, only the preview
 * falls back to the site's own.
 */
import { speakerFromDoc, type Speaker } from './speakers';
import { isDisplayableSession, sessionFromDoc, type Session } from './sessions';
import { isShareId } from './share';

// `DEVFEST_LINEUP_URL` points a local build at another copy (a fixture server).
const ENDPOINT = process.env.DEVFEST_LINEUP_URL || 'https://devfest.cz/api/lineup';

export interface StaticLineup {
	speakers: Speaker[];
	sessions: Session[];
}

const EMPTY: StaticLineup = { speakers: [], sessions: [] };

function docs<T>(raw: unknown, parse: (id: string, data: Record<string, unknown>) => T): T[] {
	if (!Array.isArray(raw)) return [];
	return raw.flatMap((item) => {
		const doc = (item ?? {}) as Record<string, unknown>;
		return typeof doc.id === 'string' && isShareId(doc.id) ? [parse(doc.id, doc)] : [];
	});
}

async function load(): Promise<StaticLineup> {
	// The accessibility build runs on fixtures and never visits these pages.
	if (process.env.A11Y_MOCK === '1') return EMPTY;
	try {
		const res = await fetch(ENDPOINT, { signal: AbortSignal.timeout(15_000) });
		if (!res.ok) {
			console.warn(`[share pages] lineup read failed: ${res.status}; building none`);
			return EMPTY;
		}
		const data = (await res.json()) as { speakers?: unknown; sessions?: unknown };
		return {
			speakers: docs(data.speakers, speakerFromDoc).filter((sp) => sp.fullName.trim()),
			sessions: docs(data.sessions, sessionFromDoc).filter(isDisplayableSession),
		};
	} catch (err) {
		console.warn(`[share pages] lineup read failed: ${String(err)}; building none`);
		return EMPTY;
	}
}

// One read per build, shared by both routes' `getStaticPaths`.
let memo: Promise<StaticLineup> | null = null;
export function staticLineup(): Promise<StaticLineup> {
	memo ??= load();
	return memo;
}
