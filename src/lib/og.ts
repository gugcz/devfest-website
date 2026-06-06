// Build-time Open Graph scraper. Imported only from .astro frontmatter, so it
// runs in Node during `astro build` / dev SSR and never ships to the client.
// Used by the press page to turn a bare article URL into a rich preview card
// (image + description + site name) without hand-copying metadata per entry.

export interface OgData {
	image?: string;
	description?: string;
	siteName?: string;
	title?: string;
	publishedTime?: string; // ISO 8601, from article:published_time
}

const META_RE = /<meta\b[^>]*>/gi;

function attr(tag: string, name: string): string | undefined {
	const m = new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i').exec(tag);
	return m ? (m[2] ?? m[3]) : undefined;
}

// Minimal HTML entity decode for the handful that show up in og: content.
function decodeEntities(s: string): string {
	return s
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#0*39;|&apos;|&#x27;/gi, "'")
		.replace(/&hellip;|&#8230;/g, '…')
		.replace(/&nbsp;|&#160;/g, ' ')
		.trim();
}

/**
 * Fetch a URL and extract Open Graph / Twitter card metadata. Resolves to a
 * (possibly empty) OgData; never throws — network/parse failures yield {} so
 * the build keeps going and the card degrades to a text-only entry.
 */
export async function fetchOg(url: string): Promise<OgData> {
	try {
		const res = await fetch(url, {
			headers: {
				// Some CMSes (incl. WordPress hosts) 403 requests without a UA.
				'user-agent': 'Mozilla/5.0 (compatible; DevFestBot/1.0; +https://devfest.cz)',
				accept: 'text/html',
			},
			signal: AbortSignal.timeout(8000),
		});
		if (!res.ok) return {};
		const html = await res.text();
		// Parse the <head> only — enough for meta tags, avoids scanning huge bodies.
		const headEnd = html.search(/<\/head>/i);
		const head = headEnd === -1 ? html.slice(0, 60_000) : html.slice(0, headEnd);

		const data: OgData = {};
		const tags = head.match(META_RE) ?? [];
		for (const tag of tags) {
			const key = (attr(tag, 'property') ?? attr(tag, 'name') ?? '').toLowerCase();
			const content = attr(tag, 'content');
			if (!content) continue;
			if ((key === 'og:image' || key === 'og:image:url' || key === 'twitter:image') && !data.image) {
				data.image = content;
			} else if (
				(key === 'og:description' || key === 'twitter:description' || key === 'description') &&
				!data.description
			) {
				data.description = decodeEntities(content);
			} else if (key === 'og:site_name' && !data.siteName) {
				data.siteName = decodeEntities(content);
			} else if (key === 'og:title' && !data.title) {
				data.title = decodeEntities(content);
			} else if (
				(key === 'article:published_time' || key === 'article:modified_time') &&
				!data.publishedTime
			) {
				data.publishedTime = content;
			}
		}
		return data;
	} catch {
		return {};
	}
}
