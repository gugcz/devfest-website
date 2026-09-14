// ─── PERSONAL INVITATION — OG CARD ────────────────────────────────────────
// One card per team member, from the same `team` collection as `/invite/<id>`
// — roster and card can't drift apart.
//
// Composition A ("poster, one field"), approved from six studies (commit
// 188016e2): black ground, B&W plate full-bleed right, feathered away from
// the text, red on one word. The headline is the page's own sentence
// (`inviteCopy`) — the preview is a still of the page.
//
// Content = headline + logo + date, nothing else. A Slack unfurl thumbnail is
// ~360px (~0.3× this canvas): a 19px eyebrow rendered at 5.7px there. HARD
// RULE: nothing below ~40px on the canvas.
//
// Two traps from the prototype:
//   * satori has no `mask-image` — feathered edges are baked into the plate
//     bitmap by sharp (alpha ramp, `dest-in`).
//   * the Bebas TTF in `src/assets/fonts` carries the full Czech set
//     (verified, #305) — needed for the headline's first name.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { firstName, INVITE_EVENT } from '../../../lib/invite';

export async function getStaticPaths() {
	const team = await getCollection('team');
	return team.map((entry) => ({
		params: { member: entry.id },
		props: { member: entry.data },
	}));
}

const CARD_WIDTH = 1200;
const CARD_HEIGHT = 630;
const PLATE_WIDTH = 560;
const TEXT_COLUMN = 700;

// `astro build` bundles this endpoint's own chunk under `dist/.prerender/`,
// so a path resolved from `import.meta.url` no longer points at
// `src/assets/*` once built — only `process.cwd()` (the project root Astro
// always runs from) stays correct in both `astro dev` and the build.
const root = process.cwd();
const fontBuffer = (file: string) => readFileSync(join(root, 'src/assets/fonts', file));
const bebasNeue = fontBuffer('BebasNeue-Regular.ttf');
const jetBrainsMono = fontBuffer('JetBrainsMono-Regular.ttf');
const specialElite = fontBuffer('SpecialElite-Regular.ttf');

// Same mark `Menu.astro` / `Footer.astro` render — never a second asset.
// satori needs a data URI; the 3000×600 master frays under resvg's 5×
// downscale, so sharp pre-shrinks to 2× the drawn size (520×104 → 260×52).
const LOGO_WIDTH = 260;
const LOGO_HEIGHT = 52;
const logoDataUri = await sharp(join(root, 'src/assets/logo.png'))
	.resize(LOGO_WIDTH * 2, LOGO_HEIGHT * 2)
	.png()
	.toBuffer()
	.then((buffer) => `data:image/png;base64,${buffer.toString('base64')}`);

// ─── palette (BaseLayout.scss) ───
const BG = '#050505';
const RED_HOT = '#FF1111'; // `.red` on a dark ground
const CREAM = '#F7EFE6';

// Crop the same B&W master `/invite` uses down to the "chest" window the
// studies proved out — centred on the face, wide enough to feather without
// running out of image on the seam side. The master is 700×875.
const CHEST_CROP = { left: 96, top: 0, width: 520, height: 500 };

// The master used for cropping lives in `src/assets/team` under the same
// filename `member.photo` (a public-path string) points at.
async function platePng(file: string): Promise<string | undefined> {
	const path = join(root, 'src/assets/team', file.split('/').pop() as string);
	if (!existsSync(path)) return undefined;
	let img = sharp(path).extract(CHEST_CROP).resize(PLATE_WIDTH, CARD_HEIGHT, { fit: 'cover' });

	// satori cannot mask — the feather has to be baked into the bitmap's own
	// alpha here, with `dest-in`, before the image ever reaches the layout.
	const featherLeft = 0.34;
	const ramp = `<linearGradient id="l" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="${featherLeft}" stop-color="#fff" stop-opacity="1"/></linearGradient>`;
	const mask = Buffer.from(
		`<svg xmlns="http://www.w3.org/2000/svg" width="${PLATE_WIDTH}" height="${CARD_HEIGHT}"><defs>${ramp}</defs><g style="mix-blend-mode:multiply"><rect width="100%" height="100%" fill="url(#l)"/></g></svg>`
	);
	img = sharp(await img.png().toBuffer()).composite([{ input: mask, blend: 'dest-in' }]);

	const buffer = await img.png().toBuffer();
	return `data:image/png;base64,${buffer.toString('base64')}`;
}

// ─── post-process: grain + vignette ───────────────────────────────────────
// The two things the whole site is shot through (BaseLayout.scss). resvg
// renders neither, so they go on after satori/resvg, same order the page
// composites them.
const grainPromise = sharp({
	create: {
		width: CARD_WIDTH,
		height: CARD_HEIGHT,
		channels: 3,
		background: '#808080',
		noise: { type: 'gaussian', mean: 128, sigma: 26 },
	},
})
	.png()
	.toBuffer();

const vignette = Buffer.from(
	`<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}"><defs><radialGradient id="v" cx="50%" cy="42%" r="72%"><stop offset="50%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.45"/></radialGradient></defs><rect width="100%" height="100%" fill="url(#v)"/></svg>`
);

export const GET: APIRoute = async ({ props }) => {
	const member = props.member as {
		name: string;
		alias: string;
		role?: string;
		photo?: string;
	};

	const plate = member.photo ? await platePng(member.photo) : undefined;
	const first = firstName(member.name);
	// Same sentence as `copy.titleHtml` in `src/lib/invite.ts`, broken over
	// three chosen lines (the column is narrower than the page's). "on the"
	// and red "list." are one flex row. Red on "list." only, like the page.
	const headlineLines = [first, 'is putting you'];

	const markup = {
		type: 'div',
		props: {
			style: {
				width: `${CARD_WIDTH}px`,
				height: `${CARD_HEIGHT}px`,
				display: 'flex',
				background: BG,
				position: 'relative',
			},
			children: [
				plate
					? {
							type: 'img',
							props: {
								src: plate,
								width: PLATE_WIDTH,
								height: CARD_HEIGHT,
								style: {
									display: 'flex',
									position: 'absolute',
									right: 0,
									top: 0,
									width: `${PLATE_WIDTH}px`,
									height: `${CARD_HEIGHT}px`,
								},
							},
						}
					: undefined,
				{
					type: 'div',
					props: {
						style: {
							display: 'flex',
							position: 'absolute',
							left: 0,
							top: 0,
							width: `${TEXT_COLUMN}px`,
							height: `${CARD_HEIGHT}px`,
							flexDirection: 'column',
							justifyContent: 'center',
							padding: '0 64px',
						},
						children: [
							{
								type: 'div',
								props: {
									style: { display: 'flex', flexDirection: 'column' },
									children: [
										...headlineLines.map((line) => ({
											type: 'div',
											props: {
												style: {
													display: 'flex',
													fontFamily: 'Bebas Neue',
													fontSize: '110px',
													lineHeight: 0.92,
													textTransform: 'uppercase',
													color: CREAM,
												},
												children: line,
											},
										})),
										{
											type: 'div',
											props: {
												style: {
													display: 'flex',
													flexDirection: 'row',
													// satori collapses a trailing-space text node in a flex
													// row (verified: "on the " + "list." rendered with no
													// gap at all) — the space is an explicit `gap`, not a
													// string's trailing space.
													gap: '0.22em',
													fontFamily: 'Bebas Neue',
													fontSize: '110px',
													lineHeight: 0.92,
													textTransform: 'uppercase',
												},
												children: [
													{
														type: 'div',
														props: { style: { display: 'flex', color: CREAM }, children: 'on the' },
													},
													{
														type: 'div',
														props: { style: { display: 'flex', color: RED_HOT }, children: 'list.' },
													},
												],
											},
										},
									],
								},
							},
						],
					},
				},
				{
					type: 'div',
					props: {
						style: {
							display: 'flex',
							position: 'absolute',
							left: '64px',
							bottom: '44px',
							alignItems: 'flex-end',
							gap: '22px',
						},
						children: [
							{
								type: 'img',
								props: {
									src: logoDataUri,
									width: LOGO_WIDTH,
									height: LOGO_HEIGHT,
									style: { display: 'flex', width: `${LOGO_WIDTH}px`, height: `${LOGO_HEIGHT}px` },
								},
							},
							{
								type: 'div',
								props: {
									style: {
										display: 'flex',
										fontFamily: 'Bebas Neue',
										fontSize: '40px',
										letterSpacing: '0.04em',
										textTransform: 'uppercase',
										color: CREAM,
									},
									children: INVITE_EVENT.stamp,
								},
							},
						],
					},
				},
			].filter(Boolean),
		},
	};

	const svg = await satori(markup, {
		width: CARD_WIDTH,
		height: CARD_HEIGHT,
		fonts: [
			{ name: 'Bebas Neue', data: bebasNeue, weight: 400, style: 'normal' },
			{ name: 'JetBrains Mono', data: jetBrainsMono, weight: 400, style: 'normal' },
			{ name: 'Special Elite', data: specialElite, weight: 400, style: 'normal' },
		],
	});

	const rendered = new Resvg(svg, { fitTo: { mode: 'width', value: CARD_WIDTH } }).render().asPng();
	// removeAlpha + baseline JPEG: widest scraper support (Messenger, WhatsApp, Signal…)
	const jpg = await sharp(rendered)
		.composite([{ input: vignette }, { input: await grainPromise, blend: 'soft-light' }])
		.removeAlpha()
		.jpeg({ quality: 82, progressive: false })
		.toBuffer();

	return new Response(jpg, {
		headers: {
			'Content-Type': 'image/jpeg',
			'Cache-Control': 'public, max-age=31536000, immutable',
		},
	});
};
