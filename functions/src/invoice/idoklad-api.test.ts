/**
 * iDoklad client tests: a reused contact is never written, `Send` names the
 * submitter, and 200 + `IsSuccess: false` is a failure.
 * No network — `globalThis.fetch` is a table of route handlers.
 */

import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';

import {
	IdokladApiError,
	findOrCreateContact,
	getInvoicePaymentStatus,
	maskEmail,
	sendInvoiceByEmail,
	type IdokladConfig,
} from './idoklad-api.js';

const CFG: IdokladConfig = { clientId: 'id', clientSecret: 'secret' };

interface RecordedCall {
	method: string;
	path: string;
	body: any;
}

type Handler = (call: RecordedCall) => { status?: number; json: unknown };

const realFetch = globalThis.fetch;
let calls: RecordedCall[] = [];

/**
 * Fetch stub keyed by `"<METHOD> <path>"`, matched EXACTLY unless the key
 * ends in `*` (a prefix stub once passed tests against a URL that 405s at
 * iDoklad). Unmatched calls throw. The token endpoint is always answered.
 */
function mockFetch(routes: Record<string, Handler>) {
	globalThis.fetch = (async (url: any, init: any = {}) => {
		const href = String(url);
		const method = String(init.method ?? 'GET').toUpperCase();

		if (href.includes('identity.idoklad.cz')) {
			return jsonResponse(200, { access_token: 'token', expires_in: 3600 });
		}

		const path = href.replace('https://api.idoklad.cz/v3', '');
		const call: RecordedCall = {
			method,
			path,
			body: init.body === undefined ? undefined : JSON.parse(String(init.body)),
		};
		calls.push(call);

		const key = Object.keys(routes).find((k) => {
			const [m, pattern] = k.split(' ');
			if (m !== method) return false;
			return pattern.endsWith('*') ? path.startsWith(pattern.slice(0, -1)) : path === pattern;
		});
		if (!key) throw new Error(`unstubbed iDoklad call: ${method} ${path}`);
		const { status = 200, json } = routes[key](call);
		return jsonResponse(status, json);
	}) as typeof fetch;
}

function jsonResponse(status: number, json: unknown): Response {
	return new Response(JSON.stringify(json), {
		status,
		headers: { 'Content-Type': 'application/json' },
	});
}

beforeEach(() => {
	calls = [];
});

afterEach(() => {
	globalThis.fetch = realFetch;
});

describe('findOrCreateContact', () => {
	const acme = {
		companyName: 'Acme Example s.r.o.',
		identificationNumber: '12345678',
		street: 'Example 1',
		city: 'Praha',
		postalCode: '11000',
		email: 'billing@example.com',
	};

	/** A stored contact carrying exactly the form's details. */
	const storedAcme = {
		Id: 4242,
		IdentificationNumber: '12345678',
		CompanyName: 'Acme Example s.r.o.',
		Street: 'Example 1',
		City: 'Praha',
		PostalCode: '11000',
		Email: 'billing@example.com',
	};

	const foundContact = (item: Record<string, unknown>): Handler => () => ({
		json: { IsSuccess: true, Data: { Items: [item] } },
	});

	it('reuses a contact matched by IČO without writing to it', async () => {
		mockFetch({ 'GET /Contacts?*': foundContact(storedAcme) });

		const contact = await findOrCreateContact(CFG, acme);

		assert.deepEqual(contact, { id: 4242, reused: true, differing: [] });
		assert.deepEqual(
			calls.map((c) => c.method),
			['GET'],
			'a reused contact is read, never written',
		);
	});

	it('names the form fields that disagree with the stored record', async () => {
		mockFetch({
			'GET /Contacts?*': foundContact({
				...storedAcme,
				Email: 'first.orderer@example.com',
				Street: 'Old Street 9',
			}),
		});

		const contact = await findOrCreateContact(CFG, acme);

		assert.equal(contact.reused, true);
		assert.deepEqual(contact.differing, ['street', 'email']);
		assert.equal(calls.length, 1, 'still no write');
	});

	it('compares trimmed and case-insensitively, and ignores blank form fields', async () => {
		mockFetch({
			'GET /Contacts?*': foundContact({
				...storedAcme,
				Email: ' Billing@Example.com ',
				Street: 'Somewhere else',
			}),
		});

		const contact = await findOrCreateContact(CFG, {
			companyName: 'acme example S.R.O.',
			identificationNumber: '12345678',
			street: '   ',
			city: null,
			email: 'billing@example.com',
		});

		assert.deepEqual(contact, { id: 4242, reused: true, differing: [] });
	});

	it('creates a contact when no IČO matches', async () => {
		mockFetch({
			'GET /Contacts?*': () => ({ json: { IsSuccess: true, Data: { Items: [] } } }),
			'GET /Contacts/Default': () => ({ json: { IsSuccess: true, Data: { CountryId: 2 } } }),
			'POST /Contacts': () => ({ json: { IsSuccess: true, Data: { Id: 99 } } }),
		});

		const contact = await findOrCreateContact(CFG, {
			companyName: 'Acme',
			identificationNumber: '12345678',
			email: 'ops@acme.cz',
		});

		assert.deepEqual(contact, { id: 99, reused: false, differing: [] });
		const post = calls.find((c) => c.method === 'POST')!;
		assert.equal(post.body.CountryId, 2, 'starts from the account default');
		assert.equal(post.body.IdentificationNumber, '12345678');
		assert.equal(post.body.Email, 'ops@acme.cz');
	});

	it('creates a contact when the lookup itself fails, without throwing', async () => {
		mockFetch({
			'GET /Contacts?*': () => ({ status: 500, json: { IsSuccess: false, Message: 'boom' } }),
			'GET /Contacts/Default': () => ({ json: { IsSuccess: true, Data: {} } }),
			'POST /Contacts': () => ({ json: { IsSuccess: true, Data: { Id: 7 } } }),
		});

		const contact = await findOrCreateContact(CFG, acme);

		assert.deepEqual(contact, { id: 7, reused: false, differing: [] });
	});

	it('creates a contact without looking up when there is no IČO', async () => {
		mockFetch({
			'GET /Contacts/Default': () => ({ json: { IsSuccess: true, Data: {} } }),
			'POST /Contacts': () => ({ json: { IsSuccess: true, Data: { Id: 5 } } }),
		});

		const contact = await findOrCreateContact(CFG, { companyName: 'Acme', email: null });

		assert.deepEqual(contact, { id: 5, reused: false, differing: [] });
		assert.equal(calls.some((c) => c.path.startsWith('/Contacts?')), false, 'no lookup');
	});
});

describe('sendInvoiceByEmail', () => {
	const sendRoute = (json: unknown): Record<string, Handler> => ({
		'POST /Mails/IssuedInvoice/Send': () => ({ json }),
	});

	it('mails the named recipient only, never the stored partner address', async () => {
		mockFetch(sendRoute({ IsSuccess: true, Message: null, Data: true }));

		const result = await sendInvoiceByEmail(CFG, 9001, {
			subject: 'Faktura',
			body: 'text',
			recipients: [' billing@example.com '],
		});

		assert.equal(result.confirmed, true);
		assert.deepEqual(result.recipients, ['b*****g@example.com']);
		const send = calls[0];
		assert.equal(send.body.SendToPartner, false);
		assert.deepEqual(send.body.OtherRecipients, ['billing@example.com']);
		assert.equal(send.body.SendAttachment, true);
	});

	it('throws on a 200 that carries IsSuccess: false', async () => {
		mockFetch(sendRoute({ IsSuccess: false, Message: 'Mail server refused' }));

		await assert.rejects(
			() => sendInvoiceByEmail(CFG, 1, { recipients: ['billing@example.com'] }),
			(err: unknown) => {
				assert.ok(err instanceof IdokladApiError);
				assert.match(err.message, /Mail server refused/);
				return true;
			},
		);
	});

	it('reports an envelope with no verdict as unconfirmed', async () => {
		mockFetch(sendRoute({ Data: true }));

		const result = await sendInvoiceByEmail(CFG, 1, { recipients: ['billing@example.com'] });

		assert.equal(result.confirmed, false);
	});

	it('refuses to send with no usable recipient instead of mailing nobody', async () => {
		mockFetch(sendRoute({ IsSuccess: true, Data: true }));

		await assert.rejects(
			() => sendInvoiceByEmail(CFG, 1, { recipients: ['', '  '] }),
			/no recipient/,
		);
		assert.equal(calls.length, 0, 'nothing was sent');
	});
});

describe('unwrap', () => {
	it('fails a read whose envelope says IsSuccess: false', async () => {
		mockFetch({
			'GET /IssuedInvoices/*': () => ({ json: { IsSuccess: false, Message: 'Not found' } }),
		});

		await assert.rejects(() => getInvoicePaymentStatus(CFG, 1), IdokladApiError);
	});

	it('peels Data on a successful envelope', async () => {
		mockFetch({
			'GET /IssuedInvoices/*': () => ({ json: { IsSuccess: true, Data: { PaymentStatus: 1 } } }),
		});

		assert.equal(await getInvoicePaymentStatus(CFG, 1), 1);
	});

	it('joins a Message list into the thrown error', async () => {
		mockFetch({
			'GET /IssuedInvoices/*': () => ({ json: { IsSuccess: false, Message: ['a', 'b'] } }),
		});

		await assert.rejects(() => getInvoicePaymentStatus(CFG, 1), /a; b/);
	});
});

describe('maskEmail', () => {
	it('keeps the domain and the first + last local characters', () => {
		assert.equal(maskEmail('billing@example.com'), 'b*****g@example.com');
		assert.equal(maskEmail('orders@example.com'), 'o****s@example.com');
	});

	it('handles short and malformed addresses', () => {
		assert.equal(maskEmail('a@b.cz'), 'a*@b.cz');
		assert.equal(maskEmail('nonsense'), '***');
	});
});
