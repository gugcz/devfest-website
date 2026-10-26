/**
 * Workshop registration, browser side.
 *
 * Seats come from the cached `/api/workshops` (plain `fetch()`). Signing in is
 * the mobile app's ticket login, called as is: `verifyRegistrationCodeCallable`
 * emails a six-digit code to the ticket's address, and
 * `completeEmailVerificationCallable` trades it for a custom token. The web
 * session is therefore the same Firebase account the app uses. Sign-ups go
 * through `workshopRegistrationCallable` (functions/src/workshops/register.ts).
 *
 * Firebase Auth and Functions load lazily, on the registration page only.
 */
import type { Auth, User } from 'firebase/auth';

const FUNCTIONS_REGION = 'europe-west1';

export interface WorkshopSeats {
	limit: number;
	taken: number;
	waiting: number;
}

export type Standing = { state: 'confirmed' } | { state: 'waiting'; position: number } | { state: 'none' };

export interface WorkshopStatus extends WorkshopSeats {
	mine: Standing;
}

export interface RegistrationStatus {
	name: string;
	workshops: Record<string, WorkshopStatus>;
}

function asCount(value: unknown): number {
	return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;
}

/** Seats per open workshop, keyed by Sessionize session id. */
export async function fetchSeats(signal?: AbortSignal): Promise<Record<string, WorkshopSeats>> {
	const res = await fetch('/api/workshops', { signal });
	if (!res.ok) throw new Error(`workshops fetch failed: ${res.status}`);
	const raw = ((await res.json()) as { workshops?: unknown }).workshops;
	const out: Record<string, WorkshopSeats> = {};
	if (typeof raw !== 'object' || raw === null) return out;
	for (const [id, value] of Object.entries(raw as Record<string, Record<string, unknown>>)) {
		const limit = asCount(value?.limit);
		if (limit > 0) out[id] = { limit, taken: asCount(value.taken), waiting: asCount(value.waiting) };
	}
	return out;
}

/** Seats still free. */
export function seatsLeft(seats: WorkshopSeats): number {
	return Math.max(0, seats.limit - seats.taken);
}

/**
 * The ticket code as the app's callable expects it: upper case, with the dash
 * after the fourth character added when it was left out (`abcd12` → `ABCD-12`).
 */
export function normalizeTicketCode(input: string): string {
	const code = input.trim().toUpperCase().replace(/\s+/g, '');
	if (!code.includes('-') && code.length >= 5 && code.length <= 6) return `${code.slice(0, 4)}-${code.slice(4)}`;
	return code;
}

/** `ABCD-1` … `ABCD-99`, the ti.to registration reference. */
export function isTicketCode(code: string): boolean {
	return /^[A-Z0-9]{4}-[0-9]{1,2}$/.test(code);
}

async function firebase() {
	const [{ getFirebaseApp }, auth, functions] = await Promise.all([
		import('./firebase'),
		import('firebase/auth'),
		import('firebase/functions'),
	]);
	const app = getFirebaseApp();
	return { app, auth, getAuth: () => auth.getAuth(app), fns: functions.getFunctions(app, FUNCTIONS_REGION), functions };
}

async function call<T>(name: string, data: unknown): Promise<T> {
	const { fns, functions } = await firebase();
	const result = await functions.httpsCallable(fns, name)(data);
	return result.data as T;
}

/** Waits for the persisted session to load, then reports the signed-in
 * (non-anonymous) user, or `null`. */
export async function currentAttendee(): Promise<User | null> {
	const { getAuth } = await firebase();
	const auth: Auth = getAuth();
	await auth.authStateReady();
	const user = auth.currentUser;
	return user && !user.isAnonymous ? user : null;
}

/** Step 1: an anonymous session, then the code emailed to the ticket's address. */
export async function requestLoginCode(ticketCode: string): Promise<void> {
	const { auth, getAuth } = await firebase();
	const instance = getAuth();
	await instance.authStateReady();
	if (!instance.currentUser) await auth.signInAnonymously(instance);
	await call('verifyRegistrationCodeCallable', { registrationCode: ticketCode });
}

/** Step 2: the emailed code for a token, and a session on the ticket's account. */
export async function completeLogin(emailCode: string): Promise<void> {
	const { auth, getAuth } = await firebase();
	const { token } = await call<{ token: string }>('completeEmailVerificationCallable', {
		verificationCode: emailCode.trim(),
	});
	await auth.signInWithCustomToken(getAuth(), token);
}

export async function signOutAttendee(): Promise<void> {
	const { auth, getAuth } = await firebase();
	await auth.signOut(getAuth());
}

export function registration(
	action: 'status' | 'join' | 'leave',
	sessionId?: string,
): Promise<RegistrationStatus> {
	return call<RegistrationStatus>('workshopRegistrationCallable', { action, sessionId });
}

/** A callable failure as one sentence for the attendee. */
export function loginErrorMessage(e: unknown, step: 'ticket' | 'email'): string {
	const code = (e as { code?: string }).code ?? '';
	switch (code) {
		case 'functions/not-found':
		case 'functions/invalid-argument':
			return step === 'email'
				? 'That code does not match or has expired. Use the latest email, or start again with your ticket code.'
				: 'That code does not match a ticket. It is on your ticket, four characters, a dash and a number.';
		case 'functions/already-exists':
			return 'This ticket is already linked to another account. Write to devfest@gug.cz and we will sort it out.';
		case 'functions/resource-exhausted':
			return 'Too many attempts. Wait a few minutes and try again.';
		default:
			return 'We could not reach the server. Reload the page and try again.';
	}
}

export function registrationErrorMessage(e: unknown): string {
	const code = (e as { code?: string }).code ?? '';
	if (code === 'functions/failed-precondition') return 'Registration for this workshop is not open.';
	if (code === 'functions/permission-denied') return 'Sign in with your ticket code first.';
	return 'Something went wrong. Please try again or write to devfest@gug.cz.';
}
