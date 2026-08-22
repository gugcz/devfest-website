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
import { isScheduled, parseLocalMinutes, toAbsoluteIso } from './agenda';
import { ID, ref, SITE_URL } from './event';
import type { Session } from './sessions';
import { visitorCategories } from './sessions';
import type { Speaker } from './speakers';

/** Structured-data descriptions are plain text and should not run long. */
function clamp(text: string, max = 320): string {
	const flat = text.replace(/\s+/g, ' ').trim();
	if (flat.length <= max) return flat;
	// By code point, not by UTF-16 unit: `slice` will happily cut between the
	// halves of a surrogate pair, and an emoji is a common last character in a
	// conference bio. A lone surrogate is well-formed JSON but not well-formed
	// text, and strict consumers reject or mangle the whole description.
	const cut = Array.from(flat).slice(0, max - 1).join('').trimEnd();
	return `${cut}…`;
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
export function speakersSchema(all: Speaker[], url: string) {
	// `speakerFromDoc` defaults a missing `fullName` to '' so a half-synced doc
	// degrades in the grid (it renders a '?' monogram) instead of throwing. The
	// graph cannot degrade the same way: `name` is what makes a Person node mean
	// anything, and an empty one asserts a performer nobody can identify.
	const speakers = all.filter((speaker) => speaker.fullName.trim().length > 0);
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

/**
 * The talk's absolute end, or null when it cannot be stated honestly.
 *
 * `startDate` is gated by `isScheduled`, so `endDate` must be too: a bare-date
 * or malformed `endsAt` passes through `toAbsoluteIso` untouched, which would
 * put a naive end beside an offset-qualified start inside one Event — a
 * consumer resolving the end against UTC then reads the talk as finishing
 * hours before it began. An end that does not follow the start is dropped for
 * the same reason; the grid has `FALLBACK_DURATION_MIN` for that case, but
 * inventing a duration in structured data would be inventing a fact.
 */
function talkEnd(session: Session): string | null {
	if (parseLocalMinutes(session.endsAt) === null) return null;
	const end = toAbsoluteIso(session.endsAt);
	const startsAt = Date.parse(toAbsoluteIso(session.startsAt));
	const endsAt = Date.parse(end);
	if (Number.isNaN(endsAt)) return null;
	if (!Number.isNaN(startsAt) && endsAt <= startsAt) return null;
	return end;
}

function talkSchema(session: Session) {
	const tags = visitorCategories(session).flatMap((category) => category.values);
	const endDate = talkEnd(session);
	return {
		'@type': 'Event',
		name: session.title,
		...(session.description ? { description: clamp(session.description) } : {}),
		// Absolute, not the naive Sessionize string: schema.org dates are instants
		// (see `toAbsoluteIso`). The conference's own Event node is
		// offset-qualified, so a naive child would contradict its own parent.
		startDate: toAbsoluteIso(session.startsAt),
		...(endDate ? { endDate } : {}),
		eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
		eventStatus: 'https://schema.org/EventScheduled',
		inLanguage: 'en',
		superEvent: ref(ID.event),
		// GUG.cz, like the conference Event itself — see `event.ts`. Pointing a
		// talk at the DevFest.cz brand node instead would state that every talk at
		// the conference is run by a different organisation than the conference.
		organizer: ref(ID.parentOrganization),
		// A room is a Place INSIDE the venue; a talk with no room yet is simply at
		// the venue. Referencing `#venue` rather than re-emitting it matters: an
		// unassigned programme would otherwise repeat the identical venue node,
		// `@id` and all, once per talk — and two definitions of one `@id` is a
		// worse statement than one.
		location: session.room
			? {
					'@type': 'Place',
					name: session.room,
					containedInPlace: ref(ID.place),
				}
			: ref(ID.place),
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
 * carries a real order. The session list has no meaningful one — `sessions.astro`
 * rotates it once per build so no track or room keeps the top of the grid — so
 * it stays `ItemListUnordered`.
 */
export function sessionsSchema(
	sessions: Session[],
	url: string,
	{ name, ordered = false }: { name: string; ordered?: boolean }
) {
	if (!sessions.length) return null;
	// An undated session sorts BEFORE every dated one under a plain string
	// compare (empty string is smallest), which is the opposite of the truth —
	// so they go last, and `ItemListOrderAscending` is only claimed when every
	// item actually carries a date to be ascending by.
	const items = ordered
		? [...sessions].sort((a, b) => {
				if (!isScheduled(a)) return isScheduled(b) ? 1 : 0;
				if (!isScheduled(b)) return -1;
				return a.startsAt.localeCompare(b.startsAt);
			})
		: sessions;
	const chronological = ordered && items.every(isScheduled);
	return {
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		name,
		url,
		numberOfItems: items.length,
		itemListOrder: chronological
			? 'https://schema.org/ItemListOrderAscending'
			: 'https://schema.org/ItemListUnordered',
		itemListElement: items.map((session, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			// A talk with no slot yet is a name on a list, not a dated Event.
			...(isScheduled(session) ? { item: talkSchema(session) } : { name: session.title }),
		})),
	};
}

/** Canonical URL for a lineup page, matching `trailingSlash: 'never'`. */
export const pageUrl = (path: string) => `${SITE_URL}${path}`;
