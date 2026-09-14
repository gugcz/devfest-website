import { useEffect, useState } from 'react';
import {
	checkoutUrl,
	eventUrl,
	fetchTickets,
	filterDisplayable,
	grossPrice,
	releaseStatus,
	releaseTitle,
	type TitoRelease,
} from '../lib/tito';
import { track } from '../lib/analytics';

/**
 * The single primary action on `/invite/<member>`. An island because the
 * href resolves client-side from `/api/tickets` and the click reports
 * `begin_checkout` with the member — the channel's only attribution.
 * Falls back to `/#tickets` until (or if never) the endpoint answers.
 */

interface Props {
	/** `team.json` id — the attribution key for every event this page sends. */
	memberId: string;
	memberName: string;
	label: string;
	/** Filled by default; the below-fold repeat is the same control. */
	kind?: 'primary' | 'ghost';
	className?: string;
}

/** On-site fallback while tickets are loading or the endpoint is down. */
const FALLBACK_HREF = '/#tickets';

/** Optional ti.to discount link (GitHub Actions secret). When set it wins
 * the href; `/api/tickets` still resolves only for the event payload. */
const DISCOUNT_URL = import.meta.env.PUBLIC_INVITE_DISCOUNT_URL || '';

interface Target {
	href: string;
	external: boolean;
	/** The buyable releases behind this href, for the ecommerce payload. */
	releases: TitoRelease[];
}

const INITIAL: Target = DISCOUNT_URL
	? { href: DISCOUNT_URL, external: true, releases: [] }
	: { href: FALLBACK_HREF, external: false, releases: [] };

/** Two decimals — long VAT floats are noise in the GA4 payload. */
function round2(n: number): number {
	return Math.round(n * 100) / 100;
}

export default function InviteCta({ memberId, memberName, label, kind = 'primary', className }: Props) {
	const [target, setTarget] = useState<Target>(INITIAL);

	useEffect(() => {
		const ac = new AbortController();
		fetchTickets(ac.signal)
			.then((data) => {
				if (!data) return;
				const accountSlug = data.accountSlug ?? '';
				const eventSlug = data.eventSlug ?? '';
				if (!accountSlug || !eventSlug) return;
				const visible = filterDisplayable(data.releases ?? []);
				const buyable = visible.filter((r) => releaseStatus(r).purchasable);
				// A single buyable release can be linked precisely; with several
				// (individual + company-funded of the same wave) the event page is
				// the honest destination — it lists them both.
				const href =
					DISCOUNT_URL ||
					(buyable.length === 1
						? checkoutUrl(buyable[0], accountSlug, eventSlug)
						: eventUrl(accountSlug, eventSlug));
				// Nothing on sale: the ti.to event page still says so truthfully,
				// which beats sending an invited guest to an empty anchor.
				setTarget({ href, external: true, releases: buyable });
			})
			.catch((err) => {
				if (ac.signal.aborted) return;
				console.warn('[invite] Failed to resolve the checkout link:', err);
			});
		return () => ac.abort();
	}, []);

	const onClick = () => {
		// Only the ti.to click is a checkout. The fallback goes to `/#tickets`,
		// where the visitor still has to press Buy — which sends its own
		// `begin_checkout` from `Tickets.tsx`. Reporting both would double-count
		// the wave and file an item-less event against the member.
		if (!target.external) return;
		const items = target.releases.map((release) => {
			const price = grossPrice(release);
			return {
				item_id: release.slug,
				item_name: releaseTitle(release),
				...(price != null ? { price: round2(price) } : {}),
				quantity: 1,
			};
		});
		// `value` is one ticket's price, not the sum: the releases are
		// alternatives, not a cart (same rule as Tickets.tsx). GA4 drops `value`
		// without a `currency`, so the pair is sent together or not at all.
		const value = items.find((i) => typeof i.price === 'number')?.price;
		const currency = target.releases.find((r) => r.currency)?.currency;
		track('begin_checkout', {
			...(value != null ? { currency: (currency ?? 'CZK').toUpperCase(), value } : {}),
			items,
			// The attribution this whole channel rests on.
			invite_member: memberId,
			invite_member_name: memberName,
		});
	};

	return (
		<a
			className={`${kind === 'primary' ? 'btn-primary' : 'btn-ghost'}${className ? ` ${className}` : ''}`}
			href={target.href}
			{...(target.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
			onClick={onClick}
		>
			{label}
		</a>
	);
}
