/**
 * The path this build is served from. The live site is served from the root;
 * an archive build (`PUBLIC_ARCHIVE=2026`, `npm run archive`) serves the same
 * pages under `/2026` (Astro's `base`, set in `astro.config.ts`).
 *
 * Astro prefixes its own assets. Everything else goes through here:
 * `src/middleware.ts` rebases every root-relative URL in rendered HTML, so a
 * template writes `href="/agenda"` as usual. Code that builds a URL the
 * middleware never sees, in an island or a script, or an absolute URL,
 * calls `withBase()` or `absoluteUrl()` itself.
 */

/** `''` on the live site, `/2026` in the 2026 archive. */
export const BASE: string = (import.meta.env?.BASE_URL ?? '/').replace(/\/+$/, '');

/** The archived edition this build is, `null` on the live site. */
export const ARCHIVE: string | null = import.meta.env?.PUBLIC_ARCHIVE || null;

/** The canonical origin (Astro's `site`, from `src/site.config.ts`), no trailing slash. */
const SITE: string = (import.meta.env?.SITE ?? '').replace(/\/+$/, '');

/** A root-relative URL: one slash, not a protocol-relative `//host`. */
const isRootRelative = (url: string): boolean => url.startsWith('/') && !url.startsWith('//');

/**
 * `path` under `base`. Only root-relative URLs change, and a URL already
 * under `base` is returned as is, so rebasing twice is safe. The root and
 * its fragments and queries land on the base itself (`/#news` →
 * `/2026#news`), as the site uses no trailing slashes.
 */
export function rebase(path: string, base: string): string {
	if (!base || !isRootRelative(path)) return path;
	if (path === base || path.startsWith(`${base}/`) || path.startsWith(`${base}#`) || path.startsWith(`${base}?`)) {
		return path;
	}
	if (path === '/' || path.startsWith('/#') || path.startsWith('/?')) return `${base}${path.slice(1)}`;
	return `${base}${path}`;
}

/** `path` with this build's base: `/agenda` → `/2026/agenda` in the 2026 archive. */
export const withBase = (path: string): string => rebase(path, BASE);

/** A pathname with this build's base taken off, for comparing against site paths. */
export function withoutBase(pathname: string): string {
	if (!BASE || (pathname !== BASE && !pathname.startsWith(`${BASE}/`))) return pathname;
	return pathname.slice(BASE.length) || '/';
}

/** The absolute URL of a site path in this build: `https://devfest.cz/2026/agenda`. */
export const absoluteUrl = (path: string): string => {
	const based = withBase(path);
	return based === '/' ? SITE : `${SITE}${based}`;
};

/** The live site's absolute URL of `path`, whatever build this is. */
export const liveUrl = (path: string): string => (path === '/' ? SITE : `${SITE}${path}`);

/** The `/api/*` read of `name`: the live endpoint, or the archive's frozen copy. */
export const apiUrl = (name: string): string => (ARCHIVE ? `${BASE}/api/${name}.json` : `/api/${name}`);

// Attributes that carry one URL, and the two that carry a candidate list.
const URL_ATTR = /(\s(?:href|src|action|poster|data-src))=(["'])(\/(?!\/)[^"']*)\2/g;
const SRCSET_ATTR = /(\s(?:srcset|imagesrcset))=(["'])([^"']*)\2/g;

/**
 * `html` with every root-relative URL in a link, source or form attribute
 * moved under `base`. Text, scripts and absolute URLs are left alone.
 */
export function rebaseHtml(html: string, base: string): string {
	if (!base) return html;
	return html
		.replace(URL_ATTR, (_, attr: string, quote: string, url: string) => `${attr}=${quote}${rebase(url, base)}${quote}`)
		.replace(SRCSET_ATTR, (_, attr: string, quote: string, list: string) => {
			const rebased = list
				.split(',')
				.map((candidate) => candidate.replace(/^(\s*)(\S+)/, (__, space: string, url: string) => `${space}${rebase(url, base)}`))
				.join(',');
			return `${attr}=${quote}${rebased}${quote}`;
		});
}
