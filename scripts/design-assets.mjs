// Fetches the images the pencil canvas (design/devfest.pen) needs but the
// repository cannot serve: speaker portraits (Firebase Storage at runtime),
// the press clippings (external sites), and PNG renders of the SVG/AVIF
// partner and press-kit logos (Pencil paints WebP/PNG only, and not remote
// URLs). Output goes to design/assets/, which is gitignored.
//
//   node scripts/design-assets.mjs
//
// Needs the devDependency playwright (for the SVG renders) and network.
import { mkdirSync, readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';

const out = 'design/assets';
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
for (const d of ['speakers', 'press', 'partners', 'presskit']) mkdirSync(`${out}/${d}`, { recursive: true });

const fetchTo = async (url, path) => {
	const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0' } });
	if (!res.ok) throw new Error(`${res.status} ${url}`);
	writeFileSync(path, Buffer.from(await res.arrayBuffer()));
};

// 1. Speaker portraits from the public lineup endpoint.
const { speakers } = await (await fetch('https://devfest.cz/api/lineup')).json();
for (const s of speakers) {
	if (!s.profilePicture) continue;
	await fetchTo(s.profilePicture, `${out}/speakers/${slug(s.fullName)}.jpg`);
}
console.log(`${speakers.length} speaker portraits`);

// 2. Press clippings: the <img> thumbnails on /press.
const press = await (await fetch('https://devfest.cz/press/')).text();
const clips = [...press.matchAll(/<img src="(https?:\/\/[^"]+)" alt="" loading="lazy"/g)].map((m) => m[1]);
let i = 1;
for (const u of clips) {
	const tmp = `${out}/press/clip-${i}.tmp`;
	await fetchTo(u, tmp);
	execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '75', '-Z', '800', tmp, '--out', `${out}/press/clip-${i}.jpg`], { stdio: 'ignore' });
	execFileSync('rm', [tmp]);
	i++;
}
console.log(`${clips.length} press clippings`);

// 3. SVG/AVIF logos rendered to PNG with a transparent ground.
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 800, height: 400 }, deviceScaleFactor: 2 });
const renderSvg = async (svgPath, pngPath) => {
	const svg = readFileSync(svgPath, 'utf8').replace('<svg', '<svg style="max-width:720px;max-height:320px;width:auto;height:auto"');
	await page.setContent(`<body style="margin:0;background:transparent;display:flex;align-items:center;justify-content:center;width:800px;height:400px">${svg}</body>`);
	await page.waitForTimeout(100);
	await (await page.$('svg')).screenshot({ path: pngPath, omitBackground: true });
};
for (const tier of readdirSync('src/assets/partners')) {
	for (const f of readdirSync(`src/assets/partners/${tier}`)) {
		if (f.endsWith('.svg')) await renderSvg(`src/assets/partners/${tier}/${f}`, `${out}/partners/${tier}-${f}.png`);
		else if (f.endsWith('.avif')) execFileSync('sips', ['-s', 'format', 'png', `src/assets/partners/${tier}/${f}`, '--out', `${out}/partners/${tier}-${f.replace(/\.avif$/, '.png')}`], { stdio: 'ignore' });
	}
}
await renderSvg('public/press-kit/df26_logo-1st.svg', `${out}/presskit/df26_logo-1st.svg.png`);
await browser.close();
console.log('logo renders done');
