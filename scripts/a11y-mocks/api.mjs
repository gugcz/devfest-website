/**
 * The `/api/*` payloads from the fixtures, shared by `scripts/a11y.mjs` and
 * `astro.config.mjs` (a dev server has no Hosting rewrites). Shapes mirror
 * the real endpoints so the browser runs its own parsers unchanged.
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

/** Connect middleware serving {@link API_FIXTURES} with `no-store` (an
 * edited fixture shows on the next reload); everything else falls through. */
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
