# CLAUDE.md

Guidance for Claude Code (claude.ai/code) working in this repository.

## Agents do not merge to `2026` and do not deploy

`2026` is the production branch. A merge into it triggers the Firebase Hosting
deploy, so a merge IS a deploy to devfest.cz. **Only the maintainer merges,
pushes to it, or deploys.**

An agent's work ends at: branch pushed, PR opened, CI result reported.

- Never `git push origin 2026`, `gh pr merge`, `firebase deploy`, dispatch a
  deploy workflow, or cut a release tag.
- "push it", "redeploy", "ship it" and a green CI report are **not** merge
  permission. Only an instruction naming the merge itself is ("merge PR #X",
  "mergni", "revertni").
- Permission is per PR, once. It does not carry to the next PR, the next
  round, or a follow-up fix on the same branch.
- Hand back the **PR preview URL** (`devfest-public--pr-<n>-*.web.app`), never
  a production URL, unless the maintainer merged it himself.

## Real customer data never enters this repository

**This repository is public.** Anything committed is world-readable once
pushed, and a rewritten branch does not take it back (orphaned commits stay
reachable by SHA until GitHub garbage-collects them). The only control is not
writing the data.

Never put real customer, partner or attendee data anywhere in the repo,
including:

| surface | rule |
| --- | --- |
| test fixtures and mocks | invented data only, never copied from a real request, log or ticket |
| doc comments and examples | never a real value, not even masked or partially redacted |
| commit messages and branch names | describe the behaviour, never the customer |
| PR titles and bodies | "a company", not the company |
| internal identifiers | ticket ids, invoice numbers, Firestore/RTDB doc ids, iDoklad contact ids, external order ids all stay out |

Covered: company and person names, emails, phone numbers, postal addresses,
VAT / IČO / DIČ numbers, invoice and order numbers, discount codes, and any id
that maps back to one of those. Masking is not an exemption — a masked address
still carries its domain, and a redacted string next to a bug description still
identifies the customer.

Use obviously fake stand-ins: `Acme Example s.r.o.`, IČO `12345678`,
`billing@example.com`, `ops@example.com`, ids like `4242` / `1001`. Prefer
`example.com` / `example.org` over a real domain.

If a real value is needed to reproduce something, keep it in the issue tracker
or incident thread, not the repo.

# DevFest Website

Conference landing page for DevFest.cz 2026. Astro 7, deployed to Firebase Hosting.

## Tech Stack

Astro 7, React 19 islands (`@astrojs/react` 6), TypeScript strict, SCSS (CSS
Modules for React components, globals in `BaseLayout.astro`), Node >= 22.12.0.

Commands, local setup, deploys and secrets: [README.md](README.md). No lint
script — strict TypeScript is the type safety. Automated checks: `npm run a11y`
(axe against an `A11Y_MOCK=1` build) and `npm test` inside `functions/`
(`node --test`, stubs `globalThis.fetch`, never touches iDoklad/ti.to). Function
tests compile through their own `tsconfig.test.json` into `lib-test/`; the
deploy `tsconfig.json` excludes `*.test.ts` so a test file never ships in a
function bundle.

## PR conventions

- **No `## Test plan` section in PR bodies.** The maintainer verifies visually
  against the deploy preview. Cover Summary / Why / Behavior / Files and stop.

## Architecture

### Pages & Routing

File-based Astro routing under `src/pages/` — route list in
[README.md](README.md#key-pages). React islands (`.tsx`, `client:load`) live in
`src/components/` next to their static Astro counterparts.

### Firebase Integration (`src/lib/firebase.ts`)

Firebase Analytics (GA4) runs in **Google Consent Mode** for every visitor.
`initAnalytics()` pushes a gtag `consent: 'default'` onto the dataLayer *before*
`getAnalytics()`. An undecided visitor gets everything denied, so GA4 boots
cookieless — no `_ga` / `client_id`, no storage, only aggregated pings. That
gives basic traffic numbers from visitors who decline or never decide (the
ePrivacy-exempt part). On accept, `grantAnalyticsConsent()` sends
`consent: 'update'` with `analytics_storage: 'granted'`. `ad_*` stay denied
permanently.

Gotchas (all verified in-browser; the first two silently write `_ga` with
consent denied if wrong):

- `consent: 'default'` **must** land in the dataLayer before the `config`
  command. Firebase's `setConsent()` does not guarantee that, so `firebase.ts`
  pushes the default via its own gtag shim.
- gtag.js only honours commands pushed as an **`arguments` object**. A plain
  array is silently ignored. The shim forwards `arguments` for this reason —
  don't "clean it up" into a rest array.
- `initAnalytics()` memoises its **in-flight promise**, not just the resolved
  instance. Callers overlap (banner boots Analytics while a stored `accepted`
  grants consent in the same tick), so an `if (analyticsInstance)` guard alone
  would push the consent default twice.
- **The default is seeded from the stored decision** (`readConsent()`,
  `src/lib/consent.ts`), never hardcoded to denied. A `consent: 'update'`
  pushed after `config` cannot retroactively attribute the `page_view` that
  `config` already sent — a returning accepted visitor was booting denied and
  losing their entry page view. So `CookieBanner.astro` does **not** call
  `grantAnalyticsConsent()` for a stored `accepted`; the seeded default covers it.
- **Granting consent re-sends the current page's `page_view`.** The one sent at
  `config` time was cookieless and gtag never re-sends it. Guarded by the same
  `consentGranted` flag: at most once per visitor, never on the stored-accept path.
- **Measurement is host-gated** (`ANALYTICS_HOSTS`;
  `PUBLIC_ANALYTICS_ALLOWED_HOSTS` overrides). The measurement ID is committed,
  so `npm run dev` and `*.web.app` previews would otherwise report into the live
  property. App Check init sits *before* that gate — it's a security mechanism
  and runs everywhere.

**Page views under `<ClientRouter />`.** GA4's `config` fires one `page_view`
for the loading document. Soft navigations go through `history.pushState`, and
GA4 enhanced measurement does **not** pick them up (verified). So `firebase.ts`
exports `trackPageView()` and `CookieBanner.astro` calls it on every
`astro:page-load`. It swallows the first call (already reported by `config`) and
sends the rest with explicit `page_location`/`page_title` plus the previous URL
as `page_referrer` (otherwise GA4 reads every in-site hop as a direct arrival).

**Conversion events.** GA4 sees page views only. Ticket checkout finishes on
ti.to and the company path never reaches a checkout, so four events are sent
explicitly through `src/lib/analytics.ts`:

| Event | Where | Notes |
| ----- | ----- | ----- |
| `begin_checkout` | `Tickets.tsx` Buy CTA | GA4 ecommerce shape: `currency` + `value` + `items[]` (buyable variants of the wave, gross unit price from `grossPrice()`). Last thing GA4 sees of a sale. |
| `ticket_purchase_confirmed` | `/thank-you` | ti.to's "thank you URL". Deliberately **not** GA4's `purchase` — that needs `transaction_id` + `value` + `items`, and ti.to's redirect carries none. |
| `sign_up` (`method: 'newsletter'`) | `/newsletter-subscription-thank-you` | Newsletter form is a native POST to SmartEmailing; this page load is the success signal (an event in the submit handler races the unload). |
| `generate_lead` | `InvoiceForm.tsx`, on callable success | `value`/`currency` from the ti.to price estimate. The company-path conversion. |

- `src/lib/analytics.ts` exists so components never statically import
  `src/lib/firebase.ts` — that would pull the whole Firebase SDK into an island
  bundle. `track()` imports it dynamically and never throws or blocks.
- `trackConversion(pathname, name)` guards **both** path and repeats: a page
  script runs once per document but its `astro:page-load` listener survives
  soft navigations, so an unguarded call re-fires on every later page.
- The three conversions are custom/recommended events, not key events — mark
  them in GA4 → Admin → Events (README "Analytics (GA4)").

Firebase Realtime Database holds the ti.to `/tickets` cache (written hourly by
`refreshTicketsScheduled`, served via `/api/tickets`); Firestore holds
`speakers`/`sessions` (Sessionize sync) and `invoices`. Deploy target:
`devfest-public` site in project `devfest-cz-app` (`firebase.json`).

App Check (reCAPTCHA Enterprise) runs in `getApp()` with a committed key
(`APPCHECK_SITE_KEY` in `src/lib/firebase.ts`;
`PUBLIC_FIREBASE_APPCHECK_SITE_KEY` overrides — typed in `src/env.d.ts`,
documented in `.env.example`). The key is public like the Firebase `apiKey`. It
initialises on load, in every environment, **not** gated on cookie consent —
security mechanism, not analytics. No browser content read goes through the
Firebase SDK anymore (everything fetches `/api/*`), so App Check only matters
for the enforced `submitInvoiceCallable`. `ticketsWebhook` (external ti.to
caller, HMAC-protected) must stay out. See README "App Check".

### Browser data access (cached `/api/*` functions)

**Every browser read of DB-backed data goes through a cached HTTP Cloud
Function, never the Firebase client SDK.** The old client Firestore/RTDB reads
blocked on an App Check (reCAPTCHA) token — ~30s on mobile. A plain `fetch()`
has no such wait, and stays compatible with enforcing App Check on
Firestore/RTDB later (the functions read via the Admin SDK).

| Endpoint (Hosting rewrite) | Function | Reads | Browser caller |
| -------------------------- | -------- | ----- | -------------- |
| `/api/lineup` | `lineupApi` (`functions/src/lineup/`) | Firestore `speakers` + `sessions` | `src/lib/lineup.ts` → `Speakers`/`Sessions`/`SpeakersTeaser` |
| `/api/tickets` | `ticketsApi` (`functions/src/tickets/tickets-api.ts`) | RTDB `/tickets` | `src/lib/tito.ts::fetchTickets` → `Tickets`/`InvoiceForm` |

- Both are 2nd-gen `onRequest` (`invoker: 'public'`, region `europe-west1`,
  codebase `website`, deployed by `firebase-functions-merge.yml`). Two-layer
  caching: `Cache-Control` `s-maxage` so the Hosting CDN answers most requests,
  plus a short in-instance memo so a warm instance coalesces revalidation reads.
  Lineup TTL 15min, tickets 5min. A failed read → `no-store` + 503; the browser
  shows its "unavailable" state.
- **`lineupApi` scales to zero; `ticketsApi` runs `minInstances: 1`** (both
  256MiB, 30s). Edge TTLs serve almost every visitor, so a cold start only lands
  on a revalidating request. `ticketsApi` keeps one warm container because its
  5min TTL revalidates often and the cold-start request is a real visitor waiting
  on the roadmap. The override lives in `tickets-api.ts`, not the
  `CACHED_ENDPOINT` preset.
- **Deploy split (no `pinTag`):** the `/api/*` rewrites carry no `pinTag`, so
  hosting deploys (live + PR preview) never build or deploy functions. That
  keeps previews from pushing PR function code toward production and avoids
  running the functions `tsc` in the hosting container. `lineupApi`/`ticketsApi`
  deploy **only** via `firebase-functions-merge.yml`. A first deploy can briefly
  404 `/api/*` until the functions land (island shows its unavailable state; a
  reload recovers). A PR preview hits the **production** functions, so verify
  function changes locally, not on the preview.
- The endpoints return raw docs (`{ id, ...fields }` / the RTDB cache verbatim);
  the browser reuses `speakerFromDoc` / `sessionFromDoc` / `filterDisplayable`
  so shape logic isn't duplicated in `functions/`.
- **Local + a11y both serve these routes from fixtures.** A dev server has no
  Hosting rewrite table, so `/api/*` would 404 and every island would render
  "unavailable". `scripts/a11y-mocks/api.mjs` holds the payloads (built from
  `fixtures.mjs`) and is imported by both `scripts/a11y.mjs` and
  `astro.config.mjs` (an `apply: 'serve'` Vite plugin answering `/api/*` on
  `npm run dev`). `DEVFEST_LIVE_API=1 npm run dev` skips the fixtures and hits
  the deployed functions — use that when changing the functions. The only
  Firebase module still mocked under `A11Y_MOCK` is `firebase/app-check`.

### Backend conventions (`functions/src/lib/`, `functions/src/options.ts`)

Every domain builds on the same shared layer. Rule of thumb: **the failure text
is a product surface** — it lands in a Slack alert (`🎤 SESSIONIZE`,
`🎟️ TICKETS`, `🧾 INVOICES`), in an invoice doc's `errorMessage`, and in Cloud
Logging, and it is usually all a responder has.

- **`options.ts`** — `setGlobalOptions` (`maxInstances` cost ceiling for the
  shared billing project) plus one preset per function kind: `SCHEDULED`,
  `CACHED_ENDPOINT`, `WEBHOOK`, `CALLABLE`, `TRIGGER`. Spread a preset and
  override only what is specific (`{ ...SCHEDULED, schedule, secrets }`); never
  restate `region`/`timeZone`. No preset sets `minInstances`; the one override
  is `ticketsApi`.
- **`lib/run.ts`** — `runBackground({ name, domain, failureNote }, handler)`
  wraps **every** scheduled job (and any trigger that should alert). Logs
  start/finish with duration, logs the failure with the unwrapped cause, alerts
  Slack, and rethrows so the platform counts the failure and the scheduler's
  `retryCount` retry still happens. `failureNote` states the blast radius
  ("live speakers/sessions left untouched").
  - **Alerts fire on state change, not per failure.** First failure after a
    healthy run alerts, further consecutive failures only log, the recovering
    run posts a "recovered" line. Streak state lives in RTDB
    `ops/health/{functionName}` (Admin SDK only; root deny in
    `database.rules.json` covers it). Health reads/writes are best-effort and
    degrade to "assume healthy" — over-alerts rather than going silent.
- **`lib/slack.ts`** — `postToSlack` is the raw webhook call (throws; used
  where the caller handles delivery, e.g. purchase webhook and status reports).
  `notify(domain, webhookUrl, text)` is the best-effort one everything else
  uses: prefixes by domain, never throws, logs a failed delivery. A function
  that alerts must list `SLACK_WEBHOOK_URL` in its `secrets`.
- **`lib/cached-endpoint.ts`** — `cachedJsonEndpoint({ name, cacheControl,
  memoTtlMs, fallback, load })` is the shared body of the `/api/*` endpoints:
  per-instance memo, `Cache-Control` on success, `no-store` 503 with an empty
  payload on a failed read (never cache an error).
- **`lib/errors.ts`** — `describeError(err)` unwraps the real reason, which is
  never in `message`: undici reports every network fault as `fetch failed` and
  hides `ENOTFOUND` / `UND_ERR_CONNECT_TIMEOUT` / `ECONNRESET` in `cause`; gRPC
  (Firestore/RTDB) carries its status in `code`. `stageError(stage, err)` labels
  which step failed, keeping the original as `cause` — so a Slack line can tell
  "Sessionize is down" from "our Firestore write was denied". **Use these
  instead of `err.message` in any log, alert, or persisted error.**
- **`lib/http.ts`** — `fetchWithRetry(url, init, { label, … })` is the only
  outbound HTTP in `functions/`; a bare `fetch()` there is a bug. Per-attempt
  timeout (15s default, 30s for iDoklad) plus bounded retries (3 attempts,
  1s/2s backoff) on network faults and 429/5xx. 4xx never retries
  (`fetchSessionizePayload` depends on seeing the 400 immediately to fall back
  to the Speakers view). Non-OK responses are returned, not thrown.
  - **Retries are off for anything non-idempotent, enforced in the helper.** A
    retried `POST /IssuedInvoices` bills a company twice. `GET`/`HEAD` retry
    automatically; a non-GET is pinned to one attempt even if the caller passes
    `attempts`, unless it passes `retryUnsafe`. Only two calls do: the Slack
    webhook (duplicate line beats a lost alert) and the iDoklad OAuth token.
  - `errorBody(res)` reads a failed response's body for the message — capped,
    never throws.

### ti.to Tickets pipeline

Browsers read ticket data from `/api/tickets` (`ticketsApi`), which serves the
RTDB `/tickets` cache. The static build never calls ti.to; Cloud Functions own
all ti.to traffic. Function inventory: [README.md](README.md).

Browser side: `src/components/Tickets.tsx` and `InvoiceForm.tsx`'s price
estimate `fetch()` `/api/tickets`. `src/lib/tito.ts` holds browser-safe helpers
(types, `fetchTickets`, `filterDisplayable`, `checkoutUrl`, `formatPrice`).

`/tickets` is read only by `ticketsApi` (Admin SDK, bypasses rules), so
`tickets.".read"` no longer needs to be public. Writes stay blocked; functions
write via Admin SDK. Root `.read`/`.write` stay `false`.
`database.rules.json` is **not** wired into `firebase.json` — paste rule
changes into the Firebase console manually.

Gotchas:

- New function in an existing domain: add file → re-export in
  `tickets/index.ts`. New domain: new folder, same shape, plus
  `export * from './<domain>/index.js'` in `src/index.ts`.
- `params.ts` is the single source of truth for a domain's secrets/strings.
  Params shared by domains (`SLACK_WEBHOOK_URL`) live in `lib/params.ts`; a
  domain never imports a param from a sibling domain.
- TS imports inside `functions/` use `.js` suffixes (NodeNext).
- `ticketsWebhook` reads `req.rawBody` (Buffer) for HMAC, not `req.body`.
- ti.to Admin API v3.0 returns releases as a flag set (`sold_out`, `off_sale`,
  `expired`, `upcoming`, `archived`, `locked`, `secret`) plus `state_name`.
  There is **no** `sale_status` or `accessibility` field on the wire.
  `functions/src/tickets/tito-api.ts::deriveSaleStatus` synthesises one
  `sale_status` string (`on_sale` / `sold_out` / `paused` / `not_yet_on_sale` /
  `ended` / `archived`). Sale window dates are `start_at` / `end_at`.
- Visibility is enforced **at write time** in `refresh-cache.ts` via
  `isWebsiteVisible()`. Only `secret` releases are dropped; every other state
  is persisted so the UI can render the full wave roadmap. `Tickets.tsx` maps
  each `sale_status` to a badge (On sale / Sold out / Paused / Coming soon /
  Ended / Unavailable) and disables the Buy CTA when nothing in a group is
  purchasable. A `paused` release with zero sales renders "Coming soon", not
  "Paused" (`releaseStatus()` in `src/lib/tito.ts`) — future waves sit
  `off_sale` in ti.to with no `start_at`, so they never get `upcoming`. The
  browser's `filterDisplayable` mirrors the `secret`-only drop as
  defence-in-depth.
- Buy URL pattern: `https://ti.to/<account>/<event>/with/<release-slug>`.
- Default Cloud Functions service account can write RTDB; no explicit creds.
- The Firebase project (`devfest-cz-app`) is **shared with the mobile app
  repo**, which deploys its own functions. This repo declares
  `"codebase": "website"` in `firebase.json`; the app repo must use a different
  codebase name and different function names, or deploys overwrite each other.

Deploy steps, secrets, ti.to/Slack wiring: [README.md](README.md).

### Sessionize → lineup pipeline

Speaker/session data comes from **Sessionize**. A daily scheduled function
mirrors it into Firestore (`speakers` + `sessions`); the browser reads those
through `/api/lineup`. Function inventory: [README.md](README.md).

Gotchas:

- **Cross-referenced collections.** `speakers` docs embed their `sessions[]`;
  `sessions` docs embed their `speakers[]`. Each collection is written as its
  own atomic `WriteBatch` (upserts + guarded deletes) so a reader never sees a
  half-synced state. Batch cap is 500 ops — fine at ~30–80 docs.
- **Delete-guard.** `computeDeletePlan` withholds deletes when a fetch looks
  truncated/empty so a bad response can't wipe the live collections; a withheld
  run pings Slack. `extractSpeakers` throws on an empty roster, aborting before
  any write; an empty session set (Speakers-view fallback) is preserved.
- **Photos on Firebase, not Sessionize's CDN.** `mirror-images.ts` uploads each
  `profilePicture` to Storage and writes the download-token URL onto both
  collections. Idempotent (re-downloads only when the source URL changed);
  best-effort (per-speaker failure falls back to the raw Sessionize URL).
- `SESSIONIZE_ENDPOINT_ID` must be a **JSON API** endpoint id (or full URL)
  exposing the "All data" / "Speakers" view — an embed id returns HTML.
  `parseEndpointId` accepts either.
- Browser side: `src/lib/lineup.ts` → `Speakers`/`Sessions`/`SpeakersTeaser`.
  `lineupApi` returns raw docs; the browser parses with
  `speakerFromDoc`/`sessionFromDoc` (`src/lib/speakers.ts`,
  `src/lib/sessions.ts`).

### Invoice (iDoklad) pipeline

Invoice-first B2B flow: a company requests an invoice on `/invoice`, pays by
bank transfer, and gets a 100%-off ti.to code to claim the tickets. Reuses the
tickets-domain ti.to client + Slack client; state in **Firestore**
`invoices/{id}` (not RTDB — it holds company PII). Function inventory:
[README.md](README.md).

Browser side: `src/components/InvoiceForm.tsx` (page `src/pages/invoice.astro`)
calls the `submitInvoiceCallable` callable via the Functions SDK
(`getFunctions(getFirebaseApp(), 'europe-west1')` → `httpsCallable`). It never
touches Firestore directly.

Gotchas:

- **iDoklad has NO webhooks.** Payment is detected by
  `pollPaidInvoicesScheduled` (hourly): lists `status == 'invoiced'` docs and
  GETs each invoice's `PaymentStatus` (Unpaid=0, **Paid=1**, PartialPaid=2,
  **Overpaid=3**). Completion flips the doc to `completed`, so each paid invoice
  is processed once.
- **iDoklad OAuth2 Client Credentials.** Token at
  `https://identity.idoklad.cz/server/connect/token` (API is `v3`),
  `application/x-www-form-urlencoded`, `grant_type=client_credentials`,
  `scope=idoklad_api`. This v1 endpoint needs only `client_id` +
  `client_secret` (Nastavení → Aplikace → API); the `/server/v2/connect/token`
  variant also demands a Developer-portal `application_id`, which we avoid.
  ~2h token, no refresh; `idoklad-api.ts` caches it. API base
  `https://api.idoklad.cz/v3`. Every response is wrapped in
  `{ Data, IsSuccess, Message }`; lists wrap `Data` as
  `{ Items, TotalItems, TotalPages }` — `unwrap()` peels it.
- **`IsSuccess` is the verdict, not the HTTP status.** iDoklad answers 200 for
  domain-level refusals (partner with no email, rejected payload), so `unwrap()`
  throws `IdokladApiError` with the envelope's `Message` when
  `IsSuccess === false`. Everything reading an iDoklad response goes through
  `unwrap()`/`apiJson()`; `apiEnvelope()` returns the un-peeled envelope for
  the one caller that needs `IsSuccess` itself.
- **Invoice creation = Default→edit→Post.** `GET /IssuedInvoices/Default`
  returns a fully-defaulted template (CurrencyId, PaymentOptionId,
  NumericSequenceId, dates); we override `PartnerId` / `Items` /
  `DateOfMaturity` and POST it back (dropping the readonly `Prices` block).
  Same for contacts via `GET /Contacts/Default` (inherits the account
  `CountryId`; the form's free-text country is stored but not mapped).
- **Item pricing:** line `UnitPrice` is **net**, `PriceType=WithoutVat (1)`,
  `VatRateType=Basic (1)` for 21 % (or `Zero (2)` when `INVOICE_VAT_RATE=0`).
  `releaseNetUnitPrice` backs net out of the ti.to gross. **No FX** — the 2026
  event is CZK.
- **A reused contact is updated before the invoice is issued.**
  `findOrCreateContact` matches on IČO, then PATCHes the submitted email +
  address onto the match, returning `{ id, emailSynced }`. Without this, when
  the same company orders twice from two people, `SendToPartner` mails the
  first person. Only non-empty fields are written (a blank optional field must
  not wipe what iDoklad holds); a failed PATCH is non-fatal and reports
  `emailSynced: false`.
- **`OtherRecipients` is a belt, added only when the contact is NOT in sync.**
  `process.ts` passes `[doc.email]` when `emailSynced` is false and nothing
  otherwise — naming a synced address twice mails two copies.
- **`invoiceEmailSent: true` requires iDoklad's own `IsSuccess: true`.**
  `sendInvoiceByEmail` returns `{ confirmed, message, recipients }`; an envelope
  with no verdict counts as unconfirmed, so Slack asks for a manual send. It
  logs the verdict on every call (`isSuccess`, `idokladMessage`, masked
  recipients). Addresses go through `maskEmail` (`billing@example.com` →
  `b*****g@example.com`). Use `idokladMessage`, not `message` — `message` is
  the firebase logger's own field and silently overwrites it.
- **Invoice email** via `POST /Mails/IssuedInvoice/Send` (`SendToPartner:
  true`, `SendAttachment: true`) — PDF attached, company pays by bank transfer
  using the variable symbol. Failure is tolerated and Slack-relayed. Subject +
  text come from `buildInvoiceEmail` (`email.ts`) and stay **plain text** —
  iDoklad drops `EmailBody` into its own template, so HTML isn't guaranteed to
  survive.
- **ti.to discount code** uses Admin API v3 `POST /discount_codes` with the
  body wrapped under `discount_code` (`type: 'PercentOffDiscountCode'`,
  `value: '100.0'`, `release_ids`). Scope = every release whose title contains
  `INVOICE_RELEASE_MATCH` (default `company funded`).
- **Firestore is server-only.** `firestore.rules` denies all client access;
  the Admin SDK bypasses it. Like `database.rules.json`, it is **not** wired
  into `firebase.json` (shared project — auto-deploy would clobber the app's
  ruleset). `lib/admin.ts` exposes `firestore()` alongside `db()`. The project
  must have a Firestore database provisioned.
- **App Check on `submitInvoiceCallable`.** `onCall` with
  `enforceAppCheck: true` — the client SDK auto-attaches the App Check token and
  the framework rejects missing/invalid before the handler, so bots/curl can't
  mint invoices. The callable protocol handles CORS. `src/lib/firebase.ts`
  exposes `getFirebaseApp()` so the form can `getFunctions(app)` on the
  App-Check-initialised app. Do **not** enforce App Check on `ticketsWebhook`
  (external HMAC caller) or the schedulers.
- Discount-code email via Resend (`POST https://api.resend.com/emails`, `from`
  must be a verified-domain sender) is **optional** (`RESEND_API_KEY` defaults
  to empty); when unset the code is still posted to Slack + stored on the doc.
  `reply_to` is the organisers' address; `from` is no-reply.
- **Both mails' copy lives in `email.ts`** (`buildInvoiceEmail`,
  `buildDiscountEmail`) so the two messages read as one voice; the branded HTML
  shell is `email-template.ts`. That file is email HTML, not web HTML: nested
  `<table role="presentation">`, inline styles, hex colours (Outlook drops
  `rgba()`), pixel widths, a VML `roundrect` behind the CTA, no webfonts. Every
  interpolation goes through `escapeHtml`/`escapeAttr`. The dark palette
  mirrors `BaseLayout.scss` and declares `color-scheme: dark`. The plain-text
  alternative is a real fallback (same code, link and steps).

### Styling

The design system — values, tokens, binding [MUST]/[CURRENT] rules and the
rationale — lives in [DESIGN.md](DESIGN.md); treat it as the source of truth.
Global CSS variables are in `BaseLayout.scss`; React components use co-located
`.module.scss` files.

### Personal invitation pages (`/invite/<member>`)

An unlisted referral channel: one page per person in `src/content/team.json`
(`src/pages/invite/[member].astro`), written in that member's voice, shared by
the member with their own network.

- **Unlisted means three things at once**: `noindex` (the `BaseLayout` prop
  also drops the canonical + JSON-LD), excluded from the sitemap (the
  `/invite/` clause in `astro.config.mjs`), and **linked from nowhere** — not
  the menu, footer, or `/team`. It is not access control; the URLs are
  guessable and the content isn't sensitive.
- **The route slug is the `team.json` entry key** (`id`), so URL and roster
  can't drift. Adding a member to the roster ships their invite page.
- **Copy lives in `src/lib/invite.ts`**, not the page. Deliberately generic
  v1 — members write their own paragraphs later, and only `body` changes.
  `roleLine` is the one line that varies, keyed by `role`; an unrecognised role
  falls back to the organiser line.
- **`InviteCta.tsx` is the only primary action**, an island for two reasons:
  it resolves the ti.to href client-side from `/api/tickets` (live wave isn't
  known at build time), and it reports `begin_checkout` with `invite_member` /
  `invite_member_name`. That click is the ONLY per-member attribution the
  channel has — checkout runs on ti.to with no source in its redirect, and
  there is no discount code (no perk in v1). Until the endpoint answers, and if
  it never does, the href is `/#tickets`.
- **Visual direction B ("The Plate")**, approved 3 Sep 2026: the portrait owns
  the right half of the frame and the B&W → colour bleed is the page's only
  effect. On a phone the plate becomes a top strip (~48svh) holding only the
  eyebrow + headline; everything from the lede down sits on flat `#050505`. The
  scrim in that strip is a legibility condition — do not lighten it. The base
  plate is the LCP element (`fetchpriority` high); the colour layer is `low`.
- **Special Elite (the lede's face) never sits over a photograph, on any
  breakpoint, and never runs past ~2 lines in a block.** It's a texture face at
  body size; past two lines it fights the Bebas headline. This is why the
  mobile lede moved off the plate strip rather than the strip getting a heavier
  scrim.
- `Closer.astro` takes an optional `actions` **slot** so the closing CTA can be
  that same tracked island; its `actions` prop stays the path for every other
  page.
- **The header's red `Tickets` action is dropped on `/invite/*`** (`isInvite`
  in `Menu.astro`), decided 4 Sep 2026: a second primary action pointing off
  the invitation. The mark and menu toggle stay.
- **`begin_checkout` fires only on the ti.to click**, never on the `/#tickets`
  fallback — that lands on the ticket section whose own Buy CTA sends the
  event, so both would double-count. `invite_member` / `invite_member_name`
  are custom parameters: GA4 reports nothing until they are registered as
  custom dimensions (README, "Analytics (GA4)").

### SEO & Metadata

`BaseLayout.astro` handles all meta tags, Open Graph/Twitter Card, and JSON-LD
(Event + WebSite). Sitemap via `@astrojs/sitemap`.
