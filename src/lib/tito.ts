/**
 * ti.to types + pure browser helpers.
 *
 * The actual ti.to API call lives in `functions/src/index.ts` (Cloud
 * Function). This module is browser-safe: types and formatting only.
 *
 * Docs: https://ti.to/docs/api/admin/3.1
 */

export type TitoSaleStatus =
	| 'on_sale'
	| 'sold_out'
	| 'paused'
	| 'ended'
	| 'not_yet_on_sale'
	| string;

export interface TitoRelease {
	id: number;
	slug: string;
	title: string;
	description: string | null;
	price: string | null;
	currency: string | null;
	quantity: number | null;
	quantity_sold: number;
	sale_status: TitoSaleStatus;
	state: string;
	sold_out: boolean;
	sales_start: string | null;
	sales_end: string | null;
}

export interface TicketsCache {
	accountSlug: string;
	eventSlug: string;
	fetchedAt: number;
	releases: TitoRelease[];
}

/**
 * Filter to releases that should be shown publicly: on sale or sold out.
 * Hides drafts, paused, ended, and not-yet-on-sale releases.
 */
export function filterDisplayable(releases: TitoRelease[]): TitoRelease[] {
	return releases.filter((r) => {
		if (r.state && r.state !== 'live' && r.state !== 'on_sale') return false;
		return r.sale_status === 'on_sale' || r.sale_status === 'sold_out' || r.sold_out === true;
	});
}

export function checkoutUrl(release: TitoRelease, accountSlug: string, eventSlug: string): string {
	return `https://ti.to/${accountSlug}/${eventSlug}/with/${release.slug}`;
}

export function eventUrl(accountSlug: string, eventSlug: string): string {
	return `https://ti.to/${accountSlug}/${eventSlug}`;
}

export function formatPrice(price: string | null, currency: string | null): string {
	if (price == null) return 'Free';
	const numeric = Number(price);
	if (!Number.isFinite(numeric)) return price;
	if (numeric === 0) return 'Free';
	const code = (currency ?? 'CZK').toUpperCase();
	try {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: code,
			maximumFractionDigits: numeric % 1 === 0 ? 0 : 2,
		}).format(numeric);
	} catch {
		return `${numeric} ${code}`;
	}
}
