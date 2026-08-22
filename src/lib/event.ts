/**
 * The conference's facts, and the schema.org nodes built from them.
 *
 * These used to live inline in `BaseLayout.astro`, which was fine while the
 * layout was the only thing emitting structured data. It no longer is: the
 * lineup pages emit their own `ItemList` / `Event` graphs and every one of them
 * has to point at the SAME event and organisation nodes, or Google reads them
 * as separate entities and the pages stop reinforcing each other.
 *
 * That is what the `@id` values below are for. Each node is minted once at a
 * stable IRI; every other page references it by `{ '@id': … }` instead of
 * restating it. Change a fact here and every page's JSON-LD follows.
 */

export const SITE_URL = 'https://devfest.cz';

export const OG_IMAGE = `${SITE_URL}/og-image.jpg`;

/** Stable node identifiers — the whole point of the graph. */
export const ID = {
	organization: `${SITE_URL}/#organization`,
	website: `${SITE_URL}/#website`,
	event: `${SITE_URL}/#event`,
	place: `${SITE_URL}/#venue`,
} as const;

/** A reference to an already-defined node, rather than a second copy of it. */
export const ref = (id: string) => ({ '@id': id });

export const EVENT_NAME = 'DevFest.cz 2026';
export const EVENT_START = '2026-10-30T09:00:00+01:00';
export const EVENT_END = '2026-10-30T20:00:00+01:00';
export const EVENT_DESCRIPTION =
	"DevFest.cz 2026 — Prague's developer conference & festival. Web, Mobile, Cybersecurity, AI/ML.";

/** GUG.cz runs the event; DevFest.cz is the brand it runs it under. */
export const parentOrganizationSchema = {
	'@type': 'Organization',
	name: 'GUG.cz, z.s.',
	url: 'https://gug.cz',
};

export const placeSchema = {
	'@type': 'Place',
	'@id': ID.place,
	name: 'Uhelný Mlýn',
	address: {
		'@type': 'PostalAddress',
		streetAddress: 'Areál Šroubáren 860',
		postalCode: '252 66',
		addressLocality: 'Libčice nad Vltavou',
		addressRegion: 'Central Bohemia',
		addressCountry: 'CZ',
	},
};

export const organizationSchema = {
	'@type': 'Organization',
	'@id': ID.organization,
	name: 'DevFest.cz',
	url: SITE_URL,
	logo: {
		'@type': 'ImageObject',
		url: `${SITE_URL}/logo.png`,
	},
	image: OG_IMAGE,
	description:
		"DevFest.cz is Prague's community-run developer conference & festival — Web, Mobile, Cybersecurity, and AI/ML.",
	parentOrganization: parentOrganizationSchema,
	contactPoint: {
		'@type': 'ContactPoint',
		email: 'devfest@gug.cz',
		contactType: 'customer support',
		availableLanguage: ['en', 'cs'],
	},
	// Keep in sync with the Footer socials.
	sameAs: [
		'https://x.com/devfest_cz',
		'https://www.facebook.com/DevFestCZ',
		'https://bsky.app/profile/devfest.cz',
		'https://www.linkedin.com/company/gugcz/',
		'https://www.youtube.com/@gug_cz',
	],
};

export const websiteSchema = {
	'@type': 'WebSite',
	'@id': ID.website,
	name: 'DevFest.cz',
	alternateName: EVENT_NAME,
	url: SITE_URL,
	inLanguage: 'en',
	publisher: ref(ID.organization),
};

/**
 * `offers[].url` points to the on-site #tickets anchor so the schema stays
 * valid even if ti.to slugs change. Prices are VAT-inclusive CZK figures
 * (gross = ti.to net × 1.21 Czech VAT) and must match the customer-facing
 * prices rendered by Tickets.tsx via priceDisplay(). The event is priced in
 * CZK on ti.to (see #182) — do NOT use EUR here. Only list waves that are
 * actually on sale: Early Bird has ended and Regular is now live, so Regular
 * is the sole listed Offer. Future waves (Lazy Bird) are paused with no
 * scheduled start date, so they carry no honest `availability`/`validFrom`
 * and are omitted entirely until they open (avoids Google's missing-field
 * warning). Add an Offer here when a wave opens; remove it when it ends
 * (source of truth: ti.to/RTDB).
 */
const offers = [
	{
		'@type': 'Offer',
		name: 'Regular',
		description: 'Standard conference admission.',
		url: `${SITE_URL}/#tickets`,
		price: '2999',
		priceCurrency: 'CZK',
		availability: 'https://schema.org/InStock',
		validFrom: '2026-07-01T00:00:00+02:00',
		// Bump if a later wave supersedes the Regular price before the event.
		priceValidUntil: '2026-10-30',
		seller: parentOrganizationSchema,
	},
];

/**
 * The event node. Follows
 * https://developers.google.com/search/docs/appearance/structured-data/event
 *
 * `performer` and `subEvent` are filled in on the pages that actually know the
 * lineup (see `lineupSchema`), so the home page emits the event without them
 * rather than claiming a lineup it does not render.
 */
export const eventSchema = {
	'@type': 'Event',
	'@id': ID.event,
	name: EVENT_NAME,
	alternateName: 'DevFest Czechia 2026',
	description: EVENT_DESCRIPTION,
	image: [OG_IMAGE],
	url: SITE_URL,
	startDate: EVENT_START,
	endDate: EVENT_END,
	eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
	eventStatus: 'https://schema.org/EventScheduled',
	inLanguage: 'en',
	isAccessibleForFree: false,
	audience: {
		'@type': 'Audience',
		audienceType: 'Software developers, engineers and technology professionals',
	},
	about: [
		'Software development',
		'Web development',
		'Mobile development',
		'Artificial intelligence',
		'Machine learning',
		'Cybersecurity',
		'Cloud computing',
	],
	keywords:
		'developer conference, technology conference, Prague, Czech Republic, web development, Android, Flutter, AI, machine learning, cybersecurity, DevFest',
	location: placeSchema,
	organizer: ref(ID.organization),
	offers,
};
