import { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { PORTRAIT_TRANSITION, type Speaker } from '../lib/speakers';
import { fetchLineup } from '../lib/lineup';
import { useRemote } from '../lib/useRemote';
import { REDUCED_MOTION } from '../lib/useMediaQuery';
import { SPEAKER_PARAM } from '../lib/share';
import SpeakerDetail from './SpeakerDetail';
import SpeakerPhoto from './SpeakerPhoto';
import { EmptyState, ErrorState, LoadingState } from './DataState';
import print from './Print.module.scss';
import s from './Speakers.module.scss';

/** Shared `view-transition-name` for the portrait plate and the dialog photo,
 * so the browser morphs one into the other. Applied only while the plate shows
 * the speaker being opened — two elements with the same name at capture time
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
 * Morphs the portrait plate into the dialog photo. The name must be on the
 * plate BEFORE the capture (so opening is two renders), only ONE element may
 * carry it per capture (hand-off inside the callback), and `flushSync` is
 * needed or the "after" capture sees an unchanged DOM.
 */
function usePortraitMorph(
	selected: Speaker | null,
	setSelected: (sp: Speaker | null) => void,
) {
	// Which speaker's plate carries the transition name (never the open one).
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

	// Second render of the open sequence: the name is now painted on the plate,
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
		// Drop the name once the tween is done so the plate is not left carrying it
		// into the next transition.
		transition?.finished.finally(() => setMorphId(null));
	}, [selected, setSelected]);

	return { morphId, open, close };
}

/** Trailing rows for the slots still to be announced, so the sheet never
 * reads as final. Not interactive: there is no record to open yet. */
const UNANNOUNCED_SLOTS = 2;

const pad = (n: number) => String(n).padStart(2, '0');

function CastingRow({
	speaker,
	index,
	active,
	onActivate,
	onOpen,
}: {
	speaker: Speaker;
	index: number;
	active: boolean;
	onActivate: (speaker: Speaker) => void;
	onOpen: (speaker: Speaker) => void;
}) {
	return (
		<li>
			<button
				type="button"
				className={s.row}
				data-active={active || undefined}
				onClick={() => onOpen(speaker)}
				onPointerEnter={() => onActivate(speaker)}
				onFocus={() => onActivate(speaker)}
				aria-label={`View ${speaker.fullName}'s profile`}
			>
				<span className={s.index} aria-hidden="true">
					{pad(index + 1)}
				</span>
				<span className={s.name}>{speaker.fullName}</span>
				{speaker.tagLine && <span className={s.tag}>{speaker.tagLine}</span>}
			</button>
		</li>
	);
}

/** The lineup as a casting sheet: every name in a numbered list on the left,
 * the active one's portrait pinned on the right. Rendered by `Speakers`. */
export function SpeakerLineup({
	speakers,
	onOpen,
	openId = null,
}: {
	speakers: Speaker[];
	onOpen: (speaker: Speaker) => void;
	/** Id of the speaker whose dialog is open — the plate carries the morph. */
	openId?: string | null;
}) {
	const [activeId, setActiveId] = useState<string | null>(null);
	// True while a row is hovered or focused: the plate develops to colour then,
	// and is B&W at rest (the default first speaker included).
	const [engaged, setEngaged] = useState(false);
	const active = speakers.find((sp) => sp.id === activeId) ?? speakers[0];
	const activate = useCallback((sp: Speaker) => {
		setActiveId(sp.id);
		setEngaged(true);
	}, []);
	// Focus leaving the list entirely (not moving to the next row) ends it.
	const onListBlur = (event: React.FocusEvent<HTMLOListElement>) => {
		if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setEngaged(false);
	};

	return (
		<div className={s.sheet}>
			<ol
				className={s.list}
				role="list"
				onPointerLeave={() => setEngaged(false)}
				onBlur={onListBlur}
			>
				{speakers.map((speaker, i) => (
					<CastingRow
						key={speaker.id}
						speaker={speaker}
						index={i}
						active={speaker.id === active.id}
						onActivate={activate}
						onOpen={onOpen}
					/>
				))}
				{Array.from({ length: UNANNOUNCED_SLOTS }, (_, i) => (
					<li key={`slot-${i}`} className={s.slot}>
						<span className={s.index} aria-hidden="true">
							{pad(speakers.length + i + 1)}
						</span>
						<span className={s.name}>Unidentified suspect</span>
						<span className={s.tag}>To be revealed</span>
					</li>
				))}
			</ol>

			{/* Mirrors the active row, so it is hidden from assistive tech; the
			    row's own button is the way in. Swaps instantly, no tween; only
			    the develop to colour (Print.module.scss) fades. */}
			<div className={s.portrait} aria-hidden="true">
				<span
					className={print.print}
					data-developed={engaged || undefined}
					style={
						active.id === openId
							? ({ viewTransitionName: PORTRAIT_TRANSITION } as React.CSSProperties)
							: undefined
					}
				>
					{/* Keyed, so a failed load on one speaker never sticks to the next. */}
					<SpeakerPhoto
						key={active.id}
						speaker={active}
						photoClass={print.photo}
						monogramClass={print.monogram}
						width={420}
						height={525}
						eager
					/>
					<span className={print.scrim} />
				</span>
				<span className={s.portraitName}>{active.fullName}</span>
				<span className={s.hint}>Pick a name for the full record</span>
			</div>
		</div>
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
