/**
 * Browser-side fetch of the speaker/session lineup.
 *
 * Hits the `/api/lineup` HTTP endpoint (Firebase Hosting rewrites it to the
 * `lineupApi` Cloud Function, CDN-cached) with a plain `fetch()` — NOT the
 * Firestore SDK — so there's no App Check / reCAPTCHA token to wait on. The
 * endpoint returns raw docs (`{ id, ...fields }`); we reuse the existing
 * `speakerFromDoc` / `sessionFromDoc` parsers so the shape logic lives in one
 * place.
 */
import { speakerFromDoc, type Speaker } from './speakers';
import { isAgendaSession, isDisplayableSession, sessionFromDoc, type Session } from './sessions';

export interface Lineup {
	speakers: Speaker[];
	sessions: Session[];
}

const ENDPOINT = '/api/lineup';

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

async function fetchDocs(signal?: AbortSignal): Promise<{ speakers: unknown; sessions: unknown }> {
	const res = await fetch(ENDPOINT, { signal });
	if (!res.ok) throw new Error(`lineup fetch failed: ${res.status}`);
	return (await res.json()) as { speakers?: unknown; sessions?: unknown };
}

/** Fetch and parse the lineup for `/sessions`. Throws on a non-OK response so
 * callers can show their error state; an empty (but healthy) response parses to
 * empty arrays. Service sessions are dropped via `isDisplayableSession`. */
export async function fetchLineup(signal?: AbortSignal): Promise<Lineup> {
	const data = await fetchDocs(signal);
	return {
		speakers: parseDocs(data.speakers, speakerFromDoc),
		sessions: parseDocs(data.sessions, sessionFromDoc).filter(isDisplayableSession),
	};
}

/**
 * Same `/api/lineup` read as {@link fetchLineup}, but for the `/agenda`
 * timetable: sessions are filtered by `isAgendaSession`, which KEEPS service +
 * plenum sessions (breaks / lunch / registration / keynote) so they can render
 * as full-width bands. `fetchLineup` is left untouched so `/sessions` still
 * hides them.
 */
export async function fetchAgenda(signal?: AbortSignal): Promise<Lineup> {
	const data = await fetchDocs(signal);
	return {
		speakers: parseDocs(data.speakers, speakerFromDoc),
		sessions: parseDocs(data.sessions, sessionFromDoc).filter(isAgendaSession),
	};
}
