/**
 * Browser-safe speaker types + presentation helpers.
 *
 * The daily `refreshSessionize` Cloud Function (functions/src/sessionize/)
 * writes documents into the public-read Firestore `speakers` collection; the
 * shapes here mirror the subset of that `SpeakerDoc` the UI renders (the doc
 * also carries the full Sessionize record — bio, sessions, etc. — which the
 * page ignores for now). Browser-safe: types, the kind→icon map, and pure
 * helpers only — no Firebase import (the island wires the read via
 * `getFirestoreDb()`).
 */

/**
 * Canonical social-link kinds. The Cloud Function maps each Sessionize
 * `linkType` to one of these; unknown types collapse to `web` (a globe) so a
 * link never renders without an icon.
 *
 * ⚠️ Keep in sync with `functions/src/sessionize/sessionize-api.ts` (its
 * `SpeakerLinkKind` + `KIND_LABEL`) — the two live across the src/ ↔ functions/
 * build boundary and share no package. Adding a kind means editing both.
 */
export type SpeakerLinkKind =
	| 'linkedin'
	| 'x'
	| 'facebook'
	| 'instagram'
	| 'bluesky'
	| 'youtube'
	| 'github'
	| 'mastodon'
	| 'web';

export interface SpeakerLink {
	kind: SpeakerLinkKind;
	url: string;
	label: string;
}

export interface Speaker {
	/** Sessionize speaker GUID — also the Firestore doc id. */
	id: string;
	/** Sort key: index in the Sessionize array. */
	order: number;
	fullName: string;
	/** May be empty — the card omits the tagline line when so. */
	tagLine: string;
	/** Absolute BunnyCDN URL; may be empty (→ monogram fallback). */
	profilePicture: string;
	links: SpeakerLink[];
}

const KNOWN_KINDS = new Set<SpeakerLinkKind>([
	'linkedin',
	'x',
	'facebook',
	'instagram',
	'bluesky',
	'youtube',
	'github',
	'mastodon',
	'web',
]);

/**
 * Single-path `d` per kind (viewBox `0 0 24 24`, `fill: currentColor`), reusing
 * the glyphs already committed in `Footer.astro` and `team.astro`. The `web`
 * fallback is the chain/link glyph from `team.astro`.
 */
export const SPEAKER_ICON_PATHS: Record<SpeakerLinkKind, string> = {
	linkedin:
		'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z',
	x: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
	facebook:
		'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
	instagram:
		'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
	bluesky:
		'M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.785 2.627 3.59 3.513 6.182 3.2-4.574.552-8.657 2.444-5.282 7.777C4.537 25.405 8.093 20.463 12 16.08c3.907 4.383 7.376 9.199 10.476 5.144 3.375-5.333-.708-7.225-5.282-7.777 2.592.313 5.397-.573 6.182-3.2.246-.828.624-5.788.624-6.479 0-.688-.139-1.86-.902-2.203-.659-.3-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z',
	youtube:
		'M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
	github:
		'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
	mastodon:
		'M23.268 5.313c-.35-2.578-2.617-4.61-5.304-5.004C17.51.242 15.792 0 11.813 0h-.03c-3.98 0-4.835.242-5.288.309C3.882.692 1.496 2.518.917 5.127.64 6.412.61 7.837.661 9.143c.074 1.874.088 3.745.26 5.611.118 1.24.325 2.47.62 3.68.55 2.237 2.777 4.098 4.96 4.857 2.336.792 4.849.923 7.256.38.265-.061.527-.132.786-.213.585-.184 1.27-.39 1.774-.753a.057.057 0 0 0 .023-.043v-1.809a.052.052 0 0 0-.02-.041.053.053 0 0 0-.046-.01 20.282 20.282 0 0 1-4.709.545c-2.73 0-3.463-1.284-3.674-1.818a5.593 5.593 0 0 1-.319-1.433.053.053 0 0 1 .066-.054c1.517.363 3.072.546 4.632.546.376 0 .75 0 1.125-.01 1.57-.044 3.224-.124 4.768-.422.038-.008.077-.015.11-.024 2.435-.464 4.753-1.92 4.989-5.604.008-.145.03-1.52.03-1.67.002-.51.165-3.613-.024-5.52zm-3.748 9.195h-2.561V8.29c0-1.309-.55-1.976-1.67-1.976-1.23 0-1.846.79-1.846 2.35v3.403h-2.546V8.663c0-1.56-.617-2.35-1.848-2.35-1.112 0-1.668.668-1.67 1.977v6.218H4.822V8.102c0-1.31.337-2.35 1.011-3.12.696-.77 1.608-1.164 2.74-1.164 1.311 0 2.302.5 2.962 1.498l.638 1.06.638-1.06c.66-.999 1.65-1.498 2.96-1.498 1.13 0 2.043.395 2.74 1.164.675.77 1.012 1.81 1.012 3.12z',
	web: 'M19.902 4.098a3.75 3.75 0 0 0-5.304 0l-4.5 4.5a3.75 3.75 0 0 0 1.035 6.037.75.75 0 0 1-.646 1.353 5.25 5.25 0 0 1-1.449-8.45l4.5-4.5a5.25 5.25 0 1 1 7.424 7.424l-1.757 1.757a.75.75 0 1 1-1.06-1.06l1.757-1.757a3.75 3.75 0 0 0 0-5.304Zm-7.389 4.267a.75.75 0 0 1 1-.353 5.25 5.25 0 0 1 1.449 8.45l-4.5 4.5a5.25 5.25 0 1 1-7.424-7.424l1.757-1.757a.75.75 0 1 1 1.06 1.06l-1.757 1.757a3.75 3.75 0 1 0 5.304 5.304l4.5-4.5a3.75 3.75 0 0 0-1.035-6.037.75.75 0 0 1-.354-1Z',
};

/** Two-letter monogram fallback when a speaker has no usable photo. */
export function initials(name: string): string {
	return name
		.split(/\s+/)
		.filter(Boolean)
		.map((word) => word[0] ?? '')
		.slice(0, 2)
		.join('')
		.toUpperCase();
}

function isString(value: unknown): value is string {
	return typeof value === 'string';
}

/** http(s)-only scheme re-check at the render boundary — defense-in-depth over
 * the Cloud Function's write-time `sanitizeLinkUrl` (the collection is
 * client-write-blocked, but this module renders directly into an `href`). */
function isSafeHref(url: string): boolean {
	try {
		const { protocol } = new URL(url);
		return protocol === 'http:' || protocol === 'https:';
	} catch {
		return false;
	}
}

function coerceLink(raw: unknown): SpeakerLink | null {
	if (typeof raw !== 'object' || raw === null) return null;
	const { kind, url, label } = raw as Record<string, unknown>;
	if (!isString(url) || !isString(label) || !isSafeHref(url)) return null;
	const safeKind: SpeakerLinkKind = KNOWN_KINDS.has(kind as SpeakerLinkKind)
		? (kind as SpeakerLinkKind)
		: 'web';
	return { kind: safeKind, url, label };
}

/**
 * Defensively coerce a Firestore document into a `Speaker`. The collection is
 * written only by `refreshSessionize`, but the client still normalizes so a
 * partially-shaped doc renders (or degrades) instead of throwing in the island.
 */
export function speakerFromDoc(id: string, data: Record<string, unknown>): Speaker {
	const links = Array.isArray(data.links)
		? (data.links.map(coerceLink).filter(Boolean) as SpeakerLink[])
		: [];
	return {
		id,
		order: typeof data.order === 'number' ? data.order : Number.MAX_SAFE_INTEGER,
		fullName: isString(data.fullName) ? data.fullName : '',
		tagLine: isString(data.tagLine) ? data.tagLine : '',
		profilePicture: isString(data.profilePicture) ? data.profilePicture : '',
		links,
	};
}
