import { useEffect, useRef } from 'react';

/**
 * Returns focus to the dialog's trigger — but only on a keyboard close.
 * After a *pointer* close, Firefox and Safari paint a `:focus-visible` ring
 * on scripted focus, which lingers after the modal is gone. So: restore on
 * keyboard closes, skip on pointer closes (focus falling to <body> is fine).
 *
 * Call the setter from each close trigger:
 *   - Esc / keyboard         → setKeyboardClose(true)
 *   - backdrop / close click → setKeyboardClose(false), or `event.detail === 0`
 *     for a button click (0 = keyboard, ≥1 = pointer).
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
