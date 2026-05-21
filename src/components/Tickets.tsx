import { useEffect, useState } from 'react';
import {
	eventUrl,
	filterDisplayable,
	priceDisplay,
	releaseStatus,
	releaseTitle,
	type ReleaseStatus,
	type TicketsCache,
	type TitoRelease,
} from '../lib/tito';
import s from './Tickets.module.scss';

// Static copy keyed by lowercased group name. Overrides whatever ti.to
// returns in the release `description` so marketing copy stays in repo,
// not in the ti.to admin.
const GROUP_DESCRIPTIONS: Record<string, string> = {
	'early bird': 'First on the scene. Lowest price of the year while seats are still warm.',
	regular: 'Standard ticket. The investigation is in full swing — secure your seat before the trail cools.',
	'lazy bird': 'Final call. Late price, same full access — claim a seat before doors close on the case.',
};

function groupDescription(groupName: string, fallback: string | null): string | null {
	return GROUP_DESCRIPTIONS[groupName.trim().toLowerCase()] ?? fallback;
}

type Status = 'loading' | 'ready' | 'empty' | 'error';

interface State {
	status: Status;
	releases: TitoRelease[];
	accountSlug: string;
	eventSlug: string;
}

const INITIAL: State = { status: 'loading', releases: [], accountSlug: '', eventSlug: '' };

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

export default function Tickets() {
	const [state, setState] = useState<State>(INITIAL);

	useEffect(() => {
		let unsubscribe: (() => void) | null = null;
		let cancelled = false;
		(async () => {
			try {
				const [{ getDb }, { onValue, ref }] = await Promise.all([
					import('../lib/firebase'),
					import('firebase/database'),
				]);
				if (cancelled) return;
				const db = getDb();
				const ticketsRef = ref(db, 'tickets');
				unsubscribe = onValue(
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
			} catch (err) {
				console.warn('[tickets] Failed to load Firebase modules:', err);
				if (!cancelled) setState((prev) => ({ ...prev, status: 'error' }));
			}
		})();
		return () => {
			cancelled = true;
			unsubscribe?.();
		};
	}, []);

	if (state.status === 'error') {
		return (
			<section id="tickets" className={s.tickets} aria-labelledby="tickets-heading">
				<header className={s.header}>
					<p className={s.eyebrow}>Tickets</p>
					<h2 id="tickets-heading" className={s.heading}>DevFest 2026 tickets</h2>
				</header>
				<div className={s.empty} role="alert">
					<p>Tickets are temporarily unavailable. Please check back soon.</p>
				</div>
			</section>
		);
	}

	if (state.status === 'loading') {
		return (
			<section id="tickets" className={s.tickets} aria-busy={true} aria-labelledby="tickets-heading">
				<header className={s.header}>
					<p className={s.eyebrow}>Tickets</p>
					<h2 id="tickets-heading" className={s.heading}>DevFest 2026 tickets</h2>
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
			<section id="tickets" className={s.tickets} aria-labelledby="tickets-heading">
				<header className={s.header}>
					<p className={s.eyebrow}>Tickets</p>
					<h2 id="tickets-heading" className={s.heading}>DevFest 2026 tickets</h2>
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
		<section id="tickets" className={s.tickets} aria-labelledby="tickets-heading">
			<header className={s.header}>
				<p className={s.eyebrow}>Tickets</p>
				<h2 id="tickets-heading" className={s.heading}>DevFest 2026 tickets</h2>
				<p className={s.subheading}>Three waves: early bird, regular, lazy bird. Individual or company-funded.</p>
			</header>
			<ul className={s.list} role="list">
				{groupReleases(releases).map((group) => {
					const statuses = group.variants.map((v) => releaseStatus(v.release));
					const anyPurchasable = statuses.some((st) => st.purchasable);
					// When no variant is buyable, pick a non-sold-out summary if one
					// exists so a "Paused" or "Coming soon" wave isn't labeled "Sold
					// out" just because one variant ran out.
					const summary: ReleaseStatus | null = anyPurchasable
						? null
						: statuses.find((st) => st.tone !== 'sold-out') ?? statuses[0];
					return (
						<li
							key={group.name}
							className={`${s.ticket} ${!anyPurchasable ? s.isInactive : ''}`}
						>
							<div className={s.ticketTop}>
								<h3 className={s.ticketTitle}>{group.name}</h3>
							</div>
							{(() => {
								const description = groupDescription(group.name, group.description);
								return description && (
									<p className={s.ticketDescription}>{description}</p>
								);
							})()}
							<ul className={s.variants}>
								{group.variants.map(({ release, variantLabel }) => {
									const label = variantLabel || releaseTitle(release);
									const price = priceDisplay(release);
									return (
										<li key={release.id} className={s.variant}>
											<span className={s.variantLabel}>{label}</span>
											<span className={s.variantPriceBlock}>
												<span className={s.variantPrice}>{price?.primary}</span>
												{price?.secondary && (
													<span className={s.variantVat}>{price.secondary}</span>
												)}
											</span>
										</li>
									);
								})}
							</ul>
							{anyPurchasable ? (
								<a
									className={s.cta}
									href={eventUrl(accountSlug, eventSlug)}
									target="_blank"
									rel="noopener noreferrer"
									aria-label={`Get ${group.name} tickets on ti.to`}
								>
									Get tickets
									<span className={s.ctaArrow} aria-hidden="true">&#8599;</span>
								</a>
							) : (
								<span className={`${s.cta} ${s.ctaDisabled}`} aria-disabled="true">
									{summary?.label ?? 'Unavailable'}
								</span>
							)}
						</li>
					);
				})}
			</ul>
			<p className={s.footnote}>
				Not ready yet?{' '}
				<a href="#newsletter" className={s.footnoteLink}>
					Notify me when the next wave drops
					<span aria-hidden="true">{' ↘︎'}</span>
				</a>
			</p>
		</section>
	);
}
