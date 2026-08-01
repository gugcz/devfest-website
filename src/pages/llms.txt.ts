/**
 * `/llms.txt` — a plain-text map of the site for language models.
 *
 * The emerging convention (llmstxt.org): one markdown file at the root that
 * states what the site is and lists its pages, so an assistant answering
 * "what is DevFest.cz" reads a curated summary instead of guessing from
 * whichever page it happened to crawl. robots.txt already lets those crawlers
 * in; this gives them something worth reading.
 *
 * Generated rather than committed, so the lineup section can never drift from
 * the pages the build actually emitted. Rebuilt daily with everything else.
 */
import type { APIRoute } from 'astro';
import { getBuildLineup } from '../lib/lineup-build';
import { sessionSlugs, speakerSlugs } from '../lib/slug';

const SITE = 'https://devfest.cz';

export const GET: APIRoute = async () => {
	const { speakers, sessions } = await getBuildLineup();
	const speakerUrls = speakerSlugs(speakers);
	const sessionUrls = sessionSlugs(sessions);

	/** One-line summary, collapsed and trimmed so the file stays scannable. */
	const brief = (text: string, max = 160) => {
		const flat = text.replace(/\s+/g, ' ').trim();
		return flat.length > max ? `${flat.slice(0, max - 1).trimEnd()}…` : flat;
	};

	const lines: string[] = [
		'# DevFest.cz 2026',
		'',
		"> DevFest.cz 2026 is Prague's community-built developer conference and festival,",
		'> organised by GUG.cz, z.s. One day, 30 October 2026, at Uhelný Mlýn in Libčice',
		'> nad Vltavou just outside Prague. Topics: AI & machine learning, Android &',
		'> Kotlin, web, cloud & DevOps, Flutter & Dart, security, and open source.',
		'',
		'- Date: 30 October 2026, doors 09:00 CET',
		'- Venue: Uhelný Mlýn, Areál Šroubáren 860, 252 66 Libčice nad Vltavou, Czechia',
		'- Language: English',
		'- Organiser: GUG.cz, z.s. (devfest@gug.cz)',
		'',
		'## Main pages',
		'',
		`- [Home](${SITE}): overview, ticket waves, countdown, newsletter sign-up.`,
		`- [Speakers](${SITE}/speakers): the confirmed lineup.`,
		`- [Sessions](${SITE}/sessions): every confirmed talk, searchable by track.`,
		`- [Agenda](${SITE}/agenda): the timetable — talk, room and time slot.`,
		`- [Partners](${SITE}/partners): sponsors and community partners.`,
		`- [Team](${SITE}/team): the organising crew.`,
		`- [FAQ](${SITE}/faq): tickets, venue, travel, and what to expect.`,
		`- [Contact](${SITE}/contact): general, partnership and speaker enquiries.`,
		`- [Press](${SITE}/press): media enquiries, coverage and press kit.`,
		`- [Company invoice](${SITE}/invoice): buy tickets on invoice, pay by bank transfer.`,
	];

	if (speakers.length > 0) {
		lines.push('', '## Speakers', '');
		for (const speaker of speakers) {
			const detail = speaker.tagLine ? `: ${brief(speaker.tagLine)}` : '';
			lines.push(`- [${speaker.fullName}](${SITE}/speakers/${speakerUrls.get(speaker.id)})${detail}`);
		}
	}

	if (sessions.length > 0) {
		lines.push('', '## Sessions', '');
		for (const session of sessions) {
			const names = session.speakers.map((sp) => sp.fullName).filter(Boolean).join(', ');
			const detail = [names, session.description ? brief(session.description) : '']
				.filter(Boolean)
				.join(' — ');
			lines.push(
				`- [${session.title}](${SITE}/sessions/${sessionUrls.get(session.id)})${detail ? `: ${detail}` : ''}`,
			);
		}
	}

	lines.push(
		'',
		'## Notes',
		'',
		'- The lineup grows as speakers are confirmed; this file is regenerated daily.',
		'- Previous edition: https://2025.devfest.cz (archive — not the current event).',
		'',
	);

	return new Response(lines.join('\n'), {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
		},
	});
};
