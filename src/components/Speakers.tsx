import { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { initials, PORTRAIT_TRANSITION, type Speaker } from '../lib/speakers';
import { fetchLineup } from '../lib/lineup';
import SpeakerDetail from './SpeakerDetail';
import s from './Speakers.module.scss';

type Status = 'loading' | 'ready' | 'empty' | 'error';

interface State {
	status: Status;
	speakers: Speaker[];
}

const INITIAL: State = { status: 'loading', speakers: [] };

/**
 * Shared `view-transition-name` for the print the visitor clicked and the photo
 * that appears in the dialog, so the browser morphs one into the other instead
 * of cross-fading two unrelated boxes. It has to be unique *and* live on
 * exactly one element at a time, so it is applied to the open speaker's card
 * only — two elements carrying the same name at capture time makes the browser
 * skip the transition entirely.
 */
type ViewTransitionDoc = Document & {
	startViewTransition?: (cb: () => void) => { finished: Promise<void> };
};

function canMorph(): boolean {
	if (typeof document === 'undefined') return false;
	if (typeof (document as ViewTransitionDoc).startViewTransition !== 'function') return false;
	return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Morphs the clicked print into the dialog's photo and back.
 *
 * The API captures the DOM *before* the callback and again after, then tweens
 * elements that share a `view-transition-name` across the two. That imposes two
 * awkward constraints, and both are why this is a hook rather than a one-liner:
 *
 *  1. The name must already be on the card when the capture happens — so
 *     opening is two renders: paint the name on, then start the transition in
 *     an effect. Setting it in the same update that opens the dialog means the
 *     "before" snapshot has no such element and nothing morphs.
 *  2. A name may exist on only ONE element per capture. If the card and the
 *     dialog photo both carry it, the browser skips the transition outright —
 *     hence handing it off inside the callback rather than adding it in.
 *
 * React batches state updates, so the callback wraps its work in `flushSync`:
 * without it the callback returns before the DOM has changed and the browser
 * captures an unchanged "after".
 */
function usePortraitMorph(
	selected: Speaker | null,
	setSelected: (sp: Speaker | null) => void,
) {
	// Which card currently carries the transition name (never the open one).
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

	// Second render of the open sequence: the name is now painted on the card,
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
		// Drop the name once the tween is done so no card is left carrying it
		// into the next transition.
		transition?.finished.finally(() => setMorphId(null));
	}, [selected, setSelected]);

	return { morphId, open, close };
}

function SpeakerCard({
	speaker,
	onOpen,
	priority,
	index,
	morphing,
}: {
	speaker: Speaker;
	onOpen: (speaker: Speaker) => void;
	priority: boolean;
	index: number;
	morphing: boolean;
}) {
	// A present-but-broken CDN URL (404 / timeout) falls back to the monogram,
	// same as a speaker with no photo at all.
	const [imageFailed, setImageFailed] = useState(false);
	const showPhoto = Boolean(speaker.profilePicture) && !imageFailed;

	return (
		// `--i` staggers the develop animation; see the `.develop` rules in
		// BaseLayout.scss.
		<li className={s.cell} style={{ '--i': index } as React.CSSProperties}>
			<button
				type="button"
				className={`${s.card} develop`}
				onClick={() => onOpen(speaker)}
				aria-label={`View ${speaker.fullName}'s profile`}
				style={
					morphing ? ({ viewTransitionName: PORTRAIT_TRANSITION } as React.CSSProperties) : undefined
				}
			>
				<span className={s.media}>
					{showPhoto ? (
						<img
							className={s.photo}
							src={speaker.profilePicture}
							alt=""
							loading={priority ? 'eager' : 'lazy'}
							fetchPriority={priority ? 'high' : 'auto'}
							decoding="async"
							width={400}
							height={500}
							onError={() => setImageFailed(true)}
						/>
					) : (
						<span className={s.monogram} aria-hidden="true">
							{initials(speaker.fullName) || '?'}
						</span>
					)}
					<span className={s.scrim} aria-hidden="true" />
					<span className={s.vignette} aria-hidden="true" />
				</span>
				<span className={s.body}>
					<span className={s.name}>{speaker.fullName}</span>
					{speaker.tagLine && <span className={s.tagline}>{speaker.tagLine}</span>}
				</span>
			</button>
		</li>
	);
}

/**
 * The sheet itself, separated from the Firestore wiring so it can be rendered
 * from fixtures.
 */
export function SpeakerLineup({
	speakers,
	onOpen,
	openId = null,
}: {
	speakers: Speaker[];
	onOpen: (speaker: Speaker) => void;
	/** Id of the speaker whose dialog is open — that card carries the morph. */
	openId?: string | null;
}) {
	return (
		<ul className={s.grid} role="list">
			{speakers.map((speaker, i) => (
				<SpeakerCard
					key={speaker.id}
					speaker={speaker}
					onOpen={onOpen}
					priority={i < 4}
					index={i}
					morphing={speaker.id === openId}
				/>
			))}
			{/* Closes the sheet on an unexposed frame so the lineup never reads as
			    final. */}
			<li className={s.cell} style={{ '--i': speakers.length } as React.CSSProperties}>
				<div className={`${s.moreCard} develop`}>
					<span className={s.moreFrame} aria-hidden="true" />
					<span className={s.moreBody}>
						<span className={s.moreKicker}>Still developing</span>
						<p className={s.moreText}>More names to come</p>
					</span>
				</div>
			</li>
		</ul>
	);
}

export default function Speakers() {
	const [state, setState] = useState<State>(INITIAL);
	const [selected, setSelected] = useState<Speaker | null>(null);
	const { morphId, open, close } = usePortraitMorph(selected, setSelected);

	useEffect(() => {
		const ac = new AbortController();
		fetchLineup(ac.signal)
			.then(({ speakers }) => {
				setState({ status: speakers.length > 0 ? 'ready' : 'empty', speakers });
			})
			.catch((err) => {
				if (ac.signal.aborted) return;
				console.warn('[speakers] Failed to load lineup:', err);
				setState((prev) => ({ ...prev, status: 'error' }));
			});
		return () => ac.abort();
	}, []);

	if (state.status === 'error') {
		return (
			<div className={s.status} role="alert">
				<p>The lineup won't come up right now. Reload, or take it up with devfest@gug.cz.</p>
			</div>
		);
	}

	if (state.status === 'loading') {
		return (
			<p className={s.loadingStatus} role="status">
				<span className={s.loadingDot} aria-hidden="true" />
				Developing the lineup
			</p>
		);
	}

	if (state.status === 'empty') {
		return (
			<div className={s.status}>
				<p>Lineup announced soon.</p>
			</div>
		);
	}

	return (
		<>
			<SpeakerLineup speakers={state.speakers} onOpen={open} openId={morphId} />
			{selected && <SpeakerDetail speaker={selected} onClose={close} />}
		</>
	);
}
