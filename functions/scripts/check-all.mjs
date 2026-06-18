/**
 * Read-only readiness check — NO side effects (no invoices, no emails, no
 * discount codes). Verifies credentials + that a company-funded release
 * resolves for pricing.
 *
 *   npm run check        (from functions/, builds first)
 *
 * Per-service deep tests (with optional writes): check:idoklad / check:tito
 * / check:resend.
 */
import { verifyCredentials } from '../lib/invoice/idoklad-api.js';
import { resolveCompanyFundedReleases, pickPricingRelease, releaseNetUnitPrice } from '../lib/invoice/tito-discount.js';

function need(keys) {
	const missing = keys.filter((k) => !process.env[k]);
	if (missing.length) throw new Error(`Missing env: ${missing.join(', ')}`);
}

async function main() {
	let ok = true;

	// iDoklad
	try {
		need(['IDOKLAD_CLIENT_ID', 'IDOKLAD_CLIENT_SECRET']);
		await verifyCredentials({
			clientId: process.env.IDOKLAD_CLIENT_ID,
			clientSecret: process.env.IDOKLAD_CLIENT_SECRET,
			appId: process.env.IDOKLAD_APP_ID || undefined,
		});
		console.log('✓ iDoklad: OAuth token + API access OK');
	} catch (e) {
		ok = false;
		console.error('✗ iDoklad:', e.message);
	}

	// ti.to
	try {
		need(['TITO_API_TOKEN', 'TITO_ACCOUNT_SLUG', 'TITO_EVENT_SLUG']);
		const cfg = {
			token: process.env.TITO_API_TOKEN,
			accountSlug: process.env.TITO_ACCOUNT_SLUG,
			eventSlug: process.env.TITO_EVENT_SLUG,
		};
		const match = process.env.INVOICE_RELEASE_MATCH || 'company funded';
		const releases = await resolveCompanyFundedReleases(cfg, match);
		const pricing = pickPricingRelease(releases);
		if (!pricing) throw new Error(`no release matches "${match}" — invoice pricing would fail`);
		const vat = Number(process.env.INVOICE_VAT_RATE || '21');
		console.log(
			`✓ ti.to: ${releases.length} "${match}" release(s); pricing from "${pricing.title}" ` +
				`(net unit ${releaseNetUnitPrice(pricing, vat)} ${pricing.currency ?? 'CZK'})`,
		);
	} catch (e) {
		ok = false;
		console.error('✗ ti.to:', e.message);
	}

	// Resend (no read endpoint — just confirm it is configured)
	if (process.env.RESEND_API_KEY && process.env.INVOICE_FROM_EMAIL) {
		console.log('• Resend: key present (run `npm run check:resend` to send a real test email)');
	} else {
		console.log('• Resend: not configured — discount-code email will fall back to Slack only');
	}

	console.log(ok ? '\nREADY ✅' : '\nNOT READY ❌');
	if (!ok) process.exit(1);
}

main().catch((e) => {
	console.error('✗ FAILED:', e.message);
	process.exit(1);
});
