import { useEffect } from 'react';
import s from './NewsletterForm.module.scss';

const FORM_ACTION =
	'https://app.smartemailing.cz/public/web-forms-v2/display-form/167903-ggds3kxovwsftn01lh5m7yhk8m4wwxdjdm1xbq2dnhipx2twwqpfbdq66w91nbw4wvqi81suvi5r8bt43zw76foqqs2xigrw3a97';

export default function NewsletterForm() {
	useEffect(() => {
		const refField = document.getElementById('se-ref-field-id') as HTMLInputElement | null;
		if (refField && refField.value.trim() === '') {
			refField.value = window.location.href;
		}
	}, []);

	return (
		<form className={s.form} method="post" action={FORM_ACTION}>
			<label htmlFor="newsletter-email" className={s.srOnly}>
				Email address
			</label>
			<input
				className={s.input}
				type="text"
				id="newsletter-email"
				name="fields[df_emailaddress]"
				data-emailaddress="1"
				placeholder="your@email.com"
				required
				autoComplete="email"
			/>
			<button className={s.button} type="submit" name="_submit" value="Subscribe">
				Notify Me
			</button>
			<input type="hidden" name="referrer" id="se-ref-field-id" defaultValue="" />
			<input type="hidden" name="sessionid" id="se-sessionid-field" defaultValue="" />
			<input type="hidden" name="sessionUid" id="se-sessionUid-field" defaultValue="" />
			<input type="hidden" name="_do" value="webFormHtmlRenderer-webFormForm-submit" />
		</form>
	);
}
