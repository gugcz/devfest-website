/**
 * The flags-off check (`npm run flags-off`): builds the site with feature
 * flags turned off through `PUBLIC_FEATURES_OFF` and asserts that each
 * section is gone for good — no route directory in `dist/`, no sitemap
 * entry, and no built page linking to it or to its home-page anchor.
 *
 * Two builds: every optional flag off except `tickets` (so `invoice`,
 * `invite` and `workshops`' dependencies still hold), then `tickets`,
 * `invoice` and `invite` off together. Both run on the a11y fixtures
 * (`A11Y_MOCK=1`), so no network and no Firebase.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { FEATURE_LINKS } from '../src/lib/features.ts';

const DIST = path.resolve('dist');

/** The route directories each flag removes from `dist/`; the hrefs come
 * from `FEATURE_LINKS`, the same table the pages use. */
const ROUTES = {
	tickets: ['thank-you'],
	invoice: ['invoice'],
	workshops: ['workshops'],
	app: ['app', 'login', 'delete-account'],
	invite: ['invite', 'og/invite'],
	partners: ['partners'],
	newsletter: ['newsletter-subscription-thank-you'],
	attending: ['attending', 'speaker-card'],
};

const RUNS = [
	['invoice', 'workshops', 'app', 'invite', 'partners', 'newsletter', 'attending'],
	['tickets', 'invoice', 'invite'],
];

/** Legal prose is not templated (ADR 0010): a chapter rewrites these pages. */
const LEGAL = ['privacy-policy', 'delete-account', 'code-of-conduct'];

function* htmlFiles(dir) {
	for (const name of readdirSync(dir)) {
		const full = path.join(dir, name);
		if (statSync(full).isDirectory()) {
			if (!LEGAL.includes(name)) yield* htmlFiles(full);
		} else if (name.endsWith('.html') || name === 'llms.txt') yield full;
	}
}

/** `href="/invoice"` or `href="/invoice/"` or `](https://…/invoice)` in llms.txt; never `/invoice-foo`. */
function links(text, href) {
	const escaped = href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	return new RegExp(`(href="|\\]\\(https?://[^/)]+)${escaped}/?["#)?]`).test(text);
}

let failures = 0;
const fail = (msg) => {
	failures += 1;
	console.error(`  ✗ ${msg}`);
};

for (const off of RUNS) {
	console.log(`\nBuilding with off: ${off.join(', ')}`);
	execFileSync('npx', ['astro', 'build'], {
		stdio: ['ignore', 'ignore', 'inherit'],
		env: { ...process.env, A11Y_MOCK: '1', PUBLIC_FEATURES_OFF: off.join(',') },
	});
	const sitemap = readFileSync(path.join(DIST, 'sitemap-0.xml'), 'utf-8');
	const pages = [...htmlFiles(DIST)].map((f) => ({ file: path.relative(DIST, f), text: readFileSync(f, 'utf-8') }));
	for (const flag of off) {
		const routes = ROUTES[flag];
		const hrefs = FEATURE_LINKS[flag];
		for (const route of routes) {
			if (existsSync(path.join(DIST, route))) fail(`${flag}: dist/${route} was built`);
			if (sitemap.includes(`/${route}<`) || sitemap.includes(`/${route}/`)) fail(`${flag}: /${route} is in the sitemap`);
		}
		for (const { file, text } of pages) {
			for (const href of hrefs) {
				if (links(text, href)) fail(`${flag}: ${file} links ${href}`);
			}
		}
	}
	console.log(failures === 0 ? '  ✓ nothing left behind' : `  ${failures} problem(s) so far`);
}

if (failures > 0) {
	console.error(`\n${failures} dangling route(s) or link(s). A flag must remove its section everywhere.`);
	process.exit(1);
}
console.log('\nFlags off: every section removed cleanly.');
