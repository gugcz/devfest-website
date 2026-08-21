# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## PR conventions

- **Do not add a `## Test plan` section to PR descriptions.** The maintainer verifies changes manually and the checklist adds noise. Keep PR bodies to Summary / Why / Follow-up only.

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

No lint script is configured — TypeScript strict mode provides type safety. The only automated check is `npm run a11y` (axe against an `A11Y_MOCK=1` build; see "Browser data access").

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
- **Both run `minInstances: 1`** (256MiB, 30s) so a CDN revalidation never pays a cold start on the critical path — traffic is bursty and sparse, which without a warm instance means cold-starting most misses, and the warm instance also keeps the in-instance memo alive between bursts. This costs idle-instance billing for two always-on containers; if that ever needs trimming, `ticketsApi` (5min TTL, revalidates far more often) is the one worth keeping warm.
- **Deploy split (no `pinTag`):** the `/api/*` rewrites carry **no** `pinTag`, so hosting deploys (live + PR preview) are pure hosting and never build/deploy the functions — that keeps preview channels from pushing PR function code toward production, and avoids running the functions predeploy `tsc` in the hosting-deploy container (which has no `functions/` devDeps). `lineupApi`/`ticketsApi` deploy **only** via `firebase-functions-merge.yml`; the rewrites route to whatever version is live. A first deploy can briefly 404 `/api/*` until the functions land (graceful — the island shows its unavailable state, a reload recovers), and a PR preview hits the **production** functions (so verify function CHANGES locally, not on the preview).
- The endpoints return raw docs (`{ id, ...fields }` / the RTDB cache verbatim); the browser reuses the existing `speakerFromDoc` / `sessionFromDoc` / `filterDisplayable` parsers so shape logic isn't duplicated in `functions/`.
- **Local + a11y both serve these routes from fixtures.** A dev server has no Hosting rewrite table, so `/api/*` would 404 and every data-backed island would render its "unavailable" state. `scripts/a11y-mocks/api.mjs` holds the payloads (built from `fixtures.mjs`) and is imported by **both** `scripts/a11y.mjs` (the axe sweep) and `astro.config.mjs` (a `apply: 'serve'` Vite plugin that answers `/api/*` on `npm run dev`) — one module, so CI and a laptop can't disagree about what the endpoints return. Set `DEVFEST_LIVE_API=1 npm run dev` to skip the fixtures and hit the deployed functions instead; that is what you want when changing the functions themselves. The only Firebase module still mocked under `A11Y_MOCK` is `firebase/app-check` (App Check inits on load via analytics).

### Backend conventions (`functions/src/lib/`, `functions/src/options.ts`)

Every domain builds on the same shared layer. The rule of thumb behind most of it: **the failure text is a product surface** — it lands in a Slack alert (`🎤 SESSIONIZE`, `🎟️ TICKETS`, `🧾 INVOICES`), in an invoice doc's `errorMessage`, and in Cloud Logging, and it is usually all a responder has.

- **`options.ts`** — `setGlobalOptions` (the `maxInstances` cost ceiling for the shared billing project) plus one option preset per function kind: `SCHEDULED`, `CACHED_ENDPOINT`, `WEBHOOK`, `CALLABLE`, `TRIGGER`. Spread a preset and override only what is genuinely specific (`{ ...SCHEDULED, schedule, secrets }`); never restate `region`/`timeZone`, which were previously copy-pasted into nine files. `CACHED_ENDPOINT` carries `minInstances: 1` and `WEBHOOK` deliberately does not — rare deliveries don't justify an always-warm instance.
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
- **Invoice creation = Default→edit→Post.** `GET /IssuedInvoices/Default` returns a fully-defaulted template (CurrencyId, PaymentOptionId, NumericSequenceId, dates); we override `PartnerId` / `Items` / `DateOfMaturity` and POST it back (dropping the readonly `Prices` block). Same pattern for contacts via `GET /Contacts/Default` (inherits the account `CountryId`; the form's free-text country is stored but not mapped).
- **Item pricing:** line `UnitPrice` is **net**, `PriceType=WithoutVat (1)`, `VatRateType=Basic (1)` for 21 % (or `Zero (2)` when `INVOICE_VAT_RATE=0`). `releaseNetUnitPrice` backs net out of the ti.to gross. **No FX** — the 2026 event is CZK, so the 2018 EUR→CZK machinery (and the dead `exchangeratesapi.io`) is gone.
- **Invoice email** via `POST /Mails/IssuedInvoice/Send` (`SendToPartner: true`, `SendAttachment: true`) — PDF attached, company pays by bank transfer using the variable symbol. Failure is tolerated and Slack-relayed. Subject + covering text come from `buildInvoiceEmail` (`email.ts`) and stay **plain text**: iDoklad drops `EmailBody` into its own mail template, so HTML we send isn't guaranteed to survive.
- **ti.to discount code** uses Admin API v3 `POST /discount_codes` with the body wrapped under `discount_code` (`type: 'PercentOffDiscountCode'`, `value: '100.0'`, `release_ids`). Scope = every release whose title contains `INVOICE_RELEASE_MATCH` (default `company funded`).
- **Firestore is server-only.** `firestore.rules` denies all client access; the Admin SDK bypasses it. Like `database.rules.json`, it is **not** wired into `firebase.json` (shared project — auto-deploy would clobber the app's ruleset). `lib/admin.ts` exposes `firestore()` alongside `db()`. The project must have a Firestore database provisioned (it previously used only RTDB).
- **App Check on `submitInvoiceCallable`.** It's a **callable** (`onCall`) with `enforceAppCheck: true` — the client Functions SDK auto-attaches the App Check token (reCAPTCHA Enterprise) and the framework rejects missing/invalid before the handler, blocking bots/curl from minting invoices/emails. The callable protocol handles CORS (no manual headers/preflight). `src/lib/firebase.ts` exposes `getFirebaseApp()` so the form can `getFunctions(app)` on the App-Check-initialised app. Do **not** enforce App Check on `ticketsWebhook` (external HMAC caller) or the schedulers.
- Discount-code email via Resend (`POST https://api.resend.com/emails`, `from` must be a verified-domain sender) is **optional** (`RESEND_API_KEY` is a string param defaulting to empty); when unset the code is still posted to Slack + stored on the doc. `reply_to` is the organisers' address — the `from` is a no-reply sender.
- **Both mails' copy lives in `email.ts`** (`buildInvoiceEmail`, `buildDiscountEmail`) so the two messages a company receives read as one voice; the branded HTML shell is `email-template.ts`. That file is email HTML, not web HTML — nested `<table role="presentation">`, inline styles, hex colours (Outlook drops `rgba()`), pixel widths, a VML `roundrect` behind the CTA, and no webfonts (most clients ignore `@font-face`, and a half-applied brand face is worse than a consistent system stack). Every interpolation goes through `escapeHtml`/`escapeAttr`. The dark palette mirrors `BaseLayout.scss` and declares `color-scheme: dark` so auto-inverting clients leave it alone. The plain-text alternative is a real fallback (same code, link and steps), not a stripped copy — it also helps spam scoring.

### Styling Conventions

- Global CSS variables (colors, type ramp, rhythm) live in `BaseLayout.scss`; React components use co-located `.module.scss` files.
- Dark noir palette: `#050505` ground, `#F2EFE9` ink, `#CC0000` / `#FF1111` accent, film-grain + vignette overlays on `body`.

**Type roles — do not mix them up.** Four faces, each with one job:

| Face | Role |
| ---- | ---- |
| **Bebas Neue** | Every headline at `--fs-h3` and above: hero statement, section titles, nav destinations, figures, prices, the footer wordmark. It is condensed, which is why the poster scale works — a three-word statement fits the column at 8rem. |
| **Special Elite** | Body and lede copy. The brand's typewriter voice, kept as texture in the prose, never as a headline (it is wide; it wrapped a three-word title over three lines at `--fs-h2`). |
| **JetBrains Mono** | Labels, eyebrows, meta, counts, buttons, status words. |
| **IM Fell English** | Long-form reading copy only (session abstracts, coverage summaries, legal prose), set **roman**. |

**Rules the redesign exists to keep.** These are the patterns that made the
site read as generated; re-introducing any of them undoes the pass:

- **No decorated eyebrow.** `.eyebrow` is a plain mono label. It used to carry a trailing red gradient hairline, and it appeared on every section of every page — a decoration repeated without variation is the loudest "template" signal there is. Same for the flanking-rule pairs that used to sit on the footer column heads and the partner tier captions.
- **Red text is flat.** `--glow-red` is for things that respond to a pointer (`.btn-primary:hover`) and for live status. It is not a text-shadow on every accent word. `.neon` no longer glows.
- **One lede shape, and it is not the old one.** Ledes are Special Elite, short, no italic, no red left border. The italic-serif-with-an-accent-bar lede was the third element of the repeated lockup.
- **One display element per page** at `--fs-display` (the subpage `<h1>`). Sections run at `--fs-h2`.
- **Section heads are left-set.** Centred eyebrow-over-title-over-lede stacks are what made six different sections read as the same section.
- **Accent bars down the left edge of a block are banned** — they were on the hero lede, the FAQ answer and every agenda card at once.
- Poster type is set through `--lh-display` / `--track-display`, never with a per-file line-height, and carries no `text-shadow`.

Primitives in `BaseLayout.scss`: `.u-container`, `.u-prose`, `.eyebrow`,
`.display` (+ `.red`, `.hollow`), `.facts` / `.fact-figure` / `.fact-label`,
`.band` (+ `--raised`, `--accent`, `--tight`, `--wide`) with `.band-inner`,
`.closer` / `.closer-title` / `.closer-note` / `.closer-actions`,
`.btn-primary` / `.btn-ghost`, and the `.ledger` / `.record` family.

**Open-field rows — every list on the site is the same open field.** A list of
entries is never a stack of cards, and it is no longer a ruled ledger either:
the thick/thin opening rule plus a hairline under every row is a TABLE, and it
was the one device stamped on six pages, which is what made them read as one
generated component. There are no rules in a list any more. Separation is air
and type scale; the reach state is what marks an entry.

**This is a real primitive now — `.field` / `.field-row` in `BaseLayout.scss`,
used by class name from both `.astro` pages and `.tsx` islands.** It replaced
the dead `.ledger` / `.record` family (only `.record-status` survives). Six
files used to keep their own copy of the rhythm, the reach states, the
`isolation`, the feather mask and the focus ring, and the copies had already
drifted. A caller now owns only its own grid and type:

```
<ul class="field …">                            (the list)
  <li class="field-row field-row--link …">       (the row IS the control)
  <li class="field-row field-row--short field-row--holds …">   (…CONTAINS one)
```

`--field-step` on a row overrides the padding rhythm where a row is title-only
(the agenda's unscheduled list). The spec the primitive implements:

| | value |
| --- | --- |
| opening | **none.** No `border-top`, no `box-shadow` pair. The section head above the list (and its own hairline, if it has one) is the list's top edge |
| row rule | **none.** No `border-bottom`, no `border-top`, on any row |
| lamp | **none — the list carries no light of its own.** `--lamp` on a `::before` inset `-2rem / -gutter` is a full-bleed RECTANGLE inside the section, and the token's warm raking layer lifts `#050505` to about `#0E0C0B` at its top-left, so it drew a hard horizontal step across the whole page 32px above the first rule and another below the last. `--lamp` belongs to the ROOM: the section's `--lit` pool is the light. |
| row padding | fluid, `clamp(…) 0` — no horizontal padding at any breakpoint, including mobile. This is what gives the reach field a band to fill, so it is the rhythm too: `clamp(2.25rem, 3.6vw, 3.25rem)` short list, `clamp(1.9rem, 2.8vw, 2.5rem)` long |
| title | Bebas, uppercase. `--fs-row` (**72px**) for a short list (three ticket waves, three contact desks, two press desks), `--fs-row-sm` (**54px**) for a long one (sessions, FAQ, press clippings, agenda). `--fs-row-figure` for the figure opposite a title |

**The reach state depends on whether the row IS the control.** Two states, and
the difference is not decorative — a red band under something you cannot click
promises a click:

| the row | reach |
| --- | --- |
| **IS** the control — sessions, FAQ questions, press clippings, agenda entries (the whole entry is a `<button>` / `<a>` / `<summary>`) | `::before` inset `0 calc(-1 * var(--gutter))`, `background: var(--color-accent)`, `opacity` 0 → 1 over 0.28s. Every ink in the row goes **full cream `#F7EFE6`**. **No `translateX`** — dragging a band that runs to the viewport edge reads as a rendering fault |
| **CONTAINS** a control — ticket waves (Buy CTA), contact desks and the press desk (addresses) | the warm `104deg` wash at `opacity` 0 → 1, plus `translateX(0.6rem)` |

**Any full-bleed `::before` on a row must be feathered.** With no rules to close
it, an un-masked `inset: 0 calc(-1 * var(--gutter))` box shows its own top and
bottom edges as hard horizontal steps across the page — the same fault the
per-list `--lamp` box had. Warm washes and permanent lit grounds (the on-sale
wave) carry
`mask-image: linear-gradient(180deg, transparent 0%, #000 16%, #000 84%, transparent 100%)`.
The red reach field is the exception: it is meant to read as a band with edges.

**Rows need `isolation: isolate`.** The field/wash sits at `z-index: -1`, which
without a stacking context on the row itself paints behind the *section's*
background and disappears. `.field-row` sets it; a row that adds a SECOND
full-bleed layer of its own (the on-sale ticket wave's lit ground, the open
FAQ item's wash) must use `::after`, or a lower `z-index`, because
`.field-row--link` / `--holds` already own `::before`.

**HOVER paints the field; FOCUS draws a ring instead.** Focus legitimately
persists — closing a session sheet with Esc returns focus to the row that opened
it, which is correct for keyboard and AT users. While focus also painted the
field, that left a full-bleed red band with a cream rectangle round it sitting on
the page after the sheet was gone, indistinguishable from a stuck highlight. The
ring is `outline: 2px solid var(--color-accent-hot)` at offset `2px` (4.96:1 on
`#050505`, clear of the 3:1 in 1.4.11); a row that is both hovered and focused
inverts it to `#F7EFE6`, because red on red is not a ring.

**Detail views are SHEETS, not dialog boxes.** `SessionDetail` and
`SpeakerDetail` were 640px panels with a red keyline and glow, bordered chips for
the tags, hairline dividers between every block and a boxed close button — the
enclosed-card language the redesign removed everywhere else, still running in the
one place a visitor reaches by clicking. They also set their title at `--fs-h3`,
smaller than the 54px row that opened them. A sheet is full-bleed on the section
ground, poster title at `--fs-h2`, no border anywhere, a mono `Close ✕` in a
sticky top bar, and its lists are `.field` rows like everything else.

Both are **portalled to `document.body`** (`createPortal`). They render from
inside an island in `<main>`, and any positioned ancestor with a z-index traps
them in that stacking context — on `/speakers` the fixed site header (z-index
10001) drew straight over the sheet's own 10060 and hid its Close.

**Red is spent once per list, not once per row.** A track kicker on every
session, a `+` marker on every FAQ question and a red outlet label on every
press clipping were each the accent repeated thirty times, which makes it
texture. The resting state of a per-row label is muted mono
(`rgba(240, 237, 230, 0.55)`). Now that reaching a row paints it red, this rule
is stricter, not looser: a resting red label competes with the one state the
colour is for. The single exception is a persistent mark on the ONE row that is
genuinely different — the on-sale ticket wave, which carries a lit ground (not
red text) because it is the only buyable one.

**An OPEN `<details>` does not hold the red field.** FAQ items are independent,
several can be open at once, and four permanent red bands down one page is the
accent as texture again. An open question is marked by the feathered warm wash
and its turned marker; red stays under the pointer.

**Bands — red is a FIELD, not only an accent.** The site used to be one
uninterrupted `#050505` from the top of every page to the bottom, so nothing
marked where a section began and the whole scroll read as one block. A section
that wants its own ground gets `.band` plus a modifier:

| | ground | use |
| --- | --- | --- |
| `.band` | `--color-bg` | the default |
| `.band--raised` | `#0B0A0A` + hairlines | a section lifted one step out of the dark |
| `.band--accent` | `--color-accent` | **at most one per page**, for the page's next step |

**Ink on `#CC0000` is measured, and alpha is not free** — hierarchy on the
accent field comes from SIZE, never from dimming:

| ink | ratio | verdict |
| --- | --- | --- |
| cream `#F7EFE6` | 5.17:1 | anything, including body copy |
| cream at 85% | 3.95:1 | control boundaries only (1.4.11) |
| cream at 80% | 3.58:1 | fails body copy |
| near-black `#1A0000` | 3.42:1 | large text only — the accent word |
| black `#000000` | 3.57:1 | large text only |

So every label, paragraph and link on a red band is **full cream**, the accent
word inside a `.display` is `#1A0000`, and any form control on that ground
inverts (cream fill, dark ink — a red button on red is invisible). Translucent
field fills are banned there too: a contrast checker resolves the placeholder
against the band behind an `rgba()` fill, so `NewsletterForm.module.scss` uses
an opaque `#9A0000`.

**Shared components, not shared class names.** Anything that appears on more
than one page is a component or a global primitive — never a copied block. The
copies always drift: `/contact` and `/press` each kept their own `card-head` /
`card-label` / `card-title` / `card-desc` / `card-emails` / `email-link`, and by
the time they were merged the address was `--fs-ui` on one page and
`--fs-body-lg` on the other, the label was accent-hot on one and muted on the
other, and the two-column split was 0.95/1.05 against 1.15/0.85.

| | |
| --- | --- |
| `Desk.astro` | one inbox: label, name, blurb, addresses on the right axis (or one `action` link). `/contact` runs three, `/press` two. Takes `.field-row--holds` — a desk CONTAINS its controls |
| `.field` / `.field-row` | the open-field list and row, above |
| `.head-split` / `.head-title` / `.head-note` | the two-column section head — statement left, one line right. Used by the ticket section, the speakers teaser, the gallery and the `/contact` desks. `--ruled` closes it with a hairline. Compose the title with `.display` |
| `SubpageHero.astro`, `Ticker.astro`, `Closer.astro` | already components; see below |

**`Closer.astro` — every page ends on a statement.** Eyebrow, one `--fs-h2`
line, a note and one or two actions, on `tone="accent" | "raised" | "plain"`.
The subpages used to stop at their last list row and hand straight to the
footer, which read as unfinished and left the thin pages (contact, downloads)
mostly empty. `/privacy-policy` is the deliberate exception — a legal document
does not get a CTA.

**The masthead is the one print device, and it belongs to the lineup.** The
campaign's speaker announcements on LinkedIn are full newspaper front pages —
masthead, `VOL. #11`, dateline, boxed talk title — and the site had no print
vocabulary anywhere, which was the widest gap between the two. `SpeakersTeaser`
opens on that band: `.masthead` / `.mastheadName` / `.mastheadMeta`, Bebas at
`--fs-h3` left, muted mono dateline right, closed by a hairline top and bottom.

- Those rules are a MASTHEAD, not the ledger opening the redesign took off the
  lists. They are also why the head under it runs `head-split` **without**
  `--ruled` — a masthead band plus a head rule is three hairlines in 200px.
- `--fs-h3` is deliberate: the bottom of Bebas's documented range, and a clear
  step under the `--fs-h2` statement beneath it. A masthead at the headline's
  size is two titles stacked.
- It is called *The DevFest Chronicle*, not the posts' literal
  `PRESS · CHRONICLE` — the site has a `/press` destination and the two would
  read as the same thing.
- **One masthead per page.** It marks the lineup; repeated on every section it
  is the eyebrow-with-a-hairline all over again.

**One photograph, five crops.** `HeroBackground` takes a `focus`
(`background-position`), passed through by `SubpageHero`. Five subpages running
the identical crop of `/hero-detective.webp` is what made them read as one
template with the words swapped; each page now frames a different part of the
plate. `SubpageHero` also takes `photo={false}` — contact, FAQ, invoice and
press/downloads open on type alone, so the scroll has two kinds of opening.

**The running band (`Ticker`) runs under EVERY hero.** One shared line of the
conference's topics (`EVENT_TOPICS`, `src/lib/ticker.ts`) sits between the hero
and the body on the homepage and on all nine subpages; `/partners` is the one
exception and keeps its own partnering-specific list. This reverses an earlier
call that scoped the band to `/` + `/partners` on the grounds that a repeated
strip under five heroes reads as a template — the strip is now what carries the
break between hero and content on every page, which is the job the subpage
bodies' raised ground was briefly doing instead. Consequence to keep in mind:
the subpage silhouettes ARE deliberately alike now, so variation has to come
from the hero crops and the body layouts rather than from the page skeleton.

**Subpage bodies sit on `--color-bg`, the same ground `/partners` uses.** Do not
reintroduce a tonal step between a subpage hero and its body — the running band
marks that boundary.

The header (`Menu.astro`) is a three-slot bar — mark, event stamp, actions —
with all nine destinations behind one toggle at **every** width, opening a
full-screen panel. There is no horizontal nav breakpoint any more.

**The bar is transparent at the top of the page and solid once scrolled.** Two
crossfading pseudo-elements do it: `::before` is the solid `#050505` panel,
`::after` a top-down scrim, swapped on `[data-state='top']`. The event stamp
follows the same state — hidden at the top (the hero already says where and
when), revealed on scroll, via `visibility` so the centre grid slot never
reflows. Scrolled the bar MUST stay opaque: it sits over page content, and a
transparent zone leaks during an iOS Safari URL-bar transition.

**The brand mark follows that state on the home page, at EVERY width.** At the
top of `/` the hero wordmark owns the identity, so the bar's mark is hidden
(`visibility`, so the grid slot holds and nothing jumps); scrolling hands it to
the bar. Phones used to be exempt — the mark was re-shown under 860px because a
bar of two right-aligned buttons over an empty half looked like a layout fault
— but that made the home page's top state differ between a phone and a desktop
for no reason a visitor could see. Don't re-add the exception. Subpages carry
`data-home="false"`, so their mark is never hidden.

### SEO & Metadata

`BaseLayout.astro` handles all meta tags, Open Graph/Twitter Card, and JSON-LD structured data (Event + WebSite schemas). Sitemap auto-generated via `@astrojs/sitemap`.
