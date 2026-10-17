import { useMemo } from 'react';
import { fetchLineup } from '../lib/lineup';
import { speakerTarget } from '../lib/share';
import { shuffle } from '../lib/shuffle';
import { useRemote } from '../lib/useRemote';
import SpeakerTile from './SpeakerTile';
import tile from './SpeakerTile.module.scss';
import s from './SpeakersTeaser.module.scss';

// Portraits on the home sheet: two rows of four on a laptop (the module
// trims the sheet to whole rows on narrower screens). The rest of the
// roster is one link away.
const TEASER_SIZE = 8;

/** Home-page speakers: the first lines of the casting sheet /speakers shows
 * in full. A ruled head with the confirmed count, a shuffled handful of
 * portraits (`SpeakerTile`, each a link to the speaker), and the way to the
 * full lineup. Renders nothing until the lineup resolves (clean
 * pre-announce). */
export default function SpeakersTeaser() {
	const { status, data } = useRemote(fetchLineup, 'speakers-teaser', (l) => l.speakers.length === 0);

	// Shuffle once per payload so the faces billed are random on every load,
	// not on every re-render.
	const roster = useMemo(() => shuffle(data?.speakers ?? []), [data]);
	const total = roster.length;

	if (status !== 'ready' || total === 0) return null;

	return (
		<section className={s.teaser} aria-labelledby="lineup-teaser-title">
			<div className={s.inner}>
				<header className="head-rule">
					<h2 id="lineup-teaser-title" className="head-rule-title">
						Speakers
					</h2>
					<p className="head-rule-note">{total} confirmed</p>
				</header>

				<ul className={`${tile.grid} ${s.sheet}`} role="list">
					{roster.slice(0, TEASER_SIZE).map((speaker, i) => (
						<SpeakerTile key={speaker.id} speaker={speaker} index={i + 1} href={speakerTarget(speaker.id)} />
					))}
				</ul>

				<a className="action" href="/speakers">
					All {total} speakers
				</a>
			</div>
		</section>
	);
}
