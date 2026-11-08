/**
 * The aether: the painted, slowly moving background behind a page's stage
 * (`docs/design.md`, "The aether"). WebGL 1, no dependencies.
 *
 * Without WebGL nothing starts and the CSS gradient behind the canvas stays.
 * It moves only while the anchor is on screen. Under
 * `prefers-reduced-motion` it paints one still frame and never
 * animates. It runs at 24 frames a second, drops resolution on a slow GPU
 * and stops (freeing the GPU) when the page is left.
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

const UNIFORMS = ['u_res', 'u_time', 'u_ignite', 'u_lamp', 'u_center', 'u_rings', 'u_traces'] as const;
type Uniforms = Record<(typeof UNIFORMS)[number], WebGLUniformLocation | null>;

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

function texture(gl: WebGLRenderingContext, unit: number, source: HTMLCanvasElement): void {
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
 * Paints `canvas` behind `logo` (the sigil centres on it) and returns the
 * function that stops it. Returns a no-op when WebGL is not there.
 */
export function startAether(canvas: HTMLCanvasElement, logo: HTMLElement): () => void {
	const gl = canvas.getContext('webgl', {
		alpha: false,
		antialias: false,
		depth: false,
		stencil: false,
		powerPreference: 'low-power',
	});
	if (!gl) return () => {};
	const lowEnd = Math.min(window.innerWidth, window.innerHeight) < 600;
	const u = setUp(gl, lowEnd ? 1024 : 2048);
	if (!u) return () => {};
	return animate(canvas, logo, gl, u, lowEnd ? 5e5 : 1.15e6);
}

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

/** The render loop over a set-up context; returns its stop. */
function animate(
	canvas: HTMLCanvasElement,
	logo: HTMLElement,
	gl: WebGLRenderingContext,
	u: Uniforms,
	maxPixels: number,
): () => void {
	const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
	let clock = START_OFFSET;
	let quality = 1;
	let cssW = 1;
	let cssH = 1;
	let lamp = { x: 0.25, y: 0.1 };
	const pointer = { x: 0, y: 0, at: -1e9 };
	let raf = 0;
	let lastFrame = 0;
	let slow = { sum: 0, count: 0 };
	let lost = false;
	/** The time of the frame on the canvas, repainted after a resize. */
	let shown = clock;

	function resize(): void {
		cssW = Math.max(1, canvas.clientWidth);
		cssH = Math.max(1, canvas.clientHeight);
		const dpr = window.devicePixelRatio || 1;
		const scale = Math.min(dpr, Math.sqrt(maxPixels / (cssW * cssH))) * quality;
		canvas.width = Math.max(2, Math.round(cssW * scale));
		canvas.height = Math.max(2, Math.round(cssH * scale));
		gl.viewport(0, 0, canvas.width, canvas.height);
		gl.uniform2f(u.u_res, canvas.width, canvas.height);
		// The sigil sits exactly behind the logo, whatever the layout.
		const box = restingBox(logo);
		const mn = Math.min(cssW, cssH);
		gl.uniform2f(u.u_center, (box.x + box.w / 2 - cssW / 2) / mn, (cssH / 2 - (box.y + box.h / 2)) / mn);
	}

	function render(seconds: number): void {
		if (lost) return;
		shown = seconds;
		gl.uniform1f(u.u_time, seconds);
		// 0 → 1 over the painting's first seconds of movement (the wave of
		// light), then 1.
		const ignite = reduced.matches ? 1 : Math.min(1, Math.max(0, (seconds - START_OFFSET - 0.6) / 4.2));
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
		const mn = Math.min(cssW, cssH);
		const active = now - pointer.at < 5000;
		const tx = active ? (pointer.x - cssW / 2) / mn : 0.62 * Math.sin(seconds * 0.11) * (cssW / mn);
		const ty = active ? (cssH / 2 - pointer.y) / mn : 0.38 * Math.sin(seconds * 0.17 + 1.3);
		const ease = active ? 0.14 : 0.03;
		lamp = { x: lamp.x + (tx - lamp.x) * ease, y: lamp.y + (ty - lamp.y) * ease };
	}

	function frame(now: number): void {
		raf = requestAnimationFrame(frame);
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
	let inView = true;
	function run(): void {
		cancelAnimationFrame(raf);
		resize();
		if (reduced.matches) still();
		else if (inView) raf = requestAnimationFrame(frame);
	}
	const watch = new IntersectionObserver(([entry]) => {
		inView = entry?.isIntersecting ?? true;
		if (!lost) run();
	});
	watch.observe(logo);

	const onPointer = (e: PointerEvent): void => {
		if (e.pointerType === 'touch') return;
		pointer.x = e.clientX;
		pointer.y = e.clientY;
		pointer.at = performance.now();
	};
	const onResize = (): void => {
		if (lost) return;
		resize();
		// A new canvas size clears it to black. Repaint the held frame now: the
		// next 24 fps tick can be several display frames away, and scrolled
		// past the anchor there is no next tick at all.
		render(shown);
	};
	// A lost context stays lost: the canvas fades out and the CSS gradient
	// behind it is the background until the next page load.
	const onLost = (e: Event): void => {
		e.preventDefault();
		lost = true;
		cancelAnimationFrame(raf);
		canvas.classList.remove('is-live');
	};

	window.addEventListener('pointermove', onPointer, { passive: true });
	// Sized by the canvas's box, not the window: scrolling on a phone slides
	// the URL bar and resizes the window, while the box (`100lvh`,
	// `AetherCanvas.astro`) stays put, so the painting does not jump. The
	// first callback comes right after `observe`.
	const sized = new ResizeObserver(onResize);
	sized.observe(canvas);
	const onMotionChange = (): void => {
		if (!lost) run();
	};
	reduced.addEventListener('change', onMotionChange);
	canvas.addEventListener('webglcontextlost', onLost);
	run();
	canvas.classList.add('is-live');

	return () => {
		watch.disconnect();
		cancelAnimationFrame(raf);
		window.removeEventListener('pointermove', onPointer);
		sized.disconnect();
		reduced.removeEventListener('change', onMotionChange);
		canvas.removeEventListener('webglcontextlost', onLost);
		gl.getExtension('WEBGL_lose_context')?.loseContext();
	};
}
