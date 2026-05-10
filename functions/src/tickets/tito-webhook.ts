/**
 * ti.to webhook contract.
 *
 *   POST  https://<your-function-url>
 *   Headers:
 *     Tito-Signature   Base64(HMAC-SHA256(rawBody, eventSecurityToken))
 *     X-Webhook-Name   ticket.completed | registration.finished | ...
 *   Body: raw JSON of the resource (ticket / registration)
 *
 * Docs: https://help.tito.io/en/articles/2011381-webhooks
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

export const TITO_SIGNATURE_HEADER = 'tito-signature';
export const TITO_EVENT_HEADER = 'x-webhook-name';

/**
 * Webhook event names ti.to emits. Listed for documentation; we cast
 * arbitrary strings to this union with a runtime check.
 */
export type TitoWebhookEvent =
	| 'ticket.created'
	| 'ticket.completed'
	| 'ticket.reassigned'
	| 'registration.finished'
	| 'registration.completed'
	| 'registration.cancelled'
	| (string & {});

/**
 * Subset of fields we read off the webhook body. ti.to sends many more —
 * the rest are ignored. Both ticket events and registration events flow
 * through here, so most fields are optional.
 */
export interface TitoWebhookPayload {
	// Ticket events
	reference?: string;
	first_name?: string | null;
	last_name?: string | null;
	name?: string | null;
	email?: string | null;
	release_title?: string | null;
	release_slug?: string | null;
	price?: string | null;
	currency?: string | null;
	state?: string | null;
	registration_reference?: string | null;
	url?: string | null;

	// Registration events
	total?: string | null;
	tickets_count?: number | null;
	tickets?: TitoWebhookPayload[];
	[key: string]: unknown;
}

/**
 * Constant-time comparison of the `Tito-Signature` header against an
 * HMAC-SHA256 of the raw request body. Returns false on any malformed
 * input rather than throwing so callers can return 401 cleanly.
 */
export function verifyTitoSignature(
	secret: string,
	rawBody: Buffer | string,
	signatureHeader: string | undefined,
): boolean {
	if (!secret || !signatureHeader) return false;

	const body = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody, 'utf8');
	const expected = createHmac('sha256', secret).update(body).digest('base64');

	const expectedBuf = Buffer.from(expected, 'utf8');
	const receivedBuf = Buffer.from(signatureHeader, 'utf8');
	if (expectedBuf.length !== receivedBuf.length) return false;

	try {
		return timingSafeEqual(expectedBuf, receivedBuf);
	} catch {
		return false;
	}
}

/**
 * Best-effort full name from a ti.to ticket payload.
 */
export function fullName(payload: TitoWebhookPayload): string {
	if (payload.name && payload.name.trim()) return payload.name.trim();
	const first = payload.first_name?.trim() ?? '';
	const last = payload.last_name?.trim() ?? '';
	const combined = `${first} ${last}`.trim();
	return combined || 'Anonymous attendee';
}
