# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## PR conventions

- **Do not add a `## Test plan` section to PR descriptions.** The maintainer verifies changes manually and the checklist adds noise. Keep PR bodies to Summary / Why / Follow-up only.

## Real customer data never enters this repository

**This repository is public.** Anything committed here is world-readable the
moment it is pushed, and a rewritten branch does not take it back: an orphaned
commit stays reachable by SHA until GitHub garbage-collects it, so the only
reliable control is not writing the data in the first place.

Never put real customer, partner or attendee data anywhere in this repo — that
includes places that are easy to forget because they are not application code:

| surface | rule |
| --- | --- |
| test fixtures and mocks | invented data only, never a payload copied from a real request, log line or support ticket |
| doc comments and examples (`CLAUDE.md`, `README.md`, code comments) | never illustrate a format with a real value — not even a masked or partially redacted one |
| commit messages and branch names | describe the behaviour, never the customer who hit it |
| PR titles and bodies | same — "a company", not the company |
| internal identifiers | issue trackers, ticket ids, invoice numbers, Firestore/RTDB document ids, iDoklad contact ids and external order ids all stay out of the code and its history |

Data covered: company and person names, email addresses, phone numbers, postal
addresses, VAT / IČO / DIČ numbers, invoice and order numbers, discount codes,
and any id that maps back to one of those in a system we or the customer runs.
Masking is not an exemption: a masked address still carries its domain, and a
redacted string sitting next to a bug description still tells a reader which
customer the bug happened to.

Use invented stand-ins instead, and keep them obviously fake so nobody has to
guess later: `Acme Example s.r.o.`, IČO `12345678`, `billing@example.com`,
`ops@example.com`, ids like `4242` / `1001`. Prefer the reserved
`example.com` / `example.org` domains over a real one you made up.

When a real value is genuinely needed to reproduce something, keep it in the
issue tracker or the incident thread — not in the repository — and write the
code and its history so they read correctly without it.

# DevFest Website

Conference landing page for DevFest.cz 2026, built with Astro 7 and deployed to Firebase Hosting.

## Tech Stack

- **Framework:** Astro 7 with React 19 islands (`@astrojs/react` 6)
- **Language:** TypeScript (strict mode)
- **Styling:** SCSS with CSS Modules for React components, global styles in `BaseLayout.astro`
- **Node:** >= 22.12.0

## Commands

| Command           | Action                   |
| ----------------- | ------------------------ |
| `npm run dev`     | Start dev server         |
| `npm run build`   | Build for production     |
| `npm run preview` | Preview production build |
| `npm run a11y`    | Mock-data build + axe accessibility audit (`scripts/a11y.mjs`, `@axe-core/playwright`) |

`npm run dev` serves `/api/lineup` and `/api/tickets` from the audit fixtures, so
the lineup, agenda and ticket waves render locally — see "Browser data access".
`DEVFEST_LIVE_API=1 npm run dev` hits the deployed functions instead.

No lint script is configured — TypeScript strict mode provides type safety. Two automated checks exist: `npm run a11y` (axe against an `A11Y_MOCK=1` build; see "Browser data access") and `npm test` **inside `functions/`** (`node --test` over `src/**/*.test.ts`). The function tests compile through their own `tsconfig.test.json` into `lib-test/`, because the deploy `tsconfig.json` excludes `*.test.ts` — a test file must never ship in a function bundle. They stub `globalThis.fetch`, so they never touch iDoklad/ti.to.

## PR conventions

- **No "Test plan" sections in PR bodies.** This repo has no automated test suite and reviewers verify visually against deploy previews. PR descriptions should cover Summary / Why / Behavior / Files only — skip the test checklist entirely.

## Architecture

### Pages & Routing

Pages under `src/pages/` using Astro file-based routing:
- `/` — Main landing page (hero, countdown timer, newsletter form, footer)
- `/speakers` — Speaker lineup (`Speakers` island reads `/api/lineup`; `SpeakerDetail` is an in-island detail view, not a route)
- `/sessions` — Session schedule (`Sessions` island reads `/api/lineup`; `SessionDetail` is an in-island detail view)
- `/invoice` — Company invoice request (`InvoiceForm` island → `submitInvoiceCallable`)
- `/partners` — Sponsors/partners (`src/lib/partners.ts`)
- `/press` and `/press/downloads` — Press kit (`src/lib/press-kit.ts`)
- `/contact` — Contact page
- `/faq` — Frequently asked questions
- `/team` — Organizing team
- `/privacy-policy` — GDPR privacy policy
- `/newsletter-subscription-thank-you` — Post-signup confirmation
- `/thank-you` — Post-purchase confirmation (configure as ti.to event "thank you URL")
- `/404` — Not-found page

### Component Model

Static Astro components (`.astro`) for layout and non-interactive UI. React components (`.tsx`) with `client:load` for interactive features:
- `Countdown.tsx` — Live countdown to October 30, 2026, 9:00 AM CET; updates every second
- `NewsletterForm.tsx` — SmartEmailing integration for email capture with GDPR consent checkbox
- `Speakers.tsx` / `SpeakersTeaser.tsx` / `Sessions.tsx` — Lineup islands; `fetch('/api/lineup')` (never the Firebase SDK), parse via `src/lib/lineup.ts`. `SpeakerDetail.tsx` / `SessionDetail.tsx` render the in-island detail views.
- `Tickets.tsx` — Ticket roadmap; `fetch('/api/tickets')`, helpers in `src/lib/tito.ts`
- `InvoiceForm.tsx` — `/invoice` form; calls the `submitInvoiceCallable` callable via the Functions SDK (App Check attached)
- `Footer.astro` — Social links (X, Facebook, Bluesky, LinkedIn, YouTube)
- `CookieBanner.astro` — Cookie consent stored in localStorage; also the analytics bootstrap (calls `trackPageView()` on every `astro:page-load`)

### Firebase Integration (`src/lib/firebase.ts`)

Firebase Analytics (GA4) runs in **Google Consent Mode** for every visitor, not just those who accept. `initAnalytics()` pushes a gtag `consent: 'default'` onto the dataLayer *before* `getAnalytics()`. For an undecided visitor everything is denied, so GA4 boots cookieless — no `_ga` / `client_id`, no storage, only aggregated identifier-free pings. That yields basic traffic numbers from visitors who decline or never decide, which is the ePrivacy-exempt part. On accept, `grantAnalyticsConsent()` sends `consent: 'update'` with `analytics_storage: 'granted'` and GA4 switches to full measurement. `ad_*` stay denied permanently — we never collect for advertising.

Gotchas (all verified in-browser; getting the first two wrong silently writes `_ga` with consent denied):
- The `consent: 'default'` command **must** land in the dataLayer ahead of the `config` command. Firebase's own `setConsent()` does **not** guarantee that ordering, which is why `firebase.ts` pushes the default via its own gtag shim instead.
- gtag.js only honours commands pushed as an **`arguments` object** (Google's canonical snippet). A plain array is silently ignored — the consent default gets skipped and cookies are written anyway. The `gtag` shim in `firebase.ts` forwards `arguments` for this reason; don't "clean it up" into a rest array.
- `initAnalytics()` memoises its **in-flight promise**, not just the resolved instance. Callers overlap (the banner boots Analytics while a stored `accepted` grants consent in the same tick), and an `if (analyticsInstance)` guard sits before the first `await`, so both callers would push the consent default twice.
- **The default is seeded from the stored decision** (`readConsent()`, `src/lib/consent.ts`), never hardcoded to denied. gtag drains the dataLayer in order, so a `consent: 'update'` pushed after `config` cannot retroactively attribute the `page_view` `config` already sent: a returning visitor who had accepted was booting denied, and their entry page view went out without a `client_id` — for a single-page visit, no attributed session at all. `CookieBanner.astro` therefore does **not** call `grantAnalyticsConsent()` for a stored `accepted`; the seeded default already covers it.
- **Granting consent re-sends the current page's `page_view`.** The one GA4 sent at `config` time went out cookieless and gtag never re-sends it, so without this an accepting visitor's consent produced nothing unless they navigated again. Guarded by the same `consentGranted` flag, so it fires at most once per visitor and never for the stored-accept path.
- **Measurement is host-gated** (`ANALYTICS_HOSTS`, `PUBLIC_ANALYTICS_ALLOWED_HOSTS` to override). The measurement ID is committed, so `npm run dev` and every `*.web.app` preview channel would otherwise report into the live property. App Check init sits *before* that gate — it's a security mechanism and must run everywhere.

**Page views under `<ClientRouter />`.** GA4's `config` fires exactly one `page_view` — for the document that loaded it. Soft navigations go through `history.pushState`, and GA4 enhanced measurement's "page changes based on browser history events" does **not** pick them up (verified: `history.pushState` stays un-patched; three navigations produced one `/g/collect` hit, pinned to the entry URL). So `firebase.ts` exports `trackPageView()` and `CookieBanner.astro` calls it on every `astro:page-load`; it swallows the first call (the document load `config` already reported) and sends the rest with an explicit `page_location`/`page_title`, plus the previous URL as `page_referrer` (a soft navigation sends no referrer of its own, so GA4 would otherwise read every in-site hop as a direct arrival). Without it every page after the entry page is uncounted.

**Conversion events.** GA4 sees page views and nothing else by itself, and the two things worth measuring here finish somewhere it can't watch: ticket checkout happens on ti.to, and the company path never reaches a checkout at all. So four events are sent explicitly, all through `src/lib/analytics.ts`:

| Event | Where | Notes |
| ----- | ----- | ----- |
| `begin_checkout` | `Tickets.tsx` Buy CTA | GA4 ecommerce shape: `currency` + `value` + `items[]` (buyable variants of the wave, gross unit price from `grossPrice()`). The outbound click is the last thing GA4 can see of a sale. |
| `ticket_purchase_confirmed` | `/thank-you` | ti.to's configured "thank you URL". Deliberately **not** GA4's `purchase`: that event is defined by `transaction_id` + `value` + `items`, and ti.to's redirect carries none of them. |
| `sign_up` (`method: 'newsletter'`) | `/newsletter-subscription-thank-you` | The newsletter form is a native POST to SmartEmailing; this page load *is* the success signal (an event fired in the submit handler races the unload). |
| `generate_lead` | `InvoiceForm.tsx`, on callable success | `value`/`currency` from the ti.to price estimate. The conversion for the company path, which never hits ti.to checkout. |

- `src/lib/analytics.ts` exists so components never statically import `src/lib/firebase.ts` — that would pull the whole Firebase SDK into an island bundle, which is exactly what the `/api/*` refactor removed from the content path. `track()` imports it dynamically and never throws or blocks.
- `trackConversion(pathname, name)` guards **both** the path and repeats: a bundled page script runs once per document, but its `astro:page-load` listener survives every soft navigation away, so an unguarded call re-fires the conversion on every later page.
- The three conversions are custom/recommended events, not key events — mark them as key events in GA4 → Admin → Events (see README "Analytics (GA4)").

Firebase Realtime Database holds the ti.to `/tickets` cache (written hourly by `refreshTicketsScheduled`, served to the browser via `/api/tickets` — see below); Firestore holds `speakers`/`sessions` (Sessionize sync) and `invoices`. Deployment targets the `devfest-public` site in the `devfest-cz-app` project via `firebase.json`.

App Check (reCAPTCHA Enterprise) runs in `getApp()` with a committed key (`APPCHECK_SITE_KEY` in `src/lib/firebase.ts`; `PUBLIC_FIREBASE_APPCHECK_SITE_KEY` overrides it — `src/env.d.ts` types it, `.env.example` documents it). The key is public like the Firebase `apiKey`. It initialises on load (whenever `getApp()` first runs — `initAnalytics()` calls it before both the host gate and the Analytics-support check, so it runs in every environment), **not** gated on cookie consent — App Check is a security mechanism (legitimate interest), not analytics. **No browser content read goes through the Firebase SDK anymore** (speakers/sessions/tickets all fetch the cached `/api/*` endpoints below), so App Check only matters for the App-Check-enforced `submitInvoiceCallable` callable; `ticketsWebhook` (external ti.to caller, HMAC-protected) must stay out. See README "App Check".

### Browser data access (cached `/api/*` functions)

**Every browser read of DB-backed data goes through a cached HTTP Cloud Function, never the Firebase client SDK.** This was a fix for a ~30s mobile load: the old client Firestore/RTDB reads blocked on an App Check (reCAPTCHA) token before the first read. A plain `fetch()` to an `/api/*` endpoint has no such wait, and stays compatible with enforcing App Check on Firestore/RTDB later (the functions read via the Admin SDK, which bypasses App Check + rules).

| Endpoint (Hosting rewrite) | Function | Reads | Browser caller |
| -------------------------- | -------- | ----- | -------------- |
| `/api/lineup` | `lineupApi` (`functions/src/lineup/`) | Firestore `speakers` + `sessions` | `src/lib/lineup.ts` → `Speakers`/`Sessions`/`SpeakersTeaser` |
| `/api/tickets` | `ticketsApi` (`functions/src/tickets/tickets-api.ts`) | RTDB `/tickets` | `src/lib/tito.ts::fetchTickets` → `Tickets`/`InvoiceForm` |

- Both are 2nd-gen `onRequest` (`invoker: 'public'`, region `europe-west1`, in the `website` functions codebase — deployed by `firebase-functions-merge.yml`). Two-layer caching: a `Cache-Control` `s-maxage` so Firebase Hosting's CDN answers most requests from the edge, plus a short in-instance memo so a warm instance coalesces revalidation reads. Lineup TTL is 1h (daily data); tickets 5min (sold-out surfaces faster). A failed read → `no-store` + 503; the browser shows its "unavailable" state.
- **Both scale to zero** (256MiB, 30s, no `minInstances`). They used to run `minInstances: 1` so a CDN revalidation never paid a cold start, but that billed two always-on containers around the clock for a conference site — the edge TTLs already serve almost every visitor, so a cold start only lands on the rare revalidating request. If latency there ever matters again, `ticketsApi` (5min TTL, revalidates far more often) is the one worth keeping warm.
- **Deploy split (no `pinTag`):** the `/api/*` rewrites carry **no** `pinTag`, so hosting deploys (live + PR preview) are pure hosting and never build/deploy the functions — that keeps preview channels from pushing PR function code toward production, and avoids running the functions predeploy `tsc` in the hosting-deploy container (which has no `functions/` devDeps). `lineupApi`/`ticketsApi` deploy **only** via `firebase-functions-merge.yml`; the rewrites route to whatever version is live. A first deploy can briefly 404 `/api/*` until the functions land (graceful — the island shows its unavailable state, a reload recovers), and a PR preview hits the **production** functions (so verify function CHANGES locally, not on the preview).
- The endpoints return raw docs (`{ id, ...fields }` / the RTDB cache verbatim); the browser reuses the existing `speakerFromDoc` / `sessionFromDoc` / `filterDisplayable` parsers so shape logic isn't duplicated in `functions/`.
- **Local + a11y both serve these routes from fixtures.** A dev server has no Hosting rewrite table, so `/api/*` would 404 and every data-backed island would render its "unavailable" state. `scripts/a11y-mocks/api.mjs` holds the payloads (built from `fixtures.mjs`) and is imported by **both** `scripts/a11y.mjs` (the axe sweep) and `astro.config.mjs` (a `apply: 'serve'` Vite plugin that answers `/api/*` on `npm run dev`) — one module, so CI and a laptop can't disagree about what the endpoints return. Set `DEVFEST_LIVE_API=1 npm run dev` to skip the fixtures and hit the deployed functions instead; that is what you want when changing the functions themselves. The only Firebase module still mocked under `A11Y_MOCK` is `firebase/app-check` (App Check inits on load via analytics).

### Backend conventions (`functions/src/lib/`, `functions/src/options.ts`)

Every domain builds on the same shared layer. The rule of thumb behind most of it: **the failure text is a product surface** — it lands in a Slack alert (`🎤 SESSIONIZE`, `🎟️ TICKETS`, `🧾 INVOICES`), in an invoice doc's `errorMessage`, and in Cloud Logging, and it is usually all a responder has.

- **`options.ts`** — `setGlobalOptions` (the `maxInstances` cost ceiling for the shared billing project) plus one option preset per function kind: `SCHEDULED`, `CACHED_ENDPOINT`, `WEBHOOK`, `CALLABLE`, `TRIGGER`. Spread a preset and override only what is genuinely specific (`{ ...SCHEDULED, schedule, secrets }`); never restate `region`/`timeZone`, which were previously copy-pasted into nine files. No preset sets `minInstances` — every function scales to zero so nothing is billed while idle.
- **`lib/run.ts`** — `runBackground({ name, domain, failureNote }, handler)` wraps **every** scheduled job (and any trigger that should alert). It logs start/finish with a duration, logs the failure with the unwrapped cause, alerts Slack, and rethrows so the platform still counts the failure and the scheduler's own `retryCount` retry still happens. `failureNote` states the blast radius ("live speakers/sessions left untouched") — an alert that doesn't say whether anyone must act tonight is half an alert.
  - **Alerts fire on state change, not per failure.** The first failure after a healthy run alerts, further consecutive failures only log, and the run that recovers posts a "recovered" line — so an hours-long upstream outage is two messages, not twenty-four, and a hourly job can't train the channel to ignore it. Streak state lives in RTDB `ops/health/{functionName}` (Admin SDK only; the root deny in `database.rules.json` already covers it). Every health read/write is best-effort and degrades to "assume healthy", which over-alerts rather than going silent.
- **`lib/slack.ts`** — `postToSlack` is the raw webhook call (throws; used where the caller handles delivery itself, e.g. the ti.to purchase webhook and the status reports). `notify(domain, webhookUrl, text)` is the best-effort one everything else uses: it prefixes by domain from the one prefix table, never throws, and logs a failed delivery so a lost alert can't look like a delivered one. A function that alerts must list `SLACK_WEBHOOK_URL` in its `secrets`.
- **`lib/cached-endpoint.ts`** — `cachedJsonEndpoint({ name, cacheControl, memoTtlMs, fallback, load })` is the shared body of the public `/api/*` endpoints: per-instance memo, `Cache-Control` on success, and a `no-store` 503 with an empty payload on a failed read (never cache an error). `lineupApi`/`ticketsApi` differ only in their TTLs and their `load`.

- **`lib/errors.ts`** — `describeError(err)` unwraps the real reason, which is never in `message`: undici reports every network fault as `fetch failed` and hides `ENOTFOUND` / `UND_ERR_CONNECT_TIMEOUT` / `ECONNRESET` in `cause`, and gRPC (Firestore/RTDB) carries its status in `code`. `stageError(stage, err)` labels which step failed, keeping the original as `cause` — without it a Slack line can't distinguish "Sessionize is down" from "our Firestore write was denied". Use it at any boundary a responder would otherwise have to guess at (both the Firestore and RTDB cache writes do). **Use these instead of `err.message` or `err instanceof Error ? … : String(err)` in any log, alert, or persisted error.**
- **`lib/http.ts`** — `fetchWithRetry(url, init, { label, … })` is the only outbound HTTP in `functions/`; a bare `fetch()` in this directory is a bug. It adds a per-attempt timeout (15s default, 30s for iDoklad) — a plain `fetch` has none, so a hung upstream rides the whole function timeout — plus bounded retries (3 attempts, 1s/2s backoff) on network faults and 429/5xx. 4xx never retries: it's deterministic, and `fetchSessionizePayload` depends on seeing the 400 immediately to fall back to the Speakers view. Non-OK responses are returned, not thrown, so status handling stays with the caller.
  - **Retries are off for anything that isn't idempotent, enforced in the helper, not by convention.** A retried `POST /IssuedInvoices` bills a company twice; a retried discount code or Resend send duplicates money/mail. `GET`/`HEAD` retry automatically; a non-GET is pinned to one attempt *even if the caller passes `attempts`*, unless it passes `retryUnsafe`. Only two calls do: the Slack webhook (a duplicate line beats a lost alert) and the iDoklad OAuth token (a second token costs nothing).
  - `errorBody(res)` reads a failed response's body for the message — capped, never throws.

### ti.to Tickets pipeline

Visitor browsers read ticket data from the cached `/api/tickets` endpoint (`ticketsApi`), which serves the RTDB `/tickets` cache — never the Firebase SDK (see "Browser data access"). The static build never calls ti.to. Cloud Functions own all ti.to traffic.

```
functions/src/
├── index.ts                # top barrel — `export * from './<domain>/index.js'`
├── options.ts              # setGlobalOptions + REGION + per-kind option presets
├── lib/                    # shared by every domain — see "Backend conventions"
└── tickets/
    ├── index.ts            # domain barrel
    ├── params.ts           # ti.to secrets + string params (single source of truth)
    ├── tito-api.ts         # ti.to HTTP client + `projectRelease()`
    ├── tito-webhook.ts     # `verifyTitoSignature` + header constants + payload type
    ├── refresh-cache.ts    # `refreshTicketsScheduled`
    ├── notify-purchase.ts  # `ticketsWebhook`
    └── weekly-status.ts    # `weeklyTicketStatusScheduled` + `thursdayTicketStatusScheduled` (shared handler)
```

Functions exposed (region `europe-west1`):

| Name | Trigger | Effect |
| ---- | ------- | ------ |
| `refreshTicketsScheduled` | `onSchedule('every 1 hours')` | Fetch releases → write RTDB `/tickets` |
| `ticketsWebhook` | `onRequest` (`invoker: 'public'`) | Verify `Tito-Signature` HMAC, post `registration.finished` to Slack (other events 200-acked and ignored) |
| `weeklyTicketStatusScheduled` | `onSchedule('every monday 09:00', Europe/Prague)` | Fetch live releases from ti.to and post sales summary to Slack |
| `thursdayTicketStatusScheduled` | `onSchedule('every thursday 18:00', Europe/Prague)` | Same handler as `weeklyTicketStatusScheduled` — second weekly status report |

Browser side: `src/components/Tickets.tsx` (and `InvoiceForm.tsx`'s price estimate) read the roadmap by `fetch()`ing the cached **`/api/tickets`** endpoint (`ticketsApi`), NOT the RTDB SDK — see "Browser data access" above. `src/lib/tito.ts` holds browser-safe helpers (types, `fetchTickets`, `filterDisplayable`, `checkoutUrl`, `formatPrice`). RTDB rules in `database.rules.json` (not wired into `firebase.json` — paste manually in console).

`/tickets` is read only by `ticketsApi` (Admin SDK, bypasses rules), so `tickets.\".read\"` no longer needs to be public for the website — the browser hits `/api/tickets`, not RTDB. Writes remain blocked for everyone; Cloud Functions write via Admin SDK. The root `.read`/`.write` default stays `false`. **Reminder:** `database.rules.json` is not wired into `firebase.json` — paste rule changes into the Firebase console manually.

Conventions / gotchas:
- New function in existing domain: add file → re-export in `tickets/index.ts`. New domain: new folder same shape + `export * from './<domain>/index.js'` in `src/index.ts`.
- `params.ts` is the single source of truth for this domain's secrets/strings. Don't duplicate the table elsewhere. Params more than one domain needs (`SLACK_WEBHOOK_URL`) live in `lib/params.ts` instead — a domain must never import a param from a sibling domain.
- TS imports inside `functions/` use `.js` suffixes (NodeNext module resolution).
- `ticketsWebhook` reads `req.rawBody` (Buffer) for HMAC, not `req.body`.
- ti.to Admin API v3.0 (stable; v3.1 is beta and we don't opt in) returns releases as a flag set (`sold_out`, `off_sale`, `expired`, `upcoming`, `archived`, `locked`, `secret`) plus `state_name`. There is **no** `sale_status` or `accessibility` field on the wire. `functions/src/tickets/tito-api.ts::deriveSaleStatus` synthesises a single `sale_status` string from those flags (`on_sale` / `sold_out` / `paused` / `not_yet_on_sale` / `ended` / `archived`) so the rest of the codebase has one stable thing to switch on. Sale window dates are `start_at` / `end_at` (not `sales_start` / `sales_end`).
- Visibility is enforced **at write time** in `refresh-cache.ts` via `isWebsiteVisible()` (`functions/src/tickets/tito-api.ts`). Only `secret` releases are dropped — every other state (on-sale, sold-out, paused via `off_sale`/`locked`, upcoming, expired, archived) is persisted so the UI can render the full pricing-wave roadmap. `Tickets.tsx` maps each `sale_status` to a badge (On sale / Sold out / Paused / Coming soon / Ended / Unavailable) and disables the Buy CTA when no variant in a group is purchasable. A `paused` release with zero tickets sold renders "Coming soon" instead of "Paused" (`releaseStatus()` in `src/lib/tito.ts`) — future waves are kept `off_sale` in ti.to with no scheduled `start_at`, so they never get the `upcoming` flag; visitors should read them as not-yet-started, not interrupted. The browser's `filterDisplayable` (`src/lib/tito.ts`) mirrors the same `secret`-only drop as defence-in-depth.
- Surviving releases render either an "On sale" badge + Buy CTA (`releaseStatus()` returns `purchasable: true`) or a dimmed "Sold out" badge + disabled CTA. Buy URL pattern: `https://ti.to/<account>/<event>/with/<release-slug>`.
- Default Cloud Functions service account has the IAM to write RTDB; no explicit creds needed at runtime.
- The Firebase project (`devfest-cz-app`) is **shared with the mobile app repo**, which deploys its own functions to the same project. To keep deploys isolated, this repo declares `"codebase": "website"` in `firebase.json`. The app repo must use a **different** codebase name (e.g. `app`) and **different function names**, otherwise deploys overwrite each other. `firebase deploy --only functions` only touches codebases declared in the local `firebase.json`.

Deploy steps, secret setup, and ti.to/Slack wiring live in [README.md](README.md).

### Sessionize → lineup pipeline

Speaker/session data comes from **Sessionize**. Visitor browsers never hit Sessionize: a daily scheduled function mirrors it into public-read **Firestore** (`speakers` + `sessions`), and the browser reads those through the cached `/api/lineup` endpoint (see "Browser data access").

```
functions/src/
├── sessionize/
│   ├── index.ts               # domain barrel
│   ├── params.ts              # SESSIONIZE_ENDPOINT_ID secret (Slack webhook comes from `lib/params.ts`)
│   ├── sessionize-api.ts      # fetch + validate + normalize; buildSessionMap/…; computeDeletePlan (delete-guard)
│   ├── mirror-images.ts       # mirror speaker photos → Firebase Storage `speakers/{id}` (idempotent)
│   └── refresh-sessionize.ts  # `refreshSessionizeScheduled`
└── lineup/
    ├── index.ts               # domain barrel
    └── lineup-api.ts          # `lineupApi`
```

| Name | Trigger | Effect |
| ---- | ------- | ------ |
| `refreshSessionizeScheduled` | `onSchedule('every day 06:00', Europe/Prague)` | Fetch Sessionize "All data" → mirror photos to Storage → write Firestore `speakers` + `sessions` |
| `lineupApi` | `onRequest` (`invoker: 'public'`) | Serve `{ speakers, sessions }` from Firestore behind `/api/lineup` (1h edge TTL) |

Conventions / gotchas:
- **Cross-referenced collections.** `speakers` docs embed their `sessions[]`; `sessions` docs embed their `speakers[]`. Each collection is written as its own atomic `WriteBatch` (upserts + guarded deletes) so a live reader never sees a half-synced state. Batch hard-caps at 500 ops — fine at the expected ~30–80 docs.
- **Delete-guard.** `computeDeletePlan` withholds deletes when a fetch looks truncated/empty so a bad Sessionize response can't wipe the live collections; a withheld run pings Slack (`🎤 SESSIONIZE`). `extractSpeakers` throws on an empty roster, aborting before any write; an empty session set (Speakers-view fallback) is preserved, not wiped.
- **Photos on Firebase, not Sessionize's CDN.** `mirror-images.ts` uploads each `profilePicture` to Storage and writes the Firebase download-token URL onto both collections. Idempotent (re-downloads only when the source URL changed); best-effort (per-speaker failure falls back to the raw Sessionize URL).
- `SESSIONIZE_ENDPOINT_ID` must be a **JSON API** endpoint id (or full URL) exposing the "All data" / "Speakers" view — an embed id returns HTML. `parseEndpointId` accepts either the bare id or a URL.
- Browser side: `src/lib/lineup.ts` `fetch('/api/lineup')` → `Speakers`/`Sessions`/`SpeakersTeaser`. `lineupApi` returns raw docs (`{ id, ...doc }`) so the browser parses them with `speakerFromDoc`/`sessionFromDoc` (`src/lib/speakers.ts`, `src/lib/sessions.ts`) and no parsing is duplicated in `functions/`.

### Invoice (iDoklad) pipeline

Invoice-first B2B flow: a company requests an invoice on `/invoice`, pays it by bank transfer, and gets a 100%-off ti.to code to claim the tickets it already paid for. Reuses the tickets-domain ti.to client + Slack client; stores state in **Firestore** `invoices/{id}` (not RTDB — it holds company PII).

```
functions/src/invoice/
├── index.ts            # domain barrel
├── params.ts           # iDoklad OAuth + invoice business params (ti.to params from `tickets/`, Slack from `lib/`)
├── idoklad-api.ts      # iDoklad v3 client: OAuth token cache, contacts, invoices, mail send, payment status
├── tito-discount.ts    # resolve company-funded releases + create 100%-off discount_code
├── email.ts            # optional Resend HTTP sender + both mails' copy (invoice + discount code)
├── email-template.ts   # branded HTML shell for the discount-code mail (BRAND facts, blocks, escaping)
├── firestore.ts        # invoices collection model + helpers
├── submit.ts           # `submitInvoiceCallable`
├── process.ts          # `processInvoiceTrigger`
└── poll.ts             # `pollPaidInvoicesScheduled`
```

| Name | Trigger | Effect |
| ---- | ------- | ------ |
| `submitInvoiceCallable` | `onCall` (`enforceAppCheck: true`) | Validate form (honeypot), write `invoices/{id}` (status `pending`) |
| `processInvoiceTrigger` | `onDocumentCreated('invoices/{id}')` | Price from ti.to → iDoklad contact + invoice → email it → status `invoiced` |
| `pollPaidInvoicesScheduled` | `onSchedule('every 1 hours', Europe/Prague)` | For each `invoiced` doc, check iDoklad `PaymentStatus`; on paid mint 100%-off ti.to code + deliver → status `completed` |

Browser side: `src/components/InvoiceForm.tsx` (page `src/pages/invoice.astro`) calls the `submitInvoiceCallable` **callable** via the Functions SDK (`getFunctions(getFirebaseApp(), 'europe-west1')` → `httpsCallable`) — it never touches Firestore directly. No endpoint URL config.

Conventions / gotchas:
- **iDoklad has NO webhooks** — every integration polls. So payment is detected by `pollPaidInvoicesScheduled` (hourly), which lists `status == 'invoiced'` docs and GETs each invoice's `PaymentStatus` (enum: Unpaid=0, **Paid=1**, PartialPaid=2, **Overpaid=3**). Completion flips the doc to `completed`, so each paid invoice is processed exactly once. There is no paid-webhook endpoint.
- **iDoklad OAuth2 Client Credentials.** Token at `https://identity.idoklad.cz/server/connect/token` (the API itself is `v3`), `application/x-www-form-urlencoded`, `grant_type=client_credentials`, `scope=idoklad_api`. This v1 endpoint needs only `client_id` + `client_secret` from the account (Nastavení → Aplikace → API) — the `/server/v2/connect/token` variant additionally demands an `application_id` from the iDoklad Developer portal, which we deliberately avoid. ~2h token, **no refresh**; `idoklad-api.ts` caches it. API base `https://api.idoklad.cz/v3`. Every response is wrapped in `{ Data, IsSuccess, Message }`; lists wrap `Data` as `{ Items, TotalItems, TotalPages }` — `unwrap()` peels it.
- **`IsSuccess` is the verdict, not the HTTP status.** iDoklad answers **200** for domain-level refusals (a partner with no email, a payload it won't accept), so `unwrap()` throws `IdokladApiError` with the envelope's `Message` whenever `IsSuccess === false`. Before that it read straight past the flag and a refused call looked identical to a delivered one. Anything reading an iDoklad response must go through `unwrap()`/`apiJson()`; `apiEnvelope()` returns the un-peeled envelope and exists only for the one caller that needs `IsSuccess` itself.
- **Invoice creation = Default→edit→Post.** `GET /IssuedInvoices/Default` returns a fully-defaulted template (CurrencyId, PaymentOptionId, NumericSequenceId, dates); we override `PartnerId` / `Items` / `DateOfMaturity` and POST it back (dropping the readonly `Prices` block). Same pattern for contacts via `GET /Contacts/Default` (inherits the account `CountryId`; the form's free-text country is stored but not mapped).
- **Item pricing:** line `UnitPrice` is **net**, `PriceType=WithoutVat (1)`, `VatRateType=Basic (1)` for 21 % (or `Zero (2)` when `INVOICE_VAT_RATE=0`). `releaseNetUnitPrice` backs net out of the ti.to gross. **No FX** — the 2026 event is CZK, so the 2018 EUR→CZK machinery (and the dead `exchangeratesapi.io`) is gone.
- **A reused contact is updated before the invoice is issued.** `findOrCreateContact` matches on IČO and then PATCHes the submitted email + address onto the match, returning `{ id, emailSynced }`. It used to return the found Id unchanged, which is the failure this guard exists for: when the same company orders twice from two different people, the second request reuses the first's contact and `SendToPartner` mails the invoice to the first person while the pipeline records success. Only non-empty fields are written (a blank optional field must not wipe what iDoklad holds), and a failed PATCH is non-fatal — it reports `emailSynced: false`, which is what the belt below keys on.
- **`OtherRecipients` is a belt, added only when the contact is NOT in sync.** `process.ts` passes `[doc.email]` when `emailSynced` is false, and nothing when it's true — with the contact updated, `SendToPartner` already goes to that address, and naming it twice would mail the customer two copies of the same invoice.
- **`invoiceEmailSent: true` requires iDoklad's own `IsSuccess: true`.** `sendInvoiceByEmail` returns `{ confirmed, message, recipients }`; an envelope with no verdict counts as unconfirmed, so Slack asks for a manual send rather than claiming a delivery nobody can prove. It also logs the verdict on every call (`isSuccess`, `idokladMessage`, masked recipients) — nothing about this call used to be logged, which is why "did the mail go out at all?" was unanswerable from Cloud Logging. Addresses go through `maskEmail` (`billing@example.com` → `b*****g@example.com`): diagnostic, not a plain-text copy of customer contact details. Use `idokladMessage`, not `message` — `message` is the firebase logger's own field and silently overwrites it.
- **Invoice email** via `POST /Mails/IssuedInvoice/Send` (`SendToPartner: true`, `SendAttachment: true`) — PDF attached, company pays by bank transfer using the variable symbol. Failure is tolerated and Slack-relayed. Subject + covering text come from `buildInvoiceEmail` (`email.ts`) and stay **plain text**: iDoklad drops `EmailBody` into its own mail template, so HTML we send isn't guaranteed to survive.
- **ti.to discount code** uses Admin API v3 `POST /discount_codes` with the body wrapped under `discount_code` (`type: 'PercentOffDiscountCode'`, `value: '100.0'`, `release_ids`). Scope = every release whose title contains `INVOICE_RELEASE_MATCH` (default `company funded`).
- **Firestore is server-only.** `firestore.rules` denies all client access; the Admin SDK bypasses it. Like `database.rules.json`, it is **not** wired into `firebase.json` (shared project — auto-deploy would clobber the app's ruleset). `lib/admin.ts` exposes `firestore()` alongside `db()`. The project must have a Firestore database provisioned (it previously used only RTDB).
- **App Check on `submitInvoiceCallable`.** It's a **callable** (`onCall`) with `enforceAppCheck: true` — the client Functions SDK auto-attaches the App Check token (reCAPTCHA Enterprise) and the framework rejects missing/invalid before the handler, blocking bots/curl from minting invoices/emails. The callable protocol handles CORS (no manual headers/preflight). `src/lib/firebase.ts` exposes `getFirebaseApp()` so the form can `getFunctions(app)` on the App-Check-initialised app. Do **not** enforce App Check on `ticketsWebhook` (external HMAC caller) or the schedulers.
- Discount-code email via Resend (`POST https://api.resend.com/emails`, `from` must be a verified-domain sender) is **optional** (`RESEND_API_KEY` is a string param defaulting to empty); when unset the code is still posted to Slack + stored on the doc. `reply_to` is the organisers' address — the `from` is a no-reply sender.
- **Both mails' copy lives in `email.ts`** (`buildInvoiceEmail`, `buildDiscountEmail`) so the two messages a company receives read as one voice; the branded HTML shell is `email-template.ts`. That file is email HTML, not web HTML — nested `<table role="presentation">`, inline styles, hex colours (Outlook drops `rgba()`), pixel widths, a VML `roundrect` behind the CTA, and no webfonts (most clients ignore `@font-face`, and a half-applied brand face is worse than a consistent system stack). Every interpolation goes through `escapeHtml`/`escapeAttr`. The dark palette mirrors `BaseLayout.scss` and declares `color-scheme: dark` so auto-inverting clients leave it alone. The plain-text alternative is a real fallback (same code, link and steps), not a stripped copy — it also helps spam scoring.

### Styling Conventions

Visual system — values, tokens, and binding [MUST]/[CURRENT] rules — is documented
in [DESIGN.md](DESIGN.md); treat it as the source of truth, not this file.
This file holds decisions, product context, and the *why*; `DESIGN.md` holds
the *what* and the *how*. If a rule changes, check both.

`.anchor-target` (`#tickets`, `#newsletter`) cancels a section's own opening air
with a negative `scroll-margin-top` reading `--section-air`, the variable the
section's padding is built from — `scroll-padding-top` can't do it, the air is
inside the target. `--header-h` is the single source for the bar height:
`Menu.scss` and `html { scroll-padding-top }` both read it.
The CSS only decides WHERE a jump lands; `src/lib/anchor.ts` (wired from
`BaseLayout.astro`'s `astro:page-load`) keeps it landed while the islands
resolve and grow the page above the target — without it a deep-linked
`/#newsletter` ended up ~1000px past the heading. Two things there are not
tidy-uppable: the click handler must NOT check `event.defaultPrevented`
(ClientRouter cancels same-page hash links to scroll them itself), and the hold
must be armed BEFORE the landing, because Chromium and WebKit defer the initial
fragment scroll and then animate it through `scroll-behavior: smooth`.
`npm run anchors` measures every landing in Chromium, WebKit and Firefox.

**The ticker is its own pause control (WCAG 2.2.2).** The strip carries
`tabindex="0"` + an `aria-label` naming the topics, and `Ticker.scss` pauses the
animation on `:hover` **and** `:focus-within`. `prefers-reduced-motion` still
stops it, but that is a user-agent setting, not the mechanism the SC asks for.
The focusable child is what makes `:focus-within` possible at all — the topics
are non-interactive text — so the strip is the labelled element and the doubled
topic list inside it is `aria-hidden` (it would otherwise be announced twice).
No visible pause button: this is chrome on all 15 routes.

Behavioral components not yet covered by `DESIGN.md`:

| | |
| --- | --- |
| `NextStep.astro` | one thing to do, in an open field of them — title, note, and its controls on the right axis. `/thank-you`, `/newsletter-subscription-thank-you` and `/404` all end on "what now?" and all three used to answer it with one link home. Takes `.field-row--holds` — a step CONTAINS its controls |
| `.logo-grid` / `.logo-cell` | the partner wall: ONE track size for every partner on the page (`/partners`). See "Partner wall" below |
| `DataState.tsx` | the three non-ready states of a data-backed island — `LoadingState` / `ErrorState` / `EmptyState`. `/speakers`, `/sessions`, `/agenda` and the ticket waves each kept a private copy and they had drifted: two centred and two left-set, two with animated trailing dots, one opening on a hairline, and only `/agenda` offering a next action. Left-set (matching `.fallback-note`), `role="status"` on loading and `role="alert"` on failure, and an **empty state always offers somewhere to go** |
| `SpeakerPhoto.tsx` | a speaker's photograph, or their initials. Owns ONE decision — no URL, or a URL that fails to load, both land on the monogram — while the caller passes its own classes for the shape. `/sessions` and `/agenda` used to `visibility: hidden` the broken `<img>`, so the same speaker with the same dead CDN URL rendered as initials on `/speakers` and as a hole on the other two |

**The partner wall is one grid module.** `/partners` used to size the cell per
tier, and `--tier-col` was a FLOOR rather than a width, so cells grew to close
their row: one page rendered a 611px platinum cell, three full-width diamond
cells, a 520px silver one and 264px media plates — four cell modules on one
wall, and a cell's size said more about how many partners share its tier than
about the tier. `.logo-grid` is `repeat(auto-fill, minmax(min(100%, --cell-min),
1fr))` at one size for every partner; the tier is carried by its heading and by
the order of the sections, which is what a ladder is for. A tier that does not
fill its last row leaves the rest of the row empty — the rules belong to the
CELLS, so nothing hangs a hairline over dead space.

Equal cells do not make equal-looking logos, so `opticalBox()` in
`partners.astro` gives each mark a box of equal ink **area** shaped to its own
aspect ratio (a 5:1 wordmark ≈190×38, a square glyph ≈76×76) and passes it as
`--logo-w` / `--logo-h`; the raster `sizes` follows that box. Capping width
renders a glyph as a block beside a wordmark; capping height renders the
wordmark as a hairline of type. `plated` stays a per-partner flag (the file
ships with its own background baked in) and gets a larger box — it is **not** a
tier-level inversion, which would move the legibility risk onto the tier that
pays. The media/community rows keep the cream ground: those marks ship dark.

**Forms say which field is wrong, in the field.** `InvoiceForm.tsx` is the
pattern: one `validate()` holding every rule, errors shown on blur or on the
first submit attempt and cleared as they are fixed, `aria-invalid` on the
control, `aria-describedby` pointing at a mono `--color-accent-hot` message
under it (colour is never the only channel), and a failed submit focusing the
first field that needs fixing. **A submit button is never `disabled` for a
missing input** — that takes it out of the tab order and explains nothing;
it stays reachable and answers on activation. `aria-disabled` covers only the
in-flight state, so the button's states key off `[aria-disabled='true']`, not
`:disabled`.

**A component declared in a render body remounts its subtree every render.**
`TextField` lives at module scope in `InvoiceForm.tsx` for that reason — inside
the component, every keystroke unmounted the input and the caret left the field.

**`/thank-you`, `/newsletter-subscription-thank-you` and `/404` are on the
system.** They were 73 lines of one centred template with the words swapped,
and one of them is where someone lands after paying. All three run
`SubpageHero photo={false}` → `Ticker` → a `.band--lit` field of `NextStep`
rows → `Closer`, and their titles take the site's em-dash separator like every
other page. `/thank-you` carries the four things that belong on it and nowhere
else (calendar, venue, what happens next, share) and ships an `@media print`
block: it is the page someone prints as proof of purchase, and the site's cream
ink on `#050505` prints as invisible text. Event facts for the calendar links
live in `src/lib/event.ts`, alongside the `.ics` in `public/` — keep them in
step with the Event JSON-LD in `BaseLayout.astro`.

**A `<details>` list opens with its first item open.** `/faq` had every question
collapsed on arrival, so the page a speaker and a journalist both land on showed
no answer at all. One open item, not more — four open answers is the page's
whole content unfolded. A section must also not reuse the hero's
`aria-labelledby`: two regions with one accessible name is `landmark-unique`,
which was the site's only axe violation.

**The skip link's target carries `tabindex="-1"`.** `#main-content` is a `div`,
and without it `Enter` on the skip link moves the document fragment but leaves
focus in the header — the next `Tab` lands back in the nav and the only
keyboard-only affordance on the site does nothing. The ring is suppressed on
that element alone (a 100vw outline reads as a rendering fault, and it is a page
region, not a control); every control inside keeps its own.

**The cookie banner is second in the DOM, right after the skip link,** and its
`Escape` handler is on `document`. Both are the same defect: the banner used to
sit after the footer with a handler bound to itself, so the key only worked once
focus was already inside it — about 40 tab stops away. Its two choices are
peer-weighted: `Accept` keeps the accent fill (it is how the bar is findable),
every other dimension — type, tracking, padding, height, minimum footprint — is
shared, so the shorter word is not the smaller target.

### SEO & Metadata

`BaseLayout.astro` handles all meta tags, Open Graph/Twitter Card, and JSON-LD structured data (Event + WebSite schemas). Sitemap auto-generated via `@astrojs/sitemap`.
