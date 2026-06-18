import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getToken, initializeAppCheck, ReCaptchaEnterpriseProvider, type AppCheck } from 'firebase/app-check';
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
 * Current App Check token, to attach as `X-Firebase-AppCheck` on calls to
 * our own HTTPS functions (e.g. `submitInvoiceRequest`). Returns null when
 * App Check is unavailable (SSR, no site key, or init failed) so callers
 * can still POST — enforcement lives server-side.
 */
export async function getAppCheckToken(): Promise<string | null> {
	getApp(); // ensures initAppCheck() has run
	if (!appCheckInstance) return null;
	try {
		const { token } = await getToken(appCheckInstance, /* forceRefresh */ false);
		return token;
	} catch (err) {
		console.warn('[firebase] App Check token failed:', err);
		return null;
	}
}

let analyticsInstance: Analytics | null = null;
export async function initAnalytics(): Promise<void> {
	if (analyticsInstance) return;
	try {
		const supported = await isSupported();
		if (supported) {
			analyticsInstance = getAnalytics(getApp());
		}
	} catch (err) {
		console.warn('[firebase] Analytics init failed:', err);
	}
}
