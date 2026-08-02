import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { initials, PORTRAIT_TRANSITION, SPEAKER_ICON_PATHS, type Speaker } from '../lib/speakers';
import { useReturnFocus } from '../lib/useReturnFocus';
import { useScrollLock } from '../lib/useScrollLock';
import s from './SpeakerDetail.module.scss';

/**
 * Accessible speaker detail dialog: portrait, bio, talks, and social links.
 * Traps focus, closes on Esc / backdrop click, locks body scroll, and restores
 * focus to the triggering card on close.
 */
export default function SpeakerDetail({ speaker, onClose }: { speaker: Speaker; onClose: () => void }) {
	const dialogRef = useRef<HTMLDivElement>(null);
	const [imageFailed, setImageFailed] = useState(false);
	const showPhoto = Boolean(speaker.profilePicture) && !imageFailed;
	// Restores focus to the trigger on close — but only for keyboard closes, so a
	// pointer close never leaves a lingering focus ring on the card/row.
	const setKeyboardClose = useReturnFocus();
	useScrollLock();

	useEffect(() => {
		const dialog = dialogRef.current;
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
		};
	}, [onClose, setKeyboardClose]);

	const bioParagraphs = speaker.bio.split(/\n{2,}|\r\n\r\n/).filter((p) => p.trim());

	if (typeof document === 'undefined') return null;

	// Rendered into <body>, not in place. The lineup sits inside a `.rake`
	// section, whose direct children get `position: relative; z-index: 1`
	// (BaseLayout.scss) for the raking-light sweep — that is a stacking context,
	// so an in-place overlay is capped at z-index 1 no matter what it asks for
	// and paints *under* the fixed header (10001) and the footer (2).
	return createPortal(
		<div
			className={s.overlay}
			onMouseDown={(event) => {
				if (event.target === event.currentTarget) {
					setKeyboardClose(false);
					onClose();
				}
			}}
		>
			<div
				className={s.dialog}
				role="dialog"
				aria-modal="true"
				aria-labelledby="speaker-detail-name"
				ref={dialogRef}
				tabIndex={-1}
			>
				<button
					className={s.close}
					type="button"
					onClick={(event) => {
						// event.detail === 0 when the button was activated by keyboard
						// (Enter/Space); ≥1 for a real pointer click.
						setKeyboardClose(event.detail === 0);
						onClose();
					}}
					aria-label="Close"
					data-autofocus
				>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
						<path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
					</svg>
				</button>

				{/* Receives the morph from the lineup print — see usePortraitMorph
				    in Speakers.tsx for why the name lives here only while open. */}
				<div className={s.media} style={{ viewTransitionName: PORTRAIT_TRANSITION }}>
					{showPhoto ? (
						<img
							className={s.photo}
							src={speaker.profilePicture}
							alt=""
							decoding="async"
							onError={() => setImageFailed(true)}
						/>
					) : (
						<span className={s.monogram} aria-hidden="true">
							{initials(speaker.fullName) || '?'}
						</span>
					)}
				</div>

				<div className={s.content}>
					<p className={s.kicker}>Speaker</p>
					<h2 id="speaker-detail-name" className={s.name}>
						{speaker.fullName}
					</h2>
					{speaker.tagLine && <p className={s.tag}>{speaker.tagLine}</p>}

					{speaker.links.length > 0 && (
						<ul className={s.links}>
							{speaker.links.map((link) => (
								<li key={`${link.kind}-${link.url}`}>
									<a
										className={s.link}
										href={link.url}
										aria-label={`${speaker.fullName} — ${link.label}`}
										title={link.label}
										target="_blank"
										rel="noopener noreferrer"
									>
										<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
											<path d={SPEAKER_ICON_PATHS[link.kind]} />
										</svg>
									</a>
								</li>
							))}
						</ul>
					)}

					{bioParagraphs.length > 0 && (
						<div className={s.bio}>
							{bioParagraphs.map((paragraph, i) => (
								<p key={i}>{paragraph}</p>
							))}
						</div>
					)}

					{speaker.sessions.length > 0 && (
						<div className={s.sessions}>
							<h3 className={s.sessionsTitle}>Talks</h3>
							<ul className={s.sessionsList}>
								{speaker.sessions.map((session, i) => (
									<li key={i}>
										<p className={s.sessionName}>{session.name}</p>
										{session.description && (
											<p className={s.sessionDesc}>{session.description}</p>
										)}
									</li>
								))}
							</ul>
						</div>
					)}
				</div>
			</div>
		</div>,
		document.body,
	);
}
