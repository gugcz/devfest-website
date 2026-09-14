/**
 * Outbound HTTP for every domain — a bare `fetch()` has no timeout and no
 * retry. Non-idempotent requests never retry (a retried POST can mint a
 * second invoice); `GET`/`HEAD` do, others need `retryUnsafe`. Failures
 * throw with label, attempts and unwrapped cause.
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

/** Retry 429/5xx only. A 4xx is deterministic; the caller must see it now. */
export function isTransientStatus(status: number): boolean {
	return status === 429 || status >= 500;
}

/** Read a failed response's body for an error message, capped and never throwing. */
export async function errorBody(res: Response, max = 300): Promise<string> {
	const body = await res.text().catch(() => '');
	return body.slice(0, max);
}

/** `fetch` with timeout, bounded retries and a diagnosable failure. Returns
 * non-OK responses (status handling stays with the caller); throws only when
 * no attempt produced a response. */
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
