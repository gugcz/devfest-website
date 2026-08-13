/**
 * Project-wide Cloud Functions defaults, and the option presets every function
 * builds on.
 *
 * Imported FIRST from `index.ts` so `setGlobalOptions` runs before any
 * function factory (onCall/onRequest/onSchedule) executes — otherwise the
 * defaults wouldn't apply. ES modules evaluate imports in source order, so the
 * leading `import './options.js'` in the barrel guarantees this side effect
 * lands before the domain modules load.
 *
 * `maxInstances` is a cost ceiling: this codebase shares a billing project
 * with the mobile-app team, so a retry storm or the public `ticketsWebhook` flood
 * path must not be able to fan out unboundedly. Per-function overrides (e.g.
 * the tighter cap on `submitInvoiceCallable`) still win where set.
 *
 * The presets below exist so a function declares only what is genuinely
 * specific to it — its schedule, its secrets, its memory if unusual. Region and
 * timezone in particular were repeated in nine files, which is nine chances to
 * deploy a function into the wrong region. Spread a preset and override
 * deliberately:
 *
 *     export const thing = onSchedule(
 *         { ...SCHEDULED, schedule: 'every day 06:00', secrets: [FOO] },
 *         handler,
 *     );
 */

import { setGlobalOptions } from 'firebase-functions/v2';
import type { EventHandlerOptions } from 'firebase-functions/v2/options';
import type { CallableOptions, HttpsOptions } from 'firebase-functions/v2/https';
import type { ScheduleOptions } from 'firebase-functions/v2/scheduler';

setGlobalOptions({ maxInstances: 10 });

/** Every function in this codebase deploys here — closest region to the event. */
export const REGION = 'europe-west1';

/** Schedules are authored in local time; the event and its organizers are in Prague. */
export const TIME_ZONE = 'Europe/Prague';

/**
 * Scheduled jobs. `retryCount: 1` gives one platform-level retry, which covers
 * the class of fault that survives `fetchWithRetry`'s own attempts (an upstream
 * outage lasting seconds-to-minutes rather than milliseconds).
 */
export const SCHEDULED = {
	region: REGION,
	timeZone: TIME_ZONE,
	memory: '256MiB',
	timeoutSeconds: 120,
	retryCount: 1,
} satisfies Partial<ScheduleOptions>;

/**
 * The public, CDN-cached `/api/*` endpoints (`lineupApi`, `ticketsApi`).
 * `minInstances: 1` keeps one instance warm: a cold start here lands on the
 * critical path of a visitor's first uncached fetch, and the long edge TTLs make
 * traffic bursty enough that most misses would otherwise cold-start. It also
 * keeps each endpoint's in-instance memo alive between bursts.
 */
export const CACHED_ENDPOINT = {
	region: REGION,
	invoker: 'public',
	memory: '256MiB',
	timeoutSeconds: 30,
	minInstances: 1,
} satisfies Partial<HttpsOptions>;

/**
 * Public webhook receivers (`ticketsWebhook`). Public like the cached endpoints
 * — the external caller has no OIDC token, it authenticates by HMAC — but
 * deliberately WITHOUT `minInstances`: deliveries are rare, so a warm instance
 * would be paid for around the clock to save a cold start nobody is waiting on.
 */
export const WEBHOOK = {
	region: REGION,
	invoker: 'public',
	memory: '256MiB',
	timeoutSeconds: 30,
} satisfies Partial<HttpsOptions>;

/** Callables invoked by the browser (`submitInvoiceCallable`). */
export const CALLABLE = {
	region: REGION,
	memory: '256MiB',
	timeoutSeconds: 30,
} satisfies Partial<CallableOptions>;

/** Firestore/RTDB event triggers (`processInvoiceTrigger`). */
export const TRIGGER = {
	region: REGION,
	memory: '256MiB',
	timeoutSeconds: 120,
} satisfies Partial<EventHandlerOptions>;
