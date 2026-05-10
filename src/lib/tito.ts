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

export type TitoAccessibility = 'public' | 'private' | 'protected' | string;

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
	/**
	 * `public` — listed on the site.
	 * `private` — invite-only / sales-link-only; never listed.
	 * `protected` — password-gated; not listed publicly.
	 */
	accessibility: TitoAccessibility | null;
}

export interface TicketsCache {
	accountSlug: string;
	eventSlug: string;
	fetchedAt: number;
	releases: TitoRelease[];
}

/**
 * Filter to releases that should be shown publicly. Drafts and archived
 * releases are hidden via `state`. Releases marked `private` or
 * `protected` in ti.to (Sales link only / password-protected) are also
 * hidden — they remain reachable via their direct ti.to URL but never
 * appear in the lineup.
 *
 * `paused`, `not_yet_on_sale`, `ended`, and `sold_out` releases are kept
 * so visitors can see the full lineup with appropriate status badges;
 * the UI disables the Buy CTA when the release is not `on_sale`.
 */
export function filterDisplayable(releases: TitoRelease[]): TitoRelease[] {
	return releases.filter((r) => {
		if (r.state && r.state !== 'live' && r.state !== 'on_sale') return false;
		if (r.accessibility && r.accessibility !== 'public') return false;
		return true;
	});
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
 * `sale_status` to keep the UI consistent when ti.to flips just the
 * `sold_out` flag without updating `sale_status`.
 */
export function releaseStatus(release: TitoRelease): ReleaseStatus {
	if (release.sold_out || release.sale_status === 'sold_out') {
		return { label: 'Sold out', tone: 'sold-out', purchasable: false };
	}
	switch (release.sale_status) {
		case 'on_sale':
			return { label: 'On sale', tone: 'on-sale', purchasable: true };
		case 'paused':
			return { label: 'Paused', tone: 'paused', purchasable: false };
		case 'not_yet_on_sale':
			return { label: 'Coming soon', tone: 'soon', purchasable: false };
		case 'ended':
			return { label: 'Ended', tone: 'ended', purchasable: false };
		default:
			return { label: release.sale_status || 'Unavailable', tone: 'paused', purchasable: false };
	}
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
