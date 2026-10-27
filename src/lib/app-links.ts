// Store links for the DevFest.cz app (`cz.devfest.app`), shown on /app — the
// page the venue QR codes point at, and on /login, where the app's sign-in
// link lands without the app installed. A link left as
// `null` renders as "Coming soon" instead of a dead badge, so the page
// can ship before every store listing is live.
export const APP_LINKS: Record<'googlePlay' | 'appStore' | 'pwa', string | null> = {
	/** Google Play listing, e.g. https://play.google.com/store/apps/details?id=cz.devfest.app */
	googlePlay: 'https://play.google.com/store/apps/details?id=cz.devfest.app',
	/** App Store listing, e.g. https://apps.apple.com/app/id0000000000 */
	appStore: 'https://apps.apple.com/app/id6818298786',
	/** The installable web app, for anything that is not Android or iOS. */
	pwa: null,
};
