import type { ReactNode } from 'react';
import {
	eventUrl,
	fetchTickets,
	filterDisplayable,
	grossPrice,
	priceDisplay,
	releaseStatus,
	releaseTitle,
	round2,
	waveDeadline,
	type ReleaseStatus,
	type TitoRelease,
} from '../lib/tito';
import { track } from '../lib/analytics';
import { useRemoteData } from '../lib/useRemoteData';
import { EmptyState, ErrorState, LoadingState } from './DataState';
import s from './Tickets.module.scss';

// Static copy keyed by lowercased group name. Overrides whatever ti.to
// returns in the release `description` so marketing copy stays in repo,
// not in the ti.to admin.
const GROUP_DESCRIPTIONS: Record<string, string> = {
	'early bird': 'The lowest ticket price of the year. Limited early availability.',
	regular: 'Standard pricing while the wave lasts — secure your seat early.',
	'lazy bird': 'Last chance to grab a ticket. Late pricing, same full access.',
};

function groupDescription(groupName: string, fallback: string | null): string | null {
	return GROUP_DESCRIPTIONS[groupName.trim().toLowerCase()] ?? fallback;
}

interface TicketsData {
	releases: TitoRelease[];
	accountSlug: string;
	eventSlug: string;
}

const EMPTY_DATA: TicketsData = { releases: [], accountSlug: '', eventSlug: '' };

/** Plain fetch of the CDN-cached `ticketsApi` endpoint (Hosting rewrites
 * /api/tickets → the function, which reads RTDB via the Admin SDK) — no
 * Firebase SDK / App Check on this path. A `null` cache (no data written yet)
 * and a real cache with no publicly-visible releases both read as "empty". */
function loadTickets(signal: AbortSignal): Promise<TicketsData> {
	return fetchTickets(signal).then((data) => {
		if (!data) return EMPTY_DATA;
		return {
			releases: filterDisplayable(data.releases ?? []),
			accountSlug: data.accountSlug ?? '',
			eventSlug: data.eventSlug ?? '',
		};
	});
}

interface ReleaseGroup {
	name: string;
	description: string | null;
	variants: Array<{ release: TitoRelease; variantLabel: string }>;
}

/**
 * Group releases that share a base name (e.g. "Early bird — Individual"
 * and "Early bird — Company funded" → one "Early bird" card with two
 * variants). Splits on em-dash / en-dash / hyphen surrounded by spaces.
 * Group description is taken from the first variant that has one.
 */
function groupReleases(releases: TitoRelease[]): ReleaseGroup[] {
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

/**
 * Report the click on a wave's Buy CTA as GA4's recommended `begin_checkout`.
 * Checkout happens on ti.to, on a domain we don't measure, so this is the last
 * thing GA4 can see of a ticket sale — the outbound click itself is invisible to
 * it otherwise. Items carry only the buyable variants of the wave, priced gross
 * (what the visitor actually pays), matching the figure on the stub.
 */
function trackBeginCheckout(group: ReleaseGroup, statuses: ReleaseStatus[]): void {
	const items = group.variants
		.filter((_, i) => statuses[i]?.purchasable)
		.map(({ release, variantLabel }) => {
			const price = grossPrice(release);
			return {
				item_id: release.slug,
				item_name: releaseTitle(release),
				item_category: group.name,
				...(variantLabel ? { item_variant: variantLabel } : {}),
				...(price != null ? { price: round2(price) } : {}),
				quantity: 1,
			};
		});
	// `value` is the wave's lead price — the figure printed on the stub, and what
	// one ticket costs. Summing the variants would be wrong: they are alternatives
	// (Individual *or* Company funded), not a cart. GA4 ignores `value` without a
	// `currency`, so the two are sent together or not at all (free / unpriced wave).
	const value = items.find((i) => typeof i.price === 'number')?.price;
	const currency = group.variants.find(({ release }) => release.currency)?.release.currency;
	track('begin_checkout', {
		...(value != null ? { currency: (currency ?? 'CZK').toUpperCase(), value } : {}),
		items,
	});
}

/**
 * Every render path is the same `#tickets` section, so its class list is stated
 * once. `anchor-target` (BaseLayout.scss) is what makes "Get tickets" land on
 * the heading instead of on the section's opening air — hand-repeated on each
 * state, the next state added would silently drop it and the anchor would break
 * only in that state.
 */
const sectionClass = `${s.tickets} anchor-target`;

/**
 * The `#tickets` section shell every render branch below shares: the
 * `<header className="head-split">` + `<h2 id="tickets-heading">` block was
 * hand-repeated across all four branches (error/loading/empty/ready) — see
 * R-D7. `id="tickets-heading"` lives on exactly this one element now,
 * removing the duplicated-id a11y risk (`aria-labelledby` targets it).
 */
function TicketsSection({
	busy,
	note,
	className,
	beforeHeader,
	children,
}: {
	/** Sets `aria-busy` — the loading branch only. */
	busy?: boolean;
	/** Rendered inside the header, after the heading (a `<p className="head-note">`
	 * or, while loading, the `<LoadingState>` itself). */
	note?: ReactNode;
	/** Extra section class(es) — the ready branch's `rake` sweep. */
	className?: string;
	/** Decorative content that must sit BEFORE the header (the ready branch's
	 * `.rake-beam`). */
	beforeHeader?: ReactNode;
	children: ReactNode;
}) {
	return (
		<section
			id="tickets"
			className={className ? `${sectionClass} ${className}` : sectionClass}
			aria-labelledby="tickets-heading"
			aria-busy={busy || undefined}
		>
			{beforeHeader}
			<header className="head-split">
				<h2 id="tickets-heading" className="display head-title">Buy your way in.</h2>
				{note}
			</header>
			{children}
		</section>
	);
}

export default function Tickets() {
	const { status, data } = useRemoteData(loadTickets, {
		isEmpty: (d) => d.releases.length === 0,
		logLabel: '[tickets] Failed to load tickets:',
	});

	if (status === 'error') {
		return (
			<TicketsSection>
				<ErrorState>
					<p>The box office isn't answering. Reload, or buy direct on ti.to.</p>
				</ErrorState>
			</TicketsSection>
		);
	}

	if (status === 'loading') {
		return (
			<TicketsSection busy note={<LoadingState label="Opening the box office" />}>
				<ul className={`field ${s.skelField}`} role="list" aria-hidden="true">
					{[0, 1, 2].map((i) => (
						<li key={i} className={`field-row field-row--short ${s.skelWave}`}>
							<span className={`${s.skelBar} ${s.skelIndex}`} />
							<div className={s.skelCol}>
								<span className={`${s.skelBar} ${s.skelTitle}`} />
								<span className={`${s.skelBar} ${s.skelText}`} />
								<span className={`${s.skelBar} ${s.skelFacts}`} />
							</div>
							<div className={`${s.skelCol} ${s.skelColRight}`}>
								<span className={`${s.skelBar} ${s.skelPrice}`} />
								{i === 1 && <span className={`${s.skelBar} ${s.skelBtn}`} />}
							</div>
						</li>
					))}
				</ul>
			</TicketsSection>
		);
	}

	// Non-null here: `status` is 'empty' or 'ready' only once `data` has landed.
	const { releases, accountSlug, eventSlug } = data ?? EMPTY_DATA;
	const hasEvent = Boolean(accountSlug && eventSlug);

	if (status === 'empty') {
		if (!hasEvent) return null;
		return (
			<TicketsSection note={<p className="head-note">The box office is closed. It opens with the first wave.</p>}>
				<EmptyState
					action={{ href: eventUrl(accountSlug, eventSlug), label: 'Visit ti.to event', external: true }}
				>
					<p>Subscribe above to be notified when tickets go on sale.</p>
				</EmptyState>
			</TicketsSection>
		);
	}

	// A paused wave that already sold tickets is always an earlier wave
	// (future waves have no sales → "Coming soon"). So once any wave is on
	// sale, that paused wave has been superseded — it reads "Ended", not
	// "Paused". See releaseStatus().
	const laterWaveOnSale = releases.some((r) => releaseStatus(r).purchasable);

	return (
		<TicketsSection
			className="rake"
			// Red raking light, swept by the scroll itself. Purely decorative and
			// enhancement-only — see the `.rake` rules in BaseLayout.scss.
			beforeHeader={<span className="rake-beam" aria-hidden="true" />}
			// Title left, lede right — see the note on `.header`. The mono
			// "Tickets" eyebrow above it was the page's THIRD "tickets" in one
			// viewport (the nav button, this label, and the row CTA), and the
			// stack under it was the shape the speakers teaser was also using.
			note={<p className="head-note">Three waves: early bird, regular, lazy bird. Individual or company-funded.</p>}
		>
			<ul className={`field ${s.stubs}`} role="list">
				{groupReleases(releases).map((group, i) => {
					const statuses = group.variants.map((v) => releaseStatus(v.release, { laterWaveOnSale }));
					const anyPurchasable = statuses.some((st) => st.purchasable);
					// When no variant is buyable, pick a non-sold-out summary if one
					// exists so a "Paused" or "Coming soon" wave isn't labeled "Sold
					// out" just because one variant ran out.
					const summary: ReleaseStatus | null = anyPurchasable
						? null
						: statuses.find((st) => st.tone !== 'sold-out') ?? statuses[0];
					// A wave is a pass, so it renders as a stub. The live one carries the
					// red admission band; a settled one is cancelled on its counterfoil,
					// which keeps every word of copy at full contrast (WCAG 1.4.3) rather
					// than overprinting VOID across live text.
					const prices = group.variants
						.map(({ release }) => priceDisplay(release))
						.filter((p): p is NonNullable<typeof p> => Boolean(p));
					const lead = prices[0];
					const manyPrices = new Set(prices.map((p) => p.primary)).size > 1;
					const description = groupDescription(group.name, group.description);
					// ti.to's sale window, and ONLY for a wave a visitor can still buy
					// into: the deadline is fed the purchasable variants, judged by the
					// same `releaseStatus()` that prints the badge, never by `end_at`
					// itself. Otherwise the two disagree — production has an Early bird
					// closed by hand ahead of its window, so the row read "Ended" beside
					// "Ends Oct 15". A closed, sold-out or upcoming wave shows no date.
					// Most releases still carry no `end_at` either, so this is null far
					// more often than not — the line is simply absent then, never an
					// empty slot or an "Invalid Date".
					const deadline = waveDeadline(
						group.variants.filter((_, vi) => statuses[vi].purchasable).map((v) => v.release),
					);
					const serial = String(i + 1).padStart(2, '0');
					return (
						<li
							key={group.name}
							className={`field-row field-row--short field-row--holds ${s.stub} ${anyPurchasable ? s.stubLive : s.stubSpent}`}
						>
							{/* Index and state on one mono line at the head of the row.
							    This replaces a punched perforation, two cut-out notches,
							    a vertical serial, a VOID overprint and a filled ADMIT ONE
							    band — six pieces of ticket cosplay per wave, three waves
							    deep, for information that is two words long. */}
							<span className={s.stubMeta}>
								<span className={s.stubSerial} aria-hidden="true">{serial}</span>
								{anyPurchasable && <span className={s.stubState}>On sale</span>}
							</span>

							<div className={s.stubBody}>
								<h3 className={s.stubTitle}>{group.name}</h3>
								{anyPurchasable && description && <p className={s.stubNote}>{description}</p>}
								{/* Deadline and admission line are both mono caps, so stacked they
								    read as one undifferentiated block of small text. They share a
								    single wrapping line instead, set off from the prose above by
								    air — one fact group, not two more rows in the pile. */}
								<div className={s.stubFacts}>
									{deadline && (
										<p className={s.stubDeadline}>
											<time dateTime={deadline.iso}>{deadline.label}</time>
										</p>
									)}
									<ul className={s.stubGrants}>
										{group.variants.map(({ release, variantLabel }, vi) => (
											<li key={release.id}>
												{vi > 0 && (
													<span className={s.stubGrantSep} aria-hidden="true">{'/ '}</span>
												)}
												{variantLabel || releaseTitle(release)}
											</li>
										))}
									</ul>
								</div>
							</div>

							<div className={s.stubEnd}>
								{lead && (
									<span className={s.stubPriceGroup}>
										<span className={s.stubPrice}>
											{manyPrices ? `${lead.primary}+` : lead.primary}
										</span>
										{lead.secondary && (
											<span className={s.stubVat}>{lead.secondary}</span>
										)}
									</span>
								)}
								{anyPurchasable ? (
									<a
										className={s.cta}
										href={eventUrl(accountSlug, eventSlug)}
										target="_blank"
										rel="noopener noreferrer"
										aria-label={`Get ${group.name} tickets on ti.to`}
										onClick={() => trackBeginCheckout(group, statuses)}
									>
										Get tickets
									</a>
								) : (
									<span className="record-status">{summary?.label ?? 'Unavailable'}</span>
								)}
							</div>
						</li>
					);
				})}
			</ul>
			<p className={s.footnote}>
				Not ready yet?{' '}
				<a href="#newsletter" className={s.footnoteLink}>
					Notify me when the next wave drops
				</a>
			</p>
			<div className={s.invoice}>
				<span className={s.invoiceLabel}>Buying for a company?</span>
				<a className={s.cta} href="/invoice" aria-label="Request a company invoice">
					Get a company invoice
				</a>
			</div>
		</TicketsSection>
	);
}
