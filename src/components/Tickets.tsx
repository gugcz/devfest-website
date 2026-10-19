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
import { EVENT } from '../lib/event';
import { useRemote } from '../lib/useRemote';
import { EmptyState, ErrorState, LoadingState } from './DataState';
import s from './Tickets.module.scss';

type Variant = ReleaseGroup['variants'][number];

/** The event day as the slip's edge stamps it: `30.10.2026`. */
const EVENT_DAY_ISO = EVENT.doors.slice(0, 10);
const EVENT_DAY_STAMP = EVENT_DAY_ISO.split('-').reverse().join('.');

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
function SlipPrice({ group }: { group: ReleaseGroup }) {
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
		<>
			<p className={s.price}>{lead.primary}</p>
			{others.map((o) => (
				<p key={o.id} className={s.altPrice}>
					{o.label} <span className={s.altFigure}>{o.price}</span>
				</p>
			))}
		</>
	);
}

interface SlipCtasProps {
	group: ReleaseGroup;
	buyable: Variant[];
	accountSlug: string;
	eventSlug: string;
}

/** One button per buyable variant, each straight into that release's ti.to
 * checkout (`/with/<slug>`), labelled by who pays — the price is the figure
 * above, and the company figure its data line, so who-pays is said twice on
 * the slip and no more. The visible label leads the accessible name (WCAG
 * 2.5.3); the name still carries the release and its price for a screen
 * reader. */
function SlipCtas({ group, buyable, accountSlug, eventSlug }: SlipCtasProps) {
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
						className={bi === 0 ? `btn-primary ${s.buy}` : `btn-ghost ${s.side}`}
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

interface WaveSlipProps {
	group: ReleaseGroup;
	laterWaveOnSale: boolean;
	finalWave: boolean;
	vatNote: string | undefined;
	accountSlug: string;
	eventSlug: string;
}

/** One wave as a paper ticket slip on the table. The wave on sale is the big
 * slip with the Buy button; a spent wave is a small tilted slip the grease
 * pencil crosses out; a wave still to come is a small plain slip. */
function WaveSlip({ group, laterWaveOnSale, finalWave, vatNote, accountSlug, eventSlug }: WaveSlipProps) {
	const statuses = group.variants.map((v) => releaseStatus(v.release, { laterWaveOnSale }));
	const buyable = group.variants.filter((_, vi) => statuses[vi].purchasable);
	const live = buyable.length > 0;
	// When no variant is buyable, pick a non-sold-out summary if one exists so
	// a "Paused" or "Coming soon" wave isn't labeled "Sold out" just because
	// one variant ran out.
	const summary: ReleaseStatus = statuses.find((st) => st.tone !== 'sold-out') ?? statuses[0];
	const spent = !live && (summary.tone === 'sold-out' || summary.tone === 'ended');
	// Deadline ONLY for a wave a visitor can still buy into: fed the purchasable
	// variants per the same `releaseStatus()` that decides the Buy button,
	// never `end_at` alone — otherwise a hand-closed wave reads "Ended" beside
	// "Ends Oct 15". Null far more often than not; the clause is then absent.
	const deadline = waveDeadline(buyable.map((v) => v.release));

	if (!live) {
		return (
			<li className={`${s.slip} ${spent ? s.slipSpent : s.slipSoon}`}>
				<h3 className={s.tier}>{group.name}</h3>
				<SlipPrice group={group} />
				<div className={s.perf} aria-hidden="true" />
				<p className={s.state}>{summary.label}.</p>
				{spent && (
					<svg className={`grease ${s.cross}`} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
						<path d="M8 10 L 92 90 M 90 8 L 12 92" />
					</svg>
				)}
			</li>
		);
	}

	return (
		<li className={`${s.slip} ${s.slipLive}`}>
			<h3 className={s.tier}>{group.name}</h3>
			<SlipPrice group={group} />
			<p className={s.state}>
				{finalWave ? 'The final wave, on sale.' : 'On sale.'}
				{deadline && (
					<>
						{' '}
						<time dateTime={deadline.iso}>{deadline.label}.</time>
					</>
				)}
			</p>
			<div className={s.perf} aria-hidden="true" />
			<div className={s.row}>
				<p className={s.edge}>
					{vatNote && <span>{vatNote}</span>}
					<time className={s.edgeDate} dateTime={EVENT_DAY_ISO}>
						{EVENT_DAY_STAMP}
					</time>
				</p>
				<SlipCtas group={group} buyable={buyable} accountSlug={accountSlug} eventSlug={eventSlug} />
			</div>
		</li>
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
				{/* Two blank slips in the live layout, so nothing reflows on load. */}
				<div className={`${s.slips} ${s.slipsLed}`} aria-hidden="true">
					<div className={`${s.skelSlip} ${s.skelBig}`} />
					<div className={`${s.skelSlip} ${s.skelSmall}`} />
				</div>
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
	// Every price is gross, so the tax line is said once, on the live slip's
	// edge, instead of under each figure.
	const vatNote = releases.map((r) => priceDisplay(r)?.secondary).find(Boolean) ?? undefined;
	// Nothing left to wait for (no "Coming soon" wave): the section stops
	// pitching the next-wave newsletter and says this is the last call instead.
	const finalWave = isFinalWave(releases);
	// The wave on sale leads (first on a phone too); spent and coming waves
	// follow it, small, in their own order.
	const onSale = (group: ReleaseGroup) =>
		group.variants.some((v) => releaseStatus(v.release, { laterWaveOnSale }).purchasable);
	const groups = groupReleases(releases);
	const live = groups.filter(onSale);
	const ordered = [...live, ...groups.filter((g) => !onSale(g))];
	const hasLive = live.length > 0;

	return (
		<section id="tickets" className={sectionClass} aria-labelledby="tickets-heading">
			{/* The head carries the invoice route as its note: a quiet side door
			    beside the poster title, never a second red button. */}
			<header className="head-rule">
				<h2 id="tickets-heading" className="head-rule-title">Tickets</h2>
				<div className={`head-rule-note ${s.note}`}>
					<p>Need to pay by bank transfer?</p>
					<a href="/invoice" className={`action ${s.noteAction}`}>
						Request a company invoice
					</a>
				</div>
			</header>
			<ul className={`${s.slips} ${hasLive ? s.slipsLed : ''}`} role="list">
				{ordered.map((group) => (
					<WaveSlip
						key={group.name}
						group={group}
						laterWaveOnSale={laterWaveOnSale}
						finalWave={finalWave}
						vatNote={vatNote}
						accountSlug={accountSlug}
						eventSlug={eventSlug}
					/>
				))}
			</ul>
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
