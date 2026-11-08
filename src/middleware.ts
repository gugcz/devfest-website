/**
 * Two builds share one domain (ADR 0011): the live site, and each past
 * edition frozen under `/<year>`. On every rendered page:
 *
 * - In an archive build, Astro prefixes its own assets; this rebases the
 *   rest of the HTML (`href="/agenda"` → `href="/2026/agenda"`) and points
 *   the live-only pages (`LIVE_ONLY_PATHS`) at the live site.
 * - In every build, a link into the other build gets `data-astro-reload`,
 *   so <ClientRouter /> loads it instead of swapping it in.
 */
import { defineMiddleware } from 'astro:middleware';
import { BASE, liveOnlyLinks, rebaseHtml, reloadCrossBuildLinks } from './lib/base';
import { crossesBuild } from './lib/editions';
import config from './site.config';

export const onRequest = defineMiddleware(async (_context, next) => {
	const response = await next();
	if (!response.headers.get('content-type')?.includes('text/html')) return response;
	const html = await response.text();
	const based = BASE ? rebaseHtml(liveOnlyLinks(html, config.site.url), BASE) : html;
	return new Response(reloadCrossBuildLinks(based, crossesBuild), {
		status: response.status,
		statusText: response.statusText,
		headers: response.headers,
	});
});
