/**
 * BUILD-TIME WORKSHOPS for the no-script list on `/workshops` and
 * `/llms.txt`: which sessions are open for sign-up (a seat limit is set),
 * read from the public `/api/workshops` (`static-api.ts`). Seat counts are
 * left to the live page; a build-time count would be stale within minutes.
 */
import type { Session } from './sessions';
import { readStaticApi } from './static-api';

/** Open workshops in programme order; empty when the read failed. */
export async function staticWorkshops(sessions: Session[]): Promise<Session[]> {
	const raw = ((await readStaticApi('workshops', process.env.DEVFEST_WORKSHOPS_URL)) ?? {}) as {
		workshops?: Record<string, { limit?: unknown }>;
	};
	const open = new Set(
		Object.entries(raw.workshops ?? {})
			.filter(([, seats]) => typeof seats?.limit === 'number' && seats.limit > 0)
			.map(([id]) => id),
	);
	return sessions.filter((session) => open.has(session.id)).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}
