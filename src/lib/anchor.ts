/**
 * KEEP AN ANCHOR JUMP LANDED WHILE THE PAGE SETTLES. Islands hydrate after
 * the jump and grow the page above the target (up to 1630px off), so the
 * scroll follows — native scroll anchoring, which WebKit lacks. Re-aligns
 * only while the scroll is at rest; stops when the visitor touches the page.
 */

/**
 * How long a landing is held. Long enough to cover both `/api/*` fetches and
 * the lazy gallery images on a slow connection; every frame of it is a no-op
 * once the layout stops moving.
 */
const HOLD_MS = 4000;

/** "Well away" from the anchor: a non-`navigate` navigation this far off is
 * a restored reading position, and gets no hold. */
const RESTORED_TOLERANCE_PX = 200;

/** True when the browser restored a position instead of resolving the hash.
 * Only asked on the FIRST document load — a ClientRouter swap creates no new
 * navigation entry. */
function scrollWasRestored(el: HTMLElement): boolean {
	const [nav] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
	if (!nav || nav.type === 'navigate') return false;
	return window.scrollY > 0 && Math.abs(drift(el)) > RESTORED_TOLERANCE_PX;
}

let release: (() => void) | null = null;

function targetOf(hash: string): HTMLElement | null {
	if (!hash || hash === '#') return null;
	let id = hash.slice(1);
	try {
		id = decodeURIComponent(id);
	} catch {
		// A malformed escape is not an id we can resolve; fall through with the raw one.
	}
	return document.getElementById(id) ?? (document.getElementsByName(id)[0] as HTMLElement | undefined) ?? null;
}

/** Landing offset: `scroll-padding-top` + the element's `scroll-margin-top`.
 * Memoised (`drift` runs every frame; `getComputedStyle` forces layout).
 * Dropped on `resize` and by `invalidateAnchorOffsets`. */
let landingOffset: { el: HTMLElement; px: number } | null = null;

/**
 * Drop the memoised landing offset. `Menu.astro` writes `--header-h` from a
 * `ResizeObserver` measurement, which fires no `resize` event — without this
 * the hold would keep correcting to the pre-measurement offset.
 */
export function invalidateAnchorOffsets(): void {
	landingOffset = null;
}

function offsetOf(el: HTMLElement): number {
	if (landingOffset?.el === el) return landingOffset.px;
	const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
	// `.anchor-target` carries a NEGATIVE scroll-margin-top (it cancels the
	// section's own opening air), so this is a subtraction as often as not.
	const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
	landingOffset = { el, px: pad + margin };
	return landingOffset.px;
}

/** Distance from where the element sits to where a jump would put it. */
function drift(el: HTMLElement): number {
	return el.getBoundingClientRect().top - offsetOf(el);
}

/**
 * Anything that means the visitor has taken the scroll back. `keydown` covers
 * Space / PageDown / arrows; `mousedown` covers a scrollbar drag, which
 * produces no wheel event.
 */
const ABORT_EVENTS = ['wheel', 'touchstart', 'pointerdown', 'mousedown', 'keydown'] as const;

/**
 * Hold `el` at its landing position for `HOLD_MS`, or until the visitor scrolls.
 */
function hold(el: HTMLElement): void {
	release?.();

	const deadline = performance.now() + HOLD_MS;
	let frame = 0;
	let lastY = Number.NaN;
	let lastDocTop = Number.NaN;

	const stop = () => {
		cancelAnimationFrame(frame);
		for (const type of ABORT_EVENTS) window.removeEventListener(type, stop, true);
		document.removeEventListener('astro:before-swap', stop);
		release = null;
	};

	const tick = () => {
		const y = window.scrollY;
		const docTop = el.getBoundingClientRect().top + y;
		if (y === lastY) {
			// At rest: correct whatever the page has grown out from under us.
			// Sub-pixel drift is fractional-layout noise, not a missed landing.
			const off = drift(el);
			if (Math.abs(off) > 1) window.scrollBy({ top: off, behavior: 'instant' });
		} else if (Math.abs(docTop - lastDocTop) > 1) {
			// Scroll in flight AND the target moved — re-aim, don't cut off. 1px
			// tolerance: fractional `rect.top` vs rounded `scrollY` would re-aim
			// every frame. `scrollIntoView` without `behavior` follows CSS.
			el.scrollIntoView({ block: 'start', inline: 'nearest' });
		}
		lastY = window.scrollY;
		lastDocTop = docTop;
		if (performance.now() < deadline) frame = requestAnimationFrame(tick);
		else stop();
	};

	for (const type of ABORT_EVENTS) window.addEventListener(type, stop, { capture: true, once: true, passive: true });
	document.addEventListener('astro:before-swap', stop, { once: true });
	release = stop;
	frame = requestAnimationFrame(tick);
}

let wired = false;

/**
 * Whether this call is the document's own load rather than a ClientRouter
 * swap. The module is evaluated once per document, so the first
 * `keepAnchorLanded()` is the load and every later one is a swap.
 */
let firstLoad = true;

/** Wire the hold to every hash landing. Called on every `astro:page-load`;
 * document-level listeners are registered once. */
export function keepAnchorLanded(): void {
	// Page load (initial document, or a soft navigation into `/#tickets`). The
	// hold is armed BEFORE the landing: Chromium and WebKit defer the initial
	// fragment scroll and run it through `scroll-behavior: smooth` — a ~900ms
	// animation the islands invalidate mid-flight. The hold sits out any
	// scroll in flight and corrects once it stops.
	const isFirstLoad = firstLoad;
	firstLoad = false;
	const el = targetOf(window.location.hash);
	// A restored reading position is only possible on the document's own load;
	// a soft navigation into a hash is always a deliberate jump.
	if (el && !(isFirstLoad && scrollWasRestored(el))) hold(el);

	if (wired) return;
	wired = true;

	// Both halves of the landing offset are viewport-dependent, so a resize
	// invalidates the memo `drift` reads every frame.
	window.addEventListener('resize', invalidateAnchorOffsets);

	// An in-page jump. `hashchange` covers the first click and back/forward
	// between anchors; the click handler covers re-clicking the hash the page is
	// already on, which fires no `hashchange` at all.
	window.addEventListener('hashchange', () => {
		const next = targetOf(window.location.hash);
		if (next) hold(next);
	});

	// Deliberately NOT gated on `event.defaultPrevented`. This handler is
	// observational — it only arms a hold for whatever scroll follows. And
	// ClientRouter's own click handler runs first and cancels same-page hash
	// links so it can scroll them itself, which is exactly the jump to hold;
	// checking the flag skipped every in-page click on the site.
	document.addEventListener('click', (event) => {
		const link = (event.target as Element | null)?.closest?.('a[href*="#"]');
		if (!(link instanceof HTMLAnchorElement)) return;
		if (link.origin !== window.location.origin || link.pathname !== window.location.pathname) return;
		const next = targetOf(link.hash);
		if (next) hold(next);
	});
}
