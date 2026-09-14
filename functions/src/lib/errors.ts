/**
 * Error description shared by every domain. The text lands in Slack alerts,
 * an invoice doc's `errorMessage`, and Cloud Logging — a daily sync once
 * failed with just `Sync failed: fetch failed`, so triage started from zero.
 *
 *   - the real reason hides one level down → `describeError`
 *   - nothing says which step blew up → `stageError`
 */

/**
 * Flatten an error into one diagnosable line. undici reports every network
 * fault as `fetch failed` and hides the reason (`ENOTFOUND`,
 * `UND_ERR_CONNECT_TIMEOUT`, …) in `cause`; gRPC carries its status in
 * `code`. Append whichever exists, unless the message already leads with it
 * (gRPC's `7 PERMISSION_DENIED: …`).
 */
export function describeError(err: unknown): string {
	const error = err as {
		message?: string;
		code?: string | number;
		cause?: unknown;
	};
	const message = error?.message || String(err);
	const cause = error?.cause as { code?: string; message?: string } | undefined;
	const detail = cause?.code || cause?.message || error?.code;
	if (detail == null) return message;
	const text = String(detail);
	return message.includes(text) ? message : `${message} (${text})`;
}

/**
 * Label a failure with the step it happened in, keeping the original as
 * `cause` — otherwise `Sync failed: 7 PERMISSION_DENIED` reads the same
 * whether the fault was ours, Firestore's, or upstream's.
 *
 *   throw stageError(`Firestore write to /${name}`, err);
 *   // → "Firestore write to /speakers failed: 7 PERMISSION_DENIED: …"
 */
export function stageError(stage: string, err: unknown): Error {
	return new Error(`${stage} failed: ${describeError(err)}`, { cause: err });
}
