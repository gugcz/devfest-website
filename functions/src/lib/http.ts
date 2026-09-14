/**
 * Outbound HTTP shared by every domain. A bare `fetch()` in `functions/` is
 * a bug: no timeout (a hung upstream rides the whole function timeout) and
 * no retry (one connect blip once killed a day's Sessionize sync).
 *
 * **Retries are off for anything non-idempotent**, enforced here: a retried
 * POST can mint a second invoice, code or email. `GET`/`HEAD` retry
 * automatically; everything else needs `retryUnsafe` (only Slack and the
 * OAuth token fetch pass it).
 *
 * Failures throw with label, attempt count and unwrapped cause:
 * `ti.to releases unreachable after 3 attempts: fetch failed
 * (UND_ERR_CONNECT_TIMEOUT)`.
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
