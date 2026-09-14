import type { ReactNode } from 'react';
import s from './DataState.module.scss';

/**
 * The three non-ready states every data-backed island can be in, as one
 * treatment. See DataState.module.scss for why these were merged.
 *
 * Deliberately not a single `<DataState kind="…" />` switch: the three states
 * carry different ARIA (`status` vs `alert` vs neither) and a caller that
 * picked the wrong string would silently get the wrong announcement.
 */

/** Live region while the endpoint is in flight. `role="status"` (polite) — a
 *  load is not an interruption. */
export function LoadingState({ label }: { label: string }) {
	return (
		<p className={s.loading} role="status">
			<span className={s.dot} aria-hidden="true" />
			{label}
			<span className={s.dots} aria-hidden="true">
				<span />
				<span />
				<span />
			</span>
		</p>
	);
}

/**
 * The endpoint is down. `role="alert"` — the visitor asked for content and
 * isn't getting it. Copy in the site's voice: name the thing, say it isn't
 * coming up, give a way out.
 */
export function ErrorState({ children }: { children: ReactNode }) {
	return (
		<div className={s.state} role="alert">
			{children}
		</div>
	);
}

/** The endpoint answered with nothing to show yet — normal pre-announce, so
 * it always offers somewhere to go. */
export function EmptyState({
	children,
	action,
}: {
	children: ReactNode;
	action?: { href: string; label: string; external?: boolean };
}) {
	return (
		<div className={s.state}>
			{children}
			{action && (
				<a
					className="btn-ghost"
					href={action.href}
					{...(action.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
				>
					{action.label}
				</a>
			)}
		</div>
	);
}
