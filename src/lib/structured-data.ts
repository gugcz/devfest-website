/**
 * The schema.org JSON-LD every layout shares. The organisation and the
 * website are the brand's, so they name the live root in every build, the
 * archive's included. What belongs to one page (the `Event`, a breadcrumb)
 * is built by its layout. Build time only.
 */
import config from '../site.config';
import { absoluteUrl, liveUrl } from './base';
import { getSocials } from './socials';

/** GUG.cz, the legal organiser: the `organizer` of an Event, the parent of the brand. */
export const organizer = {
	'@type': 'Organization',
	name: config.organizer.legalName,
	url: config.organizer.url,
};

/** DevFest.cz as an organisation: on every page, and alone on the teaser until the edition has a date. */
export async function organizationSchema(): Promise<Record<string, unknown>> {
	return {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: config.event.name,
		url: liveUrl('/'),
		logo: absoluteUrl('/logo.png'),
		description: `${config.event.name} is Prague's community-run developer conference & festival — ${config.event.pitch}`,
		parentOrganization: organizer,
		contactPoint: {
			'@type': 'ContactPoint',
			email: config.organizer.email,
			contactType: 'customer support',
		},
		sameAs: (await getSocials()).map((s) => s.url),
	};
}

export const websiteSchema = {
	'@context': 'https://schema.org',
	'@type': 'WebSite',
	name: config.event.name,
	url: liveUrl('/'),
};

/** The `<script type="application/ld+json">` body; `<` escaped so content cannot end the element. */
export const jsonLdText = (items: readonly object[]): string => JSON.stringify(items).replace(/</g, '\\u003c');
