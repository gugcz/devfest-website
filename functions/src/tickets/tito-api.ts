/**
 * ti.to Admin API client.
 *
 * Docs: https://ti.to/docs/api/admin/3.1
 */

const TITO_API_BASE = 'https://api.tito.io/v3';

export interface TitoRelease {
	id: number;
	slug: string;
	title: string;
	description?: string | null;
	price?: string | null;
	currency?: string | null;
	quantity?: number | null;
	quantity_sold?: number;
	sale_status?: string;
	state?: string;
	sold_out?: boolean;
	sales_start?: string | null;
	sales_end?: string | null;
	accessibility?: string | null;
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
 * Fields persisted to RTDB. Anything not in this list is dropped during
 * projection so the cache shape stays stable even if ti.to adds fields.
 */
export const RELEASE_FIELDS = [
	'id',
	'slug',
	'title',
	'description',
	'price',
	'currency',
	'quantity',
	'quantity_sold',
	'sale_status',
	'state',
	'sold_out',
	'sales_start',
	'sales_end',
	'accessibility',
] as const;

export function projectRelease(release: TitoRelease): Record<string, unknown> {
	const out: Record<string, unknown> = {};
	for (const key of RELEASE_FIELDS) {
		const value = release[key];
		out[key] = value === undefined ? null : value;
	}
	return out;
}

/**
 * Predicate: should this release be persisted to the public RTDB cache?
 *
 * Hidden:
 *   - drafts / archived (`state` not `live` / `on_sale`)
 *   - non-public accessibility (`private`, `protected`)
 *   - paused, ended, not-yet-on-sale releases (the visitor cannot act
 *     on them, so we don't list them)
 *
 * Kept:
 *   - `sale_status === 'on_sale'` (buyable)
 *   - `sale_status === 'sold_out'` or `sold_out === true` (informative —
 *     visitors see that a tier sold out)
 *
 * Filtering at the write site keeps unpublished release data out of the
 * publicly readable `/tickets` node entirely.
 */
export function isWebsiteVisible(release: TitoRelease): boolean {
	if (release.state && release.state !== 'live' && release.state !== 'on_sale') return false;
	if (release.accessibility && release.accessibility !== 'public') return false;
	if (release.sale_status === 'on_sale') return true;
	if (release.sale_status === 'sold_out' || release.sold_out === true) return true;
	return false;
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
