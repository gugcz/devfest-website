// Partner logos, shared by the dedicated /partners page and the homepage
// partners teaser.
//
// The data itself lives in the `partners` content collection
// (`src/content/partners.json`, schema in `src/content.config.ts`). Adding a
// partner means adding one entry there: { id, tier, order, name, logo, url? }.
// Logo masters live under src/assets/partners/<tier>/ — the pages glob those
// and match by filename, so `logo` stays a plain path string.
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
// this ladder.
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

/** Community partners — same deal as media: /partners only, off the ladder. */
export const getCommunityPartners = (): Promise<Partner[]> => byTier('community');

/**
 * Cell columns per row, top tier first — this IS the tier signal (Partners is
 * optimised for the sponsor screenshotting the page, not for a uniform grid).
 * Media/community run at the same column count as silver: off-ladder, but not
 * a second visual system.
 */
const ROW_COLUMNS: Record<string, number> = {
	platinum: 1,
	diamond: 2,
	gold: 3,
	silver: 4,
	media: 4,
	community: 4,
};

/**
 * Grid column count for a wall row: cell size encodes tier value, so a tier's
 * column count is fixed regardless of how many partners fill it — a lone
 * silver sponsor still gets a small, 4-up-sized cell, padded out with empty
 * plates, rather than growing to fill the row (which would read as a bigger
 * tier than it is). Platinum is the one exception: it runs full width, or
 * half-width when there are exactly two partners — there IS no smaller
 * platinum cell to pad out to.
 */
export function columnsFor(rowId: string, count: number): number {
	if (rowId === 'platinum') return count <= 2 ? Math.max(count, 1) : 2;
	return ROW_COLUMNS[rowId] ?? 4;
}

/**
 * Partner count padded up to a full grid line, in BOTH the desktop column
 * count and the mobile 2-up grid — a tier that doesn't divide evenly gets
 * empty plates rather than a staircased last row on either layout. A
 * single-column row (platinum) is exempt: it renders one column on mobile
 * too (see `.logo-grid[data-cols='1']` in partners.scss), so a lone sponsor
 * needs no padding on either breakpoint.
 */
export function paddedCount(count: number, cols: number): number {
	if (count === 0 || cols <= 1) return count;
	let target = Math.ceil(count / cols) * cols;
	if (target % 2 !== 0) target += cols;
	return target;
}
