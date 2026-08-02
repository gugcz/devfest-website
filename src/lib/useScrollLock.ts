import { useEffect } from 'react';

/**
 * Freezes the page behind an open dialog.
 *
 * `overflow: hidden` on the body is the usual move and it is not enough: iOS
 * Safari ignores it and keeps scrolling the document under the overlay, which
 * is what visitors hit when they tried to scroll a speaker's bio on a phone.
 * The reliable trick is to take the body out of flow (`position: fixed`) and
 * hold the scroll offset as a negative `top`, then put both back on release.
 *
 * Counted, because dialogs stack: opening a speaker from inside a session
 * dialog mounts a second lock, and closing it must not release the first. Only
 * the outermost lock touches (and restores) the body.
 */

let locks = 0;
let release: (() => void) | null = null;

function engage(): () => void {
	const body = document.body;
	const scrollY = window.scrollY;
	const previous = {
		position: body.style.position,
		top: body.style.top,
		left: body.style.left,
		right: body.style.right,
		width: body.style.width,
		overflow: body.style.overflow,
	};

	body.style.position = 'fixed';
	body.style.top = `-${scrollY}px`;
	body.style.left = '0';
	body.style.right = '0';
	body.style.width = '100%';
	body.style.overflow = 'hidden';

	return () => {
		Object.assign(body.style, previous);
		// `html` carries `scroll-behavior: smooth`, so a plain scrollTo would
		// animate the restore and read as the page sliding away under the
		// closing dialog.
		window.scrollTo({ top: scrollY, left: 0, behavior: 'instant' });
	};
}

export function useScrollLock(): void {
	useEffect(() => {
		if (locks++ === 0) release = engage();
		return () => {
			if (--locks > 0) return;
			release?.();
			release = null;
		};
	}, []);
}
