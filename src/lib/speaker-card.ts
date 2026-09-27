/**
 * Drawing logic for the `/speaker-card` share image. Shares the palette,
 * fonts and photo pipeline with the `/attending` card (`attending-card.ts`)
 * but is deliberately a different poster, so a speaker's post never reads as
 * an attendee's: black-and-white photo, brand band on top, and the talk title
 * as the headline (Bebas, like a session row on `/sessions`), set flush left
 * over a floor of black.
 */

import { CARD_SIZE, coverScale, roundRectPath, type Fonts, type Palette, type PhotoTransform } from './attending-card';

export interface SpeakerCardData {
	name: string;
	talk: string;
	photo: ImageBitmap | null;
	transform: PhotoTransform;
}

const MARGIN = 80;
const BAND_HEIGHT = 136;
const LOGO_HEIGHT = 64;
const TALK_MAX_LINES = 3;
const TALK_START_PX = 112;
const TALK_FLOOR_PX = 56;
/** Cap on the title block's height, so a long title can't bury the photo:
 * the block stays in the lower third however long the talk is named. */
const TALK_MAX_BLOCK_PX = 260;
/** Bebas sits tight; 0.94 keeps stacked lines from touching. */
const TALK_LEADING = 0.94;
/** Width of the fade from a photo edge into the black card. */
const PHOTO_FEATHER_PX = 180;

/** Greedy word wrap at the font currently set on `ctx`. */
function wrapWords(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
	const lines: string[] = [];
	let line = '';
	for (const word of text.split(/\s+/)) {
		const next = line ? `${line} ${word}` : word;
		if (line && ctx.measureText(next).width > maxWidth) {
			lines.push(line);
			line = word;
		} else {
			line = next;
		}
	}
	if (line) lines.push(line);
	return lines;
}

/** Shrinks the talk title from `TALK_START_PX` until it fits in
 * `TALK_MAX_LINES` and `TALK_MAX_BLOCK_PX`; past the floor the last line is
 * ellipsized. */
function layoutTalk(
	ctx: CanvasRenderingContext2D,
	title: string,
	family: string,
	maxWidth: number,
): { lines: string[]; size: number } {
	let size = TALK_START_PX;
	let lines: string[];
	for (;;) {
		ctx.font = `${size}px ${family}`;
		lines = wrapWords(ctx, title, maxWidth);
		const fits = lines.length <= TALK_MAX_LINES && lines.length * size * TALK_LEADING <= TALK_MAX_BLOCK_PX;
		if (fits || size <= TALK_FLOOR_PX) break;
		size -= 4;
	}
	if (lines.length > TALK_MAX_LINES) {
		lines = lines.slice(0, TALK_MAX_LINES);
		// Drop whole words, not letters, until the ellipsis fits.
		const words = lines[TALK_MAX_LINES - 1].split(' ');
		while (words.length > 1 && ctx.measureText(`${words.join(' ')}…`).width > maxWidth) words.pop();
		lines[TALK_MAX_LINES - 1] = `${words.join(' ').replace(/[\s,.:;–-]+$/, '')}…`;
	}
	return { lines, size };
}

const backdropTones = new WeakMap<ImageBitmap, number>();

/** Grey level (0–255) of the photo's top, left and right edges — the
 * background a zoomed-out photo sits in. The bottom edge is skipped: it is
 * usually the speaker's torso, and it sits under the dark text floor anyway. */
function backdropTone(photo: ImageBitmap): number {
	const cached = backdropTones.get(photo);
	if (cached !== undefined) return cached;
	const n = 32;
	const probe = document.createElement('canvas');
	probe.width = n;
	probe.height = n;
	const probeCtx = probe.getContext('2d', { willReadFrequently: true });
	let tone = 0;
	if (probeCtx) {
		probeCtx.drawImage(photo, 0, 0, n, n);
		const { data } = probeCtx.getImageData(0, 0, n, n);
		let sum = 0;
		let count = 0;
		for (let y = 0; y < n; y++) {
			for (let x = 0; x < n; x++) {
				if (y > 1 && x > 1 && x < n - 2) continue;
				const i = (y * n + x) * 4;
				sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
				count++;
			}
		}
		tone = Math.round(sum / count);
	}
	backdropTones.set(photo, tone);
	return tone;
}

/** Fades each photo edge that sits inside the card into the backdrop behind
 * it, so a zoomed-out or panned photo has no hard seam (the `/attending` card
 * gets the same from its vignette). At zoom 1 with no pan every edge is off
 * the card and nothing is drawn. */
function featherPhotoEdges(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	size: number,
	tone: number,
): void {
	const feather = Math.min(PHOTO_FEATHER_PX, width / 2, height / 2);
	const edges: Array<[x0: number, y0: number, x1: number, y1: number, inside: boolean]> = [
		[x, 0, x + feather, 0, x > 0],
		[x + width, 0, x + width - feather, 0, x + width < size],
		[0, y, 0, y + feather, y > 0],
		[0, y + height, 0, y + height - feather, y + height < size],
	];
	for (const [x0, y0, x1, y1, inside] of edges) {
		if (!inside) continue;
		const fade = ctx.createLinearGradient(x0, y0, x1, y1);
		fade.addColorStop(0, `rgba(${tone},${tone},${tone},1)`);
		fade.addColorStop(1, `rgba(${tone},${tone},${tone},0)`);
		ctx.fillStyle = fade;
		ctx.fillRect(x, y, width, height);
	}
}

/** Paints the 1200×1200 speaker card. Synchronous; pass `logo` as `null`
 * until decoded. */
export function drawSpeakerCard(
	ctx: CanvasRenderingContext2D,
	data: SpeakerCardData,
	fonts: Fonts,
	palette: Palette,
	logo: HTMLImageElement | null,
): void {
	const size = CARD_SIZE;
	const textWidth = size - MARGIN * 2;
	ctx.clearRect(0, 0, size, size);
	if (!data.photo) return;

	// Backdrop in the photo's own background tone, not black: below zoom 1 a
	// white studio shot would otherwise glow as a box on black.
	const tone = backdropTone(data.photo);
	ctx.fillStyle = `rgb(${tone},${tone},${tone})`;
	ctx.fillRect(0, 0, size, size);

	// ── Photo, cover-fit with pan/zoom, then desaturated. `saturation` blend,
	// not `ctx.filter` (WebKit ignores canvas `filter`).
	const scale = coverScale(data.photo.width, data.photo.height, size) * data.transform.zoom;
	const drawWidth = data.photo.width * scale;
	const drawHeight = data.photo.height * scale;
	// Whole pixels, so an edge inside the card leaves no half-covered seam.
	const dx = Math.round(size / 2 - drawWidth / 2 + data.transform.panX * scale);
	const dy = Math.round(size / 2 - drawHeight / 2 + data.transform.panY * scale);
	ctx.drawImage(data.photo, dx, dy, Math.round(drawWidth), Math.round(drawHeight));
	ctx.save();
	ctx.globalCompositeOperation = 'saturation';
	ctx.fillStyle = '#808080';
	ctx.fillRect(0, 0, size, size);
	ctx.restore();
	featherPhotoEdges(ctx, dx, dy, Math.round(drawWidth), Math.round(drawHeight), size, tone);

	// ── Text block, measured bottom-up from the lower margin: name (mono),
	// talk title (Bebas), `SPEAKER` stamp.
	const name = data.name.trim().toUpperCase() || 'YOUR NAME';
	// Uppercased up front: Bebas draws ASCII lowercase as caps but has no
	// lowercase accented glyphs, so `č`/`ř`/`ž` would fall back to another face.
	const talk = data.talk.trim().toLocaleUpperCase('cs-CZ');
	const { lines, size: talkSize } = talk
		? layoutTalk(ctx, talk, fonts.bebas, textWidth)
		: { lines: [] as string[], size: 0 };
	const talkLineHeight = Math.round(talkSize * TALK_LEADING);

	let nameSize = 44;
	ctx.letterSpacing = '2px';
	ctx.font = `500 ${nameSize}px ${fonts.mono}`;
	while (nameSize > 28 && ctx.measureText(name).width > textWidth) {
		nameSize -= 2;
		ctx.font = `500 ${nameSize}px ${fonts.mono}`;
	}
	ctx.letterSpacing = '0px';
	const nameY = size - MARGIN;
	const lastTalkY = nameY - nameSize - 52;
	const firstTalkY = lastTalkY - (lines.length - 1) * talkLineHeight;
	const stampHeight = 60;
	const stampTop = lines.length
		? firstTalkY - talkSize * 0.72 - 36 - stampHeight
		: nameY - nameSize - 36 - stampHeight;

	// Floor of black under the block: clear above it, ~0.92 at the foot, so
	// cream type holds contrast over any photo.
	const floorTop = Math.max(BAND_HEIGHT, stampTop - 220);
	const floor = ctx.createLinearGradient(0, floorTop, 0, size);
	floor.addColorStop(0, 'rgba(0,0,0,0)');
	floor.addColorStop(Math.min(0.55, (stampTop - floorTop) / (size - floorTop)), 'rgba(0,0,0,0.82)');
	floor.addColorStop(1, 'rgba(0,0,0,0.94)');
	ctx.fillStyle = floor;
	ctx.fillRect(0, floorTop, size, size - floorTop);

	// `SPEAKER` stamp: mono on the red plate, the card's one accent block
	// besides the band.
	ctx.font = `600 34px ${fonts.mono}`;
	const stampLabel = 'SPEAKER';
	ctx.letterSpacing = '6px';
	const stampWidth = ctx.measureText(stampLabel).width + 48;
	ctx.fillStyle = palette.accent;
	roundRectPath(ctx, MARGIN, stampTop, stampWidth, stampHeight, 2);
	ctx.fill();
	ctx.fillStyle = palette.onAccent;
	ctx.textAlign = 'left';
	ctx.textBaseline = 'middle';
	ctx.fillText(stampLabel, MARGIN + 24 + 3, stampTop + stampHeight / 2 + 1);
	ctx.letterSpacing = '0px';

	ctx.textBaseline = 'alphabetic';
	ctx.fillStyle = palette.ink;
	ctx.font = `${talkSize}px ${fonts.bebas}`;
	lines.forEach((line, i) => ctx.fillText(line, MARGIN, firstTalkY + i * talkLineHeight));

	ctx.font = `500 ${nameSize}px ${fonts.mono}`;
	ctx.letterSpacing = '2px';
	ctx.fillText(name, MARGIN, nameY);
	ctx.letterSpacing = '0px';

	// ── Brand band across the top: black wordmark left, date + place right.
	ctx.fillStyle = palette.accent;
	ctx.fillRect(0, 0, size, BAND_HEIGHT);
	const bandMid = BAND_HEIGHT / 2;
	if (logo && logo.naturalWidth > 0) {
		const logoWidth = (logo.naturalWidth / logo.naturalHeight) * LOGO_HEIGHT;
		// White asset tinted black on a scratch canvas (see `attending-card.ts`).
		const tint = document.createElement('canvas');
		tint.width = Math.ceil(logoWidth);
		tint.height = LOGO_HEIGHT;
		const tintCtx = tint.getContext('2d');
		if (tintCtx) {
			tintCtx.drawImage(logo, 0, 0, logoWidth, LOGO_HEIGHT);
			tintCtx.globalCompositeOperation = 'source-atop';
			tintCtx.fillStyle = '#000000';
			tintCtx.fillRect(0, 0, logoWidth, LOGO_HEIGHT);
			ctx.drawImage(tint, MARGIN, bandMid - LOGO_HEIGHT / 2, logoWidth, LOGO_HEIGHT);
		}
	}
	ctx.fillStyle = '#000000';
	ctx.font = `500 34px ${fonts.mono}`;
	ctx.letterSpacing = '3px';
	ctx.textAlign = 'right';
	ctx.textBaseline = 'middle';
	ctx.fillText('30 OCT 2026 · PRAGUE', size - MARGIN, bandMid + 1);
	ctx.letterSpacing = '0px';
	ctx.textAlign = 'left';
}
