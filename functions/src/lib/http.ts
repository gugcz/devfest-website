/**
 * Outbound HTTP shared by every domain: Sessionize, ti.to, iDoklad, Slack,
 * Resend.
 *
 * Two things every one of those calls needs and none of them used to have
 * consistently:
 *
 *  1. **A timeout.** A plain `fetch()` has none, so a hung upstream connection
 *     rides the whole function timeout (up to 300s on the schedulers) before
 *     failing — burning the invocation and, on a scheduler, the retry window.
 *  2. **Retries on transient faults.** A single blip used to cost a whole run.
 *     Observed in production: `refreshSessionizeScheduled` died ~10.7s in with
 *     a bare `fetch failed` — undici's shape for a connect-level fault, timed
 *     to its 10s connect timeout — and the day's lineup never synced.
 *
 * **Retries are off by default for anything that isn't idempotent.** Retrying a
 * POST can mint a second invoice, a second discount code, or a second email —
 * failures where the second attempt costs real money. `GET`/`HEAD` retry
 * automatically; everything else retries only when the caller passes
 * `retryUnsafe`, which it should do only when a duplicate is harmless (a Slack
 * line, an OAuth token fetch).
 *
 * Failures throw with the label, the attempt count, and the unwrapped cause, so
 * the Slack alert reads `ti.to releases unreachable after 3 attempts: fetch
 * failed (UND_ERR_CONNECT_TIMEOUT)` instead of `fetch failed`.
 */

import { logger } from 'firebase-functions/v2';

import { describeError } from './errors.js';

/** Per-attempt ceiling. Generous for an API call, far below any function timeout. */
export const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_ATTEMPTS = 3;
/** Backoff before attempt N+1: 1s, then 2s. */
const RETRY_BASE_DELAY_MS = 1_000;
/** Methods safe to replay. A retried GET can only cost a duplicate read. */
const IDEMPOTENT_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface FetchOptions {
	/** Human name of the call, used verbatim in logs and error text (e.g. `ti.to releases`). */
	label: string;
	/** Attempts before giving up. Defaults to 3 for retryable calls, 1 otherwise. */
	attempts?: number;
	/** Per-attempt timeout. */
	timeoutMs?: number;
	/**
	 * Retry a non-idempotent request. Pass ONLY where a duplicate delivery is
	 * harmless — never on a call that creates an invoice, a discount code, or
	 * sends mail.
	 */
	retryUnsafe?: boolean;
}

/**
 * Worth retrying: rate limiting or a server-side hiccup. A 4xx is deterministic
 * (bad token, wrong path, a Sessionize view this endpoint doesn't serve) — the
 * caller must see it immediately rather than burn the backoff on a verdict that
 * won't change.
 */
export function isTransientStatus(status: number): boolean {
	return status === 429 || status >= 500;
}

/** Read a failed response's body for an error message, capped and never throwing. */
export async function errorBody(res: Response, max = 300): Promise<string> {
	const body = await res.text().catch(() => '');
	return body.slice(0, max);
}

/**
 * `fetch` with a timeout, bounded retries, and a diagnosable failure.
 *
 * Returns the response even when it is non-OK (including a 5xx that survived
 * every attempt) — status handling stays with the caller, which knows whether a
 * 400 means "fall back to the other view" or "abort". Throws only when no
 * attempt produced a response at all.
 */
export async function fetchWithRetry(
	url: string,
	init: RequestInit = {},
	opts: FetchOptions,
): Promise<Response> {
	const method = (init.method ?? 'GET').toUpperCase();
	const retryable = opts.retryUnsafe === true || IDEMPOTENT_METHODS.has(method);
	// A non-idempotent call is pinned to a single attempt even if the caller asks
	// for more — opting into duplicate side effects has to be explicit.
	const attempts = retryable ? (opts.attempts ?? DEFAULT_ATTEMPTS) : 1;
	const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
	let lastError: unknown;

	for (let attempt = 1; attempt <= attempts; attempt++) {
		try {
			const res = await fetch(url, {
				...init,
				signal: AbortSignal.timeout(timeoutMs),
			});
			if (res.ok || !isTransientStatus(res.status) || attempt === attempts) return res;
			logger.warn(
				`${opts.label} returned ${res.status} (attempt ${attempt}/${attempts}), retrying`,
			);
		} catch (err) {
			lastError = err;
			if (attempt === attempts) break;
			logger.warn(
				`${opts.label} request failed (attempt ${attempt}/${attempts}), retrying: ${describeError(err)}`,
			);
		}
		await sleep(RETRY_BASE_DELAY_MS * 2 ** (attempt - 1));
	}

	const suffix = attempts > 1 ? ` after ${attempts} attempts` : '';
	throw new Error(`${opts.label} unreachable${suffix}: ${describeError(lastError)}`, {
		cause: lastError,
	});
}
