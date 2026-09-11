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
import { useRemoteData } from '../lib/useRemoteData';
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
	/**
	 * Raw input, not a clamped number: clamping on every keystroke (the prior
	 * behavior) meant a visitor could never clear the field to type a new
	 * value, and made the out-of-range error below unreachable. Parsed with
	 * {@link parseCount} wherever the numeric value is needed; out-of-range or
	 * unparseable is validated (and surfaced), not silently corrected.
	 */
	countTickets: string;
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
	countTickets: '1',
};

/** Parse the raw `countTickets` field into a number, or `NaN` for anything
 * unparseable (including empty, mid-edit). */
function parseCount(raw: string): number {
	return Number(raw);
}

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

	const count = parseCount(fields.countTickets);
	if (!Number.isFinite(count) || count < 1 || count > 50) {
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

/** The company-funded release, from the same cached endpoint `Tickets.tsx`
 * reads — display-only estimate, so a `null` cache resolves to no release
 * rather than an error. */
function loadCompanyRelease(signal: AbortSignal): Promise<TitoRelease | null> {
	return fetchTickets(signal).then((data) => {
		if (!data) return null;
		return findCompanyRelease(filterDisplayable(data.releases ?? []));
	});
}

/** Every field name this form knows about — used to validate a field name
 * arriving from the server before it's shown to the visitor (see
 * `fieldFromCallableError` below). */
const FIELD_NAMES = new Set<FieldName>(Object.keys(EMPTY) as FieldName[]);

/** The shape of a Firebase callable's rejection (`functions/https.HttpsError`,
 * as received client-side): a `code` (`functions/invalid-argument`, …) and an
 * optional `details` payload the function set server-side. */
interface CallableError {
	code: string;
	details?: unknown;
}

function isCallableError(e: unknown): e is CallableError {
	return typeof e === 'object' && e !== null && typeof (e as { code?: unknown }).code === 'string';
}

/**
 * The offending field name from a rejected submit, or `null`.
 *
 * Prefers `details.field` — the field name belongs in `details`, not
 * `message`: `message` is user-facing text a client might show verbatim, and
 * a validation reason is not guaranteed to BE a bare field name (see O-R19).
 * Falls back to `message` only when it's actually one of this form's known
 * field names (the current server sends exactly that), never an arbitrary
 * sentence — so a future server that starts sending real prose can't put
 * that prose in front of a visitor.
 */
function fieldFromCallableError(error: CallableError): string | null {
	const details = error.details;
	if (details && typeof details === 'object' && 'field' in details) {
		const field = (details as { field?: unknown }).field;
		if (typeof field === 'string' && FIELD_NAMES.has(field as FieldName)) return field;
	}
	const message = (error as { message?: unknown }).message;
	if (typeof message === 'string' && FIELD_NAMES.has(message as FieldName)) return message;
	return null;
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
	// Shown errors, not computed ones: a field that has never been touched and
	// has never been submitted is not "wrong yet", it is just empty.
	const [errors, setErrors] = useState<Errors>({});
	const [touched, setTouched] = useState<Partial<Record<ErrorKey, boolean>>>({});
	const [attempted, setAttempted] = useState(false);
	// So a failed submit can put the caret in the first field that needs fixing
	// rather than leaving the visitor to hunt for it.
	const inputs = useRef<Partial<Record<ErrorKey, HTMLElement | null>>>({});
	// One stable ref-callback per field, cached across renders: `wire()` used to
	// return a fresh closure every render, so React detached and reattached
	// every input's `ref` on every keystroke.
	const fieldRefs = useRef(new Map<ErrorKey, (el: HTMLElement | null) => void>());
	function fieldRef(key: ErrorKey): (el: HTMLElement | null) => void {
		let ref = fieldRefs.current.get(key);
		if (!ref) {
			ref = (el) => {
				inputs.current[key] = el;
			};
			fieldRefs.current.set(key, ref);
		}
		return ref;
	}

	// Read the company-funded price from the cached `/api/tickets` endpoint for an
	// estimate. The authoritative price is computed server-side at invoice time —
	// this is display only, so only `data` is read here; a failed load just
	// leaves the estimate off.
	const { data: release } = useRemoteData(loadCompanyRelease, {
		logLabel: '[invoice] Failed to load ticket price estimate:',
	});

	const estimate = useMemo(() => {
		if (!release) return null;
		const display = priceDisplay(release);
		// `grossPrice` holds the shared VAT assumption (ti.to exposes no tax rate);
		// it returns null for exactly the free / unpriced cases we skip here.
		const grossEach = grossPrice(release);
		const count = parseCount(fields.countTickets);
		// Mid-edit (empty, or not yet a valid count) shows no estimate rather than
		// one computed from a stale or nonsense value.
		if (!display || grossEach == null || !Number.isFinite(count) || count <= 0) return null;
		const total = grossEach * count;
		return {
			each: display.primary,
			total: formatPrice(String(total), release.currency),
			/** Numeric total + currency for the GA4 `generate_lead` value. */
			amount: Math.round(total * 100) / 100,
			currency: (release.currency ?? 'CZK').toUpperCase(),
		};
	}, [release, fields.countTickets]);

	// Re-check after the first failed submit, so an error clears as it is
	// fixed — keyed on `fields`/`consented` themselves (not called inline from
	// `update()`) so it sees every update, including two in the same tick.
	useEffect(() => {
		if (!attempted) return;
		setErrors(validate(fields, consented));
	}, [fields, consented, attempted]);

	function update<K extends keyof Fields>(key: K, value: Fields[K]) {
		// Functional update: two fields changing in the same tick (paste-fill,
		// autofill) each get their own `prev`, so neither overwrites the other.
		setFields((prev) => ({ ...prev, [key]: value }));
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
				quantity: parseCount(fields.countTickets),
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
			const callableError = isCallableError(e) ? e : null;
			const code = callableError?.code ?? '';
			const field = callableError ? fieldFromCallableError(callableError) : null;
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
			inputRef: fieldRef(name),
			onValue: (raw: string) => update(name, raw as Fields[typeof name]),
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
							ref={fieldRef('consent')}
							type="checkbox"
							checked={consented}
							onChange={(e) => setConsented(e.target.checked)}
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

				{/* `alert` for an error tone (a validation failure is an interruption,
				    same as `ErrorState` in DataState.tsx), `status` otherwise — a
				    validation failure was previously announced exactly as politely as
				    "Sending your request…", distinguished only by `data-tone`. */}
				<p
					className={s.message}
					role={status === 'error' ? 'alert' : 'status'}
					aria-live={status === 'error' ? undefined : 'polite'}
					aria-atomic="true"
					data-tone={status === 'error' ? 'error' : 'info'}
				>
					{message}
				</p>
			</form>
		</div>
	);
}
