import type { ReactNode, RefObject } from 'react';
import { createPortal } from 'react-dom';
import sheet from './Sheet.module.scss';

/**
 * The chrome shared by every full-screen detail view (`SpeakerDetail`,
 * `SessionDetail`): the portal to `<body>` (an island rendered from inside
 * `<main>` would otherwise be trapped in a positioned ancestor's stacking
 * context — see `Sheet.module.scss`), the `role="dialog"` / `aria-modal`
 * outer element, the sticky bar, and the Close button + icon. A caller keeps
 * only its own content (the portrait grid, the meta line, the abstract
 * measure) and composes its own extra classes alongside `Sheet.module.scss`'s.
 *
 * Pointer/focus behavior (focus trap, Esc, body scroll lock, `inert` on the
 * page root) is NOT here — that's `useDialog`, which the caller wires to
 * `dialogRef` and to `onCloseClick` below.
 */
export default function Sheet({
	dialogRef,
	ariaLabelledBy,
	onCloseClick,
	className,
	contentClassName,
	children,
}: {
	dialogRef: RefObject<HTMLDivElement | null>;
	ariaLabelledBy: string;
	/** `event.detail === 0` when Close was activated by keyboard (Enter/Space),
	 * `>= 1` for a real pointer click — the caller decides what that means for
	 * return-focus (see `useReturnFocus`). */
	onCloseClick: (viaKeyboard: boolean) => void;
	/** Extra class(es) for the outer `role="dialog"` element (e.g.
	 * `SpeakerDetail`'s `.stacked`, for the sheet opened from within another). */
	className?: string;
	/** Extra class(es) for the content wrapper (e.g. `SpeakerDetail`'s
	 * `.split` portrait/person grid). */
	contentClassName?: string;
	children: ReactNode;
}) {
	return createPortal(
		<div
			className={className ? `${sheet.sheet} ${className}` : sheet.sheet}
			role="dialog"
			aria-modal="true"
			aria-labelledby={ariaLabelledBy}
			ref={dialogRef}
			tabIndex={-1}
		>
			<div className={sheet.bar}>
				<button
					className={sheet.close}
					type="button"
					onClick={(event) => onCloseClick(event.detail === 0)}
					data-autofocus
				>
					Close
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
						<path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
					</svg>
				</button>
			</div>

			<div className={contentClassName ? `${sheet.content} ${contentClassName}` : sheet.content}>
				{children}
			</div>
		</div>,
		document.body,
	);
}
