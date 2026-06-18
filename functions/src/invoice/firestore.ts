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
 *   completed  → invoice paid → 100%-off ti.to code generated + delivered
 *   error      → pipeline failed; see `errorMessage`
 */

import { FieldValue } from 'firebase-admin/firestore';

import { firestore } from '../lib/admin.js';

export const INVOICES_COLLECTION = 'invoices';

export type InvoiceStatus = 'pending' | 'invoiced' | 'completed' | 'error';

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
