// Store links for the DevFest.cz app (`cz.devfest.app`), shown on /app — the
// page the venue QR codes point at. PASTE THE REAL LINKS HERE. A link left as
// `null` renders its row as "Coming soon" instead of a dead button, so the page
// can ship before every store listing is live.
export const APP_LINKS: Record<'googlePlay' | 'appStore' | 'pwa', string | null> = {
	/** Google Play listing, e.g. https://play.google.com/store/apps/details?id=cz.devfest.app */
	googlePlay: null,
	/** App Store listing, e.g. https://apps.apple.com/app/id0000000000 */
	appStore: null,
	/** The installable web app, for anything that is not Android or iOS. */
	pwa: null,
};
