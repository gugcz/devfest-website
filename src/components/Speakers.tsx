import { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { PORTRAIT_TRANSITION, cleanTagline, type Speaker } from '../lib/speakers';
import { fetchLineup } from '../lib/lineup';
import { useRemote } from '../lib/useRemote';
import { REDUCED_MOTION } from '../lib/useMediaQuery';
import { SPEAKER_PARAM } from '../lib/share';
import SpeakerDetail from './SpeakerDetail';
import SpeakerPhoto from './SpeakerPhoto';
import { EmptyState, ErrorState, LoadingState } from './DataState';
import print from './Print.module.scss';
import s from './Speakers.module.scss';

/** Shared `view-transition-name` for a tile's print and the dialog photo, so
 * the browser morphs one into the other. Applied only to the print of the
 * speaker being opened — two elements with the same name at capture time
 * skips the transition. */
type ViewTransitionDoc = Document & {
	startViewTransition?: (cb: () => void) => { finished: Promise<void> };
};

function canMorph(): boolean {
	if (typeof document === 'undefined') return false;
	if (typeof (document as ViewTransitionDoc).startViewTransition !== 'function') return false;
	return !window.matchMedia(REDUCED_MOTION).matches;
}

/**
 * Morphs a tile's print into the dialog photo. The name must be on the
 * print BEFORE the capture (so opening is two renders), only ONE element may
 * carry it per capture (hand-off inside the callback), and `flushSync` is
 * needed or the "after" capture sees an unchanged DOM.
 */
function usePortraitMorph(
	selected: Speaker | null,
	setSelected: (sp: Speaker | null) => void,
) {
	// Which speaker's print carries the transition name (never the open one).
	const [morphId, setMorphId] = useState<string | null>(null);
	const pending = useRef<Speaker | null>(null);

	const open = useCallback(
		(sp: Speaker) => {
			if (!canMorph()) {
				setSelected(sp);
				return;
			}
			pending.current = sp;
			setMorphId(sp.id);
		},
		[setSelected],
	);

	// Second render of the open sequence: the name is now painted on the print,
	// so the capture has something to morph from.
	useEffect(() => {
		const sp = pending.current;
		if (!sp || morphId !== sp.id) return;
		pending.current = null;
		(document as ViewTransitionDoc).startViewTransition?.(() => {
			flushSync(() => {
				setMorphId(null);
				setSelected(sp);
			});
		});
	}, [morphId, setSelected]);

	const close = useCallback(() => {
		const sp = selected;
		if (!sp || !canMorph()) {
			setSelected(null);
			return;
		}
		const transition = (document as ViewTransitionDoc).startViewTransition?.(() => {
			flushSync(() => {
				setSelected(null);
				setMorphId(sp.id);
			});
		});
		// Drop the name once the tween is done so the print is not left carrying it
		// into the next transition.
		transition?.finished.finally(() => setMorphId(null));
	}, [selected, setSelected]);

	return { morphId, open, close };
}

function SpeakerTile({
	speaker,
	onOpen,
	priority,
	morphing,
}: {
	speaker: Speaker;
	onOpen: (speaker: Speaker) => void;
	priority: boolean;
	morphing: boolean;
}) {
	// The print develops to colour while its tile is hovered or focused.
	const [developed, setDeveloped] = useState(false);
	const develop = () => setDeveloped(true);
	const rest = () => setDeveloped(false);

	return (
		<li className={s.cell}>
			<button
				type="button"
				className={s.tile}
				onClick={() => onOpen(speaker)}
				onPointerEnter={develop}
				onPointerLeave={rest}
				onFocus={develop}
				onBlur={rest}
				aria-label={`View ${speaker.fullName}'s profile`}
			>
				<span
					className={print.print}
					data-developed={developed || undefined}
					style={
						morphing ? ({ viewTransitionName: PORTRAIT_TRANSITION } as React.CSSProperties) : undefined
					}
				>
					<SpeakerPhoto
						speaker={speaker}
						photoClass={print.photo}
						monogramClass={print.monogram}
						width={400}
						height={500}
						eager={priority}
					/>
					<span className={print.scrim} aria-hidden="true" />
				</span>
				<span className={s.name}>{speaker.fullName}</span>
				{cleanTagline(speaker.tagLine) && <span className={s.tag}>{cleanTagline(speaker.tagLine)}</span>}
			</button>
		</li>
	);
}

/** The lineup as a grid of prints, one tile per speaker. No placeholder tile
 * for names still to come (removed in #465). Rendered by `Speakers`. */
export function SpeakerLineup({
	speakers,
	onOpen,
	openId = null,
}: {
	speakers: Speaker[];
	onOpen: (speaker: Speaker) => void;
	/** Id of the speaker whose dialog is open — that tile's print carries the morph. */
	openId?: string | null;
}) {
	return (
		<ul className={s.grid} role="list">
			{speakers.map((speaker, i) => (
				<SpeakerTile
					key={speaker.id}
					speaker={speaker}
					onOpen={onOpen}
					priority={i < 4}
					morphing={speaker.id === openId}
				/>
			))}
		</ul>
	);
}

export default function Speakers() {
	const { status, data } = useRemote(fetchLineup, 'speakers', (l) => l.speakers.length === 0);
	const [selected, setSelected] = useState<Speaker | null>(null);
	const { morphId, open, close } = usePortraitMorph(selected, setSelected);

	// A `?speaker=` link (what `/speakers/<id>` forwards to) opens that
	// speaker's sheet once the lineup has loaded. No morph: there is no click
	// to morph from.
	const speakers = data?.speakers;
	useEffect(() => {
		const id = new URLSearchParams(window.location.search).get(SPEAKER_PARAM);
		if (!id || !speakers) return;
		const match = speakers.find((speaker) => speaker.id === id);
		if (match) setSelected(match);
	}, [speakers]);

	if (status === 'error') {
		return (
			<ErrorState>
				<p>The lineup won't come up right now. Reload, or take it up with devfest@gug.cz.</p>
			</ErrorState>
		);
	}

	if (status === 'loading' || !data) {
		return <LoadingState label="Developing the lineup" />;
	}

	if (status === 'empty') {
		return (
			<EmptyState action={{ href: '/#newsletter', label: 'Get notified' }}>
				<p>Lineup announced soon.</p>
			</EmptyState>
		);
	}

	return (
		<>
			<SpeakerLineup speakers={data.speakers} onOpen={open} openId={morphId} />
			{selected && <SpeakerDetail speaker={selected} onClose={close} />}
		</>
	);
}
