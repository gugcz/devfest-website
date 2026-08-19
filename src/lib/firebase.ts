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

// reCAPTCHA Enterprise key ID. Public, like the Firebase `apiKey` above — safe
// to commit. Used as the default App Check key; PUBLIC_FIREBASE_APPCHECK_SITE_KEY
// overrides it (e.g. a separate key per environment).
const APPCHECK_SITE_KEY = '6LdOhSYtAAAAALPcqSZIJoT7i7c6B5SOiByWChra';

let appCheckInstance: AppCheck | null = null;
/**
 * Initialise Firebase App Check (reCAPTCHA Enterprise). Runs once, on the same
 * FirebaseApp every consumer uses, so the token is in place before the App-Check-
 * enforced `submitInvoiceCallable` callable fires. No content read goes through
 * the Firebase SDK anymore (speakers/sessions/tickets all fetch cached `/api/*`
 * endpoints), so this only matters for the invoice callable.
 *
 * No-ops on the server and whenever no site key is configured.
 */
function initAppCheck(app: FirebaseApp): void {
	if (appCheckInstance) return;
	if (typeof window === 'undefined') return;

	const siteKey = import.meta.env.PUBLIC_FIREBASE_APPCHECK_SITE_KEY ?? APPCHECK_SITE_KEY;
	if (!siteKey) return;

	// Local dev / preview: register a debug token so reCAPTCHA isn't required on
	// localhost. `true` makes the SDK print a token to the console (paste it into
	// App Check → Apps → Manage debug tokens); a string reuses that token.
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


/**
 * The initialised FirebaseApp (App Check already wired). Used by callers
 * that need a Firebase product on the same app — e.g. `getFunctions(app)`
 * for `httpsCallable`, which auto-attaches the App Check token.
 */
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
 * committed, so without this gate `npm run dev` and every Firebase Hosting
 * preview channel (`*.web.app`) would mix development traffic into the live
 * numbers. Matches the host itself and any subdomain of it.
 *
 * `PUBLIC_ANALYTICS_ALLOWED_HOSTS` (comma-separated) overrides the list — set it
 * to a preview host when you deliberately want to verify measurement there.
 *
 * The two Firebase Hosting default domains are the *live* site too (Hosting
 * always serves them), so they stay in. Preview channels are a different
 * hostname (`devfest-public--<channel>.web.app`), not a subdomain of these, so
 * the exact/subdomain match below keeps them out.
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
 * consent/config commands from the `arguments` object its canonical shim pushes
 * — a plain array is silently ignored (verified: the consent default is skipped
 * and `_ga` still gets written). So this mirrors Google's snippet exactly,
 * forwarding `arguments` rather than a rest array. Declared param-less (keeps
 * `arguments` unambiguous) and cast for variadic call sites.
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
 * Initialise Firebase Analytics (GA4) in Google Consent Mode. GA4 boots
 * cookieless for an undecided visitor: no `client_id`, no storage, only
 * aggregated identifier-free pings. That lets us count traffic from every
 * visitor — including those who never accept — while the ePrivacy-relevant
 * identifiers stay off until `grantAnalyticsConsent()`.
 *
 * The default is **seeded from the stored decision**, not hardcoded to denied.
 * A returning visitor who already accepted must boot straight into granted:
 * gtag processes the dataLayer in order, so a later `consent: 'update'` cannot
 * retroactively attribute the `page_view` that the `config` command already
 * sent. Booting denied and upgrading afterwards left every accepted visitor's
 * entry page_view without a `client_id` — for a single-page visit that means no
 * attributed session at all.
 *
 * The `consent: 'default'` command must land in the dataLayer *ahead of* the
 * `config` command that `getAnalytics` pushes, or GA4 writes `_ga` before the
 * default applies. Firebase's own `setConsent` does not guarantee that ordering
 * (verified: it leaves `_ga` set), so we push the default straight onto the
 * dataLayer via the gtag shim before `getAnalytics()` runs.
 *
 * `ad_*` stay denied permanently (we only ever measure analytics, never ads),
 * matching the cookie-banner copy. Idempotent; no-ops on the server, off the
 * production hosts, and where Analytics is unsupported.
 *
 * The in-flight promise is memoised, not just the resolved instance: callers
 * overlap (the banner boots Analytics while a stored `accepted` grants consent
 * in the same tick), and a plain `if (analyticsInstance)` guard is checked
 * *before* the first `await`, so both callers would sail past it and push the
 * consent default twice.
 */
export function initAnalytics(): Promise<void> {
	analyticsInit ??= (async () => {
		try {
			if (typeof window === 'undefined') return;
			// App Check is a security mechanism (legitimate interest), not
			// analytics: it initialises on load in *every* environment and
			// regardless of cookie consent, so the token is ready before the
			// invoice callable fires. Hence before both gates below.
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
 * Send one `page_view`. Split out of `trackPageView` because consent grants
 * need it too (see `grantAnalyticsConsent`). `page_referrer` is explicit: on a
 * soft navigation the browser sends no referrer of its own, so without it GA4
 * would attribute the hit as if the visitor arrived from nowhere.
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
 * GA4's own `config` command fires exactly one `page_view`, for the document
 * that loaded it. `<ClientRouter />` then swaps every subsequent page in via
 * `history.pushState` without a document load, and GA4's enhanced-measurement
 * "page changes based on browser history events" does not cover it (verified:
 * `history.pushState` is left un-patched, and three navigations produced a
 * single `/g/collect` hit pinned to the entry URL). So every page after the
 * first went uncounted; this sends them explicitly.
 *
 * The first call is therefore swallowed — it corresponds to the document load
 * that `config` already reported, and re-sending it would double-count the
 * entry page. Every later call reports the previous URL as `page_referrer`, so
 * the in-site path stays visible in GA4. Runs for every visitor: under denied
 * consent the hit is the same cookieless identifier-free ping GA4 already sends.
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
 * conversion tracking must not be able to break the click or form submit it is
 * attached to. Runs for every visitor: under denied consent it is the same
 * cookieless, identifier-free ping GA4 already sends for page views.
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
 * Upgrade Analytics consent to granted after the visitor accepts. Runs as a
 * gtag `consent: 'update'` (post-init), flipping GA4 from cookieless pings to
 * full measurement (`client_id` + storage). Only `analytics_storage` flips —
 * ad consent stays denied, since we never collect for advertising. Ensures the
 * SDK is initialised first so the update always lands on a live gtag.
 *
 * A `page_view` for the current page follows the update. The one GA4 sent at
 * `config` time went out under denied consent — cookieless, with no
 * `client_id` — and gtag never re-sends it, so without this the visitor's
 * consent would produce nothing at all unless they happened to navigate again.
 *
 * No-ops when consent is already granted (a returning visitor boots straight
 * into granted via the seeded default), which is what keeps the re-sent
 * `page_view` to at most one per visitor.
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
	// Real document referrer here (not `lastPageLocation`): this re-reports the
	// current page, it is not a navigation.
	sendPageView(document.referrer || undefined);
	lastPageLocation = window.location.href;
}
