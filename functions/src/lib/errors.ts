/**
 * Error description shared by every domain.
 *
 * The failure text these produce is what a human actually reads: it lands in
 * the Slack alerts (`🎤 SESSIONIZE`, `🧾 INVOICES`), in the `errorMessage`
 * persisted on an invoice doc, and in the Cloud Logging line. A production
 * incident showed how little that text can carry — the whole daily Sessionize
 * sync failed with `Sync failed: fetch failed`, which names neither the culprit
 * nor whether anything was lost, so triage started from zero.
 *
 * Two problems, one helper each:
 *   - the real reason hides one level down (`describeError`)
 *   - nothing says which step blew up (`stageError`)
 */

/**
 * Flatten an error into one diagnosable line.
 *
 * A bare `message` is routinely useless: undici reports every network-level
 * failure as `fetch failed` and hides the actual reason (`ENOTFOUND`,
 * `UND_ERR_CONNECT_TIMEOUT`, `ECONNRESET`, …) in `cause`, while Firestore/RTDB
 * gRPC errors carry theirs in `code`. So append whichever exists — unless the
 * message already leads with it, as gRPC's `7 PERMISSION_DENIED: …` does.
 * (An `AbortSignal.timeout` abort needs no unwrapping; its own message names
 * the timeout.)
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
 * `cause`. Without this an alert reads `Sync failed: 7 PERMISSION_DENIED` —
 * identical whether the fault was ours, Firestore's, or an upstream API's, and
 * those have completely different fixes. Use it at the boundary of any step a
 * responder would otherwise have to guess at:
 *
 *   throw stageError(`Firestore write to /${name}`, err);
 *   // → "Firestore write to /speakers failed: 7 PERMISSION_DENIED: …"
 */
export function stageError(stage: string, err: unknown): Error {
	return new Error(`${stage} failed: ${describeError(err)}`, { cause: err });
}
