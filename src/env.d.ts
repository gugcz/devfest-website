/// <reference types="astro/client" />

interface ImportMetaEnv {
	/**
	 * reCAPTCHA Enterprise key ID for Firebase App Check. App Check stays inert
	 * (no token attached to RTDB reads) while this is unset.
	 */
	readonly PUBLIC_FIREBASE_APPCHECK_SITE_KEY?: string;
	/**
	 * Local-only App Check debug token. Set to `true` to make the SDK print a
	 * token in the browser console (register it under App Check → Apps → Manage
	 * debug tokens), or paste an already-registered token string. Never set in
	 * production.
	 */
	readonly PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN?: string;
	/**
	 * Comma-separated hosts allowed to report into the production GA4 property,
	 * overriding the built-in `devfest.cz` list. Analytics stays off everywhere
	 * else (localhost, `*.web.app` preview channels) so development traffic can't
	 * pollute live numbers; set this to a preview host to measure there on purpose.
	 */
	readonly PUBLIC_ANALYTICS_ALLOWED_HOSTS?: string;
	/**
	 * Origin used to build absolute URLs that must resolve on the deployed
	 * site (e.g. the invite OG image), defaulting to `https://devfest.cz`.
	 * Set to a preview channel's URL to verify one of those URLs against
	 * that channel's own build instead of production.
	 */
	readonly PUBLIC_SITE_URL?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

interface Window {
	/** Firebase App Check debug-token hook (dev only). */
	FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean | string;
}
