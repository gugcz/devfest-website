/**
 * Cloud Functions defaults and per-kind option presets. Imported FIRST from
 * `index.ts` so `setGlobalOptions` runs before any function factory.
 * `maxInstances` is a cost ceiling on the shared billing project. Spread a
 * preset and override only what is specific:
 *
 *     onSchedule({ ...SCHEDULED, schedule: 'every day 06:00', secrets: [FOO] }, handler)
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

/** Public CDN-cached `/api/*` endpoints. Scale-to-zero (edge TTLs absorb
 * nearly all traffic); `ticketsApi` overrides with `minInstances: 1`. */
export const CACHED_ENDPOINT = {
	region: REGION,
	invoker: 'public',
	memory: '256MiB',
	timeoutSeconds: 30,
} satisfies Partial<HttpsOptions>;

/**
 * Public webhook receivers (`ticketsWebhook`). Public like the cached endpoints
 * — the external caller has no OIDC token, it authenticates by HMAC. Also
 * scale-to-zero: deliveries are rare and nobody waits on a cold start.
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
