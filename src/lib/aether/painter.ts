/**
 * The painting itself: a WebGL context set up and its render loop. It runs
 * where its canvas lives: in a worker on an `OffscreenCanvas` (`worker.ts`),
 * or on the main thread where the browser cannot hand the canvas over
 * (`index.ts`). It never touches the DOM: the page measures itself and sends
 * what changed as a `Command`.
 */
import { drawSigil, drawTraces } from './textures';
import { FRAGMENT, VERTEX } from './shader';

const FPS = 24;
/** The paint starts in developed smoke, not in the noise's first state. */
const START_OFFSET = 40;
/** The time the still frame (reduced motion) shows. */
const STILL_AT = START_OFFSET + 14;
/**
 * The longest step the clock takes between two drawn frames, in seconds.
 * After a pause (anchor scrolled away, tab hidden) the paint resumes where it
 * stopped; under 10 fps it slows down instead of skipping.
 */
const MAX_STEP = 0.1;
/**
 * A software rasterizer (no GPU, a blocklisted one, a virtual machine): it
 * would spend a whole CPU core on every frame, so the root's gradients stay
 * the painting instead.
 */
const SOFTWARE = /swiftshader|llvmpipe|softpipe|software|basic render/i;

const UNIFORMS = ['u_res', 'u_time', 'u_ignite', 'u_lamp', 'u_center', 'u_rings', 'u_traces'] as const;
type Uniforms = Record<(typeof UNIFORMS)[number], WebGLUniformLocation | null>;

/** The canvas, on the main thread or handed to a worker. */
export type Surface = HTMLCanvasElement | OffscreenCanvas;

/** What the page measures for the painting. */
export interface Layout {
	/** The canvas box, in CSS pixels. */
	width: number;
	height: number;
	dpr: number;
	/** The anchor's centre at rest, in CSS pixels from the canvas's top left. */
	anchorX: number;
	anchorY: number;
}

export interface Init {
	layout: Layout;
	/** `prefers-reduced-motion`: one still frame, never animated. */
	reduced: boolean;
	/** The anchor on screen: the painting moves; scrolled away it holds its frame. */
	inView: boolean;
	/** A small screen: smaller textures, fewer pixels. */
	small: boolean;
}

/** What the page tells a running painting. */
export type Command =
	| { type: 'layout'; layout: Layout }
	| { type: 'pointer'; x: number; y: number }
	| { type: 'view'; inView: boolean }
	| { type: 'motion'; reduced: boolean };

/** Why a painting did not start: no context at all, or one not worth running. */
export type Refusal = 'no-context' | 'unusable';

export interface Painter {
	apply(command: Command): void;
	/** Stops the loop and frees the GPU. */
	stop(): void;
}

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
	const shader = gl.createShader(type);
	if (!shader) return null;
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
	console.warn('[aether] shader:', gl.getShaderInfoLog(shader));
	return null;
}

function program(gl: WebGLRenderingContext): WebGLProgram | null {
	const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
	const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
	const prog = gl.createProgram();
	if (!vs || !fs || !prog) return null;
	gl.attachShader(prog, vs);
	gl.attachShader(prog, fs);
	gl.linkProgram(prog);
	return gl.getProgramParameter(prog, gl.LINK_STATUS) ? prog : null;
}

function texture(gl: WebGLRenderingContext, unit: number, source: TexImageSource): void {
	gl.activeTexture(gl.TEXTURE0 + unit);
	gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
	gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, source);
	gl.generateMipmap(gl.TEXTURE_2D);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
}

/** The program bound, the triangle uploaded, both textures drawn; `null` if any step fails. */
function setUp(gl: WebGLRenderingContext, textureSize: number): Uniforms | null {
	const prog = program(gl);
	const sigil = drawSigil(textureSize);
	const traces = drawTraces(textureSize);
	if (!prog || !sigil || !traces) return null;
	gl.useProgram(prog);
	gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
	const position = gl.getAttribLocation(prog, 'a');
	gl.enableVertexAttribArray(position);
	gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
	texture(gl, 0, sigil);
	texture(gl, 1, traces);
	const u = Object.fromEntries(UNIFORMS.map((name) => [name, gl.getUniformLocation(prog, name)])) as Uniforms;
	gl.uniform1i(u.u_rings, 0);
	gl.uniform1i(u.u_traces, 1);
	return u;
}

/**
 * `failIfMajorPerformanceCaveat` already refuses a fallback the browser
 * knows is slow; a rasterizer chosen outright (a headless browser, a
 * virtual machine) only names itself. Chrome and Safari mask `RENDERER` and
 * name it through the debug extension; Firefox names it in `RENDERER` and
 * warns on the extension, so it is asked only when masked.
 */
function rendersInSoftware(gl: WebGLRenderingContext): boolean {
	let renderer = String(gl.getParameter(gl.RENDERER));
	if (renderer === 'WebKit WebGL') {
		const info = gl.getExtension('WEBGL_debug_renderer_info');
		if (info) renderer = String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL));
	}
	return SOFTWARE.test(renderer);
}

function context(surface: Surface): WebGLRenderingContext | null {
	const attributes: WebGLContextAttributes = {
		alpha: false,
		antialias: false,
		depth: false,
		stencil: false,
		powerPreference: 'low-power',
		failIfMajorPerformanceCaveat: true,
	};
	// One call on either kind of canvas; their `getContext` overloads differ only in the 2D type.
	return (surface as HTMLCanvasElement).getContext('webgl', attributes);
}

/**
 * Paints on `surface` and returns the painting, or why it did not start:
 * `no-context` without WebGL here, `unusable` when the context is software
 * or the program does not build. `onLost` runs if the GPU drops the context
 * later; a lost context stays lost.
 */
export function createPainter(surface: Surface, init: Init, onLost: () => void): Painter | Refusal {
	const gl = context(surface);
	if (!gl) return 'no-context';
	const u = rendersInSoftware(gl) ? null : setUp(gl, init.small ? 1024 : 2048);
	if (!u) {
		gl.getExtension('WEBGL_lose_context')?.loseContext();
		return 'unusable';
	}
	return animate(surface, gl, u, init, onLost);
}

/** `requestAnimationFrame` where this thread has it (every main thread, most workers), else a timer at the frame rate. */
const nextFrame = (callback: (now: number) => void): number =>
	typeof requestAnimationFrame === 'function'
		? requestAnimationFrame(callback)
		: (setTimeout(() => callback(performance.now()), 1000 / FPS) as unknown as number);
const cancelFrame = (id: number): void =>
	typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame(id) : clearTimeout(id);

/** The render loop over a set-up context. */
function animate(surface: Surface, gl: WebGLRenderingContext, u: Uniforms, init: Init, onLost: () => void): Painter {
	const maxPixels = init.small ? 5e5 : 1.15e6;
	let { layout, reduced, inView } = init;
	let clock = START_OFFSET;
	let quality = 1;
	let lamp = { x: 0.25, y: 0.1 };
	const pointer = { x: 0, y: 0, at: -1e9 };
	let raf = 0;
	let lastFrame = 0;
	let slow = { sum: 0, count: 0 };
	let lost = false;
	/** The time of the frame on the canvas, repainted after a resize. */
	let shown = START_OFFSET;

	const cssW = (): number => Math.max(1, layout.width);
	const cssH = (): number => Math.max(1, layout.height);

	function resize(): void {
		const w = cssW();
		const h = cssH();
		const scale = Math.min(layout.dpr || 1, Math.sqrt(maxPixels / (w * h))) * quality;
		surface.width = Math.max(2, Math.round(w * scale));
		surface.height = Math.max(2, Math.round(h * scale));
		gl.viewport(0, 0, surface.width, surface.height);
		gl.uniform2f(u.u_res, surface.width, surface.height);
		// The sigil sits exactly behind the anchor, whatever the layout.
		const mn = Math.min(w, h);
		gl.uniform2f(u.u_center, (layout.anchorX - w / 2) / mn, (h / 2 - layout.anchorY) / mn);
	}

	function render(seconds: number): void {
		if (lost) return;
		shown = seconds;
		gl.uniform1f(u.u_time, seconds);
		// 0 → 1 over the painting's first seconds of movement (the wave of
		// light), then 1.
		const ignite = reduced ? 1 : Math.min(1, Math.max(0, (seconds - START_OFFSET - 0.6) / 4.2));
		gl.uniform1f(u.u_ignite, ignite);
		gl.uniform2f(u.u_lamp, lamp.x, lamp.y);
		gl.drawArrays(gl.TRIANGLES, 0, 3);
	}

	/** A slow GPU: every 48 frames, if they averaged under ~16 fps, drop a fifth of the resolution. */
	function adapt(dt: number): void {
		if (dt >= 500) return;
		slow = { sum: slow.sum + dt, count: slow.count + 1 };
		if (slow.count < 48) return;
		if (slow.sum / slow.count > 62 && quality > 0.4) {
			quality *= 0.8;
			resize();
		}
		slow = { sum: 0, count: 0 };
	}

	/** The lamp follows the pointer for five seconds after it moves, then drifts on its own. */
	function moveLamp(now: number, seconds: number): void {
		const w = cssW();
		const h = cssH();
		const mn = Math.min(w, h);
		const active = now - pointer.at < 5000;
		const tx = active ? (pointer.x - w / 2) / mn : 0.62 * Math.sin(seconds * 0.11) * (w / mn);
		const ty = active ? (h / 2 - pointer.y) / mn : 0.38 * Math.sin(seconds * 0.17 + 1.3);
		const ease = active ? 0.14 : 0.03;
		lamp = { x: lamp.x + (tx - lamp.x) * ease, y: lamp.y + (ty - lamp.y) * ease };
	}

	function frame(now: number): void {
		raf = nextFrame(frame);
		const dt = now - lastFrame;
		if (dt < 1000 / FPS - 2) return;
		lastFrame = now;
		adapt(dt);
		clock += Math.min(dt / 1000, MAX_STEP);
		moveLamp(now, clock);
		render(clock);
	}

	function still(): void {
		lamp = { x: 0.95, y: -0.5 };
		// Motion turned back on picks up from the still frame, past the wave.
		clock = Math.max(clock, STILL_AT);
		render(STILL_AT);
	}

	// The painting only moves while its anchor (the logo, a page title) is on
	// screen; scrolled under the veil it holds its last frame and its clock.
	function run(): void {
		cancelFrame(raf);
		if (lost) return;
		resize();
		if (reduced) still();
		else if (inView) raf = nextFrame(frame);
	}

	// A lost context stays lost: the canvas fades out and the CSS gradient
	// behind it is the background until the next page load.
	const onContextLost = (e: Event): void => {
		e.preventDefault();
		lost = true;
		cancelFrame(raf);
		onLost();
	};
	surface.addEventListener('webglcontextlost', onContextLost);

	run();

	return {
		apply(command) {
			if (command.type === 'pointer') {
				pointer.x = command.x;
				pointer.y = command.y;
				pointer.at = performance.now();
			} else if (command.type === 'layout') {
				layout = command.layout;
				if (lost) return;
				resize();
				// A new canvas size clears it to black. Repaint the held frame now:
				// the next 24 fps tick can be several display frames away, and
				// scrolled past the anchor there is no next tick at all.
				render(shown);
			} else {
				if (command.type === 'view') inView = command.inView;
				else reduced = command.reduced;
				run();
			}
		},
		stop() {
			cancelFrame(raf);
			surface.removeEventListener('webglcontextlost', onContextLost);
			gl.getExtension('WEBGL_lose_context')?.loseContext();
		},
	};
}
