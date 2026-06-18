/**
 * ti.to discount-code creation for the company-funded invoice flow.
 *
 * After a company pays its iDoklad invoice, we mint a 100%-off ti.to
 * discount code scoped to the company-funded release(s). The company
 * redeems it on ti.to to claim the tickets it already paid for off-platform.
 *
 * Reuses the tickets-domain client to read releases so the release shape
 * stays defined in one place.
 *
 * Create-code docs: https://ti.to/docs/api/admin/3.0 (POST discount_codes,
 * flat-ish body wrapped under `discount_code`).
 */

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
 */
export function pickPricingRelease(releases: TitoRelease[]): TitoRelease | null {
	if (releases.length === 0) return null;
	const onSale = releases.filter((r) => deriveSaleStatus(r) === 'on_sale');
	const pool = onSale.length > 0 ? onSale : releases;
	return pool.reduce((latest, r) => {
		const a = latest.start_at ? Date.parse(latest.start_at) : 0;
		const b = r.start_at ? Date.parse(r.start_at) : 0;
		return b >= a ? r : latest;
	});
}

/**
 * Net (excl. VAT) unit price for an invoice line, derived from a ti.to
 * release. `price_ex_tax` is authoritative net when present; otherwise we
 * back it out of the gross `price` using the VAT rate (or take `price` as
 * net when the release is tax-exclusive).
 */
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
	const res = await fetch(url, {
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
	});

	if (!res.ok) {
		const body = await res.text().catch(() => '');
		throw new Error(`ti.to discount_codes ${res.status} ${res.statusText}: ${body.slice(0, 300)}`);
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
