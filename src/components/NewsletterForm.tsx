import { useEffect, useState } from 'react';
import s from './NewsletterForm.module.scss';

const FORM_ACTION =
	'https://app.smartemailing.cz/public/web-forms-v2/display-form/167903-ggds3kxovwsftn01lh5m7yhk8m4wwxdjdm1xbq2dnhipx2twwqpfbdq66w91nbw4wvqi81suvi5r8bt43zw76foqqs2xigrw3a97';

export default function NewsletterForm() {
	const [consented, setConsented] = useState(false);

	useEffect(() => {
		const refField = document.getElementById('se-ref-field-id') as HTMLInputElement | null;
		if (refField && refField.value.trim() === '') {
			refField.value = window.location.href;
		}
	}, []);

	return (
		<div className={s.wrapper}>
			<form className={s.form} method="post" action={FORM_ACTION}>
				<label htmlFor="newsletter-email" className={s.srOnly}>
					Email address
				</label>
				<div className={s.paper}>
					<input
						className={s.input}
						type="email"
						id="newsletter-email"
						name="fields[df_emailaddress]"
						data-emailaddress="1"
						placeholder="your@email.com"
						required
						autoComplete="email"
					/>
				</div>
				<button className={s.button} type="submit" name="_submit" value="Subscribe" disabled={!consented} aria-describedby="newsletter-consent-text">
					Notify Me
				</button>
				<input type="hidden" name="referrer" id="se-ref-field-id" defaultValue="" />
				<input type="hidden" name="sessionid" id="se-sessionid-field" defaultValue="" />
				<input type="hidden" name="sessionUid" id="se-sessionUid-field" defaultValue="" />
				<input type="hidden" name="_do" value="webFormHtmlRenderer-webFormForm-submit" />
			</form>
			<label className={s.consent}>
				<input
					type="checkbox"
					checked={consented}
					onChange={(e) => setConsented(e.target.checked)}
					required
				/>
				<span id="newsletter-consent-text">
					I agree to receive conference updates by email. See our{' '}
					<a href="/privacy-policy" className={s.consentLink}>Privacy Policy</a>.
				</span>
			</label>
		</div>
	);
}
