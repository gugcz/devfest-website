import { useMemo } from 'react';
import { currentOffer, fetchTickets } from '../lib/tito';
import { useRemote } from '../lib/useRemote';
import s from './HeroOffer.module.scss';

/**
 * The hero's one line of price: the wave on sale, its lowest price, when it
 * closes and what it costs after. Beside the CTA because a price rise with a
 * date is the reason to buy this week, and it was three scrolls down.
 *
 * Every figure is live from `/api/tickets` (the same memoised fetch the
 * Tickets section uses) — never copy. Nothing buyable, a free wave or a
 * failed fetch → the line stays empty; its box is reserved either way so
 * the hero never shifts when the data lands.
 */
export default function HeroOffer() {
	const { data } = useRemote(fetchTickets, 'hero-offer', (cache) => !cache);
	const offer = useMemo(() => (data ? currentOffer(data.releases ?? []) : null), [data]);

	return (
		<p className={s.offer}>
			{offer && (
				<>
					{/* The wave's name is left to the Tickets section: at 375px it
					    pushed the line onto a second row, and the price and the
					    date are what the line is for. */}
					From <span className={s.price}>{offer.price}</span>
					{offer.deadline && (
						<>
							{' '}until <time dateTime={offer.deadline.iso}>{offer.deadline.day}</time>
							{offer.nextPrice && (
								<>
									, <span className={s.then}>then {offer.nextPrice}</span>
								</>
							)}
						</>
					)}
				</>
			)}
		</p>
	);
}
