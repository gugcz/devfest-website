import { useCallback, useRef, useState } from 'react';
import { type Speaker } from '../lib/speakers';
import { paragraphs, visitorCategories, type Session, type SessionSpeakerRef } from '../lib/sessions';
import { useDialog } from '../lib/useDialog';
import Sheet from './Sheet';
import SpeakerAvatars from './SpeakerAvatars';
import SpeakerDetail from './SpeakerDetail';
import sheet from './Sheet.module.scss';
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

/**
 * Accessible session detail dialog: room, abstract, and the talk's speakers.
 * Traps focus, closes on Esc, locks body scroll, and restores focus to the
 * triggering card on close (mirrors `SpeakerDetail`) — all via `useDialog`;
 * `Sheet` owns the portal, bar and Close control.
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

	// A speaker sub-dialog stacked on top of this one. Opened from a speaker row,
	// seeded from the embedded ref for an instant render, then enriched below.
	const [activeSpeaker, setActiveSpeaker] = useState<Speaker | null>(null);

	// Bails Esc / Tab handling while the stacked speaker dialog is open — that
	// dialog owns the keyboard when it's on top.
	const setKeyboardClose = useDialog(dialogRef, onClose, { enabled: activeSpeaker === null });

	const closeSpeaker = useCallback(() => setActiveSpeaker(null), []);

	const openSpeaker = useCallback(
		(ref: SessionSpeakerRef) => {
			// Prefer the full profile (bio, links, talks) from the lineup fetch; fall
			// back to the session's embedded summary if it isn't in the map.
			setActiveSpeaker(speakersById[ref.id] ?? speakerFromRef(ref));
		},
		[speakersById],
	);

	const abstractParagraphs = paragraphs(session.description);
	const tagCategories = visitorCategories(session);

	return (
		<>
			<Sheet
				dialogRef={dialogRef}
				ariaLabelledBy="session-detail-title"
				onCloseClick={(viaKeyboard) => {
					setKeyboardClose(viaKeyboard);
					onClose();
				}}
			>
				<p className={sheet.kicker}>Session</p>
				<h2 id="session-detail-title" className={sheet.title}>
					{session.title}
				</h2>

				{/* Room, track and level on ONE mono line. The tags used to be a
				    second row of bordered chips under the room — a pill is a
				    different product's vocabulary and the redesign took them off
				    every other surface already. */}
				{(session.room || tagCategories.length > 0) && (
					<ul className={s.meta}>
						{session.room && <li className={s.metaItem}>{session.room}</li>}
						{tagCategories.flatMap((category) =>
							category.values.map((value) => (
								<li key={`${category.name}-${value}`} className={s.metaItem}>
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
						<h3 className={sheet.blockTitle}>
							{session.speakers.length > 1 ? 'Speakers' : 'Speaker'}
						</h3>
						<ul className="field">
							{session.speakers.map((speaker) => (
								<li key={speaker.id}>
									<button
										type="button"
										className={`field-row field-row--link ${s.speaker}`}
										onClick={() => openSpeaker(speaker)}
										aria-label={`View ${speaker.fullName}'s profile`}
									>
										<span className={s.avatar}>
											<SpeakerAvatars
												speakers={[speaker]}
												max={1}
												size={72}
												photoClass={s.avatarImg}
												monogramClass={s.avatarMono}
											/>
										</span>
										<span className={s.speakerText}>
											<span className={s.speakerName}>{speaker.fullName}</span>
											{speaker.tagLine && (
												<span className={s.speakerTag}>{speaker.tagLine}</span>
											)}
										</span>
									</button>
								</li>
							))}
						</ul>
					</div>
				)}
			</Sheet>
			{activeSpeaker && <SpeakerDetail speaker={activeSpeaker} onClose={closeSpeaker} />}
		</>
	);
}
