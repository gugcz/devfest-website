import type { ReactNode } from 'react';
import SpeakerPhoto from './SpeakerPhoto';

interface AvatarSpeaker {
	id: string;
	fullName: string;
	profilePicture: string;
}

/**
 * A row of speaker photos (monogram fallback per speaker, via `SpeakerPhoto`)
 * — the one shape behind `Sessions.tsx`'s 3-max-plus-overflow stack,
 * `Agenda.tsx`'s 3-max no-overflow row, and `SessionDetail.tsx`'s single
 * 72px portrait. Each site's exact sizes/overflow behavior are unified into
 * one component but NOT into one set of values — every visual is a prop.
 *
 * `wrapperClassName` renders a decorative `<span aria-hidden>` group around
 * the photos (and the overflow chip, if any) — omit it for a caller that
 * already provides its own wrapper (a single avatar needs no group wrapper
 * of its own; see `SessionDetail`'s per-row `<span className={s.avatar}>`).
 */
export default function SpeakerAvatars({
	speakers,
	max = 3,
	size,
	photoClass,
	monogramClass,
	wrapperClassName,
	overflowClassName,
}: {
	speakers: AvatarSpeaker[];
	max?: number;
	size: number;
	photoClass: string;
	monogramClass: string;
	wrapperClassName?: string;
	/** Class for the "+N" overflow chip; omit to never render one. */
	overflowClassName?: string;
}): ReactNode {
	const shown = speakers.slice(0, max);
	if (shown.length === 0) return null;
	const extra = speakers.length - shown.length;

	const photos = (
		<>
			{shown.map((speaker) => (
				<SpeakerPhoto
					key={speaker.id}
					speaker={speaker}
					photoClass={photoClass}
					monogramClass={monogramClass}
					width={size}
					height={size}
				/>
			))}
			{overflowClassName && extra > 0 && <span className={overflowClassName}>+{extra}</span>}
		</>
	);

	if (!wrapperClassName) return photos;
	return (
		<span className={wrapperClassName} aria-hidden="true">
			{photos}
		</span>
	);
}
