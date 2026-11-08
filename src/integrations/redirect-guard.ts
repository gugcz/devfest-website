/**
 * Fails a live build when a `firebase.json` redirect would hide one of its
 * pages: Hosting applies redirects before static files, so turning a flag on
 * without deleting the redirect of the paths it brings back would leave the
 * pages built and unreachable (ADR 0011).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { AstroIntegration } from 'astro';
import { shadowedPaths, type HostingRedirect } from '../lib/redirects';

export default function redirectGuard(): AstroIntegration {
	return {
		name: 'devfest:redirect-guard',
		hooks: {
			'astro:build:done': ({ pages }) => {
				const { hosting } = JSON.parse(readFileSync(join(process.cwd(), 'firebase.json'), 'utf8')) as {
					hosting: { redirects?: HostingRedirect[] };
				};
				const paths = pages.map(({ pathname }) => `/${pathname}`.replace(/\/+$/, '') || '/');
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
