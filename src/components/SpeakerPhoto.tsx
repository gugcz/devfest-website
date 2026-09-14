import { useState } from 'react';
import { initials, type Speaker } from '../lib/speakers';

/** A speaker's photo, or initials. Owns one DECISION: no URL or a failed
 * load both land on the monogram. The caller owns the shape via classes. */
export default function SpeakerPhoto({
	speaker,
	photoClass,
	monogramClass,
	width,
	height,
	eager = false,
}: {
	speaker: Pick<Speaker, 'fullName' | 'profilePicture'>;
	photoClass: string;
	monogramClass: string;
	/** Intrinsic size, to reserve the box. Omitted where the well already has
	 *  an aspect-ratio and the image fills it (the speaker sheet's plate). */
	width?: number;
	height?: number;
	/** Above the fold — skip lazy loading and raise fetch priority. */
	eager?: boolean;
}) {
	// A present-but-broken URL (404 / timeout) has to fall back at runtime, so
	// this needs state even though the "no URL at all" case is static.
	const [failed, setFailed] = useState(false);

	if (!speaker.profilePicture || failed) {
		return (
			<span className={monogramClass} aria-hidden="true">
				{initials(speaker.fullName) || '?'}
			</span>
		);
	}

	return (
		<img
			className={photoClass}
			src={speaker.profilePicture}
			alt=""
			loading={eager ? 'eager' : 'lazy'}
			fetchPriority={eager ? 'high' : 'auto'}
			decoding="async"
			width={width}
			height={height}
			onError={() => setFailed(true)}
		/>
	);
}
