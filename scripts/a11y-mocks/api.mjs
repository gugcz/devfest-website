/**
 * The `/api/*` payloads from the fixtures, shared by `scripts/a11y.mjs` and
 * `astro.config.mjs` (a dev server has no Hosting rewrites). Shapes mirror
 * the real endpoints so the browser runs its own parsers unchanged.
 */
import { ROOMS, SOCIAL, SPEAKERS, SESSIONS, TICKETS } from './fixtures.mjs';

/** Route → JSON body. Keys are exact pathnames, query strings stripped. */
export const API_FIXTURES = {
	'/api/lineup': JSON.stringify({
		speakers: SPEAKERS.map((s) => ({ id: s.id, ...s.data })),
		sessions: SESSIONS.map((s) => ({ id: s.id, ...s.data })),
		rooms: ROOMS.map((r) => ({ id: r.id, ...r.data })),
	}),
	'/api/tickets': JSON.stringify(TICKETS),
	'/api/social': JSON.stringify(SOCIAL),
};

/** Connect middleware serving {@link API_FIXTURES} with `no-store` (an
 * edited fixture shows on the next reload); everything else falls through. */
export function apiFixtureMiddleware(req, res, next) {
	const pathname = (req.url ?? '').split('?')[0];
	if (pathname === '/api/speaker-photo') {
		// The fixtures' portrait is an inline SVG; serve its markup for any id
		// that has one, like the real endpoint serves the doc's photo.
		const id = new URLSearchParams((req.url ?? '').split('?')[1] ?? '').get('id');
		const url = SPEAKERS.find((s) => s.id === id)?.data.profilePicture ?? '';
		if (!url.startsWith('data:image/svg+xml,')) {
			res.statusCode = 404;
			res.end('Not Found');
			return;
		}
		res.setHeader('Content-Type', 'image/svg+xml');
		res.setHeader('Cache-Control', 'no-store');
		res.end(decodeURIComponent(url.slice('data:image/svg+xml,'.length)));
		return;
	}
	const body = API_FIXTURES[pathname];
	if (body === undefined) {
		next();
		return;
	}
	res.setHeader('Content-Type', 'application/json; charset=utf-8');
	res.setHeader('Cache-Control', 'no-store');
	res.end(body);
}
