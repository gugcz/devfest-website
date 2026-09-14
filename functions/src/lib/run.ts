/**
 * One way to run a background function (scheduled job or trigger), so every
 * one logs, alerts, and fails identically. Before this, several jobs failed
 * silently — a red line in Cloud Logging nobody watches. The contract:
 *
 *   1. start + finish lines with a duration, keyed by function name;
 *   2. a failure log carrying the unwrapped cause (`lib/errors.ts`);
 *   3. a Slack alert **on state change**, not per failure;
 *   4. the original error rethrown, so the platform counts it and the
 *      scheduler's retry still happens.
 *
 * **Alert on transition, not occurrence.** An hourly job in a three-hour
 * outage would otherwise post three identical alerts, and a channel that
 * cries wolf gets muted. First failure after a healthy run alerts, further
 * failures only log, the recovering run posts "recovered". One incident =
 * two messages.
 *
 * State lives in RTDB `ops/health/{name}` (Admin SDK; the root deny in
 * `database.rules.json` covers it). Every state op is best-effort and
 * degrades to "assume healthy" — over-alerts rather than going quiet.
 */

import { logger } from 'firebase-functions/v2';

import { db } from './admin.js';
import { describeError } from './errors.js';
import { SLACK_WEBHOOK_URL } from './params.js';
import { notify, type SlackDomain } from './slack.js';

const HEALTH_PATH = 'ops/health';

interface HealthState {
	failures: number;
	/** ms epoch of the first failure in the current streak. */
	since: number;
	lastError: string;
}

export interface BackgroundFunctionSpec {
	/** The exported function name — what a responder greps for in the logs. */
	name: string;
	/** Which Slack prefix its alerts post under. */
	domain: SlackDomain;
	/**
	 * Appended to the failure alert: what the reader should conclude about blast
	 * radius and what happens next (e.g. "live speakers/sessions left untouched,
	 * retry at 06:00"). Without it an alert says something broke but not whether
	 * anyone must act tonight.
	 */
	failureNote?: string;
}

function healthRef(name: string) {
	return db().ref(`${HEALTH_PATH}/${name}`);
}

async function readHealth(name: string): Promise<HealthState | null> {
	try {
		const snap = await healthRef(name).once('value');
		return (snap.val() as HealthState | null) ?? null;
	} catch (err) {
		// Assume healthy: the next failure alerts (possibly a duplicate) rather
		// than being suppressed by a state read we couldn't make.
		logger.warn(`${name} health read failed, assuming healthy: ${describeError(err)}`);
		return null;
	}
}

async function writeHealth(name: string, state: HealthState | null): Promise<void> {
	try {
		await (state ? healthRef(name).set(state) : healthRef(name).remove());
	} catch (err) {
		logger.warn(`${name} health write failed: ${describeError(err)}`, err);
	}
}

function formatSince(since: number): string {
	return new Date(since).toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
}

/**
 * Run a background handler under the shared logging + alerting contract.
 * Rethrows whatever the handler threw, unchanged.
 */
export async function runBackground(
	spec: BackgroundFunctionSpec,
	handler: () => Promise<void>,
): Promise<void> {
	const { name, domain, failureNote } = spec;
	const startedAt = Date.now();
	logger.info(`${name} started`);

	let previous: HealthState | null;
	try {
		await handler();
	} catch (err) {
		const message = describeError(err);
		logger.error(`${name} failed after ${Date.now() - startedAt}ms: ${message}`, err);

		previous = await readHealth(name);
		const failures = (previous?.failures ?? 0) + 1;
		const since = previous?.since ?? startedAt;
		await writeHealth(name, { failures, since, lastError: message });

		// First failure of a streak alerts; the rest only log. `failures === 1`
		// covers a fresh streak and a wiped/unreadable state alike.
		if (failures === 1) {
			await notify(
				domain,
				SLACK_WEBHOOK_URL.value(),
				`❌ \`${name}\` failed: ${message}${failureNote ? ` — ${failureNote}` : ''}`,
			);
		} else {
			logger.warn(`${name} still failing (${failures} consecutive), alert already sent`);
		}

		throw err;
	}

	logger.info(`${name} finished in ${Date.now() - startedAt}ms`);

	previous = await readHealth(name);
	if (previous) {
		await writeHealth(name, null);
		const runs = previous.failures === 1 ? 'run' : 'runs';
		await notify(
			domain,
			SLACK_WEBHOOK_URL.value(),
			`✅ \`${name}\` recovered after ${previous.failures} failed ${runs} (since ${formatSince(previous.since)}).`,
		);
	}
}
