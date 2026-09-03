import { useState } from 'react';
import { initials, type Speaker } from '../lib/speakers';

/**
 * A speaker's photograph, or their initials when there isn't one.
 *
 * There were three of these. /speakers fell back to a monogram; /sessions and
 * /agenda set `visibility: hidden` on the broken <img> and left a blank disc in
 * the stack, so the SAME speaker with the SAME dead CDN URL rendered as
 * initials on one page and as a hole on the other two. A missing photo is not
 * an error state — it is the normal state of a speaker who hasn't sent one —
 * and it should read the same everywhere.
 *
 * The caller owns the shape (a 4:5 print, a 26px disc) by passing its own
 * classes; this owns only the DECISION: no URL, or a URL that fails to load,
 * both land on the monogram. The monogram inks come from --ink-monogram /
 * --ink-monogram-sm, which is why the size choice is the caller's too.
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
