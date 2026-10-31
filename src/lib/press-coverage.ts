// Press coverage for the press band on /contact. Build time only: imported
// from .astro frontmatter, so the OG scrape runs in Node and never ships.
import { fetchOg } from './og';

// A media mention is a URL in `src/content/press-coverage.json`; the schema
// in `src/content.config.ts` says which fields may pin a scraped value.
import { getCollection } from 'astro:content';

export interface ResolvedMention {
	href: string;
	outlet: string;
	title: string;
	date?: string;
	dateLabel?: string;
	image?: string;
	description?: string;
}


const DATE_FMT = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

function hostname(url: string): string {
	try {
		return new URL(url).hostname.replace(/^www\./, '');
	} catch {
		return url;
	}
}

// Last-resort title when the article's OG tags could not be read: its URL
// slug as words. A raw URL set at headline scale broke into a column of
// fragments.
function slugTitle(url: string): string {
	try {
		const slug = new URL(url).pathname.split('/').filter(Boolean).pop() ?? '';
		const words = decodeURIComponent(slug).replace(/[-_]+/g, ' ').trim();
		return words ? words.charAt(0).toUpperCase() + words.slice(1) : hostname(url);
	} catch {
		return url;
	}
}

// Resolve each entry from its Open Graph tags at build time. fetchOg never
// throws (returns {} on failure), so a dead/blocked source degrades to a
// hostname + bare-link card instead of breaking the build.
export const loadMediaCoverage = async (): Promise<ResolvedMention[]> =>
	Promise.all(
		(await getCollection('pressCoverage'))
			.sort((a, b) => a.data.order - b.data.order)
			.map(({ data: m }) => m)
			.map(async (m): Promise<ResolvedMention> => {
			const og = await fetchOg(m.href);
			const iso = m.date ?? og.publishedTime;
			let dateLabel = m.dateLabel;
			if (!dateLabel && iso) {
				const d = new Date(iso);
				if (!Number.isNaN(d.getTime())) dateLabel = DATE_FMT.format(d);
			}
			return {
				href: m.href,
				outlet: m.outlet ?? og.siteName ?? hostname(m.href),
				title: m.title ?? og.title ?? slugTitle(m.href),
				date: iso ? iso.slice(0, 10) : undefined,
				dateLabel,
				image: m.image ?? og.image,
				description: m.description ?? og.description,
			};
		})
	);
