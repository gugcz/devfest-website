import { useMemo, useState } from 'react';
import type { Speaker } from '../lib/speakers';
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

/** The portrait beside the rows: the reached row's speaker on the shared
 * print (`Print.module.scss`), as on /speakers. Decorative for screen
 * readers, the row's name is the label. Keyed by speaker so a failed photo
 * falls back per speaker. Develops to colour while a row is hovered or
 * focused. */
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

/** Home-page speaker teaser: the register's first lines. A ruled head, one
 * ruled row per name (index, Bebas name, role), the reached row's portrait
 * beside the list, and the way to the full register. Renders nothing until
 * the lineup resolves (clean pre-announce). */
export default function SpeakersTeaser() {
	const { status, data } = useRemote(fetchLineup, 'speakers-teaser', (l) => l.speakers.length === 0);
	const [active, setActive] = useState(0);
	const [engaged, setEngaged] = useState(false);

	// Shuffle once per payload so the names billed are random on every load,
	// not on every re-render.
	const roster = useMemo(() => shuffle(data?.speakers ?? []), [data]);
	const total = roster.length;

	if (status !== 'ready' || total === 0) return null;

	const lines = roster.slice(0, TEASER_SIZE);
	// The roster can shrink between syncs; never point past the list.
	const lit = lines[active] ?? lines[0];

	return (
		<section className={s.teaser} aria-labelledby="lineup-teaser-title">
			<div className={s.inner}>
				<header className="head-rule">
					<h2 id="lineup-teaser-title" className="head-rule-title">
						Speakers
					</h2>
					<p className="head-rule-note">{total} confirmed</p>
				</header>

				<div className={s.body}>
					<div className={s.listCol}>
						<ul
							className={s.list}
							role="list"
							onMouseLeave={() => setEngaged(false)}
							onBlur={(e) => {
								if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setEngaged(false);
							}}
						>
							{lines.map((speaker, i) => {
								const tag = cleanTagline(speaker.tagLine);
								const reach = () => {
									setActive(i);
									setEngaged(true);
								};
								return (
									<li key={speaker.id}>
										<a
											className={`field-row ${s.row}${speaker === lit ? ` ${s.isActive}` : ''}`}
											href={speakerTarget(speaker.id)}
											onMouseEnter={reach}
											onFocus={reach}
										>
											<span className={s.index} aria-hidden="true">
												{String(i + 1).padStart(2, '0')}
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

					<Portrait speaker={lit} engaged={engaged} />
				</div>
			</div>
		</section>
	);
}
