# 0004. Callables enforce App Check with plain tokens, plus throttles

- Status: accepted
- Date: 2026-09-24
- PR: [#393](https://github.com/gugcz/devfest-website/pull/393)

## Context

`submitInvoiceCallable` creates a real invoice and sends an email per call,
so it needs abuse protection. A security pass added single-use App Check
tokens (`consumeAppCheckToken`). Consuming a token needs the Firebase App
Check Token Verifier IAM role on the functions' runtime service account,
which is project configuration outside this repo; without it every submit was
answered with 401 in production.

## Decision

- Callables enforce App Check (`enforceAppCheck: true`) with ordinary,
  reusable tokens. No `consumeAppCheckToken`.
- `cors` lists devfest.cz and the PR preview origins only.
- The invoice callable adds its own limits: a global ceiling per hour across
  everyone (`GLOBAL_LIMIT_MAX`) and 3 per hour per IČO, plus a
  honeypot field and strict validation.
- Hardening that depends on IAM roles or console settings outside the repo is
  proposed with that setup named, not shipped silently.

## Consequences

- A captured token can be replayed within its lifetime; the throttles bound
  what a replay can do.
- `workshopRegistrationCallable` follows the same pattern
  ([0005](0005-workshop-sign-up-on-the-app-login.md)).
