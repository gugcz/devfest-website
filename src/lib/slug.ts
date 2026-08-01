/**
 * URL slugs for speakers and sessions.
 *
 * Shared by the build (`getStaticPaths` mints one page per speaker and per
 * session) and the browser (the lineup cards link to those pages). Both derive
 * slugs from the same lineup data with the same function, so the links an
 * island renders always match the pages the build emitted.
 */
import type { Session } from './sessions';
import type { Speaker } from './speakers';

/** Keeps URLs readable; long talk titles get cut at a word boundary. */
const MAX_LENGTH = 72;

/**
 * ASCII, lowercase, hyphen-separated. Diacritics are folded rather than
 * dropped, so "Věra Milotová" → `vera-milotova` instead of `v-ra-milotov`.
 */
export function slugify(value: string): string {
	const ascii = value
		.normalize('NFKD')
		// Combining marks left behind by NFKD — the accents themselves.
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		// Apostrophes join rather than split: "o'brien" → `obrien`, not `o-brien`.
		.replace(/['’]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');

	if (ascii.length <= MAX_LENGTH) return ascii;
	// Cut at the last hyphen inside the budget so a slug never ends mid-word.
	const cut = ascii.slice(0, MAX_LENGTH);
	const lastBreak = cut.lastIndexOf('-');
	return (lastBreak > 0 ? cut.slice(0, lastBreak) : cut).replace(/-+$/, '');
}

/** Stable 6-hex-char digest of an id — the disambiguator for slug collisions. */
function shortHash(id: string): string {
	// FNV-1a. Not cryptographic; it only needs to be deterministic and spread
	// well enough that two colliding ids get different suffixes.
	let hash = 0x811c9dc5;
	for (let i = 0; i < id.length; i++) {
		hash ^= id.charCodeAt(i);
		hash = Math.imul(hash, 0x01000193);
	}
	return (hash >>> 0).toString(16).padStart(8, '0').slice(0, 6);
}

/**
 * Map of `id → slug` for a list of named things, guaranteed collision-free.
 *
 * When two entries would slugify the same, EVERY member of that group gets an
 * id-hash suffix — including the first. Handing the clean slug to whichever one
 * happens to sort first would mean that removing it silently promotes another
 * entry into its URL, quietly changing an already-indexed address. Suffixing
 * the whole group keeps each URL tied to its own id instead.
 *
 * Entries whose name slugifies to nothing (e.g. a title with no latin
 * characters) fall back to the id hash alone, so a slug is never empty.
 */
function slugMap<T>(items: readonly T[], id: (item: T) => string, name: (item: T) => string): Map<string, string> {
	const bases = new Map<string, string>();
	const counts = new Map<string, number>();

	for (const item of items) {
		const base = slugify(name(item));
		bases.set(id(item), base);
		if (base) counts.set(base, (counts.get(base) ?? 0) + 1);
	}

	const slugs = new Map<string, string>();
	for (const item of items) {
		const key = id(item);
		const base = bases.get(key) ?? '';
		const contested = !base || (counts.get(base) ?? 0) > 1;
		slugs.set(key, contested ? [base, shortHash(key)].filter(Boolean).join('-') : base);
	}
	return slugs;
}

/** `speaker.id → slug`, derived from the full name. */
export function speakerSlugs(speakers: readonly Speaker[]): Map<string, string> {
	return slugMap(speakers, (sp) => sp.id, (sp) => sp.fullName);
}

/** `session.id → slug`, derived from the title. */
export function sessionSlugs(sessions: readonly Session[]): Map<string, string> {
	return slugMap(sessions, (se) => se.id, (se) => se.title);
}

/** Canonical path for a speaker page, or null when the id is not in the map. */
export function speakerPath(slugs: Map<string, string>, id: string): string | null {
	const slug = slugs.get(id);
	return slug ? `/speakers/${slug}` : null;
}

/** Canonical path for a session page, or null when the id is not in the map. */
export function sessionPath(slugs: Map<string, string>, id: string): string | null {
	const slug = slugs.get(id);
	return slug ? `/sessions/${slug}` : null;
}
