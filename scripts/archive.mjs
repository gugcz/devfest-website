/**
 * `npm run archive -- <year>`: freezes the edition this checkout's config
 * describes (`config.event`, which must be `<year>`) into `archive/<year>/`,
 * served at `devfest.cz/<year>` (ADR 0011). Run it when the edition is over;
 * it works before and after the root switches to the teaser, as long as
 * `config.event` is still that edition.
 *
 * 1. Reads the live `/api/lineup` and downloads every speaker photo (resized
 *    to WebP), because production moves on to the next edition's lineup.
 * 2. Builds the site with `PUBLIC_ARCHIVE=<year>`: Astro's `base` is
 *    `/<year>`, `src/middleware.ts` rebases every link and points the
 *    live-only pages (the privacy policy, the code of conduct) at the live
 *    site, the islands read the frozen lineup, the flags are the config's
 *    (plus `PUBLIC_FEATURES_ON`, e.g. `tickets` if it was switched off
 *    before the archive) and the live-only sections (`app`, `newsletter`)
 *    are off.
 * 3. Adds the frozen data to the output, drops what only the root serves
 *    (`robots.txt`, `404.html`, the live-only pages), and rebases the web
 *    manifest.
 * 4. Fails if any page, stylesheet or text file points at a site URL
 *    outside `/<year>` other than the live root, another archive or a
 *    live-only page; lists what a script bundle names, for a look.
 * 5. Replaces `archive/<year>/` with the result, plus `edition.json`: the
 *    edition's facts (date, venue, audience) that the live site states
 *    about its last edition once `config.event` has moved on, and drops the
 *    year's fetch stamp so the next live build refetches the pinned build.
 *    Prints the `firebase.json` redirects for the edition's share pages.
 *    The output is published on the `archives` branch and pinned in
 *    `archive/sources.json` (ADR 0013, `docs/adapting.md`).
 *
 * `npm run archive -- <year> --facts` writes only `archive/<year>/edition.json`
 * (for an archive made before the file existed).
 * `ARCHIVE_SOURCE=https://…` reads the lineup from another origin.
 */
import { spawnSync } from 'node:child_process';
import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { runnerImport } from 'vite';

const year = process.argv[2];
const factsOnly = process.argv.includes('--facts');
if (!/^\d{4}$/.test(year ?? '')) {
	console.error('Usage: npm run archive -- <year> [--facts]');
	process.exit(1);
}

const SITE = 'https://devfest.cz';
const SOURCE = process.env.ARCHIVE_SOURCE || SITE;
const BASE = `/${year}`;
const WORK = path.resolve('.archive', year);
const DATA = path.join(WORK, 'data');
const PHOTOS = path.join(WORK, 'speaker-photos');
const OUT = path.join(WORK, 'site');
const TARGET = path.resolve('archive', year);
/** `ensureArchives()` (src/lib/archive-sources.ts) trusts a year this stamp names. */
const STAMP = `${TARGET}.source`;
/** Off in the archive: they belong to the live site (the app's pages, the newsletter form). */
const LIVE_ONLY = ['app', 'newsletter'];
/** Pages only the live site serves; mirrors `LIVE_ONLY_PATHS` in `src/lib/base.ts`. */
const LIVE_ONLY_PAGES = ['privacy-policy', 'code-of-conduct'];
const PHOTO_WIDTH = 800;

/**
 * The edition's facts from this checkout's config, read through Vite's module
 * runner (the config is TypeScript). Fails unless the config describes `year`.
 */
async function editionFacts() {
	const { module } = await runnerImport('./src/lib/event.ts');
	const { default: config } = (await runnerImport('./src/site.config.ts')).module;
	const { event } = config;
	if (event.edition !== Number(year) || !event.date) {
		throw new Error(`src/site.config.ts describes ${event.edition}${event.date ? '' : ' without a date'}; archive ${year} from a commit whose config still has it.`);
	}
	return {
		year: event.edition,
		name: module.EVENT.name,
		start: event.date.start,
		dateLabel: module.EVENT.dateLabel,
		venue: event.venue?.name ?? null,
		city: module.EVENT.city,
		audience: event.audience ?? null,
	};
}
const FACTS = `${JSON.stringify(await editionFacts(), null, '\t')}\n`;

if (factsOnly) {
	await mkdir(TARGET, { recursive: true });
	await writeFile(path.join(TARGET, 'edition.json'), FACTS);
	await rm(STAMP, { force: true });
	console.log(`✓ archive/${year}/edition.json`);
	process.exit(0);
}

await rm(WORK, { recursive: true, force: true });
await mkdir(DATA, { recursive: true });
await mkdir(PHOTOS, { recursive: true });

// 1. Freeze the lineup and the photos.
console.log(`Reading ${SOURCE}/api/lineup`);
const res = await fetch(`${SOURCE}/api/lineup`, { signal: AbortSignal.timeout(30_000) });
if (!res.ok) throw new Error(`/api/lineup answered ${res.status}`);
const lineup = await res.json();
if (!Array.isArray(lineup.speakers) || !Array.isArray(lineup.sessions)) {
	throw new Error('/api/lineup has no speakers or sessions; nothing to archive');
}

// sharp ships with Astro (its image service); imported here so a missing
// one fails with a sentence, not a stack.
const { default: sharp } = await import('sharp').catch(() => {
	throw new Error('sharp is missing: run `npm ci` first (Astro installs it).');
});

let photos = 0;
for (const speaker of lineup.speakers) {
	if (typeof speaker.profilePicture !== 'string' || !/^https?:\/\//.test(speaker.profilePicture)) continue;
	if (!/^[A-Za-z0-9-]{1,64}$/.test(speaker.id ?? '')) continue;
	const photo = await fetch(speaker.profilePicture, { signal: AbortSignal.timeout(30_000) });
	if (!photo.ok) {
		console.warn(`  ⚠ ${speaker.fullName}: photo answered ${photo.status}; kept without one`);
		speaker.profilePicture = '';
		continue;
	}
	const file = `${speaker.id}.webp`;
	await sharp(Buffer.from(await photo.arrayBuffer()))
		.rotate()
		.resize({ width: PHOTO_WIDTH, withoutEnlargement: true })
		.webp({ quality: 80 })
		.toFile(path.join(PHOTOS, file));
	speaker.profilePicture = `${BASE}/speaker-photos/${file}`;
	photos += 1;
}
await writeFile(path.join(DATA, 'lineup.json'), JSON.stringify(lineup));
console.log(`Froze ${lineup.speakers.length} speakers (${photos} photos), ${lineup.sessions.length} sessions`);

// 2. Build the archive.
const build = spawnSync('npx', ['astro', 'build'], {
	stdio: 'inherit',
	env: {
		...process.env,
		PUBLIC_ARCHIVE: year,
		ARCHIVE_DATA: DATA,
		PUBLIC_FEATURES_OFF: [process.env.PUBLIC_FEATURES_OFF, ...LIVE_ONLY].filter(Boolean).join(','),
		PUBLIC_FEATURES_ON: process.env.PUBLIC_FEATURES_ON ?? '',
	},
});
if (build.status !== 0) process.exit(build.status ?? 1);

// 3. Frozen data in, root-only files out.
await writeFile(path.join(OUT, 'edition.json'), FACTS);
await cp(PHOTOS, path.join(OUT, 'speaker-photos'), { recursive: true });
await mkdir(path.join(OUT, 'api'), { recursive: true });
await cp(path.join(DATA, 'lineup.json'), path.join(OUT, 'api', 'lineup.json'));
for (const file of ['robots.txt', '404.html', ...LIVE_ONLY_PAGES]) {
	await rm(path.join(OUT, file), { recursive: true, force: true });
}
const manifest = path.join(OUT, 'site.webmanifest');
await writeFile(
	manifest,
	(await readFile(manifest, 'utf8')).replace(/"(\/(?!\/)[^"]*)"/g, (_, url) => `"${url === '/' ? BASE : BASE + url}"`),
);

// 4. Every site URL in the output must stay under /<year>.
const under = (url, base) => url === base || url.startsWith(`${base}/`) || url.startsWith(`${base}#`) || url.startsWith(`${base}?`);
const outside = (url) => !under(url, BASE);
/** An absolute URL may also name the live root, another archive or a live-only page. */
const elsewhereAllowed = (url) =>
	url === '/' || /^\/\d{4}(?:[/#?]|$)/.test(url) || LIVE_ONLY_PAGES.some((page) => under(url, `/${page}`));
const ATTR = /\s(?:href|src|action|poster|content|srcset|imagesrcset)=(["'])(.*?)\1/g;
const ABSOLUTE = /https:\/\/devfest\.cz(\/[^\s"'<>)\\]*)?/g;
const CSS_URL = /url\(\s*['"]?(\/(?!\/)[^'")\s]*)/g;
const JS_PATH = /["'`](\/(?:agenda|speakers|talks|venue|faq|team|contact|partners|press|gallery|api|privacy-policy|code-of-conduct)\b[^"'`]*)/g;

const failures = [];
const notes = new Set();

async function* walk(dir) {
	for (const entry of await readdir(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) yield* walk(full);
		else yield full;
	}
}

for await (const file of walk(OUT)) {
	const rel = path.relative(OUT, file);
	const ext = path.extname(file);
	if (!['.html', '.css', '.js', '.xml', '.txt', '.ics', '.json', '.webmanifest'].includes(ext)) continue;
	const text = await readFile(file, 'utf8');
	// An absolute site URL may name the live root (the link to the current
	// edition, the Organization and WebSite in the JSON-LD) or the archive.
	for (const [, urlPath] of text.matchAll(ABSOLUTE)) {
		if (urlPath && outside(urlPath) && !elsewhereAllowed(urlPath)) failures.push(`${rel}: ${SITE}${urlPath}`);
	}
	if (ext === '.html') {
		for (const [, , value] of text.matchAll(ATTR)) {
			for (const candidate of value.split(',')) {
				const url = candidate.trim().split(/\s+/)[0];
				if (url.startsWith('/') && !url.startsWith('//') && outside(url)) failures.push(`${rel}: ${url}`);
			}
		}
	}
	if (ext === '.html' || ext === '.css') {
		for (const [, url] of text.matchAll(CSS_URL)) if (outside(url)) failures.push(`${rel}: url(${url})`);
	}
	if (ext === '.js') {
		for (const [, url] of text.matchAll(JS_PATH)) if (outside(url)) notes.add(url);
	}
}

if (failures.length > 0) {
	console.error(`\n✗ ${failures.length} URL(s) outside ${BASE}:`);
	for (const failure of [...new Set(failures)].slice(0, 60)) console.error(`  ${failure}`);
	process.exit(1);
}
if (notes.size > 0) {
	console.log(`\nScript bundles name these site paths outside ${BASE} (a branch the build has off, or a fallback; check they never render):`);
	for (const note of [...notes].sort()) console.log(`  ${note}`);
}

// 5. Replace the archive.
await rm(TARGET, { recursive: true, force: true });
await rm(STAMP, { force: true });
await cp(OUT, TARGET, { recursive: true });
let bytes = 0;
let files = 0;
for await (const file of walk(TARGET)) {
	bytes += (await stat(file)).size;
	files += 1;
}
console.log(`\n✓ archive/${year}/: ${files} files, ${(bytes / 1024 / 1024).toFixed(1)} MB, served at ${SITE}${BASE}`);

// The edition's share pages answer 301 for good from the root (ADR 0011):
// by id, so the next edition's own `/speakers/<id>` and `/talks/<id>` stay free.
const ids = async (kind) =>
	(await readdir(path.join(TARGET, kind), { withFileTypes: true }))
		.filter((entry) => entry.isDirectory())
		.map((entry) => entry.name)
		.sort();
console.log('\nAdd to firebase.json → hosting.redirects:');
for (const kind of ['speakers', 'talks']) {
	const list = await ids(kind).catch(() => []);
	if (list.length > 0) {
		console.log(`  { "regex": "^/${kind}/(${list.join('|')})$", "destination": "${BASE}/${kind}/:1", "type": 301 },`);
	}
}
