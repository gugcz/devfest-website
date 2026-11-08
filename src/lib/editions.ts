/**
 * Past editions (ADR 0011): the ones archived in this repository
 * (`archive/<year>/`, written by `npm run archive`) and the older ones still
 * served from their own subdomains by other repositories. Build time only:
 * reads the file system.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import config from '../site.config';
import { ARCHIVE, isUnder, liveUrl } from './base';
import type { FeatureFlag } from './features';
import { isDisplayableSession, sessionFromDoc } from './sessions';

// From the project root: the build bundles this module somewhere else.
const ARCHIVE_ROOT = join(process.cwd(), 'archive');

/** Editions on their own `<year>.devfest.cz` sites, newest first. */
const ON_SUBDOMAINS: readonly number[] = [2025, 2019, 2018, 2017];

/** Each edition's aftermovie: its YouTube video id, by year. */
const AFTERMOVIES: Readonly<Record<number, string>> = { 2026: 'vQGgPPCq1Eg' };

export interface PastEdition {
	year: number;
	href: string;
	/** Served by another site: opens in a new tab. */
	external: boolean;
}

/** The years archived here, oldest first: every `archive/<year>/`. */
export function archivedEditions(): string[] {
	if (!existsSync(ARCHIVE_ROOT)) return [];
	return readdirSync(ARCHIVE_ROOT, { withFileTypes: true })
		.filter((entry) => entry.isDirectory() && /^\d{4}$/.test(entry.name))
		.map((entry) => entry.name)
		.sort();
}

/**
 * Every past edition with a site, newest first. In an archive build only the
 * editions before it, and the archived ones by their live URL (the
 * middleware would put a root-relative one under the archive's own base).
 */
export function pastEditions(): PastEdition[] {
	const before = ARCHIVE ? Number(ARCHIVE) : Infinity;
	const host = new URL(config.site.url).host;
	const here = archivedEditions().map((year) => ({
		year: Number(year),
		href: ARCHIVE ? liveUrl(`/${year}`) : `/${year}`,
		external: false,
	}));
	const elsewhere = ON_SUBDOMAINS.map((year) => ({ year, href: `https://${year}.${host}`, external: true }));
	return [...here, ...elsewhere].filter((edition) => edition.year < before).sort((a, b) => b.year - a.year);
}

/** The facts `npm run archive` froze with an edition (`archive/<year>/edition.json`). */
export interface EditionFacts {
	year: number;
	/** "DevFest.cz 2026". */
	name: string;
	/** The opening keynote, ISO 8601. */
	start: string;
	/** "30 October 2026". */
	dateLabel: string;
	venue: string | null;
	city: string;
	audience: number | null;
}

/** An archived edition: its facts, and what it had on stage. */
export interface LastEdition extends EditionFacts {
	/** Root-relative link to the archive: `/2026`. */
	href: string;
	speakers: number;
	talks: number;
	/** The YouTube video id of its aftermovie, `null` until there is one. */
	aftermovie: string | null;
}

/**
 * Talks and speakers counted from an edition's frozen lineup the way
 * `/agenda` lists them: every session but the service ones and the hosts',
 * and everyone who gave one.
 */
function onStage(year: string): { speakers: number; talks: number } {
	const file = join(ARCHIVE_ROOT, year, 'api', 'lineup.json');
	if (!existsSync(file)) return { speakers: 0, talks: 0 };
	const raw = JSON.parse(readFileSync(file, 'utf8')) as { sessions?: unknown };
	const docs = Array.isArray(raw.sessions) ? (raw.sessions as Record<string, unknown>[]) : [];
	const talks = docs
		.map((doc) => sessionFromDoc(typeof doc.id === 'string' ? doc.id : '', doc))
		.filter(isDisplayableSession);
	const speakers = new Set(talks.flatMap((talk) => talk.speakers.map((speaker) => speaker.id)));
	return { speakers: speakers.size, talks: talks.length };
}

/**
 * The latest edition archived here, for the lines the live site says about
 * last year. `null` without an archive that has `edition.json`.
 */
export function lastEdition(): LastEdition | null {
	const year = archivedEditions().at(-1);
	if (!year) return null;
	const file = join(ARCHIVE_ROOT, year, 'edition.json');
	if (!existsSync(file)) return null;
	const facts = JSON.parse(readFileSync(file, 'utf8')) as EditionFacts;
	return { ...facts, href: `/${year}`, ...onStage(year), aftermovie: AFTERMOVIES[facts.year] ?? null };
}

/**
 * `path` while `flag` is on; while it is off, the same page in the latest
 * archive (the agenda a stale link or a thank-you page points at is then
 * last year's), or the home page without one.
 */
export function flagHref(flag: FeatureFlag, path: string): string {
	if (config.features[flag]) return path;
	const year = archivedEditions().at(-1);
	if (!year) return '/';
	return path === '/' ? `/${year}` : `/${year}${path}`;
}

/**
 * Whether a link leaves this build for another: from the live site into an
 * archive (`/2026/…`), or from an archive to any absolute page of the site
 * (the live site, another archive). See `reloadCrossBuildLinks()`.
 */
let archivedYears: string[] | undefined;
export function crossesBuild(href: string): boolean {
	const site = config.site.url;
	if (ARCHIVE) return isUnder(href, site);
	archivedYears ??= archivedEditions();
	return archivedYears.some((year) => isUnder(href, `/${year}`) || isUnder(href, `${site}/${year}`));
}
