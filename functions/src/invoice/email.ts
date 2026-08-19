/**
 * Transactional email for the invoice domain.
 *
 * Two messages leave this pipeline, and they leave by different roads:
 *
 *  - the **invoice** itself is sent by iDoklad (`/Mails/IssuedInvoice/Send`,
 *    PDF attached). We only supply the subject + covering message, so that
 *    one is composed here as plain text — iDoklad drops the body into its
 *    own mail template and we can't style around it.
 *  - the **discount code**, after payment, goes out through Resend as a
 *    branded HTML mail (with a plain-text alternative for clients that ask
 *    for one, and for spam scoring). Layout lives in `email-template.ts`.
 *
 * If no Resend API key is configured, `sendEmail` returns `{ sent: false }`
 * rather than throwing — the caller falls back to Slack + the stored code.
 *
 * Docs: https://resend.com/docs/api-reference/emails/send-email
 */

import { errorBody, fetchWithRetry } from '../lib/http.js';
import {
	BRAND,
	button,
	codePanel,
	detailList,
	escapeHtml,
	link,
	paragraph,
	renderEmail,
	small,
	steps,
	strong,
} from './email-template.js';

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

	// One attempt only (the shared helper pins a POST to one): a replay the first
	// attempt actually delivered sends the company a second copy of its code.
	const res = await fetchWithRetry(
		RESEND_SEND_URL,
		{
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
				// Replies belong with the organisers, not the no-reply sender.
				reply_to: BRAND.contactEmail,
			}),
		},
		{ label: 'Resend send' },
	);

	if (!res.ok) {
		throw new Error(`Resend ${res.status} ${res.statusText}: ${await errorBody(res)}`);
	}
	return { sent: true };
}

export interface BuiltMessage {
	subject: string;
	text: string;
	html: string;
}

/**
 * The email that delivers the 100%-off code once the invoice is paid.
 *
 * The code is the whole point of the message, so it gets the panel and the
 * CTA; everything else is context. The plain-text part is a real fallback,
 * not a stripped copy — it carries the same code, link and steps.
 */
export function buildDiscountEmail(opts: {
	code: string;
	link: string;
	ticketCount: number;
	companyName: string;
	invoiceNumber?: string | null;
}): BuiltMessage {
	const { code, link: redeemUrl, ticketCount, companyName, invoiceNumber } = opts;
	const plural = ticketCount === 1 ? 'ticket' : 'tickets';
	const subject = `Payment received — claim your ${ticketCount} ${plural} for ${BRAND.eventName}`;

	const details: Array<{ label: string; value: string }> = [
		{ label: 'Company', value: companyName },
		{ label: 'Tickets', value: `${ticketCount}× ${BRAND.eventName} admission` },
	];
	if (invoiceNumber) details.push({ label: 'Invoice', value: invoiceNumber });

	const html = renderEmail({
		title: subject,
		preheader: `Your invoice is paid. Use code ${code} to claim your ${ticketCount} ${plural}.`,
		eyebrow: 'Payment received',
		headline: `Your ${plural} are ready to claim`,
		body: [
			paragraph(
				`Hi ${escapeHtml(companyName)}, thank you — your invoice has been paid in full. ` +
					`The code below covers 100% of the price for ${ticketCount} ${plural}, ` +
					`so registration on ti.to costs nothing further.`,
				{ top: 24 },
			),
			codePanel({
				label: `Discount code · ${ticketCount} ${plural}`,
				value: code,
				note: 'Enter it at checkout, or use the button below to have it applied for you.',
			}),
			button({ href: redeemUrl, label: `Claim your ${plural}` }),
			small(
				`Button not working? Open this link:<br />${link(redeemUrl, redeemUrl)}`,
				{ top: 18 },
			),
			detailList(details),
			paragraph(strong('What happens next'), { top: 28 }),
			steps([
				`Open the link above and register each attendee — one registration per ticket.`,
				`Every attendee gets their own ti.to ticket by email.`,
				`Bring that ticket (phone or print) to the entrance on ${escapeHtml(BRAND.dateLine)}.`,
			]),
			small(
				`Need to change the number of tickets or the attendee details? Just reply to this email.`,
				{ top: 24 },
			),
		].join('\n'),
	});

	const text = [
		`Hi ${companyName},`,
		``,
		`Thank you — your invoice for ${BRAND.eventName} has been paid in full.`,
		`The code below covers 100% of the price for ${ticketCount} ${plural}, so`,
		`registration on ti.to costs nothing further.`,
		``,
		`DISCOUNT CODE: ${code}`,
		`CLAIM YOUR ${plural.toUpperCase()}: ${redeemUrl}`,
		``,
		...(invoiceNumber ? [`Invoice: ${invoiceNumber}`, ``] : []),
		`WHAT HAPPENS NEXT`,
		`1. Open the link above and register each attendee — one registration per ticket.`,
		`2. Every attendee gets their own ti.to ticket by email.`,
		`3. Bring that ticket (phone or print) to the entrance on ${BRAND.dateLine}.`,
		``,
		`Need to change the number of tickets or the attendee details? Just reply to this email.`,
		``,
		`See you at ${BRAND.eventName}.`,
		``,
		`—`,
		`${BRAND.eventName} · ${BRAND.tagline}`,
		`${BRAND.dateLine} · ${BRAND.venue}`,
		`${BRAND.siteUrl} · ${BRAND.contactEmail}`,
		`Organised by ${BRAND.organizer}`,
	].join('\n');

	return { subject, text, html };
}

/**
 * `YYYY-MM-DD` → `DD. MM. YYYY`, the format Czech invoices are read in
 * (and the one the attached iDoklad PDF prints). Returns the input
 * unchanged if it isn't a plain ISO date, so a surprise format degrades
 * to something still readable rather than `NaN`.
 */
export function formatDueDate(iso: string): string {
	const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
	return m ? `${Number(m[3])}. ${Number(m[2])}. ${m[1]}` : iso;
}

/**
 * Subject + covering message for the invoice iDoklad mails out (PDF
 * attached).
 *
 * Plain text on purpose: iDoklad renders `EmailBody` inside its own mail
 * template, so HTML we send is not guaranteed to survive — and half-rendered
 * markup would read far worse than clean text. Keep the lines short; the
 * template wraps at an unknown width.
 */
export function buildInvoiceEmail(opts: {
	companyName: string;
	ticketCount: number;
	invoiceNumber?: string | null;
	variableSymbol?: string | null;
	dueDate?: string | null;
}): { subject: string; body: string } {
	const { companyName, ticketCount, invoiceNumber, variableSymbol, dueDate } = opts;
	const plural = ticketCount === 1 ? 'ticket' : 'tickets';
	const subject = invoiceNumber
		? `Invoice ${invoiceNumber} — ${BRAND.eventName} (${ticketCount} ${plural})`
		: `Your invoice for ${BRAND.eventName} (${ticketCount} ${plural})`;

	const facts = [
		invoiceNumber ? `Invoice number:  ${invoiceNumber}` : null,
		variableSymbol ? `Variable symbol: ${variableSymbol}` : null,
		dueDate ? `Due date:        ${dueDate}` : null,
		`Tickets:         ${ticketCount}× ${BRAND.eventName} admission`,
	].filter((line): line is string => line !== null);

	const body = [
		`Dear ${companyName},`,
		``,
		`thank you for your order of ${ticketCount} ${plural} for ${BRAND.eventName},`,
		`${BRAND.dateLine}, ${BRAND.venue}.`,
		``,
		`Your invoice is attached as a PDF and is payable by bank transfer.`,
		``,
		...facts,
		``,
		`Please use the variable symbol above so we can match your payment.`,
		`Once it is credited, we will email you a code that covers the full`,
		`price of your ${plural} — you then register each attendee on ti.to and`,
		`every one of them receives their own ticket.`,
		``,
		`Any questions about the order or the invoice? Reply to this email or`,
		`write to ${BRAND.contactEmail}.`,
		``,
		`We look forward to seeing you there.`,
		``,
		`${BRAND.eventName} team`,
		`${BRAND.siteUrl} · organised by ${BRAND.organizer}`,
	].join('\n');

	return { subject, body };
}
