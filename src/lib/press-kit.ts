// Build-time press-kit asset lister. Imported only from .astro frontmatter, so
// it runs in Node during the build and never ships to the client. Reads the
// files dropped into public/press-kit/ and turns them into download entries —
// add or remove a file and the press page updates itself, no code change.

import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

export interface PressAsset {
	file: string;
	href: string; // public URL, e.g. /press-kit/DF26_logo_white.png
	label: string;
	ext: string; // uppercase, e.g. PNG / SVG / AI
	sizeLabel: string; // e.g. "242 KB"
	isImage: boolean; // previewable in an <img>
	darkPreview: boolean; // light-ink mark → preview on a dark tile
}

const DIR = 'public/press-kit';
const PUBLIC_PREFIX = '/press-kit';
const IMAGE_EXTS = new Set(['png', 'svg', 'jpg', 'jpeg', 'webp', 'gif', 'avif']);

// Sort rank by extension: vector first, raster next, source files last.
const EXT_RANK: Record<string, number> = { svg: 0, png: 1, webp: 1, jpg: 1, jpeg: 1, gif: 1, pdf: 2, ai: 3, eps: 3 };

// Friendly labels for the known 2026 assets; anything else gets an auto label.
const LABELS: Record<string, string> = {
	'df26_logo-1st.svg': 'Primary logo',
	'DF26_logo_color_1.png': 'Color logo',
	'DF26_logo_color_2.png': 'Color logo (alt)',
	'DF26_logo_color_2_transparent.png': 'Color logo — transparent',
	'DF26_logo_color_2_dark_transparent.png': 'Color logo — for dark backgrounds',
	'DF26_logo_red.png': 'Red logo',
	'DF26_logo_white.png': 'White logo',
	'DF26_logo_white_red-dot.png': 'White logo — red dot',
	'df26_logo_red.ai': 'Red logo — vector source',
	'df26_logo_white.ai': 'White logo — vector source',
};

function humanSize(bytes: number): string {
	if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
	return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function autoLabel(file: string): string {
	const base = file
		.replace(/\.[^.]+$/, '')
		.replace(/^df26[_-]?/i, '')
		.replace(/[_-]+/g, ' ')
		.trim();
	return base.replace(/\b\w/g, (c) => c.toUpperCase()) || file;
}

// Decide whether an asset should preview on a dark tile, from its own pixels
// instead of its filename. Two cases, because the asset set mixes both:
//   • mostly transparent (a bare logo) → contrast the ink: light ink → dark tile
//   • mostly opaque (logo on a baked-in background) → match that background so
//     the tile padding blends: dark background → dark tile
// Returns null if the file can't be decoded (caller falls back to a heuristic).
async function previewIsDark(path: string, ext: string): Promise<boolean | null> {
	try {
		const pipeline = ext === 'svg' ? sharp(path, { density: 96 }) : sharp(path);
		const { data, info } = await pipeline
			.resize(80, 80, { fit: 'inside' })
			.ensureAlpha()
			.raw()
			.toBuffer({ resolveWithObject: true });
		const ch = info.channels;
		let lum = 0;
		let alpha = 0;
		let opaque = 0;
		let total = 0;
		for (let i = 0; i < data.length; i += ch) {
			const a = data[i + 3] / 255;
			total++;
			if (a < 0.1) continue;
			opaque++;
			lum += (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) * a;
			alpha += a;
		}
		if (alpha === 0) return null;
		const mean = lum / alpha;
		const opaqueFrac = opaque / total;
		return opaqueFrac > 0.85 ? mean < 140 : mean > 140;
	} catch {
		return null;
	}
}

export async function listPressKit(): Promise<PressAsset[]> {
	let names: string[];
	try {
		names = readdirSync(DIR);
	} catch {
		return [];
	}

	const assets = await Promise.all(
		names
			.filter((f) => !f.startsWith('.'))
			.map(async (file): Promise<PressAsset> => {
				const ext = (file.split('.').pop() ?? '').toLowerCase();
				const isImage = IMAGE_EXTS.has(ext);
				let size = 0;
				try {
					size = statSync(join(DIR, file)).size;
				} catch {
					/* unreadable — show 0 */
				}

				// Pick the preview tile from the mark's own ink luminance. Non-images
				// show a badge (always on a dark tile); if decoding fails, fall back
				// to a filename heuristic.
				let darkPreview = !isImage || /white|dark/i.test(file);
				if (isImage) {
					const detected = await previewIsDark(join(DIR, file), ext);
					if (detected !== null) darkPreview = detected;
				}

				return {
					file,
					href: `${PUBLIC_PREFIX}/${file}`,
					label: LABELS[file] ?? autoLabel(file),
					ext: ext.toUpperCase(),
					sizeLabel: humanSize(size),
					isImage,
					darkPreview,
				};
			})
	);

	assets.sort((a, b) => {
		const ra = EXT_RANK[a.ext.toLowerCase()] ?? 2;
		const rb = EXT_RANK[b.ext.toLowerCase()] ?? 2;
		return ra - rb || a.file.localeCompare(b.file);
	});

	return assets;
}
