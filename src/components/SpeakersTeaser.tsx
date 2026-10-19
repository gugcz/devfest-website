import { useMemo } from 'react';
import { fetchLineup } from '../lib/lineup';
import { speakerTarget } from '../lib/share';
import { useRemote } from '../lib/useRemote';
import SpeakerTile, { billLineup, type Billing } from './SpeakerTile';
import tile from './SpeakerTile.module.scss';
import s from './SpeakersTeaser.module.scss';

// Prints on the home table in whole rows: two rows of four on a laptop and a
// tablet, three rows of two on a phone (the stylesheet drops the rest).
const TEASER_SIZE = 8;

/** A different handful on every visit, kept in running order so the sheet
 * numbers and the clocks read down the day. Each pick keeps its place in the
 * full lineup for its number. */
function pickTeaser(billings: Billing[]): { billing: Billing; index: number }[] {
	const indexed = billings.map((billing, i) => ({ billing, index: i + 1 }));
	for (let i = indexed.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[indexed[i], indexed[j]] = [indexed[j], indexed[i]];
	}
	return indexed.slice(0, TEASER_SIZE).sort((a, b) => a.index - b.index);
}

/** Home-page speakers: a random handful of the lineup /speakers shows in
 * full, in running order (`SpeakerTile`, each a link to the speaker). The
 * head with the confirmed count, the prints, then one text action across the
 * page to all of them. Renders nothing until the lineup resolves (clean
 * pre-announce). */
export default function SpeakersTeaser() {
	const { status, data } = useRemote(fetchLineup, 'speakers-teaser', (l) => l.speakers.length === 0);
	const billings = useMemo(() => (data ? billLineup(data) : []), [data]);
	const total = billings.length;
	const picks = useMemo(() => pickTeaser(billings), [billings]);

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
					{picks.map(({ billing, index }) => (
						<SpeakerTile
							key={billing.speaker.id}
							billing={billing}
							index={index}
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
