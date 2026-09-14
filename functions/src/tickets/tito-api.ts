/**
 * ti.to Admin API v3.0 client (https://ti.to/docs/api/admin/3.0). Wire has
 * no `sale_status`: buyability is a flag set (`sold_out`, `off_sale`,
 * `expired`, `upcoming`, `locked`, `archived`, `secret`) and
 * `deriveSaleStatus()` synthesises one string. State field is `state_name`;
 * dates are `start_at` / `end_at`.
 */

import { errorBody, fetchWithRetry } from '../lib/http.js';

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

/** Derive one sale-status string from ti.to's flags. Order matters:
 * `sold_out` wins (most informative), `archived` beats the time-based flags
 * (not coming back regardless of dates). */
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

/** Fields persisted to RTDB. `quantity` / `quantity_sold` / `tickets_count`
 * are deliberately NOT projected (they leak sales velocity); a coarse
 * `has_sales` boolean covers "Paused" vs "Coming soon". */
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
	// Coarse boolean instead of raw counts — see RELEASE_FIELDS note.
	out.has_sales = (release.tickets_count ?? release.quantity_sold ?? 0) > 0;
	return out;
}

/** Should this release be persisted to the public cache? Only `secret`
 * releases are hidden; every other state is kept so the UI renders the full
 * wave roadmap (`releaseStatus()` in `src/lib/tito.ts` maps them). */
export function isWebsiteVisible(release: TitoRelease): boolean {
	if (release.secret) return false;
	return true;
}

export async function fetchAllReleases(params: FetchReleasesParams): Promise<TitoRelease[]> {
	const url = `${TITO_API_BASE}/${params.accountSlug}/${params.eventSlug}/releases?per_page=100`;
	// Read-only, so it retries transient faults: this backs the hourly cache
	// refresh and both status reports, and a blip there means stale ticket data on
	// the site or a status report that silently never arrives.
	const res = await fetchWithRetry(
		url,
		{
			headers: {
				Authorization: `Token token=${params.token}`,
				Accept: 'application/json',
			},
		},
		{ label: 'ti.to releases' },
	);

	if (!res.ok) {
		throw new Error(`ti.to releases ${res.status} ${res.statusText}: ${await errorBody(res)}`);
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
