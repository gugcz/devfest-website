import { useCallback, useState, type CSSProperties } from 'react';
import { formatClock } from '../lib/agenda';
import { type Speaker } from '../lib/speakers';
import { visitorCategories, type Session, type SessionSpeakerRef } from '../lib/sessions';
import { paragraphs } from '../lib/paragraphs';
import { talkSharePath, useAddressBar } from '../lib/share';
import Sheet, { SheetTickets } from './Sheet';
import SpeakerDetail, { type SpeakerSlot } from './SpeakerDetail';
import SpeakerPhoto from './SpeakerPhoto';
import sheet from './Sheet.module.scss';
import s from './SessionDetail.module.scss';

/**
 * A session only embeds a lightweight speaker summary (id, name, tagline,
 * photo). Widen it to a `Speaker` so the print can open `SpeakerDetail` even
 * when the full profile isn't in the `speakersById` map (fallback).
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

/** `10:00 – 10:45` in CET, the start alone, or `''` before the agenda is set. */
function timeSpan(session: Session): string {
	const start = formatClock(session.startsAt);
	const end = formatClock(session.endsAt);
	if (!start) return '';
	return end ? `${start} – ${end}` : start;
}

/** The room the slip names. Sessionize can leave the name blank; the caller's
 * `when` line (`10:00–10:45, Main Hall`) carries the resolved one then. */
function roomOf(session: Session, when?: string): string {
	const named = session.room.trim();
	if (named || !when) return named;
	return when.split(', ').slice(1).join(', ');
}

// Speakers' prints set down by hand: never the same tilt twice in a row.
const PRINT_TILTS = ['var(--tilt-1)', 'calc(-1 * var(--tilt-2))', 'calc(-1 * var(--tilt-1))'];

/** Session detail dialog: the talk as one big paper slip (time, room, track,
 * title, the abstract in a reading column) and its speakers as small prints.
 * The modal behaviour lives in `Sheet`; a print opens `SpeakerDetail` on top. */
export default function SessionDetail({
	session,
	when,
	speakersById,
	onClose,
}: {
	session: Session;
	/** `10:00–10:45, Main Hall` from a caller that resolves room names; used
	 * for the room when the session's own name is blank. */
	when?: string;
	speakersById: Record<string, Speaker>;
	onClose: () => void;
}) {
	// A speaker sub-dialog stacked on top of this one. Opened from a print,
	// seeded from the embedded ref for an instant render, then enriched below.
	const [activeSpeaker, setActiveSpeaker] = useState<Speaker | null>(null);
	const closeSpeaker = useCallback(() => setActiveSpeaker(null), []);

	const openSpeaker = useCallback(
		(ref: SessionSpeakerRef) => {
			// Prefer the full profile (bio, links, talks) from the lineup fetch; fall
			// back to the session's embedded summary if it isn't in the map.
			setActiveSpeaker(speakersById[ref.id] ?? speakerFromRef(ref));
		},
		[speakersById],
	);

	useAddressBar(talkSharePath(session.id));

	const abstractParagraphs = paragraphs(session.description);
	const tags = visitorCategories(session).flatMap((category) => category.values);
	const time = timeSpan(session);
	const room = roomOf(session, when);
	const slot: SpeakerSlot = { tape: room, clock: formatClock(session.startsAt) };

	return (
		<>
			<Sheet labelledBy="session-detail-title" inert={activeSpeaker !== null} onClose={onClose}>
				<div className={`${sheet.content} ${s.layout}`}>
					<article className={s.slip}>
						{room && <span className={s.room}>{room}</span>}

						{(time || tags.length > 0) && (
							<div className={s.edge}>
								{time && <span className={s.time}>{time}</span>}
								{tags.length > 0 && <span className={s.tags}>{tags.join(', ')}</span>}
							</div>
						)}

						<h2 id="session-detail-title" className={s.title}>
							{session.title}
						</h2>

						{abstractParagraphs.length > 0 && (
							<div className={s.abstract}>
								{abstractParagraphs.map((paragraph, i) => (
									<p key={i}>{paragraph}</p>
								))}
							</div>
						)}
					</article>

					{session.speakers.length > 0 && (
						<div className={s.speakers}>
							<h3 className={sheet.blockTitle}>{session.speakers.length > 1 ? 'Speakers' : 'Speaker'}</h3>
							<ul className={s.prints}>
								{session.speakers.map((speaker, i) => (
									<li key={speaker.id} style={{ '--tilt': PRINT_TILTS[i % PRINT_TILTS.length] } as CSSProperties}>
										<button
											type="button"
											className={`paper ${s.print}`}
											onClick={() => openSpeaker(speaker)}
											aria-label={`View ${speaker.fullName}'s profile`}
										>
											<span className={`paper-photo ${s.photo}`}>
												<SpeakerPhoto
													speaker={speaker}
													photoClass={s.img}
													monogramClass={s.monogram}
													width={240}
													height={300}
												/>
											</span>
											<span className={s.caption}>
												<span className={s.name}>{speaker.fullName}</span>
												{speaker.tagLine && <span className={s.role}>{speaker.tagLine}</span>}
											</span>
										</button>
									</li>
								))}
							</ul>
						</div>
					)}

					<div className={s.way}>
						{/* A drop-in (the lounge, open all day) is not a timed talk. */}
						<SheetTickets line={session.isServiceSession ? 'Ran all day' : 'On stage'} />
					</div>
				</div>
			</Sheet>
			{activeSpeaker && <SpeakerDetail speaker={activeSpeaker} slot={slot} onClose={closeSpeaker} />}
		</>
	);
}
