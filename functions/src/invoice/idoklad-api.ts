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

	const res = await fetch(TOKEN_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			Accept: 'application/json',
		},
		body: form.toString(),
	});
	if (!res.ok) {
		const body = await res.text().catch(() => '');
		throw new Error(`iDoklad OAuth ${res.status} ${res.statusText}: ${body.slice(0, 300)}`);
	}
	const data = (await res.json()) as { access_token: string; expires_in: number };
	cachedToken = { token: data.access_token, expiresAt: now + (data.expires_in ?? 3600) * 1000 };
	return cachedToken.token;
}

function unwrap<T = any>(json: any): T {
	return json && typeof json === 'object' && 'Data' in json ? (json.Data as T) : (json as T);
}

async function apiFetch(
	cfg: IdokladConfig,
	method: string,
	path: string,
	body?: unknown,
): Promise<Response> {
	const token = await getToken(cfg);
	return fetch(`${API_BASE}${path}`, {
		method,
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
			Accept: 'application/json',
		},
		body: body === undefined ? undefined : JSON.stringify(body),
	});
}

async function apiJson<T = any>(
	cfg: IdokladConfig,
	method: string,
	path: string,
	body?: unknown,
): Promise<T> {
	const res = await apiFetch(cfg, method, path, body);
	if (!res.ok) {
		const detail = await res.text().catch(() => '');
		throw new Error(`iDoklad ${method} ${path} ${res.status} ${res.statusText}: ${detail.slice(0, 300)}`);
	}
	return unwrap<T>(await res.json());
}

// ── Contacts ────────────────────────────────────────────────────────────

/**
 * Find a contact by IČO (IdentificationNumber), else create one. Reusing
 * contacts avoids a duplicate iDoklad contact each time the same company
 * orders. Contacts without an IČO are always created fresh.
 */
export async function findOrCreateContact(
	cfg: IdokladConfig,
	contact: IdokladContactInput,
): Promise<number> {
	const ico = contact.identificationNumber?.trim();
	if (ico) {
		const existing = await findContactByIco(cfg, ico);
		if (existing != null) return existing;
	}
	return createContact(cfg, contact);
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
	} catch {
		// Non-fatal: fall through to create.
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
	};
}

/**
 * Ask iDoklad to email the issued invoice (PDF attached) to the contact.
 * `SendToPartner` uses the contact's email; the invoice PDF carries the
 * bank account + variable symbol the company pays against.
 */
export async function sendInvoiceByEmail(
	cfg: IdokladConfig,
	invoiceId: number,
	opts: { subject?: string; body?: string; otherRecipients?: string[] },
): Promise<void> {
	await apiJson(cfg, 'POST', '/Mails/IssuedInvoice/Send', {
		DocumentId: invoiceId,
		SendToPartner: true,
		SendToSelf: false,
		SendToAccountant: false,
		OtherRecipients: opts.otherRecipients ?? [],
		EmailSubject: opts.subject,
		EmailBody: opts.body,
		SendAttachment: true,
	});
}

/** Current PaymentStatus of an issued invoice (poll for paid). */
export async function getInvoicePaymentStatus(
	cfg: IdokladConfig,
	invoiceId: number,
): Promise<number> {
	const inv = await apiJson<{ PaymentStatus?: number }>(cfg, 'GET', `/IssuedInvoices/${invoiceId}`);
	return inv.PaymentStatus ?? 0;
}

/**
 * Read-only credential check: proves the OAuth token + API access work
 * without creating anything (fetches the issued-invoice Default template).
 * Throws on failure. Useful for a pre-deploy smoke test / health check.
 */
export async function verifyCredentials(cfg: IdokladConfig): Promise<void> {
	await apiJson(cfg, 'GET', '/IssuedInvoices/Default');
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
