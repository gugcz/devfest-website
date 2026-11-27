/**
 * Cookie-consent storage — single source of truth for the visitor's decision.
 * `cookie-banner.ts` writes and clears; `src/lib/firebase.ts` (analytics) and
 * `src/lib/ads.ts` (the ad tags) read it synchronously before they boot. Its
 * own module so neither side has to import the other.
 */

export const CONSENT_KEY = 'cookie-consent';

/**
 * - `accepted`: analytics only (GA4, Performance Monitoring, Crashlytics).
 *   Every decision stored before the ad tags existed means this, so an old
 *   accept never turns into an ads consent.
 * - `accepted-marketing`: analytics plus the ad tags (Meta, LinkedIn).
 * - `declined`: nothing.
 */
export type ConsentDecision = 'accepted' | 'accepted-marketing' | 'declined';

const DECISIONS: readonly string[] = ['accepted', 'accepted-marketing', 'declined'];

/** The stored decision, or `null` (undecided, storage unavailable, or an
 * unrecognised value — never read as consent). */
export function readConsent(): ConsentDecision | null {
	try {
		const raw = localStorage.getItem(CONSENT_KEY);
		return raw !== null && DECISIONS.includes(raw) ? (raw as ConsentDecision) : null;
	} catch {
		return null;
	}
}

/** Analytics may run: either accept. */
export function hasAnalyticsConsent(): boolean {
	const decision = readConsent();
	return decision === 'accepted' || decision === 'accepted-marketing';
}

/** The ad tags may run: only "Allow all". */
export function hasMarketingConsent(): boolean {
	return readConsent() === 'accepted-marketing';
}

/** Persist the visitor's decision. Best-effort — storage may be unavailable. */
export function storeConsent(value: ConsentDecision): void {
	try {
		localStorage.setItem(CONSENT_KEY, value);
	} catch {
		/* storage unavailable — the banner just shows again next visit */
	}
}

/** Forget the decision, so the banner asks again. */
export function clearConsent(): void {
	try {
		localStorage.removeItem(CONSENT_KEY);
	} catch {
		/* storage unavailable — nothing was stored */
	}
}

/** Every domain a cookie set on `hostname` can live on: the host itself and
 * each parent (GA4's `cookie_domain: 'auto'` picks the widest one it can). */
export function cookieDomains(hostname: string): string[] {
	const labels = hostname.split('.');
	return labels.slice(0, -1).map((_, i) => labels.slice(i).join('.'));
}

/** Expire every cookie whose name `matches`, on the host and each parent
 * domain (a tag may pick the widest one it can). */
function expireCookies(matches: (name: string) => boolean): void {
	const names = document.cookie
		.split(';')
		.map((pair) => pair.split('=')[0].trim())
		.filter((name) => name && matches(name));
	for (const name of names) {
		document.cookie = `${name}=; Max-Age=0; path=/`;
		for (const domain of cookieDomains(location.hostname)) {
			document.cookie = `${name}=; Max-Age=0; path=/; domain=${domain}`;
		}
	}
}

/** First-party cookies the ad tags set on our domain: Meta's browser and
 * click ids, LinkedIn's click id and member-group ids. LinkedIn's own
 * cookies live on linkedin.com, out of our reach (privacy policy §3). */
export const MARKETING_COOKIES = ['_fbp', '_fbc', 'li_fat_id', 'li_giant', 'ln_or'];

/** Delete what an "Allow all" left behind: the first-party ad cookies and
 * LinkedIn's Ads id (`li_adsId`) in localStorage. Never throws. Like
 * `deleteAnalyticsData()`, the caller reloads, because the tags in memory
 * can write again. */
export function deleteMarketingData(): void {
	expireCookies((name) => MARKETING_COOKIES.includes(name));
	try {
		localStorage.removeItem('li_adsId');
	} catch {
		/* storage unavailable — nothing was stored */
	}
}

/** Delete what an accept left behind: the `_ga` cookies, the installation id
 * Performance Monitoring and Crashlytics share (IndexedDB), Performance's
 * cached remote config and Crashlytics' session id.
 * Never throws. The SDKs already in memory stay loaded (and can write again
 * or hold the database open), so the caller reloads and runs this once more
 * on the fresh page, where nothing has booted. */
export async function deleteAnalyticsData(): Promise<void> {
	expireCookies((name) => name === '_ga' || name.startsWith('_ga_'));
	try {
		localStorage.removeItem('@firebase/performance/config');
		localStorage.removeItem('@firebase/performance/configexpire');
	} catch {
		/* storage unavailable — nothing was stored */
	}
	try {
		sessionStorage.removeItem('firebasecrashlytics.sessionid');
	} catch {
		/* storage unavailable — nothing was stored */
	}
	await new Promise<void>((resolve) => {
		try {
			const request = indexedDB.deleteDatabase('firebase-installations-database');
			// `blocked`: a connection is still open in this page; the run on the
			// fresh page finishes the delete.
			request.onsuccess = request.onerror = request.onblocked = () => resolve();
		} catch {
			resolve(); // IndexedDB unavailable (blocked storage): nothing stored
		}
	});
}
