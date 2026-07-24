import { useEffect, useRef } from 'react';

/**
 * Returns focus to the element that was focused when a dialog opened — but only
 * when the dialog was closed by the keyboard.
 *
 * Restoring focus is correct for keyboard and AT users (they need to land back
 * on the trigger). The catch: after a *pointer* close, calling `.focus()`
 * programmatically makes browsers that force `:focus-visible` on scripted focus
 * (Firefox, Safari) paint a focus ring on the trigger — which then lingers on
 * the page after the modal is gone and reads as "the highlight stayed." Chromium
 * doesn't do this, which is why it only reproduces in some browsers.
 *
 * So: restore on keyboard closes (ring is wanted), skip on pointer closes (the
 * mouse user never needed the ring, and focus falling to <body> is fine for
 * them). Call the returned setter from each close trigger:
 *   - Esc / keyboard         → setKeyboardClose(true)
 *   - backdrop / close click  → setKeyboardClose(false), or `event.detail === 0`
 *     for a button click (0 = activated by keyboard, ≥1 = real pointer).
 */
export function useReturnFocus(): (viaKeyboard: boolean) => void {
	const triggerRef = useRef<HTMLElement | null>(null);
	const restoreRef = useRef(false);

	useEffect(() => {
		triggerRef.current = document.activeElement as HTMLElement | null;
		return () => {
			if (restoreRef.current) triggerRef.current?.focus?.();
		};
	}, []);

	return (viaKeyboard: boolean) => {
		restoreRef.current = viaKeyboard;
	};
}
