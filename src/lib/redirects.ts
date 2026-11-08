/**
 * Firebase Hosting applies `redirects` before it serves a static file
 * (https://firebase.google.com/docs/hosting/full-config#hosting-priority-order),
 * so a redirect left on a path the build now produces hides that page. This
 * finds such pairs; `src/integrations/redirect-guard.ts` fails the build on
 * one (ADR 0011).
 */

/** One entry of `hosting.redirects` in `firebase.json`. */
export interface HostingRedirect {
	source?: string;
	regex?: string;
	destination: string;
	type?: number;
}

/**
 * A Hosting `source` glob as a regular expression: `**` any path, `*` one
 * segment, `:name` one segment.
 */
function globToRegExp(glob: string): RegExp {
	const body = glob
		.split(/(\*\*|\*|:[A-Za-z]\w*)/)
		.map((part) => {
			if (part === '**') return '.*';
			if (part === '*' || part.startsWith(':')) return '[^/]+';
			return part.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
		})
		.join('');
	return new RegExp(`^${body}$`);
}

const matcher = (redirect: HostingRedirect): RegExp =>
	redirect.regex ? new RegExp(redirect.regex) : globToRegExp(redirect.source ?? '');

/**
 * Every built path a redirect would hide, as `"<path> → <destination>"`.
 * `paths` are root-relative without a trailing slash (`/`, `/faq`).
 */
export function shadowedPaths(redirects: readonly HostingRedirect[], paths: readonly string[]): string[] {
	const hits: string[] = [];
	for (const redirect of redirects) {
		const pattern = matcher(redirect);
		for (const path of paths) {
			if (pattern.test(path)) hits.push(`${path} → ${redirect.destination}`);
		}
	}
	return hits;
}
