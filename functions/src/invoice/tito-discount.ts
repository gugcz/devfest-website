/**
 * Mint a 100%-off ti.to discount code scoped to the company-funded
 * release(s) once an invoice is paid. `POST discount_codes`, body wrapped
 * under `discount_code` (https://ti.to/docs/api/admin/3.0).
 */

import { errorBody, fetchWithRetry } from '../lib/http.js';
import { fetchAllReleases, type TitoRelease, deriveSaleStatus } from '../tickets/tito-api.js';

const TITO_API_BASE = 'https://api.tito.io/v3';

export interface TitoConfig {
	token: string;
	accountSlug: string;
	eventSlug: string;
}

/** Releases whose title contains the configured match substring. */
export async function resolveCompanyFundedReleases(
	cfg: TitoConfig,
	match: string,
): Promise<TitoRelease[]> {
	const releases = await fetchAllReleases({
		token: cfg.token,
		accountSlug: cfg.accountSlug,
		eventSlug: cfg.eventSlug,
	});
	const needle = match.trim().toLowerCase();
	return releases.filter((r) => (r.title ?? r.slug ?? '').toLowerCase().includes(needle));
}

/**
 * Pick the release to price the invoice from: prefer one that is on sale,
 * otherwise the latest by start date. Returns null if none qualify.
 *
 * Secret releases never price a new invoice: an earlier wave is kept on sale
 * but secret after it closes, so the codes of its still-unpaid invoices can
 * redeem it, and it must not win over the wave the site actually sells.
 */
export function pickPricingRelease(releases: TitoRelease[]): TitoRelease | null {
	const visible = releases.filter((r) => !r.secret);
	const candidates = visible.length > 0 ? visible : releases;
	if (candidates.length === 0) return null;
	const onSale = candidates.filter((r) => deriveSaleStatus(r) === 'on_sale');
	const pool = onSale.length > 0 ? onSale : candidates;
	return pool.reduce((latest, r) => (startMs(r) >= startMs(latest) ? r : latest));
}

/**
 * The release(s) a paid invoice's code is scoped to: the wave the invoice
 * was priced from, so a Regular invoice paid after Lazy bird opens still
 * registers Regular tickets (sales per wave stay right). The release is the
 * one stored at issue time, or for invoices issued before that was stored,
 * the wave that had started last when the invoice was requested. Falls back
 * to every matching release when that wave can't be found or is no longer
 * redeemable, so a payer is never left with a code that unlocks nothing.
 */
export function pickInvoicedReleases(
	releases: TitoRelease[],
	invoice: { releaseId?: number | null; requestedAtMs?: number | null },
): TitoRelease[] {
	let release = releases.find((r) => r.id === invoice.releaseId);
	if (!release && invoice.requestedAtMs != null) {
		const requestedAt = invoice.requestedAtMs;
		const started = releases.filter((r) => startMs(r) <= requestedAt);
		if (started.length > 0) {
			release = started.reduce((latest, r) => (startMs(r) >= startMs(latest) ? r : latest));
		}
	}
	if (release && deriveSaleStatus(release) === 'on_sale') return [release];
	return releases;
}

function startMs(r: TitoRelease): number {
	return r.start_at ? Date.parse(r.start_at) : 0;
}

/** Net unit price for an invoice line: `price_ex_tax` when present, else
 * backed out of gross `price` (or `price` as-is when tax-exclusive). */
export function releaseNetUnitPrice(release: TitoRelease, vatRatePercent: number): number {
	const exTax = release.price_ex_tax != null ? Number(release.price_ex_tax) : NaN;
	if (Number.isFinite(exTax)) return round2(exTax);

	const gross = Number(release.price);
	if (!Number.isFinite(gross)) {
		throw new Error(`Release ${release.slug} has no usable price`);
	}
	// tax_exclusive===false → `price` is gross → strip VAT to get net.
	// otherwise `price` is already net.
	if (release.tax_exclusive === false) {
		return round2(gross / (1 + vatRatePercent / 100));
	}
	return round2(gross);
}

function round2(n: number): number {
	return Math.round(n * 100) / 100;
}

export interface CreatedDiscountCode {
	id: number;
	code: string;
}

/**
 * Create a 100%-off discount code scoped to the given release ids.
 */
export async function createDiscountCode(
	cfg: TitoConfig,
	input: { code: string; quantity: number; releaseIds: number[] },
): Promise<CreatedDiscountCode> {
	const url = `${TITO_API_BASE}/${cfg.accountSlug}/${cfg.eventSlug}/discount_codes`;
	// One attempt only (the shared helper pins a POST to one): the code is
	// deterministic, so a replay either collides on ti.to or mints a second
	// 100%-off code for the same company.
	const res = await fetchWithRetry(
		url,
		{
			method: 'POST',
			headers: {
				Authorization: `Token token=${cfg.token}`,
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				discount_code: {
					code: input.code,
					type: 'PercentOffDiscountCode',
					value: '100.0',
					quantity: input.quantity,
					release_ids: input.releaseIds,
					only_show_attached: true,
				},
			}),
		},
		{ label: 'ti.to discount_codes' },
	);

	if (!res.ok) {
		const body = await errorBody(res);
		throw new Error(`ti.to discount_codes ${res.status} ${res.statusText}: ${body}`);
	}

	const data = (await res.json()) as { id?: number; code?: string; discount_code?: { id: number; code: string } };
	// Response may be flat or wrapped; handle both.
	const id = data.id ?? data.discount_code?.id ?? 0;
	const code = data.code ?? data.discount_code?.code ?? input.code;
	return { id, code };
}

/** Public redeem link for a discount code. */
export function discountRedeemUrl(cfg: TitoConfig, code: string): string {
	return `https://ti.to/${cfg.accountSlug}/${cfg.eventSlug}/discount/${encodeURIComponent(code)}`;
}

/**
 * Build a stable, readable discount code from the company name + a short
 * id. Strips diacritics so Czech names produce ASCII codes.
 */
export function buildDiscountCode(companyName: string, shortId: string): string {
	const slug = companyName
		.normalize('NFKD')
		.replace(/[^\x00-\x7f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 32);
	const base = slug || 'company';
	return `${base}-${shortId}`.toUpperCase();
}
