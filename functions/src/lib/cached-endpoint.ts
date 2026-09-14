/**
 * Shared body of the public `/api/*` endpoints: Admin SDK read, JSON, two
 * cache layers (CDN `s-maxage` + a short in-instance memo that coalesces the
 * revalidation burst). A failed read is `no-store` 503 — never cached.
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
