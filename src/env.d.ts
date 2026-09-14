/// <reference types="astro/client" />

interface ImportMetaEnv {
	/**
	 * reCAPTCHA Enterprise key ID for Firebase App Check. App Check stays inert
	 * (no token attached to RTDB reads) while this is unset.
	 */
	readonly PUBLIC_FIREBASE_APPCHECK_SITE_KEY?: string;
	/** Local-only App Check debug token: `true` prints one to the console
	 * (register under App Check → Manage debug tokens), or a registered string. */
	readonly PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN?: string;
	/** Comma-separated hosts allowed to report into production GA4, overriding
	 * the `devfest.cz` list. Set to a preview host to measure it on purpose. */
	readonly PUBLIC_ANALYTICS_ALLOWED_HOSTS?: string;
	/** Origin for absolute URLs (e.g. the invite OG image); default
	 * `https://devfest.cz`. Set to a preview channel to verify against it. */
	readonly PUBLIC_SITE_URL?: string;
	/** ti.to discount checkout URL for the invite CTA (GitHub Actions secret).
	 * Empty → `InviteCta` resolves the plain checkout from `/api/tickets`. */
	readonly PUBLIC_INVITE_DISCOUNT_URL?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

interface Window {
	/** Firebase App Check debug-token hook (dev only). */
	FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean | string;
}
