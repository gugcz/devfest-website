import { useMemo } from 'react';
import { currentOffer, fetchTickets } from '../lib/tito';
import { useRemote } from '../lib/useRemote';
import s from './HeroOffer.module.scss';

/**
 * The wave on sale, as a third fact in the hero's footing strip beside Date
 * and Place: the wave and when it closes as the label, its lowest price as
 * the value, linked down to the Tickets section. It used to trail the two
 * CTAs as a loose mono sentence, which read as a stray caption rather than
 * data.
 *
 * Every figure is live from `/api/tickets` (the same memoised fetch the
 * Tickets section uses) — never copy. While the fetch is in flight the item
 * holds its box so the strip does not reflow when the data lands; nothing
 * buyable, a free wave or a failed fetch → the item is dropped.
 */
export default function HeroOffer() {
	const { status, data } = useRemote(fetchTickets, 'hero-offer', (cache) => !cache);
	const offer = useMemo(() => (data ? currentOffer(data.releases ?? []) : null), [data]);

	if (!offer) {
		return status === 'loading' ? (
			<dl className={`${s.offer} ${s.pending}`} aria-hidden="true">
				<dt className={s.label}>&nbsp;</dt>
				<dd className={s.value}>&nbsp;</dd>
			</dl>
		) : null;
	}

	return (
		<dl className={s.offer}>
			<dt className={s.label}>
				{offer.wave}
				{offer.deadline && (
					<>
						{' · until '}
						<time dateTime={offer.deadline.iso}>{offer.deadline.day}</time>
					</>
				)}
			</dt>
			<dd className={s.value}>
				<a className={s.link} href="#tickets">
					From {offer.price}
				</a>
			</dd>
		</dl>
	);
}
