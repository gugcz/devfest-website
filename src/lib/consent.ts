/**
 * Cookie-consent storage — single source of truth for the visitor's decision.
 * `CookieBanner.astro` writes; `src/lib/firebase.ts` reads it synchronously
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
