/**
 * Fails a live build when a `firebase.json` redirect would hide one of its
 * pages or endpoints: Hosting applies redirects before static files, so
 * turning a flag on without deleting the redirect of the paths it brings
 * back would leave them built and unreachable (ADR 0011). Reads the output
 * directory, so `src/pages/`, injected routes and endpoints
 * (`/calendar.ics`) all count; the archives copied under `/<year>/` do not.
 *
 * Off in a mock build (`A11Y_MOCK=1`: the a11y sweep, the flags-off check),
 * which may turn on sections production keeps off and redirects.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';
import { builtPath, shadowedPaths, type HostingRedirect } from '../lib/redirects';

/** Every file under `dir`, relative to it with `/` separators. */
function files(dir: string, prefix = ''): string[] {
	return readdirSync(join(dir, prefix), { withFileTypes: true }).flatMap((entry) => {
		const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
		return entry.isDirectory() ? files(dir, rel) : [rel];
	});
}

export default function redirectGuard(): AstroIntegration {
	return {
		name: 'devfest:redirect-guard',
		hooks: {
			'astro:build:done': ({ dir }) => {
				if (process.env.A11Y_MOCK === '1') return;
				const { hosting } = JSON.parse(readFileSync(join(process.cwd(), 'firebase.json'), 'utf8')) as {
					hosting: { redirects?: HostingRedirect[] };
				};
				const paths = files(fileURLToPath(dir)).flatMap((file) => builtPath(file) ?? []);
				const hits = shadowedPaths(hosting.redirects ?? [], paths);
				if (hits.length > 0) {
					throw new Error(
						`firebase.json redirects pages this build has (Hosting applies redirects first): ${hits.join('; ')}. Delete those redirects in the same change that turns their section on.`,
					);
				}
			},
		},
	};
}
