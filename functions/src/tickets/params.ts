/**
 * Configuration parameters for the tickets domain.
 *
 * Secrets are stored in Secret Manager and configured with
 *   firebase functions:secrets:set <NAME>
 *
 * Non-secret strings can be set per-environment via
 *   functions/.env
 * or with `--set-env-vars` on `firebase deploy`.
 */

import { defineSecret, defineString } from 'firebase-functions/params';

import type { TitoCredentials } from './tito-api.js';

// ti.to Admin API token — used by `refreshTicketsScheduled` to read releases.
export const TITO_API_TOKEN = defineSecret('TITO_API_TOKEN');

// ti.to event slugs — non-sensitive.
export const TITO_ACCOUNT_SLUG = defineString('TITO_ACCOUNT_SLUG', { default: '' });
export const TITO_EVENT_SLUG = defineString('TITO_EVENT_SLUG', { default: '' });

/**
 * Resolve + validate the three ti.to params every caller needs. Both the
 * tickets domain (refresh-cache, weekly-status) and the invoice domain
 * (process, poll) read the same trio and used to each hand-roll the same
 * "Missing config" guard — the invoice domain's copies had no guard at all,
 * so an unset param there silently produced empty-string credentials instead
 * of failing loudly.
 */
export function requireTitoConfig(): TitoCredentials {
	const token = TITO_API_TOKEN.value();
	const accountSlug = TITO_ACCOUNT_SLUG.value();
	const eventSlug = TITO_EVENT_SLUG.value();
	if (!token || !accountSlug || !eventSlug) {
		throw new Error(
			'Missing config: ensure TITO_API_TOKEN secret and TITO_ACCOUNT_SLUG / TITO_EVENT_SLUG params are set.',
		);
	}
	return { token, accountSlug, eventSlug };
}

// ti.to webhook security token — used by `ticketsWebhook` to verify the
// `Tito-Signature` header. Found in the ti.to admin under
// Customize → Webhook Endpoints.
export const TITO_WEBHOOK_SECRET = defineSecret('TITO_WEBHOOK_SECRET');

// The Slack webhook every domain posts to lives in `lib/params.ts` — it is not
// a tickets-domain secret, and importing it from here made sessionize/invoice
// depend on this module.
