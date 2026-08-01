/**
 * Build-time Open Graph card renderer.
 *
 * Every page shared the one static /og-image.jpg, so a speaker posting their
 * talk and someone linking the partners page produced identical previews — the
 * share said nothing about what was being shared. These cards carry the actual
 * name and title, which is the difference between a link people scroll past and
 * one they click.
 *
 * Node-only: imported from `.astro` / endpoint files, runs during `astro build`,
 * never ships to the browser. satori lays out a subset of flexbox into SVG;
 * resvg rasterises it to PNG (the format every scraper handles — several still
 * ignore SVG).
 */
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';

/** Facebook/X/LinkedIn all crop to ~1.91:1; this is the size they all accept. */
export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

// Brand palette, duplicated from BaseLayout.scss because satori resolves no CSS
// variables — it only sees the inline styles below.
const BG = '#050505';
const TEXT = '#F2EFE9';
const GREY = '#8C8C8C';
const ACCENT = '#FF1111';
const PANEL = '#141414';

// Resolved from the project root, NOT from `import.meta.url`: this module is
// bundled into dist/.prerender before it runs, so a URL relative to the module
// points at the bundle's own directory and the fonts are not there.
// `astro build` always runs at the project root, which makes cwd stable.
const fontFile = (name: string) => resolve(process.cwd(), 'src/assets/og-fonts', name);

/**
 * satori needs real font buffers — it cannot use the woff2 the Astro Fonts API
 * downloads for the browser (no built-in Brotli), so these three faces are
 * committed as TTF next to their licences. Loaded once per build.
 */
let fontsPromise: Promise<Array<{ name: string; data: Buffer; weight: 400; style: 'normal' }>> | null =
	null;

function loadFonts() {
	fontsPromise ??= Promise.all([
		readFile(fontFile('bebas-neue-regular.ttf')),
		readFile(fontFile('special-elite-regular.ttf')),
		// The STATIC instance, not the variable `JetBrainsMono[wght].ttf` Google
		// ships: satori cannot parse that one and dies with an opaque
		// "Cannot read properties of undefined" during layout.
		readFile(fontFile('jetbrains-mono-regular.ttf')),
	]).then(([bebas, elite, mono]) => [
		{ name: 'Bebas Neue', data: bebas, weight: 400 as const, style: 'normal' as const },
		{ name: 'Special Elite', data: elite, weight: 400 as const, style: 'normal' as const },
		{ name: 'JetBrains Mono', data: mono, weight: 400 as const, style: 'normal' as const },
	]);
	return fontsPromise;
}

/** Portrait plate size on the card — the source is resized to exactly this. */
const PLATE_WIDTH = 420;
const PLATE_HEIGHT = OG_HEIGHT;

/**
 * Fetch a remote image (speaker portraits live on Firebase Storage), grade it
 * to match the site, and inline it as a data URI.
 *
 * satori will not fetch for us, so the bytes have to be embedded. Two things
 * happen on the way in:
 *
 *  - **Grayscale.** Every portrait on this site is B&W at rest; a full-colour
 *    face on the share card would be the one place the treatment breaks. The
 *    grade mirrors the `grayscale(1) contrast(1.14) brightness(0.84)` used by
 *    the lineup sheet: contrast around mid-grey is `1.14x − 17.9`, and the 0.84
 *    brightness multiplies through to `0.96x − 15`.
 *  - **Resize to the plate.** The source portraits are far larger than the
 *    420px plate, and every wasted pixel is embedded as base64 inside a PNG
 *    that social scrapers have to download.
 *
 * A card that silently loses its portrait is worse than one designed without
 * it, so any failure returns null and the caller falls back to the monogram.
 */
export async function inlineImage(url: string): Promise<string | null> {
	if (!url) return null;
	try {
		const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
		if (!res.ok) return null;
		const source = Buffer.from(await res.arrayBuffer());

		const { default: sharp } = await import('sharp');
		const graded = await sharp(source)
			// `position: top` keeps faces in frame — a centre crop on a portrait
			// tends to cut foreheads.
			.resize(PLATE_WIDTH, PLATE_HEIGHT, { fit: 'cover', position: 'top' })
			.grayscale()
			.linear(0.96, -15)
			.png({ compressionLevel: 9 })
			.toBuffer();

		return `data:image/png;base64,${graded.toString('base64')}`;
	} catch {
		return null;
	}
}

/** Two-letter monogram, mirroring `initials()` in lib/speakers.ts. */
function monogram(name: string): string {
	return (
		name
			.split(/\s+/)
			.filter(Boolean)
			.map((word) => word[0] ?? '')
			.slice(0, 2)
			.join('')
			.toUpperCase() || '?'
	);
}

/**
 * Keep long titles from overflowing the card. satori has no `text-overflow`,
 * so the cut happens here, at a word boundary.
 */
function clamp(value: string, max: number): string {
	const flat = value.replace(/\s+/g, ' ').trim();
    if (flat.length <= max) return flat;
	const cut = flat.slice(0, max - 1);
	const lastSpace = cut.lastIndexOf(' ');
	return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

export interface CardOptions {
	/** Mono eyebrow — "Speaker", the track name, … */
	kicker: string;
	/** The headline: a person's name or a talk title. */
	title: string;
	/** Secondary line under the title — a tagline, or the speakers on a talk. */
	subtitle?: string;
	/** Data URI for the portrait; omit for the text-only layout. */
	image?: string | null;
	/** Fallback monogram when `image` is absent but a person is the subject. */
	initialsFor?: string;
}

/**
 * The shared card. A red hairline rule under the eyebrow, the title in the
 * site's typewriter face, a portrait plate on the right when there is one, and
 * the event's fixed details along the bottom — so the card answers "what is
 * this and when" even when it is seen with no surrounding text.
 */
function card(options: CardOptions) {
	const { kicker, title, subtitle, image, initialsFor } = options;
	const hasPortrait = Boolean(image) || Boolean(initialsFor);
	const contentWidth = hasPortrait ? OG_WIDTH - PLATE_WIDTH : OG_WIDTH;
	// Long titles get a smaller face rather than a clipped one.
	const titleSize = title.length > 68 ? 54 : title.length > 40 ? 66 : 82;

	return {
		type: 'div',
		props: {
			style: {
				width: '100%',
				height: '100%',
				display: 'flex',
				backgroundColor: BG,
				color: TEXT,
				// Faint red wash from the top-left, echoing the site's glow.
				backgroundImage: `radial-gradient(900px 600px at 8% 0%, rgba(204,0,0,0.20) 0%, rgba(5,5,5,0) 60%)`,
			},
			children: [
				{
					type: 'div',
					props: {
						style: {
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'space-between',
							// Explicit width rather than flexGrow + shrink. The card is a
							// fixed 1200×630, so the split is known up front — and letting
							// satori negotiate it does not work: a long title makes the
							// text column's intrinsic width exceed the card, and neither
							// `minWidth: 0` here nor `flexShrink: 0` on the plate stopped
							// the plate collapsing to zero. Fixed widths also give the
							// title a definite measure to wrap against.
							width: `${contentWidth}px`,
							flexShrink: 0,
							padding: '64px 56px',
						},
						children: [
							// Eyebrow + red rule
							{
								type: 'div',
								props: {
									style: { display: 'flex', alignItems: 'center', gap: '18px' },
									children: [
										{
											type: 'div',
											props: {
												style: {
													fontFamily: 'JetBrains Mono',
													fontSize: 22,
													letterSpacing: '0.32em',
													textTransform: 'uppercase',
													color: 'rgba(240,237,230,0.62)',
												},
												children: kicker.toUpperCase(),
											},
										},
										{
											type: 'div',
											props: {
												style: { width: '90px', height: '2px', backgroundColor: ACCENT },
											},
										},
									],
								},
							},
							// Headline + optional subtitle
							{
								type: 'div',
								props: {
									style: { display: 'flex', flexDirection: 'column', gap: '20px' },
									children: [
										{
											type: 'div',
											props: {
												style: {
													fontFamily: 'Special Elite',
													fontSize: titleSize,
													lineHeight: 1.12,
													color: TEXT,
												},
												children: clamp(title, 110),
											},
										},
										...(subtitle
											? [
													{
														type: 'div',
														props: {
															style: {
																fontFamily: 'JetBrains Mono',
																fontSize: 26,
																lineHeight: 1.5,
																color: GREY,
															},
															children: clamp(subtitle, 90),
														},
													},
												]
											: []),
									],
								},
							},
							// Fixed event footer
							{
								type: 'div',
								props: {
									style: { display: 'flex', alignItems: 'center', gap: '16px' },
									children: [
										{
											type: 'div',
											props: {
												style: {
													fontFamily: 'Bebas Neue',
													fontSize: 40,
													letterSpacing: '0.04em',
													color: TEXT,
												},
												children: 'DEVFEST.CZ 2026',
											},
										},
										{
											type: 'div',
											props: {
												style: { width: '2px', height: '28px', backgroundColor: ACCENT },
											},
										},
										{
											type: 'div',
											props: {
												style: {
													fontFamily: 'JetBrains Mono',
													fontSize: 22,
													letterSpacing: '0.14em',
													color: GREY,
												},
												children: '30 OCT 2026 · PRAGUE',
											},
										},
									],
								},
							},
						],
					},
				},
				// Portrait plate — mirrors the mounted print on the lineup sheet.
				...(hasPortrait
					? [
							{
								type: 'div',
								props: {
									style: {
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										width: `${PLATE_WIDTH}px`,
										flexShrink: 0,
										height: '100%',
										backgroundColor: PANEL,
										borderLeft: `1px solid rgba(240,237,230,0.16)`,
									},
									children: image
										? [
												{
													type: 'img',
													props: {
														src: image,
														width: PLATE_WIDTH,
														height: PLATE_HEIGHT,
														style: {
															width: `${PLATE_WIDTH}px`,
															height: `${PLATE_HEIGHT}px`,
															objectFit: 'cover',
														},
													},
												},
											]
										: [
												{
													type: 'div',
													props: {
														style: {
															fontFamily: 'Bebas Neue',
															fontSize: 160,
															color: 'rgba(240,237,230,0.28)',
														},
														children: monogram(initialsFor ?? ''),
													},
												},
											],
								},
							},
						]
					: []),
			],
		},
	};
}

/** Render a card to PNG bytes. */
export async function renderCard(options: CardOptions): Promise<Buffer> {
	const svg = await satori(card(options) as Parameters<typeof satori>[0], {
		width: OG_WIDTH,
		height: OG_HEIGHT,
		fonts: await loadFonts(),
	});
	// `fitTo` is redundant at 1:1 but pins the output size explicitly, so a
	// future change to the satori viewport can't silently resize the PNG.
	const png = new Resvg(svg, { fitTo: { mode: 'width', value: OG_WIDTH } }).render().asPng();

	// resvg optimises for speed, not size. Recompressing costs milliseconds per
	// card at build time and roughly halves what a scraper has to download —
	// worth it, since several give up on a slow image and fall back to no
	// preview at all.
	const { default: sharp } = await import('sharp');
	return sharp(Buffer.from(png)).png({ compressionLevel: 9, effort: 10 }).toBuffer();
}
