/**
 * ti.to types + browser-safe helpers. API calls live in
 * `functions/src/tickets/tito-api.ts`, which also synthesises `sale_status`
 * (`deriveSaleStatus`). Docs: https://ti.to/docs/api/admin/3.0.
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
	/**
	 * Coarse "has this wave ever sold a ticket?" flag. The raw
	 * `quantity` / `quantity_sold` / `tickets_count` counts are deliberately NOT
	 * published to the world-readable `/tickets` cache — they leak sales velocity.
	 */
	has_sales?: boolean;
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

/** How long a resolved payload is reused. Mirrors the endpoint's edge TTL —
 * the module lives for the whole visit, and a session-long memo would keep
 * showing a wave that has since sold out. */
const MEMO_TTL_MS = 5 * 60 * 1000;

let inFlight: { at: number; promise: Promise<TicketsCache | null> } | null = null;

async function requestTickets(): Promise<TicketsCache | null> {
	const res = await fetch('/api/tickets');
	if (!res.ok) throw new Error(`tickets fetch failed: ${res.status}`);
	return (await res.json()) as TicketsCache | null;
}

/**
 * Fetch the cached roadmap from `/api/tickets`. Throws on non-OK. Memoised
 * per page (several islands want it; the endpoint sends `max-age=0`);
 * rejections not memoised. `signal` aborts the CALLER's wait, not the
 * shared request.
 */
export function fetchTickets(signal?: AbortSignal): Promise<TicketsCache | null> {
	if (!inFlight || Date.now() - inFlight.at > MEMO_TTL_MS) {
		const promise = requestTickets().catch((err) => {
			if (inFlight?.promise === promise) inFlight = null;
			throw err;
		});
		inFlight = { at: Date.now(), promise };
	}
	const shared = inFlight.promise;
	if (!signal) return shared;
	return new Promise<TicketsCache | null>((resolve, reject) => {
		const abort = () => reject(new DOMException('Aborted', 'AbortError'));
		if (signal.aborted) return abort();
		signal.addEventListener('abort', abort, { once: true });
		shared.then(resolve, reject).finally(() => signal.removeEventListener('abort', abort));
	});
}

/** Public releases only. Mirrors server-side `isWebsiteVisible()` as
 * defence-in-depth. Drops only `secret`; `releaseStatus()` maps every other
 * state to a badge. */
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
 * Map a ti.to release to a display status. Sold-out wins over `sale_status`
 * in case ti.to flips only the `sold_out` flag.
 *
 * `paused` covers three realities:
 * - future wave kept toggled off (no `start_at`, so never `upcoming`), never
 *   sold → "Coming soon";
 * - earlier wave closed because a later one opened (`opts.laterWaveOnSale`)
 *   → "Ended";
 * - genuinely interrupted, may resume → "Paused".
 */
export function releaseStatus(
	release: TitoRelease,
	opts?: { laterWaveOnSale?: boolean },
): ReleaseStatus {
	if (release.sold_out || release.sale_status === 'sold_out') {
		return { label: 'Sold out', tone: 'sold-out', purchasable: false };
	}
	switch (release.sale_status) {
		case 'on_sale':
			return { label: 'On sale', tone: 'on-sale', purchasable: true };
		case 'paused':
			if (!release.has_sales) {
				return { label: 'Coming soon', tone: 'soon', purchasable: false };
			}
			if (opts?.laterWaveOnSale) {
				return { label: 'Ended', tone: 'ended', purchasable: false };
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

/** Czech standard VAT rate. Fallback for a tax-exclusive release — ti.to's
 * Admin API exposes no tax rate or gross figure. Unused when the release is
 * tax-inclusive (`price` is already gross). */
export const FALLBACK_VAT_RATE = 0.21;

/** Gross unit price, or `null` when free / no usable price. The single VAT
 * assumption shared by `priceDisplay`, the invoice estimate and GA4 events:
 * a tax-exclusive release is grossed up with `FALLBACK_VAT_RATE`, then
 * rounded to the haléř — ti.to stores the net to two places (2478.51), so
 * the raw product is 2998.9971 and printed "2 999,00 Kč" instead of the
 * 2 999 Kč ti.to charges. */
export function grossPrice(release: TitoRelease): number | null {
	if (release.price == null) return null;
	const price = Number(release.price);
	if (!Number.isFinite(price) || price === 0) return null;
	const gross = release.tax_exclusive === false ? price : price * (1 + FALLBACK_VAT_RATE);
	return Math.round(gross * 100) / 100;
}

export interface PriceDisplay {
	/** Primary amount shown — gross when known, else net. */
	primary: string;
	/** Secondary line (e.g. "incl. VAT 21%" / "ex VAT €100"). Null when nothing to add. */
	secondary: string | null;
}

/** Price display lines for a release. Primary is always gross (what the
 * visitor pays) with a "VAT included" tag; tax-exclusive releases are grossed
 * up via `grossPrice()`. Secondary uses `tax_description` when set. */
export function priceDisplay(release: TitoRelease): PriceDisplay | null {
	if (release.price == null) return { primary: 'Free', secondary: null };
	const price = Number(release.price);
	if (!Number.isFinite(price)) return { primary: release.price, secondary: null };
	if (price === 0) return { primary: 'Free', secondary: null };

	const currency = release.currency;
	const label = (release.tax_description ?? '').trim() || 'VAT';
	const gross = grossPrice(release) ?? price;

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

/** Wave end date (`end_at`). Most releases still carry `null`. Returns
 * `null` for missing/unparseable — never an `Invalid Date`, which puts the
 * literal "Invalid Date" on the page. */
export function releaseEnd(release: TitoRelease): Date | null {
	const raw = release.end_at;
	if (typeof raw !== 'string' || raw.trim() === '') return null;
	const date = new Date(raw);
	return Number.isNaN(date.getTime()) ? null : date;
}

export interface WaveDeadline {
	/** Rendered line, e.g. "Ends Sep 30, 2026". */
	label: string;
	/** The bare day, e.g. "Sep 30" — for a line that already names the year's event. */
	day: string;
	/** Machine-readable value for `<time dateTime>`. */
	iso: string;
}

/** Deadline for a wave: LATEST `end_at` across the still-buyable variants
 * passed in. A past date yields `null` — the cache is up to an hour stale,
 * and "Ended" beside a live Buy CTA must never happen. */
export function waveDeadline(releases: TitoRelease[], now: number = Date.now()): WaveDeadline | null {
	let latest: Date | null = null;
	for (const release of releases) {
		const end = releaseEnd(release);
		if (end && (!latest || end > latest)) latest = end;
	}
	if (!latest || latest.getTime() <= now) return null;
	return {
		label: `Ends ${formatWaveDate(latest)}`,
		day: formatWaveDate(latest, false),
		iso: latest.toISOString(),
	};
}

/** Short date in the site's one format (`en-US` short month, same as
 * `/press`). Pinned to Europe/Prague so a visitor abroad doesn't read a
 * deadline a day off from the one ti.to enforces. */
function formatWaveDate(date: Date, withYear = true): string {
	try {
		return new Intl.DateTimeFormat('en-US', {
			month: 'short',
			day: 'numeric',
			...(withYear ? { year: 'numeric' } : {}),
			timeZone: 'Europe/Prague',
		}).format(date);
	} catch {
		return date.toISOString().slice(0, 10);
	}
}

export interface ReleaseGroup {
	name: string;
	description: string | null;
	variants: Array<{ release: TitoRelease; variantLabel: string }>;
}

/**
 * Group releases that share a base name (e.g. "Early bird — Individual"
 * and "Early bird — Company funded" → one "Early bird" wave with two
 * variants). Splits on em-dash / en-dash / hyphen surrounded by spaces.
 * Group description is taken from the first variant that has one.
 */
export function groupReleases(releases: TitoRelease[]): ReleaseGroup[] {
	const map = new Map<string, ReleaseGroup>();
	for (const release of releases) {
		const parts = releaseTitle(release).split(/\s+[—–-]\s+/);
		const base = parts[0].trim();
		const variantLabel = (parts[1] ?? '').trim();
		let group = map.get(base);
		if (!group) {
			group = { name: base, description: release.description, variants: [] };
			map.set(base, group);
		} else if (!group.description && release.description) {
			group.description = release.description;
		}
		group.variants.push({ release, variantLabel });
	}
	return Array.from(map.values());
}

export interface CurrentOffer {
	/** Cheapest gross price a visitor can buy right now, formatted. */
	price: string;
	/** When the wave closes, or `null` when ti.to carries no future `end_at`. */
	deadline: WaveDeadline | null;
	/** Cheapest gross price of the next wave still to open, when it is higher. */
	nextPrice: string | null;
}

/**
 * The one-line offer for the hero: the wave on sale's lowest price, its
 * deadline and what the price becomes after it. Every figure comes from the
 * ti.to cache — `null` when nothing is buyable or the wave is free, so the
 * line is simply absent rather than stating something ti.to does not.
 */
export function currentOffer(releases: TitoRelease[], now: number = Date.now()): CurrentOffer | null {
	const groups = groupReleases(filterDisplayable(releases));
	const laterWaveOnSale = releases.some((r) => releaseStatus(r).purchasable);
	const liveIndex = groups.findIndex((g) => g.variants.some((v) => releaseStatus(v.release).purchasable));
	if (liveIndex === -1) return null;

	const live = groups[liveIndex];
	const buyable = live.variants.filter((v) => releaseStatus(v.release).purchasable).map((v) => v.release);
	const lowest = (list: TitoRelease[]): { amount: number; currency: string | null } | null =>
		list.reduce<{ amount: number; currency: string | null } | null>((min, release) => {
			const gross = grossPrice(release);
			return gross != null && (!min || gross < min.amount) ? { amount: gross, currency: release.currency } : min;
		}, null);

	const price = lowest(buyable);
	if (!price) return null;

	// The next wave is the first later one still to open ("Coming soon"), never
	// a sold-out or ended one — only that price is what "then" means.
	const next = groups
		.slice(liveIndex + 1)
		.find((g) => g.variants.every((v) => releaseStatus(v.release, { laterWaveOnSale }).tone === 'soon'));
	const nextPrice = next ? lowest(next.variants.map((v) => v.release)) : null;

	return {
		price: formatAmount(price.amount, price.currency),
		deadline: waveDeadline(buyable, now),
		nextPrice: nextPrice && nextPrice.amount > price.amount ? formatAmount(nextPrice.amount, nextPrice.currency) : null,
	};
}
