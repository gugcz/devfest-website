/**
 * ti.to Admin API client.
 *
 * Docs: https://ti.to/docs/api/admin/3.0 (stable). v3.1 is in beta; we
 * pin to v3.0 by hitting `https://api.tito.io/v3/...` without a beta
 * opt-in (v3.0 is the default served at that path).
 *
 * Field naming follows the actual v3.0 response. Notable differences
 * from what older code assumed:
 *
 *   - There is no `sale_status` or `accessibility` field. The release's
 *     buyability is encoded across the boolean flags `sold_out`,
 *     `off_sale`, `expired`, `upcoming`, `locked`, `archived`, `secret`.
 *     We compute a synthetic `sale_status` from those flags via
 *     `deriveSaleStatus()` below so the rest of the codebase has a
 *     single, stable status string to switch on.
 *   - The state field is `state_name` (e.g. `"on_sale"`) — not `state`.
 *   - Sale window dates are `start_at` / `end_at` (not `sales_start` /
 *     `sales_end`).
 */

const TITO_API_BASE = 'https://api.tito.io/v3';

export type DerivedSaleStatus =
	| 'on_sale'
	| 'sold_out'
	| 'paused'
	| 'not_yet_on_sale'
	| 'ended'
	| 'archived';

export interface TitoRelease {
	id: number;
	slug: string;
	title?: string | null;
	description?: string | null;
	price?: string | null;
	/** Net price (excl. tax). Always reliably net regardless of `tax_exclusive`. */
	price_ex_tax?: string | null;
	/** True when organizer entered `price` as net (gross = price + tax). */
	tax_exclusive?: boolean | null;
	/** Free-text tax label set by organizer (e.g. "VAT 21%"). Not structured. */
	tax_description?: string | null;
	currency?: string | null;
	quantity?: number | null;
	quantity_sold?: number;
	tickets_count?: number;
	state_name?: string;
	sold_out?: boolean;
	off_sale?: boolean;
	expired?: boolean;
	upcoming?: boolean;
	locked?: boolean;
	archived?: boolean;
	secret?: boolean;
	start_at?: string | null;
	end_at?: string | null;
	[key: string]: unknown;
}

export interface FetchReleasesParams {
	token: string;
	accountSlug: string;
	eventSlug: string;
}

interface TitoReleasesPage {
	releases?: TitoRelease[];
	meta?: {
		total_pages?: number;
		total_count?: number;
	};
}

/**
 * Derive a single sale-status string from the flag fields ti.to actually
 * returns. Order matters: `sold_out` wins because it is the most
 * informative signal for a visitor; `archived` wins over the time-based
 * flags because an archived release is not coming back regardless of
 * dates.
 */
export function deriveSaleStatus(r: TitoRelease): DerivedSaleStatus {
	if (r.sold_out) return 'sold_out';
	if (r.archived) return 'archived';
	if (r.expired) return 'ended';
	if (r.upcoming) return 'not_yet_on_sale';
	if (r.off_sale || r.locked) return 'paused';
	return 'on_sale';
}

/**
 * Display title. v3.0 returns `title`; fall back to `slug` defensively
 * in case ti.to omits it for some release shape.
 */
export function releaseTitle(r: TitoRelease): string {
	return r.title ?? r.slug;
}

/**
 * Fields persisted to RTDB. Anything not in this list is dropped during
 * projection so the cache shape stays stable even if ti.to adds fields.
 *
 * The synthetic `sale_status` (computed via `deriveSaleStatus`) is added
 * by `projectRelease` so the browser does not need to know the flag set.
 */
export const RELEASE_FIELDS = [
	'id',
	'slug',
	'title',
	'description',
	'price',
	'price_ex_tax',
	'tax_exclusive',
	'tax_description',
	'currency',
	'quantity',
	'quantity_sold',
	'tickets_count',
	'state_name',
	'sold_out',
	'off_sale',
	'expired',
	'upcoming',
	'locked',
	'archived',
	'secret',
	'start_at',
	'end_at',
] as const;

export function projectRelease(release: TitoRelease): Record<string, unknown> {
	const out: Record<string, unknown> = {};
	for (const key of RELEASE_FIELDS) {
		const value = release[key];
		out[key] = value === undefined ? null : value;
	}
	out.sale_status = deriveSaleStatus(release);
	return out;
}

/**
 * Predicate: should this release be persisted to the public RTDB cache?
 *
 * Only `secret` releases (invite-only / private-link) are hidden. All
 * other states — on-sale, sold-out, paused (`off_sale` / `locked`),
 * upcoming, expired, archived — are persisted so the UI can render
 * the full pricing-wave roadmap. Status mapping happens in
 * `releaseStatus()` (`src/lib/tito.ts`): paused/upcoming tiers render
 * with a disabled CTA so visitors can preview waves whose exact
 * release date is not yet known.
 */
export function isWebsiteVisible(release: TitoRelease): boolean {
	if (release.secret) return false;
	return true;
}

export async function fetchAllReleases(params: FetchReleasesParams): Promise<TitoRelease[]> {
	const url = `${TITO_API_BASE}/${params.accountSlug}/${params.eventSlug}/releases?per_page=100`;
	const res = await fetch(url, {
		headers: {
			Authorization: `Token token=${params.token}`,
			Accept: 'application/json',
		},
	});

	if (!res.ok) {
		const body = await res.text().catch(() => '');
		throw new Error(`ti.to API ${res.status} ${res.statusText}: ${body.slice(0, 300)}`);
	}

	const data = (await res.json()) as TitoReleasesPage;
	const releases = data.releases ?? [];

	// Sanity-check: if we ever blow past one page, we'll need to reintroduce
	// pagination — surface it loudly rather than silently dropping rows.
	const totalPages = data.meta?.total_pages ?? 1;
	if (totalPages > 1) {
		throw new Error(
			`ti.to returned ${totalPages} pages of releases — fetchAllReleases only reads page 1. Add pagination.`,
		);
	}

	return releases;
}
