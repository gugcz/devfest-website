/**
 * The shared shape of the public `/api/*` JSON endpoints (`lineupApi`,
 * `ticketsApi`).
 *
 * Both exist for the same reason (see either module's header): the browser must
 * not read Firestore/RTDB through the client SDK, because that blocks the first
 * read on an App Check token. Both therefore have the same job — read once via
 * the Admin SDK, serve JSON, cache hard — and had grown the same 40 lines
 * twice, differing only in TTLs.
 *
 * Two caching layers, and the order matters:
 *  - **CDN**: Firebase Hosting answers most requests at the edge from the
 *    `Cache-Control` `s-maxage`, so the function runs only on a miss or a
 *    revalidation.
 *  - **In-instance memo**: a warm instance coalesces the burst of revalidations
 *    it sees into one upstream read. Short TTL — the CDN is the real cache.
 *
 * A failed read is never cached (`no-store`) and answers 503 with an empty
 * payload, so the island renders its "unavailable" state and the next request
 * gets a fresh attempt instead of a poisoned edge entry.
 */

import { logger } from 'firebase-functions/v2';
import type { Response } from 'express';
import type { Request } from 'firebase-functions/v2/https';

import { describeError } from './errors.js';

export interface CachedEndpointSpec<T> {
	/** Function name, used as the log prefix. */
	name: string;
	/** `Cache-Control` for a successful response — the CDN TTL lives here. */
	cacheControl: string;
	/** In-instance memo lifetime. */
	memoTtlMs: number;
	/** Served with the 503 when the read fails; shape must match a real payload. */
	fallback: T;
	/** Reads the payload from the Admin SDK. */
	load: () => Promise<T>;
}

/**
 * Build the request handler for a cached JSON endpoint. Each call gets its own
 * memo, so two endpoints in one instance never share state.
 */
export function cachedJsonEndpoint<T>(
	spec: CachedEndpointSpec<T>,
): (req: Request, res: Response) => Promise<void> {
	let memo: { at: number; payload: T } | null = null;

	const load = async (): Promise<T> => {
		const now = Date.now();
		if (memo && now - memo.at < spec.memoTtlMs) return memo.payload;
		const payload = await spec.load();
		memo = { at: now, payload };
		return payload;
	};

	return async (_req, res) => {
		try {
			const payload = await load();
			res.set('Cache-Control', spec.cacheControl);
			res.json(payload);
		} catch (err) {
			logger.error(`${spec.name} read failed: ${describeError(err)}`, err);
			res.set('Cache-Control', 'no-store');
			res.status(503).json(spec.fallback);
		}
	};
}
