// Partner logos for /partners, the homepage teaser and the /tv credits band.
// Data: the `partners` collection (`src/content/partners.json`); masters under
// `src/assets/partners/<tier>/`, matched by filename. Every mark keeps its
// original colours (brand manual p. 15); `LOGO_MONO` flags the masters that
// need a paper card to read on the dark ground.
import { getCollection } from 'astro:content';
import type { ImageMetadata } from 'astro';

/**
 * How a master sits on the dark ground, always in its original colours
 * (brand manual p. 15). The `.logo--<mode>` hook:
 * - `ink`, `tile`, `colour`: shown as supplied.
 * - `dark`: dark ink made for a light ground; set on a paper-white card.
 */
export type LogoMono = 'ink' | 'tile' | 'dark' | 'colour';

// Keyed by master filename. Stopgap: belongs in the partners collection as a
// per-partner field (the schema lives in content.config.ts).
const LOGO_MONO: Record<string, LogoMono> = {
	'ceska-sporitelna.webp': 'tile',
	'dotekomanie.avif': 'dark',
	'whitewhalemedia.svg': 'dark',
	'genlive.png': 'colour',
};

const fileOf = (logo: string): string => logo.split('/').pop() as string;

export type Partner = { name: string; logo: string; url?: string; plated?: boolean; mono: LogoMono };

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
		.map(({ data }) => ({
			name: data.name,
			logo: data.logo,
			url: data.url,
			plated: data.plated,
			mono: LOGO_MONO[fileOf(data.logo)] ?? 'ink',
		}));
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

// ─── LOGO SIZING ─────────────────────────────────────────────────────────
// The masters live in `src/assets/partners/<tier>/` so the build can resize
// them; the collection stores plain path strings (`/partners/<tier>/<file>`),
// so glob the sources and key them by that same tier-relative path. Keyed by
// path, not filename, so two tiers can hold a file of the same name.
const logoSources = import.meta.glob<{ default: ImageMetadata }>('../assets/partners/**/*', {
	eager: true,
});
const logoByPath = new Map<string, ImageMetadata>(
	Object.entries(logoSources).map(([path, mod]) => [path.replace('../assets', ''), mod.default])
);

/** The master for a collection path; a typo in partners.json fails the build
 * with the partner's name instead of a bare `undefined.width`. */
const logoFor = (logo: string, name: string): ImageMetadata => {
	const img = logoByPath.get(logo);
	if (!img) throw new Error(`Partner "${name}": no logo master at src/assets${logo}`);
	return img;
};

// Desktop reference box per tier, in px, on /partners: the box size carries
// the rank, one clear step per tier. No box is drawn; `opticalBox` sizes
// each mark as a share of it, so marks in one tier carry equal weight.
type Cell = { w: number; h: number };
const CELLS: Record<string, Cell> = {
	platinum: { w: 600, h: 300 },
	diamond: { w: 330, h: 190 },
	gold: { w: 260, h: 150 },
	silver: { w: 210, h: 120 },
	community: { w: 180, h: 100 },
	media: { w: 180, h: 100 },
};

// Equal ink AREA reads as equal weight: each mark gets a box of the same area
// shaped to its ratio (in a Gold box a 5:1 wordmark lands ≈190×38, a square
// glyph ≈75×75), capped so no mark outgrows the box.
const LOGO_AREA = 0.195;
const LOGO_MAX_W = 0.78;
const LOGO_MAX_H = 0.5;
// A plated mark ships with its own padding baked into the file, so the same
// area would render the ink inside it far too small.
const PLATE_SCALE = 2.1;
const PLATE_MAX_W = 0.86;
const PLATE_MAX_H = 0.6;
// A mark this wide (GDG, Second Foundation, SatoshiLabs) takes two grid
// cells and the full box width, or its letters fall under a legible size.
const WIDE_RATIO = 6;

const opticalBox = (ratio: number, cell: Cell, plated = false) => {
	const area = cell.w * cell.h * LOGO_AREA * (plated ? PLATE_SCALE : 1);
	const wideMax = ratio >= WIDE_RATIO ? 1 : LOGO_MAX_W;
	const maxW = cell.w * (plated ? PLATE_MAX_W : wideMax);
	const maxH = cell.h * (plated ? PLATE_MAX_H : LOGO_MAX_H);
	let height = Math.sqrt(area / ratio);
	let width = height * ratio;
	if (width > maxW) {
		width = maxW;
		height = width / ratio;
	}
	if (height > maxH) {
		height = maxH;
		width = height * ratio;
	}
	return { width: Math.round(width), height: Math.round(height) };
};

/** A logo's master and its optical box in px, for a wall that sizes the
 * marks itself (the `/tv` credits band, in its own unit). */
export const logoBox = (p: Partner, tier: string, scale = 1) => {
	const img = logoFor(p.logo, p.name);
	const ratio = img.width && img.height ? img.width / img.height : 3;
	const base = CELLS[tier] ?? CELLS.gold;
	return { img, box: opticalBox(ratio, { w: base.w * scale, h: base.h * scale }, p.plated) };
};

/**
 * Everything one logo needs at one call site: the `<Image>` props (the
 * optical box as `--logo-w`, a srcset matching it). `scale` shrinks the
 * tier's box for a smaller wall (the home strip).
 */
export const partnerLogo = (p: Partner, tier: string, scale = 1) => {
	const { img, box } = logoBox(p, tier, scale);
	const shared = { src: img, style: `--logo-w:${box.width / 16}rem` };
	const props =
		img.format === 'svg'
			? { ...shared, format: 'svg' as const, layout: 'none' as const }
			: {
					...shared,
					widths: [box.width, box.width * 2, box.width * 3],
					sizes: `${box.width}px`,
				};
	return { props };
};
