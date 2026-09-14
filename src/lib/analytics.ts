/** Fire-and-forget GA4 events. Loads `firebase.ts` on demand — a static
 * import would bundle the whole SDK into an island. Never throws or blocks. */
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
 * Fire a conversion event once, and only while the visitor is on `pathname`.
 * Both guards matter under `<ClientRouter />`: a page script's
 * `astro:page-load` listener survives every soft navigation away, so an
 * unguarded call would re-fire on every later page.
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
