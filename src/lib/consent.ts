/**
 * Cookie-consent storage — the single source of truth for the visitor's
 * decision.
 *
 * `CookieBanner.astro` owns the writes (Accept / Decline); `src/lib/firebase.ts`
 * reads it **synchronously, before Analytics boots**, to seed the Consent Mode
 * default (see `initAnalytics`). That ordering is why this lives in its own
 * module rather than inside the banner script: reading the decision must not
 * pull the Firebase SDK into the banner's bundle, and the Firebase module must
 * not have to reach back into the banner.
 */

export const CONSENT_KEY = 'cookie-consent';

export type ConsentDecision = 'accepted' | 'declined';

/**
 * The stored decision, or `null` when the visitor hasn't decided (or storage is
 * unavailable — Safari private mode, blocked cookies). Anything unrecognised is
 * treated as undecided, so a stale or hand-edited value can't be read as
 * consent.
 */
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
