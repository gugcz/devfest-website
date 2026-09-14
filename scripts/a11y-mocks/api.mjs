/**
 * The `/api/*` payloads, built once from the fixtures. Two consumers, one
 * source: `scripts/a11y.mjs` (axe sweep) and `astro.config.mjs` (dev server).
 *
 * In production these routes are Hosting rewrites to `lineupApi` /
 * `ticketsApi`; a dev server has no rewrite table, so without this the
 * islands 404 and render "unavailable" forever.
 *
 * Shapes mirror the real endpoints — raw docs (`{ id, ...fields }`) for the
 * lineup, the RTDB cache verbatim for tickets — so the browser runs its own
 * parsers exactly as against the live functions.
 */
import { SPEAKERS, SESSIONS, TICKETS } from './fixtures.mjs';

/** Route → JSON body. Keys are exact pathnames, query strings stripped. */
export const API_FIXTURES = {
	'/api/lineup': JSON.stringify({
		speakers: SPEAKERS.map((s) => ({ id: s.id, ...s.data })),
		sessions: SESSIONS.map((s) => ({ id: s.id, ...s.data })),
	}),
	'/api/tickets': JSON.stringify(TICKETS),
};

/**
 * Connect-style middleware serving {@link API_FIXTURES}; anything else falls
 * through untouched. Used by the Vite dev server.
 *
 * `no-store` on purpose: the production endpoints are CDN-cached, but locally
 * you want an edited fixture to show up on the next reload.
 */
export function apiFixtureMiddleware(req, res, next) {
	const pathname = (req.url ?? '').split('?')[0];
	const body = API_FIXTURES[pathname];
	if (body === undefined) {
		next();
		return;
	}
	res.setHeader('Content-Type', 'application/json; charset=utf-8');
	res.setHeader('Cache-Control', 'no-store');
	res.end(body);
}
