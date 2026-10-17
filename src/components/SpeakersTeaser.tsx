import { useMemo, useState } from 'react';
import type { Speaker } from '../lib/speakers';
import { fetchLineup } from '../lib/lineup';
import { speakerTarget } from '../lib/share';
import { shuffle } from '../lib/shuffle';
import { useRemote } from '../lib/useRemote';
import SpeakerPhoto from './SpeakerPhoto';
import print from './Print.module.scss';
import s from './SpeakersTeaser.module.scss';

// Names on the home credits; the rest of the roster is one link away.
const CREDITS_SIZE = 6;

/** The portrait beside the names: the active row's speaker on the shared
 * print, bleeding off the right edge. Decorative for screen readers, the
 * row's name is the label; the role is on /speakers. Keyed by speaker so a
 * failed photo falls back per speaker, not once for the plate. Develops to
 * colour while a row is hovered or focused. */
function Portrait({ speaker, engaged }: { speaker: Speaker; engaged: boolean }) {
	return (
		<div className={s.portrait} aria-hidden="true">
			<span className={`${print.print} ${s.plate}`} data-developed={engaged || undefined}>
				<SpeakerPhoto
					key={speaker.id}
					speaker={speaker}
					photoClass={print.photo}
					monogramClass={print.monogram}
					width={420}
					height={525}
				/>
				<span className={print.scrim} />
			</span>
		</div>
	);
}

/** Home-page speaker teaser, set as a billing block: a shuffled handful of
 * names at poster size, the active one lit with its portrait beside it, and
 * the way to the full lineup. Renders nothing until the lineup resolves
 * (clean pre-announce). */
export default function SpeakersTeaser() {
	const { status, data } = useRemote(fetchLineup, 'speakers-teaser', (l) => l.speakers.length === 0);
	const [active, setActive] = useState(0);
	const [engaged, setEngaged] = useState(false);

	// Shuffle once per payload so the names billed are random on every load,
	// not on every re-render.
	const roster = useMemo(() => shuffle(data?.speakers ?? []), [data]);
	const total = roster.length;

	if (status !== 'ready' || total === 0) return null;

	const credits = roster.slice(0, CREDITS_SIZE);
	// The roster can shrink between syncs; never point past the list.
	const lit = credits[active] ?? credits[0];

	return (
		<section className={s.teaser} aria-labelledby="lineup-teaser-title">
			<div className={s.inner}>
				<div className={s.head}>
					<h2 id="lineup-teaser-title" className="eyebrow-index">
						<span className="eyebrow-no" aria-hidden="true">03</span>Speakers
					</h2>
					<p className={s.count}>{total} confirmed</p>
				</div>

				<div className={s.body}>
					<div className={s.listCol}>
						<ul
							className={s.credits}
							role="list"
							onMouseLeave={() => setEngaged(false)}
							onBlur={(e) => {
								if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setEngaged(false);
							}}
						>
							{credits.map((speaker, i) => {
								return (
									<li key={speaker.id}>
										<a
											className={`${s.row}${speaker === lit ? ` ${s.isActive}` : ''}`}
											href={speakerTarget(speaker.id)}
											onMouseEnter={() => {
												setActive(i);
												setEngaged(true);
											}}
											onFocus={() => {
												setActive(i);
												setEngaged(true);
											}}
										>
											<span className={s.name}>{speaker.fullName}</span>
										</a>
									</li>
								);
							})}
						</ul>

						<a className={s.allLink} href="/speakers">
							See all {total} speakers
						</a>
					</div>

					<Portrait speaker={lit} engaged={engaged} />
				</div>
			</div>
		</section>
	);
}
