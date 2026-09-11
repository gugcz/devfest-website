import { useEffect, useRef, type RefObject } from 'react';
import { useReturnFocus } from './useReturnFocus';

/**
 * How many currently-mounted dialogs want the page behind them `inert`. A
 * stacked dialog (`SessionDetail` → `SpeakerDetail`) means two `useDialog`
 * calls are mounted at once; only the LAST one to close may remove the
 * attribute, so this is a refcount, not a boolean.
 */
let inertDialogs = 0;

function pageRoot(): HTMLElement | null {
	return document.getElementById('main-content');
}

function lockPage(): void {
	inertDialogs += 1;
	if (inertDialogs === 1) pageRoot()?.setAttribute('inert', '');
}

function unlockPage(): void {
	inertDialogs = Math.max(0, inertDialogs - 1);
	if (inertDialogs === 0) pageRoot()?.removeAttribute('inert');
}

/**
 * The a11y contract shared by every full-screen detail sheet (`SpeakerDetail`,
 * `SessionDetail`): body scroll lock, a Tab focus trap scoped to `ref`'s
 * subtree, Esc-to-close, autofocus onto whatever carries `[data-autofocus]`,
 * and — see O-R16 — `inert` on the page root (`#main-content`) for as long as
 * any dialog is open, so an assistive-tech virtual cursor can't reach content
 * behind the `aria-modal` sheet.
 *
 * Wraps {@link useReturnFocus}; returns its `setKeyboardClose` setter so the
 * caller's Close button can still do
 * `setKeyboardClose(event.detail === 0); onClose();`.
 *
 * `opts.enabled` (default `true`) is read through a ref, NOT an effect
 * dependency: a stacked sub-dialog (`SessionDetail` opening `SpeakerDetail`)
 * toggles this on every open/close of the inner dialog, and re-running the
 * outer effect on every toggle would re-lock scroll, re-add `inert` and
 * re-fire autofocus on a dialog that never actually closed. Only the Esc/Tab
 * handling should bail while a stacked dialog owns the keyboard.
 */
export function useDialog(
	ref: RefObject<HTMLElement | null>,
	onClose: () => void,
	opts?: { enabled?: boolean },
): (viaKeyboard: boolean) => void {
	const enabledRef = useRef(opts?.enabled ?? true);
	enabledRef.current = opts?.enabled ?? true;

	const setKeyboardClose = useReturnFocus();

	useEffect(() => {
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		lockPage();

		const dialog = ref.current;
		const focusables = (): HTMLElement[] =>
			dialog
				? Array.from(
						dialog.querySelectorAll<HTMLElement>(
							'a[href], button, [tabindex]:not([tabindex="-1"])',
						),
					).filter((el) => !el.hasAttribute('disabled'))
				: [];

		dialog?.querySelector<HTMLElement>('[data-autofocus]')?.focus();

		const onKeyDown = (event: KeyboardEvent) => {
			// A stacked sub-dialog handles keys while it's open.
			if (!enabledRef.current) return;
			if (event.key === 'Escape') {
				event.stopPropagation();
				setKeyboardClose(true);
				onClose();
				return;
			}
			if (event.key !== 'Tab') return;
			const items = focusables();
			if (items.length === 0) {
				event.preventDefault();
				return;
			}
			const first = items[0];
			const last = items[items.length - 1];
			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		};

		document.addEventListener('keydown', onKeyDown, true);
		return () => {
			document.removeEventListener('keydown', onKeyDown, true);
			document.body.style.overflow = previousOverflow;
			unlockPage();
		};
		// `enabled` deliberately not in the dependency array: read via
		// `enabledRef` instead — see the doc comment above.
	}, [ref, onClose, setKeyboardClose]);

	return setKeyboardClose;
}
