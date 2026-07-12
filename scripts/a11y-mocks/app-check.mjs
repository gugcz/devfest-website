/**
 * No-op stand-in for `firebase/app-check`, wired in only under `A11Y_MOCK=1`
 * (see astro.config.mjs). The real reCAPTCHA Enterprise provider cannot mint a
 * token from headless Chromium on localhost and would spew warnings; this stub
 * keeps App Check init a silent no-op during the audit.
 */
export function initializeAppCheck() {
	return { __mock: 'app-check' };
}

export class ReCaptchaEnterpriseProvider {}
