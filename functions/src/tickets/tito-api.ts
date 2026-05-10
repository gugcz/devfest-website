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
		current_page?: number;
		total_pages?: number;
		total_count?: number;
		per_page?: number;
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
	const state = typeof release.state === 'string' ? release.state : '';
	if (state && state !== 'live' && state !== 'on_sale') return false;

	const accessibility = typeof release.accessibility === 'string' ? release.accessibility : '';
	if (accessibility && accessibility !== 'public') return false;

	const saleStatus = typeof release.sale_status === 'string' ? release.sale_status : '';
	const soldOutFlag = release.sold_out === true;
	if (saleStatus === 'on_sale') return true;
	if (saleStatus === 'sold_out' || soldOutFlag) return true;

	return false;
}

export async function fetchAllReleases(params: FetchReleasesParams): Promise<TitoRelease[]> {
	const releases: TitoRelease[] = [];
	let page = 1;
	const perPage = 100;

	while (true) {
		const url = `${TITO_API_BASE}/${params.accountSlug}/${params.eventSlug}/releases?page=${page}&per_page=${perPage}`;
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
		releases.push(...(data.releases ?? []));

		const totalPages = data.meta?.total_pages ?? 1;
		if (page >= totalPages) break;
		page += 1;
	}

	return releases;
}
