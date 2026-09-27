// Fails when browser code imports a Firebase database client SDK.
// The browser reads Firestore and RTDB only through the cached `/api/*`
// functions (see CLAUDE.md, "Browser data access"); a client read waits on an
// App Check token and stalls for ~30s on mobile.
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const SRC = join(ROOT, 'src');
const EXTENSIONS = /\.(astro|[cm]?[jt]sx?)$/;
// `firebase/firestore`, `firebase/firestore/lite`, `firebase/database`, and the
// `@firebase/*` packages behind them, in static and dynamic imports alike.
const FORBIDDEN = /(?:from\s*|import\s*\(\s*|import\s+)['"]@?firebase\/(firestore|database)(?:\/[^'"]*)?['"]/g;

async function* walk(dir) {
	for (const entry of await readdir(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) yield* walk(path);
		else if (EXTENSIONS.test(entry.name)) yield path;
	}
}

const hits = [];
for await (const file of walk(SRC)) {
	const text = await readFile(file, 'utf8');
	for (const match of text.matchAll(FORBIDDEN)) {
		const line = text.slice(0, match.index).split('\n').length;
		hits.push(`${relative(ROOT, file)}:${line}  ${match[0]}`);
	}
}

if (hits.length) {
	console.error('Browser code must not import a Firebase database SDK; read through /api/* instead:');
	for (const hit of hits) console.error(`  ${hit}`);
	process.exit(1);
}
console.log('check-client-sdk: no Firebase database SDK imports in src/');
