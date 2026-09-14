import type { SessionSpeakerRef } from '../lib/sessions';
import SpeakerPhoto from './SpeakerPhoto';

/** Up to three overlapping speaker avatars, monogram fallback per speaker.
 * Decorative — the names beside it carry the accessible info. The caller
 * owns the look via classes; `moreClass` opts into the `+N` overflow chip. */
export default function SpeakerStack({
	speakers,
	className,
	avatarClass,
	monogramClass,
	moreClass,
	size,
}: {
	speakers: SessionSpeakerRef[];
	className: string;
	avatarClass: string;
	monogramClass: string;
	moreClass?: string;
	/** Intrinsic px, square. */
	size: number;
}) {
	const shown = speakers.slice(0, 3);
	if (shown.length === 0) return null;
	const extra = speakers.length - shown.length;
	return (
		<span className={className} aria-hidden="true">
			{shown.map((speaker) => (
				<SpeakerPhoto
					key={speaker.id}
					speaker={speaker}
					photoClass={avatarClass}
					monogramClass={monogramClass}
					width={size}
					height={size}
				/>
			))}
			{moreClass && extra > 0 && <span className={moreClass}>+{extra}</span>}
		</span>
	);
}
