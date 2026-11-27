/**
 * Gates every tag on the site shares: GA4 and the Firebase SDKs
 * (`firebase.ts`) and the ad tags (`ads.ts`). Its own module, with no SDK
 * import, so the ad tags can use it without bundling Firebase.
 */

/** Hosts (and subdomains) that report into production. Dev and preview
 * channels stay out. `PUBLIC_ANALYTICS_ALLOWED_HOSTS` overrides. */
export const TRACKING_HOSTS = ['devfest.cz', 'devfest-public.web.app', 'devfest-public.firebaseapp.com'];

/** Whether `hostname` may report. `override` is the comma-separated
 * `PUBLIC_ANALYTICS_ALLOWED_HOSTS`; when set it replaces the default list. */
export function isTrackingHost(hostname: string, override = ''): boolean {
	const configured = override
		.split(',')
		.map((h) => h.trim().toLowerCase())
		.filter(Boolean);
	const allowed = configured.length > 0 ? configured : TRACKING_HOSTS;
	const host = hostname.toLowerCase();
	return allowed.some((h) => host === h || host.endsWith(`.${h}`));
}

/** `/login/<code>`: the app's sign-in link. The code in the path is a
 * credential, so it never reaches GA4, Performance Monitoring, Crashlytics
 * or an ad tag. */
export function isAppLinkPath(pathname: string): boolean {
	return /^\/login(?:\/|$)/.test(pathname);
}

/** The URL with an app-link path cut to `/login/`, query and hash dropped;
 * any other URL unchanged. */
export function redactAppLink(url: string): string {
	try {
		const { origin, pathname } = new URL(url);
		if (!isAppLinkPath(pathname)) return url;
		return `${origin}/login/`;
	} catch {
		return url;
	}
}

/** Run `boot` once the browser is idle, so an SDK or tag never competes with
 * the page. */
export function whenIdle(boot: () => Promise<void> | void): void {
	if ('requestIdleCallback' in window) {
		requestIdleCallback(() => void boot(), { timeout: 5000 });
	} else {
		setTimeout(() => void boot(), 2000);
	}
}
