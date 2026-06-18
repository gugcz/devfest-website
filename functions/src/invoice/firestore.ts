/**
 * Firestore model + helpers for the `invoices` collection.
 *
 * The collection is server-only (Admin SDK bypasses rules; client access
 * is denied in firestore.rules). The browser never touches Firestore — it
 * POSTs to `submitInvoiceRequest`, which writes the doc here.
 *
 * Lifecycle (status):
 *   pending    → form submitted, nothing sent yet
 *   invoiced   → iDoklad contact + invoice created (and emailed)
 *   processing → poller claimed a paid invoice and is minting the code
 *   completed  → invoice paid → 100%-off ti.to code generated + delivered
 *   error      → pipeline failed; see `errorMessage`
 */

import { createHash } from 'node:crypto';

import { FieldValue } from 'firebase-admin/firestore';

import { firestore } from '../lib/admin.js';

export const INVOICES_COLLECTION = 'invoices';

/**
 * Per-(company, email) throttle counters for `submitInvoiceRequest`. Like the
 * invoices collection, this is server-only — the catch-all deny in
 * firestore.rules covers it (no explicit client access anywhere).
 */
export const INVOICE_RATE_LIMITS_COLLECTION = 'invoiceRateLimits';

export type InvoiceStatus = 'pending' | 'invoiced' | 'processing' | 'completed' | 'error';

/** The validated payload written by `submitInvoiceRequest`. */
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
 * `pollPaidInvoices` scheduler (iDoklad has no webhooks). Bounded so a
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
 * Sliding-window rate limit keyed by (IČO + email), enforced in a single-doc
 * transaction so it needs no composite index. Returns `true` when the request
 * is within budget (and records it), `false` when the caller has exceeded
 * `max` submissions inside `windowMs`.
 *
 * This is the throttle App Check cannot provide: App Check attests the caller
 * is the real site, but a captured/valid token could otherwise drive unbounded
 * invoice + email creation (cost / sending-reputation abuse).
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

		tx.set(ref, { windowStart: now, count: 1, updatedAt: FieldValue.serverTimestamp() });
		return true;
	});
}

/**
 * Atomically claim a paid invoice for post-payment processing by flipping its
 * status `invoiced` → `processing` in a transaction. Returns `true` only for
 * the caller that won the claim, so the 100%-off code is minted exactly once
 * even if the poller re-enters (overlapping runs, at-least-once retries).
 */
export async function claimInvoiceForProcessing(id: string): Promise<boolean> {
	const ref = invoicesCollection().doc(id);
	return firestore().runTransaction(async (tx) => {
		const snap = await tx.get(ref);
		if (!snap.exists) return false;
		if ((snap.data() as InvoiceDoc).status !== 'invoiced') return false;
		tx.update(ref, { status: 'processing', updatedAt: FieldValue.serverTimestamp() });
		return true;
	});
}

/**
 * Release a claimed invoice back to `invoiced` so the next poll retries it.
 * Used when post-payment processing fails partway — but only when no code was
 * minted yet (`claimInvoiceForProcessing` + persisting the code right after
 * minting together guarantee a code is never created twice).
 */
export async function releaseInvoiceClaim(id: string, errorMessage: string): Promise<void> {
	await updateInvoice(id, { status: 'invoiced', errorMessage });
}
