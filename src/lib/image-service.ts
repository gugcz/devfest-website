import type { LocalImageService } from 'astro';
import sharpService from 'astro/assets/services/sharp';
import { Resvg } from '@resvg/resvg-js';

// Astro's Sharp service, plus one case it handles badly: an SVG master asked
// for a raster format. Sharp renders an SVG at its intrinsic size and never
// enlarges, so a wordmark drawn 24px tall comes out 24px tall whatever height
// you ask for. Here resvg draws the vector at the requested size first, and
// Sharp only encodes the result.
//
// Only the credits feed (src/pages/api/credits.json.ts) hits this path: the
// pages pass SVG logos through untouched (`format="svg"`), which goes straight
// to Sharp as before. Every SVG it sees is a repo-owned master, at build time.
const isSvg = (buffer: Uint8Array) => /^\s*(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*)*<svg[\s>]/i.test(new TextDecoder().decode(buffer.subarray(0, 4096)));

const service: LocalImageService = {
	...sharpService,
	async transform(inputBuffer, transform, config, logger) {
		const size = transform.height
			? { mode: 'height' as const, value: Math.round(transform.height) }
			: transform.width
				? { mode: 'width' as const, value: Math.round(transform.width) }
				: undefined;
		if (transform.format === 'svg' || !size || !isSvg(inputBuffer)) {
			return sharpService.transform(inputBuffer, transform, config, logger);
		}
		const png = new Resvg(Buffer.from(inputBuffer), { fitTo: size }).render().asPng();
		return sharpService.transform(new Uint8Array(png), transform, config, logger);
	},
};

export default service;
