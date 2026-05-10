import { useEffect, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { getDb } from '../lib/firebase';
import {
	checkoutUrl,
	eventUrl,
	filterDisplayable,
	formatPrice,
	releaseStatus,
	releaseTitle,
	type ReleaseStatus,
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

function badgeClass(styles: Record<string, string>, tone: ReleaseStatus['tone']): string {
	switch (tone) {
		case 'on-sale':
			return styles.badgeOnSale;
		case 'paused':
			return styles.badgePaused;
		case 'soon':
			return styles.badgeSoon;
		case 'ended':
			return styles.badgeEnded;
		case 'sold-out':
		default:
			return styles.badgeSoldOut;
	}
}

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
					const status = releaseStatus(release);
					return (
						<li key={release.id} className={`${s.ticket} ${status.purchasable ? '' : s.isInactive}`}>
							<div className={s.ticketTop}>
								<h3 className={s.ticketTitle}>{releaseTitle(release)}</h3>
								<span className={`${s.badge} ${badgeClass(s, status.tone)}`}>
									{status.label}
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
							{status.purchasable ? (
								<a
									className={s.cta}
									href={checkoutUrl(release, accountSlug, eventSlug)}
									target="_blank"
									rel="noopener noreferrer"
								>
									Buy ticket
									<span className={s.ctaArrow} aria-hidden="true">&#8599;</span>
								</a>
							) : (
								<span className={`${s.cta} ${s.ctaDisabled}`} aria-disabled="true">
									{status.label}
								</span>
							)}
						</li>
					);
				})}
			</ul>
		</section>
	);
}
