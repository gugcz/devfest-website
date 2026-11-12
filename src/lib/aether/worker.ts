/**
 * The aether's worker: paints on the canvas the page handed over
 * (`index.ts`), so drawing the textures, building the shader and every
 * frame run off the page's main thread. Answers `live` once painting,
 * a `Refusal` when it will not start, `lost` when the GPU drops it.
 */
import { createPainter, type Command, type Init, type Painter, type Refusal } from './painter';

export type Start = { type: 'start'; canvas: OffscreenCanvas; init: Init };
export type Report = 'live' | 'lost' | Refusal;

// The DOM typings describe a window; this is a dedicated worker's scope.
const scope = self as unknown as {
	onmessage: ((event: MessageEvent<Start | Command>) => void) | null;
	postMessage(report: Report): void;
};

let painter: Painter | null = null;

scope.onmessage = ({ data }) => {
	if (data.type !== 'start') {
		painter?.apply(data);
		return;
	}
	const made = createPainter(data.canvas, data.init, () => scope.postMessage('lost'));
	if (typeof made === 'string') {
		scope.postMessage(made);
		return;
	}
	painter = made;
	scope.postMessage('live');
};
