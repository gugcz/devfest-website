/**
 * schema.org graphs for the lineup pages, built from the same build-time data
 * the pages pre-render (`src/lib/lineup-build.ts`).
 *
 * Everything here references the sitewide `Event` / `Organization` nodes by
 * `@id` instead of restating them, so `/speakers`, `/sessions` and `/agenda`
 * describe parts of ONE event rather than three unrelated ones.
 *
 * Honesty rule: a talk only becomes a schema.org `Event` once it has a real
 * start time. Google requires `startDate` on an Event, and inventing one from
 * the conference's own start would be a fabricated fact in structured data — so
 * an unscheduled talk is listed as a plain `ListItem` with its name and nothing
 * more, which is valid and true.
 */
import { ID, ref, SITE_URL, placeSchema } from './event';
import type { Session } from './sessions';
import { visitorCategories } from './sessions';
import type { Speaker } from './speakers';

/** Structured-data descriptions are plain text and should not run long. */
function clamp(text: string, max = 320): string {
	const flat = text.replace(/\s+/g, ' ').trim();
	if (flat.length <= max) return flat;
	return `${flat.slice(0, max - 1).trimEnd()}…`;
}

function personSchema(speaker: Speaker) {
	return {
		'@type': 'Person',
		name: speaker.fullName,
		...(speaker.tagLine ? { jobTitle: speaker.tagLine } : {}),
		...(speaker.bio ? { description: clamp(speaker.bio) } : {}),
		...(speaker.profilePicture ? { image: speaker.profilePicture } : {}),
		...(speaker.links.length ? { sameAs: speaker.links.map((link) => link.url) } : {}),
		performerIn: ref(ID.event),
	};
}

/** `ItemList` of the confirmed speakers, for `/speakers`. */
export function speakersSchema(speakers: Speaker[], url: string) {
	if (!speakers.length) return null;
	return {
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		name: 'DevFest.cz 2026 speakers',
		description: 'Speakers confirmed for DevFest.cz 2026 in Prague.',
		url,
		numberOfItems: speakers.length,
		itemListOrder: 'https://schema.org/ItemListUnordered',
		itemListElement: speakers.map((speaker, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			item: personSchema(speaker),
		})),
	};
}

function talkSchema(session: Session) {
	const tags = visitorCategories(session).flatMap((category) => category.values);
	return {
		'@type': 'Event',
		name: session.title,
		...(session.description ? { description: clamp(session.description) } : {}),
		startDate: session.startsAt,
		...(session.endsAt ? { endDate: session.endsAt } : {}),
		eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
		eventStatus: 'https://schema.org/EventScheduled',
		inLanguage: 'en',
		superEvent: ref(ID.event),
		organizer: ref(ID.organization),
		location: session.room
			? {
					'@type': 'Place',
					name: session.room,
					containedInPlace: ref(ID.place),
					address: placeSchema.address,
				}
			: placeSchema,
		...(session.speakers.length
			? {
					performer: session.speakers.map((speaker) => ({
						'@type': 'Person',
						name: speaker.fullName,
						...(speaker.tagLine ? { jobTitle: speaker.tagLine } : {}),
					})),
				}
			: {}),
		...(tags.length ? { keywords: tags.join(', ') } : {}),
	};
}

/**
 * `ItemList` of the programme, for `/sessions` and `/agenda`.
 *
 * `ordered` is what separates the two: the agenda is a timetable, so its list
 * carries a real order; the session list is deliberately shuffled per visitor,
 * so claiming an order there would be meaningless.
 */
export function sessionsSchema(
	sessions: Session[],
	url: string,
	{ name, ordered = false }: { name: string; ordered?: boolean }
) {
	if (!sessions.length) return null;
	const items = ordered
		? [...sessions].sort((a, b) => a.startsAt.localeCompare(b.startsAt))
		: sessions;
	return {
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		name,
		url,
		numberOfItems: items.length,
		itemListOrder: ordered
			? 'https://schema.org/ItemListOrderAscending'
			: 'https://schema.org/ItemListUnordered',
		itemListElement: items.map((session, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			// A talk with no slot yet is a name on a list, not a dated Event.
			...(session.startsAt ? { item: talkSchema(session) } : { name: session.title }),
		})),
	};
}

/** Canonical URL for a lineup page, matching `trailingSlash: 'never'`. */
export const pageUrl = (path: string) => `${SITE_URL}${path}`;
