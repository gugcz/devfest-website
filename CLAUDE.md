# CLAUDE.md

Guidance for Claude Code working in this repository.

## Agents do not merge to `2026` and do not deploy

`2026` is production: a merge into it deploys to devfest.cz. **Only the
maintainer merges, pushes to it, or deploys.** An agent's work ends at: branch
pushed, PR opened, CI reported.

- Never `git push origin 2026`, `gh pr merge`, `firebase deploy`, dispatch a
  deploy workflow, or cut a release tag.
- "push it", "ship it", a green CI report — not merge permission. Only an
  instruction naming the merge is ("merge PR #X", "mergni", "revertni").
- Permission is per PR, once. Does not carry to the next PR or a follow-up fix.
- Hand back the **PR preview URL** (`devfest-public--pr-<n>-*.web.app`), never
  a production URL.

## Real customer data never enters this repository

**The repo is public.** Pushed data is world-readable forever (orphaned
commits stay reachable by SHA). Never commit real customer, partner or
attendee data anywhere — fixtures, doc examples, commit messages, branch
names, PR text, internal ids (tickets, invoices, Firestore/RTDB doc ids,
iDoklad contact ids, order ids).

Covered: names, emails, phones, addresses, VAT / IČO / DIČ, invoice/order
numbers, discount codes, any id mapping to those. Masking is not an exemption.

Use obviously fake stand-ins: `Acme Example s.r.o.`, IČO `12345678`,
`billing@example.com`, ids like `4242`. A real value needed for a repro stays
in the issue tracker.

# DevFest Website

DevFest.cz 2026 landing page. Astro 7, React 19 islands, TypeScript strict,
SCSS (CSS Modules for React, globals in `BaseLayout.astro`), Node >= 22.12.0,
Firebase Hosting.

Commands, setup, deploys, secrets: [README.md](README.md). No lint script.
Checks: `npm run a11y` (axe on an `A11Y_MOCK=1` build), `npm test` in
`functions/` (`node --test`, stubs `fetch`). Function tests compile via
`tsconfig.test.json` into `lib-test/`; deploy `tsconfig.json` excludes
`*.test.ts`.

## PR conventions

- **No `## Test plan` section.** Summary / Why / Behavior / Files, stop.

## Architecture

### Pages & Routing

File-based under `src/pages/` — list in [README.md](README.md#key-pages).
React islands (`.tsx`, `client:load`) in `src/components/`.

### Analytics (`src/lib/firebase.ts`)

GA4 via Firebase Analytics in **Google Consent Mode**. `initAnalytics()`
pushes `consent: 'default'` before `getAnalytics()`. Undecided → all denied,
GA4 boots cookieless (aggregate pings only). Accept →
`grantAnalyticsConsent()` sends `consent: 'update'`. `ad_*` stay denied.

Rules (each verified in-browser; breaking one silently writes `_ga` without
consent):

- `consent: 'default'` must precede `config`. Firebase `setConsent()` doesn't
  guarantee that, so `firebase.ts` uses its own gtag shim.
- gtag.js only honours commands pushed as an **`arguments` object**. Don't
  refactor the shim to a rest array.
- `initAnalytics()` memoises the **in-flight promise**, not just the instance
  — callers overlap.
- The default is **seeded from `readConsent()`** (`src/lib/consent.ts`), never
  hardcoded denied — a later `update` can't retroactively attribute the entry
  `page_view`. `CookieBanner.astro` doesn't call `grantAnalyticsConsent()` for
  a stored accept.
- Granting consent re-sends the current `page_view` (the `config` one was
  cookieless). Guarded by `consentGranted`: once per visitor.
- **Host-gated** (`ANALYTICS_HOSTS`; `PUBLIC_ANALYTICS_ALLOWED_HOSTS`
  overrides) — dev and previews send nothing. App Check init sits before the
  gate.

**Page views under `<ClientRouter />`:** GA4 sees only the document-load
`page_view`, not `pushState`. `trackPageView()` runs on every
`astro:page-load`, swallows the first call, sends the rest with explicit
`page_location`/`page_title`/`page_referrer`.

**Conversion events**, all via `src/lib/analytics.ts`:

| Event | Where | Notes |
| --- | --- | --- |
| `begin_checkout` | `Tickets.tsx` Buy CTA | ecommerce shape: `currency`, `value`, `items[]` (buyable variants, gross via `grossPrice()`) |
| `ticket_purchase_confirmed` | `/thank-you` | ti.to thank-you URL. Not GA4 `purchase` — redirect carries no `transaction_id`/`value` |
| `sign_up` (`method: 'newsletter'`) | `/newsletter-subscription-thank-you` | native POST to SmartEmailing; this page load is the signal |
| `generate_lead` | `InvoiceForm.tsx` on callable success | `value`/`currency` from the ti.to estimate |

- `analytics.ts` exists so components never statically import `firebase.ts`
  (would bundle the whole SDK). `track()` imports dynamically, never throws.
- `trackConversion(pathname, name)` guards path **and** repeats — an
  `astro:page-load` listener survives soft navigations.
- Mark the three conversions as key events in GA4 (README "Analytics").

**Data stores:** RTDB `/tickets` (ti.to cache, hourly), Firestore
`speakers`/`sessions` (Sessionize) and `invoices`. Project `devfest-cz-app`,
site `devfest-public`.

**App Check** (reCAPTCHA Enterprise): committed public key `APPCHECK_SITE_KEY`
(`PUBLIC_FIREBASE_APPCHECK_SITE_KEY` overrides). Inits on load everywhere,
not gated on consent. Only consumer: `submitInvoiceCallable`. Never enforce on
`ticketsWebhook` (external HMAC caller) or schedulers.

### Browser data access (`/api/*`)

**Browser reads DB data only through cached HTTP functions, never the client
SDK** (client reads blocked on an App Check token, ~30s on mobile).

| Endpoint | Function | Reads | Caller |
| --- | --- | --- | --- |
| `/api/lineup` | `lineupApi` | Firestore `speakers` + `sessions` | `src/lib/lineup.ts` |
| `/api/tickets` | `ticketsApi` | RTDB `/tickets` | `src/lib/tito.ts::fetchTickets` |

- 2nd-gen `onRequest`, public, `europe-west1`, codebase `website`. Edge
  `s-maxage` + in-instance memo. Lineup TTL 15min, tickets 5min. Failed read →
  `no-store` 503.
- `lineupApi` scales to zero; `ticketsApi` has `minInstances: 1` (override in
  `tickets-api.ts`, not the preset).
- Rewrites carry **no `pinTag`**: hosting deploys never build functions.
  Functions deploy only via `firebase-functions-merge.yml`. A PR preview hits
  **production** functions — verify function changes locally.
- Endpoints return raw docs; browser parses with `speakerFromDoc` /
  `sessionFromDoc` / `filterDisplayable`.
- Dev and a11y serve `/api/*` from `scripts/a11y-mocks/api.mjs` (a dev server
  has no rewrite table). `DEVFEST_LIVE_API=1 npm run dev` hits deployed
  functions. Only `firebase/app-check` is mocked under `A11Y_MOCK`.

### Backend conventions (`functions/src/lib/`, `options.ts`)

Failure text is a product surface: it lands in Slack, an invoice's
`errorMessage`, and Cloud Logging.

- **`options.ts`** — `setGlobalOptions` (`maxInstances` cost ceiling, shared
  billing project) + presets `SCHEDULED`, `CACHED_ENDPOINT`, `WEBHOOK`,
  `CALLABLE`, `TRIGGER`. Spread a preset; never restate `region`/`timeZone`.
- **`lib/run.ts`** — `runBackground({ name, domain, failureNote }, handler)`
  wraps every scheduled job. Logs start/finish, logs unwrapped cause, alerts
  Slack, rethrows. `failureNote` states blast radius. Alerts fire **on state
  change** (first failure, then "recovered"); streak in RTDB
  `ops/health/{name}`, best-effort.
- **`lib/slack.ts`** — `postToSlack` throws; `notify(domain, url, text)` is
  best-effort, prefixed, never throws. Alerting functions list
  `SLACK_WEBHOOK_URL` in `secrets`.
- **`lib/cached-endpoint.ts`** — `cachedJsonEndpoint({ name, cacheControl,
  memoTtlMs, fallback, load })`, shared body of `/api/*`.
- **`lib/errors.ts`** — `describeError(err)` unwraps `cause`/`code` (undici
  hides `ENOTFOUND` etc. under `fetch failed`; gRPC uses `code`).
  `stageError(stage, err)` labels the failing step. **Never log `err.message`
  directly.**
- **`lib/http.ts`** — `fetchWithRetry` is the only outbound HTTP; bare
  `fetch()` is a bug. Timeout per attempt (15s, 30s iDoklad), 3 attempts on
  network/429/5xx, 4xx never retried. **Non-GET never retries** unless
  `retryUnsafe` (only Slack and iDoklad token). Non-OK returned, not thrown.
  `errorBody(res)` reads a failed body, capped.

### ti.to tickets

Functions own all ti.to traffic; static build never calls it. Browser reads
`/api/tickets`. Helpers in `src/lib/tito.ts`. `database.rules.json` is not
wired into `firebase.json` — paste into the console.

- New function: file + re-export in `tickets/index.ts`. New domain: folder +
  `export * from './<domain>/index.js'` in `src/index.ts`.
- `params.ts` per domain; cross-domain params (`SLACK_WEBHOOK_URL`) in
  `lib/params.ts`. Never import a sibling domain's params.
- `.js` import suffixes (NodeNext).
- `ticketsWebhook` reads `req.rawBody` for HMAC.
- ti.to v3.0 has no `sale_status` field — a flag set (`sold_out`, `off_sale`,
  `expired`, `upcoming`, `archived`, `locked`, `secret`). `deriveSaleStatus`
  synthesises one string. Dates: `start_at` / `end_at`.
- Only `secret` releases are dropped (`isWebsiteVisible()` at write time;
  `filterDisplayable` again in the browser). Every other state renders a badge.
  `paused` + zero sales → "Coming soon" (`releaseStatus()`).
- Buy URL: `https://ti.to/<account>/<event>/with/<release-slug>`.
- Project is shared with the mobile app repo: keep `"codebase": "website"`
  and unique function names.

### Sessionize lineup

Daily sync into Firestore `speakers` (embeds `sessions[]`) and `sessions`
(embeds `speakers[]`); browser reads `/api/lineup`.

- Each collection is one atomic `WriteBatch` (cap 500 ops).
- Delete-guard: `computeDeletePlan` withholds deletes on a truncated fetch and
  pings Slack. `extractSpeakers` throws on empty; an empty session set
  (Speakers-view fallback) is preserved.
- Photos mirrored to Storage (`mirror-images.ts`), idempotent, best-effort.
- `SESSIONIZE_ENDPOINT_ID` must be a JSON API id or URL (embed id returns
  HTML); `parseEndpointId` handles both.

### Invoices (iDoklad)

`/invoice` → `submitInvoiceCallable` → Firestore `invoices/{id}` →
`processInvoiceTrigger` (iDoklad contact + invoice + email) →
`pollPaidInvoicesScheduled` hourly (no iDoklad webhooks) → paid → 100%-off
ti.to code. Browser never touches Firestore.

- `PaymentStatus`: Unpaid=0, **Paid=1**, PartialPaid=2, **Overpaid=3**.
  Completion flips to `completed`, so each invoice is processed once.
- OAuth client credentials at `https://identity.idoklad.cz/server/connect/token`
  (`scope=idoklad_api`, only `client_id`+`client_secret`; not the v2 endpoint).
  ~2h token, no refresh, cached. API `https://api.idoklad.cz/v3`; responses
  wrapped `{ Data, IsSuccess, Message }`, `unwrap()` peels.
- **`IsSuccess` is the verdict, not HTTP status** — iDoklad returns 200 for
  refusals. Everything goes through `unwrap()`/`apiJson()`.
- Invoice = `GET /IssuedInvoices/Default` → override `PartnerId`/`Items`/
  `DateOfMaturity` → POST (drop readonly `Prices`). Contacts likewise via
  `GET /Contacts/Default`.
- Line `UnitPrice` is net, `PriceType=1`, `VatRateType=1` (21 %) or `2` when
  `INVOICE_VAT_RATE=0`. CZK only, no FX.
- `findOrCreateContact` matches on IČO and PATCHes the submitted email +
  address (non-empty fields only), returning `{ id, emailSynced }`.
  `OtherRecipients` = `[doc.email]` only when `emailSynced` is false.
- `invoiceEmailSent: true` requires iDoklad `IsSuccess: true`. Log field is
  `idokladMessage`, not `message` (logger overwrites it). Addresses masked via
  `maskEmail`.
- Invoice mail: `POST /Mails/IssuedInvoice/Send`, plain-text body
  (`buildInvoiceEmail`). Discount code: Admin API `POST /discount_codes`
  wrapped under `discount_code`, scoped to releases matching
  `INVOICE_RELEASE_MATCH`. Discount mail via Resend, optional.
- `firestore.rules` denies all clients; not wired into `firebase.json`.
- `submitInvoiceCallable` has `enforceAppCheck: true`; callable protocol
  handles CORS.
- Both mails' copy in `email.ts`; HTML shell in `email-template.ts` (tables,
  inline styles, hex, VML, no webfonts; every interpolation escaped).

### Styling

[DESIGN.md](DESIGN.md) is the source of truth. Tokens in `BaseLayout.scss`;
React components use co-located `.module.scss`.

### Invitation pages (`/invite/<member>`)

One unlisted page per `src/content/team.json` entry (slug = `id`).

- Unlisted = `noindex` + out of the sitemap + **linked from nowhere**. Not
  access control.
- Copy in `src/lib/invite.ts` (generic v1; `roleLine` varies by role).
- `InviteCta.tsx` is the only primary action: resolves the ti.to href from
  `/api/tickets`, reports `begin_checkout` with `invite_member` /
  `invite_member_name` (register as GA4 custom dimensions). Fallback href
  `/#tickets` fires no event.
- Visual direction B ("The Plate"): portrait right half, B&W → colour bleed is
  the only effect. Phone: top strip (~48svh) with eyebrow + headline; scrim is
  a legibility condition, don't lighten. Special Elite never sits over a photo
  and never runs past ~2 lines.
- `Closer.astro` takes an `actions` slot for the tracked island.
- Header's red `Tickets` action is dropped on `/invite/*` (`isInvite`).

### SEO

`BaseLayout.astro`: meta, OG/Twitter, JSON-LD (Event + WebSite). Sitemap via
`@astrojs/sitemap`.
