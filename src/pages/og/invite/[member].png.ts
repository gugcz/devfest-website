// ─── PERSONAL INVITATION — OG CARD ────────────────────────────────────────
// One PNG per team member, built from the same `team` collection as
// `/invite/<id>` — a new member gets a card automatically, and the roster and
// the card can never drift apart.
//
// Composition A ("poster, one field"), approved from the six studies in the
// issue thread (proto-og/render.mjs, commit 188016e2 on agent/mika/devf-45):
// black ground, the B&W plate full-bleed on the right feathered away from the
// text column, red spent on one word only. The headline is the page's own
// sentence (`inviteCopy` / `[member].astro`) — the preview is a still of the
// page, not a second piece of copy.
//
// Two traps proved out in the prototype, both apply here unchanged:
//   * satori has no `mask-image` — every feathered edge has to be baked into
//     the plate bitmap by sharp (an alpha ramp composited with `dest-in`)
//     before the image reaches the layout.
//   * personal, per-role copy (`roleLine`) is set in Special Elite, never the
//     member's name — the Bebas TTF in `src/assets/fonts` carries the full
//     Czech set (verified against #305), but Special Elite does not, and a
//     name is the one string here that can carry diacritics.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { firstName, roleLine, INVITE_EVENT } from '../../../lib/invite';

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

// Same mark `Menu.astro` / `Footer.astro` render — never a second asset, so
// the card's logo can't drift from the site's. satori can't read a file off
// disk, so it goes in as a data URI; the source is a 3000×600 master, and
// resvg frays a 5× downscale, so sharp pre-shrinks to 2× the drawn size
// (360×72 → drawn at 180×36) before it ever reaches satori.
const LOGO_WIDTH = 180;
const LOGO_HEIGHT = 36;
const logoDataUri = await sharp(join(root, 'src/assets/logo.png'))
	.resize(LOGO_WIDTH * 2, LOGO_HEIGHT * 2)
	.png()
	.toBuffer()
	.then((buffer) => `data:image/png;base64,${buffer.toString('base64')}`);

// ─── palette (BaseLayout.scss) ───
const BG = '#050505';
const RED_HOT = '#FF1111'; // `.red` on a dark ground
const CREAM = '#F7EFE6';
const BONE = 'rgba(247, 239, 230, 0.72)';
const MUTED = 'rgba(240, 237, 230, 0.55)';

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
	const eyebrow = `${member.alias}${member.role ? ` · ${member.role}` : ''}`;
	// Same sentence as `copy.titleHtml` in `src/lib/invite.ts`, broken over
	// three lines — the text column here is narrower than the page's, so the
	// break is chosen rather than left to wrapping. The third line's "on the"
	// and red "list." are inline children of one flex row below, not two
	// stacked lines. Red is spent on "list." only, exactly like the page.
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
									style: {
										display: 'flex',
										fontFamily: 'JetBrains Mono',
										fontSize: '19px',
										letterSpacing: '0.14em',
										textTransform: 'uppercase',
										color: MUTED,
									},
									children: eyebrow,
								},
							},
							{ type: 'div', props: { style: { height: '26px', display: 'flex' } } },
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
													fontSize: '86px',
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
													fontSize: '86px',
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
							{ type: 'div', props: { style: { height: '26px', display: 'flex' } } },
							{
								type: 'div',
								props: {
									style: {
										display: 'flex',
										fontFamily: 'Special Elite',
										fontSize: '23px',
										lineHeight: 1.4,
										color: BONE,
										width: '500px',
									},
									children: roleLine(member.role),
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
										fontFamily: 'JetBrains Mono',
										fontSize: '16px',
										letterSpacing: '0.14em',
										textTransform: 'uppercase',
										color: MUTED,
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
	const png = await sharp(rendered)
		.composite([{ input: vignette }, { input: await grainPromise, blend: 'soft-light' }])
		.png()
		.toBuffer();

	return new Response(png, {
		headers: {
			'Content-Type': 'image/png',
			'Cache-Control': 'public, max-age=31536000, immutable',
		},
	});
};
