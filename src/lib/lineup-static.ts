/**
 * BUILD-TIME LINEUP for the share pages (`/talks/<id>`, `/speakers/<id>`),
 * the no-script lineup and programme on `/speakers`, `/agenda` and
 * `/workshops`, and `/llms.txt`. Reads the same public `/api/lineup` the
 * browser does, from production (`static-api.ts`).
 *
 * A failed read is an empty lineup: no share pages are built, and `404.astro`
 * forwards their links to the sheet instead — the link still works, only the
 * preview falls back to the site's own.
 */
import { speakerFromDoc, type Speaker } from './speakers';
import { isDisplayableSession, roomFromDoc, sessionFromDoc, type Room, type Session } from './sessions';
import { isShareId } from './share';
import { readStaticApi } from './static-api';

export interface StaticLineup {
	speakers: Speaker[];
	sessions: Session[];
	rooms: Room[];
}

function docs<T>(raw: unknown, parse: (id: string, data: Record<string, unknown>) => T): T[] {
	if (!Array.isArray(raw)) return [];
	return raw.flatMap((item) => {
		const doc = (item ?? {}) as Record<string, unknown>;
		return typeof doc.id === 'string' && isShareId(doc.id) ? [parse(doc.id, doc)] : [];
	});
}

async function load(): Promise<StaticLineup> {
	// `DEVFEST_LINEUP_URL` points a local build at another copy (a fixture server).
	const data = ((await readStaticApi('lineup', process.env.DEVFEST_LINEUP_URL)) ?? {}) as {
		speakers?: unknown;
		sessions?: unknown;
		rooms?: unknown;
	};
	return {
		speakers: docs(data.speakers, speakerFromDoc).filter((sp) => sp.fullName.trim()),
		sessions: docs(data.sessions, sessionFromDoc).filter(isDisplayableSession),
		rooms: docs(data.rooms, roomFromDoc).filter((room): room is Room => room !== null),
	};
}

// One read per build, shared by every page that renders the lineup.
let memo: Promise<StaticLineup> | null = null;
export function staticLineup(): Promise<StaticLineup> {
	memo ??= load();
	return memo;
}
