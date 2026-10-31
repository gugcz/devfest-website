/** `/robots.txt`: everything allowed, the sitemap at the configured origin. */
import type { APIRoute } from 'astro';
import config from '../site.config';

export const GET: APIRoute = () =>
	new Response(`User-agent: *\nAllow: /\n\nSitemap: ${config.site.url}/sitemap-index.xml\n`, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
