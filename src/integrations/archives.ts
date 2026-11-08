/**
 * Past editions, frozen (ADR 0011). `npm run archive <year>` builds the site
 * of an edition under `/<year>` and writes the output to `archive/<year>/`;
 * nobody edits it by hand. After every live build each archive is copied
 * into the output, so Hosting serves it at `/<year>/…`, and its pages join
 * the live sitemap (`archivedPages()`, read by `astro.config.ts`).
 */
import { cp, readdir } from 'node:fs/promises';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';
import { archivedEditions } from '../lib/editions';

const ARCHIVE_ROOT = join(process.cwd(), 'archive');

/**
 * Every page URL the archives' own sitemaps list, with the day each was
 * archived (`lastmod`). The live sitemap repeats them: the archive stays
 * indexed from the one sitemap Search Console reads.
 */
export function archivedPages(): Map<string, string | undefined> {
	const pages = new Map<string, string | undefined>();
	for (const year of archivedEditions()) {
		const dir = join(ARCHIVE_ROOT, year);
		for (const name of readdirSync(dir)) {
			if (!/^sitemap-\d+\.xml$/.test(name)) continue;
			const xml = readFileSync(join(dir, name), 'utf8');
			for (const [, entry] of xml.matchAll(/<url>(.*?)<\/url>/gs)) {
				const loc = /<loc>(.*?)<\/loc>/s.exec(entry)?.[1];
				// The archive's home is `/<year>`, as its canonical says.
				if (loc) pages.set(loc.replace(/\/$/, ''), /<lastmod>(.*?)<\/lastmod>/s.exec(entry)?.[1]);
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
					const from = join(ARCHIVE_ROOT, year);
					await cp(from, join(fileURLToPath(dir), year), { recursive: true });
					logger.info(`archive/${year}/ → /${year} (${(await readdir(from)).length} entries)`);
				}
			},
		},
	};
}
