/**
 * Browser-safe speaker types + presentation helpers. Shapes mirror the subset
 * of `SpeakerDoc` (functions/src/sessionize/) the UI renders. No Firebase
 * import — the island reads `/api/lineup`.
 */

/**
 * Canonical social-link kinds; unknown types collapse to `web` (globe).
 *
 * ⚠️ Keep in sync with `functions/src/sessionize/sessionize-api.ts`
 * (`SpeakerLinkKind` + `KIND_LABEL`) — no shared package.
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

/** A talk this speaker is giving — used in the detail view. */
export interface SpeakerSession {
	name: string;
	/** Talk abstract; may be empty. */
	description: string;
}

export interface Speaker {
	/** Sessionize speaker GUID — also the Firestore doc id. */
	id: string;
	/** Sort key: index in the Sessionize array. */
	order: number;
	fullName: string;
	/** May be empty — the card omits the tagline line when so. */
	tagLine: string;
	/** Full Sessionize bio; may be empty. Shown in the detail view. */
	bio: string;
	/** Absolute BunnyCDN URL; may be empty (→ monogram fallback). */
	profilePicture: string;
	links: SpeakerLink[];
	/** Talks by this speaker; may be empty. Shown in the detail view. */
	sessions: SpeakerSession[];
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
 * Shared `view-transition-name` for the lineup print and the dialog photo.
 * Lives here to avoid a Speakers ⇄ SpeakerDetail import cycle. Must be on
 * exactly ONE element per capture or the browser skips the transition — see
 * `usePortraitMorph` in Speakers.tsx.
 */
export const PORTRAIT_TRANSITION = 'speaker-portrait';

/** Two-letter monogram fallback when a speaker has no usable photo. Falls back
 * to `?` rather than an empty string, so a nameless entry still renders a mark
 * instead of collapsing the monogram slot. */
export function initials(name: string): string {
	return (
		name
			.split(/\s+/)
			.filter(Boolean)
			.map((word) => word[0] ?? '')
			.slice(0, 2)
			.join('')
			.toUpperCase() || '?'
	);
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

function coerceSession(raw: unknown): SpeakerSession | null {
	if (isString(raw)) return raw.trim() ? { name: raw, description: '' } : null;
	if (typeof raw === 'object' && raw !== null) {
		const record = raw as Record<string, unknown>;
		const name = record.name;
		if (isString(name) && name.trim()) {
			return { name, description: isString(record.description) ? record.description : '' };
		}
	}
	return null;
}

/** Defensively coerce a Firestore doc into a `Speaker`, so a partially
 * shaped doc degrades instead of throwing in the island. */
export function speakerFromDoc(id: string, data: Record<string, unknown>): Speaker {
	const links = Array.isArray(data.links)
		? (data.links.map(coerceLink).filter(Boolean) as SpeakerLink[])
		: [];
	const sessions = Array.isArray(data.sessions)
		? (data.sessions.map(coerceSession).filter(Boolean) as SpeakerSession[])
		: [];
	return {
		id,
		order: typeof data.order === 'number' ? data.order : Number.MAX_SAFE_INTEGER,
		fullName: isString(data.fullName) ? data.fullName : '',
		tagLine: isString(data.tagLine) ? data.tagLine : '',
		bio: isString(data.bio) ? data.bio : '',
		profilePicture: isString(data.profilePicture) ? data.profilePicture : '',
		links,
		sessions,
	};
}

// Pictographs and their joiners/variation selectors (🔷, ⭐️, 👩‍💻). Digits,
// `#` and `*` are `Emoji` but not `Extended_Pictographic`, so they survive.
const PICTOGRAPH = /[\p{Extended_Pictographic}\u{FE0F}\u{200D}\u{20E3}]/gu;
// A fragment that is only hashtags (`#Foo #Bar`) says nothing as a credit.
const HASHTAGS_ONLY = /^(?:#[\p{L}\p{N}_]+\s*)+$/u;

/** A Sessionize tagline as a one-line credit: pictographs dropped, `|` and
 * emoji separators collapsed into ", ", hashtag-only fragments dropped.
 * Returns '' when nothing meaningful remains. */
export function cleanTagline(raw: string): string {
	return raw
		.replace(PICTOGRAPH, '|')
		.split('|')
		.map((part) => part.replace(/\s+/g, ' ').trim())
		.filter((part) => part && !HASHTAGS_ONLY.test(part))
		.join(', ');
}
