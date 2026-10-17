import type { CSSProperties } from 'react';
import { cleanTagline, PORTRAIT_TRANSITION, type Speaker } from '../lib/speakers';
import SpeakerPhoto from './SpeakerPhoto';
import print from './Print.module.scss';
import s from './SpeakerTile.module.scss';

/** One speaker on the casting sheet: the portrait on the shared print, then
 * the sheet number, the name and the role under it. The same tile on the
 * home page (a link to the speaker) and on /speakers (a button that opens
 * the sheet). The portrait is the point: a face, not a name in a list.
 * The print develops to colour while the tile is hovered or focused. */
export default function SpeakerTile({
	speaker,
	index,
	href,
	onOpen,
	morphing = false,
	eager = false,
}: {
	speaker: Speaker;
	/** Position on the sheet, from 1. */
	index: number;
	/** A link to the speaker (home); omit and pass `onOpen` for a button. */
	href?: string;
	onOpen?: (speaker: Speaker) => void;
	/** This tile's print carries the morph into the open sheet. */
	morphing?: boolean;
	eager?: boolean;
}) {
	const tag = cleanTagline(speaker.tagLine);
	const body = (
		<>
			<span
				className={`${print.print} ${s.print}`}
				aria-hidden="true"
				style={morphing ? ({ viewTransitionName: PORTRAIT_TRANSITION } as CSSProperties) : undefined}
			>
				<SpeakerPhoto
					speaker={speaker}
					photoClass={print.photo}
					monogramClass={print.monogram}
					width={360}
					height={450}
					eager={eager}
				/>
				<span className={print.scrim} />
			</span>
			<span className={s.index} aria-hidden="true">
				{String(index).padStart(2, '0')}
			</span>
			<span className={s.name}>{speaker.fullName}</span>
			{tag && <span className={s.role}>{tag}</span>}
		</>
	);

	return (
		<li className={s.cell}>
			{href ? (
				<a className={s.tile} href={href}>
					{body}
				</a>
			) : (
				<button
					type="button"
					className={s.tile}
					onClick={() => onOpen?.(speaker)}
					aria-label={`View ${speaker.fullName}'s profile`}
				>
					{body}
				</button>
			)}
		</li>
	);
}
