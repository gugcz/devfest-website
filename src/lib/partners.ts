// Partner logos, shared by the dedicated /partners page and the homepage
// partners teaser.
//
// The data itself lives in the `partners` content collection
// (`src/content/partners.json`, schema in `src/content.config.ts`). Adding a
// partner means adding one entry there: { id, tier, order, name, logo, url? }.
// Logo masters live under src/assets/partners/<tier>/ — the pages glob those
// and match by filename, so `logo` stays a plain path string.
import { getCollection } from 'astro:content';

export type Partner = { name: string; logo: string; url?: string };

// Ladder tiers only — `media` is a tier in the schema but never part of the ladder.
export type PartnerTierId = 'diamond' | 'platinum' | 'gold' | 'silver';

export type PartnerTier = {
	// Also the src/assets/partners/<id>/ folder and the `.tier-<id>` style hook.
	id: PartnerTierId;
	label: string;
	partners: Partner[];
};

// Ordered top tier first — drives both the /partners tier sections and the
// homepage strip. Media partners are deliberately not part of this ladder.
const TIER_LADDER: { id: PartnerTierId; label: string }[] = [
	{ id: 'diamond', label: 'Diamond' },
	{ id: 'platinum', label: 'Platinum' },
	{ id: 'gold', label: 'Gold' },
	{ id: 'silver', label: 'Silver' },
];

// `getCollection()` makes no ordering promise, so sort on the explicit `order`.
const byTier = async (tier: string): Promise<Partner[]> => {
	const entries = await getCollection('partners', (entry) => entry.data.tier === tier);
	return entries
		.sort((a, b) => a.data.order - b.data.order)
		.map(({ data }) => ({ name: data.name, logo: data.logo, url: data.url }));
};

/** Full sponsor ladder, top tier first (empty tiers included — filter at the call site). */
export const getPartnerTiers = async (): Promise<PartnerTier[]> =>
	Promise.all(
		TIER_LADDER.map(async ({ id, label }) => ({ id, label, partners: await byTier(id) }))
	);

/** Flat "silver+" list in tier order — what the homepage teaser shows. */
export const getShowcasePartners = async (): Promise<Partner[]> =>
	(await getPartnerTiers()).flatMap((t) => t.partners);

/** Media partners — only shown on the dedicated /partners page, never the homepage. */
export const getMediaPartners = (): Promise<Partner[]> => byTier('media');
