import { useMemo } from 'react';
import { currentOffer, fetchTickets } from '../lib/tito';
import { useRemote } from '../lib/useRemote';
import s from './HeroOffer.module.scss';

/**
 * The wave on sale, typed into the hero's footing line after the date and
 * the venue: the wave (and when it closes) as an inline typewriter qualifier, its
 * lowest price as the value, linked down to the Tickets section. The
 * qualifier stays because a bare "From 1 210 Kč" does not say which wave.
 *
 * Every figure is live from `/api/tickets` (the same memoised fetch the
 * Tickets section uses) — never copy. While the fetch is in flight the item
 * holds its box so the line does not reflow when the data lands; nothing
 * buyable, a free wave or a failed fetch → the item is dropped.
 */
export default function HeroOffer() {
	const { status, data } = useRemote(fetchTickets, 'hero-offer', (cache) => !cache);
	const offer = useMemo(() => (data ? currentOffer(data.releases ?? []) : null), [data]);

	if (!offer) {
		return status === 'loading' ? (
			<p className={`${s.offer} ${s.pending}`} aria-hidden="true">
				<span className={s.label}>&nbsp;</span>
				<span className={s.value}>&nbsp;</span>
			</p>
		) : null;
	}

	return (
		<p className={s.offer}>
			{/* The line's separator, here because the island is a `display:
			    contents` wrapper the page's own `::before` cannot reach. */}
			<span className={s.dot} aria-hidden="true">·</span>
			<span className={s.label}>
				{/* The final wave sells on urgency, not on its name: the Tickets
				    section right below names it. */}
				{offer.final ? 'Last chance' : offer.wave}
				{offer.deadline && (
					<>
						{' · until '}
						<time dateTime={offer.deadline.iso}>{offer.deadline.day}</time>
					</>
				)}
			</span>{' '}
			<a className={`${s.value} ${s.link}`} href="#tickets">
				From {offer.price}
			</a>
		</p>
	);
}
