/**
 * ti.to types + pure browser helpers.
 *
 * The actual ti.to API call lives in `functions/src/index.ts` (Cloud
 * Function). This module is browser-safe: types and formatting only.
 *
 * Docs: https://ti.to/docs/api/admin/3.0 (we pin to v3.0; v3.1 is beta).
 *
 * The function side projects each release into the shape below before
 * writing to RTDB. We also receive a synthetic `sale_status` field
 * computed server-side from ti.to's flag set (`sold_out`, `off_sale`,
 * `expired`, `upcoming`, `archived`, `locked`) — see
 * `functions/src/tickets/tito-api.ts::deriveSaleStatus`.
 */

export type TitoSaleStatus =
	| 'on_sale'
	| 'sold_out'
	| 'paused'
	| 'not_yet_on_sale'
	| 'ended'
	| 'archived';

export interface TitoRelease {
	id: number;
	slug: string;
	title: string | null;
	description: string | null;
	price: string | null;
	/** Net price (excl. tax). Reliably net regardless of `tax_exclusive`. */
	price_ex_tax?: string | null;
	/** True when organizer entered `price` as net (gross = price + tax). */
	tax_exclusive?: boolean | null;
	/** Free-text tax label set by organizer (e.g. "VAT 21%"). */
	tax_description?: string | null;
	currency: string | null;
	quantity: number | null;
	quantity_sold: number;
	tickets_count?: number;
	/** Synthetic status computed by the Cloud Function from ti.to flags. */
	sale_status: TitoSaleStatus;
	state_name?: string | null;
	sold_out: boolean;
	off_sale?: boolean;
	expired?: boolean;
	upcoming?: boolean;
	locked?: boolean;
	archived?: boolean;
	secret?: boolean;
	start_at: string | null;
	end_at: string | null;
}

export interface TicketsCache {
	accountSlug: string;
	eventSlug: string;
	fetchedAt: number;
	releases: TitoRelease[];
}

/**
 * Filter to releases that should be shown publicly. Mirrors the
 * `isWebsiteVisible()` rule applied server-side in
 * `functions/src/tickets/tito-api.ts`; kept here as defence-in-depth so
 * any non-public release that somehow lands in the cache is still
 * dropped at render time.
 *
 * Drop: secret. Keep everything else — `releaseStatus()` maps each
 * state to its own badge (on sale, sold out, paused, coming soon,
 * ended, unavailable) so visitors see the full pricing-wave roadmap.
 */
export function filterDisplayable(releases: TitoRelease[]): TitoRelease[] {
	return releases.filter((r) => !r.secret);
}

export interface ReleaseStatus {
	/** Short label for the status badge. */
	label: string;
	/** Visual treatment for the badge (mapped to a CSS class). */
	tone: 'on-sale' | 'paused' | 'soon' | 'sold-out' | 'ended';
	/** Whether the Buy CTA should be enabled. */
	purchasable: boolean;
}

/**
 * Map a ti.to release to a display status. Sold-out wins over the raw
 * `sale_status` so the UI stays consistent if ti.to flips only the
 * `sold_out` flag without updating the derived status.
 *
 * `paused` covers two different realities: a wave taken off sale
 * mid-flight, and a future wave the organizer keeps toggled off in
 * ti.to instead of scheduling a `start_at` (so it never gets the
 * `upcoming` flag). Zero tickets sold tells them apart — a wave that
 * never sold anything reads "Coming soon" to visitors, not "Paused".
 */
export function releaseStatus(release: TitoRelease): ReleaseStatus {
	if (release.sold_out || release.sale_status === 'sold_out') {
		return { label: 'Sold out', tone: 'sold-out', purchasable: false };
	}
	switch (release.sale_status) {
		case 'on_sale':
			return { label: 'On sale', tone: 'on-sale', purchasable: true };
		case 'paused':
			if ((release.tickets_count ?? release.quantity_sold ?? 0) === 0) {
				return { label: 'Coming soon', tone: 'soon', purchasable: false };
			}
			return { label: 'Paused', tone: 'paused', purchasable: false };
		case 'not_yet_on_sale':
			return { label: 'Coming soon', tone: 'soon', purchasable: false };
		case 'ended':
			return { label: 'Ended', tone: 'ended', purchasable: false };
		case 'archived':
			return { label: 'Unavailable', tone: 'paused', purchasable: false };
		default:
			return { label: 'Unavailable', tone: 'paused', purchasable: false };
	}
}

export function releaseTitle(release: TitoRelease): string {
	return release.title ?? release.slug;
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
	return formatAmount(numeric, currency);
}

/**
 * Czech standard VAT rate. Used as a fallback when the ti.to release is
 * configured tax-exclusive (`tax_exclusive=true`) — ti.to's Admin API
 * does not expose a tax rate or a gross figure on releases, so we apply
 * the country's statutory rate. If the release is tax-inclusive
 * (`tax_exclusive=false`), the gross figure is taken directly from
 * `price` and this constant is not used.
 */
export const FALLBACK_VAT_RATE = 0.21;

export interface PriceDisplay {
	/** Primary amount shown — gross when known, else net. */
	primary: string;
	/** Secondary line (e.g. "incl. VAT 21%" / "ex VAT €100"). Null when nothing to add. */
	secondary: string | null;
}

/**
 * Build the price display lines for a release. Always shows the gross
 * (tax-inclusive) figure as the primary number with a small "VAT
 * included" tag underneath — visitors see what they actually pay.
 *
 * - Tax-inclusive release (`tax_exclusive=false`): `price` is already
 *   gross. Use it directly.
 * - Tax-exclusive or unknown: `price` is net. Multiply by
 *   `FALLBACK_VAT_RATE` because ti.to's Admin API does not expose a
 *   tax rate on release or event objects.
 *
 * Secondary label uses `tax_description` when the organizer set one.
 */
export function priceDisplay(release: TitoRelease): PriceDisplay | null {
	if (release.price == null) return { primary: 'Free', secondary: null };
	const price = Number(release.price);
	if (!Number.isFinite(price)) return { primary: release.price, secondary: null };
	if (price === 0) return { primary: 'Free', secondary: null };

	const currency = release.currency;
	const label = (release.tax_description ?? '').trim() || 'VAT';
	const gross = release.tax_exclusive === false ? price : price * (1 + FALLBACK_VAT_RATE);

	return {
		primary: formatAmount(gross, currency),
		secondary: `${label} included`,
	};
}

function formatAmount(numeric: number, currency: string | null): string {
	const code = (currency ?? 'CZK').toUpperCase();
	try {
		return new Intl.NumberFormat('cs-CZ', {
			style: 'currency',
			currency: code,
			maximumFractionDigits: numeric % 1 === 0 ? 0 : 2,
		}).format(numeric);
	} catch {
		return `${numeric} ${code}`;
	}
}
