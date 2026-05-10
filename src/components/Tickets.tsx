import { useEffect, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { getDb } from '../lib/firebase';
import {
	checkoutUrl,
	eventUrl,
	filterDisplayable,
	formatPrice,
	type TicketsCache,
	type TitoRelease,
} from '../lib/tito';
import s from './Tickets.module.scss';

type Status = 'loading' | 'ready' | 'empty' | 'error';

interface State {
	status: Status;
	releases: TitoRelease[];
	accountSlug: string;
	eventSlug: string;
}

const INITIAL: State = { status: 'loading', releases: [], accountSlug: '', eventSlug: '' };

export default function Tickets() {
	const [state, setState] = useState<State>(INITIAL);

	useEffect(() => {
		const db = getDb();
		const ticketsRef = ref(db, 'tickets');

		const unsubscribe = onValue(
			ticketsRef,
			(snapshot) => {
				const data = snapshot.val() as TicketsCache | null;
				if (!data) {
					setState({ status: 'empty', releases: [], accountSlug: '', eventSlug: '' });
					return;
				}
				const visible = filterDisplayable(data.releases ?? []);
				setState({
					status: visible.length > 0 ? 'ready' : 'empty',
					releases: visible,
					accountSlug: data.accountSlug ?? '',
					eventSlug: data.eventSlug ?? '',
				});
			},
			(err) => {
				console.warn('[tickets] Failed to read /tickets from RTDB:', err);
				setState((prev) => ({ ...prev, status: 'error' }));
			},
		);

		return () => unsubscribe();
	}, []);

	if (state.status === 'loading' || state.status === 'error') {
		return (
			<section className={s.tickets} aria-busy={state.status === 'loading'} aria-labelledby="tickets-heading">
				<header className={s.header}>
					<p className={s.eyebrow}>Tickets</p>
					<h2 id="tickets-heading" className={s.heading}>Get your ticket</h2>
				</header>
				<ul className={s.list} role="list" aria-hidden="true">
					{[0, 1, 2].map((i) => (
						<li key={i} className={`${s.ticket} ${s.skeleton}`} />
					))}
				</ul>
			</section>
		);
	}

	const { releases, accountSlug, eventSlug } = state;
	const hasEvent = Boolean(accountSlug && eventSlug);

	if (state.status === 'empty') {
		if (!hasEvent) return null;
		return (
			<section className={s.tickets} aria-labelledby="tickets-heading">
				<header className={s.header}>
					<p className={s.eyebrow}>Tickets</p>
					<h2 id="tickets-heading" className={s.heading}>Get your ticket</h2>
					<p className={s.subheading}>Tickets are not yet available.</p>
				</header>
				<div className={s.empty}>
					<p>Subscribe above to be notified when tickets go on sale.</p>
					<a
						className={`${s.cta} ${s.ctaSecondary}`}
						href={eventUrl(accountSlug, eventSlug)}
						target="_blank"
						rel="noopener noreferrer"
					>
						Visit ti.to event
						<span className={s.ctaArrow} aria-hidden="true">&#8599;</span>
					</a>
				</div>
			</section>
		);
	}

	return (
		<section className={s.tickets} aria-labelledby="tickets-heading">
			<header className={s.header}>
				<p className={s.eyebrow}>Tickets</p>
				<h2 id="tickets-heading" className={s.heading}>Get your ticket</h2>
				<p className={s.subheading}>Limited capacity. Early-bird passes on sale now.</p>
			</header>
			<ul className={s.list} role="list">
				{releases.map((release) => {
					const soldOut = release.sold_out || release.sale_status === 'sold_out';
					return (
						<li key={release.id} className={`${s.ticket} ${soldOut ? s.isSoldOut : ''}`}>
							<div className={s.ticketTop}>
								<h3 className={s.ticketTitle}>{release.title}</h3>
								<span className={`${s.badge} ${soldOut ? s.badgeSoldOut : s.badgeOnSale}`}>
									{soldOut ? 'Sold out' : 'On sale'}
								</span>
							</div>
							{release.description && (
								<p className={s.ticketDescription}>{release.description}</p>
							)}
							<p className={s.ticketPrice}>
								<span className={s.priceAmount}>{formatPrice(release.price, release.currency)}</span>
								{release.currency && Number(release.price) > 0 && (
									<span className={s.priceNote}>incl. VAT</span>
								)}
							</p>
							{soldOut ? (
								<span className={`${s.cta} ${s.ctaDisabled}`} aria-disabled="true">
									Sold out
								</span>
							) : (
								<a
									className={s.cta}
									href={checkoutUrl(release, accountSlug, eventSlug)}
									target="_blank"
									rel="noopener noreferrer"
								>
									Buy ticket
									<span className={s.ctaArrow} aria-hidden="true">&#8599;</span>
								</a>
							)}
						</li>
					);
				})}
			</ul>
		</section>
	);
}
