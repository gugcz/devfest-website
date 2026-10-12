/**
 * Workshop seats, as RTDB holds them:
 *
 *     /workshops/{sessionId}/limit                    ← set by hand in the console
 *     /workshops/{sessionId}/registrations/{uid}      ← written by the callable
 *
 * A workshop opens for registration the moment its `limit` is written; the
 * key is the Sessionize session id, so it lines up with `/api/lineup`. There
 * is no separate waitlist: registrations are ordered by `at` and the first
 * `limit` of them hold a seat. Someone leaving moves the next one up without
 * any write, and raising the limit seats the waitlist the same way.
 *
 * Pure: no Admin SDK, so the tests run it directly.
 */

export const WORKSHOPS_PATH = 'workshops';

export interface Registration {
	/** Epoch ms of the sign-up — the queue order. */
	at: number;
	name: string;
	email: string;
	/** ti.to registration reference (`ABCD-1`) the attendee logged in with. */
	reference: string;
}

export interface WorkshopNode {
	limit?: unknown;
	registrations?: Record<string, Partial<Registration>> | null;
}

/** What anyone may see about a workshop: seats, not people. */
export interface WorkshopSeats {
	limit: number;
	/** Seats held, capped at `limit`. */
	taken: number;
	/** Registrations past the limit. */
	waiting: number;
}

/** A positive whole number, or `null` — a limit typed in the console can
 * arrive as a string, and anything else means "not open". */
export function parseLimit(raw: unknown): number | null {
	const n = typeof raw === 'string' ? Number(raw.trim()) : raw;
	return typeof n === 'number' && Number.isInteger(n) && n > 0 ? n : null;
}

/** uids in queue order: earliest first, uid breaking a same-ms tie. */
export function queue(node: WorkshopNode): string[] {
	const regs = node.registrations ?? {};
	const at = (uid: string) => Number(regs[uid]?.at) || 0;
	return Object.keys(regs).sort((a, b) => at(a) - at(b) || a.localeCompare(b));
}

export function seats(node: WorkshopNode): WorkshopSeats | null {
	const limit = parseLimit(node.limit);
	if (limit === null) return null;
	const count = queue(node).length;
	return { limit, taken: Math.min(count, limit), waiting: Math.max(0, count - limit) };
}

/** Every open workshop's seats, keyed by session id. */
export function allSeats(tree: Record<string, WorkshopNode> | null): Record<string, WorkshopSeats> {
	const out: Record<string, WorkshopSeats> = {};
	for (const [id, node] of Object.entries(tree ?? {})) {
		const s = seats(node ?? {});
		if (s) out[id] = s;
	}
	return out;
}

export type Standing = { state: 'confirmed' } | { state: 'waiting'; position: number } | { state: 'none' };

/** Where `uid` stands in a workshop: seated, n-th on the waitlist, or absent. */
export function standing(node: WorkshopNode, uid: string): Standing {
	const limit = parseLimit(node.limit) ?? 0;
	const index = queue(node).indexOf(uid);
	if (index < 0) return { state: 'none' };
	if (index < limit) return { state: 'confirmed' };
	return { state: 'waiting', position: index - limit + 1 };
}
