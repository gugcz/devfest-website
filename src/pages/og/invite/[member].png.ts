// ─── PERSONAL INVITATION — OG CARD ────────────────────────────────────────
// One PNG per team member, built from the same `team` collection as
// `/invite/<id>` — a new member gets a card automatically, and the roster and
// the card can never drift apart. Composed with satori (layout → SVG) +
// resvg (SVG → PNG), never a hand-exported file (see the issue thread: a
// generated card is what keeps a 13th team member from silently falling back
// to the generic banner).
//
// Card language matches `/invite`: B&W plate on the right (no colour bleed —
// colour is the page's reward, not the preview's), a flat red field on the
// left, full-cream ink on that field. No gradient anywhere.
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
const PLATE_WIDTH = 500;

// `astro build` bundles this endpoint's own chunk under `dist/.prerender/`,
// so a path resolved from `import.meta.url` no longer points at
// `src/assets/*` once built — only `process.cwd()` (the project root Astro
// always runs from) stays correct in both `astro dev` and the build.
const root = process.cwd();
const fontBuffer = (file: string) => readFileSync(join(root, 'src/assets/fonts', file));
const bebasNeue = fontBuffer('BebasNeue-Regular.ttf');
const jetBrainsMono = fontBuffer('JetBrainsMono-Regular.ttf');

// Crop the same B&W master `/invite` uses to exactly the plate's on-card size
// — the master is 700×875, so a 500×630 cover-crop is a downscale, never an
// upscale.
async function platePng(file: string): Promise<string | undefined> {
	// `member.photo` is a public-path string (`/team/<file>.webp`); the master
	// used for cropping lives in `src/assets/team` under the same filename.
	const path = join(root, 'src/assets/team', file.split('/').pop() as string);
	if (!existsSync(path)) return undefined;
	const buffer = await sharp(path)
		.resize(PLATE_WIDTH, CARD_HEIGHT, { fit: 'cover', position: 'attention' })
		.png()
		.toBuffer();
	return `data:image/png;base64,${buffer.toString('base64')}`;
}

export const GET: APIRoute = async ({ props }) => {
	const member = props.member as {
		name: string;
		role?: string;
		photo?: string;
	};

	const plate = member.photo ? await platePng(member.photo) : undefined;
	const name = firstName(member.name);

	const markup = {
		type: 'div',
		props: {
			style: {
				width: `${CARD_WIDTH}px`,
				height: `${CARD_HEIGHT}px`,
				display: 'flex',
				background: '#050505',
			},
			children: [
				{
					type: 'div',
					props: {
						style: {
							width: `${CARD_WIDTH - PLATE_WIDTH}px`,
							height: `${CARD_HEIGHT}px`,
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'center',
							background: '#CC0000',
							padding: '0 56px',
						},
						children: [
							{
								type: 'div',
								props: {
									style: {
										display: 'flex',
										fontFamily: 'Bebas Neue',
										fontSize: '104px',
										lineHeight: 1,
										color: '#F7EFE6',
										textTransform: 'uppercase',
									},
									children: name,
								},
							},
							{
								type: 'div',
								props: {
									style: {
										display: 'flex',
										fontFamily: 'Bebas Neue',
										fontSize: '64px',
										lineHeight: 1.05,
										color: '#F7EFE6',
										textTransform: 'uppercase',
										marginTop: '8px',
									},
									children: 'invites you to DevFest.cz 2026',
								},
							},
							{
								type: 'div',
								props: {
									style: {
										display: 'flex',
										fontFamily: 'JetBrains Mono',
										fontSize: '22px',
										color: 'rgba(247, 239, 230, 0.85)',
										marginTop: '28px',
									},
									children: roleLine(member.role),
								},
							},
							{
								type: 'div',
								props: {
									style: {
										display: 'flex',
										fontFamily: 'JetBrains Mono',
										fontSize: '20px',
										letterSpacing: '0.08em',
										textTransform: 'uppercase',
										color: 'rgba(247, 239, 230, 0.7)',
										marginTop: '36px',
									},
									children: INVITE_EVENT.stamp,
								},
							},
						],
					},
				},
				plate
					? {
							type: 'img',
							props: {
								src: plate,
								width: PLATE_WIDTH,
								height: CARD_HEIGHT,
								style: { display: 'flex' },
							},
						}
					: {
							type: 'div',
							props: {
								style: {
									width: `${PLATE_WIDTH}px`,
									height: `${CARD_HEIGHT}px`,
									display: 'flex',
									background: '#050505',
								},
							},
						},
			],
		},
	};

	const svg = await satori(markup, {
		width: CARD_WIDTH,
		height: CARD_HEIGHT,
		fonts: [
			{ name: 'Bebas Neue', data: bebasNeue, weight: 400, style: 'normal' },
			{ name: 'JetBrains Mono', data: jetBrainsMono, weight: 400, style: 'normal' },
		],
	});

	const png = new Resvg(svg, { fitTo: { mode: 'width', value: CARD_WIDTH } }).render().asPng();

	return new Response(png, {
		headers: {
			'Content-Type': 'image/png',
			'Cache-Control': 'public, max-age=31536000, immutable',
		},
	});
};
