import { initializeApp, type FirebaseApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaEnterpriseProvider, type AppCheck } from 'firebase/app-check';
import { getAnalytics, isSupported, logEvent, type Analytics } from 'firebase/analytics';
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
/**
 * Initialise App Check (reCAPTCHA Enterprise) on the shared FirebaseApp, so the
 * token is in place before the App-Check-enforced `submitInvoiceCallable` fires.
 * No content read goes through the Firebase SDK, so that callable is the only
 * consumer. No-ops on the server and when no site key is configured.
 */
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
			isTokenAutoRefresh: true,
		});
	} catch (err) {
		console.warn('[firebase] App Check init failed:', err);
	}
}


/** The initialised FirebaseApp (App Check already wired) — e.g. for `getFunctions(app)`. */
export function getFirebaseApp(): FirebaseApp {
	return getApp();
}

const DENIED_CONSENT = {
	ad_storage: 'denied',
	ad_user_data: 'denied',
	ad_personalization: 'denied',
	analytics_storage: 'denied',
} as const;

/**
 * Consent state for a visitor who has already accepted. Only `analytics_storage`
 * flips — `ad_*` stay denied permanently, since we never collect for advertising.
 */
const GRANTED_CONSENT = { ...DENIED_CONSENT, analytics_storage: 'granted' } as const;

/**
 * Hosts that report into the production GA4 property. The measurement ID is
 * committed, so without this gate `npm run dev` and every `*.web.app` preview
 * channel would mix development traffic into the live numbers. Matches the host
 * and any subdomain; preview channels are a sibling hostname, so they stay out.
 * `PUBLIC_ANALYTICS_ALLOWED_HOSTS` (comma-separated) overrides the list.
 */
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

/**
 * Push a raw gtag command onto the shared dataLayer. gtag.js only recognises
 * consent/config commands pushed as the `arguments` object of Google's canonical
 * shim — a plain array is silently ignored and `_ga` gets written anyway. Never
 * "clean this up" into a rest array.
 */
const gtag = function (): void {
	const w = window as unknown as { dataLayer?: unknown[] };
	w.dataLayer = w.dataLayer ?? [];
	// eslint-disable-next-line prefer-rest-params
	w.dataLayer.push(arguments);
} as (...args: unknown[]) => void;

let analyticsInstance: Analytics | null = null;
let analyticsInit: Promise<void> | null = null;
/** Whether GA4 is currently measuring with storage (a `client_id`). */
let consentGranted = false;
/**
 * Initialise Analytics (GA4) in Google Consent Mode. GA4 boots cookieless for an
 * undecided visitor, so traffic is counted without ePrivacy-relevant identifiers
 * until `grantAnalyticsConsent()`. `ad_*` stay denied permanently.
 *
 * Three ordering invariants, each verified in-browser:
 *  1. The `consent: 'default'` command must land ahead of the `config` command
 *     `getAnalytics` pushes, or `_ga` is written before the default applies.
 *     Firebase's own `setConsent` does not guarantee that ordering.
 *  2. The default is SEEDED from the stored decision, never hardcoded to denied:
 *     gtag drains the dataLayer in order, so a later `consent: 'update'` cannot
 *     retroactively attribute the `page_view` `config` already sent.
 *  3. The in-flight promise is memoised, not just the resolved instance —
 *     callers overlap and the instance guard sits before the first `await`.
 *
 * Idempotent; no-ops on the server, off the production hosts and where Analytics
 * is unsupported.
 */
export function initAnalytics(): Promise<void> {
	analyticsInit ??= (async () => {
		try {
			if (typeof window === 'undefined') return;
			// App Check is a security mechanism (legitimate interest), not analytics: it
			// runs in every environment and regardless of consent, hence before both gates.
			getApp();
			if (!isAnalyticsHost()) {
				console.info(
					`[firebase] Analytics off on ${window.location.hostname} (not a production host)`,
				);
				return;
			}
			const supported = await isSupported();
			if (!supported) return;
			consentGranted = readConsent() === 'accepted';
			gtag('consent', 'default', consentGranted ? GRANTED_CONSENT : DENIED_CONSENT);
			analyticsInstance = getAnalytics(getApp());
		} catch (err) {
			console.warn('[firebase] Analytics init failed:', err);
		}
	})();
	return analyticsInit;
}

/**
 * Send one `page_view`. Split out because consent grants need it too.
 * `page_referrer` is explicit: a soft navigation sends no referrer of its own, so
 * GA4 would otherwise read every in-site hop as a direct arrival.
 */
function sendPageView(referrer: string | undefined): void {
	if (!analyticsInstance) return;
	try {
		logEvent(analyticsInstance, 'page_view', {
			page_location: window.location.href,
			page_title: document.title,
			...(referrer ? { page_referrer: referrer } : {}),
		});
	} catch (err) {
		console.warn('[firebase] page_view failed:', err);
	}
}

/** URL of the last page reported, or `null` before the first report. */
let lastPageLocation: string | null = null;
/**
 * Record a `page_view` for the current URL.
 *
 * GA4's `config` fires exactly one `page_view`, for the document that loaded it,
 * and enhanced measurement does NOT pick up `<ClientRouter />`'s `history.pushState`
 * (verified: three navigations produced one `/g/collect` hit, pinned to the entry
 * URL). Without this every page after the entry page is uncounted.
 *
 * The first call is swallowed — `config` already reported that document load.
 */
export async function trackPageView(): Promise<void> {
	await initAnalytics();
	if (!analyticsInstance) return;
	const previous = lastPageLocation;
	lastPageLocation = window.location.href;
	if (previous === null) return;
	sendPageView(previous);
}

/**
 * Send a GA4 event. Boots Analytics first (idempotent) and never throws —
 * conversion tracking must not break the click or submit it is attached to.
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

/**
 * Upgrade Analytics consent to granted after the visitor accepts: a gtag
 * `consent: 'update'` flipping GA4 from cookieless pings to full measurement.
 * Only `analytics_storage` flips.
 *
 * It also re-sends the current page's `page_view`: the one GA4 sent at `config`
 * time went out cookieless and gtag never re-sends it, so an accepting visitor's
 * consent would otherwise produce nothing unless they navigated again. No-ops
 * when consent is already granted, which caps that re-send at one per visitor.
 */
export async function grantAnalyticsConsent(): Promise<void> {
	await initAnalytics();
	if (!analyticsInstance) return;
	if (consentGranted) return;
	consentGranted = true;
	try {
		gtag('consent', 'update', { analytics_storage: 'granted' });
	} catch (err) {
		console.warn('[firebase] Analytics consent grant failed:', err);
		return;
	}
	// Real document referrer here, not `lastPageLocation`: this re-reports the
	// current page, it is not a navigation.
	sendPageView(document.referrer || undefined);
	lastPageLocation = window.location.href;
}
