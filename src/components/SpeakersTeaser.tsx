import { useMemo } from 'react';
import { cleanTagline } from '../lib/speakers';
import { fetchLineup } from '../lib/lineup';
import { speakerTarget } from '../lib/share';
import { shuffle } from '../lib/shuffle';
import { useRemote } from '../lib/useRemote';
import SpeakerPhoto from './SpeakerPhoto';
import print from './Print.module.scss';
import s from './SpeakersTeaser.module.scss';

// Names on the home register; the rest of the roster is one link away.
const TEASER_SIZE = 5;

/** Home-page speaker teaser: the register's first lines. A ruled head, one
 * ruled row per speaker (index, portrait, Bebas name, role) and the way to
 * the full register. The portrait is in the row, on every screen size: a
 * face that only appears on hover is no face on a phone. Renders nothing
 * until the lineup resolves (clean pre-announce). */
export default function SpeakersTeaser() {
	const { status, data } = useRemote(fetchLineup, 'speakers-teaser', (l) => l.speakers.length === 0);

	// Shuffle once per payload so the names billed are random on every load,
	// not on every re-render.
	const roster = useMemo(() => shuffle(data?.speakers ?? []), [data]);
	const total = roster.length;

	if (status !== 'ready' || total === 0) return null;

	const lines = roster.slice(0, TEASER_SIZE);

	return (
		<section className={s.teaser} aria-labelledby="lineup-teaser-title">
			<div className={s.inner}>
				<header className="head-rule">
					<h2 id="lineup-teaser-title" className="head-rule-title">
						Speakers
					</h2>
					<p className="head-rule-note">{total} confirmed</p>
				</header>

				<ul className={s.list} role="list">
					{lines.map((speaker, i) => {
						const tag = cleanTagline(speaker.tagLine);
						return (
							<li key={speaker.id}>
								<a className={`field-row ${s.row}`} href={speakerTarget(speaker.id)}>
									<span className={s.index} aria-hidden="true">
										{String(i + 1).padStart(2, '0')}
									</span>
									{/* The shared print at row size; the name beside it is the label. */}
									<span className={`${print.print} ${s.thumb}`} aria-hidden="true">
										<SpeakerPhoto
											speaker={speaker}
											photoClass={print.photo}
											monogramClass={print.monogram}
											width={96}
											height={120}
										/>
										<span className={print.scrim} />
									</span>
									<span className={s.name}>{speaker.fullName}</span>
									{tag && <span className={s.tag}>{tag}</span>}
								</a>
							</li>
						);
					})}
				</ul>

				<a className="action" href="/speakers">
					All {total} speakers
				</a>
			</div>
		</section>
	);
}
