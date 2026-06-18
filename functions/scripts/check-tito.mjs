/**
 * ti.to smoke test.
 *
 *   npm run check:tito                  # read-only: resolve company-funded releases + price
 *   CREATE_CODE=1 npm run check:tito    # ALSO mints a REAL 100%-off discount code
 *
 * ⚠️ CREATE_CODE=1 creates a real discount code in your ti.to event.
 */
import {
	resolveCompanyFundedReleases,
	pickPricingRelease,
	releaseNetUnitPrice,
	createDiscountCode,
	discountRedeemUrl,
	buildDiscountCode,
} from '../lib/invoice/tito-discount.js';

function need(keys) {
	const missing = keys.filter((k) => !process.env[k]);
	if (missing.length) throw new Error(`Missing env: ${missing.join(', ')}`);
}

async function main() {
	need(['TITO_API_TOKEN', 'TITO_ACCOUNT_SLUG', 'TITO_EVENT_SLUG']);
	const cfg = {
		token: process.env.TITO_API_TOKEN,
		accountSlug: process.env.TITO_ACCOUNT_SLUG,
		eventSlug: process.env.TITO_EVENT_SLUG,
	};
	const match = process.env.INVOICE_RELEASE_MATCH || 'company funded';

	console.log(`1) resolve releases matching "${match}"…`);
	const releases = await resolveCompanyFundedReleases(cfg, match);
	if (releases.length === 0) throw new Error(`no release matches "${match}" — invoice pricing would fail`);
	for (const r of releases) {
		console.log(`   - ${r.title} (id=${r.id}, price=${r.price} ${r.currency ?? ''}, state=${r.state_name ?? '?'})`);
	}

	const pricing = pickPricingRelease(releases);
	const vat = Number(process.env.INVOICE_VAT_RATE || '21');
	console.log(`2) pricing release: "${pricing.title}" → net unit ${releaseNetUnitPrice(pricing, vat)} ${pricing.currency ?? 'CZK'}`);

	if (process.env.CREATE_CODE === '1') {
		console.log('3) mint a REAL 100%-off test code…');
		const code = buildDiscountCode('SMOKE TEST', String(Date.now()).slice(-6));
		const created = await createDiscountCode(cfg, { code, quantity: 1, releaseIds: releases.map((r) => r.id) });
		console.log('   ✓ code =', created.code);
		console.log('   redeem:', discountRedeemUrl(cfg, created.code));
		console.log('   (delete this test code from ti.to)');
	} else {
		console.log('   (skip code creation — set CREATE_CODE=1 to mint a REAL test code)');
	}

	console.log('ti.to: READY ✅');
}

main().catch((e) => {
	console.error('✗ FAILED:', e.message);
	process.exit(1);
});
