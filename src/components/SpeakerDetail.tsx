import { useRef } from 'react';
import { PORTRAIT_TRANSITION, SPEAKER_ICON_PATHS, type Speaker } from '../lib/speakers';
import { paragraphs } from '../lib/sessions';
import { useDialog } from '../lib/useDialog';
import Sheet from './Sheet';
import SpeakerPhoto from './SpeakerPhoto';
import sheet from './Sheet.module.scss';
import s from './SpeakerDetail.module.scss';

/**
 * Accessible speaker detail dialog: portrait, bio, talks, and social links.
 * Traps focus, closes on Esc, locks body scroll, and restores focus to the
 * triggering card on close — all via `useDialog`; `Sheet` owns the portal,
 * bar and Close control.
 */
export default function SpeakerDetail({ speaker, onClose }: { speaker: Speaker; onClose: () => void }) {
	const dialogRef = useRef<HTMLDivElement>(null);
	const setKeyboardClose = useDialog(dialogRef, onClose);

	const bioParagraphs = paragraphs(speaker.bio);

	return (
		<Sheet
			dialogRef={dialogRef}
			ariaLabelledBy="speaker-detail-name"
			className={s.stacked}
			contentClassName={s.split}
			onCloseClick={(viaKeyboard) => {
				setKeyboardClose(viaKeyboard);
				onClose();
			}}
		>
			{/* Receives the morph from the lineup print — see usePortraitMorph
			    in Speakers.tsx for why the name lives here only while open. */}
			<div className={`print ${s.plate}`} style={{ viewTransitionName: PORTRAIT_TRANSITION }}>
				<SpeakerPhoto
					speaker={speaker}
					photoClass={s.photo}
					monogramClass={s.monogram}
					eager
				/>
			</div>

			<div>
				<p className={sheet.kicker}>Speaker</p>
				<h2 id="speaker-detail-name" className={sheet.title}>
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
						<h3 className={sheet.blockTitle}>Talks</h3>
						<ul className="field">
							{speaker.sessions.map((session, i) => (
								<li key={i} className={`field-row ${s.sessionRow}`}>
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
		</Sheet>
	);
}
