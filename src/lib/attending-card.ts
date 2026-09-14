/**
 * Pure drawing logic for the `/attending` share-card canvas. No DOM/React
 * dependency: takes a 2D context plus plain data and paints. Colors come
 * from the page's CSS custom properties (`cssVar`), so the card can't drift
 * from `BaseLayout.scss`.
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

/** Pan limit (source-image px), independent of zoom: on each axis the
 * image's edge may travel at most to the card's center, so the photo always
 * covers at least half the well. Beyond that the vignette/black fill shows,
 * which is expected. */
export function panBounds(naturalWidth: number, naturalHeight: number): { maxX: number; maxY: number } {
	return { maxX: naturalWidth / 2, maxY: naturalHeight / 2 };
}

/** Clamps a pan offset (source-image px, centered) to `panBounds`. */
export function clampPan(
	panX: number,
	panY: number,
	naturalWidth: number,
	naturalHeight: number,
	scale: number,
	wellSize: number,
): { panX: number; panY: number } {
	const { maxX, maxY } = panBounds(naturalWidth, naturalHeight);
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
	/** The site's ad-hoc muted ink: `--color-text` at ~0.6 alpha (no token). */
	muted: string;
}

/** Reads every color the card needs in one pass. `getComputedStyle` forces a
 * style recalc, so call once (after fonts are ready) and reuse — per-frame
 * reads made panning janky. */
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

/** Full-bleed layout: the photo covers the whole 1200×1200 card, text on
 * top. `SAFE_SPACE` keeps headline/name clear of the outer 10%; the brand
 * band at the foot is chrome and exempt. */
export const WELL_SIZE = CARD_SIZE;
const SAFE_SPACE = CARD_SIZE * 0.1; // 120px
/** Bottom band, sized to carry the wordmark at a legible size. */
const BAND_HEIGHT = 168;

/** Bottom band's wordmark height — the rest of the band is left to breathe. */
const LOGO_HEIGHT = 88;

/**
 * Scrim alpha behind each line of text. Chosen so contrast holds against a
 * pure-white photo: white under a black scrim of alpha `a` leaves luminance
 * `1 - a`. Cream text clears AA easily; the headline's red word is the
 * binding case. Measured (Playwright, `getImageData`, real glyphs, against a
 * `#f2f0ea` worst-case swatch): at 0.80 the red word vs. its plate measures
 * ~4.68:1, above the 4.5:1 floor. A dark photo only raises this.
 */
const SCRIM_ALPHA = 0.8;
const TEXT_SCRIM_PAD_X = 32;
const TEXT_SCRIM_PAD_Y = 16;
/** Corner rounding on each text scrim plate, so it reads as a glow behind the
 * letters instead of a stuck-on rectangle. */
const SCRIM_CORNER_RADIUS = 14;
/** Kept small: a Gaussian blur's falloff reaches ~2–3× its radius, and
 * `TEXT_SCRIM_PAD_Y` (16px) is the only margin between plate edge and the
 * tallest glyphs. At 10px the worst-case headline contrast dropped ~0.7
 * points, under the 4.5:1 floor; 5px keeps the text footprint at full alpha. */
const SCRIM_FEATHER = 5;

/** Traces a rounded-rect path — same four-`arcTo` shape already used below
 * for the "2026" pill, pulled out so the text scrims can share it. */
function roundRectPath(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	w: number,
	h: number,
	r: number,
): void {
	ctx.beginPath();
	ctx.moveTo(x + r, y);
	ctx.arcTo(x + w, y, x + w, y + h, r);
	ctx.arcTo(x + w, y + h, x, y + h, r);
	ctx.arcTo(x, y + h, x, y, r);
	ctx.arcTo(x, y, x + w, y, r);
	ctx.closePath();
}

/** Measures one line of text in `font` (leaving it set on `ctx`) using
 * actual glyph bounds, so a scrim hugs the real ink. `textBaseline` is forced
 * to `'alphabetic'` — `actualBoundingBoxAscent`/`Descent` are relative to it,
 * and every caller's `baselineY` is alphabetic. Left as a previous draw's
 * `'middle'`, the ascent read too small and the scrim sat short. */
function lineMetrics(
	ctx: CanvasRenderingContext2D,
	text: string,
	font: string,
): { width: number; ascent: number; descent: number } {
	ctx.font = font;
	ctx.textBaseline = 'alphabetic';
	const m = ctx.measureText(text);
	return { width: m.width, ascent: m.actualBoundingBoxAscent, descent: m.actualBoundingBoxDescent };
}

/** Paints a black plate sized to one line's glyph bounds plus a small pad —
 * never the full card width, so it reads as a backing, not a band. Uses
 * `shadowBlur` rather than `ctx.filter = 'blur()'`: WebKit silently ignores
 * canvas `filter` (confirmed on an export).
 *
 * Draws the shadow only: the fill is pushed `offset` px off-canvas and
 * `shadowOffsetX = offset` slides its shadow back, so only the blurred
 * silhouette lands on the visible canvas. Fill + shadow stacked compounded
 * to ~0.985 alpha; this way SCRIM_ALPHA is the plate's only opacity. */
function drawTextScrim(
	ctx: CanvasRenderingContext2D,
	centerX: number,
	baselineY: number,
	metrics: { width: number; ascent: number; descent: number },
): void {
	const top = baselineY - metrics.ascent - TEXT_SCRIM_PAD_Y;
	const height = metrics.ascent + metrics.descent + TEXT_SCRIM_PAD_Y * 2;
	const width = metrics.width + TEXT_SCRIM_PAD_X * 2;
	const left = centerX - width / 2;
	const offset = ctx.canvas.width;

	ctx.save();
	ctx.shadowColor = `rgba(0,0,0,${SCRIM_ALPHA})`;
	ctx.shadowBlur = SCRIM_FEATHER;
	ctx.shadowOffsetX = offset;
	ctx.shadowOffsetY = 0;
	ctx.fillStyle = 'rgba(0,0,0,1)';
	roundRectPath(ctx, left - offset, top, width, height, SCRIM_CORNER_RADIUS);
	ctx.fill();
	ctx.restore();
}

/** `SAMPLE` badge margin/sizing — inside the outer vignette ring (pure black
 * at zoom 1) so cream text has a dark backdrop, clear of the headline. */
const SAMPLE_BADGE_MARGIN = 40;

/** Draws the `SAMPLE` corner badge. Only called with no real photo, and
 * Download is disabled for that same state (`exportDisabled` in
 * `AttendingCard.tsx`), so it never reaches an export. */
function drawSampleBadge(ctx: CanvasRenderingContext2D, size: number, fonts: Fonts, palette: Palette): void {
	const label = 'SAMPLE';
	ctx.font = `600 32px ${fonts.mono}`;
	const textWidth = ctx.measureText(label).width;
	const paddingX = 22;
	const height = 52;
	const width = textWidth + paddingX * 2;
	const x = size - SAMPLE_BADGE_MARGIN - width;
	const y = SAMPLE_BADGE_MARGIN;

	ctx.save();
	ctx.fillStyle = 'rgba(0,0,0,0.55)';
	roundRectPath(ctx, x, y, width, height, height / 2);
	ctx.fill();
	ctx.lineWidth = 1.5;
	ctx.strokeStyle = palette.ink;
	ctx.stroke();
	ctx.fillStyle = palette.ink;
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillText(label, x + width / 2, y + height / 2 + 1);
	ctx.restore();
}

export interface DrawOptions {
	/** True while `data.photo` is the bundled sample portrait — paints the
	 * `SAMPLE` badge. Download/Share are disabled for the same state. */
	isSample?: boolean;
}

/** Paints the full 1200×1200 card. Synchronous; the caller owns scheduling.
 * Pass `logo` as `null` until decoded — never draw it half-loaded. */
export function drawAttendingCard(
	ctx: CanvasRenderingContext2D,
	data: CardData,
	fonts: Fonts,
	palette: Palette,
	logo: HTMLImageElement | null,
	options?: DrawOptions,
): void {
	const size = CARD_SIZE;
	const { ink, red, accent } = palette;

	ctx.clearRect(0, 0, size, size);

	// No photo yet (sample not loaded either) — only fires for one early frame.
	if (!data.photo) return;

	// Pure black, not the `bg` token: below zoom 1 the photo doesn't cover the
	// card, and the vignette fades to pure black — anything else shows a seam.
	ctx.fillStyle = '#000000';
	ctx.fillRect(0, 0, size, size);

	// ── Photo: full-bleed cover-fit with user pan/zoom.
	const scale = coverScale(data.photo.width, data.photo.height, size) * data.transform.zoom;
	const drawWidth = data.photo.width * scale;
	const drawHeight = data.photo.height * scale;
	const dx = size / 2 - drawWidth / 2 + data.transform.panX * scale;
	const dy = size / 2 - drawHeight / 2 + data.transform.panY * scale;
	ctx.drawImage(data.photo, dx, dy, drawWidth, drawHeight);

	// Radial vignette — one circular mask for the whole card. Absolute stops:
	// fade starts 300px from center, full black at 600px, so every edge
	// midpoint and corner is pure black and only a ~600px spotlight stays
	// clear. (Stops parameterised off the corner distance either left an oval
	// or read as corner-only darkening.)
	//
	// Locked to the canvas, not the photo: pan never shifts it. Below zoom 1
	// the photo shrinks inside the card, so both stops scale by
	// k = min(zoom, 1) — a fixed 600px stop would frame empty black instead
	// of the photo. Panning a shrunk photo toward an edge still shows a hard
	// edge against the ring; accepted tradeoff.
	const vignetteScale = Math.min(data.transform.zoom, 1);
	const vignetteFadeStart = size * 0.25 * vignetteScale; // 300px at zoom >= 1
	const vignetteOuterStop = (size / 2) * vignetteScale; // 600px at zoom >= 1
	const vignette = ctx.createRadialGradient(
		size / 2,
		size / 2,
		0,
		size / 2,
		size / 2,
		vignetteOuterStop,
	);
	vignette.addColorStop(0, 'rgba(0,0,0,0)');
	vignette.addColorStop(vignetteFadeStart / vignetteOuterStop, 'rgba(0,0,0,0)');
	vignette.addColorStop(1, 'rgba(0,0,0,1)');
	ctx.fillStyle = vignette;
	ctx.fillRect(0, 0, size, size);

	// ── Text geometry, computed before the scrims so the scrims can be sized
	// to the actual text zones instead of guessed fixed offsets.
	const word = 'ATTENDING';
	const prefix = `I'M `;
	const headline = `${prefix}${word}`;
	const maxHeadlineWidth = size - SAFE_SPACE * 2;
	const headlineSize = fitFontSize(ctx, headline, fonts.bebas, 132, maxHeadlineWidth, 64);
	const headlineY = SAFE_SPACE + headlineSize * 0.78;
	const metaY = headlineY + 64;
	const subtitleText = '30 OCT 2026 · PRAGUE';
	const subtitleFont = `500 44px ${fonts.mono}`;

	const nameText = (data.name.trim() || 'Your name here').toUpperCase();
	const nameSize = fitFontSize(ctx, nameText, fonts.bebas, 96, size - SAFE_SPACE * 2, 56);
	const nameMetrics = lineMetrics(ctx, nameText, `${nameSize}px ${fonts.bebas}`);

	// Name baseline: roughly halfway toward the band, clamped so the glyphs
	// (baseline + descent) keep a 24px gap from it. `fitFontSize` shrinks a
	// long name and its descent, so the clamp keeps the same floor for every
	// name length.
	const bandTop = size - BAND_HEIGHT;
	const priorNameY = bandTop - SAFE_SPACE;
	const nameBandGap = 24;
	const nameY = Math.min(priorNameY + (bandTop - priorNameY) / 2, bandTop - nameBandGap - nameMetrics.descent);

	// Local text scrims — the vignette is clear near the center, where the
	// text lands, so each line gets a plate sized to its glyph bounds (never
	// full card width, which would be a band again).
	const headlineMetrics = lineMetrics(ctx, headline, `${headlineSize}px ${fonts.bebas}`);
	drawTextScrim(ctx, size / 2, headlineY, headlineMetrics);
	const subtitleMetrics = lineMetrics(ctx, subtitleText, subtitleFont);
	drawTextScrim(ctx, size / 2, metaY, subtitleMetrics);
	drawTextScrim(ctx, size / 2, nameY, nameMetrics);

	// ── Headline: "I'M ATTENDING" — cream + one red word, no shadow/glow.
	// Centered, top of card, inside the safe space.
	ctx.font = `${headlineSize}px ${fonts.bebas}`;
	ctx.textBaseline = 'alphabetic';
	const totalWidth = ctx.measureText(headline).width;
	let x = (size - totalWidth) / 2;
	ctx.textAlign = 'left';
	ctx.fillStyle = ink;
	ctx.fillText(prefix, x, headlineY);
	x += ctx.measureText(prefix).width;
	ctx.fillStyle = red;
	ctx.fillText(word, x, headlineY);

	// Sub-label under the headline — a mono meta line, sized to stay legible at
	// social-feed scale (a 1200px card renders ~500px wide there).
	ctx.textAlign = 'center';
	ctx.font = subtitleFont;
	ctx.fillStyle = ink;
	ctx.fillText(subtitleText, size / 2, metaY);

	// ── Name, bottom of card. Baseline inside the safe space, clear of the band.
	ctx.font = `${nameSize}px ${fonts.bebas}`;
	ctx.textAlign = 'center';
	ctx.textBaseline = 'alphabetic';
	ctx.fillStyle = ink;
	ctx.fillText(nameText, size / 2, nameY);

	// ── Bottom accent band — mirrors `.band--accent`. Edge-to-edge chrome,
	// exempt from the safe space. Wordmark + "2026" pill centered as one
	// group, black on red per the mock.
	const bandCenterY = size - BAND_HEIGHT / 2;
	ctx.fillStyle = accent;
	ctx.fillRect(0, size - BAND_HEIGHT, size, BAND_HEIGHT);

	if (logo && logo.naturalWidth > 0) {
		const logoWidth = (logo.naturalWidth / logo.naturalHeight) * LOGO_HEIGHT;

		const pillText = '2026';
		ctx.font = `600 44px ${fonts.mono}`;
		const pillTextWidth = ctx.measureText(pillText).width;
		const pillPaddingX = 28;
		const pillHeight = 68;
		const pillWidth = pillTextWidth + pillPaddingX * 2;
		const pillGap = 28;

		const groupWidth = logoWidth + pillGap + pillWidth;
		const logoX = size / 2 - groupWidth / 2;
		const logoY = bandCenterY - LOGO_HEIGHT / 2;

		// The wordmark asset is white; the mock wants black. Tint on a scratch
		// canvas: `source-atop` masks to the destination's alpha, and the main
		// canvas already has the opaque red band there, so tinting in place
		// would black out the whole logo box.
		const tint = document.createElement('canvas');
		tint.width = Math.ceil(logoWidth);
		tint.height = LOGO_HEIGHT;
		const tintCtx = tint.getContext('2d');
		if (tintCtx) {
			tintCtx.drawImage(logo, 0, 0, logoWidth, LOGO_HEIGHT);
			tintCtx.globalCompositeOperation = 'source-atop';
			tintCtx.fillStyle = '#000000';
			tintCtx.fillRect(0, 0, logoWidth, LOGO_HEIGHT);
			ctx.drawImage(tint, logoX, logoY, logoWidth, LOGO_HEIGHT);
		}

		// "2026" pill, black outline + text on the red band, per the mock.
		const pillX = logoX + logoWidth + pillGap;
		const pillY = bandCenterY - pillHeight / 2;
		const radius = pillHeight / 2;
		ctx.beginPath();
		ctx.moveTo(pillX + radius, pillY);
		ctx.arcTo(pillX + pillWidth, pillY, pillX + pillWidth, pillY + pillHeight, radius);
		ctx.arcTo(pillX + pillWidth, pillY + pillHeight, pillX, pillY + pillHeight, radius);
		ctx.arcTo(pillX, pillY + pillHeight, pillX, pillY, radius);
		ctx.arcTo(pillX, pillY, pillX + pillWidth, pillY, radius);
		ctx.closePath();
		ctx.lineWidth = 2;
		ctx.strokeStyle = '#000000';
		ctx.stroke();
		ctx.fillStyle = '#000000';
		ctx.font = `600 44px ${fonts.mono}`;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(pillText, pillX + pillWidth / 2, pillY + pillHeight / 2 + 1);
	}

	if (options?.isSample) drawSampleBadge(ctx, size, fonts, palette);
}
