# 0003. Company tickets go invoice first through iDoklad

- Status: accepted
- Date: 2026-06-18
- PR: [#201](https://github.com/gugcz/devfest-website/pull/201)

## Context

ti.to takes card payments only. Some companies can pay only by bank transfer
against a tax invoice, before they receive anything.

## Decision

- `/invoice` collects the company's details and calls
  `submitInvoiceCallable`, which validates them and writes Firestore
  `invoices/{id}` (clients are denied the collection).
- `processInvoiceTrigger` prices the request from the active ti.to release
  whose title matches `INVOICE_RELEASE_MATCH` (no manual price anywhere),
  creates or reuses the iDoklad contact, issues the invoice and has iDoklad
  email it.
- iDoklad has no webhooks, so `pollPaidInvoicesScheduled` checks each open
  invoice's payment status every hour. On payment it mints a 100%-off ti.to
  discount code scoped to the release the invoice was priced from, and
  delivers it by email (Resend) and Slack.
- Each stage claims the document in a transaction first, so a redelivered
  trigger never issues a second invoice or code.
- An existing iDoklad contact is read, never written: an IČO is public, so the
  form must not be able to change a stored customer's details.
- Credentials are Secret Manager secrets; stable settings are code constants
  in `functions/src/invoice/params.ts`.

## Consequences

- A paid invoice turns into a code up to about an hour later.
- When a ticket wave closes, its company-funded release stays on sale but
  secret in ti.to until its unpaid invoices are redeemed.
- The flow touches three outside services; failures land in Slack with the
  failing stage named (`.claude/rules/backend.md`).
