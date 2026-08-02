import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { initials, type Speaker } from '../lib/speakers';
import { visitorCategories, type Session, type SessionSpeakerRef } from '../lib/sessions';
import { useReturnFocus } from '../lib/useReturnFocus';
import { useScrollLock } from '../lib/useScrollLock';
import SpeakerDetail from './SpeakerDetail';
import s from './SessionDetail.module.scss';

/**
 * A session only embeds a lightweight speaker summary (id, name, tagline,
 * photo). Widen it to a `Speaker` so the row can open `SpeakerDetail` even when
 * the full profile isn't in the `speakersById` map (fallback).
 */
function speakerFromRef(ref: SessionSpeakerRef): Speaker {
	return {
		id: ref.id,
		order: 0,
		fullName: ref.fullName,
		tagLine: ref.tagLine,
		bio: '',
		profilePicture: ref.profilePicture,
		links: [],
		sessions: [],
	};
}

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
 * Accessible session detail dialog: room, abstract, and the talk's speakers.
 * Traps focus, closes on Esc / backdrop click, locks body scroll, and
 * restores focus to the triggering card on close (mirrors `SpeakerDetail`).
 */
export default function SessionDetail({
	session,
	speakersById,
	onClose,
}: {
	session: Session;
	speakersById: Record<string, Speaker>;
	onClose: () => void;
}) {
	const dialogRef = useRef<HTMLDivElement>(null);
	// Restores focus to the trigger on close — keyboard closes only, so a pointer
	// close never leaves a lingering focus ring on the session card.
	const setKeyboardClose = useReturnFocus();
	useScrollLock();

	// A speaker sub-dialog stacked on top of this one. Opened from a speaker row,
	// seeded from the embedded ref for an instant render, then enriched below.
	const [activeSpeaker, setActiveSpeaker] = useState<Speaker | null>(null);
	// Read inside the (mount-time) key handler so it can bail while the speaker
	// dialog is on top — that dialog owns Esc / focus-trap when open.
	const speakerOpenRef = useRef(false);
	speakerOpenRef.current = activeSpeaker !== null;

	const closeSpeaker = useCallback(() => setActiveSpeaker(null), []);

	const openSpeaker = useCallback(
		(ref: SessionSpeakerRef) => {
			// Prefer the full profile (bio, links, talks) from the lineup fetch; fall
			// back to the session's embedded summary if it isn't in the map.
			setActiveSpeaker(speakersById[ref.id] ?? speakerFromRef(ref));
		},
		[speakersById],
	);

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
			// The stacked speaker dialog handles keys while it's open.
			if (speakerOpenRef.current) return;
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

	const abstractParagraphs = session.description.split(/\n{2,}|\r\n\r\n/).filter((p) => p.trim());
	const tagCategories = visitorCategories(session);

	if (typeof document === 'undefined') return null;

	// Portalled into <body> for the same reason as SpeakerDetail: an ancestor
	// stacking context on the page would otherwise cap the overlay below the
	// fixed header and the footer. See the note there.
	return createPortal(
		<>
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
				aria-labelledby="session-detail-title"
				ref={dialogRef}
				tabIndex={-1}
			>
				<button
					className={s.close}
					type="button"
					onClick={(event) => {
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

				<div className={s.content}>
					<p className={s.kicker}>Session</p>
					<h2 id="session-detail-title" className={s.title}>
						{session.title}
					</h2>

					{session.room && (
						<ul className={s.meta}>
							<li className={s.metaItem}>{session.room}</li>
						</ul>
					)}

					{tagCategories.length > 0 && (
						<ul className={s.tags}>
							{tagCategories.flatMap((category) =>
								category.values.map((value) => (
									<li key={`${category.name}-${value}`} className={s.tag}>
										{value}
									</li>
								)),
							)}
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
									<li key={speaker.id}>
										<button
											type="button"
											className={s.speaker}
											onClick={() => openSpeaker(speaker)}
											aria-label={`View ${speaker.fullName}'s profile`}
										>
											<span className={s.avatar}>
												<SpeakerAvatar speaker={speaker} />
											</span>
											<span className={s.speakerText}>
												<span className={s.speakerName}>{speaker.fullName}</span>
												{speaker.tagLine && (
													<span className={s.speakerTag}>{speaker.tagLine}</span>
												)}
											</span>
											<span className={s.speakerGo} aria-hidden="true">→</span>
										</button>
									</li>
								))}
							</ul>
						</div>
					)}
				</div>
			</div>
		</div>
		{activeSpeaker && <SpeakerDetail speaker={activeSpeaker} onClose={closeSpeaker} />}
		</>,
		document.body,
	);
}
