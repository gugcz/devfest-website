import { useEffect, useMemo, useRef, useState, type FormEvent, type InputHTMLAttributes } from 'react';
import {
	fetchTickets,
	filterDisplayable,
	formatPrice,
	grossPrice,
	priceDisplay,
	releaseStatus,
	releaseTitle,
	type TitoRelease,
} from '../lib/tito';
import { track } from '../lib/analytics';
import s from './InvoiceForm.module.scss';

// Cloud Functions region the callable is deployed to.
const FUNCTIONS_REGION = 'europe-west1';

// Must match INVOICE_RELEASE_MATCH on the function side.
const COMPANY_RELEASE_MATCH = 'company funded';

type Status = 'idle' | 'submitting' | 'success' | 'error';

interface Fields {
	companyName: string;
	registrationNumberIC: string;
	registrationNumberDIC: string;
	street: string;
	city: string;
	zip: string;
	country: string;
	email: string;
	countTickets: number;
}

type FieldName = keyof Fields;
/** `consent` is not a billing field, but it fails the same way and is shown
 * the same way, so it shares the error bag. */
type ErrorKey = FieldName | 'consent';
type Errors = Partial<Record<ErrorKey, string>>;

const EMPTY: Fields = {
	companyName: '',
	registrationNumberIC: '',
	registrationNumberDIC: '',
	street: '',
	city: '',
	zip: '',
	country: 'CZ',
	email: '',
	countTickets: 1,
};

// Deliberately loose: the point of a client-side check here is to say which of
// the nine fields is wrong before a round trip, not to reject a real company.
// The invoice is issued from what the company types, and iDoklad is the one
// that rejects a genuinely unusable registration number.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * The form's rules, in one place. Every message names the field and what is
 * missing — "Please check the field" (which is what the server error used to
 * say, with an empty field name) is not something a visitor can act on.
 */
function validate(fields: Fields, consented: boolean): Errors {
	const errors: Errors = {};
	const required = (key: FieldName, message: string) => {
		if (!String(fields[key]).trim()) errors[key] = message;
	};

	required('companyName', 'Enter the company name as it should appear on the invoice.');
	required('registrationNumberIC', 'Enter the company registration number (IČO).');
	required('street', 'Enter the street and number.');
	required('city', 'Enter the city.');
	required('zip', 'Enter the postal code.');
	required('country', 'Enter the country.');

	if (!fields.email.trim()) {
		errors.email = 'Enter the email the invoice should go to.';
	} else if (!EMAIL_RE.test(fields.email.trim())) {
		errors.email = 'That does not look like an email address.';
	}

	if (!Number.isFinite(fields.countTickets) || fields.countTickets < 1 || fields.countTickets > 50) {
		errors.countTickets = 'Choose between 1 and 50 tickets.';
	}

	if (!consented) {
		errors.consent = 'Tick the box so we may use these details to issue the invoice.';
	}

	return errors;
}

function findCompanyRelease(releases: TitoRelease[]): TitoRelease | null {
	const matches = releases.filter((r) =>
		releaseTitle(r).toLowerCase().includes(COMPANY_RELEASE_MATCH),
	);
	if (matches.length === 0) return null;
	return matches.find((r) => releaseStatus(r).purchasable) ?? matches[0];
}

/**
 * One text field, wired for assistive tech: `aria-invalid` on the control and
 * `aria-describedby` pointing at the message under it. Nine hand-wired copies
 * of that is nine chances to forget one.
 *
 * Declared at module scope, not inside `InvoiceForm`: a component defined in a
 * render body is a NEW component type on every render, so React would unmount
 * and remount every input on each keystroke and the caret would jump out of
 * the field being typed into.
 */
function TextField({
	name,
	label,
	value,
	error,
	optional = false,
	wide = false,
	inputRef,
	onValue,
	onBlurField,
	type = 'text',
	...rest
}: {
	name: FieldName;
	label: string;
	value: string | number;
	error?: string;
	optional?: boolean;
	wide?: boolean;
	inputRef: (el: HTMLInputElement | null) => void;
	onValue: (raw: string) => void;
	onBlurField: () => void;
	type?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'name' | 'type' | 'value' | 'onChange' | 'onBlur' | 'ref'>) {
	const errorId = `invoice-${name}-error`;
	return (
		<label className={`${s.field}${wide ? ` ${s.fieldWide}` : ''}`}>
			<span className={s.label}>
				{label}
				{optional && <span className={s.optional}> (optional)</span>}
			</span>
			<input
				ref={inputRef}
				className={s.input}
				type={type}
				value={value}
				onChange={(e) => onValue(e.target.value)}
				onBlur={onBlurField}
				aria-invalid={error ? true : undefined}
				aria-describedby={error ? errorId : undefined}
				{...rest}
			/>
			{error && (
				<span className={s.error} id={errorId}>
					{error}
				</span>
			)}
		</label>
	);
}

export default function InvoiceForm() {
	const [fields, setFields] = useState<Fields>(EMPTY);
	const [consented, setConsented] = useState(false);
	const [honeypot, setHoneypot] = useState('');
	const [status, setStatus] = useState<Status>('idle');
	const [message, setMessage] = useState('');
	const [release, setRelease] = useState<TitoRelease | null>(null);
	// Shown errors, not computed ones: a field that has never been touched and
	// has never been submitted is not "wrong yet", it is just empty.
	const [errors, setErrors] = useState<Errors>({});
	const [touched, setTouched] = useState<Partial<Record<ErrorKey, boolean>>>({});
	const [attempted, setAttempted] = useState(false);
	// So a failed submit can put the caret in the first field that needs fixing
	// rather than leaving the visitor to hunt for it.
	const inputs = useRef<Partial<Record<ErrorKey, HTMLElement | null>>>({});

	// Read the company-funded price from the cached `/api/tickets` endpoint for an
	// estimate. The authoritative price is computed server-side at invoice time —
	// this is display only, so failures are ignored.
	useEffect(() => {
		const ac = new AbortController();
		fetchTickets(ac.signal)
			.then((data) => {
				if (!data) return;
				setRelease(findCompanyRelease(filterDisplayable(data.releases ?? [])));
			})
			.catch(() => {
				// Estimate is optional; ignore failures (including aborts).
			});
		return () => ac.abort();
	}, []);

	const estimate = useMemo(() => {
		if (!release) return null;
		const display = priceDisplay(release);
		// `grossPrice` holds the shared VAT assumption (ti.to exposes no tax rate);
		// it returns null for exactly the free / unpriced cases we skip here.
		const grossEach = grossPrice(release);
		if (!display || grossEach == null) return null;
		const total = grossEach * fields.countTickets;
		return {
			each: display.primary,
			total: formatPrice(String(total), release.currency),
			/** Numeric total + currency for the GA4 `generate_lead` value. */
			amount: Math.round(total * 100) / 100,
			currency: (release.currency ?? 'CZK').toUpperCase(),
		};
	}, [release, fields.countTickets]);

	/** Re-check after the first failed submit, so an error clears as it is fixed. */
	function revalidate(next: Fields, nextConsent: boolean) {
		if (!attempted) return;
		setErrors(validate(next, nextConsent));
	}

	function update<K extends keyof Fields>(key: K, value: Fields[K]) {
		const next = { ...fields, [key]: value };
		setFields(next);
		revalidate(next, consented);
	}

	/** On blur a single field starts showing its own error — the rest stay quiet. */
	function blur(key: ErrorKey) {
		setTouched((prev) => ({ ...prev, [key]: true }));
		setErrors(validate(fields, consented));
	}

	/** An error is shown once the visitor has left the field, or tried to submit. */
	const errorFor = (key: ErrorKey): string | undefined =>
		attempted || touched[key] ? errors[key] : undefined;

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (status === 'submitting') return;

		const found = validate(fields, consented);
		setAttempted(true);
		setErrors(found);
		const keys = Object.keys(found) as ErrorKey[];
		if (keys.length > 0) {
			setStatus('error');
			setMessage(
				keys.length === 1
					? 'One field still needs your attention — see the note under it.'
					: `${keys.length} fields still need your attention — see the notes under them.`,
			);
			inputs.current[keys[0]]?.focus();
			return;
		}

		setStatus('submitting');
		setMessage('Sending your request…');
		const recipient = fields.email;
		try {
			// Callable: the Functions SDK auto-attaches the Firebase App Check
			// token, and the function enforces it server-side (enforceAppCheck).
			const [{ getFirebaseApp }, { getFunctions, httpsCallable }] = await Promise.all([
				import('../lib/firebase'),
				import('firebase/functions'),
			]);
			const submit = httpsCallable(getFunctions(getFirebaseApp(), FUNCTIONS_REGION), 'submitInvoiceCallable');
			await submit({ ...fields, website: honeypot });
			// GA4's recommended event for a B2B enquiry. This is the conversion for
			// the company path — the ti.to checkout never happens here (the company
			// pays the invoice and claims tickets with a 100%-off code), so nothing
			// downstream would otherwise mark it. `value`/`currency` go together or
			// not at all; the estimate is missing only when the price lookup failed.
			track('generate_lead', {
				...(estimate ? { currency: estimate.currency, value: estimate.amount } : {}),
				lead_source: 'company_invoice',
				quantity: fields.countTickets,
			});
			setStatus('success');
			setMessage(
				`Request received. We'll email the invoice to ${recipient}. ` +
					`Once it's paid, you'll get a code to claim your ticket(s) on ti.to.`,
			);
			setFields(EMPTY);
			setConsented(false);
			setErrors({});
			setTouched({});
			setAttempted(false);
		} catch (e) {
			const code = (e as { code?: string }).code ?? '';
			const field = (e as { message?: string }).message ?? '';
			setStatus('error');
			setMessage(
				code === 'functions/invalid-argument'
					? field
						? `The server rejected the ${field} field. Please check it and try again.`
						: 'The server rejected one of the fields. Please check them and try again.'
					: code === 'functions/unauthenticated' || code === 'functions/failed-precondition'
						? 'Could not verify your browser. Reload the page and try again, or email devfest@gug.cz.'
						: 'Something went wrong. Please try again or email devfest@gug.cz.',
			);
		}
	}

	if (status === 'success') {
		return (
			<div className={s.wrapper}>
				<div className={s.success} role="status" aria-live="polite">
					<p className={s.successTitle}>Request received</p>
					<p className={s.successBody}>{message}</p>
				</div>
			</div>
		);
	}

	/** Everything a `TextField` needs from this component's state. */
	function wire(name: FieldName) {
		return {
			name,
			value: fields[name],
			error: errorFor(name),
			inputRef: (el: HTMLInputElement | null) => {
				inputs.current[name] = el;
			},
			onValue: (raw: string) =>
				update(
					name,
					// The count is the one numeric field; clamping on input keeps
					// the estimate below it from ever showing a nonsense total.
					(name === 'countTickets'
						? Math.max(1, Math.min(50, Number(raw) || 1))
						: raw) as Fields[typeof name],
				),
			onBlurField: () => blur(name),
		};
	}

	const consentError = errorFor('consent');

	return (
		<div className={s.wrapper}>
			{/* `noValidate` because the errors below replace the browser's own
			    bubble: that bubble is English-only whatever the page language,
			    shows one field at a time, and vanishes on the next keystroke. */}
			<form className={s.form} onSubmit={handleSubmit} noValidate>
				<div className={s.grid}>
					{/* `wire()` hands each field the four things it cannot know
					    about itself: its value, its shown error, where to put its
					    DOM node (so a failed submit can focus the first bad one),
					    and how to report a change. */}
					<TextField {...wire('companyName')} label="Company name" maxLength={200} autoComplete="organization" />
					<TextField {...wire('registrationNumberIC')} label="IČO" maxLength={32} inputMode="numeric" />
					<TextField {...wire('registrationNumberDIC')} label="DIČ" maxLength={32} optional />
					<TextField {...wire('email')} label="Email" type="email" maxLength={200} autoComplete="email" />
					<TextField {...wire('street')} label="Street and number" maxLength={200} autoComplete="street-address" wide />
					<TextField {...wire('city')} label="City" maxLength={200} autoComplete="address-level2" />
					<TextField {...wire('zip')} label="ZIP" maxLength={20} autoComplete="postal-code" />
					<TextField {...wire('country')} label="Country" maxLength={64} autoComplete="country-name" />
					<TextField {...wire('countTickets')} label="Number of tickets" type="number" min={1} max={50} />
				</div>

				{/* Honeypot — hidden from humans, catches bots. */}
				<input
					className={s.honeypot}
					type="text"
					tabIndex={-1}
					autoComplete="off"
					aria-hidden="true"
					value={honeypot}
					onChange={(e) => setHoneypot(e.target.value)}
				/>

				{estimate && (
					<p className={s.estimate}>
						Estimated total: <strong>{estimate.total}</strong>{' '}
						<span className={s.estimateNote}>
							({fields.countTickets} × {estimate.each}, incl. VAT)
						</span>
					</p>
				)}

				<div className={s.consentBlock}>
					<label className={s.consent}>
						<input
							ref={(el) => {
								inputs.current.consent = el;
							}}
							type="checkbox"
							checked={consented}
							onChange={(e) => {
								setConsented(e.target.checked);
								revalidate(fields, e.target.checked);
							}}
							onBlur={() => blur('consent')}
							aria-invalid={consentError ? true : undefined}
							aria-describedby={consentError ? 'invoice-consent-error' : undefined}
						/>
						<span>
							I agree to the processing of these billing details to issue an invoice. See our{' '}
							<a href="/privacy-policy" className={s.consentLink}>
								Privacy Policy
							</a>
							.
						</span>
					</label>
					{consentError && (
						<span className={s.error} id="invoice-consent-error">
							{consentError}
						</span>
					)}
				</div>

				{/* Never `disabled`: a disabled submit is out of the tab order and
				    explains nothing, so a keyboard visitor who missed the consent
				    box had no way to find out why the form would not send. It
				    stays reachable and answers on activation, naming what is
				    missing. `aria-disabled` covers only the in-flight state. */}
				<button
					className={s.button}
					type="submit"
					aria-disabled={status === 'submitting' ? true : undefined}
				>
					{status === 'submitting' ? 'Sending…' : 'Request invoice'}
				</button>

				<p
					className={s.message}
					role="status"
					aria-live="polite"
					aria-atomic="true"
					data-tone={status === 'error' ? 'error' : 'info'}
				>
					{message}
				</p>
			</form>
		</div>
	);
}
