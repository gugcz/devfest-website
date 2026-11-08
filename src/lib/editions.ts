/**
 * Past editions (ADR 0011): the ones archived in this repository
 * (`archive/<year>/`, written by `npm run archive`) and the older ones still
 * served from their own subdomains by other repositories. Build time only:
 * reads the file system.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import config from '../site.config';
import { ARCHIVE, liveUrl } from './base';
import { isDisplayableSession, sessionFromDoc } from './sessions';

// From the project root: the build bundles this module somewhere else.
const ARCHIVE_ROOT = join(process.cwd(), 'archive');

/** Editions on their own `<year>.devfest.cz` sites, newest first. */
const ON_SUBDOMAINS: readonly number[] = [2025, 2019, 2018, 2017];

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

export interface EditionFigures {
	year: number;
	speakers: number;
	talks: number;
}

/**
 * What the latest archived edition had on stage, counted from its frozen
 * lineup the way `/agenda` lists it: every session but the service ones
 * and the hosts', and everyone who gave one. `null` with no archive.
 */
export function lastEditionFigures(): EditionFigures | null {
	const year = archivedEditions().at(-1);
	if (!year) return null;
	const file = join(ARCHIVE_ROOT, year, 'api', 'lineup.json');
	if (!existsSync(file)) return null;
	const raw = JSON.parse(readFileSync(file, 'utf8')) as { sessions?: unknown };
	const docs = Array.isArray(raw.sessions) ? (raw.sessions as Record<string, unknown>[]) : [];
	const talks = docs
		.map((doc) => sessionFromDoc(typeof doc.id === 'string' ? doc.id : '', doc))
		.filter(isDisplayableSession);
	const speakers = new Set(talks.flatMap((talk) => talk.speakers.map((speaker) => speaker.id)));
	return { year: Number(year), speakers: speakers.size, talks: talks.length };
}

/**
 * `path` on the site of the edition the pages talk about: the live page
 * while `edition` is on, the latest archive's while it is off (the agenda a
 * stale link or a thank-you page points at is then last year's).
 */
export function editionHref(path: string): string {
	if (config.features.edition) return path;
	const year = archivedEditions().at(-1);
	if (!year) return '/';
	return path === '/' ? `/${year}` : `/${year}${path}`;
}
