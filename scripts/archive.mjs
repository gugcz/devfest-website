/**
 * `npm run archive -- <year>`: freezes the edition this checkout builds into
 * `archive/<year>/`, served at `devfest.cz/<year>` (ADR 0011). Run it once,
 * when the edition is over and before the root switches to the next one.
 *
 * 1. Reads the live `/api/lineup` and downloads every speaker photo (resized
 *    to WebP), because production moves on to the next edition's lineup.
 * 2. Builds the site with `PUBLIC_ARCHIVE=<year>`: Astro's `base` is
 *    `/<year>`, `src/middleware.ts` rebases every link, the islands read the
 *    frozen lineup, and the live-only sections (`app`, `newsletter`) are off.
 * 3. Adds the frozen data to the output, drops what only the root serves
 *    (`robots.txt`, `404.html`), and rebases the web manifest.
 * 4. Fails if any page, stylesheet or text file still points at a site URL
 *    outside `/<year>`; lists what a script bundle names, for a look.
 * 5. Replaces `archive/<year>/` with the result.
 *
 * `ARCHIVE_SOURCE=https://…` reads the lineup from another origin.
 */
import { spawnSync } from 'node:child_process';
import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const year = process.argv[2];
if (!/^\d{4}$/.test(year ?? '')) {
	console.error('Usage: npm run archive -- <year>');
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
/** Off in the archive: they belong to the live site (the app's pages, the newsletter form). */
const LIVE_ONLY = ['app', 'newsletter'];
const PHOTO_WIDTH = 800;

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
	},
});
if (build.status !== 0) process.exit(build.status ?? 1);

// 3. Frozen data in, root-only files out.
await cp(PHOTOS, path.join(OUT, 'speaker-photos'), { recursive: true });
await mkdir(path.join(OUT, 'api'), { recursive: true });
await cp(path.join(DATA, 'lineup.json'), path.join(OUT, 'api', 'lineup.json'));
for (const file of ['robots.txt', '404.html']) await rm(path.join(OUT, file), { force: true });
const manifest = path.join(OUT, 'site.webmanifest');
await writeFile(
	manifest,
	(await readFile(manifest, 'utf8')).replace(/"(\/(?!\/)[^"]*)"/g, (_, url) => `"${url === '/' ? BASE : BASE + url}"`),
);

// 4. Every site URL in the output must stay under /<year>.
const outside = (url) => url !== BASE && !url.startsWith(`${BASE}/`) && !url.startsWith(`${BASE}#`) && !url.startsWith(`${BASE}?`);
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
		if (urlPath && urlPath !== '/' && outside(urlPath)) failures.push(`${rel}: ${SITE}${urlPath}`);
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
await cp(OUT, TARGET, { recursive: true });
let bytes = 0;
let files = 0;
for await (const file of walk(TARGET)) {
	bytes += (await stat(file)).size;
	files += 1;
}
console.log(`\n✓ archive/${year}/: ${files} files, ${(bytes / 1024 / 1024).toFixed(1)} MB, served at ${SITE}${BASE}`);
