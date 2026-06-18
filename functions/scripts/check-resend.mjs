/**
 * Resend smoke test — sends ONE real email to TEST_EMAIL using the actual
 * discount-code template.
 *
 *   npm run check:resend
 *
 * Requires RESEND_API_KEY, INVOICE_FROM_EMAIL (verified domain in Resend),
 * and TEST_EMAIL.
 */
import { sendEmail, buildDiscountEmail } from '../lib/invoice/email.js';

function need(keys) {
	const missing = keys.filter((k) => !process.env[k]);
	if (missing.length) throw new Error(`Missing env: ${missing.join(', ')}`);
}

async function main() {
	need(['RESEND_API_KEY', 'INVOICE_FROM_EMAIL', 'TEST_EMAIL']);

	const mail = buildDiscountEmail({
		code: 'TEST-CODE-123',
		link: 'https://ti.to/example/redeem',
		ticketCount: 2,
		companyName: 'TEST s.r.o.',
	});

	const result = await sendEmail(
		{
			apiKey: process.env.RESEND_API_KEY,
			fromEmail: process.env.INVOICE_FROM_EMAIL,
			fromName: process.env.INVOICE_FROM_NAME || 'DevFest.cz',
		},
		{ to: process.env.TEST_EMAIL, subject: `[TEST] ${mail.subject}`, text: mail.text, html: mail.html },
	);

	if (!result.sent) throw new Error(result.reason || 'not sent');
	console.log(`✓ Resend sent to ${process.env.TEST_EMAIL} (from ${process.env.INVOICE_FROM_EMAIL})`);
	console.log('Resend: READY ✅  (check the inbox/spam)');
}

main().catch((e) => {
	console.error('✗ FAILED:', e.message);
	process.exit(1);
});
