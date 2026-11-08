/**
 * Past editions, frozen (ADR 0011). `npm run archive <year>` builds the site
 * of an edition under `/<year>` and writes the output to `archive/<year>/`;
 * nobody edits it by hand. After every live build each archive is copied
 * into the output, so Hosting serves it at `/<year>/…`, and its pages join
 * the live sitemap (`archivedPages()`, read by `astro.config.ts`).
 */
import { cp, readdir } from 'node:fs/promises';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';

const ARCHIVE_ROOT = new URL('../../archive/', import.meta.url);

/** The archived editions, oldest first: every `archive/<year>/`. */
export function archivedEditions(): string[] {
	if (!existsSync(ARCHIVE_ROOT)) return [];
	return readdirSync(ARCHIVE_ROOT, { withFileTypes: true })
		.filter((entry) => entry.isDirectory() && /^\d{4}$/.test(entry.name))
		.map((entry) => entry.name)
		.sort();
}

/**
 * Every page URL the archives' own sitemaps list, with the day each was
 * archived (`lastmod`). The live sitemap repeats them: the archive stays
 * indexed from the one sitemap Search Console reads.
 */
export function archivedPages(): Map<string, string | undefined> {
	const pages = new Map<string, string | undefined>();
	for (const year of archivedEditions()) {
		const dir = new URL(`${year}/`, ARCHIVE_ROOT);
		for (const name of readdirSync(dir)) {
			if (!/^sitemap-\d+\.xml$/.test(name)) continue;
			const xml = readFileSync(new URL(name, dir), 'utf8');
			for (const [, entry] of xml.matchAll(/<url>(.*?)<\/url>/gs)) {
				const loc = /<loc>(.*?)<\/loc>/s.exec(entry)?.[1];
				if (loc) pages.set(loc, /<lastmod>(.*?)<\/lastmod>/s.exec(entry)?.[1]);
			}
		}
	}
	return pages;
}

export default function archives(): AstroIntegration {
	return {
		name: 'devfest:archives',
		hooks: {
			'astro:build:done': async ({ dir, logger }) => {
				for (const year of archivedEditions()) {
					const from = fileURLToPath(new URL(`${year}/`, ARCHIVE_ROOT));
					await cp(from, fileURLToPath(new URL(`${year}/`, dir)), { recursive: true });
					logger.info(`archive/${year}/ → /${year} (${(await readdir(from)).length} entries)`);
				}
			},
		},
	};
}
