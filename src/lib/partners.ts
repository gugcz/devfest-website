// Partner logos for /partners and the homepage teaser. Data: the `partners`
// collection (`src/content/partners.json`); masters under
// `src/assets/partners/<tier>/`, matched by filename. Ladder and community
// masters are light marks for the dark ground; media masters ship dark and
// sit on a cream plate.
import { getCollection } from 'astro:content';

export type Partner = { name: string; logo: string; url?: string; plated?: boolean };

// Ladder tiers only — `media` and `community` are tiers in the schema but never
// part of the ladder.
export type PartnerTierId = 'diamond' | 'platinum' | 'gold' | 'silver';

export type PartnerTier = {
	// Also the src/assets/partners/<id>/ folder and the `.tier-<id>` style hook.
	id: PartnerTierId;
	label: string;
	partners: Partner[];
};

// Ordered top tier first — drives both the /partners tier sections and the
// homepage strip. Media and community partners are deliberately not part of
// this ladder (community still gets its own off-ladder row on both pages).
const TIER_LADDER: { id: PartnerTierId; label: string }[] = [
	{ id: 'platinum', label: 'Platinum' },
	{ id: 'diamond', label: 'Diamond' },
	{ id: 'gold', label: 'Gold' },
	{ id: 'silver', label: 'Silver' },
];

// `getCollection()` makes no ordering promise, so sort on the explicit `order`.
const byTier = async (tier: string): Promise<Partner[]> => {
	const entries = await getCollection('partners', (entry) => entry.data.tier === tier);
	return entries
		.sort((a, b) => a.data.order - b.data.order)
		.map(({ data }) => ({ name: data.name, logo: data.logo, url: data.url, plated: data.plated }));
};

/** Full sponsor ladder, top tier first (empty tiers included — filter at the call site). */
export const getPartnerTiers = async (): Promise<PartnerTier[]> =>
	Promise.all(
		TIER_LADDER.map(async ({ id, label }) => ({ id, label, partners: await byTier(id) }))
	);

/** The ladder minus empty tiers — both the /partners sections and the homepage strip. */
export const getActivePartnerTiers = async (): Promise<PartnerTier[]> =>
	(await getPartnerTiers()).filter((t) => t.partners.length > 0);

/** Media partners — only shown on the dedicated /partners page, never the homepage. */
export const getMediaPartners = (): Promise<Partner[]> => byTier('media');

/** Community partners — off the ladder, but shown on both /partners and the homepage strip. */
export const getCommunityPartners = (): Promise<Partner[]> => byTier('community');
