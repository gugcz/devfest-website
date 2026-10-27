/**
 * `/llms.txt` (https://llmstxt.org): the site as Markdown for a language
 * model — the facts, the tickets, every page, talk and speaker with its link.
 * Built once per `astro build` from the same build-time reads as the pages
 * (`lineup-static.ts`, `tickets-static.ts`, `workshops-static.ts`), so it is
 * as fresh as the last Hosting deploy and says so.
 */
import type { APIRoute } from 'astro';
import { EVENT } from '../lib/event';
import { TOPICS } from '../lib/topics';
import { byStart, roomName, timeRange } from '../lib/agenda';
import { speakerNames, type Room, type Session } from '../lib/sessions';
import { staticLineup } from '../lib/lineup-static';
import { staticTicketLines } from '../lib/tickets-static';
import { staticWorkshops } from '../lib/workshops-static';
import { speakerSharePath, talkSharePath } from '../lib/share';
import { BUILD_DAY } from '../lib/static-api';

const site = EVENT.url;

const PAGES: Array<[string, string, string]> = [
	['Tickets', '/#tickets', 'ticket waves and prices, bought on ti.to'],
	['Agenda', '/agenda', 'the timetable by room and time, and every talk with its abstract'],
	['Speakers', '/speakers', 'everyone on stage, with bios'],
	['Workshops', '/workshops', 'workshop sign-up for ticket holders, limited seats'],
	['Venue', '/venue', 'how to get to Uhelný Mlýn from Prague'],
	['FAQ', '/faq', 'the essentials, tickets, agenda and speakers, getting involved'],
	['Company invoice', '/invoice', 'pay for tickets by bank transfer'],
	['Code of Conduct', '/code-of-conduct', ''],
	['Partners', '/partners', 'the partners and how to become one'],
	['Team', '/team', 'the volunteers who organise it'],
	['Contact', '/contact', 'organisers, partnerships and press'],
	['Press kit', '/press/downloads', 'logos and photos'],
];

const link = (label: string, path: string) => `[${label}](${site}${path})`;
const clean = (text: string) => text.replace(/\s+/g, ' ').trim();

function talkLine(session: Session, rooms: Room[]): string {
	const time = timeRange(session);
	const details = [time && `${time} CET`, roomName(session, rooms), speakerNames(session)].filter(Boolean).join(', ');
	return `- ${link(clean(session.title), talkSharePath(session.id))}${details ? `: ${details}` : ''}`;
}

export const GET: APIRoute = async () => {
	const { speakers, sessions, rooms } = await staticLineup();
	const [tickets, workshops] = await Promise.all([staticTicketLines(), staticWorkshops(sessions)]);
	const talks = [...sessions].sort(byStart);

	const lines = [
		`# ${EVENT.name}`,
		'',
		`> Prague's community developer conference: one day of talks and workshops in English on ${EVENT.dateLabel} at ${EVENT.venue}, a converted coal mill in Libčice nad Vltavou, 25 minutes north of Prague. Organised by GUG.cz, z.s. since 2012.`,
		'',
		`- Date: ${EVENT.dateLabel}. Doors and registration ${EVENT.doorsTime}, keynote ${EVENT.startTime}, closing remarks ${EVENT.endTime}, afterparty until ${EVENT.afterpartyEndTime} (CET).`,
		`- Venue: ${EVENT.venue}, ${EVENT.street}. Map: ${EVENT.mapUrl}`,
		'- Audience: 350 medior and senior developers from across Central and Eastern Europe. In person only.',
		`- Topics: ${TOPICS.map((t) => t.name).join(', ')}.`,
		'- Contact: devfest@gug.cz',
		`- Calendar: ${site}${EVENT.icsUrl}`,
		'',
		`Lists below are as of ${BUILD_DAY}; the linked pages are live.`,
		'',
		'## Tickets',
		'',
		...(tickets.length > 0
			? [
					...tickets.map(
						(t) =>
							`- ${t.label}: ${t.price}, VAT included. ${t.status}${t.purchasable ? `. [Buy on ti.to](${t.url})` : ''}`,
					),
					`- Paying by bank transfer: ${link('request a company invoice', '/invoice')}.`,
				]
			: [`- Live on the ${link('home page', '/#tickets')}.`]),
		'',
		'## Pages',
		'',
		...PAGES.map(([label, path, note]) => `- ${link(label, path)}${note ? `: ${note}` : ''}`),
		'',
		...(talks.length > 0 ? ['## Talks', '', ...talks.map((s) => talkLine(s, rooms)), ''] : []),
		...(workshops.length > 0
			? ['## Workshops', '', ...workshops.map((s) => talkLine(s, rooms)), '']
			: []),
		...(speakers.length > 0
			? [
					'## Speakers',
					'',
					...speakers.map(
						(sp) => `- ${link(clean(sp.fullName), speakerSharePath(sp.id))}${sp.tagLine ? `: ${clean(sp.tagLine)}` : ''}`,
					),
					'',
				]
			: []),
	];

	return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
