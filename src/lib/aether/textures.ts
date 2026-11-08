/**
 * The two hand-drawn layers of the aether background, drawn once into 2D
 * canvases and uploaded as textures (`docs/design.md`, "The aether").
 *
 * - The sigil: three rings, one per colour channel (R the outer ring with
 *   its ticks and glyphs, G the toothed ring, B the inner star), so the
 *   shader can turn each at its own speed.
 * - The traces: circuit lines running from the sigil to the edges; R is the
 *   line, G the distance along it, B a per-trace seed that times its pulse.
 *
 * Every stroke wavers and tapers like ink. Seeded, so every visit draws the
 * same picture.
 */

const TAU = Math.PI * 2;

/** Half the width of the sigil texture, in shader units. */
export const RING_EXTENT = 0.95;
/** Half the width of the traces texture, in shader units. */
export const TRACE_EXTENT = 1.3;

/** The outer ring's long and short ticks spell this word in ASCII. */
const TICK_MESSAGE = 'TECHNOMANCIE';

type Ctx = CanvasRenderingContext2D;
type Rand = () => number;
type Point = [number, number];

/** Deterministic PRNG (mulberry32). */
function rng(seed: number): Rand {
	let state = seed;
	return () => {
		state = (state + 0x6d2b79f5) | 0;
		let t = Math.imul(state ^ (state >>> 15), 1 | state);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/** A black square canvas whose coordinates run ±`extent` around its centre. */
function makeLayer(size: number, extent: number): { canvas: HTMLCanvasElement; ctx: Ctx } | null {
	const canvas = document.createElement('canvas');
	canvas.width = canvas.height = size;
	const ctx = canvas.getContext('2d');
	if (!ctx) return null;
	ctx.fillStyle = '#000';
	ctx.fillRect(0, 0, size, size);
	const k = size / (2 * extent);
	ctx.setTransform(k, 0, 0, k, size / 2, size / 2);
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';
	return { canvas, ctx };
}

function segment(ctx: Ctx, from: Point, to: Point, width: number): void {
	ctx.lineWidth = width;
	ctx.beginPath();
	ctx.moveTo(from[0], from[1]);
	ctx.lineTo(to[0], to[1]);
	ctx.stroke();
}

/** An arc with an uneven radius and weight that thins at both ends. */
function arc(ctx: Ctx, rand: Rand, radius: number, a0: number, a1: number, width: number, wobble = 0.0022): void {
	const n = Math.max(8, Math.ceil(Math.abs(a1 - a0) * radius * 240));
	const p0 = rand() * TAU;
	const p1 = rand() * TAU;
	const p2 = rand() * TAU;
	let prev: Point | null = null;
	for (let i = 0; i <= n; i++) {
		const a = a0 + ((a1 - a0) * i) / n;
		const r = radius + wobble * (Math.sin(a * 3 + p0) + 0.6 * Math.sin(a * 7 + p1) + 0.3 * Math.sin(a * 19 + p2));
		const point: Point = [r * Math.cos(a), r * Math.sin(a)];
		if (prev) {
			const taper = Math.min(1, Math.min(i, n - i) / 6 + 0.15);
			segment(ctx, prev, point, width * taper * (0.7 + 0.3 * Math.sin(a * 5 + p2)));
		}
		prev = point;
	}
}

/** A straight stroke with a slight bow and, now and then, an overshoot. */
function stroke(ctx: Ctx, rand: Rand, from: Point, to: Point, width: number): void {
	const over = rand() < 0.35 ? 0.1 + rand() * 0.14 : 0;
	const dx = to[0] - from[0];
	const dy = to[1] - from[1];
	const len = Math.hypot(dx, dy) || 1;
	const nx = -dy / len;
	const ny = dx / len;
	const n = Math.max(2, Math.ceil(len * 90));
	const bow = (rand() - 0.5) * 0.0028;
	let prev: Point = from;
	for (let i = 1; i <= n; i++) {
		const t = (i / n) * (1 + over);
		const o = Math.sin(t * Math.PI) * bow;
		const point: Point = [from[0] + dx * t + nx * o, from[1] + dy * t + ny * o];
		segment(ctx, prev, point, width * (0.75 + 0.25 * Math.sin(t * 9)));
		prev = point;
	}
}

/** An invented glyph, somewhere between a rune and a scrap of circuit board. */
function glyph(ctx: Ctx, rand: Rand, centre: Point, size: number, angle: number, width: number): void {
	const cos = Math.cos(angle);
	const sin = Math.sin(angle);
	const at = (ix: number, iy: number): Point => {
		const u = (ix - 1) * size;
		const v = (iy - 1.5) * size;
		return [centre[0] + u * cos - v * sin, centre[1] + u * sin + v * cos];
	};
	let ix = 1;
	let iy = 0;
	let a = at(ix, iy);
	const strokes = 3 + Math.floor(rand() * 3);
	for (let i = 0; i < strokes; i++) {
		const nx = Math.max(0, Math.min(2, ix + Math.floor(rand() * 3) - 1));
		let ny = Math.max(0, Math.min(3, iy + (i < 2 ? 1 : Math.floor(rand() * 3) - 1)));
		if (nx === ix && ny === iy) ny = Math.min(3, iy + 1);
		const b = at(nx, ny);
		stroke(ctx, rand, a, b, width);
		a = b;
		ix = nx;
		iy = ny;
	}
	ctx.beginPath();
	ctx.arc(a[0], a[1], width * 1.5, 0, TAU);
	ctx.fill();
}

/** The message as bits, eight per character, then a gap of eight. */
function tickBits(message: string): number[] {
	const bits: number[] = [];
	for (const char of message) {
		const code = char.charCodeAt(0);
		for (let b = 7; b >= 0; b--) bits.push((code >> b) & 1);
	}
	for (let s = 0; s < 8; s++) bits.push(-1);
	return bits;
}

const polar = (r: number, a: number): Point => [r * Math.cos(a), r * Math.sin(a)];

function outerRing(ctx: Ctx, rand: Rand): void {
	ctx.strokeStyle = ctx.fillStyle = '#f00';
	arc(ctx, rand, 0.665, 0, TAU, 0.0026);
	arc(ctx, rand, 0.698, 0, TAU, 0.0013);
	const bits = tickBits(TICK_MESSAGE);
	const total = bits.length * 3;
	for (let i = 0; i < total; i++) {
		const bit = bits[i % bits.length];
		if (bit < 0) continue;
		const a = (i / total) * TAU;
		const len = bit ? 0.026 : 0.011;
		stroke(ctx, rand, polar(0.669, a), polar(0.669 + len, a), 0.0016);
	}
	const glyphs = 19;
	for (let g = 0; g < glyphs; g++) {
		const a = (g / glyphs) * TAU + 0.11;
		glyph(ctx, rand, polar(0.748, a), 0.0135, a + Math.PI / 2, 0.0019);
	}
	arc(ctx, rand, 0.798, 0.3, 2.1, 0.0015);
	arc(ctx, rand, 0.798, 2.6, 4.4, 0.0015);
	arc(ctx, rand, 0.798, 4.9, 5.95, 0.0015);
}

function gearRing(ctx: Ctx, rand: Rand): void {
	ctx.strokeStyle = ctx.fillStyle = '#0f0';
	const teeth = 54;
	const inner = 0.502;
	const outer = 0.52;
	for (let t = 0; t < teeth; t++) {
		// Gaps, so it does not read as a literal cog.
		if (t % 9 === 8) continue;
		const a0 = (t / teeth) * TAU;
		const a1 = ((t + 0.5) / teeth) * TAU;
		const a2 = ((t + 1) / teeth) * TAU;
		arc(ctx, rand, outer, a0, a1, 0.0021, 0.0004);
		stroke(ctx, rand, polar(outer, a1), polar(inner, a1), 0.0021);
		arc(ctx, rand, inner, a1, a2, 0.0021, 0.0004);
		stroke(ctx, rand, polar(inner, a2), polar(outer, a2), 0.0021);
	}
	arc(ctx, rand, 0.484, 0.2, 2.75, 0.0012);
	arc(ctx, rand, 0.484, 3.3, 5.9, 0.0012);
	for (let o = 0; o < 3; o++) {
		const [x, y] = polar(0.555, 0.6 + (o / 3) * TAU);
		ctx.lineWidth = 0.0018;
		ctx.beginPath();
		ctx.arc(x, y, 0.024, 0, TAU);
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(x, y, 0.006, 0, TAU);
		ctx.fill();
	}
}

function innerStar(ctx: Ctx, rand: Rand): void {
	ctx.strokeStyle = ctx.fillStyle = '#00f';
	const points = 7;
	const radius = 0.345;
	const step = 3;
	const verts = Array.from({ length: points }, (_, v) => polar(radius, (v / points) * TAU - Math.PI / 2));
	for (let e = 0; e < points; e++) stroke(ctx, rand, verts[e], verts[(e + step) % points], 0.0014);
	arc(ctx, rand, radius, 0, TAU, 0.0018);
	arc(ctx, rand, 0.16, 0, TAU, 0.0012);
	for (const [x, y] of verts) {
		ctx.lineWidth = 0.0016;
		ctx.beginPath();
		ctx.arc(x, y, 0.012, 0, TAU);
		ctx.stroke();
	}
}

/** R = outer ring, G = toothed ring, B = inner star; each turns on its own. */
export function drawSigil(size: number): HTMLCanvasElement | null {
	const layer = makeLayer(size, RING_EXTENT);
	if (!layer) return null;
	const rand = rng(2027);
	layer.ctx.globalCompositeOperation = 'lighter';
	outerRing(layer.ctx, rand);
	gearRing(layer.ctx, rand);
	innerStar(layer.ctx, rand);
	return layer.canvas;
}

const traceColour = (t: number, seed: number): string =>
	`rgb(255,${Math.round(Math.min(1, t) * 255)},${Math.round(seed * 255)})`;

interface Walker {
	ctx: Ctx;
	rand: Rand;
	seed: number;
}

/** One straight run of a trace, coloured by its distance along the trace. */
function run(w: Walker, start: Point, dir: number, len: number, t: number): Point {
	const dx = Math.cos((dir * Math.PI) / 4);
	const dy = Math.sin((dir * Math.PI) / 4);
	const n = Math.ceil(len / 0.012);
	const bow = (w.rand() - 0.5) * 0.002;
	const at = (u: number): Point => {
		const o = Math.sin(u * Math.PI) * bow;
		return [start[0] + dx * len * u - dy * o, start[1] + dy * len * u + dx * o];
	};
	for (let j = 0; j < n; j++) {
		w.ctx.strokeStyle = traceColour(t + (j / n) * len, w.seed);
		segment(w.ctx, at(j / n), at((j + 1) / n), 0.0021);
	}
	return [start[0] + dx * len, start[1] + dy * len];
}

/** Turns now and then, but never back toward the sigil. */
function nextDirection(rand: Rand, dir: number, at: Point): number {
	if (rand() >= 0.55) return dir;
	const radial = Math.round(Math.atan2(at[1], at[0]) / (Math.PI / 4));
	const candidate = dir + (rand() < 0.5 ? 1 : -1);
	const diff = ((((candidate - radial) % 8) + 12) % 8) - 4;
	return Math.abs(diff) <= 1 ? candidate : radial;
}

/** A pad at the end of a trace: a ring or a dot. */
function pad(w: Walker, at: Point, t: number): void {
	w.ctx.fillStyle = w.ctx.strokeStyle = traceColour(t, w.seed);
	w.ctx.beginPath();
	if (w.rand() < 0.5) {
		w.ctx.lineWidth = 0.0024;
		w.ctx.arc(at[0], at[1], 0.0075, 0, TAU);
		w.ctx.stroke();
	} else {
		w.ctx.arc(at[0], at[1], 0.0055, 0, TAU);
		w.ctx.fill();
	}
}

function walk(w: Walker, from: Point, startDir: number, steps: number, tStart: number): void {
	let at = from;
	let dir = startDir;
	let t = tStart;
	for (let i = 0; i < steps; i++) {
		const len = 0.05 + w.rand() * 0.17;
		at = run(w, at, dir, len, t);
		t += len;
		if (w.rand() < 0.28 && i < steps - 1) {
			walk(w, at, dir + (w.rand() < 0.5 ? -1 : 1), 1 + Math.floor(w.rand() * 2), t);
		}
		dir = nextDirection(w.rand, dir, at);
	}
	pad(w, at, t);
}

/** R = the line, G = the distance along it, B = the trace's seed (its pulse timing). */
export function drawTraces(size: number): HTMLCanvasElement | null {
	const layer = makeLayer(size, TRACE_EXTENT);
	if (!layer) return null;
	const rand = rng(1984);
	const count = 52;
	for (let i = 0; i < count; i++) {
		const a = (i / count) * TAU + (rand() - 0.5) * 0.09;
		const r = 0.81 + rand() * 0.03;
		const steps = 3 + Math.floor(rand() * 4);
		walk({ ctx: layer.ctx, rand, seed: rand() }, polar(r, a), Math.round(a / (Math.PI / 4)), steps, 0);
	}
	return layer.canvas;
}
