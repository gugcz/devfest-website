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
	// The memo holds the PROMISE, not the result: concurrent misses on a cold
	// instance (the CDN revalidation burst) share one Admin SDK read instead of
	// each issuing their own. A rejected promise is dropped so the next request
	// retries rather than serving the failure for the whole TTL.
	let memo: { at: number; payload: Promise<T> } | null = null;

	const load = (): Promise<T> => {
		const now = Date.now();
		if (memo && now - memo.at < spec.memoTtlMs) return memo.payload;
		const payload = spec.load();
		memo = { at: now, payload };
		payload.catch(() => {
			if (memo?.payload === payload) memo = null;
		});
		return payload;
	};

	return async (req, res) => {
		// Read-only endpoint; nothing else is routed here.
		if (req.method !== 'GET' && req.method !== 'HEAD') {
			res.set('Allow', 'GET, HEAD');
			res.status(405).send('Method Not Allowed');
			return;
		}
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
