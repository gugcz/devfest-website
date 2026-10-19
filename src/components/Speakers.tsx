import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import type { Speaker } from '../lib/speakers';
import { fetchLineup } from '../lib/lineup';
import { useRemote } from '../lib/useRemote';
import { REDUCED_MOTION } from '../lib/useMediaQuery';
import { SPEAKER_PARAM } from '../lib/share';
import SpeakerDetail from './SpeakerDetail';
import SpeakerTile, { billLineup, type Billing } from './SpeakerTile';
import { EmptyState, ErrorState, LoadingState } from './DataState';
import tile from './SpeakerTile.module.scss';

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

/** Every speaker as a print on one grid, in running order (`SpeakerTile`),
 * every print the same size, then the hosts in their own row of
 * the same prints. Pressing a print opens the sheet; its photo morphs into the
 * sheet's. The way on (agenda, tickets) is the page's `EndLine`, under the
 * island. Rendered by `Speakers`. */
export function SpeakerLineup({
	billings,
	onOpen,
	morphId = null,
}: {
	billings: Billing[];
	onOpen: (speaker: Speaker) => void;
	/** Id of the speaker whose photo carries the morph into the sheet. */
	morphId?: string | null;
}) {
	const total = billings.length;
	const tileFor = (billing: Billing, i: number) => (
		<SpeakerTile
			key={billing.speaker.id}
			billing={billing}
			index={i + 1}
			total={total}
			onOpen={onOpen}
			morphing={billing.speaker.id === morphId}
			eager={i < 4}
		/>
	);
	// Hosts sort last (`billLineup`), so the running number stays continuous.
	const hostsFrom = billings.findIndex((billing) => billing.host);
	const talks = hostsFrom < 0 ? billings : billings.slice(0, hostsFrom);
	const hosts = hostsFrom < 0 ? [] : billings.slice(hostsFrom);

	return (
		<>
			<ul className={`${tile.grid} ${tile.sheet}`} role="list">
				{talks.map((billing, i) => tileFor(billing, i))}
			</ul>
			{hosts.length > 0 && (
				<>
					<h3 id="lineup-hosts" className={tile.hostsLabel}>
						Hosts
					</h3>
					<ul className={`${tile.grid} ${tile.sheet}`} role="list" aria-labelledby="lineup-hosts">
						{hosts.map((billing, i) => tileFor(billing, talks.length + i))}
					</ul>
				</>
			)}
		</>
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
	const billings = useMemo(() => (data ? billLineup(data) : []), [data]);
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
			<SpeakerLineup billings={billings} onOpen={open} morphId={morphId} />
			{selected && (
				<SpeakerDetail
					speaker={selected}
					slot={billings.find((billing) => billing.speaker.id === selected.id)}
					onClose={close}
				/>
			)}
		</>
	);
}
