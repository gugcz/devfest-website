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
 * Full-bleed layout: the photo covers the entire 1200×1200 card (the "well"
 * IS the card), text sits on top of it. `SAFE_SPACE` keeps headline/name text
 * clear of the outer 10% of the card on every side — the fixed brand band at
 * the foot is chrome, not "content", and is deliberately exempt (it already
 * runs edge-to-edge, same as before this layout).
 */
export const WELL_SIZE = CARD_SIZE;
const SAFE_SPACE = CARD_SIZE * 0.1; // 120px
const BAND_HEIGHT = 108;

/** Bottom band's wordmark height — the rest of the band is left to breathe. */
const LOGO_HEIGHT = 56;

/**
 * Scrim alpha behind the headline/name text. Chosen so contrast holds even
 * against a pure-white photo, not just the dark mock: mixing white
 * (luminance 1) under a black scrim of this alpha leaves a background
 * luminance of `1 - alpha`. At 0.82 that's 0.18, giving white text on it a
 * ~4.6:1 contrast ratio — above the 4.5:1 AA threshold for normal text, let
 * alone the 3:1 floor for the large (≥40px) text actually used here. A dark
 * photo only ever raises this ratio, so 0.82 is the binding worst case.
 */
const SCRIM_ALPHA = 0.82;

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
	const { bg, ink, red, accent, panel, monogramInk } = palette;

	ctx.clearRect(0, 0, size, size);
	ctx.fillStyle = bg;
	ctx.fillRect(0, 0, size, size);

	// ── Photo: full-bleed cover-fit across the whole card (or a monogram
	// fallback on brand background), with user pan/zoom applied the same way
	// it was on the old framed well — only the well's size/position changed.
	if (data.photo) {
		const scale = coverScale(data.photo.width, data.photo.height, size) * data.transform.zoom;
		const drawWidth = data.photo.width * scale;
		const drawHeight = data.photo.height * scale;
		const dx = size / 2 - drawWidth / 2 + data.transform.panX * scale;
		const dy = size / 2 - drawHeight / 2 + data.transform.panY * scale;
		ctx.drawImage(data.photo, dx, dy, drawWidth, drawHeight);
	} else {
		ctx.fillStyle = panel;
		ctx.fillRect(0, 0, size, size);
		ctx.font = `440px ${fonts.bebas}`;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillStyle = monogramInk;
		ctx.fillText(initials(data.name) || '?', size / 2, size / 2 + 20);
	}

	// Radial gradient fading to black from ~50% of the card's half-diagonal —
	// per Danny's mock, on top of the photo/monogram either way.
	const vignette = ctx.createRadialGradient(size / 2, size / 2, size * 0.25, size / 2, size / 2, size * 0.72);
	vignette.addColorStop(0, 'rgba(0,0,0,0)');
	vignette.addColorStop(1, 'rgba(0,0,0,0.78)');
	ctx.fillStyle = vignette;
	ctx.fillRect(0, 0, size, size);

	// Directional scrims behind the text zones — the radial vignette alone
	// doesn't guarantee contrast (a bright photo's center still shows
	// through), so headline and name each sit on their own top-down /
	// bottom-up gradient into solid black at SCRIM_ALPHA (see its doc).
	const topScrim = ctx.createLinearGradient(0, 0, 0, SAFE_SPACE + 220);
	topScrim.addColorStop(0, `rgba(0,0,0,${SCRIM_ALPHA})`);
	topScrim.addColorStop(1, 'rgba(0,0,0,0)');
	ctx.fillStyle = topScrim;
	ctx.fillRect(0, 0, size, SAFE_SPACE + 220);

	const bottomScrimTop = size - BAND_HEIGHT - 340;
	const bottomScrim = ctx.createLinearGradient(0, bottomScrimTop, 0, size - BAND_HEIGHT);
	bottomScrim.addColorStop(0, 'rgba(0,0,0,0)');
	bottomScrim.addColorStop(1, `rgba(0,0,0,${SCRIM_ALPHA})`);
	ctx.fillStyle = bottomScrim;
	ctx.fillRect(0, bottomScrimTop, size, size - BAND_HEIGHT - bottomScrimTop);

	// ── Headline: "I'M ATTENDING" — cream + one red word, no shadow/glow. One
	// design for every visitor (no role toggle any more — see AttendingCard.tsx).
	// Centered, top of card, kept inside the 10% safe space.
	const word = 'ATTENDING';
	const prefix = `I'M `;
	const headline = `${prefix}${word}`;
	const maxHeadlineWidth = size - SAFE_SPACE * 2;
	const headlineSize = fitFontSize(ctx, headline, fonts.bebas, 132, maxHeadlineWidth, 64);
	ctx.font = `${headlineSize}px ${fonts.bebas}`;
	ctx.textBaseline = 'alphabetic';
	const totalWidth = ctx.measureText(headline).width;
	let x = (size - totalWidth) / 2;
	const headlineY = SAFE_SPACE + headlineSize * 0.78;
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

	// ── Name, bottom of card — the card's one remaining focal line since the
	// role toggle is gone. Baseline kept inside the 10% safe space, clear of
	// the band below it.
	const nameText = (data.name.trim() || 'Your name here').toUpperCase();
	const nameSize = fitFontSize(ctx, nameText, fonts.bebas, 96, size - SAFE_SPACE * 2, 56);
	ctx.font = `${nameSize}px ${fonts.bebas}`;
	ctx.textAlign = 'center';
	ctx.textBaseline = 'alphabetic';
	ctx.fillStyle = ink;
	const nameY = size - BAND_HEIGHT - SAFE_SPACE;
	ctx.fillText(nameText, size / 2, nameY);

	// ── Bottom accent band — one per card, mirrors `.band--accent`. Fixed
	// BAND_HEIGHT zone at the card's foot, edge-to-edge (chrome, not content —
	// exempt from the safe-space rule above). Wordmark centered per Dominik's
	// call to put everything in this layout on the center axis.
	const bandCenterY = size - BAND_HEIGHT / 2;
	ctx.fillStyle = accent;
	ctx.fillRect(0, size - BAND_HEIGHT, size, BAND_HEIGHT);

	if (logo && logo.naturalWidth > 0) {
		const logoWidth = (logo.naturalWidth / logo.naturalHeight) * LOGO_HEIGHT;
		ctx.drawImage(logo, size / 2 - logoWidth / 2, bandCenterY - LOGO_HEIGHT / 2, logoWidth, LOGO_HEIGHT);
	}
}
