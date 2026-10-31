import type { CSSProperties } from 'react';
import { PORTRAIT_TRANSITION, type Speaker, type SpeakerLink } from '../lib/speakers';
import { paragraphs } from '../lib/paragraphs';
import { eventDate } from '../lib/event';
import { speakerSharePath, useAddressBar } from '../lib/share';
import Sheet, { SheetTickets } from './Sheet';
import SpeakerPhoto from './SpeakerPhoto';
import sheet from './Sheet.module.scss';
import s from './SpeakerDetail.module.scss';

/** Where and when the speaker is on: the tape over the print (the room) and
 * the time on its edge. Structurally the lineup's `Billing`, so `/speakers`
 * can pass a print's billing straight through. */
export interface SpeakerSlot {
	tape: string;
	clock: string;
}

/** The link's host without `www.`, or `''` for a URL that will not parse. */
function hostOf(url: string): string {
	try {
		return new URL(url).hostname.replace(/^www\./, '');
	} catch {
		return '';
	}
}

/** What a link says on the sheet: the network's name for a known kind
 * ("LinkedIn", "GitHub"), the domain for a website — three "Website" labels
 * side by side told the visitor nothing. */
function linkText(link: SpeakerLink): string {
	if (link.kind !== 'web') return link.label;
	return hostOf(link.url) || link.label;
}

/** The accessible name: who, what, and where it goes. */
function linkAria(name: string, link: SpeakerLink): string {
	const host = hostOf(link.url);
	const what = link.kind === 'web' ? link.label : `${link.label} profile`;
	return host ? `${name}: ${what}, ${host} (opens in a new tab)` : `${name}: ${what} (opens in a new tab)`;
}

/** Speaker detail dialog: the speaker as a large print (tape with the room,
 * the time on its edge) beside the bio in a reading column and the talks as
 * paper slips. The modal behaviour (trap, Esc, scroll lock, focus return)
 * lives in `Sheet`. */
export default function SpeakerDetail({
	speaker,
	slot,
	onClose,
}: {
	speaker: Speaker;
	/** The room and start of the speaker's first talk, when the caller knows them. */
	slot?: SpeakerSlot;
	onClose: () => void;
}) {
	useAddressBar(speakerSharePath(speaker.id));

	const bioParagraphs = paragraphs(speaker.bio);

	return (
		<Sheet labelledBy="speaker-detail-name" className={s.stacked} onClose={onClose}>
			<div className={`${sheet.content} ${s.split}`}>
				<div className={s.printCol}>
					<div className={`paper ${s.print}`} style={{ '--tilt': 'calc(-1 * var(--tilt-1))' } as CSSProperties}>
						{slot?.tape && <span className="tape">{slot.tape}</span>}
						{/* Receives the morph from the lineup print — see usePortraitMorph
						    in Speakers.tsx for why the name lives here only while open. */}
						<div className={`paper-photo ${s.photoWell}`} style={{ viewTransitionName: PORTRAIT_TRANSITION }}>
							<SpeakerPhoto speaker={speaker} photoClass={s.photo} monogramClass={s.monogram} eager />
						</div>
						<p className="paper-edge">
							<span>{eventDate('slash')}</span>
							{slot?.clock && <span>{slot.clock}</span>}
						</p>
					</div>
				</div>

				<div className={s.person}>
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
										aria-label={linkAria(speaker.fullName, link)}
										target="_blank"
										rel="noopener noreferrer"
									>
										{linkText(link)}
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
							<h3 className={sheet.blockTitle}>{speaker.sessions.length > 1 ? 'Talks' : 'Talk'}</h3>
							<ul className={s.slips}>
								{speaker.sessions.map((session, i) => (
									<li key={i} className={s.slip}>
										<p className={s.slipTitle}>{session.name}</p>
										{session.description && (
											<div className={s.slipDesc}>
												{paragraphs(session.description).map((paragraph, j) => (
													<p key={j}>{paragraph}</p>
												))}
											</div>
										)}
									</li>
								))}
							</ul>
						</div>
					)}

					<SheetTickets line={`See ${speaker.fullName} live`} />
				</div>
			</div>
		</Sheet>
	);
}
