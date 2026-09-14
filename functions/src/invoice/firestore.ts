/**
 * Firestore model + helpers for the `invoices` collection.
 *
 * The collection is server-only (Admin SDK bypasses rules; client access
 * is denied in firestore.rules). The browser never touches Firestore — it
 * POSTs to `submitInvoiceCallable`, which writes the doc here.
 *
 * Lifecycle (status):
 *   pending    → form submitted, nothing sent yet
 *   processing → a function has claimed the doc: the trigger is issuing the
 *                invoice, or the poller is minting the code for a paid one
 *   invoiced   → iDoklad contact + invoice created (and emailed)
 *   completed  → invoice paid → 100%-off ti.to code generated + delivered
 *   error      → pipeline failed; see `errorMessage`
 */

import { createHash } from 'node:crypto';

import { FieldValue, Timestamp } from 'firebase-admin/firestore';

import { firestore } from '../lib/admin.js';

export const INVOICES_COLLECTION = 'invoices';

/**
 * Per-(company, email) throttle counters for `submitInvoiceCallable`. Like the
 * invoices collection, this is server-only — the catch-all deny in
 * firestore.rules covers it (no explicit client access anywhere).
 */
export const INVOICE_RATE_LIMITS_COLLECTION = 'invoiceRateLimits';

export type InvoiceStatus = 'pending' | 'invoiced' | 'processing' | 'completed' | 'error';

/** The validated payload written by `submitInvoiceCallable`. */
export interface InvoiceRequestInput {
	companyName: string;
	registrationNumberIC: string;
	registrationNumberDIC?: string | null;
	street: string;
	city: string;
	zip: string;
	country: string;
	email: string;
	countTickets: number;
}

export interface InvoiceDoc extends InvoiceRequestInput {
	status: InvoiceStatus;
	// iDoklad
	idokladContactId?: number;
	idokladInvoiceId?: number;
	idokladInvoiceNumber?: string | null;
	variableSymbol?: string | null;
	invoiceEmailSent?: boolean;
	/** True when an existing iDoklad contact (matched by IČO) was reused. The
	 * form never edits a reused contact; the invoice carries its stored details. */
	contactReused?: boolean;
	/** Form field names whose value differs from the reused contact's stored
	 * one (empty when created or identical) — the organizer's review list. */
	contactDiffers?: string[];
	paidAmount?: string | null;
	// ti.to
	discountCode?: string | null;
	discountLink?: string | null;
	discountEmailSent?: boolean;
	// errors
	errorMessage?: string | null;
}

export function invoicesCollection() {
	return firestore().collection(INVOICES_COLLECTION);
}

export async function createInvoiceRequest(input: InvoiceRequestInput): Promise<string> {
	const ref = await invoicesCollection().add({
		...input,
		status: 'pending' satisfies InvoiceStatus,
		createdAt: FieldValue.serverTimestamp(),
		updatedAt: FieldValue.serverTimestamp(),
	});
	return ref.id;
}

export interface InvoiceRecord {
	id: string;
	data: InvoiceDoc;
}

/**
 * Invoices that have been issued but not yet paid — the work-list for the
 * `pollPaidInvoicesScheduled` scheduler (iDoklad has no webhooks). Bounded so a
 * backlog can't blow up a single run.
 */
export async function listAwaitingPayment(limit = 50): Promise<InvoiceRecord[]> {
	const snap = await invoicesCollection()
		.where('status', '==', 'invoiced')
		.limit(limit)
		.get();
	return snap.docs.map((doc) => ({ id: doc.id, data: doc.data() as InvoiceDoc }));
}

export async function updateInvoice(id: string, patch: Partial<InvoiceDoc>): Promise<void> {
	await invoicesCollection()
		.doc(id)
		.set({ ...patch, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
}

/**
 * Invoice requests created inside the trailing window, across every company.
 * The identity throttle below is keyed on values the submitter chooses, so
 * this ceiling is the real backstop against a farmed App Check token minting
 * invoices and emails at scale. One aggregation read, no index to maintain.
 */
export async function countRecentInvoiceRequests(windowMs: number): Promise<number> {
	const since = Timestamp.fromMillis(Date.now() - windowMs);
	const snap = await invoicesCollection().where('createdAt', '>=', since).count().get();
	return snap.data().count;
}

/**
 * Sliding-window rate limit keyed by (IČO + email), in a single-doc
 * transaction (no composite index). Returns `true` when within budget (and
 * records it). The throttle App Check can't provide: a captured valid token
 * could otherwise drive unbounded invoice + email creation.
 */
export async function checkInvoiceRateLimit(opts: {
	registrationNumberIC: string;
	email: string;
	max: number;
	windowMs: number;
}): Promise<boolean> {
	const key = createHash('sha256')
		.update(`${opts.registrationNumberIC.toLowerCase()}|${opts.email.toLowerCase()}`)
		.digest('hex');
	const ref = firestore().collection(INVOICE_RATE_LIMITS_COLLECTION).doc(key);
	const now = Date.now();

	return firestore().runTransaction(async (tx) => {
		const snap = await tx.get(ref);
		const data = snap.exists ? (snap.data() as { windowStart?: number; count?: number }) : null;

		if (data && typeof data.windowStart === 'number' && now - data.windowStart < opts.windowMs) {
			if ((data.count ?? 0) >= opts.max) return false;
			tx.update(ref, { count: (data.count ?? 0) + 1, updatedAt: FieldValue.serverTimestamp() });
			return true;
		}

		// `expiresAt` is the TTL field: a Firestore TTL policy on this
		// collection (console → TTL, field `expiresAt`) deletes spent windows,
		// or the collection grows by one doc per company forever.
		tx.set(ref, {
			windowStart: now,
			count: 1,
			expiresAt: Timestamp.fromMillis(now + opts.windowMs),
			updatedAt: FieldValue.serverTimestamp(),
		});
		return true;
	});
}

/**
 * Atomically flip `from` → `processing` in a transaction. Returns `true` only
 * for the caller that won the claim, so each stage runs exactly once even
 * when the platform re-delivers (Firestore triggers are at-least-once; the
 * poller can overlap itself).
 */
async function claimInvoice(id: string, from: InvoiceStatus): Promise<boolean> {
	const ref = invoicesCollection().doc(id);
	return firestore().runTransaction(async (tx) => {
		const snap = await tx.get(ref);
		if (!snap.exists) return false;
		if ((snap.data() as InvoiceDoc).status !== from) return false;
		tx.update(ref, { status: 'processing', updatedAt: FieldValue.serverTimestamp() });
		return true;
	});
}

/** `pending` → `processing`, for `processInvoiceTrigger`. A redelivered
 * create event must not mint a second iDoklad invoice. */
export function claimInvoiceForIssuing(id: string): Promise<boolean> {
	return claimInvoice(id, 'pending');
}

/** `invoiced` → `processing`, for `pollPaidInvoicesScheduled`, so the
 * 100%-off code is minted exactly once. */
export function claimInvoiceForProcessing(id: string): Promise<boolean> {
	return claimInvoice(id, 'invoiced');
}

/** Release a claimed invoice back to `invoiced` for the next poll — only
 * when no code was minted yet, so a code is never created twice. */
export async function releaseInvoiceClaim(id: string, errorMessage: string): Promise<void> {
	await updateInvoice(id, { status: 'invoiced', errorMessage });
}
