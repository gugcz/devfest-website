/**
 * The aether: the painted, slowly moving background behind a page's stage
 * (`docs/design.md`, "The aether"). WebGL 1, no dependencies.
 *
 * The painting (`painter.ts`) runs in a worker on the canvas handed over as
 * an `OffscreenCanvas` (`worker.ts`), so its set-up and its frames never
 * hold up the page; a browser that cannot hand a canvas over, or has no
 * WebGL in a worker, paints on the main thread. This module stays on the
 * page and tells the painting what it measures there.
 *
 * Without WebGL, or with only a software rasterizer, nothing starts and the
 * CSS gradient behind the canvas stays. It moves only while the anchor is on
 * screen. Under `prefers-reduced-motion` it paints one still frame and never
 * animates. It runs at 24 frames a second, drops resolution on a slow GPU
 * and stops (freeing the GPU) when the page is left.
 */
import type { Command, Init, Layout, Refusal } from './painter';
import type { Report, Start } from './worker';

/**
 * Where `el` sits in the document, as at the top of the page: the offsets
 * ignore scrolling and transforms (the logo's entrance), so the sigil stays
 * behind the logo's resting place while the page scrolls over the fixed
 * canvas.
 */
function restingBox(el: HTMLElement): { x: number; y: number; w: number; h: number } {
	let x = 0;
	let y = 0;
	for (let node: HTMLElement | null = el; node; node = node.offsetParent as HTMLElement | null) {
		x += node.offsetLeft;
		y += node.offsetTop;
	}
	return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}

/**
 * Sized by the canvas's box, not the window: scrolling on a phone slides the
 * URL bar and resizes the window, while the box (`100lvh`,
 * `AetherCanvas.astro`) stays put, so the painting does not jump.
 */
function measure(canvas: HTMLCanvasElement, anchor: HTMLElement): Layout {
	const box = restingBox(anchor);
	return {
		width: canvas.clientWidth,
		height: canvas.clientHeight,
		dpr: window.devicePixelRatio || 1,
		anchorX: box.x + box.w / 2,
		anchorY: box.y + box.h / 2,
	};
}

/** The page's end of a painting: where commands go, and how it stops. */
interface Link {
	send(command: Command): void;
	stop(): void;
}

/**
 * Paints on the main thread; `null` when it does not start or the page was
 * left while the painting loaded. Only a browser that cannot hand the canvas
 * to a worker loads it here. `init` is read once loaded, so it carries what
 * the page saw meanwhile (the anchor scrolled away, a new size).
 */
async function onMainThread(canvas: HTMLCanvasElement, init: () => Init, stopped: () => boolean): Promise<Link | null> {
	const { createPainter } = await import('./painter');
	if (stopped()) return null;
	const painter = createPainter(canvas, init(), () => canvas.classList.remove('is-live'));
	if (typeof painter === 'string') return null;
	canvas.classList.add('is-live');
	return { send: (command) => painter.apply(command), stop: () => painter.stop() };
}

/**
 * Hands `canvas` to a worker; `null` when it was handed over already.
 * `onRefusal` runs when the worker will not paint; after `no-context` (no
 * WebGL in a worker: Safari before 17 has `OffscreenCanvas` without it) the
 * canvas is the worker's for good, so the caller paints on a fresh one.
 */
function inWorker(canvas: HTMLCanvasElement, init: Init, onRefusal: (refusal: Refusal) => void): Link | null {
	let offscreen: OffscreenCanvas;
	try {
		offscreen = canvas.transferControlToOffscreen();
	} catch {
		return null;
	}
	const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
	worker.onmessage = ({ data }: MessageEvent<Report>) => {
		if (data === 'live') canvas.classList.add('is-live');
		else if (data === 'lost') canvas.classList.remove('is-live');
		else {
			worker.terminate();
			onRefusal(data);
		}
	};
	const start: Start = { type: 'start', canvas: offscreen, init };
	worker.postMessage(start, [offscreen]);
	return {
		send: (command) => worker.postMessage(command),
		// Ending the worker ends its context and frees the GPU.
		stop: () => worker.terminate(),
	};
}

/**
 * Paints `canvas` behind `anchor` (the sigil centres on it) and returns the
 * function that stops it.
 */
export function startAether(canvas: HTMLCanvasElement, anchor: HTMLElement): () => void {
	const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
	let surface = canvas;
	let inView = true;
	const init = (): Init => ({
		layout: measure(surface, anchor),
		reduced: reduced.matches,
		inView,
		small: Math.min(window.innerWidth, window.innerHeight) < 600,
	});

	let link: Link | null = null;
	let stopped = false;
	const send = (command: Command): void => link?.send(command);

	// The painting only moves while its anchor (the logo, a page title) is on
	// screen; scrolled under the veil it holds its last frame and its clock.
	// Measured again each time: the stage can settle after its islands load.
	const watch = new IntersectionObserver(([entry]) => {
		inView = entry?.isIntersecting ?? true;
		send({ type: 'view', inView, layout: measure(surface, anchor) });
	});
	// A new canvas size clears it to black; the painting repaints its held
	// frame. The first callback, on the next frame, sends the size it starts at.
	const sized = new ResizeObserver(() => send({ type: 'layout', layout: measure(surface, anchor) }));
	const onPointer = (e: PointerEvent): void => {
		if (e.pointerType !== 'touch') send({ type: 'pointer', x: e.clientX, y: e.clientY });
	};
	const onMotionChange = (): void => send({ type: 'motion', reduced: reduced.matches });

	// Stopped, or refused: nothing is left listening.
	const stop = (): void => {
		stopped = true;
		watch.disconnect();
		sized.disconnect();
		window.removeEventListener('pointermove', onPointer);
		reduced.removeEventListener('change', onMotionChange);
		link?.stop();
		link = null;
	};

	const paintOnMainThread = (): void => {
		onMainThread(surface, init, () => stopped)
			.then((made) => {
				if (stopped) made?.stop();
				else if (made) link = made;
				else stop();
			})
			.catch((err: unknown) => {
				console.warn('[aether] painting failed:', err);
				stop();
			});
	};

	const onRefusal = (refusal: Refusal): void => {
		if (stopped) return;
		if (refusal === 'unusable') {
			stop();
			return;
		}
		// A canvas handed to a worker cannot be drawn on here; take a fresh one.
		const fresh = surface.cloneNode() as HTMLCanvasElement;
		surface.replaceWith(fresh);
		sized.unobserve(surface);
		surface = fresh;
		sized.observe(surface);
		paintOnMainThread();
	};

	if ('transferControlToOffscreen' in canvas && typeof Worker === 'function') {
		link = inWorker(canvas, init(), onRefusal);
		if (!link) return () => {};
	} else {
		paintOnMainThread();
	}

	watch.observe(anchor);
	sized.observe(surface);
	window.addEventListener('pointermove', onPointer, { passive: true });
	reduced.addEventListener('change', onMotionChange);
	return stop;
}
