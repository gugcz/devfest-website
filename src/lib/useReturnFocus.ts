import { useEffect, useRef } from 'react';

/**
 * Return focus to the dialog's trigger on a KEYBOARD close only — after a
 * pointer close, Firefox/Safari paint a lingering `:focus-visible` ring.
 * Call `setKeyboardClose(true)` on Esc, `false` (or `event.detail === 0`
 * for a button) on click.
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
