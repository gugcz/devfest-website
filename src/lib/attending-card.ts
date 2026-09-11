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
/** Bottom band, sized to carry the wordmark at a legible size — not just a
 * chrome strip under the name any more. */
const BAND_HEIGHT = 168;

/** Bottom band's wordmark height — the rest of the band is left to breathe. */
const LOGO_HEIGHT = 88;

/**
 * Scrim alpha behind each line of text. Chosen so contrast holds even against
 * a pure-white photo, not just the dark mock: mixing white (luminance 1)
 * under a black scrim of this alpha leaves a background luminance of
 * `1 - alpha`. The cream text (name/subtitle/"I'M") clears AA by a wide
 * margin at any alpha in this range; the headline's red word is the real
 * binding case, since red's luminance is far lower than white's.
 *
 * History: 70% of the corner radius (a prior vignette shape) put the
 * headline/subtitle/name fully inside the vignette's clear center, so 0.88
 * measured only ~4.29:1 — under the 4.5:1 AA floor — which is why that round
 * raised this to 0.92. Moving the fade-start to 40% of the corner radius
 * brought the text back inside the fade zone and let 0.88 ease back down,
 * measuring ~4.65:1.
 *
 * This round's vignette (see the vignette comment below) darkens more, and
 * starting earlier/closer to center, than either of those — so the same
 * measurement (Playwright, `getImageData`, real rendered glyphs, against a
 * synthetic `#f2f0ea` swatch, this card's documented worst case) let this
 * ease down further, to 0.80: the red word vs. its plate background (the
 * lightest point along the word, not just one sample) now measures ~4.68:1,
 * still comfortably above the 4.5:1 floor. A dark photo only ever raises this
 * ratio further.
 */
const SCRIM_ALPHA = 0.8;
const TEXT_SCRIM_PAD_X = 32;
const TEXT_SCRIM_PAD_Y = 16;
/** Corner rounding on each text scrim plate, so it reads as a glow behind the
 * letters instead of a stuck-on rectangle. */
const SCRIM_CORNER_RADIUS = 14;
/** Kept small on purpose: a Gaussian blur's falloff reaches roughly 2–3× its
 * radius, and `TEXT_SCRIM_PAD_Y` (16px) is the only margin between the plate
 * edge and the tallest glyphs (e.g. the headline's capital "A" apex) — a
 * bigger blur would eat into that margin and soften the scrim exactly where
 * the text needs full opacity, not just at the true edges. Verified by
 * measurement: at 10px this cost the worst-case (bright swatch) headline
 * contrast ~0.7 points, dropping it under the 4.5:1 AA floor; 5px keeps the
 * edge feather visible while leaving the text's own footprint at full
 * SCRIM_ALPHA. */
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

/** Measures one line of text in `font`, leaving it set on `ctx` for the
 * caller's own subsequent draw. Uses actual glyph bounds (not font-metric
 * guesses) so a scrim sized from this hugs the real ink, not an estimate.
 * `actualBoundingBoxAscent`/`Descent` are defined relative to whatever
 * `textBaseline` is current at measure time — forced to `'alphabetic'` here
 * because every caller's `baselineY` (the y passed to `drawTextScrim`) is an
 * alphabetic baseline. Left as whatever a previous draw call set (e.g. the
 * no-photo monogram fallback leaves it `'middle'`), the ascent read back too
 * small and the scrim sat short of the glyphs it was meant to cover. */
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

/** Paints a black plate sized to one line's actual glyph bounds plus a small
 * pad — never the full card width, so it reads as a tight backing under the
 * letters instead of a horizontal band. Rounded corners plus a soft edge
 * feather keep it from reading as a stuck-on rectangle. Uses `shadowBlur` +
 * `shadowColor` rather than `ctx.filter = 'blur()'`: WebKit silently ignores
 * canvas `filter` (confirmed on an exported render — the plate came out
 * rounded but hard-edged there), while `shadowBlur` is supported everywhere
 * canvas is.
 *
 * Draws the shadow only, never the opaque fill on top of it: the fill's own
 * shape is pushed `offset` px outside the canvas (`ctx.canvas.width` is
 * always enough headroom, since no plate is ever that wide), and
 * `shadowOffsetX = offset` slides its shadow back to the plate's real
 * position. Only the blurred silhouette ever lands inside the visible
 * canvas. Stacking the opaque fill on top used to compound with its own
 * shadow (visually indistinguishable from black — measured ~0.985 effective
 * alpha against the intended SCRIM_ALPHA of 0.88); this way SCRIM_ALPHA is
 * the plate's one and only source of opacity. */
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
	const { ink, red, accent } = palette;

	ctx.clearRect(0, 0, size, size);

	// No photo, no card: a photo is required to export (see AttendingCard.tsx,
	// which disables Download until one is picked), so there is nothing
	// finished to preview without one — leave the canvas empty rather than
	// drawing a placeholder monogram card. The React layer renders its own
	// empty-state message over the blank canvas.
	if (!data.photo) return;

	// Pure black base, not the `bg` token: below MIN_ZOOM=1 the photo (drawn
	// next) no longer fully covers the card, and the vignette below already
	// fades to pure black at its outer stop — filling with anything else would
	// leave a visible seam between the exposed base and the vignette's edge.
	ctx.fillStyle = '#000000';
	ctx.fillRect(0, 0, size, size);

	// ── Photo: full-bleed cover-fit across the whole card, with user pan/zoom
	// applied the same way it was on the old framed well — only the well's
	// size/position changed.
	const scale = coverScale(data.photo.width, data.photo.height, size) * data.transform.zoom;
	const drawWidth = data.photo.width * scale;
	const drawHeight = data.photo.height * scale;
	const dx = size / 2 - drawWidth / 2 + data.transform.panX * scale;
	const dy = size / 2 - drawHeight / 2 + data.transform.panY * scale;
	ctx.drawImage(data.photo, dx, dy, drawWidth, drawHeight);

	// Radial vignette — one circular mask for the whole card, replacing the
	// old top/bottom horizontal scrims (which read as a band, not a vignette).
	// Earlier rounds parameterised both stops off the corner distance
	// (size/2 * √2 ≈ 849px): a 50%-of-that fade left only an oval ~55% of the
	// card width visibly photo, and 70%-of-that overcorrected the other way,
	// reading as corner-only darkening with the photo bleeding to the card
	// edge top/bottom/left/right-center (measured on real pixels). This round
	// switches to absolute distances so the fade behaves the same regardless
	// of the corner distance: it starts at 300px from center (a quarter of the
	// card width) and reaches full black at 600px (half the card width) — so
	// every edge midpoint (600px from center) is already pure black, same as
	// the corners (849px, past the gradient's last stop, which clamps to it).
	// Only a ~600px-diameter "spotlight" at the center stays clear, per the
	// circular-vignette-to-black mock this round is matched against.
	//
	// Below 1x zoom the drawn photo shrinks below the card, so a fixed 600px
	// outer stop would clear past the photo's own edge and expose the black
	// base underneath (which is fine) but leave the photo's visible edge
	// inside the "clear" zone — the vignette then reads as bleeding onto
	// nothing, not as framing the photo. Scaling both stops by k = min(zoom,
	// 1) keeps the outer stop pinned to half the photo's shorter drawn side,
	// so the photo's own edges/corners are always inside the full-black
	// region regardless of zoom. Above 1x the photo already covers past the
	// card edges, so k clamps to 1 and both stops stay at 300/600.
	const zoomScale = Math.min(data.transform.zoom, 1);
	const vignetteFadeStart = size * 0.25 * zoomScale; // 300px at zoom >= 1
	const vignetteOuterStop = (size / 2) * zoomScale; // 600px at zoom >= 1
	const vignette = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, vignetteOuterStop);
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

	// Name baseline: moved down from its old fixed `bandTop - SAFE_SPACE`
	// position to roughly halfway toward the band, per Dominik's ask — but
	// clamped so the glyphs (baseline + descent) never cross into the band's
	// footprint with less than a 24px gap. `fitFontSize` shrinks a long name
	// (e.g. "Grace Hopperschmidt-Wozniakowski") to a smaller floor size, which
	// also shrinks its descent, so the clamp keeps the same floor for every
	// name length rather than letting a long name sit closer to the band.
	const bandTop = size - BAND_HEIGHT;
	const priorNameY = bandTop - SAFE_SPACE;
	const nameBandGap = 24;
	const nameY = Math.min(priorNameY + (bandTop - priorNameY) / 2, bandTop - nameBandGap - nameMetrics.descent);

	// Local text scrims — the radial vignette above sits mostly clear near the
	// card's vertical center, right where the headline/subtitle/name land, so
	// each line gets its own plate sized to its actual glyph bounds (never the
	// full card width — that would just reintroduce the horizontal band this
	// replaces).
	const headlineMetrics = lineMetrics(ctx, headline, `${headlineSize}px ${fonts.bebas}`);
	drawTextScrim(ctx, size / 2, headlineY, headlineMetrics);
	const subtitleMetrics = lineMetrics(ctx, subtitleText, subtitleFont);
	drawTextScrim(ctx, size / 2, metaY, subtitleMetrics);
	drawTextScrim(ctx, size / 2, nameY, nameMetrics);

	// ── Headline: "I'M ATTENDING" — cream + one red word, no shadow/glow. One
	// design for every visitor (no role toggle any more — see AttendingCard.tsx).
	// Centered, top of card, kept inside the 10% safe space.
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

	// ── Name, bottom of card — the card's one remaining focal line since the
	// role toggle is gone. Baseline kept inside the 10% safe space, clear of
	// the band below it.
	ctx.font = `${nameSize}px ${fonts.bebas}`;
	ctx.textAlign = 'center';
	ctx.textBaseline = 'alphabetic';
	ctx.fillStyle = ink;
	ctx.fillText(nameText, size / 2, nameY);

	// ── Bottom accent band — one per card, mirrors `.band--accent`. Fixed
	// BAND_HEIGHT zone at the card's foot, edge-to-edge (chrome, not content —
	// exempt from the safe-space rule above). Wordmark + "2026" pill centered
	// as one group per Dominik's call to put everything in this layout on the
	// center axis; both match the mock's black-on-red treatment.
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

		// The shared wordmark asset is white (built for dark backgrounds
		// elsewhere on the site); the mock wants it black on the red band. Tint
		// it on a scratch canvas, not in place: `source-atop` masks to
		// whatever alpha is already in the destination, and the main canvas
		// already has the opaque red band under this whole rect, so tinting
		// directly there would black out the full logo bounding box instead
		// of just the letters.
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

		// "2026" pill, black outline + text on the red band, per Danny's mock.
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
}
