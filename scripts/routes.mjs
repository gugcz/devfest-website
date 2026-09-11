/**
 * The full list of audited page routes, shared by the a11y sweep
 * (scripts/a11y.mjs) and the anchor-offset sweep (scripts/anchor-measure.mjs).
 * Previously declared twice (in a different order each time), which is how
 * `/agenda` went missing from `astro.config.mjs`'s sitemap-priority map
 * without either audit script — the one place that would have caught it —
 * ever cross-checking against the same list.
 */
export const AUDIT_ROUTES = [
	'/',
	'/speakers/',
	'/sessions/',
	'/agenda/',
	'/team/',
	'/partners/',
	'/contact/',
	'/faq/',
	'/press/',
	'/press/downloads/',
	'/invoice/',
	'/privacy-policy/',
	'/newsletter-subscription-thank-you/',
	'/thank-you/',
	'/404.html',
];
