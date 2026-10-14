---
paths:
  - "functions/src/workshops/**"
  - "src/lib/workshops.ts"
  - "src/components/Workshops.tsx"
  - "src/pages/workshops.astro"
---

# Workshops (`/workshops`)

Ticket holders save a seat; a full workshop takes a waitlist.
[ADR 0005](../../docs/adr/0005-workshop-sign-up-on-the-app-login.md) has the why.

- RTDB `/workshops/{sessionId}/limit` (set by hand in the console) opens a
  workshop; the key is the Sessionize session id, so it lines up with
  `/api/lineup`. No limit (or anything but a positive integer) = not open, and
  the page does not list it. `parseLimit` accepts a numeric string because the
  console types one.
- `/workshops/{sessionId}/registrations/{uid}` = `{ at, name, email,
  reference }`. **There is no waitlist field**: registrations sorted by `at`
  (uid breaks a tie), the first `limit` hold a seat. Leaving or raising the
  limit moves people up with no write. `join` is a transaction that keeps the
  first `at`, so joining twice never loses a place.
- `roster.ts` is pure (no Admin SDK) and tested; keep queue logic there.
- `/api/workshops` (`workshopsApi`, 30s edge TTL) returns seats only
  (`limit`, `taken`, `waiting`), never who. Names and emails leave only through
  `workshopRegistrationCallable`, and only the caller's own standing.
- Sign-in is the **mobile app's** ticket login, called as is: anonymous auth →
  `verifyRegistrationCodeCallable` (ti.to code → six-digit code by email) →
  `completeEmailVerificationCallable` → custom token. The web session is the
  same Firebase account as the app. Those callables live in the app repo.
- `workshopRegistrationCallable` (`status` / `join` / `leave`, each answers
  with the full status) trusts only Firestore `users/{uid}` with
  `emailVerified: true` and a `registrationReference`, written by the app.
  `enforceAppCheck: true`, `cors` = devfest.cz, PR previews, localhost.
- Firebase Auth and Functions load lazily, on `/workshops` only. The agenda
  does not link to registration.
- `database.rules.json` has no `workshops` entry on purpose: the root deny
  covers it and only the Admin SDK reads it.
