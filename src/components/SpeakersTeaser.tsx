import { useMemo } from 'react';
import { fetchLineup } from '../lib/lineup';
import { speakerTarget } from '../lib/share';
import { useRemote } from '../lib/useRemote';
import SpeakerTile, { billLineup } from './SpeakerTile';
import tile from './SpeakerTile.module.scss';
import s from './SpeakersTeaser.module.scss';

// Prints on the home table in whole rows: the opening keynote large, then the
// next talks of the day. Nine on a laptop and a tablet (three rows of four,
// the keynote covering four cells); seven on a phone (the keynote across,
// then three rows of two; the stylesheet drops the rest).
const TEASER_SIZE = 9;

/** Home-page speakers: the first prints of the lineup /speakers shows in
 * full, in running order (`SpeakerTile`, each a link to the speaker). The
 * head with the confirmed count, the prints, then one text action across the
 * page to all of them. Renders nothing until the lineup resolves (clean
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
				</ul>
				<p className={s.all}>
					<a className="action" href="/speakers">
						All {total} speakers
					</a>
				</p>
			</div>
		</section>
	);
}
