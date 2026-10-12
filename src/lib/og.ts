// Build-time Open Graph scraper. Imported only from .astro frontmatter, so it
// runs in Node during `astro build` / dev SSR and never ships to the client.
// Used by the press band on /contact to turn a bare article URL into a rich preview card
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

// Meta key → OgData field it fills, and whether its content is entity-decoded.
// The first non-empty match per field wins. A Map, so a stray key like
// `constructor` can't hit Object.prototype.
const OG_FIELDS = new Map<string, { field: keyof OgData; decode: boolean }>([
	['og:image', { field: 'image', decode: false }],
	['og:image:url', { field: 'image', decode: false }],
	['twitter:image', { field: 'image', decode: false }],
	['og:description', { field: 'description', decode: true }],
	['twitter:description', { field: 'description', decode: true }],
	['description', { field: 'description', decode: true }],
	['og:site_name', { field: 'siteName', decode: true }],
	['og:title', { field: 'title', decode: true }],
	['article:published_time', { field: 'publishedTime', decode: false }],
	['article:modified_time', { field: 'publishedTime', decode: false }],
]);

function parseOgTags(head: string): OgData {
	const data: OgData = {};
	const tags = head.match(META_RE) ?? [];
	for (const tag of tags) {
		const key = (attr(tag, 'property') ?? attr(tag, 'name') ?? '').toLowerCase();
		const content = attr(tag, 'content');
		if (!content) continue;
		const spec = OG_FIELDS.get(key);
		if (!spec || data[spec.field]) continue;
		data[spec.field] = spec.decode ? decodeEntities(content) : content;
	}
	return data;
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
		return parseOgTags(head);
	} catch {
		return {};
	}
}
