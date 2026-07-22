// Single source of truth for partner logos, shared by the dedicated
// /partners page and the homepage partners teaser.
//
// Logos live under public/partners/<tier>/. Add an entry per partner:
// { name, logo, url? } — `url` optional.
export type Partner = { name: string; logo: string; url?: string };

export type PartnerTier = {
	// Also the public/partners/<id>/ folder and the `.tier-<id>` style hook.
	id: 'diamond' | 'platinum' | 'gold' | 'silver';
	label: string;
	partners: Partner[];
};

// Diamond tier — top of the ladder. Wordmarks ship light (cut-out) for the
// dark card, same as every non-media tier.
export const diamondPartners: Partner[] = [
	{ name: 'Make', logo: '/partners/diamond/make.png', url: 'https://www.make.com/' },
	{ name: 'GDG', logo: '/partners/diamond/gdg.png', url: 'https://gdg.community.dev/' },
];

// Platinum tier.
export const platinumPartners: Partner[] = [
	// White cut-out — their 2023 identity makes the pure-white logo the primary
	// mark, which is also what the dark tile needs. Derived from the supplied
	// blue-plate asset (kept alongside as ceska-sporitelna.webp).
	{ name: 'Česká spořitelna', logo: '/partners/platinum/ceska-sporitelna-white.webp', url: 'https://www.csas.cz/' },
];

// Gold tier.
export const goldPartners: Partner[] = [
	{ name: 'Wrike', logo: '/partners/gold/wrike.png', url: 'https://www.wrike.com/' },
	{ name: 'Apify', logo: '/partners/gold/apify.svg', url: 'https://apify.com/' },
	{ name: 'Alma Career', logo: '/partners/gold/alma.png', url: 'https://www.almacareer.com/' },
];

// Silver tier.
export const silverPartners: Partner[] = [
	{ name: 'Applifting', logo: '/partners/silver/applifting.png', url: 'https://www.applifting.io/' },
];

// Ordered top tier first — drives both the /partners tier sections and the
// homepage strip. Media partners are deliberately not part of this ladder.
export const partnerTiers: PartnerTier[] = [
	{ id: 'diamond', label: 'Diamond', partners: diamondPartners },
	{ id: 'platinum', label: 'Platinum', partners: platinumPartners },
	{ id: 'gold', label: 'Gold', partners: goldPartners },
	{ id: 'silver', label: 'Silver', partners: silverPartners },
];

// Flat "silver+" list in tier order — what the homepage teaser shows.
export const showcasePartners: Partner[] = partnerTiers.flatMap((t) => t.partners);

// Media partners — only shown on the dedicated /partners page, never the homepage.
export const mediaPartners: Partner[] = [
	{ name: 'White Whale Media', logo: '/partners/media/whitewhalemedia.svg', url: 'https://www.whitewhale.media/' },
	{ name: 'Dotěkománie', logo: '/partners/media/dotekomanie.avif', url: 'https://dotekomanie.cz/' },
	{ name: 'Smartmania.cz', logo: '/partners/media/smartmania.svg', url: 'https://smartmania.cz/' },
];
