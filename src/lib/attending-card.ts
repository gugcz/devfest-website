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

export type AttendingRole = 'Attendee' | 'Speaker' | 'Organizer';

export const ROLES: readonly AttendingRole[] = ['Attendee', 'Speaker', 'Organizer'];

/** The headline's accent word per role — "I'M <word>". */
const HEADLINE_WORD: Record<AttendingRole, string> = {
	Attendee: 'ATTENDING',
	Speaker: 'SPEAKING',
	Organizer: 'ORGANIZING',
};

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
	role: AttendingRole;
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
	const drawWidth = naturalWidth * scale;
	const drawHeight = naturalHeight * scale;
	const maxX = Math.max(0, (drawWidth - wellSize) / 2 / scale);
	const maxY = Math.max(0, (drawHeight - wellSize) / 2 / scale);
	return {
		panX: Math.min(maxX, Math.max(-maxX, panX)),
		panY: Math.min(maxY, Math.max(-maxY, panY)),
	};
}

/** Base "cover" scale that fills the well with the shorter image edge. */
export function coverScale(naturalWidth: number, naturalHeight: number, wellSize: number): number {
	return wellSize / Math.min(naturalWidth, naturalHeight);
}

interface Fonts {
	bebas: string;
	mono: string;
}

/**
 * Paints the full 1200×1200 card. Synchronous and side-effect-free beyond the
 * given context, so the caller (the React island) owns scheduling/redraw.
 */
export function drawAttendingCard(ctx: CanvasRenderingContext2D, data: CardData, fonts: Fonts): void {
	const size = CARD_SIZE;
	const bg = cssVar('--color-bg') || '#050505';
	const ink = cssVar('--color-text') || '#F2EFE9';
	const red = cssVar('--color-accent-hot') || '#FF1111';
	const accent = cssVar('--color-accent') || '#CC0000';
	const onAccent = cssVar('--on-accent') || '#F7EFE6';
	const rule = cssVar('--rule') || 'rgba(240, 237, 230, 0.16)';
	const panel = cssVar('--panel-lit') || '#0A0908';
	const monogramInk = cssVar('--ink-monogram') || 'rgba(242, 239, 233, 0.46)';
	const muted = 'rgba(240, 237, 230, 0.6)';

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

	// ── Headline: "I'M <ROLE WORD>" — cream + one red word, no shadow/glow.
	const word = HEADLINE_WORD[data.role];
	const headline = `I'M ${word}`;
	const maxHeadlineWidth = size - 180;
	const headlineSize = fitFontSize(ctx, headline, fonts.bebas, 132, maxHeadlineWidth, 64);
	ctx.font = `${headlineSize}px ${fonts.bebas}`;
	ctx.textBaseline = 'alphabetic';
	const prefix = `I'M `;
	const totalWidth = ctx.measureText(headline).width;
	let x = (size - totalWidth) / 2;
	const headlineY = 210;
	ctx.textAlign = 'left';
	ctx.fillStyle = ink;
	ctx.fillText(prefix, x, headlineY);
	x += ctx.measureText(prefix).width;
	ctx.fillStyle = red;
	ctx.fillText(word, x, headlineY);

	// Sub-label under the headline.
	ctx.textAlign = 'center';
	ctx.font = `500 26px ${fonts.mono}`;
	ctx.fillStyle = muted;
	ctx.fillText('DEVFEST.CZ 2026 · PRAGUE', size / 2, headlineY + 56);

	ctx.strokeStyle = rule;
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(140, headlineY + 96);
	ctx.lineTo(size - 140, headlineY + 96);
	ctx.stroke();

	// ── Photo well: a square mount, either the uploaded photo (cover-fit,
	// user pan/zoom) or a monogram fallback — same idea as the site's `.print`
	// mount + `--ink-monogram`, just drawn on canvas instead of in CSS.
	const wellSize = 700;
	const wellX = (size - wellSize) / 2;
	const wellY = headlineY + 140;

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

	// ── Name + role, under the well.
	const nameText = (data.name.trim() || 'Your name here').toUpperCase();
	const nameSize = fitFontSize(ctx, nameText, fonts.bebas, 64, size - 200, 36);
	ctx.font = `${nameSize}px ${fonts.bebas}`;
	ctx.textAlign = 'center';
	ctx.textBaseline = 'alphabetic';
	ctx.fillStyle = ink;
	const nameY = wellY + wellSize + 90;
	ctx.fillText(nameText, size / 2, nameY);

	ctx.font = `500 24px ${fonts.mono}`;
	ctx.fillStyle = muted;
	ctx.fillText(data.role.toUpperCase(), size / 2, nameY + 44);

	// ── Bottom accent band — one per card, mirrors `.band--accent`.
	const bandHeight = 108;
	ctx.fillStyle = accent;
	ctx.fillRect(0, size - bandHeight, size, bandHeight);
	ctx.font = `500 26px ${fonts.mono}`;
	ctx.fillStyle = onAccent;
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillText('DEVFEST.CZ 2026 — 30 OCT · PRAGUE', size / 2, size - bandHeight / 2);
}
