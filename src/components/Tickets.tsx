import { useMemo } from 'react';
import {
	checkoutUrl,
	eventUrl,
	fetchTickets,
	filterDisplayable,
	groupReleases,
	priceDisplay,
	releaseStatus,
	releaseTitle,
	waveDeadline,
	type ReleaseGroup,
	type ReleaseStatus,
} from '../lib/tito';
import { trackBeginCheckout } from '../lib/checkout';
import { useRemote } from '../lib/useRemote';
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

/** Buy CTA click → `begin_checkout` with the one variant the button opens,
 * tagged with its wave (`item_category`) and variant label. */
function trackVariantCheckout(group: ReleaseGroup, variant: ReleaseGroup['variants'][number]): void {
	trackBeginCheckout([
		{
			release: variant.release,
			item: { item_category: group.name, ...(variant.variantLabel ? { item_variant: variant.variantLabel } : {}) },
		},
	]);
}

/** Every render path is the same `#tickets` section, so the class list is
 * stated once. `anchor-target` makes "Get tickets" land on the heading;
 * repeated per state, a new state would silently drop it. */
const sectionClass = `${s.tickets} anchor-target`;

export default function Tickets() {
	// Plain fetch of the CDN-cached `ticketsApi` endpoint (Hosting rewrites
	// /api/tickets → the function, which reads RTDB via the Admin SDK) — no
	// Firebase SDK / App Check on this path. A `null` payload (empty cache,
	// before the first refresh) is "empty", not an error.
	const { status, data } = useRemote(
		fetchTickets,
		'tickets',
		(cache) => !cache || filterDisplayable(cache.releases ?? []).length === 0,
	);
	const releases = useMemo(() => filterDisplayable(data?.releases ?? []), [data]);
	const accountSlug = data?.accountSlug ?? '';
	const eventSlug = data?.eventSlug ?? '';

	if (status === 'error') {
		return (
			<section id="tickets" className={sectionClass} aria-labelledby="tickets-heading">
				<header className="head-split">
					<h2 id="tickets-heading" className="display head-title">Buy your way in.</h2>
				</header>
				<ErrorState>
					<p>The box office isn't answering. Reload, or buy direct on ti.to.</p>
				</ErrorState>
			</section>
		);
	}

	if (status === 'loading') {
		return (
			<section id="tickets" className={sectionClass} aria-busy={true} aria-labelledby="tickets-heading">
				<header className="head-split">
					<h2 id="tickets-heading" className="display head-title">Buy your way in.</h2>
					<LoadingState label="Opening the box office" />
				</header>
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
			</section>
		);
	}

	const hasEvent = Boolean(accountSlug && eventSlug);

	if (status === 'empty') {
		// Render even with no event slugs (empty cache, before the first
		// refresh). Returning null deleted `#tickets` after hydration, so every
		// `/#tickets` link dropped the visitor at the top of the page. Without
		// slugs only the ti.to link is dropped.
		return (
			<section id="tickets" className={sectionClass} aria-labelledby="tickets-heading">
				<header className="head-split">
					<h2 id="tickets-heading" className="display head-title">Buy your way in.</h2>
					<p className="head-note">The box office is closed. It opens with the first wave.</p>
				</header>
				<EmptyState
					action={hasEvent ? { href: eventUrl(accountSlug, eventSlug), label: 'Visit ti.to event', external: true } : undefined}
				>
					<p>Subscribe above to be notified when tickets go on sale.</p>
				</EmptyState>
			</section>
		);
	}

	// A paused wave that already sold tickets is always an earlier wave
	// (future waves have no sales → "Coming soon"). So once any wave is on
	// sale, that paused wave has been superseded — it reads "Ended", not
	// "Paused". See releaseStatus().
	const laterWaveOnSale = releases.some((r) => releaseStatus(r).purchasable);

	return (
		<section id="tickets" className={`${sectionClass} rake`} aria-labelledby="tickets-heading">
			{/* Red raking light, swept by the scroll itself. Purely decorative and
			    enhancement-only — see the `.rake` rules in BaseLayout.scss. */}
			<span className="rake-beam" aria-hidden="true" />
			{/* Title left, lede right — see the note on `.header`. The mono
			    "Tickets" eyebrow above it was the page's THIRD "tickets" in one
			    viewport (the nav button, this label, and the row CTA), and the
			    stack under it was the shape the speakers teaser was also using. */}
			<header className="head-split">
				<h2 id="tickets-heading" className="display head-title">Buy your way in.</h2>
				<p className="head-note">The earlier the wave, the lower the price.</p>
			</header>
			<ul className={`field ${s.stubs}`} role="list">
				{groupReleases(releases).map((group, i) => {
					const statuses = group.variants.map((v) => releaseStatus(v.release, { laterWaveOnSale }));
					const anyPurchasable = statuses.some((st) => st.purchasable);
					const buyable = group.variants.filter((_, vi) => statuses[vi].purchasable);
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
					// Deadline ONLY for a wave a visitor can still buy into: fed the
					// purchasable variants per the same `releaseStatus()` that prints
					// the badge, never `end_at` alone — otherwise a hand-closed wave
					// reads "Ended" beside "Ends Oct 15". Null far more often than not
					// (most releases carry no `end_at`); the line is then absent.
					const deadline = waveDeadline(buyable.map((v) => v.release));
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
											{/* "From", not a trailing "+": "1 210 Kč+" read as a
											    typo beside the buttons that spell out each price. */}
											{manyPrices && <span className={s.stubFrom}>From </span>}
											{lead.primary}
										</span>
										{lead.secondary && (
											<span className={s.stubVat}>{lead.secondary}</span>
										)}
									</span>
								)}
								{anyPurchasable ? (
									// One button per buyable variant, each straight into that release's
									// ti.to checkout (`/with/<slug>`). The event page made the visitor pick
									// Individual or Company funded a second time, and "2 999 Kč+" hid the
									// company price until they got there.
									<div className={s.ctas}>
										{buyable.map((variant, bi) => {
											const price = priceDisplay(variant.release)?.primary;
											const many = buyable.length > 1;
											const label = many ? variant.variantLabel || releaseTitle(variant.release) : 'Get tickets';
											return (
												<a
													key={variant.release.id}
													className={`${bi === 0 ? 'btn-primary' : 'btn-ghost'} ${s.cta}`}
													href={checkoutUrl(variant.release, accountSlug, eventSlug)}
													target="_blank"
													rel="noopener noreferrer"
													aria-label={`Buy ${releaseTitle(variant.release)} ticket${price ? `, ${price}` : ''}, on ti.to`}
													onClick={() => trackVariantCheckout(group, variant)}
												>
													{many && price ? `${label} · ${price}` : label}
												</a>
											);
										})}
									</div>
								) : (
									<span className="record-status">{summary?.label ?? 'Unavailable'}</span>
								)}
							</div>
						</li>
					);
				})}
			</ul>
			{/* Two quiet side doors, one voice. The invoice route used to be a
			    second filled red button under the list, competing with the live
			    wave's own buy button for the one primary action in the section. */}
			<p className={s.footnote}>
				Not ready yet?{' '}
				<a href="#newsletter" className={s.footnoteLink}>
					Notify me when the next wave drops
				</a>
			</p>
			<p className={s.footnote}>
				Buying for a company?{' '}
				<a href="/invoice" className={s.footnoteLink}>
					Request a company invoice
				</a>
			</p>
		</section>
	);
}
