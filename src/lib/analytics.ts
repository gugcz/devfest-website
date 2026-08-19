/**
 * Fire-and-forget GA4 events for UI code.
 *
 * The point of this module is what it does *not* import: `src/lib/firebase.ts`
 * pulls in the Firebase SDK (app + app-check + analytics), so a static import of
 * it from an island would put the whole SDK in that island's bundle — exactly
 * what the `/api/*` refactor removed from the content path. Components import
 * `track` instead, and Firebase is loaded on demand, by which point the cookie
 * banner has usually already warmed the same module.
 *
 * Never throws and never blocks the caller: an analytics failure must not be
 * able to break a checkout link or a form submit.
 */
export function track(name: string, params?: Record<string, unknown>): void {
	void import('./firebase')
		.then((m) => m.trackEvent(name, params))
		.catch((err) => {
			console.warn(`[analytics] event ${name} failed:`, err);
		});
}

/** Conversion event names already sent for the current document. */
const firedConversions = new Set<string>();

/**
 * Fire a conversion event once, and only while the visitor is actually on
 * `pathname`.
 *
 * Both guards are load-bearing under `<ClientRouter />`. A bundled page script
 * runs once per document, but the `astro:page-load` listener it registers
 * survives every soft navigation *away* from that page — so an unguarded call
 * would re-fire the conversion on every later page the visitor opens, and again
 * each time they navigate back.
 */
export function trackConversion(
	pathname: string,
	name: string,
	params?: Record<string, unknown>,
): void {
	if (window.location.pathname.replace(/\/$/, '') !== pathname) return;
	if (firedConversions.has(name)) return;
	firedConversions.add(name);
	track(name, params);
}
