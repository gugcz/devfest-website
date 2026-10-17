import { useMemo } from 'react';
import {
	checkoutUrl,
	eventUrl,
	fetchTickets,
	filterDisplayable,
	groupReleases,
	isFinalWave,
	priceDisplay,
	releaseStatus,
	releaseTitle,
	waveDeadline,
	type ReleaseGroup,
	type ReleaseStatus,
	type TitoRelease,
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

type Variant = ReleaseGroup['variants'][number];

/** The variant an employer pays for: same ticket, invoiced to the company. */
function isCompanyFunded(release: TitoRelease): boolean {
	return releaseTitle(release).toLowerCase().includes('company funded');
}

/** Buy CTA click → `begin_checkout` with the one variant the button opens,
 * tagged with its wave (`item_category`) and variant label. */
function trackVariantCheckout(group: ReleaseGroup, variant: Variant): void {
	trackBeginCheckout([
		{
			release: variant.release,
			item: { item_category: group.name, ...(variant.variantLabel ? { item_variant: variant.variantLabel } : {}) },
		},
	]);
}

/** The wave's price, printed once: the first variant's figure large, and any
 * variant that costs something else as a small data line under it. The
 * buttons below carry no price, so the figure is never read twice. */
function StubPrice({ group }: { group: ReleaseGroup }) {
	// Lead with the first variant that has a figure, not just the first one.
	const leadIdx = group.variants.findIndex((v) => priceDisplay(v.release));
	if (leadIdx < 0) return null;
	const lead = priceDisplay(group.variants[leadIdx].release)!;
	const others = group.variants
		.filter((_, i) => i !== leadIdx)
		.map(({ release, variantLabel }) => ({
			id: release.id,
			label: variantLabel || releaseTitle(release),
			price: priceDisplay(release)?.primary,
		}))
		.filter((o) => o.price && o.price !== lead.primary);
	return (
		<span className={s.stubPriceGroup}>
			<span className={s.stubPrice}>{lead.primary}</span>
			{others.map((o) => (
				<span key={o.id} className={s.stubAltPrice}>
					{o.label} {o.price}
				</span>
			))}
		</span>
	);
}

interface StubCtasProps {
	group: ReleaseGroup;
	buyable: Variant[];
	accountSlug: string;
	eventSlug: string;
}

/** One button per buyable variant, each straight into that release's ti.to
 * checkout (`/with/<slug>`), labelled by who pays — the price is the figure
 * above, and the company figure its data line, so who-pays is said twice on
 * the row and no more. The visible label leads the accessible name (WCAG
 * 2.5.3); the name still carries the release and its price for a screen
 * reader. */
function StubCtas({ group, buyable, accountSlug, eventSlug }: StubCtasProps) {
	// "Buy" only works while one variant is not company-funded; two or more
	// (say Regular and Student) need their own names to tell them apart.
	const personal = buyable.filter((v) => !isCompanyFunded(v.release)).length;
	return (
		<div className={s.ctas}>
			{buyable.map((variant, bi) => {
				const price = priceDisplay(variant.release)?.primary;
				const company = isCompanyFunded(variant.release);
				const what = `${releaseTitle(variant.release)} ticket${price ? `, ${price}` : ''}, on ti.to`;
				const label = company
					? 'Company pays'
					: personal > 1
						? variant.variantLabel || releaseTitle(variant.release)
						: 'Buy';
				return (
					<a
						key={variant.release.id}
						className={`${bi === 0 ? 'btn-primary' : 'btn-ghost'} ${s.cta}`}
						href={checkoutUrl(variant.release, accountSlug, eventSlug)}
						target="_blank"
						rel="noopener noreferrer"
						aria-label={`${label}: ${what}`}
						onClick={() => trackVariantCheckout(group, variant)}
					>
						{label}
					</a>
				);
			})}
		</div>
	);
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
				<header className="head-rule">
					<h2 id="tickets-heading" className="head-rule-title">Tickets</h2>
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
				<header className="head-rule">
					<h2 id="tickets-heading" className="head-rule-title">Tickets</h2>
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
				<header className="head-rule">
					<h2 id="tickets-heading" className="head-rule-title">Tickets</h2>
					<p className="head-rule-note">Opens with the first wave</p>
				</header>
				<EmptyState
					action={hasEvent ? { href: eventUrl(accountSlug, eventSlug), label: 'Visit ti.to event', external: true } : undefined}
				>
					<p>
						<a href="#newsletter" className={s.footnoteLink}>
							Join the newsletter
						</a>{' '}
						to hear when the first wave opens.
					</p>
				</EmptyState>
			</section>
		);
	}

	// A paused wave that already sold tickets is always an earlier wave
	// (future waves have no sales → "Coming soon"). So once any wave is on
	// sale, that paused wave has been superseded — it reads "Ended", not
	// "Paused". See releaseStatus().
	const laterWaveOnSale = releases.some((r) => releaseStatus(r).purchasable);
	// Every price is gross, so the tax line is said once under the list
	// instead of under each figure.
	const vatNote = releases.map((r) => priceDisplay(r)?.secondary).find(Boolean);
	// Nothing left to wait for (no "Coming soon" wave): the section stops
	// pitching "earlier is cheaper" and the next-wave newsletter, and says
	// this is the last call instead.
	const finalWave = isFinalWave(releases);
	const groups = groupReleases(releases);
	const finalName = finalWave
		? groups.find((g) => g.variants.some((v) => releaseStatus(v.release).purchasable))?.name
		: undefined;

	return (
		<section id="tickets" className={sectionClass} aria-labelledby="tickets-heading">
			{/* The ledger: a ruled head, then one ruled row per wave. */}
			<header className="head-rule">
				<h2 id="tickets-heading" className="head-rule-title">Tickets</h2>
				<p className="head-rule-note">
					{finalWave ? `${finalName ?? 'This'} is the final wave` : (vatNote ?? 'Prices in CZK')}
				</p>
			</header>
			<ul className={`field ${s.stubs}`} role="list">
				{groups.map((group, i) => {
					const statuses = group.variants.map((v) => releaseStatus(v.release, { laterWaveOnSale }));
					const anyPurchasable = statuses.some((st) => st.purchasable);
					const buyable = group.variants.filter((_, vi) => statuses[vi].purchasable);
					// When no variant is buyable, pick a non-sold-out summary if one
					// exists so a "Paused" or "Coming soon" wave isn't labeled "Sold
					// out" just because one variant ran out.
					const summary: ReleaseStatus | null = anyPurchasable
						? null
						: statuses.find((st) => st.tone !== 'sold-out') ?? statuses[0];
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
								{anyPurchasable && (
									<span className={finalWave ? `${s.stubState} ${s.stubStateFinal}` : s.stubState}>
										{finalWave ? 'Last chance' : 'On sale'}
									</span>
								)}
							</span>

							<div className={s.stubBody}>
								<h3 className={s.stubTitle}>{group.name}</h3>
								{/* The wave's one fact: its sale window, when the organizer set one. */}
								{deadline && (
									<p className={s.stubDeadline}>
										<time dateTime={deadline.iso}>{deadline.label}</time>
									</p>
								)}
							</div>

							<div className={s.stubEnd}>
								<StubPrice group={group} />
								{anyPurchasable ? (
									<StubCtas group={group} buyable={buyable} accountSlug={accountSlug} eventSlug={eventSlug} />
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
			    wave's own buy button for the one primary action in the section.
			    The tax line leads, right under the figures it qualifies. */}
			<p className={s.footnote}>
				{vatNote && <>{vatNote} in every price. </>}
				Need to pay by bank transfer?{' '}
				<a href="/invoice" className={s.footnoteLink}>
					Request a company invoice
				</a>
			</p>
			{/* No next wave to be notified about once the final one is on sale. */}
			{!finalWave && (
				<p className={s.footnote}>
					Not ready yet?{' '}
					<a href="#newsletter" className={s.footnoteLink}>
						Notify me when the next wave drops
					</a>
				</p>
			)}
		</section>
	);
}
