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

	// Corner vignette — a circular gradient centered on the card, but tuned so
	// the inner stop sits just past the edge-midpoint radius (size/2) and the
	// outer stop sits short of the corner radius (size/√2 half-diagonal, ≈0.707
	// of size). Points along the horizontal/vertical center lines are exactly
	// `size/2` from the center at most, so they never reach the inner stop and
	// stay untouched; the true corners are past the outer stop, so a gradient
	// stop clamps them to flat, literal black instead of asymptotically
	// approaching it. A vignette spanning the full half-diagonal (the old
	// 0.25–0.72 stops) darkened the entire width/height at mid-card too, which
	// is what was crushing the visible photo band.
	const vignette = ctx.createRadialGradient(size / 2, size / 2, size * 0.52, size / 2, size / 2, size * 0.6917);
	vignette.addColorStop(0, 'rgba(0,0,0,0)');
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

	const nameText = (data.name.trim() || 'Your name here').toUpperCase();
	const nameSize = fitFontSize(ctx, nameText, fonts.bebas, 96, size - SAFE_SPACE * 2, 56);
	const nameY = size - BAND_HEIGHT - SAFE_SPACE;

	// Directional scrims behind the text zones — the radial vignette alone
	// doesn't guarantee contrast (a bright photo's center still shows
	// through). Each is a flat SCRIM_ALPHA plateau sized to the actual text
	// bounding box (cap-height to descender, plus a small breathing pad), not
	// the full strip from the card edge to the text — that oversized plateau
	// was crushing photo content in the safe-space margin where no text sits.
	// A short fade runs on either side of the plateau so the edge into the
	// bare photo isn't a hard cut.
	const FADE_LEN = 56;
	const TEXT_PAD = 20;

	// The top zone runs the plateau flush to the canvas edge (y=0) — there is
	// no band up here the way the bottom has one, so anything short of the
	// edge leaves a bare strip of photo above the scrim. The fade stays only
	// on the inner side, easing the plateau back into the photo below the
	// subtitle.
	const topZoneBottom = metaY + 24; // clear of the mono subtitle's descenders
	const topFadeEnd = topZoneBottom + FADE_LEN;

	ctx.fillStyle = `rgba(0,0,0,${SCRIM_ALPHA})`;
	ctx.fillRect(0, 0, size, topZoneBottom);
	const topFadeOut = ctx.createLinearGradient(0, topZoneBottom, 0, topFadeEnd);
	topFadeOut.addColorStop(0, `rgba(0,0,0,${SCRIM_ALPHA})`);
	topFadeOut.addColorStop(1, 'rgba(0,0,0,0)');
	ctx.fillStyle = topFadeOut;
	ctx.fillRect(0, topZoneBottom, size, topFadeEnd - topZoneBottom);

	const nameCapTop = nameY - nameSize * 0.74;
	const bottomZoneTop = Math.max(0, nameCapTop - TEXT_PAD);
	const bottomFadeStart = Math.max(0, bottomZoneTop - FADE_LEN);
	ctx.fillStyle = `rgba(0,0,0,${SCRIM_ALPHA})`;
	ctx.fillRect(0, bottomZoneTop, size, size - BAND_HEIGHT - bottomZoneTop);
	const bottomFade = ctx.createLinearGradient(0, bottomFadeStart, 0, bottomZoneTop);
	bottomFade.addColorStop(0, 'rgba(0,0,0,0)');
	bottomFade.addColorStop(1, `rgba(0,0,0,${SCRIM_ALPHA})`);
	ctx.fillStyle = bottomFade;
	ctx.fillRect(0, bottomFadeStart, size, bottomZoneTop - bottomFadeStart);

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
	ctx.font = `500 44px ${fonts.mono}`;
	ctx.fillStyle = ink;
	ctx.fillText('30 OCT 2026 · PRAGUE', size / 2, metaY);

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
		ctx.font = `600 28px ${fonts.mono}`;
		const pillTextWidth = ctx.measureText(pillText).width;
		const pillPaddingX = 18;
		const pillHeight = 44;
		const pillWidth = pillTextWidth + pillPaddingX * 2;
		const pillGap = 20;

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
		ctx.font = `600 28px ${fonts.mono}`;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(pillText, pillX + pillWidth / 2, pillY + pillHeight / 2 + 1);
	}
}
