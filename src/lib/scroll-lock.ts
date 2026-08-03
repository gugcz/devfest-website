/**
 * Freezes the page behind an open overlay — the speaker/session dialogs and the
 * mobile nav drawer.
 *
 * The usual move, `document.body.style.overflow = 'hidden'`, is a **no-op on
 * this site in every browser**, which is why the page kept scrolling behind
 * every overlay we had. It only ever works by propagation: the viewport takes
 * its overflow from `html`, and *only* when that computes to `visible` does it
 * fall back to `body`. `BaseLayout.scss` sets `html { overflow-x: clip }` (a
 * deliberate choice — `hidden` there would make html a scroll container and
 * break `position: fixed` under iOS Safari's top chrome), so html's overflow is
 * never `visible`, the fallback never fires, and hiding body's overflow just
 * makes body its own non-scrolling box. Verified in-browser: with the old lock
 * applied, a wheel event still scrolled the document.
 *
 * So take the body out of flow instead (`position: fixed`) and hold the scroll
 * offset as a negative `top`, then put both back on release. That doesn't rely
 * on overflow propagation at all, and is also the approach iOS Safari respects.
 *
 * Counted, because overlays stack: opening a speaker from inside a session
 * dialog takes a second lock, and releasing it must not free the first. Only
 * the outermost lock touches the body.
 *
 * Framework-agnostic on purpose — React islands take it through
 * `useScrollLock`, the drawer in `Menu.astro` calls it directly, and both must
 * share one counter so they can never fight over `document.body.style`.
 */

let locks = 0;
let restoreStyles: (() => void) | null = null;
/** Scroll offset captured when the outermost lock engaged. */
let lockedAt = 0;

function engage(): void {
	const body = document.body;
	lockedAt = window.scrollY;
	const previous = {
		position: body.style.position,
		top: body.style.top,
		left: body.style.left,
		right: body.style.right,
		width: body.style.width,
		overflow: body.style.overflow,
	};

	body.style.position = 'fixed';
	body.style.top = `-${lockedAt}px`;
	body.style.left = '0';
	body.style.right = '0';
	body.style.width = '100%';
	body.style.overflow = 'hidden';

	restoreStyles = () => {
		Object.assign(body.style, previous);
		restoreStyles = null;
	};
}

function disengage(restoreScroll: boolean): void {
	const y = lockedAt;
	restoreStyles?.();
	// `html` carries `scroll-behavior: smooth`, so a plain scrollTo would animate
	// the restore and read as the page sliding away under the closing overlay.
	if (restoreScroll) window.scrollTo({ top: y, left: 0, behavior: 'instant' });
}

/** True while any overlay holds the page. */
export function isScrollLocked(): boolean {
	return locks > 0;
}

/**
 * The scroll offset the page is really at: the frozen one while locked, the
 * live one otherwise. Scroll-driven chrome (the header's brand reveal and
 * hide-on-scroll) has to read this rather than `window.scrollY`, which reports
 * 0 under a lock and would otherwise flip the header's state behind the overlay
 * and again on release.
 */
export function currentScrollY(): number {
	return locks > 0 ? lockedAt : window.scrollY;
}

/**
 * Take a lock. Returns its release, which is idempotent — callers that can fire
 * a close twice (a link tap that also matches a breakpoint change) don't have
 * to track whether they already released.
 */
export function lockScroll(): () => void {
	if (locks++ === 0) engage();
	let released = false;
	return () => {
		if (released) return;
		released = true;
		if (--locks > 0) return;
		disengage(true);
	};
}

if (typeof document !== 'undefined') {
	// <ClientRouter /> swaps the body wholesale, tearing React islands out
	// without running their effect cleanup — a lock held across that boundary
	// would pin the next page with no owner left to release it. Drop everything
	// on the way out, and leave the scroll position alone: the router does its
	// own scroll handling for the incoming page.
	document.addEventListener('astro:before-swap', () => {
		if (locks === 0) return;
		locks = 0;
		disengage(false);
	});
}
