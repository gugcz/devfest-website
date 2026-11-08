/**
 * `/llms.txt` (https://llmstxt.org): the site as Markdown for a language
 * model — the facts, the tickets, every page, talk and speaker with its link.
 * Built once per `astro build` from the same build-time reads as the pages
 * (`lineup-static.ts`, `tickets-static.ts`, `workshops-static.ts`), so it is
 * as fresh as the last Hosting deploy and says so.
 */
import type { APIRoute } from 'astro';
import { EVENT, hasDate, hasVenue } from '../lib/event';
import { getTopics } from '../lib/topics';
import { byStart, roomName, timeRange } from '../lib/agenda';
import { speakerNames, type Room, type Session } from '../lib/sessions';
import { staticLineup } from '../lib/lineup-static';
import { staticTicketLines } from '../lib/tickets-static';
import { staticWorkshops } from '../lib/workshops-static';
import { speakerSharePath, talkSharePath } from '../lib/share';
import { BUILD_DAY } from '../lib/static-api';
import { absoluteUrl } from '../lib/base';
import { lastEdition, pastEditions } from '../lib/editions';
import config from '../site.config';
import { enabled, enabledOnly, type FeatureFlag } from '../lib/flags';

const PAGES = enabledOnly<{ label: string; path: string; note: string; feature?: FeatureFlag }>([
	{ label: 'Tickets', path: '/#tickets', note: 'ticket waves and prices, bought on ti.to', feature: 'tickets' },
	{ label: 'Agenda', path: '/agenda', note: 'the timetable by room and time, and every talk with its abstract', feature: 'lineup' },
	{ label: 'Speakers', path: '/speakers', note: 'everyone on stage, with bios', feature: 'lineup' },
	{ label: 'Workshops', path: '/workshops', note: 'workshop sign-up for ticket holders, limited seats', feature: 'workshops' },
	{ label: 'Venue', path: '/venue', note: `how to get to ${EVENT.venue} from Prague`, feature: 'venue' },
	{ label: 'FAQ', path: '/faq', note: 'the essentials and how to get involved' },
	{ label: 'Company invoice', path: '/invoice', note: 'pay for tickets by bank transfer', feature: 'invoice' },
	{ label: 'Code of Conduct', path: '/code-of-conduct', note: '' },
	{ label: 'Partners', path: '/partners', note: 'the partners and how to become one', feature: 'partners' },
	{ label: 'Team', path: '/team', note: 'the volunteers who organise it' },
	{ label: 'Contact', path: '/contact', note: 'organisers, partnerships and press' },
	{ label: 'Press kit', path: '/press/downloads', note: 'logos and photos' },
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

/** What is announced: the day and the venue, or the season and the city before them. */
function facts(topics: string[]): string[] {
	const { event, organizer } = config;
	const summary = hasDate && hasVenue
		? `> Prague's community developer conference: one day of talks and workshops in English on ${EVENT.dateLabel} at ${EVENT.venue}, ${EVENT.city}. Organised by ${organizer.legalName} since 2012.`
		: `> ${event.tagline}: one day of talks and workshops in English, organised by ${organizer.legalName} since 2012. ${EVENT.name} is in ${event.season.toLowerCase().replace(/^fall/, 'the fall of')} in ${event.city}; its date and venue are not announced yet.`;
	return [
		summary,
		'',
		...(hasDate
			? [`- Date: ${EVENT.dateLabel}. Doors and registration ${EVENT.doorsTime}, keynote ${EVENT.startTime}, closing remarks ${EVENT.endTime}, afterparty until ${EVENT.afterpartyEndTime} (CET).`]
			: []),
		...(hasVenue ? [`- Venue: ${EVENT.venue}, ${EVENT.street}. Map: ${EVENT.mapUrl}`] : []),
		...(event.audience ? [`- Audience: ${event.audience} medior and senior developers from across Central and Eastern Europe. In person only.`] : []),
		...(topics.length > 0 ? [`- Topics: ${topics.join(', ')}.`] : []),
		`- Contact: ${organizer.email}`,
		...(hasDate ? [`- Calendar: ${absoluteUrl(EVENT.icsUrl)}`] : []),
	];
}

/** The last edition in figures, and where every past edition lives. */
function history(): string[] {
	const last = lastEdition();
	const editions = pastEditions();
	return [
		...(last
			? [
					`- Last edition: ${last.name}, ${last.dateLabel}${last.venue ? ` at ${last.venue}` : ''}, ${last.city}: ${last.audience ? `${last.audience} developers, ` : ''}${last.talks} talks, ${last.speakers} speakers. Archive: ${absoluteUrl(last.href)} (its own ${link('llms.txt', `${last.href}/llms.txt`)}).`,
				]
			: []),
		`- Past editions: ${editions.map(({ year, href }) => `[${year}](${href.startsWith('/') ? absoluteUrl(href) : href})`).join(', ')}.`,
	];
}

/** The ticket waves, while the sale is on. */
function ticketSection(tickets: Awaited<ReturnType<typeof staticTicketLines>>): string[] {
	if (!enabled('tickets')) return [];
	const lines =
		tickets.length > 0
			? [
					...tickets.map((t) => `- ${t.label}: ${t.price}, VAT included. ${t.status}${t.purchasable ? `. [Buy on ti.to](${t.url})` : ''}`),
					...(enabled('invoice') ? [`- Paying by bank transfer: ${link('request a company invoice', '/invoice')}.`] : []),
				]
			: [`- Live on the ${link('home page', '/#tickets')}.`];
	return ['## Tickets', '', ...lines, ''];
}

/** The talks, the workshops and the speakers, while the lineup is on. */
async function lineupSections(): Promise<string[]> {
	if (!enabled('lineup')) return [];
	const { speakers, sessions, rooms } = await staticLineup();
	const workshops = enabled('workshops') ? await staticWorkshops(sessions) : [];
	const talks = [...sessions].sort(byStart);
	return [
		...(talks.length > 0 ? ['## Talks', '', ...talks.map((s) => talkLine(s, rooms)), ''] : []),
		...(workshops.length > 0 ? ['## Workshops', '', ...workshops.map((s) => talkLine(s, rooms)), ''] : []),
		...(speakers.length > 0
			? [
					'## Speakers',
					'',
					...speakers.map((sp) => `- ${link(clean(sp.fullName), speakerSharePath(sp.id))}${sp.tagLine ? `: ${clean(sp.tagLine)}` : ''}`),
					'',
				]
			: []),
	];
}

export const GET: APIRoute = async () => {
	const topics = (await getTopics()).map((t) => t.name);
	const tickets = enabled('tickets') ? await staticTicketLines() : [];
	const lines = [
		`# ${EVENT.name}`,
		'',
		...facts(topics),
		...history(),
		'',
		`Lists below are as of ${BUILD_DAY}; the linked pages are live.`,
		'',
		...ticketSection(tickets),
		'## Pages',
		'',
		...PAGES.map(({ label, path, note }) => `- ${link(label, path)}${note ? `: ${note}` : ''}`),
		'',
		...(await lineupSections()),
	];
	return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
