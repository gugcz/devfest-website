import { useEffect, useState, type FormEvent } from 'react';
import s from './NewsletterForm.module.scss';

const FORM_ACTION =
	'https://app.smartemailing.cz/public/web-forms-v2/display-form/167903-ggds3kxovwsftn01lh5m7yhk8m4wwxdjdm1xbq2dnhipx2twwqpfbdq66w91nbw4wvqi81suvi5r8bt43zw76foqqs2xigrw3a97';

export default function NewsletterForm() {
	const [message, setMessage] = useState('');
	// The field the last failed submit stopped on; its message is an error.
	const [invalid, setInvalid] = useState<'email' | 'consent' | null>(null);
	// Until the island hydrates the browser validates on its own: the
	// required email and consent block a submit that skips the checkbox.
	const [hydrated, setHydrated] = useState(false);

	useEffect(() => {
		setHydrated(true);
		const refField = document.getElementById('se-ref-field-id') as HTMLInputElement | null;
		if (refField && refField.value.trim() === '') {
			refField.value = window.location.href;
		}
	}, []);

	function fail(event: FormEvent, field: HTMLInputElement, which: 'email' | 'consent', text: string) {
		event.preventDefault();
		setInvalid(which);
		setMessage(text);
		field.focus();
	}

	function clear() {
		setInvalid(null);
		setMessage('');
	}

	// Checks in fill order (email, then consent) and focuses the first bad
	// field. The checkbox is read from the DOM, not state: a tick made before
	// the island hydrated counts.
	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		const form = event.currentTarget;
		const email = form.elements.namedItem('fields[df_emailaddress]') as HTMLInputElement;
		const consent = form.elements.namedItem('newsletter-consent') as HTMLInputElement;
		if (!email.checkValidity()) {
			fail(event, email, 'email', 'Enter a valid email address to receive updates.');
			return;
		}
		if (!consent.checked) {
			fail(event, consent, 'consent', 'Please confirm the consent checkbox to continue.');
			return;
		}
		setInvalid(null);
		setMessage('Submitting your email…');
	}

	return (
		<div className={s.wrapper}>
			<div className={s.edge} aria-hidden="true">
				<span className={s.edgeWord}>DevFest.cz</span>
				<span>2026</span>
			</div>
			<form
				className={s.form}
				method="post"
				action={FORM_ACTION}
				onSubmit={handleSubmit}
				noValidate={hydrated}
			>
				<div className={s.field}>
					<label htmlFor="newsletter-email" className={s.label}>
						Email
					</label>
					<input
						className={s.input}
						type="email"
						id="newsletter-email"
						name="fields[df_emailaddress]"
						data-emailaddress="1"
						required
						autoComplete="email"
						aria-describedby="newsletter-message"
						aria-invalid={invalid === 'email' || undefined}
						onChange={clear}
					/>
				</div>
				<label className={s.consent}>
					<input
						type="checkbox"
						id="newsletter-consent"
						aria-describedby="newsletter-message"
						aria-invalid={invalid === 'consent' || undefined}
						onChange={clear}
						required
					/>
					<span>
						I agree to receive conference updates by email. See our{' '}
						<a href="/privacy-policy" className={s.consentLink}>Privacy Policy</a>.
					</span>
				</label>
				<button
					className={s.button}
					type="submit"
					name="_submit"
					value="Subscribe"
				>
					Notify me
				</button>
				<input type="hidden" name="referrer" id="se-ref-field-id" defaultValue="" />
				<input type="hidden" name="sessionid" id="se-sessionid-field" defaultValue="" />
				<input type="hidden" name="sessionUid" id="se-sessionUid-field" defaultValue="" />
				<input type="hidden" name="_do" value="webFormHtmlRenderer-webFormForm-submit" />
			</form>
			<p
				id="newsletter-message"
				className={s.message}
				data-tone={invalid ? 'error' : 'info'}
				role="status"
				aria-live="polite"
				aria-atomic="true"
			>
				{message}
			</p>
		</div>
	);
}
