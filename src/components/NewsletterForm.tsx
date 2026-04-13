import { type FormEvent, useState } from 'react';
import s from './NewsletterForm.module.scss';

export default function NewsletterForm() {
	const [submitted, setSubmitted] = useState(false);

	function handleSubmit(e: FormEvent) {
		e.preventDefault();
		// TODO: Replace with fetch() to real newsletter endpoint
		setSubmitted(true);
	}

	return (
		<div>
			<form className={s.form} onSubmit={handleSubmit}>
				<label htmlFor="newsletter-email" className={s.srOnly}>
					Email address
				</label>
				<input
					className={s.input}
					type="email"
					id="newsletter-email"
					name="email"
					placeholder="your@email.com"
					required
					autoComplete="email"
					disabled={submitted}
				/>
				<button className={s.button} type="submit" disabled={submitted}>
					{submitted ? 'Sent!' : 'Notify Me'}
				</button>
			</form>
			<p className={s.message} aria-live="polite">
				{submitted && "Thanks! We'll keep you posted."}
			</p>
		</div>
	);
}
