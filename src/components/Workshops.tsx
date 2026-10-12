import { useEffect, useState, type FormEvent } from 'react';
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

function seatLine(seats: WorkshopSeats): string {
	const left = seatsLeft(seats);
	if (left > 0) return `${left} of ${seats.limit} seats left`;
	return seats.waiting > 0 ? `Full · ${seats.waiting} on the waitlist` : 'Full · waitlist open';
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

interface LoginProps {
	account: Account;
	name: string;
	onCodeSent: () => void;
	onSignedIn: () => void;
	onSignOut: () => void;
}

function Login({ account, name, onCodeSent, onSignedIn, onSignOut }: LoginProps) {
	const [value, setValue] = useState('');
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState('');

	if (account === 'checking') return <p className={s.message}>Checking your sign-in…</p>;

	if (account === 'signed-in') {
		return (
			<div className={s.account}>
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
				onSignedIn();
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
	return (
		<form className={s.login} onSubmit={submit} noValidate>
			<label className={s.label} htmlFor={id}>
				{awaitingEmail ? 'Code from the email' : 'Ticket code'}
			</label>
			<p className={s.hint} id={`${id}-hint`}>
				{awaitingEmail
					? 'We sent a six-digit code to the email address on your ticket.'
					: 'It is on your ti.to ticket, like ABCD-1. The same code signs you in to the DevFest app.'}
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
				<button type="submit" className={`btn-primary ${s.button}`} aria-disabled={busy || undefined}>
					{awaitingEmail ? 'Sign in' : 'Send code'}
				</button>
			</div>
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
	onAction: (action: 'join' | 'leave', sessionId: string) => void;
}

function WorkshopCard({ listing, status, signedIn, busy, onAction }: CardProps) {
	const { session } = listing;
	const seats = status ?? listing.seats;
	const mine = standingLine(status?.mine);
	const registered = status?.mine.state === 'confirmed' || status?.mine.state === 'waiting';
	const full = seatsLeft(seats) === 0;
	const speakers = speakerNames(session);
	return (
		<li className={s.card}>
			<p className={s.meta}>
				{timeRange(session)}
				{session.room ? ` · ${session.room}` : ''}
			</p>
			<h3 className={s.title}>{session.title}</h3>
			{speakers && <p className={s.speakers}>{speakers}</p>}
			<p className={s.seats} data-full={full || undefined}>
				{seatLine(seats)}
			</p>
			{mine && <p className={s.mine}>{mine}</p>}
			{signedIn && (
				<button
					type="button"
					className={registered ? `btn-ghost ${s.button}` : `btn-primary ${s.button}`}
					aria-disabled={busy || undefined}
					onClick={() => !busy && onAction(registered ? 'leave' : 'join', session.id)}
				>
					{registered ? 'Cancel registration' : full ? 'Join the waitlist' : 'Register'}
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
		setMessage('');
		try {
			setStatus(await registration(action, sessionId));
			setAccount('signed-in');
		} catch (err) {
			if ((err as { code?: string }).code === 'functions/permission-denied') setAccount('signed-out');
			else setMessage(registrationErrorMessage(err));
		} finally {
			setBusy(false);
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
							onAction={(action, id) => refresh(action, id)}
						/>
					))}
				</ul>
			)}
		</div>
	);
}
