/**
 * `/llms.txt` (https://llmstxt.org): the site as Markdown for a language
 * model — the facts, the tickets, every page, talk and speaker with its link.
 * Built once per `astro build` from the same build-time reads as the pages
 * (`lineup-static.ts`, `tickets-static.ts`, `workshops-static.ts`), so it is
 * as fresh as the last Hosting deploy and says so.
 */
import type { APIRoute } from 'astro';
import { EVENT } from '../lib/event';
import { getTopics } from '../lib/topics';
import { byStart, roomName, timeRange } from '../lib/agenda';
import { speakerNames, type Room, type Session } from '../lib/sessions';
import { staticLineup } from '../lib/lineup-static';
import { staticTicketLines } from '../lib/tickets-static';
import { staticWorkshops } from '../lib/workshops-static';
import { speakerSharePath, talkSharePath } from '../lib/share';
import { BUILD_DAY } from '../lib/static-api';
import { absoluteUrl } from '../lib/base';
import { lastEditionFigures, pastEditions } from '../lib/editions';
import config from '../site.config';
import { enabled, enabledOnly, type FeatureFlag } from '../lib/flags';

const PAGES = enabledOnly<{ label: string; path: string; note: string; feature?: FeatureFlag }>([
	{ label: 'Tickets', path: '/#tickets', note: 'ticket waves and prices, bought on ti.to', feature: 'tickets' },
	{ label: 'Agenda', path: '/agenda', note: 'the timetable by room and time, and every talk with its abstract', feature: 'edition' },
	{ label: 'Speakers', path: '/speakers', note: 'everyone on stage, with bios', feature: 'edition' },
	{ label: 'Workshops', path: '/workshops', note: 'workshop sign-up for ticket holders, limited seats', feature: 'workshops' },
	{ label: 'Venue', path: '/venue', note: `how to get to ${EVENT.venue} from Prague`, feature: 'edition' },
	{ label: 'FAQ', path: '/faq', note: 'the essentials, tickets, agenda and speakers, getting involved', feature: 'edition' },
	{ label: 'Company invoice', path: '/invoice', note: 'pay for tickets by bank transfer', feature: 'invoice' },
	{ label: 'Code of Conduct', path: '/code-of-conduct', note: '' },
	{ label: 'Partners', path: '/partners', note: 'the partners and how to become one', feature: 'partners' },
	{ label: 'Team', path: '/team', note: 'the volunteers who organise it', feature: 'edition' },
	{ label: 'Contact', path: '/contact', note: 'organisers, partnerships and press', feature: 'edition' },
	{ label: 'Press kit', path: '/press/downloads', note: 'logos and photos', feature: 'edition' },
	{ label: 'Newsletter', path: '/#newsletter', note: 'news of the next edition first', feature: 'newsletter' },
	{ label: 'App', path: '/app', note: 'the DevFest.cz app for iOS and Android', feature: 'app' },
]);

const link = (label: string, path: string) => `[${label}](${absoluteUrl(path)})`;
const clean = (text: string) => text.replace(/\s+/g, ' ').trim();

function talkLine(session: Session, rooms: Room[]): string {
	const time = timeRange(session);
	const details = [time && `${time} CET`, roomName(session, rooms), speakerNames(session)].filter(Boolean).join(', ');
	return `- ${link(clean(session.title), talkSharePath(session.id))}${details ? `: ${details}` : ''}`;
}

/**
 * While the next edition has no date (`edition` off, ADR 0011): what is
 * announced, the last edition in figures, and where every past edition lives.
 */
function teaser(): string {
	const { upcoming } = config;
	const figures = lastEditionFigures();
	const name = upcoming ? `${config.event.name} ${upcoming.edition}` : config.event.name;
	const editions = pastEditions();
	return [
		`# ${name}`,
		'',
		`> ${config.event.tagline}, organised by ${config.organizer.legalName} since 2012.${upcoming ? ` The next edition is in ${upcoming.season.toLowerCase().replace(/^fall/, 'the fall of')}; its date and venue are not announced yet.` : ''}`,
		'',
		...(figures
			? [
					`- Last edition: ${EVENT.name}, ${EVENT.dateLabel} at ${EVENT.venue}, ${config.event.venue.city}: ${config.event.audience} developers, ${figures.talks} talks, ${figures.speakers} speakers. Archive: ${absoluteUrl(`/${figures.year}`)} (its own ${link('llms.txt', `/${figures.year}/llms.txt`)}).`,
				]
			: []),
		`- Past editions: ${editions.map(({ year, href }) => `[${year}](${href.startsWith('/') ? absoluteUrl(href) : href})`).join(', ')}.`,
		`- Contact: ${config.organizer.email}`,
		'',
		'## Pages',
		'',
		...PAGES.map(({ label, path, note }) => `- ${link(label, path)}${note ? `: ${note}` : ''}`),
		'',
	].join('\n');
}

export const GET: APIRoute = async () => {
	if (!enabled('edition')) {
		return new Response(teaser(), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
	}
	const { speakers, sessions, rooms } = await staticLineup();
	const topics = await getTopics();
	const [tickets, workshops] = await Promise.all([
		enabled('tickets') ? staticTicketLines() : [],
		enabled('workshops') ? staticWorkshops(sessions) : [],
	]);
	const talks = [...sessions].sort(byStart);

	const lines = [
		`# ${EVENT.name}`,
		'',
		`> Prague's community developer conference: one day of talks and workshops in English on ${EVENT.dateLabel} at ${EVENT.venue}, a converted coal mill in ${config.event.venue.city}, 25 minutes north of Prague. Organised by ${config.organizer.legalName} since 2012.`,
		'',
		`- Date: ${EVENT.dateLabel}. Doors and registration ${EVENT.doorsTime}, keynote ${EVENT.startTime}, closing remarks ${EVENT.endTime}, afterparty until ${EVENT.afterpartyEndTime} (CET).`,
		`- Venue: ${EVENT.venue}, ${EVENT.street}. Map: ${EVENT.mapUrl}`,
		`- Audience: ${config.event.audience} medior and senior developers from across Central and Eastern Europe. In person only.`,
		`- Topics: ${topics.map((t) => t.name).join(', ')}.`,
		`- Contact: ${config.organizer.email}`,
		`- Calendar: ${absoluteUrl(EVENT.icsUrl)}`,
		'',
		`Lists below are as of ${BUILD_DAY}; the linked pages are live.`,
		'',
		...(enabled('tickets')
			? [
					'## Tickets',
					'',
					...(tickets.length > 0
						? [
								...tickets.map(
									(t) =>
										`- ${t.label}: ${t.price}, VAT included. ${t.status}${t.purchasable ? `. [Buy on ti.to](${t.url})` : ''}`,
								),
								...(enabled('invoice')
									? [`- Paying by bank transfer: ${link('request a company invoice', '/invoice')}.`]
									: []),
							]
						: [`- Live on the ${link('home page', '/#tickets')}.`]),
					'',
				]
			: []),
		'## Pages',
		'',
		...PAGES.map(({ label, path, note }) => `- ${link(label, path)}${note ? `: ${note}` : ''}`),
		'',
		...(talks.length > 0 ? ['## Talks', '', ...talks.map((s) => talkLine(s, rooms)), ''] : []),
		...(enabled('workshops') && workshops.length > 0
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
