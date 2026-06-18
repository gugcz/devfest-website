/**
 * iDoklad smoke test.
 *
 *   npm run check:idoklad                 # read-only: OAuth + API access
 *   CREATE=1 npm run check:idoklad        # ALSO creates a real test contact + invoice
 *   CREATE=1 SEND=1 npm run check:idoklad # ALSO emails it to TEST_EMAIL
 *
 * ⚠️ CREATE=1 writes a real invoice into your iDoklad accounting. Use a
 * test/sandbox agenda, or delete the test invoice afterwards.
 */
import {
	verifyCredentials,
	findOrCreateContact,
	createInvoice,
	sendInvoiceByEmail,
} from '../lib/invoice/idoklad-api.js';

function need(keys) {
	const missing = keys.filter((k) => !process.env[k]);
	if (missing.length) throw new Error(`Missing env: ${missing.join(', ')}`);
}

async function main() {
	need(['IDOKLAD_CLIENT_ID', 'IDOKLAD_CLIENT_SECRET']);
	const cfg = {
		clientId: process.env.IDOKLAD_CLIENT_ID,
		clientSecret: process.env.IDOKLAD_CLIENT_SECRET,
		appId: process.env.IDOKLAD_APP_ID || undefined,
	};

	console.log('1) OAuth token + API read…');
	await verifyCredentials(cfg);
	console.log('   ✓ token OK, GET /IssuedInvoices/Default OK');

	if (process.env.CREATE !== '1') {
		console.log('   (skip writes — set CREATE=1 to test contact + invoice creation)');
		console.log('iDoklad: READY ✅');
		return;
	}

	console.log('2) find/create contact (writes to iDoklad!)…');
	const contactId = await findOrCreateContact(cfg, {
		companyName: 'TEST DevFest s.r.o.',
		identificationNumber: '12345678',
		vatIdentificationNumber: null,
		street: 'Testovací 1',
		city: 'Praha',
		postalCode: '11000',
		email: process.env.TEST_EMAIL || 'test@example.com',
	});
	console.log('   ✓ contactId =', contactId);

	console.log('3) create issued invoice…');
	const vat = Number(process.env.INVOICE_VAT_RATE || '21');
	const invoice = await createInvoice(cfg, {
		contactId,
		dueDays: Number(process.env.INVOICE_DUE_DAYS || '14'),
		description: 'TEST DevFest.cz 2026 (smoke test)',
		line: { name: 'TEST vstupenka', quantity: 1, unitPriceNet: 1000, vatRatePercent: vat },
	});
	console.log('   ✓ invoice =', invoice);

	if (process.env.SEND === '1') {
		need(['TEST_EMAIL']);
		console.log('4) email invoice to', process.env.TEST_EMAIL, '…');
		await sendInvoiceByEmail(cfg, invoice.id, {
			subject: '[TEST] Faktura DevFest.cz 2026',
			body: 'Toto je testovací faktura (smoke test).',
			otherRecipients: [process.env.TEST_EMAIL],
		});
		console.log('   ✓ sent');
	} else {
		console.log('   (skip email — set SEND=1 + TEST_EMAIL to test invoice delivery)');
	}

	console.log('iDoklad: READY ✅  (delete the TEST invoice/contact from iDoklad)');
}

main().catch((e) => {
	console.error('✗ FAILED:', e.message);
	process.exit(1);
});
