import { useEffect, useState } from 'react';
import { initials, type Speaker } from '../lib/speakers';
import { fetchLineup } from '../lib/lineup';
import SpeakerDetail from './SpeakerDetail';
import s from './Speakers.module.scss';

type Status = 'loading' | 'ready' | 'empty' | 'error';

interface State {
	status: Status;
	speakers: Speaker[];
}

const INITIAL: State = { status: 'loading', speakers: [] };

function SpeakerCard({
	speaker,
	onOpen,
	priority,
}: {
	speaker: Speaker;
	onOpen: (speaker: Speaker) => void;
	priority: boolean;
}) {
	// A present-but-broken CDN URL (404 / timeout) falls back to the monogram,
	// same as a speaker with no photo at all.
	const [imageFailed, setImageFailed] = useState(false);
	const showPhoto = Boolean(speaker.profilePicture) && !imageFailed;

	return (
		<li>
			<button
				type="button"
				className={s.card}
				onClick={() => onOpen(speaker)}
				aria-label={`View ${speaker.fullName}'s profile`}
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
					<span className={s.grain} aria-hidden="true" />
				</span>
				<span className={s.body}>
					<span className={s.name}>{speaker.fullName}</span>
					{/* Always rendered (even when empty) so every card reserves the same
					    two-line slot and card heights stay uniform across the grid. */}
					<span className={s.tagline}>{speaker.tagLine}</span>
					<span className={s.more}>
						View profile
						<span className={s.moreArrow} aria-hidden="true">→</span>
					</span>
				</span>
			</button>
		</li>
	);
}

export default function Speakers() {
	const [state, setState] = useState<State>(INITIAL);
	const [selected, setSelected] = useState<Speaker | null>(null);

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
				Loading lineup
				<span className={s.loadingDots} aria-hidden="true">
					<span />
					<span />
					<span />
				</span>
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
			<ul className={s.grid} role="list">
				{state.speakers.map((speaker, i) => (
					<SpeakerCard key={speaker.id} speaker={speaker} onOpen={setSelected} priority={i < 4} />
				))}
				<li>
					<article className={s.moreCard} aria-label="More speakers to be announced">
						<span className={s.moreDots} aria-hidden="true">
							<span />
							<span />
							<span />
						</span>
						<span className={s.moreKicker}>Case open</span>
						<p className={s.moreText}>More speakers announced soon</p>
					</article>
				</li>
			</ul>
			{selected && <SpeakerDetail speaker={selected} onClose={() => setSelected(null)} />}
		</>
	);
}
