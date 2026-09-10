/**
 * Pure drawing logic for the `/attending` share-card canvas.
 *
 * Kept out of the React island so the render path has no DOM/React
 * dependency: it takes a 2D context plus plain data and paints. Colors are
 * read from the page's own CSS custom properties (`cssVar`) instead of being
 * duplicated here, so the card can never drift from the brand tokens in
 * `BaseLayout.scss`.
 */

export const CARD_SIZE = 1200;

export interface PhotoTransform {
	/** Multiplier on top of the base cover-fit scale. 1 = just covers the well. */
	zoom: number;
	/** Pan in source-image pixels, already clamped to keep the well covered. */
	panX: number;
	panY: number;
}

export const DEFAULT_TRANSFORM: PhotoTransform = { zoom: 1, panX: 0, panY: 0 };

export interface CardData {
	name: string;
	photo: ImageBitmap | null;
	transform: PhotoTransform;
}

/** Reads a CSS custom property off the document root — the single source of
 * truth for every color/font the card draws with. */
export function cssVar(name: string): string {
	return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/** Resolves an Astro `fonts` cssVariable to the actual usable font stack. */
export function resolveFontFamily(cssVariableName: string): string {
	return cssVar(cssVariableName) || 'sans-serif';
}

function initials(name: string): string {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return '';
	return parts
		.slice(0, 2)
		.map((p) => p[0]?.toUpperCase() ?? '')
		.join('');
}

/** Shrinks `fontSizePx` until `text` fits within `maxWidth`, down to a floor. */
function fitFontSize(
	ctx: CanvasRenderingContext2D,
	text: string,
	family: string,
	startPx: number,
	maxWidth: number,
	floorPx: number,
): number {
	let size = startPx;
	while (size > floorPx) {
		ctx.font = `${size}px ${family}`;
		if (ctx.measureText(text).width <= maxWidth) break;
		size -= 2;
	}
	return size;
}

/** The furthest a pan offset (in source-image px) can go while the image
 * still fully covers a `wellSize`×`wellSize` square at the given scale. */
export function panBounds(
	naturalWidth: number,
	naturalHeight: number,
	scale: number,
	wellSize: number,
): { maxX: number; maxY: number } {
	const drawWidth = naturalWidth * scale;
	const drawHeight = naturalHeight * scale;
	return {
		maxX: Math.max(0, (drawWidth - wellSize) / 2 / scale),
		maxY: Math.max(0, (drawHeight - wellSize) / 2 / scale),
	};
}

/**
 * Clamps a pan offset (in source-image px, centered) so the image keeps
 * fully covering a `wellSize`×`wellSize` square at the given scale.
 */
export function clampPan(
	panX: number,
	panY: number,
	naturalWidth: number,
	naturalHeight: number,
	scale: number,
	wellSize: number,
): { panX: number; panY: number } {
	const { maxX, maxY } = panBounds(naturalWidth, naturalHeight, scale, wellSize);
	return {
		panX: Math.min(maxX, Math.max(-maxX, panX)),
		panY: Math.min(maxY, Math.max(-maxY, panY)),
	};
}

/** Base "cover" scale that fills the well with the shorter image edge. */
export function coverScale(naturalWidth: number, naturalHeight: number, wellSize: number): number {
	return wellSize / Math.min(naturalWidth, naturalHeight);
}

export interface Fonts {
	bebas: string;
	mono: string;
	/** The site's reading/long-form face — used here for the one line of
	 * actual prose on the card, never as a label or headline. */
	elite: string;
}

/** Reads all three font stacks once — pair with `readPalette()`, see its doc. */
export function readFonts(): Fonts {
	return {
		bebas: resolveFontFamily('--font-bebas-neue'),
		mono: resolveFontFamily('--font-jetbrains-mono'),
		elite: resolveFontFamily('--font-special-elite'),
	};
}

export interface Palette {
	bg: string;
	ink: string;
	red: string;
	accent: string;
	onAccent: string;
	rule: string;
	panel: string;
	monogramInk: string;
	/** Same muted-ink ratio used ad hoc across the site (no dedicated CSS
	 * custom property for it — `--color-text` at ~0.6 alpha, matching e.g.
	 * `BaseLayout.scss`'s own repeated `rgba(240, 237, 230, 0.6/0.7)`). */
	muted: string;
}

/**
 * Reads every color the card needs off the page's CSS custom properties, in
 * one pass. `getComputedStyle` forces a style recalc, so this must be called
 * once (after fonts are ready) and the result reused across redraws — never
 * per-frame, which is what made panning janky before.
 */
export function readPalette(): Palette {
	return {
		bg: cssVar('--color-bg') || '#050505',
		ink: cssVar('--color-text') || '#F2EFE9',
		red: cssVar('--color-accent-hot') || '#FF1111',
		accent: cssVar('--color-accent') || '#CC0000',
		onAccent: cssVar('--on-accent') || '#F7EFE6',
		rule: cssVar('--rule') || 'rgba(240, 237, 230, 0.16)',
		panel: cssVar('--panel-lit') || '#0A0908',
		monogramInk: cssVar('--ink-monogram') || 'rgba(242, 239, 233, 0.46)',
		muted: 'rgba(240, 237, 230, 0.6)',
	};
}

/**
 * Vertical budget for the 1200×1200 card, stacked top to bottom. The bottom
 * band is a fixed zone; everything above it — header, photo well, name/role —
 * is sized to fit the remainder with margin to spare, so a longer name or a
 * font-metric surprise doesn't run under the band again.
 */
const HEADER_BLOCK_HEIGHT = 356; // headline + meta label + rule, down to the well's top edge
/** Side of the square photo well — exported so the React island's pan/zoom
 * math (which never touches the canvas directly) can't drift from the draw. */
export const WELL_SIZE = 520;
const NAME_BLOCK_HEIGHT = 216; // well bottom to band top, holding the name — the card's one remaining focal line here
const BAND_HEIGHT = 108;
// HEADER_BLOCK_HEIGHT + WELL_SIZE + NAME_BLOCK_HEIGHT + BAND_HEIGHT === CARD_SIZE

/** Bottom band's wordmark height — the rest of the band is left to breathe. */
const LOGO_HEIGHT = 56;
const BAND_PAD_X = 90;

/**
 * Paints the full 1200×1200 card. Synchronous and side-effect-free beyond the
 * given context, so the caller (the React island) owns scheduling/redraw.
 * `logo` is a static brand asset, not part of `data` — pass `null` until it
 * has been decoded (see `AttendingCard.tsx`), never draw it half-loaded.
 */
export function drawAttendingCard(
	ctx: CanvasRenderingContext2D,
	data: CardData,
	fonts: Fonts,
	palette: Palette,
	logo: HTMLImageElement | null,
): void {
	const size = CARD_SIZE;
	const { bg, ink, red, accent, rule, panel, monogramInk } = palette;

	ctx.clearRect(0, 0, size, size);
	ctx.fillStyle = bg;
	ctx.fillRect(0, 0, size, size);

	// Faint corner vignette — same idea as HeroBackground's scene-vignette,
	// flattened to a canvas radial gradient. No glow on text anywhere below.
	const vignette = ctx.createRadialGradient(size / 2, size * 0.38, size * 0.25, size / 2, size * 0.5, size * 0.85);
	vignette.addColorStop(0, 'rgba(0,0,0,0)');
	vignette.addColorStop(1, 'rgba(0,0,0,0.55)');
	ctx.fillStyle = vignette;
	ctx.fillRect(0, 0, size, size);

	// ── Headline: "I'M ATTENDING" — cream + one red word, no shadow/glow. One
	// design for every visitor (no role toggle any more — see AttendingCard.tsx).
	const word = 'ATTENDING';
	const prefix = `I'M `;
	const headline = `${prefix}${word}`;
	const maxHeadlineWidth = size - 180;
	const headlineSize = fitFontSize(ctx, headline, fonts.bebas, 132, maxHeadlineWidth, 64);
	ctx.font = `${headlineSize}px ${fonts.bebas}`;
	ctx.textBaseline = 'alphabetic';
	const totalWidth = ctx.measureText(headline).width;
	let x = (size - totalWidth) / 2;
	const headlineY = 160;
	ctx.textAlign = 'left';
	ctx.fillStyle = ink;
	ctx.fillText(prefix, x, headlineY);
	x += ctx.measureText(prefix).width;
	ctx.fillStyle = red;
	ctx.fillText(word, x, headlineY);

	// Sub-label under the headline — a mono meta line, sized to stay legible at
	// social-feed scale (a 1200px card renders ~500px wide there).
	const metaY = headlineY + 64;
	ctx.textAlign = 'center';
	ctx.font = `500 44px ${fonts.mono}`;
	ctx.fillStyle = ink;
	ctx.fillText('30 OCT 2026 · PRAGUE', size / 2, metaY);

	const ruleY = metaY + 56;
	ctx.strokeStyle = rule;
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(140, ruleY);
	ctx.lineTo(size - 140, ruleY);
	ctx.stroke();

	// ── Photo well: a square mount, either the uploaded photo (cover-fit,
	// user pan/zoom) or a monogram fallback — same idea as the site's `.print`
	// mount + `--ink-monogram`, just drawn on canvas instead of in CSS.
	const wellSize = WELL_SIZE;
	const wellX = (size - wellSize) / 2;
	const wellY = HEADER_BLOCK_HEIGHT;

	ctx.save();
	ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
	ctx.shadowBlur = 40;
	ctx.shadowOffsetY = 18;
	ctx.fillStyle = panel;
	ctx.fillRect(wellX, wellY, wellSize, wellSize);
	ctx.restore();

	ctx.save();
	ctx.beginPath();
	ctx.rect(wellX, wellY, wellSize, wellSize);
	ctx.clip();

	if (data.photo) {
		const scale = coverScale(data.photo.width, data.photo.height, wellSize) * data.transform.zoom;
		const drawWidth = data.photo.width * scale;
		const drawHeight = data.photo.height * scale;
		const dx = wellX + wellSize / 2 - drawWidth / 2 + data.transform.panX * scale;
		const dy = wellY + wellSize / 2 - drawHeight / 2 + data.transform.panY * scale;
		ctx.drawImage(data.photo, dx, dy, drawWidth, drawHeight);
	} else {
		ctx.fillStyle = panel;
		ctx.fillRect(wellX, wellY, wellSize, wellSize);
		ctx.font = `220px ${fonts.bebas}`;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillStyle = monogramInk;
		ctx.fillText(initials(data.name) || '?', wellX + wellSize / 2, wellY + wellSize / 2 + 10);
	}
	ctx.restore();

	ctx.strokeStyle = rule;
	ctx.lineWidth = 2;
	ctx.strokeRect(wellX, wellY, wellSize, wellSize);

	// ── Name, under the well — the card's one remaining focal line since the
	// role toggle is gone. Centered in NAME_BLOCK_HEIGHT (not pinned to its
	// top edge, which is where the role label used to sit) so it still reads
	// as the main element rather than stranded near the well.
	const nameText = (data.name.trim() || 'Your name here').toUpperCase();
	const nameSize = fitFontSize(ctx, nameText, fonts.bebas, 96, size - 200, 56);
	ctx.font = `${nameSize}px ${fonts.bebas}`;
	ctx.textAlign = 'center';
	ctx.textBaseline = 'alphabetic';
	ctx.fillStyle = ink;
	const wellBottom = wellY + wellSize;
	const nameY = wellBottom + NAME_BLOCK_HEIGHT / 2 + nameSize * 0.3;
	ctx.fillText(nameText, size / 2, nameY);

	// ── Bottom accent band — one per card, mirrors `.band--accent`. Fixed
	// BAND_HEIGHT zone at the card's foot; NAME_BLOCK_HEIGHT above keeps the
	// name/role baselines clear of it (see the layout budget above). The
	// wordmark alone carries the "DevFest.cz" identity here — the right slot
	// stays empty rather than repeating it as text.
	const bandHeight = BAND_HEIGHT;
	const bandCenterY = size - bandHeight / 2;
	ctx.fillStyle = accent;
	ctx.fillRect(0, size - bandHeight, size, bandHeight);

	if (logo && logo.naturalWidth > 0) {
		const logoWidth = (logo.naturalWidth / logo.naturalHeight) * LOGO_HEIGHT;
		ctx.drawImage(logo, BAND_PAD_X, bandCenterY - LOGO_HEIGHT / 2, logoWidth, LOGO_HEIGHT);
	}
}
