import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { EVENT } from '../lib/event';
import { useReturnFocus } from '../lib/useReturnFocus';
import sheet from './Sheet.module.scss';

/**
 * The modal chrome every detail dialog shares: portal to `<body>`, body
 * scroll lock, focus trap, Esc to close, the Close control, and focus back
 * on the trigger after a keyboard close. The caller renders the content.
 *
 * Portalled because the sheet is rendered from an island inside `<main>`;
 * any positioned ancestor with a z-index traps it in that stacking context —
 * on /speakers the fixed site header (z-index 10001) drew straight over the
 * sheet's own 10060 and hid its Close control.
 */
export default function Sheet({
	labelledBy,
	className,
	inert = false,
	onClose,
	children,
}: {
	/** Id of the element that titles the dialog. */
	labelledBy: string;
	/** Extra class on the sheet root (a per-dialog layout). */
	className?: string;
	/** Another dialog is stacked on top: it owns Esc and the focus trap, so
	 * this one's key handler stands down until it closes. */
	inert?: boolean;
	onClose: () => void;
	children: ReactNode;
}) {
	const dialogRef = useRef<HTMLDivElement>(null);
	// Restores focus to the trigger on close — but only for keyboard closes,
	// so a pointer close never leaves a lingering focus ring on the card/row.
	const setKeyboardClose = useReturnFocus();
	// Read inside the (mount-time) key handler so it sees the current value.
	const inertRef = useRef(inert);
	inertRef.current = inert;

	useEffect(() => {
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		const dialog = dialogRef.current;
		const focusables = (): HTMLElement[] =>
			dialog
				? Array.from(
						dialog.querySelectorAll<HTMLElement>('a[href], button, [tabindex]:not([tabindex="-1"])'),
					).filter((el) => !el.hasAttribute('disabled'))
				: [];

		dialog?.querySelector<HTMLElement>('[data-autofocus]')?.focus();

		const onKeyDown = (event: KeyboardEvent) => {
			if (inertRef.current) return;
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
		};
	}, [onClose, setKeyboardClose]);

	return createPortal(
		<div
			className={`${sheet.sheet}${className ? ` ${className}` : ''}`}
			role="dialog"
			aria-modal="true"
			aria-labelledby={labelledBy}
			ref={dialogRef}
			tabIndex={-1}
		>
			<div className={sheet.bar}>
				<button
					className={sheet.close}
					type="button"
					onClick={(event) => {
						// event.detail === 0 when the button was activated by keyboard
						// (Enter/Space); ≥1 for a real pointer click.
						setKeyboardClose(event.detail === 0);
						onClose();
					}}
					data-autofocus
				>
					Close
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
						<path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
					</svg>
				</button>
			</div>
			{children}
		</div>,
		document.body,
	);
}

/** The way on from a detail sheet: one line naming the day, and the site's
 * ticket CTA. Links to `/#tickets` (not ti.to) so the visitor sees the waves
 * and prices before choosing; leaving the page tears the sheet down with it. */
export function SheetTickets({ line }: { line: string }) {
	return (
		<div className={sheet.tickets}>
			<p className={sheet.ticketsLine}>
				{line} &middot; {EVENT.dateLabel}, {EVENT.venue}
			</p>
			<a className="btn-primary" href="/#tickets">
				Get tickets
			</a>
		</div>
	);
}
