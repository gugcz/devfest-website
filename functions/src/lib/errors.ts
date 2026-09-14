/** Error description for Slack alerts, `errorMessage` and Cloud Logging.
 * `describeError` unwraps the real reason; `stageError` names the step. */

/** One diagnosable line. undici hides the reason (`ENOTFOUND`, …) in
 * `cause` behind `fetch failed`; gRPC uses `code`. Append whichever exists
 * unless the message already leads with it. */
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

/** Label a failure with its step, keeping the original as `cause`:
 * `stageError(\`Firestore write to /${name}\`, err)` →
 * "Firestore write to /speakers failed: 7 PERMISSION_DENIED: …" */
export function stageError(stage: string, err: unknown): Error {
	return new Error(`${stage} failed: ${describeError(err)}`, { cause: err });
}
