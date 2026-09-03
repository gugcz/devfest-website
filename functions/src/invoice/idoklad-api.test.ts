/**
 * `node --test` coverage for the three DEVF-43 fixes in the iDoklad client:
 * a reused contact is updated from the submitted form data, a `Send` names an
 * explicit recipient when it is not, and a 200 with `IsSuccess: false` is a
 * failure rather than a silent success.
 *
 * No network: `globalThis.fetch` is replaced by a table of route handlers, so
 * every assertion is about the request we would have made.
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
 * Install a fetch stub. `routes` is keyed by `"<METHOD> <path-prefix>"`; the
 * OAuth token endpoint is always answered so the client's token cache behaves
 * the same whether or not a given test is the first to run.
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
			const [m, prefix] = k.split(' ');
			return m === method && path.startsWith(prefix);
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

const found = (id: number, ico: string): Handler => () => ({
	json: { IsSuccess: true, Data: { Items: [{ Id: id, IdentificationNumber: ico }] } },
});

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

	it('updates the email + address of a contact matched by IČO', async () => {
		mockFetch({
			'GET /Contacts?': found(4242, '12345678'),
			'PATCH /Contacts/': () => ({ json: { IsSuccess: true, Data: { Id: 4242 } } }),
		});

		const contact = await findOrCreateContact(CFG, acme);

		assert.deepEqual(contact, { id: 4242, emailSynced: true });
		const patch = calls.find((c) => c.method === 'PATCH');
		assert.ok(patch, 'expected a PATCH /Contacts/{id}');
		assert.equal(patch.path, '/Contacts/4242');
		assert.equal(patch.body.Email, 'billing@example.com');
		assert.equal(patch.body.Street, 'Example 1');
		assert.equal(patch.body.City, 'Praha');
		assert.equal(patch.body.PostalCode, '11000');
	});

	it('does not wipe fields the form left blank', async () => {
		mockFetch({
			'GET /Contacts?': found(1, '12345678'),
			'PATCH /Contacts/': () => ({ json: { IsSuccess: true, Data: { Id: 1 } } }),
		});

		await findOrCreateContact(CFG, {
			companyName: 'Acme',
			identificationNumber: '12345678',
			street: '   ',
			city: null,
			email: 'ops@acme.cz',
		});

		const patch = calls.find((c) => c.method === 'PATCH')!;
		assert.equal('Street' in patch.body, false);
		assert.equal('City' in patch.body, false);
		assert.equal(patch.body.Email, 'ops@acme.cz');
	});

	it('reports the contact as unsynced when the update fails, without throwing', async () => {
		mockFetch({
			'GET /Contacts?': found(7, '12345678'),
			'PATCH /Contacts/': () => ({ status: 500, json: { IsSuccess: false, Message: 'boom' } }),
		});

		const contact = await findOrCreateContact(CFG, {
			companyName: 'Acme',
			identificationNumber: '12345678',
			email: 'ops@acme.cz',
		});

		assert.deepEqual(contact, { id: 7, emailSynced: false });
	});

	it('creates a contact when no IČO matches', async () => {
		mockFetch({
			'GET /Contacts?': () => ({ json: { IsSuccess: true, Data: { Items: [] } } }),
			'GET /Contacts/Default': () => ({ json: { IsSuccess: true, Data: { CountryId: 2 } } }),
			'POST /Contacts': () => ({ json: { IsSuccess: true, Data: { Id: 99 } } }),
		});

		const contact = await findOrCreateContact(CFG, {
			companyName: 'Acme',
			identificationNumber: '12345678',
			email: 'ops@acme.cz',
		});

		assert.deepEqual(contact, { id: 99, emailSynced: true });
		assert.equal(
			calls.some((c) => c.method === 'PATCH'),
			false,
			'a freshly created contact needs no update',
		);
	});

	it('creates a contact without looking up when there is no IČO', async () => {
		mockFetch({
			'GET /Contacts/Default': () => ({ json: { IsSuccess: true, Data: {} } }),
			'POST /Contacts': () => ({ json: { IsSuccess: true, Data: { Id: 5 } } }),
		});

		const contact = await findOrCreateContact(CFG, { companyName: 'Acme', email: null });

		assert.deepEqual(contact, { id: 5, emailSynced: false });
	});
});

describe('sendInvoiceByEmail', () => {
	const sendRoute = (json: unknown): Record<string, Handler> => ({
		'POST /Mails/IssuedInvoice/Send': () => ({ json }),
	});

	it('confirms only on IsSuccess: true and passes the extra recipient through', async () => {
		mockFetch(sendRoute({ IsSuccess: true, Message: null, Data: true }));

		const result = await sendInvoiceByEmail(CFG, 9001, {
			subject: 'Faktura',
			body: 'text',
			otherRecipients: [' billing@example.com '],
		});

		assert.equal(result.confirmed, true);
		assert.deepEqual(result.recipients, ['b*****g@example.com']);
		const send = calls[0];
		assert.equal(send.body.SendToPartner, true);
		assert.deepEqual(send.body.OtherRecipients, ['billing@example.com']);
	});

	it('throws on a 200 that carries IsSuccess: false', async () => {
		mockFetch(sendRoute({ IsSuccess: false, Message: 'Partner has no e-mail address' }));

		await assert.rejects(
			() => sendInvoiceByEmail(CFG, 1, {}),
			(err: unknown) => {
				assert.ok(err instanceof IdokladApiError);
				assert.match(err.message, /Partner has no e-mail address/);
				return true;
			},
		);
	});

	it('reports an envelope with no verdict as unconfirmed', async () => {
		mockFetch(sendRoute({ Data: true }));

		const result = await sendInvoiceByEmail(CFG, 1, {});

		assert.equal(result.confirmed, false);
	});

	it('drops blank extra recipients rather than sending an empty address', async () => {
		mockFetch(sendRoute({ IsSuccess: true, Data: true }));

		await sendInvoiceByEmail(CFG, 1, { otherRecipients: ['', '  '] });

		assert.deepEqual(calls[0].body.OtherRecipients, []);
	});
});

describe('unwrap', () => {
	it('fails a read whose envelope says IsSuccess: false', async () => {
		mockFetch({
			'GET /IssuedInvoices/': () => ({ json: { IsSuccess: false, Message: 'Not found' } }),
		});

		await assert.rejects(() => getInvoicePaymentStatus(CFG, 1), IdokladApiError);
	});

	it('peels Data on a successful envelope', async () => {
		mockFetch({
			'GET /IssuedInvoices/': () => ({ json: { IsSuccess: true, Data: { PaymentStatus: 1 } } }),
		});

		assert.equal(await getInvoicePaymentStatus(CFG, 1), 1);
	});

	it('joins a Message list into the thrown error', async () => {
		mockFetch({
			'GET /IssuedInvoices/': () => ({ json: { IsSuccess: false, Message: ['a', 'b'] } }),
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
