import { useEffect, useRef } from 'react';
import { initials } from '../lib/speakers';
import { formatSessionTime, type Session, type SessionSpeakerRef } from '../lib/sessions';
import s from './SessionDetail.module.scss';

function SpeakerAvatar({ speaker }: { speaker: SessionSpeakerRef }) {
	// Broken/absent CDN URL degrades to the monogram, same as the speaker cards.
	return speaker.profilePicture ? (
		<img
			className={s.avatarImg}
			src={speaker.profilePicture}
			alt=""
			loading="lazy"
			decoding="async"
			width={72}
			height={72}
			onError={(e) => {
				(e.currentTarget as HTMLImageElement).style.display = 'none';
			}}
		/>
	) : (
		<span className={s.avatarMono} aria-hidden="true">
			{initials(speaker.fullName) || '?'}
		</span>
	);
}

/**
 * Accessible session detail dialog: schedule slot, abstract, and the talk's
 * speakers. Traps focus, closes on Esc / backdrop click, locks body scroll, and
 * restores focus to the triggering card on close (mirrors `SpeakerDetail`).
 */
export default function SessionDetail({ session, onClose }: { session: Session; onClose: () => void }) {
	const dialogRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const previouslyFocused = document.activeElement as HTMLElement | null;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

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
			previouslyFocused?.focus?.();
		};
	}, [onClose]);

	const when = formatSessionTime(session.startsAt, session.endsAt);
	const abstractParagraphs = session.description.split(/\n{2,}|\r\n\r\n/).filter((p) => p.trim());

	return (
		<div
			className={s.overlay}
			onMouseDown={(event) => {
				if (event.target === event.currentTarget) onClose();
			}}
		>
			<div
				className={s.dialog}
				role="dialog"
				aria-modal="true"
				aria-labelledby="session-detail-title"
				ref={dialogRef}
				tabIndex={-1}
			>
				<button className={s.close} type="button" onClick={onClose} aria-label="Close" data-autofocus>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
						<path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
					</svg>
				</button>

				<div className={s.content}>
					<p className={s.kicker}>Session</p>
					<h2 id="session-detail-title" className={s.title}>
						{session.title}
					</h2>

					{(when || session.room) && (
						<ul className={s.meta}>
							{when && <li className={s.metaItem}>{when}</li>}
							{session.room && <li className={s.metaItem}>{session.room}</li>}
						</ul>
					)}

					{abstractParagraphs.length > 0 && (
						<div className={s.abstract}>
							{abstractParagraphs.map((paragraph, i) => (
								<p key={i}>{paragraph}</p>
							))}
						</div>
					)}

					{session.speakers.length > 0 && (
						<div className={s.speakers}>
							<h3 className={s.speakersTitle}>
								{session.speakers.length > 1 ? 'Speakers' : 'Speaker'}
							</h3>
							<ul className={s.speakersList}>
								{session.speakers.map((speaker) => (
									<li key={speaker.id} className={s.speaker}>
										<span className={s.avatar}>
											<SpeakerAvatar speaker={speaker} />
										</span>
										<span className={s.speakerText}>
											<span className={s.speakerName}>{speaker.fullName}</span>
											{speaker.tagLine && (
												<span className={s.speakerTag}>{speaker.tagLine}</span>
											)}
										</span>
									</li>
								))}
							</ul>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
