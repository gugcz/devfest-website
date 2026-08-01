import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
	fetchTickets,
	filterDisplayable,
	formatPrice,
	priceDisplay,
	releaseStatus,
	releaseTitle,
	type TitoRelease,
} from '../lib/tito';
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

function findCompanyRelease(releases: TitoRelease[]): TitoRelease | null {
	const matches = releases.filter((r) =>
		releaseTitle(r).toLowerCase().includes(COMPANY_RELEASE_MATCH),
	);
	if (matches.length === 0) return null;
	return matches.find((r) => releaseStatus(r).purchasable) ?? matches[0];
}

export default function InvoiceForm() {
	const [fields, setFields] = useState<Fields>(EMPTY);
	const [consented, setConsented] = useState(false);
	const [honeypot, setHoneypot] = useState('');
	const [status, setStatus] = useState<Status>('idle');
	const [message, setMessage] = useState('');
	const [release, setRelease] = useState<TitoRelease | null>(null);

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
		if (!display || release.price == null) return null;
		const price = Number(release.price);
		if (!Number.isFinite(price) || price === 0) return null;
		const grossEach = release.tax_exclusive === false ? price : price * 1.21;
		const total = grossEach * fields.countTickets;
		return {
			each: display.primary,
			total: formatPrice(String(total), release.currency),
		};
	}, [release, fields.countTickets]);

	function update<K extends keyof Fields>(key: K, value: Fields[K]) {
		setFields((prev) => ({ ...prev, [key]: value }));
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!consented) {
			setMessage('Please confirm the consent checkbox to continue.');
			return;
		}
		setStatus('submitting');
		setMessage('Sending your request…');
		const recipient = fields.email;
		try {
			// Callable: the Functions SDK auto-attaches the Firebase App Check
			// token, and the function enforces it server-side (enforceAppCheck).
			const [{ getFirebaseApp, trackEvent }, { getFunctions, httpsCallable }] = await Promise.all([
				import('../lib/firebase'),
				import('firebase/functions'),
			]);
			const submit = httpsCallable(getFunctions(getFirebaseApp(), FUNCTIONS_REGION), 'submitInvoiceCallable');
			await submit({ ...fields, website: honeypot });
			// Only on the resolved callable — a rejected submit is not a lead.
			// Ticket count is the value signal here; no company PII is reported.
			void trackEvent('invoice_request', { quantity: fields.countTickets });
			setStatus('success');
			setMessage(
				`Request received. We'll email the invoice to ${recipient}. ` +
					`Once it's paid, you'll get a code to claim your ticket(s) on ti.to.`,
			);
			setFields(EMPTY);
			setConsented(false);
		} catch (e) {
			const code = (e as { code?: string }).code ?? '';
			const field = (e as { message?: string }).message ?? '';
			setStatus('error');
			setMessage(
				code === 'functions/invalid-argument'
					? `Please check the ${field} field.`
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

	return (
		<div className={s.wrapper}>
			<form className={s.form} onSubmit={handleSubmit} noValidate>
				<div className={s.grid}>
					<label className={s.field}>
						<span className={s.label}>Company name</span>
						<input
							className={s.input}
							type="text"
							required
							maxLength={200}
							value={fields.companyName}
							onChange={(e) => update('companyName', e.target.value)}
							autoComplete="organization"
						/>
					</label>

					<label className={s.field}>
						<span className={s.label}>IČO</span>
						<input
							className={s.input}
							type="text"
							required
							maxLength={32}
							value={fields.registrationNumberIC}
							onChange={(e) => update('registrationNumberIC', e.target.value)}
							inputMode="numeric"
						/>
					</label>

					<label className={s.field}>
						<span className={s.label}>
							DIČ <span className={s.optional}>(optional)</span>
						</span>
						<input
							className={s.input}
							type="text"
							maxLength={32}
							value={fields.registrationNumberDIC}
							onChange={(e) => update('registrationNumberDIC', e.target.value)}
						/>
					</label>

					<label className={s.field}>
						<span className={s.label}>Email</span>
						<input
							className={s.input}
							type="email"
							required
							maxLength={200}
							value={fields.email}
							onChange={(e) => update('email', e.target.value)}
							autoComplete="email"
						/>
					</label>

					<label className={`${s.field} ${s.fieldWide}`}>
						<span className={s.label}>Street and number</span>
						<input
							className={s.input}
							type="text"
							required
							maxLength={200}
							value={fields.street}
							onChange={(e) => update('street', e.target.value)}
							autoComplete="street-address"
						/>
					</label>

					<label className={s.field}>
						<span className={s.label}>City</span>
						<input
							className={s.input}
							type="text"
							required
							maxLength={200}
							value={fields.city}
							onChange={(e) => update('city', e.target.value)}
							autoComplete="address-level2"
						/>
					</label>

					<label className={s.field}>
						<span className={s.label}>ZIP</span>
						<input
							className={s.input}
							type="text"
							required
							maxLength={20}
							value={fields.zip}
							onChange={(e) => update('zip', e.target.value)}
							autoComplete="postal-code"
						/>
					</label>

					<label className={s.field}>
						<span className={s.label}>Country</span>
						<input
							className={s.input}
							type="text"
							required
							maxLength={64}
							value={fields.country}
							onChange={(e) => update('country', e.target.value)}
							autoComplete="country-name"
						/>
					</label>

					<label className={s.field}>
						<span className={s.label}>Number of tickets</span>
						<input
							className={s.input}
							type="number"
							required
							min={1}
							max={50}
							value={fields.countTickets}
							onChange={(e) =>
								update('countTickets', Math.max(1, Math.min(50, Number(e.target.value) || 1)))
							}
						/>
					</label>
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

				<label className={s.consent}>
					<input
						type="checkbox"
						checked={consented}
						onChange={(e) => setConsented(e.target.checked)}
						required
					/>
					<span>
						I agree to the processing of these billing details to issue an invoice. See our{' '}
						<a href="/privacy-policy" className={s.consentLink}>
							Privacy Policy
						</a>
						.
					</span>
				</label>

				<button className={s.button} type="submit" disabled={status === 'submitting' || !consented}>
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
