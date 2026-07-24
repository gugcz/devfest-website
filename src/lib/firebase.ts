import { initializeApp, type FirebaseApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaEnterpriseProvider, type AppCheck } from 'firebase/app-check';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';
import { getDatabase, type Database } from 'firebase/database';

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
 * Initialise Firebase App Check (reCAPTCHA Enterprise) so RTDB reads carry an
 * attestation token. Runs once, on the same FirebaseApp every consumer uses,
 * so the token is in place before `getDb()` issues any read.
 *
 * No-ops on the server and whenever no site key is configured. App Check tokens
 * attach to RTDB reads as soon as this runs, but reads keep working until
 * enforcement is switched on for Realtime Database in the Firebase console.
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

let databaseInstance: Database | null = null;
export function getDb(): Database {
	if (!databaseInstance) databaseInstance = getDatabase(getApp());
	return databaseInstance;
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
/**
 * Initialise Firebase Analytics (GA4) in Google Consent Mode with consent
 * DENIED by default, so GA4 boots cookieless: no `client_id`, no storage, only
 * aggregated identifier-free pings. That lets us count traffic from every
 * visitor — including those who never accept — while the ePrivacy-relevant
 * identifiers stay off until `grantAnalyticsConsent()`.
 *
 * The `consent: 'default'` command must land in the dataLayer *ahead of* the
 * `config` command that `getAnalytics` pushes, or GA4 writes `_ga` before the
 * default applies. Firebase's own `setConsent` does not guarantee that ordering
 * (verified: it leaves `_ga` set), so we push the default straight onto the
 * dataLayer via the gtag shim before `getAnalytics()` runs.
 *
 * `ad_*` stay denied permanently (we only ever measure analytics, never ads),
 * matching the cookie-banner copy. Idempotent; no-ops on the server and where
 * Analytics is unsupported.
 */
export async function initAnalytics(): Promise<void> {
	if (analyticsInstance) return;
	try {
		const supported = await isSupported();
		if (!supported) return;
		gtag('consent', 'default', DENIED_CONSENT);
		analyticsInstance = getAnalytics(getApp());
	} catch (err) {
		console.warn('[firebase] Analytics init failed:', err);
	}
}

/**
 * Upgrade Analytics consent to granted after the visitor accepts. Runs as a
 * gtag `consent: 'update'` (post-init), flipping GA4 from cookieless pings to
 * full measurement (`client_id` + storage). Only `analytics_storage` flips —
 * ad consent stays denied, since we never collect for advertising. Ensures the
 * SDK is initialised first so the update always lands on a live gtag.
 */
export async function grantAnalyticsConsent(): Promise<void> {
	await initAnalytics();
	if (!analyticsInstance) return;
	try {
		gtag('consent', 'update', { analytics_storage: 'granted' });
	} catch (err) {
		console.warn('[firebase] Analytics consent grant failed:', err);
	}
}
