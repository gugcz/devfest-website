import { useState } from 'react';
import { initials, type Speaker } from '../lib/speakers';

/**
 * A speaker's photograph, or their initials when there isn't one. Replaced
 * three copies that disagreed (the same dead URL rendered as initials on
 * /speakers and a hole on /sessions and /agenda). A missing photo is the
 * normal state of a speaker who hasn't sent one.
 *
 * The caller owns the shape (a 4:5 print, a 26px disc) via classes; this owns
 * only the DECISION: no URL, or a URL that fails to load, both land on the
 * monogram.
 */
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
