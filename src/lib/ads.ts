/**
 * The ad tags: Meta Pixel and the LinkedIn Insight Tag. Nothing loads and
 * nothing is sent until the visitor picks "Allow all" (`accepted-marketing`).
 * Same gates as GA4 (`tracking-gates.ts`): production hosts only, never on
 * `/login/<code>`. The ids come from build-time env vars and never live in
 * the repo; a build without them loads no tag. Rules:
 * `.claude/rules/analytics.md` ("Ad tags").
 */
import { adEventsFor, parseConversionIds } from './ad-events';
import { hasMarketingConsent } from './consent';
import { isAppLinkPath, isTrackingHost } from './tracking-gates';

const META_PIXEL_ID = import.meta.env.PUBLIC_META_PIXEL_ID?.trim() ?? '';
const LINKEDIN_PARTNER_ID = import.meta.env.PUBLIC_LINKEDIN_PARTNER_ID?.trim() ?? '';
const LINKEDIN_CONVERSION_IDS = parseConversionIds(
	import.meta.env.PUBLIC_LINKEDIN_CONVERSION_IDS ?? '',
);

type Queued = ((...args: unknown[]) => void) & Record<string, unknown>;
type AdWindow = Window & {
	fbq?: Queued;
	_fbq?: Queued;
	lintrk?: Queued;
	_linkedin_partner_id?: string;
	_linkedin_data_partner_ids?: string[];
};

/** Which tags booted, or `null` while not booted. */
let booted: { meta: boolean; linkedin: boolean } | null = null;
/** URL of the last page reported, so a page is counted once. */
let lastPageLocation: string | null = null;
/** The Insight Tag's script has run: until then it will count the page it
 * loads on by itself, so a soft navigation is not ours to report yet. */
let linkedInLoaded = false;

/** Load a tag's script right away (async). Not on idle: a tag reads the page
 * URL when its script runs, so the sooner, the likelier it is still the
 * page the visitor accepted on. */
function addScript(src: string, onload?: () => void): void {
	const script = document.createElement('script');
	script.async = true;
	script.src = src;
	if (onload) script.addEventListener('load', onload);
	document.head.append(script);
}

/** Meta's queue stub (the official snippet, typed): calls made before
 * `fbevents.js` arrives are replayed by it. Like gtag, it queues the
 * `arguments` object; keep it that way rather than a rest array. */
function bootMeta(w: AdWindow): void {
	if (!w.fbq) {
		const fbq = function (this: unknown) {
			/* eslint-disable prefer-rest-params */
			if (typeof fbq.callMethod === 'function') {
				(fbq.callMethod as (...a: unknown[]) => void).apply(fbq, arguments as unknown as unknown[]);
			} else (fbq.queue as unknown[]).push(arguments);
			/* eslint-enable prefer-rest-params */
		} as Queued;
		Object.assign(fbq, { push: fbq, loaded: true, version: '2.0', queue: [] });
		w.fbq = fbq;
		w._fbq = fbq;
	}
	// We send every page view ourselves, so the pixel never reports a
	// `pushState` on its own: that would include `/login/<code>`.
	w.fbq.disablePushState = true;
	w.fbq('init', META_PIXEL_ID);
	addScript('https://connect.facebook.net/en_US/fbevents.js');
}

/** LinkedIn's queue stub (the official snippet, typed). The tag counts the
 * page it loads on by itself. */
function bootLinkedIn(w: AdWindow): void {
	w._linkedin_partner_id = LINKEDIN_PARTNER_ID;
	w._linkedin_data_partner_ids = w._linkedin_data_partner_ids ?? [];
	w._linkedin_data_partner_ids.push(LINKEDIN_PARTNER_ID);
	if (!w.lintrk) {
		const lintrk = function (...args: unknown[]) {
			(lintrk.q as unknown[]).push(args);
		} as Queued;
		lintrk.q = [];
		w.lintrk = lintrk;
	}
	addScript('https://snap.licdn.com/li.lms-analytics/insight.min.js', () => {
		linkedInLoaded = true;
	});
}

/**
 * Boot the ad tags once, after "Allow all". Safe to call on every page; the
 * consent and `/login/` gates sit before the memo, so an early call does not
 * pin "not booted" for the accept or the navigation that follows.
 */
export function initAds(): boolean {
	if (typeof window === 'undefined') return false;
	if (!hasMarketingConsent() || isAppLinkPath(window.location.pathname)) return false;
	if (!booted) {
		const host = isTrackingHost(
			window.location.hostname,
			import.meta.env.PUBLIC_ANALYTICS_ALLOWED_HOSTS,
		);
		const w = window as AdWindow;
		booted = {
			meta: host && META_PIXEL_ID !== '',
			linkedin: host && LINKEDIN_PARTNER_ID !== '',
		};
		if (booted.meta) bootMeta(w);
		if (booted.linkedin) bootLinkedIn(w);
		if (!booted.meta && !booted.linkedin) {
			console.info(`[ads] Ad tags off on ${window.location.hostname}`);
		}
	}
	return booted.meta || booted.linkedin;
}

/** Count the current page. Runs on every `astro:page-load`; a no-op until
 * "Allow all", on `/login/<code>`, and for a page already counted. */
export function trackAdPageView(): void {
	if (!initAds() || !booted) return;
	const here = window.location.href;
	if (here === lastPageLocation) return;
	lastPageLocation = here;
	const w = window as AdWindow;
	if (booted.meta) w.fbq?.('track', 'PageView');
	// The Insight Tag counts the page it loads on; only soft navigations
	// after that are ours to report.
	if (booted.linkedin && linkedInLoaded) w.lintrk?.('track');
}

/** Forward one of our events to the ad tags that listen for it. Never
 * throws: tracking must not break the click it is attached to. */
export function trackAdEvent(name: string, params?: Record<string, unknown>): void {
	try {
		if (!initAds() || !booted) return;
		const w = window as AdWindow;
		for (const call of adEventsFor(name, params, LINKEDIN_CONVERSION_IDS)) {
			if (call.tag === 'meta' && booted.meta) {
				if (call.params) w.fbq?.('track', call.event, call.params);
				else w.fbq?.('track', call.event);
			}
			if (call.tag === 'linkedin' && booted.linkedin) {
				w.lintrk?.('track', { conversion_id: call.conversionId });
			}
		}
	} catch (err) {
		console.warn(`[ads] event ${name} failed:`, err);
	}
}
