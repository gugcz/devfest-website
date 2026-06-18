/**
 * Minimal transactional email via the Resend HTTP API (no SDK dependency).
 *
 * Used only for the post-payment discount-code email. The invoice itself
 * is delivered by iDoklad. If no API key is configured, `sendEmail`
 * returns `{ sent: false }` rather than throwing — the caller falls back
 * to Slack + the stored code.
 *
 * Docs: https://resend.com/docs/api-reference/emails/send-email
 */

const RESEND_SEND_URL = 'https://api.resend.com/emails';

export interface EmailConfig {
	apiKey: string;
	fromEmail: string;
	fromName: string;
}

export interface EmailMessage {
	to: string;
	subject: string;
	text: string;
	html: string;
}

export interface SendResult {
	sent: boolean;
	reason?: string;
}

export async function sendEmail(cfg: EmailConfig, msg: EmailMessage): Promise<SendResult> {
	if (!cfg.apiKey) {
		return { sent: false, reason: 'no RESEND_API_KEY configured' };
	}

	const res = await fetch(RESEND_SEND_URL, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${cfg.apiKey}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			// Resend expects `from` as "Name <email@domain>"; the domain must
			// be verified in the Resend dashboard.
			from: `${cfg.fromName} <${cfg.fromEmail}>`,
			to: msg.to,
			subject: msg.subject,
			html: msg.html,
			text: msg.text,
		}),
	});

	if (!res.ok) {
		const body = await res.text().catch(() => '');
		throw new Error(`Resend ${res.status} ${res.statusText}: ${body.slice(0, 300)}`);
	}
	return { sent: true };
}

/**
 * Body for the email that delivers the 100%-off code after payment.
 */
export function buildDiscountEmail(opts: {
	code: string;
	link: string;
	ticketCount: number;
	companyName: string;
}): { subject: string; text: string; html: string } {
	const { code, link, ticketCount, companyName } = opts;
	const plural = ticketCount === 1 ? 'ticket' : 'tickets';
	const subject = `Your DevFest.cz ${ticketCount} ${plural} — redeem code ${code}`;
	const text = [
		`Hi ${companyName},`,
		``,
		`Thanks — your invoice is paid. Use the code below to claim your ${ticketCount} ${plural} on ti.to.`,
		``,
		`Discount code: ${code}`,
		`Redeem link: ${link}`,
		``,
		`The code covers 100% of the ticket price for ${ticketCount} ${plural}.`,
		``,
		`See you at DevFest.cz!`,
	].join('\n');
	const html = `
		<p>Hi ${escapeHtml(companyName)},</p>
		<p>Thanks — your invoice is paid. Use the code below to claim your
		${ticketCount} ${plural} on ti.to.</p>
		<p style="font-size:1.25rem"><strong>Discount code:</strong>
		<code>${escapeHtml(code)}</code></p>
		<p><a href="${escapeHtml(link)}">Redeem your ${plural} →</a></p>
		<p>The code covers 100% of the ticket price for ${ticketCount} ${plural}.</p>
		<p>See you at DevFest.cz!</p>
	`.trim();
	return { subject, text, html };
}

function escapeHtml(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}
