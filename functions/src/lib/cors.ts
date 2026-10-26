/**
 * CORS for a public `/api/*` endpoint read cross-origin. Only the origins a
 * spec lists get `Access-Control-Allow-Origin`; every other caller (the site
 * itself is same-origin) gets the response unchanged. The response always
 * `Vary`s on `Origin`, so the Hosting CDN never serves one origin's headers to
 * another.
 */

import type { Request } from 'firebase-functions/v2/https';
import type { Response } from 'express';

export type AllowedOrigin = string | RegExp;

/** The `Origin` to echo back, or `null` when it is not on the list. */
export function allowedOrigin(
	origin: string | undefined,
	allowed: readonly AllowedOrigin[],
): string | null {
	if (!origin) return null;
	const ok = allowed.some((entry) =>
		typeof entry === 'string' ? entry === origin : entry.test(origin),
	);
	return ok ? origin : null;
}

/**
 * Set the CORS headers for a read-only (`GET`/`HEAD`) endpoint. Returns
 * `true` when the request was a preflight and has been answered.
 */
export function applyReadCors(
	req: Request,
	res: Response,
	allowed: readonly AllowedOrigin[],
): boolean {
	res.vary('Origin');
	const origin = allowedOrigin(req.get('Origin'), allowed);
	if (origin) res.set('Access-Control-Allow-Origin', origin);
	if (req.method !== 'OPTIONS' || !origin) return false;
	res.set('Access-Control-Allow-Methods', 'GET, HEAD');
	res.set('Access-Control-Max-Age', '86400');
	res.status(204).end();
	return true;
}
