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
 * Drafts/archived (`state` neither `live` nor `on_sale`) and any release
 * whose `accessibility` is not `public` (i.e. `private` / `protected`)
 * are dropped before write so they never reach `/tickets/releases` —
 * the node is publicly readable, so unpublished titles must not land
 * there at all.
 */
export function isWebsiteVisible(release: TitoRelease): boolean {
	const state = typeof release.state === 'string' ? release.state : '';
	if (state && state !== 'live' && state !== 'on_sale') return false;

	const accessibility = typeof release.accessibility === 'string' ? release.accessibility : '';
	if (accessibility && accessibility !== 'public') return false;

	return true;
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
