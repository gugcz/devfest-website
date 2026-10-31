/**
 * `workshopRegistrationCallable` — an attendee's own workshop sign-ups.
 *
 * Login is the mobile app's ticket login, reused as is: the browser calls the
 * app's `verifyRegistrationCodeCallable` (ti.to code → emailed six-digit code)
 * and `completeEmailVerificationCallable` (→ custom token), so a web sign-in
 * is the same Firebase account as the app's. Those callables write the
 * verified ticket onto Firestore `users/{uid}`; this one trusts nothing else.
 *
 * Actions: `status` (every open workshop with the caller's standing), `join`,
 * `leave`. Each answers with the full status, so the page never re-reads.
 */

import { logger } from 'firebase-functions/v2';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

import { db, firestore } from '../lib/admin.js';
import { describeError } from '../lib/errors.js';
import { CALLABLE } from '../options.js';
import { SITE_ORIGINS } from '../site.js';
import {
	parseLimit,
	seats,
	standing,
	WORKSHOPS_PATH,
	type Registration,
	type Standing,
	type WorkshopNode,
	type WorkshopSeats,
} from './roster.js';

// The mobile app's user collection (`COLLECTIONS.USERS` in the mobile app's
// repo, see CLAUDE.md, Firebase shared project).
const USERS = 'users';

type Action = 'status' | 'join' | 'leave';

interface Attendee {
	name: string;
	email: string;
	reference: string;
}

export interface WorkshopStatus extends WorkshopSeats {
	mine: Standing;
}

/** The caller's verified ticket, or a rejection when they hold none. */
async function attendee(uid: string): Promise<Attendee> {
	const snap = await firestore().collection(USERS).doc(uid).get();
	const data = snap.data() ?? {};
	const reference = typeof data.registrationReference === 'string' ? data.registrationReference : '';
	if (data.emailVerified !== true || !reference) {
		throw new HttpsError('permission-denied', 'no_ticket');
	}
	return {
		name: typeof data.name === 'string' ? data.name : '',
		email: typeof data.email === 'string' ? data.email : '',
		reference,
	};
}

function parseRequest(data: unknown): { action: Action; sessionId: string } {
	const body = (data ?? {}) as Record<string, unknown>;
	const action = body.action;
	const sessionId = typeof body.sessionId === 'string' ? body.sessionId.trim() : '';
	if (action !== 'status' && action !== 'join' && action !== 'leave') {
		throw new HttpsError('invalid-argument', 'action');
	}
	// Sessionize ids are short digit strings; anything path-like is refused.
	if (action !== 'status' && !/^[\w-]{1,64}$/.test(sessionId)) {
		throw new HttpsError('invalid-argument', 'sessionId');
	}
	return { action, sessionId };
}

async function join(uid: string, sessionId: string, who: Attendee): Promise<void> {
	const limit = await db().ref(`${WORKSHOPS_PATH}/${sessionId}/limit`).once('value');
	if (parseLimit(limit.val()) === null) throw new HttpsError('failed-precondition', 'closed');
	const entry: Registration = { at: Date.now(), ...who };
	// Keeps the first sign-up's `at`: joining twice must not lose a place in the queue.
	await db()
		.ref(`${WORKSHOPS_PATH}/${sessionId}/registrations/${uid}`)
		.transaction((current: unknown) => current ?? entry);
}

async function statusFor(uid: string): Promise<Record<string, WorkshopStatus>> {
	const snap = await db().ref(WORKSHOPS_PATH).once('value');
	const tree = (snap.val() ?? {}) as Record<string, WorkshopNode>;
	const out: Record<string, WorkshopStatus> = {};
	for (const [id, node] of Object.entries(tree)) {
		const s = seats(node ?? {});
		if (s) out[id] = { ...s, mine: standing(node, uid) };
	}
	return out;
}

export const workshopRegistrationCallable = onCall(
	{
		...CALLABLE,
		enforceAppCheck: true,
		cors: SITE_ORIGINS,
	},
	async (request) => {
		const uid = request.auth?.uid;
		if (!uid) throw new HttpsError('unauthenticated', 'sign_in');
		const { action, sessionId } = parseRequest(request.data);
		const who = await attendee(uid);

		try {
			if (action === 'join') await join(uid, sessionId, who);
			if (action === 'leave') await db().ref(`${WORKSHOPS_PATH}/${sessionId}/registrations/${uid}`).remove();
			return { name: who.name, workshops: await statusFor(uid) };
		} catch (err) {
			if (err instanceof HttpsError) throw err;
			logger.error(`workshopRegistrationCallable ${action} failed: ${describeError(err)}`, err);
			throw new HttpsError('internal', 'internal');
		}
	},
);
