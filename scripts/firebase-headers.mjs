/**
 * Firebase Hosting "adapter" for Astro's static headers.
 *
 * Astro computes the Content-Security-Policy (`security.csp` in
 * astro.config.mjs) with a hash for every inline script and style it renders,
 * but for a static build it can only hand the result to an adapter that
 * declares `staticHeaders` — Netlify and Vercel ship one, Firebase does not.
 * This is that adapter: it takes the per-route headers Astro produced and
 * writes one header into `firebase.json`.
 *
 * One header for the whole site, not per page: `<ClientRouter />` keeps a
 * single document alive across navigations, so the policy has to carry every
 * page's hashes (a per-page `<meta>` would stack and block the next page's
 * styles). The union of all routes' policies is what `firebase.json` gets.
 */
import { readFile, writeFile } from 'node:fs/promises';

const FIREBASE_JSON = new URL('../firebase.json', import.meta.url);
// The one line this integration owns — replaced textually so the file's
// formatting and every other header stay untouched.
const HEADER_LINE = /("key":\s*"Content-Security-Policy",\s*"value":\s*)"(?:[^"\\]|\\.)*"/;

/** @returns {import('astro').AstroIntegration} */
export default function firebaseHeaders() {
	let command;
	return {
		name: 'firebase-headers',
		hooks: {
			'astro:config:setup': (params) => {
				command = params.command;
			},
			'astro:config:done': ({ setAdapter }) => {
				// Build only. With a staticHeaders adapter registered, the dev
				// server sends the (hash-less) policy as an enforced header and
				// blocks every <style> Vite injects; without one, dev keeps
				// Astro's own <meta> handling.
				if (command !== 'build') return;
				setAdapter({
					name: 'firebase-headers',
					entrypointResolution: 'auto',
					adapterFeatures: { buildOutput: 'static', staticHeaders: true },
					supportedAstroFeatures: { staticOutput: 'stable', sharpImageService: 'stable' },
				});
			},
			'astro:build:generated': async ({ routeToHeaders, logger }) => {
				/** @type {Map<string, Set<string>>} directive → sources, in first-seen order */
				const merged = new Map();
				for (const { headers } of routeToHeaders.values()) {
					const csp = headers.get('content-security-policy');
					if (!csp) continue;
					for (const directive of csp.split(';')) {
						const [name, ...sources] = directive.trim().split(/\s+/);
						if (!name) continue;
						if (!merged.has(name)) merged.set(name, new Set());
						for (const s of sources) merged.get(name).add(s);
					}
				}
				const policy = [...merged].map(([name, sources]) => [name, ...[...sources].sort()].join(' ')).join('; ');
				const text = await readFile(FIREBASE_JSON, 'utf8');
				if (!HEADER_LINE.test(text)) throw new Error('no Content-Security-Policy header in firebase.json');
				const next = text.replace(HEADER_LINE, (_, prefix) => prefix + JSON.stringify(policy));
				if (next !== text) await writeFile(FIREBASE_JSON, next);
				const hashes = policy.match(/'sha256-/g)?.length ?? 0;
				logger.info(`CSP: ${hashes} hashes from ${routeToHeaders.size} routes — firebase.json ${next === text ? 'unchanged' : 'updated, commit it'}`);
			},
		},
	};
}
