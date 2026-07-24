import { useState } from 'react';
import { initials, type Speaker } from '../lib/speakers';
import SpeakerDetail from './SpeakerDetail';
import s from './Speakers.module.scss';

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

export default function Speakers({ speakers, failed }: { speakers: Speaker[]; failed: boolean }) {
	const [selected, setSelected] = useState<Speaker | null>(null);

	// Data arrives server-rendered as props — no loading state. `failed` reflects
	// a server-side read error (the on-demand route also returns 503 for it).
	if (failed) {
		return (
			<div className={s.status} role="alert">
				<p>The lineup is temporarily unavailable. Please check back soon.</p>
			</div>
		);
	}

	if (speakers.length === 0) {
		return (
			<div className={s.status}>
				<p>Lineup announced soon.</p>
			</div>
		);
	}

	return (
		<>
			<ul className={s.grid} role="list">
				{speakers.map((speaker, i) => (
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
