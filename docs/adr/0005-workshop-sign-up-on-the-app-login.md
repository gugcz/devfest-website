# 0005. Workshop sign-up reuses the mobile app's ticket login

- Status: accepted
- Date: 2026-10-12
- PR: [#455](https://github.com/gugcz/devfest-website/pull/455)

## Context

Workshops have limited seats and are for ticket holders only. The site had no
accounts. The mobile app already proves a person holds a ticket: they enter
the ti.to code from their ticket, receive a six-digit code at the ticket's
email address, and get a Firebase account with the verified ticket on
Firestore `users/{uid}`.

## Decision

- The website calls the app's `verifyRegistrationCodeCallable` and
  `completeEmailVerificationCallable` as they are, so a web sign-in is the
  same Firebase account as the app. Auth and Functions load lazily on
  `/workshops` only.
- Seats live in RTDB `/workshops/{sessionId}`, keyed by the Sessionize
  session id. Writing `limit` in the console opens a workshop.
- There is no waitlist structure: registrations are ordered by sign-up time,
  and the first `limit` hold a seat. A cancellation or a higher limit moves
  people up without a write.
- `workshopRegistrationCallable` trusts only `users/{uid}` with a verified
  ticket, enforces App Check, and returns the caller's own standing.
  `/api/workshops` publishes counts only, never names.

## Consequences

- The website depends on two callables and one collection owned by the app
  repo ([0002](0002-shared-firebase-project.md)).
- Organisers open and resize workshops in the console; no admin UI.
- Registrations hold names and emails in RTDB, readable only by the Admin
  SDK.
