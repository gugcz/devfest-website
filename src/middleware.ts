/**
 * In an archive build (`npm run archive`, ADR 0011) every page is served
 * under `/<year>`. Astro prefixes its own assets; this rebases the rest of
 * the rendered HTML: every root-relative link, image and form URL a template
 * wrote (`href="/agenda"` → `href="/2026/agenda"`). On the live site `BASE`
 * is empty and pages pass through untouched.
 */
import { defineMiddleware } from 'astro:middleware';
import { BASE, rebaseHtml } from './lib/base';

export const onRequest = defineMiddleware(async (_context, next) => {
	const response = await next();
	if (!BASE || !response.headers.get('content-type')?.includes('text/html')) return response;
	const html = await response.text();
	return new Response(rebaseHtml(html, BASE), {
		status: response.status,
		statusText: response.statusText,
		headers: response.headers,
	});
});
