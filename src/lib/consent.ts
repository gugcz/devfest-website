/**
 * Cookie-consent storage — single source of truth for the visitor's decision.
 * `CookieBanner.astro` writes and clears; `src/lib/firebase.ts` reads it synchronously
 * before Analytics boots to seed the Consent Mode default. Its own module so
 * neither side has to import the other.
 */

export const CONSENT_KEY = 'cookie-consent';

export type ConsentDecision = 'accepted' | 'declined';

/** The stored decision, or `null` (undecided, storage unavailable, or an
 * unrecognised value — never read as consent). */
export function readConsent(): ConsentDecision | null {
	try {
		const raw = localStorage.getItem(CONSENT_KEY);
		return raw === 'accepted' || raw === 'declined' ? raw : null;
	} catch {
		return null;
	}
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

/** Delete what an accept left behind: the `_ga` cookies, Performance
 * Monitoring's installation id (IndexedDB) and its cached remote config. The
 * SDKs already in memory stay loaded, so the caller reloads the page. */
export async function deleteAnalyticsData(): Promise<void> {
	const names = document.cookie
		.split(';')
		.map((pair) => pair.split('=')[0].trim())
		.filter((name) => name === '_ga' || name.startsWith('_ga_'));
	for (const name of names) {
		document.cookie = `${name}=; Max-Age=0; path=/`;
		for (const domain of cookieDomains(location.hostname)) {
			document.cookie = `${name}=; Max-Age=0; path=/; domain=${domain}`;
		}
	}
	try {
		localStorage.removeItem('@firebase/performance/config');
		localStorage.removeItem('@firebase/performance/configexpire');
	} catch {
		/* storage unavailable — nothing was stored */
	}
	await new Promise<void>((resolve) => {
		const request = indexedDB.deleteDatabase('firebase-installations-database');
		// `blocked` (a connection still open in this page) resolves too: the
		// delete completes once the reload closes it.
		request.onsuccess = request.onerror = request.onblocked = () => resolve();
	});
}
