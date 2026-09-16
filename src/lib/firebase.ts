import { initializeApp, type FirebaseApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaEnterpriseProvider, type AppCheck } from 'firebase/app-check';
import { initializeAnalytics, isSupported, logEvent, type Analytics } from 'firebase/analytics';
import { readConsent } from './consent';

const firebaseConfig = {
	apiKey: 'AIzaSyB7lXxnVicSWTtUe9CbVUarm2MwFVRMucU',
	authDomain: 'devfest-cz-app.firebaseapp.com',
	databaseURL: 'https://devfest-cz-app-default-rtdb.europe-west1.firebasedatabase.app',
	projectId: 'devfest-cz-app',
	storageBucket: 'devfest-cz-app.firebasestorage.app',
	messagingSenderId: '544417536046',
	appId: '1:544417536046:web:a238af229f95f75c2aa7bf',
	measurementId: 'G-L5NK2S2EZ0',
};

let appInstance: FirebaseApp | null = null;
function getApp(): FirebaseApp {
	if (!appInstance) {
		appInstance = initializeApp(firebaseConfig);
		initAppCheck(appInstance);
	}
	return appInstance;
}

// reCAPTCHA Enterprise key ID. Public like the Firebase `apiKey`, so it is safe to
// commit; PUBLIC_FIREBASE_APPCHECK_SITE_KEY overrides it per environment.
const APPCHECK_SITE_KEY = '6LdOhSYtAAAAALPcqSZIJoT7i7c6B5SOiByWChra';

let appCheckInstance: AppCheck | null = null;
/** Initialise App Check (reCAPTCHA Enterprise) for `submitInvoiceCallable`,
 * its only consumer. No-ops on the server and without a site key. */
function initAppCheck(app: FirebaseApp): void {
	if (appCheckInstance) return;
	if (typeof window === 'undefined') return;

	const siteKey = import.meta.env.PUBLIC_FIREBASE_APPCHECK_SITE_KEY ?? APPCHECK_SITE_KEY;
	if (!siteKey) return;

	// Local dev / preview: a debug token so reCAPTCHA isn't required on localhost.
	// `true` prints a token to the console; a string reuses one.
	const debugToken = import.meta.env.PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN;
	if (debugToken) {
		self.FIREBASE_APPCHECK_DEBUG_TOKEN = debugToken === 'true' ? true : debugToken;
	}

	try {
		appCheckInstance = initializeAppCheck(app, {
			provider: new ReCaptchaEnterpriseProvider(siteKey),
			isTokenAutoRefreshEnabled: true,
		});
	} catch (err) {
		console.warn('[firebase] App Check init failed:', err);
	}
}


/** The initialised FirebaseApp (App Check already wired) — e.g. for `getFunctions(app)`. */
export function getFirebaseApp(): FirebaseApp {
	return getApp();
}

/**
 * Consent state pushed before the tag boots. Only `analytics_storage` is
 * granted — `ad_*` stay denied permanently, since we never collect for
 * advertising. The tag boots only after the visitor accepts (basic Consent
 * Mode), so a "denied" state is never sent: undecided or declined sends nothing.
 */
const ANALYTICS_CONSENT = {
	ad_storage: 'denied',
	ad_user_data: 'denied',
	ad_personalization: 'denied',
	analytics_storage: 'granted',
} as const;

/** Hosts (and subdomains) that report into production GA4 — dev and preview
 * channels stay out. `PUBLIC_ANALYTICS_ALLOWED_HOSTS` overrides. */
const ANALYTICS_HOSTS = ['devfest.cz', 'devfest-public.web.app', 'devfest-public.firebaseapp.com'];

function isAnalyticsHost(): boolean {
	const override = import.meta.env.PUBLIC_ANALYTICS_ALLOWED_HOSTS ?? '';
	const configured = override
		.split(',')
		.map((h) => h.trim().toLowerCase())
		.filter(Boolean);
	const allowed = configured.length > 0 ? configured : ANALYTICS_HOSTS;
	const host = window.location.hostname.toLowerCase();
	return allowed.some((h) => host === h || host.endsWith(`.${h}`));
}

/** Push a raw gtag command. gtag.js only honours the `arguments` object — a
 * plain array is silently ignored. Never "clean this up" into a rest array. */
const gtag = function (): void {
	const w = window as unknown as { dataLayer?: unknown[] };
	w.dataLayer = w.dataLayer ?? [];
	// eslint-disable-next-line prefer-rest-params
	w.dataLayer.push(arguments);
} as (...args: unknown[]) => void;

/**
 * The page the document was loaded on, captured before `<ClientRouter />`
 * rewrites `location.href`. GA4 must see this page first: it carries the
 * campaign parameters (`utm_*`) and the external referrer that attribute the
 * whole session, and the visitor may accept only after soft-navigating away.
 */
const entryLocation = typeof window === 'undefined' ? '' : window.location.href;
const entryTitle = typeof document === 'undefined' ? '' : document.title;
const entryReferrer = typeof document === 'undefined' ? '' : document.referrer;

let analyticsInstance: Analytics | null = null;
let analyticsInit: Promise<void> | null = null;
/** URL of the last page reported, or `null` while the tag isn't booted. */
let lastPageLocation: string | null = null;
/**
 * Boot GA4 — only once the visitor has accepted (basic Consent Mode: no tag,
 * no request to Google before that). Safe to call on every page load and on
 * accept; the boot runs once and the in-flight promise is memoised (callers
 * overlap). Invariants, verified in-browser:
 *  1. `consent: 'default'` precedes `config` — Firebase's `setConsent()`
 *     doesn't guarantee that, hence the gtag shim.
 *  2. The consent gate sits BEFORE the memo, so a page-load call while
 *     undecided doesn't pin "not booted" for the accept that follows.
 *  3. The tag's own `config` page_view is off; `reportEntry()` sends the entry
 *     page instead, so the session is attributed to the URL the visitor
 *     arrived on even when they accept later.
 */
export function initAnalytics(): Promise<void> {
	if (typeof window === 'undefined') return Promise.resolve();
	// App Check is a security mechanism (legitimate interest), not analytics: it
	// runs in every environment and regardless of consent, hence before both gates.
	getApp();
	if (readConsent() !== 'accepted') return Promise.resolve();
	analyticsInit ??= (async () => {
		try {
			if (!isAnalyticsHost()) {
				console.info(
					`[firebase] Analytics off on ${window.location.hostname} (not a production host)`,
				);
				return;
			}
			const supported = await isSupported();
			if (!supported) return;
			gtag('consent', 'default', ANALYTICS_CONSENT);
			analyticsInstance = initializeAnalytics(getApp(), { config: { send_page_view: false } });
			reportEntry();
		} catch (err) {
			console.warn('[firebase] Analytics init failed:', err);
		}
	})();
	return analyticsInit;
}

/**
 * Send one `page_view`. `page_referrer` is explicit: a soft navigation sends
 * no referrer of its own, so GA4 would otherwise read every in-site hop as a
 * direct arrival.
 */
function sendPageView(location: string, title: string, referrer: string | undefined): void {
	if (!analyticsInstance) return;
	try {
		logEvent(analyticsInstance, 'page_view', {
			page_location: location,
			page_title: title,
			...(referrer ? { page_referrer: referrer } : {}),
		});
	} catch (err) {
		console.warn('[firebase] page_view failed:', err);
	}
}

/** First report after boot: the entry page, then the current page if the
 * visitor soft-navigated before accepting. */
function reportEntry(): void {
	sendPageView(entryLocation, entryTitle, entryReferrer || undefined);
	const here = window.location.href;
	if (here !== entryLocation) sendPageView(here, document.title, entryLocation);
	lastPageLocation = here;
}

/** Record a `page_view` for the current page. GA4 does NOT see
 * `<ClientRouter />`'s `pushState` (verified), so every page after the entry
 * would go uncounted. No-op until the visitor accepts, and for the page the
 * boot has just reported. */
export async function trackPageView(): Promise<void> {
	await initAnalytics();
	if (!analyticsInstance) return;
	const here = window.location.href;
	if (here === lastPageLocation) return;
	const previous = lastPageLocation;
	lastPageLocation = here;
	sendPageView(here, document.title, previous ?? undefined);
}

/**
 * Send a GA4 event. Boots Analytics first (idempotent) and never throws —
 * conversion tracking must not break the click or submit it is attached to.
 * Dropped until the visitor accepts: unconsented events never reach a report.
 */
export async function trackEvent(
	name: string,
	params?: Record<string, unknown>,
): Promise<void> {
	await initAnalytics();
	if (!analyticsInstance) return;
	try {
		logEvent(analyticsInstance, name, params);
	} catch (err) {
		console.warn(`[firebase] event ${name} failed:`, err);
	}
}
