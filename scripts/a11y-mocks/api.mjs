/**
 * The `/api/*` payloads, built once from the fixtures and shared by everything
 * that needs to stand in for the Cloud Functions.
 *
 * Two consumers, deliberately one source:
 *   • `scripts/a11y.mjs`  — the axe sweep, against an `A11Y_MOCK=1` build
 *   • `astro.config.mjs`  — the dev server (`npm run dev`)
 *
 * In production these routes are Hosting rewrites to `lineupApi` / `ticketsApi`
 * (see CLAUDE.md "Browser data access"). Neither the audit nor a laptop can
 * reach them — the functions are deployed, but a dev server has no rewrite
 * table, so the islands would fetch `/api/lineup`, get the dev server's 404
 * HTML, and render their "unavailable" states forever. Serving the fixtures
 * locally is what makes the lineup, the agenda grid and the ticket waves
 * visible while you work on them.
 *
 * The shaping below mirrors what the real endpoints return: raw documents
 * (`{ id, ...fields }`) for the lineup, the RTDB cache verbatim for tickets, so
 * the browser runs its own `speakerFromDoc` / `sessionFromDoc` / `filterDisplayable`
 * parsers exactly as it does against the live functions.
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
