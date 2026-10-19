import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { formatClock } from '../lib/agenda';
import { fetchLineup } from '../lib/lineup';
import { speakerNames, type Session } from '../lib/sessions';
import {
	completeLogin,
	currentAttendee,
	fetchSeats,
	isTicketCode,
	loginErrorMessage,
	normalizeTicketCode,
	registration,
	registrationErrorMessage,
	requestLoginCode,
	seatsLeft,
	signOutAttendee,
	type RegistrationStatus,
	type WorkshopSeats,
	type WorkshopStatus,
} from '../lib/workshops';
import s from './Workshops.module.scss';

type Account = 'checking' | 'signed-out' | 'code-sent' | 'signed-in';

interface Listing {
	session: Session;
	seats: WorkshopSeats;
}

/** Programme order; an unscheduled workshop goes after every timed one. */
function byStart(a: Session, b: Session): number {
	if (!a.startsAt || !b.startsAt) return Number(!a.startsAt) - Number(!b.startsAt) || a.order - b.order;
	return a.startsAt.localeCompare(b.startsAt) || a.order - b.order;
}

/** Open workshops in programme order: a session counts once its limit is set. */
function listings(sessions: Session[], seats: Record<string, WorkshopSeats>): Listing[] {
	return sessions
		.filter((session) => seats[session.id])
		.map((session) => ({ session, seats: seats[session.id] }))
		.sort((a, b) => byStart(a.session, b.session));
}

/** The seat count, its figures in the mono voice. */
function SeatLine({ seats }: { seats: WorkshopSeats }) {
	const left = seatsLeft(seats);
	if (left > 0) {
		return (
			<>
				<span className={s.fig}>{left}</span> {left === 1 ? 'seat' : 'seats'} left
			</>
		);
	}
	if (seats.waiting > 0) {
		return (
			<>
				Full, <span className={s.fig}>{seats.waiting}</span> on the waitlist
			</>
		);
	}
	return <>Full, waitlist open</>;
}

function standingLine(mine: WorkshopStatus['mine'] | undefined): string | null {
	if (mine?.state === 'confirmed') return 'You have a seat';
	if (mine?.state === 'waiting') return `You are number ${mine.position} on the waitlist`;
	return null;
}

function timeRange(session: Session): string {
	const from = formatClock(session.startsAt);
	const to = formatClock(session.endsAt);
	return from && to ? `${from}–${to}` : from || 'Time TBA';
}

function loginLabel(awaitingEmail: boolean, busy: boolean): string {
	if (awaitingEmail) return busy ? 'Signing in' : 'Sign in';
	return busy ? 'Sending' : 'Send code';
}

function actionLabel(registered: boolean, full: boolean, pending: boolean): string {
	if (registered) return pending ? 'Cancelling' : 'Cancel registration';
	if (pending) return 'Saving your seat';
	return full ? 'Join the waitlist' : 'Register';
}

interface LoginProps {
	account: Account;
	name: string;
	onCodeSent: () => void;
	/** Resolves once the sign-ups have loaded, so the button stays busy until then. */
	onSignedIn: () => Promise<void>;
	onSignOut: () => void;
}

function Login({ account, name, onCodeSent, onSignedIn, onSignOut }: LoginProps) {
	const [value, setValue] = useState('');
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState('');

	if (account === 'checking') return <p className={s.message}>Checking your sign-in…</p>;

	if (account === 'signed-in') {
		return (
			<div className={`paper ${s.account}`}>
				<p className={s.accountName}>Signed in{name ? ` as ${name}` : ''}</p>
				<button type="button" className={s.textButton} onClick={onSignOut}>
					Sign out
				</button>
			</div>
		);
	}

	const awaitingEmail = account === 'code-sent';

	async function submit(e: FormEvent) {
		e.preventDefault();
		if (busy) return;
		setError('');
		const code = awaitingEmail ? value.trim() : normalizeTicketCode(value);
		if (!awaitingEmail && !isTicketCode(code)) {
			setError('Enter the code from your ticket: four characters, a dash and a number, like ABCD-1.');
			return;
		}
		if (awaitingEmail && !/^\d{6}$/.test(code)) {
			setError('The code in the email has six digits.');
			return;
		}
		setBusy(true);
		try {
			if (awaitingEmail) {
				await completeLogin(code);
				await onSignedIn();
			} else {
				await requestLoginCode(code);
				onCodeSent();
			}
			setValue('');
		} catch (err) {
			setError(loginErrorMessage(err));
		} finally {
			setBusy(false);
		}
	}

	const id = awaitingEmail ? 'workshop-email-code' : 'workshop-ticket-code';
	const pending = busy ? (awaitingEmail ? 'Signing you in…' : 'Sending the code to your email…') : '';
	return (
		<form className={`paper ${s.login}`} onSubmit={submit} noValidate>
			<label className={s.label} htmlFor={id}>
				{awaitingEmail ? 'Code from the email' : 'Ticket code'}
			</label>
			<p className={s.hint} id={`${id}-hint`}>
				{awaitingEmail
					? 'We sent a six-digit code to the email address on your ticket.'
					: (
						<>
							It is on your ti.to ticket, like <span className={s.code}>ABCD-1</span>. The same code signs you
							in to the DevFest app.
						</>
					)}
			</p>
			<div className={s.row}>
				<input
					id={id}
					className={s.input}
					value={value}
					onChange={(e) => setValue(e.target.value)}
					autoComplete={awaitingEmail ? 'one-time-code' : 'off'}
					inputMode={awaitingEmail ? 'numeric' : 'text'}
					autoCapitalize="characters"
					spellCheck={false}
					aria-describedby={`${id}-hint${error ? ` ${id}-error` : ''}`}
					aria-invalid={error ? true : undefined}
				/>
				<button
					type="submit"
					className={`btn-primary ${s.button}`}
					aria-disabled={busy || undefined}
					aria-busy={busy || undefined}
				>
					{busy && <span className={s.spinner} aria-hidden="true" />}
					{loginLabel(awaitingEmail, busy)}
				</button>
			</div>
			<p className={s.pending} role="status" aria-live="polite">
				{pending}
			</p>
			{error && (
				<p className={s.error} id={`${id}-error`} role="alert">
					{error}
				</p>
			)}
		</form>
	);
}

interface CardProps {
	listing: Listing;
	status: WorkshopStatus | undefined;
	signedIn: boolean;
	busy: boolean;
	/** This card's own request is in flight. */
	pending: boolean;
	onAction: (action: 'join' | 'leave', sessionId: string) => void;
}

/** A hyphenated word ("Full-stack") never breaks at its hyphen: Bebas caps
 * leave "FULL-" hanging at a line end. Each such word is held in one piece. */
function unbrokenHyphens(title: string): ReactNode[] {
	return title.split(/(\S+-\S+)/).map((part, i) =>
		i % 2 === 1 ? (
			<span key={i} className={s.nobreak}>
				{part}
			</span>
		) : (
			part
		),
	);
}

function WorkshopCard({ listing, status, signedIn, busy, pending, onAction }: CardProps) {
	const { session } = listing;
	const seats = status ?? listing.seats;
	const mine = standingLine(status?.mine);
	const registered = status?.mine.state === 'confirmed' || status?.mine.state === 'waiting';
	const full = seatsLeft(seats) === 0;
	const speakers = speakerNames(session);
	return (
		<li className={s.card}>
			<p className={s.meta}>
				<span className={s.time}>{timeRange(session)}</span>
				{session.room && <span className={s.room}>{session.room}</span>}
			</p>
			<h3 className={s.title}>{unbrokenHyphens(session.title)}</h3>
			{speakers && <p className={s.speakers}>{speakers}</p>}
			<p className={s.seats} data-full={full || undefined}>
				<SeatLine seats={seats} />
			</p>
			{mine && <p className={s.mine}>{mine}</p>}
			{signedIn && (
				<button
					type="button"
					className={`${s.slipAction} ${registered ? s.slipActionText : s.slipActionFill}`}
					aria-disabled={busy || undefined}
					aria-busy={pending || undefined}
					onClick={() => !busy && onAction(registered ? 'leave' : 'join', session.id)}
				>
					{pending && <span className={s.spinner} aria-hidden="true" />}
					{actionLabel(registered, full, pending)}
				</button>
			)}
		</li>
	);
}

export default function Workshops() {
	const [items, setItems] = useState<Listing[] | null>(null);
	const [loadFailed, setLoadFailed] = useState(false);
	const [account, setAccount] = useState<Account>('checking');
	const [status, setStatus] = useState<RegistrationStatus | null>(null);
	const [busy, setBusy] = useState(false);
	const [pendingId, setPendingId] = useState<string | null>(null);
	const [message, setMessage] = useState('');

	useEffect(() => {
		const controller = new AbortController();
		Promise.all([fetchLineup(controller.signal), fetchSeats(controller.signal)])
			.then(([lineup, seats]) => setItems(listings(lineup.sessions, seats)))
			.catch((err) => {
				if (!controller.signal.aborted) setLoadFailed(true);
				console.warn('[workshops] load failed:', err);
			});
		return () => controller.abort();
	}, []);

	async function refresh(action: 'status' | 'join' | 'leave' = 'status', sessionId?: string) {
		setBusy(true);
		setPendingId(sessionId ?? null);
		setMessage('');
		try {
			setStatus(await registration(action, sessionId));
			setAccount('signed-in');
		} catch (err) {
			if ((err as { code?: string }).code === 'functions/permission-denied') setAccount('signed-out');
			else setMessage(registrationErrorMessage(err));
		} finally {
			setBusy(false);
			setPendingId(null);
		}
	}

	useEffect(() => {
		currentAttendee()
			.then((user) => (user ? refresh() : setAccount('signed-out')))
			.catch(() => setAccount('signed-out'));
	}, []);

	async function signOut() {
		await signOutAttendee();
		setStatus(null);
		setAccount('signed-out');
	}

	if (loadFailed) return <p className={s.message}>The workshops could not load. Reload the page, or check back soon.</p>;
	if (!items) return <p className={s.message}>Loading workshops…</p>;

	return (
		<div className={s.wrapper}>
			<Login
				account={account}
				name={status?.name ?? ''}
				onCodeSent={() => setAccount('code-sent')}
				onSignedIn={() => refresh()}
				onSignOut={signOut}
			/>
			<p className={s.message} role="status" aria-live="polite">
				{message}
			</p>
			{items.length === 0 ? (
				<p className={s.message}>Workshop registration is not open yet. Check back soon.</p>
			) : (
				<ul className={s.list}>
					{items.map((listing) => (
						<WorkshopCard
							key={listing.session.id}
							listing={listing}
							status={status?.workshops[listing.session.id]}
							signedIn={account === 'signed-in'}
							busy={busy}
							pending={pendingId === listing.session.id}
							onAction={(action, id) => refresh(action, id)}
						/>
					))}
				</ul>
			)}
		</div>
	);
}
