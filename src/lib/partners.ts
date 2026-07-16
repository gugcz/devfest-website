// Single source of truth for partner logos, shared by the dedicated
// /partners page and the homepage partners teaser.
//
// Logos live under public/partners/<tier>/. Add an entry per partner:
// { name, logo, url? } — `url` optional.
export type Partner = { name: string; logo: string; url?: string };

// Gold tier — headline sponsors, shown above silver on /partners and first in
// the homepage "silver+" strip. Wordmarks ship light (cut-out) for the dark card.
export const goldPartners: Partner[] = [
	{ name: 'Wrike', logo: '/partners/gold/wrike.png', url: 'https://www.wrike.com/' },
];

// Silver tier (and above). Full wordmarks ship light (white cut-out) for the
// dark card. The homepage shows these "silver+" partners — media is excluded.
export const silverPartners: Partner[] = [
	{ name: 'Applifting', logo: '/partners/silver/applifting.png', url: 'https://www.applifting.io/' },
];

// Media partners — only shown on the dedicated /partners page, never the homepage.
export const mediaPartners: Partner[] = [
	{ name: 'White Whale Media', logo: '/partners/media/whitewhalemedia.svg', url: 'https://www.whitewhale.media/' },
	{ name: 'Dotěkománie', logo: '/partners/media/dotekomanie.avif', url: 'https://dotekomanie.cz/' },
	{ name: 'Smartmania.cz', logo: '/partners/media/smartmania.svg', url: 'https://smartmania.cz/' },
];
