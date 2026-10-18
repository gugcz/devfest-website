import { useMemo } from 'react';
import { fetchLineup } from '../lib/lineup';
import { speakerTarget } from '../lib/share';
import { useRemote } from '../lib/useRemote';
import SpeakerTile, { billLineup } from './SpeakerTile';
import tile from './SpeakerTile.module.scss';
import s from './SpeakersTeaser.module.scss';

// Prints on the home table: the opening keynote large, then the next talks
// of the day, then the way to the rest. Three rows of four on a laptop
// (the keynote covers four cells), four rows of two on a phone.
const TEASER_SIZE = 8;

/** Home-page speakers: the first prints of the lineup /speakers shows in
 * full, in running order (`SpeakerTile`, each a link to the speaker). The
 * head with the confirmed count, then the prints, the last cell the way to
 * all of them. Renders nothing until the lineup resolves (clean
 * pre-announce). */
export default function SpeakersTeaser() {
	const { status, data } = useRemote(fetchLineup, 'speakers-teaser', (l) => l.speakers.length === 0);
	const billings = useMemo(() => (data ? billLineup(data) : []), [data]);
	const total = billings.length;

	if (status !== 'ready' || total === 0) return null;

	return (
		<section className={s.teaser} aria-labelledby="lineup-teaser-title">
			<div className={s.inner}>
				<header className="head-rule">
					<h2 id="lineup-teaser-title" className="head-rule-title">
						Speakers
					</h2>
					<p className="head-rule-note">
						<span className={s.figure}>{total}</span> confirmed. Times in CET.
					</p>
				</header>

				<ul className={`${tile.grid} ${s.table}`} role="list">
					{billings.slice(0, TEASER_SIZE).map((billing, i) => (
						<SpeakerTile
							key={billing.speaker.id}
							billing={billing}
							index={i + 1}
							total={total}
							href={speakerTarget(billing.speaker.id)}
						/>
					))}
					<li className={s.all}>
						<a className={s.allLink} href="/speakers">
							<span className={s.allCount}>{total}</span>
							<span className={s.allLabel}>All speakers</span>
						</a>
					</li>
				</ul>
			</div>
		</section>
	);
}
