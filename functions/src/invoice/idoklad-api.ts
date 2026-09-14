/**
 * iDoklad API v3 client.
 *
 * Docs / SDK: https://api.idoklad.cz/Help/v3/en/ · https://github.com/Solitea/IdokladSdk
 *
 * Auth is OAuth 2.0 **Client Credentials Flow**. Token endpoint is on the
 * identity server (`https://identity.idoklad.cz/server/connect/token`),
 * form-urlencoded, `grant_type=client_credentials`, `scope=idoklad_api`.
 * This (v1) endpoint needs only `client_id` + `client_secret` from the
 * iDoklad account (Nastavení → Aplikace → API) — no `application_id`. The
 * `/server/v2/connect/token` variant additionally requires an
 * `application_id` from the iDoklad Developer portal; we don't use it.
 * The token (~2h) has no refresh — we cache it and re-request on expiry.
 *
 * API base: https://api.idoklad.cz/v3 . Every response is wrapped in
 * `{ Data, IsSuccess, Message, ... }`; lists wrap `Data` as
 * `{ Items, TotalItems, TotalPages }`. `unwrap()` peels the `Data` layer.
 *
 * Invoice creation follows iDoklad's Default→edit→Post pattern: GET
 * `/IssuedInvoices/Default` returns a fully-defaulted template (currency,
 * payment option, numeric sequence, dates) which we override with the
 * partner + line + maturity and POST back.
 */

import { logger } from 'firebase-functions/v2';

import { describeError } from '../lib/errors.js';
import { errorBody, fetchWithRetry } from '../lib/http.js';

const TOKEN_URL = 'https://identity.idoklad.cz/server/connect/token';
const API_BASE = 'https://api.idoklad.cz/v3';

// iDoklad enum values (from the official SDK).
const PRICE_TYPE_WITHOUT_VAT = 1; // PriceType.WithoutVat
const VAT_RATE_BASIC = 1; // VatRateType.Basic (21 % in CZ)
const VAT_RATE_ZERO = 2; // VatRateType.Zero
const ITEM_TYPE_NORMAL = 0; // PostIssuedInvoiceItemType.ItemTypeNormal

/** PaymentStatus enum (Unpaid=0, Paid=1, PartialPaid=2, Overpaid=3). */
export const PAYMENT_STATUS_PAID = 1;
export const PAYMENT_STATUS_OVERPAID = 3;
export function isPaidStatus(status: number | null | undefined): boolean {
	return status === PAYMENT_STATUS_PAID || status === PAYMENT_STATUS_OVERPAID;
}

export interface IdokladConfig {
	clientId: string;
	clientSecret: string;
}

export interface IdokladContactInput {
	companyName: string;
	/** IČO */
	identificationNumber?: string | null;
	/** DIČ */
	vatIdentificationNumber?: string | null;
	street?: string | null;
	city?: string | null;
	postalCode?: string | null;
	email?: string | null;
}

export interface IdokladInvoiceLine {
	name: string;
	quantity: number;
	/** Net (excl. VAT) unit price; VAT is added by iDoklad per VatRateType. */
	unitPriceNet: number;
	vatRatePercent: number;
}

export interface CreatedInvoice {
	id: number;
	number: string | null;
	variableSymbol: string | null;
	/** Maturity we asked for, `YYYY-MM-DD` — quoted back in the covering email. */
	dueDate: string;
}

// ── Token cache (in-process, per warm instance) ─────────────────────────

interface CachedToken {
	token: string;
	expiresAt: number;
}
let cachedToken: CachedToken | null = null;

async function getToken(cfg: IdokladConfig): Promise<string> {
	const now = Date.now();
	if (cachedToken && cachedToken.expiresAt > now + 60_000) return cachedToken.token;

	const form = new URLSearchParams();
	form.set('grant_type', 'client_credentials');
	form.set('client_id', cfg.clientId);
	form.set('client_secret', cfg.clientSecret);
	form.set('scope', 'idoklad_api');

	// Retryable despite being a POST: minting a second token costs nothing, while
	// failing here fails every call behind it.
	const res = await fetchWithRetry(
		TOKEN_URL,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				Accept: 'application/json',
			},
			body: form.toString(),
		},
		{ label: 'iDoklad OAuth token', retryUnsafe: true },
	);
	if (!res.ok) {
		throw new Error(`iDoklad OAuth ${res.status} ${res.statusText}: ${await errorBody(res)}`);
	}
	const data = (await res.json()) as { access_token: string; expires_in: number };
	cachedToken = { token: data.access_token, expiresAt: now + (data.expires_in ?? 3600) * 1000 };
	return cachedToken.token;
}

/**
 * A domain-level refusal from iDoklad: HTTP 200 with `IsSuccess: false`.
 * Carries the API's own `Message`, which is the only thing that says why.
 */
export class IdokladApiError extends Error {
	readonly detail: string | null;
	constructor(context: string, detail: string | null) {
		super(`${context} refused: ${detail ?? 'IsSuccess:false with no Message'}`);
		this.name = 'IdokladApiError';
		this.detail = detail;
	}
}

/** `Message` off an iDoklad envelope — a string, or a list of them. */
function envelopeMessage(json: unknown): string | null {
	const raw = (json as { Message?: unknown } | null)?.Message;
	if (typeof raw === 'string') return raw.trim() || null;
	if (Array.isArray(raw)) {
		const parts = raw.map((m) => (typeof m === 'string' ? m : JSON.stringify(m))).filter(Boolean);
		return parts.length ? parts.join('; ') : null;
	}
	return null;
}

/** Peel the `{ Data, IsSuccess, Message }` envelope. `IsSuccess` is the
 * verdict, not the HTTP status — iDoklad answers 200 for domain-level
 * refusals, so a refused call must throw here. */
function unwrap<T = unknown>(json: unknown, context: string): T {
	if (json && typeof json === 'object') {
		if ('IsSuccess' in json && (json as { IsSuccess: unknown }).IsSuccess === false) {
			throw new IdokladApiError(context, envelopeMessage(json));
		}
		if ('Data' in json) return (json as { Data: unknown }).Data as T;
	}
	return json as T;
}

async function apiFetch(
	cfg: IdokladConfig,
	method: string,
	path: string,
	body?: unknown,
): Promise<Response> {
	const token = await getToken(cfg);
	// GETs retry, POSTs don't (`fetchWithRetry` enforces it): a replayed
	// `POST /IssuedInvoices` bills a company twice and iDoklad has no
	// idempotency key. 30s per attempt — invoice creation is heavy.
	return fetchWithRetry(
		`${API_BASE}${path}`,
		{
			method,
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
			body: body === undefined ? undefined : JSON.stringify(body),
		},
		{ label: `iDoklad ${method} ${path}`, timeoutMs: 30_000 },
	);
}

/** The parsed response envelope, before `Data` is peeled. Throws on non-2xx. */
async function apiEnvelope(
	cfg: IdokladConfig,
	method: string,
	path: string,
	body?: unknown,
): Promise<any> {
	const res = await apiFetch(cfg, method, path, body);
	if (!res.ok) {
		const detail = await errorBody(res);
		throw new Error(`iDoklad ${method} ${path} ${res.status} ${res.statusText}: ${detail}`);
	}
	return await res.json();
}

async function apiJson<T = any>(
	cfg: IdokladConfig,
	method: string,
	path: string,
	body?: unknown,
): Promise<T> {
	return unwrap<T>(await apiEnvelope(cfg, method, path, body), `iDoklad ${method} ${path}`);
}

// ── Contacts ────────────────────────────────────────────────────────────

export interface ResolvedContact {
	id: number;
	/** True when the iDoklad contact is known to carry the submitted email,
	 * so `SendToPartner` reaches the requester. False → caller adds an
	 * explicit recipient. */
	emailSynced: boolean;
}

/**
 * Find a contact by IČO (IdentificationNumber), else create one. Contacts
 * without an IČO are always created fresh.
 *
 * A reused contact is **updated** from the form first. It used not to be:
 * the same company ordered twice from two people, and `SendToPartner`
 * mailed the second invoice to the first person while the pipeline
 * recorded success.
 */
export async function findOrCreateContact(
	cfg: IdokladConfig,
	contact: IdokladContactInput,
): Promise<ResolvedContact> {
	const ico = contact.identificationNumber?.trim();
	if (ico) {
		const existing = await findContactByIco(cfg, ico);
		if (existing != null) {
			return { id: existing, emailSynced: await syncContactDetails(cfg, existing, contact) };
		}
	}
	return { id: await createContact(cfg, contact), emailSynced: hasEmail(contact) };
}

function hasEmail(contact: IdokladContactInput): boolean {
	return (contact.email?.trim() ?? '') !== '';
}

/**
 * Push the submitted email + address onto an existing contact. Only
 * non-empty fields are written (a blank optional field must not wipe what
 * iDoklad holds). Best-effort: a failed update is logged and reported as
 * unsynced, so the caller adds an explicit recipient instead of abandoning
 * the invoice. Returns whether the contact now holds the submitted address.
 */
async function syncContactDetails(
	cfg: IdokladConfig,
	id: number,
	contact: IdokladContactInput,
): Promise<boolean> {
	const email = contact.email?.trim() ?? '';
	const patch: Record<string, unknown> = { Id: id };
	if (email) patch.Email = email;
	assignIfSet(patch, 'CompanyName', contact.companyName);
	assignIfSet(patch, 'VatIdentificationNumber', contact.vatIdentificationNumber);
	assignIfSet(patch, 'Street', contact.street);
	assignIfSet(patch, 'City', contact.city);
	assignIfSet(patch, 'PostalCode', contact.postalCode);
	// `Id` alone is not a change worth a round trip.
	if (Object.keys(patch).length === 1) return false;

	try {
		// PATCH the COLLECTION with `Id` in the body — `/Contacts/{id}` answers
		// 405 `UnsupportedApiVersion` on every write verb.
		//
		// Read the address back from the response rather than assuming the write
		// landed: iDoklad can silently drop an `Email` it doesn't like, and a
		// 200 would otherwise report the contact as synced and mail the invoice
		// to whoever the contact was created with.
		const updated = await apiJson<{ Email?: string | null }>(cfg, 'PATCH', '/Contacts', patch);
		if (!email) return false;
		const stored = typeof updated?.Email === 'string' ? updated.Email.trim() : '';
		if (stored.toLowerCase() === email.toLowerCase()) return true;
		logger.warn(
			`iDoklad contact ${id} did not take the submitted email (stored ` +
				`${stored ? maskEmail(stored) : '—'}, submitted ${maskEmail(email)}) — ` +
				`falling back to an explicit recipient`,
		);
		return false;
	} catch (err) {
		logger.warn(
			`iDoklad contact ${id} update failed — the invoice mail may go to the stored ` +
				`address, falling back to an explicit recipient: ${describeError(err)}`,
		);
		return false;
	}
}

function assignIfSet(target: Record<string, unknown>, key: string, value: string | null | undefined) {
	const trimmed = value?.trim();
	if (trimmed) target[key] = trimmed;
}

async function findContactByIco(cfg: IdokladConfig, ico: string): Promise<number | null> {
	try {
		const page = await apiJson<{ Items?: Array<{ Id: number; IdentificationNumber?: string }> }>(
			cfg,
			'GET',
			`/Contacts?filter=IdentificationNumber~eq~${encodeURIComponent(ico)}&pageSize=1`,
		);
		const items = Array.isArray(page?.Items) ? page.Items : [];
		const match = items.find((c) => String(c.IdentificationNumber ?? '').trim() === ico);
		return match ? match.Id : null;
	} catch (err) {
		// Non-fatal: fall through to create. Logged — the symptom is a duplicate
		// contact, whose cause is otherwise invisible.
		logger.warn(`iDoklad contact lookup by IČO failed, creating a new one: ${describeError(err)}`);
		return null;
	}
}

async function createContact(cfg: IdokladConfig, contact: IdokladContactInput): Promise<number> {
	// Start from the account default to inherit a valid CountryId etc.
	const tpl = await apiJson<Record<string, unknown>>(cfg, 'GET', '/Contacts/Default');
	const body = {
		...tpl,
		CompanyName: contact.companyName,
		IdentificationNumber: contact.identificationNumber ?? null,
		VatIdentificationNumber: contact.vatIdentificationNumber ?? null,
		Street: contact.street ?? null,
		City: contact.city ?? null,
		PostalCode: contact.postalCode ?? null,
		Email: contact.email ?? null,
	};
	const created = await apiJson<{ Id: number }>(cfg, 'POST', '/Contacts', body);
	return created.Id;
}

// ── Invoices ──────────────────────────────────────────────────────────────

export async function createInvoice(
	cfg: IdokladConfig,
	input: { contactId: number; dueDays: number; description: string; line: IdokladInvoiceLine },
): Promise<CreatedInvoice> {
	const tpl = await apiJson<Record<string, any>>(cfg, 'GET', '/IssuedInvoices/Default');

	const issue = tpl.DateOfIssue ? new Date(tpl.DateOfIssue) : new Date();
	const maturity = addDays(issue, input.dueDays);

	const item = {
		Name: input.line.name,
		Amount: input.line.quantity,
		UnitPrice: input.line.unitPriceNet,
		PriceType: PRICE_TYPE_WITHOUT_VAT,
		VatRateType: input.line.vatRatePercent === 0 ? VAT_RATE_ZERO : VAT_RATE_BASIC,
		ItemType: ITEM_TYPE_NORMAL,
		IsTaxMovement: false,
		DiscountPercentage: 0,
		Unit: 'ks',
	};

	// Default→edit→Post. `Prices` is a server-computed readonly block on the
	// template; drop it so it isn't echoed back.
	const body: Record<string, unknown> = { ...tpl };
	delete body.Prices;
	body.PartnerId = input.contactId;
	body.Description = input.description;
	body.DateOfMaturity = isoDate(maturity);
	body.Items = [item];

	const created = await apiJson<{ Id: number; DocumentNumber?: string; VariableSymbol?: string }>(
		cfg,
		'POST',
		'/IssuedInvoices',
		body,
	);
	return {
		id: created.Id,
		number: created.DocumentNumber ?? null,
		variableSymbol: created.VariableSymbol ?? null,
		dueDate: isoDate(maturity),
	};
}

export interface InvoiceMailResult {
	/** True **only** when iDoklad answered `IsSuccess: true`. A missing
	 * verdict counts as unconfirmed, so `invoiceEmailSent` is never a hope. */
	confirmed: boolean;
	/** iDoklad's own `Message`, if any. */
	message: string | null;
	/** Masked extra recipients, as logged. */
	recipients: string[];
}

/**
 * Ask iDoklad to email the issued invoice (PDF attached) to the contact.
 * The PDF carries the bank account + variable symbol. Throws on a refusal
 * (`IsSuccess: false`) and logs the verdict either way — "did the mail go
 * out?" used to be unanswerable from Cloud Logging.
 */
export async function sendInvoiceByEmail(
	cfg: IdokladConfig,
	invoiceId: number,
	opts: { subject?: string; body?: string; otherRecipients?: string[] },
): Promise<InvoiceMailResult> {
	const context = 'iDoklad POST /Mails/IssuedInvoice/Send';
	const otherRecipients = (opts.otherRecipients ?? []).map((a) => a.trim()).filter(Boolean);
	const masked = otherRecipients.map(maskEmail);

	let envelope: any;
	try {
		envelope = await apiEnvelope(cfg, 'POST', '/Mails/IssuedInvoice/Send', {
			DocumentId: invoiceId,
			SendToPartner: true,
			SendToSelf: false,
			SendToAccountant: false,
			OtherRecipients: otherRecipients,
			EmailSubject: opts.subject,
			EmailBody: opts.body,
			SendAttachment: true,
		});
	} catch (err) {
		// Log before rethrowing: the caller records the failure, but only this
		// frame knows which invoice and which recipients it was for.
		logger.warn('iDoklad invoice mail failed', {
			invoiceId,
			sendToPartner: true,
			otherRecipients: masked,
			error: describeError(err),
		});
		throw err;
	}

	// Throws `IdokladApiError` on `IsSuccess: false` — a 200 that refused to send.
	unwrap(envelope, context);

	const confirmed = envelope?.IsSuccess === true;
	const message = envelopeMessage(envelope);
	// Addresses masked: diagnostic, not a plain-text copy of contact details.
	// `message` is the logger's own field — the API's text needs its own key.
	const entry = {
		invoiceId,
		isSuccess: envelope?.IsSuccess ?? null,
		idokladMessage: message,
		sendToPartner: true,
		otherRecipients: masked,
	};
	if (confirmed) logger.info('iDoklad invoice mail sent', entry);
	else logger.warn('iDoklad invoice mail unconfirmed (no IsSuccess in response)', entry);

	return { confirmed, message, recipients: masked };
}

/** `billing@example.com` → `b*****g@example.com`. Tells two addresses apart
 * in a log without writing one out; the domain stays for diagnosis. */
export function maskEmail(address: string): string {
	const at = address.lastIndexOf('@');
	if (at <= 0) return '***';
	const local = address.slice(0, at);
	const domain = address.slice(at + 1);
	if (local.length <= 2) return `${local[0]}*@${domain}`;
	return `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}@${domain}`;
}

/** Current PaymentStatus of an issued invoice (poll for paid). */
export async function getInvoicePaymentStatus(
	cfg: IdokladConfig,
	invoiceId: number,
): Promise<number> {
	const inv = await apiJson<{ PaymentStatus?: number }>(cfg, 'GET', `/IssuedInvoices/${invoiceId}`);
	return inv.PaymentStatus ?? 0;
}

// ── date helpers ──────────────────────────────────────────────────────────

function addDays(d: Date, n: number): Date {
	const r = new Date(d.getTime());
	r.setUTCDate(r.getUTCDate() + n);
	return r;
}

function isoDate(d: Date): string {
	const y = d.getUTCFullYear();
	const m = String(d.getUTCMonth() + 1).padStart(2, '0');
	const day = String(d.getUTCDate()).padStart(2, '0');
	return `${y}-${m}-${day}T00:00:00`;
}
