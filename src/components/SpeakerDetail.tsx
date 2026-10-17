import { PORTRAIT_TRANSITION, type Speaker, type SpeakerLink } from '../lib/speakers';
import { paragraphs } from '../lib/paragraphs';
import { speakerSharePath, useAddressBar } from '../lib/share';
import Sheet, { SheetTickets } from './Sheet';
import SpeakerPhoto from './SpeakerPhoto';
import sheet from './Sheet.module.scss';
import s from './SpeakerDetail.module.scss';

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

/** Speaker detail dialog: portrait, bio, talks, and social links. The modal
 * behaviour (trap, Esc, scroll lock, focus return) lives in `Sheet`. */
export default function SpeakerDetail({ speaker, onClose }: { speaker: Speaker; onClose: () => void }) {
	useAddressBar(speakerSharePath(speaker.id));

	const bioParagraphs = paragraphs(speaker.bio);

	return (
		<Sheet
			labelledBy="speaker-detail-name"
			className={s.stacked}
			onClose={onClose}
		>
			<div className={`${sheet.content} ${s.split}`}>
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

					<SheetTickets line={`See ${speaker.fullName} live`} />
				</div>
			</div>
		</Sheet>
	);
}
