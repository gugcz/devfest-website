# 0001. The browser reads data through cached `/api/*` functions

- Status: accepted
- Date: 2026-07-25
- PR: [#260](https://github.com/gugcz/devfest-website/pull/260)

## Context

Speakers, sessions and tickets were read in the browser with the Firebase
client SDK (Firestore and RTDB). Those reads waited for an App Check token from
reCAPTCHA Enterprise, which took around 30 seconds on a phone, so the lineup
and the ticket section sat empty on first load.

## Decision

- Every browser read of database data goes through a public HTTP Cloud
  Function behind a Hosting rewrite: `/api/lineup` (`lineupApi`),
  `/api/tickets` (`ticketsApi`), later `/api/speaker-photo` and
  `/api/workshops`. Each reads with the Admin SDK and is shared through
  `lib/cached-endpoint.ts`: a CDN `s-maxage` plus a short in-instance memo.
- Endpoints return raw documents; the browser parses them
  (`speakerFromDoc`, `sessionFromDoc`, `filterDisplayable`).
- A failed read answers `503` with `no-store`, so the CDN never caches a
  failure.
- Rewrites carry no `pinTag`: a Hosting deploy (live or PR preview) never
  builds or deploys functions. Functions deploy only from
  `firebase-functions-merge.yml`.
- Writes stay callables with App Check (`submitInvoiceCallable`, later
  `workshopRegistrationCallable`).

## Consequences

- Firestore and RTDB left the client bundle; the content shows as soon as the
  cached response arrives.
- Data is as fresh as the edge TTL (lineup 15 minutes, tickets 5 minutes,
  workshops 30 seconds), on top of the sync schedule.
- Database rules can deny every client; App Check could be enforced on the
  databases without breaking the site.
- A PR preview calls the production functions, so a function change is
  verified locally, not on the preview.
- `npm run dev` has no rewrite table and serves `/api/*` from fixtures
  (`scripts/a11y-mocks/api.mjs`).
