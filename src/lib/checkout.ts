import { track } from './analytics';
import { grossPrice, releaseTitle, type TitoRelease } from './tito';

/** Two decimals — long VAT floats are noise in the GA4 payload. */
export function round2(n: number): number {
	return Math.round(n * 100) / 100;
}

/** A buyable release plus any extra GA4 item fields (`item_category`,
 * `item_variant`) the surface knows about. */
export interface CheckoutEntry {
	release: TitoRelease;
	item?: Record<string, string>;
}

/**
 * Report a ticket CTA click as GA4's `begin_checkout`. Checkout runs on
 * ti.to, so this is the last thing GA4 sees of a sale. Items are priced
 * gross (what the visitor pays).
 *
 * `value` is ONE ticket's price, not the sum: the releases are alternatives
 * (Individual *or* Company funded), not a cart. GA4 drops `value` without a
 * `currency`, so the pair is sent together or not at all (free / unpriced).
 */
export function trackBeginCheckout(entries: CheckoutEntry[], params: Record<string, unknown> = {}): void {
	const items = entries.map(({ release, item }) => {
		const price = grossPrice(release);
		return {
			item_id: release.slug,
			item_name: releaseTitle(release),
			...item,
			...(price != null ? { price: round2(price) } : {}),
			quantity: 1,
		};
	});
	const value = items.find((i) => typeof i.price === 'number')?.price;
	const currency = entries.find(({ release }) => release.currency)?.release.currency;
	track('begin_checkout', {
		...(value != null ? { currency: (currency ?? 'CZK').toUpperCase(), value } : {}),
		items,
		...params,
	});
}
