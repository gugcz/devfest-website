/**
 * BUILD-TIME TICKETS for the Event JSON-LD offers, the no-script price list on
 * the home page and `/llms.txt`. Reads the same public `/api/tickets` the
 * browser does (`static-api.ts`), so every figure is ti.to's, as of the build.
 */
import {
	checkoutUrl,
	filterDisplayable,
	grossPrice,
	groupReleases,
	priceDisplay,
	releaseStatus,
	type TicketsCache,
} from './tito';
import { readStaticApi } from './static-api';

/** One ticket type as the Tickets section shows it. */
export interface TicketLine {
	/** The wave, e.g. "Lazy bird". */
	wave: string;
	/** The variant, e.g. "Individual"; empty for a single-variant wave. */
	variant: string;
	/** Wave and variant as one name, e.g. "Lazy bird – Individual". */
	label: string;
	/** Gross amount as a number, for schema.org; `null` when free. */
	gross: number | null;
	/** Gross amount as the site prints it ("2 999 Kč"). */
	price: string;
	/** The status badge ("On sale", "Sold out", "Ended", …). */
	status: string;
	purchasable: boolean;
	/** ti.to checkout for this ticket type. */
	url: string;
}

let memo: Promise<TicketsCache | null> | null = null;
function staticTickets(): Promise<TicketsCache | null> {
	memo ??= readStaticApi('tickets', process.env.DEVFEST_TICKETS_URL).then((raw) => {
		const cache = raw as TicketsCache | null;
		return Array.isArray(cache?.releases) ? cache : null;
	});
	return memo;
}

/** Every public ticket type at build time, the wave on sale first, labelled the
 * way the Tickets island labels it. Empty when the read failed. */
export async function staticTicketLines(): Promise<TicketLine[]> {
	const cache = await staticTickets();
	if (!cache) return [];
	const releases = filterDisplayable(cache.releases);
	// Same rule as the Tickets island: once a wave is on sale, a paused one is
	// an earlier wave and reads "Ended".
	const laterWaveOnSale = releases.some((r) => releaseStatus(r).purchasable);
	const lines = groupReleases(releases).flatMap((group) =>
		group.variants.map(({ release, variantLabel }) => {
			const status = releaseStatus(release, { laterWaveOnSale });
			return {
				wave: group.name,
				variant: variantLabel,
				label: [group.name, variantLabel].filter(Boolean).join(' – '),
				gross: grossPrice(release),
				price: priceDisplay(release)?.primary ?? 'Free',
				status: status.label,
				purchasable: status.purchasable,
				url: checkoutUrl(release, cache.accountSlug, cache.eventSlug),
			};
		}),
	);
	return [...lines.filter((l) => l.purchasable), ...lines.filter((l) => !l.purchasable)];
}
