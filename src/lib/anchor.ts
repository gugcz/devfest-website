/**
 * KEEP AN ANCHOR JUMP LANDED WHILE THE PAGE IS STILL SETTLING.
 *
 * A jump — a fresh load of `/#tickets`, a `/#newsletter` link from a subpage,
 * or the hero's own in-page buttons — is resolved against the layout as it
 * stands at that instant. The home page is not finished at that instant: the
 * ticket island swaps its skeleton for the real waves, the speakers teaser
 * renders NOTHING until `/api/lineup` resolves and then appears whole, and the
 * gallery strip loads lazily. Every one of those grows the page ABOVE
 * `#newsletter`, so the target slides down and the visitor is left staring at
 * whatever moved into the place they aimed at (measured before this: 780px to
 * 1630px past the heading, engine and viewport depending — and the in-page
 * click was off by up to 660px in WebKit and Firefox too, not just the
 * deep link).
 *
 * Reserving the islands' heights instead would mean reserving space for
 * sections that legitimately render nothing: the teaser is deliberately absent
 * pre-announce, and a placeholder sized for a lineup that hasn't been
 * announced leaves a permanent hole on the home page. So the page is allowed
 * to change size and the SCROLL follows it — which is what browser scroll
 * anchoring does natively, except WebKit doesn't implement it and it does not
 * cover the initial fragment scroll anywhere.
 *
 * The hold re-aligns only while the scroll position is otherwise at rest, so a
 * smooth in-page animation is never cut short, and it stops the moment the
 * visitor touches the page. Nothing here is a jump the eye can see: the target
 * stays put and the content above it grows around it.
 */

/**
 * How long a landing is held. Long enough to cover both `/api/*` fetches and
 * the lazy gallery images on a slow connection; every frame of it is a no-op
 * once the layout stops moving.
 */
const HOLD_MS = 4000;

/**
 * A hold must not start when the browser restored a reading position instead of
 * resolving the hash — a reload part-way down a page whose URL carries a hash,
 * or a back/forward into one. Yanking that back to the anchor would be a new
 * bug. A restored position is a non-`navigate` navigation that left us well
 * away from the anchor; this is "well away".
 */
const RESTORED_TOLERANCE_PX = 200;

/**
 * True when the browser put us somewhere of its own choosing, not on the hash.
 *
 * Only ever asked on the FIRST document load. The navigation entry describes
 * the document, and a ClientRouter swap does not create a new one — so after a
 * reload of `/invoice`, a soft navigation to `/#tickets` would still read
 * `type === 'reload'` and suppress the hold in exactly the case that needs it.
 */
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

/**
 * Where under the viewport top a jump puts the element: the document's
 * `scroll-padding-top` (the header bar) plus the element's own
 * `scroll-margin-top`. Memoised per element — `drift` runs every frame for the
 * length of the hold, precisely while the islands hydrate, and two
 * `getComputedStyle` reads a frame force layout for no new information. Both
 * values are viewport-dependent, so the memo is dropped on `resize`.
 */
let landingOffset: { el: HTMLElement; px: number } | null = null;

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
			// A scroll is in flight AND the target moved under it — the animation
			// is now aimed at where the target used to be. Re-aim it instead of
			// cutting it off. The 1px tolerance is the same fractional-layout noise
			// the at-rest branch allows for: `rect.top` is fractional and `scrollY`
			// rounds differently per engine and device pixel ratio, so an exact
			// comparison can re-aim on every frame of a smooth scroll at a
			// fractional DPR, restarting the run each time until it crawls. It also
			// stands in for the first frame, where `lastDocTop` is still NaN.
			// `scrollIntoView` with no `behavior` follows the CSS
			// `scroll-behavior`, so it retargets the same smooth run (and stays
			// instant under reduced motion, where the CSS is `auto`).
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
 * swap. The module is evaluated once per document and survives every soft
 * navigation, so the first `keepAnchorLanded()` is the document load and every
 * later one is a swap — which is what `scrollWasRestored` needs to know.
 */
let firstLoad = true;

/**
 * Wire the hold to every way a hash landing happens. Called on every
 * `astro:page-load`: the load-time landing is re-checked per page, the
 * document-level listeners are registered once (they live on `window` /
 * `document`, which survive a ClientRouter swap).
 */
export function keepAnchorLanded(): void {
	// Page load: the initial document, or a soft navigation into `/#tickets`
	// from a subpage. The hold is armed BEFORE the landing rather than after
	// it, because Chromium and WebKit defer the initial fragment scroll and
	// then run it through `scroll-behavior: smooth` — a ~900ms animation aimed
	// at a position the islands invalidate while it is still travelling. The
	// hold sits out any scroll in flight and corrects once it stops, so it
	// covers that as well as a browser that jumps straight there.
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
	window.addEventListener('resize', () => {
		landingOffset = null;
	});

	// An in-page jump. `hashchange` covers the first click and back/forward
	// between anchors; the click handler covers re-clicking the hash the page is
	// already on, which fires no `hashchange` at all.
	window.addEventListener('hashchange', () => {
		const next = targetOf(window.location.hash);
		if (next) hold(next);
	});

	// Deliberately not gated on `event.defaultPrevented`. The usual reason to
	// check it — another handler has taken the navigation, so don't act on it —
	// does not apply: this handler is purely OBSERVATIONAL. It never calls
	// `preventDefault`, never scrolls at click time, and only arms a hold for
	// whatever scroll follows, so a cancelled default carries no information
	// for it. What it does mean here is the opposite of a reason to skip:
	// ClientRouter's own document click handler runs first and cancels
	// same-page hash links so it can scroll them itself, which is precisely the
	// jump this has to hold — checking for it skipped every in-page click on
	// the site.
	document.addEventListener('click', (event) => {
		const link = (event.target as Element | null)?.closest?.('a[href*="#"]');
		if (!(link instanceof HTMLAnchorElement)) return;
		if (link.origin !== window.location.origin || link.pathname !== window.location.pathname) return;
		const next = targetOf(link.hash);
		if (next) hold(next);
	});
}
