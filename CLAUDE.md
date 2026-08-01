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
- `CookieBanner.astro` — Cookie consent stored in localStorage; dispatches `cookie-consent-accepted` DOM event

### Firebase Integration (`src/lib/firebase.ts`)

Firebase Analytics (GA4) runs in **Google Consent Mode** for every visitor, not just those who accept. `initAnalytics()` pushes a gtag `consent: 'default'` with **everything denied** onto the dataLayer *before* `getAnalytics()`, so GA4 boots cookieless — no `_ga` / `client_id`, no storage, only aggregated identifier-free pings. That yields basic traffic numbers from visitors who decline or never decide, which is the ePrivacy-exempt part. On accept, `grantAnalyticsConsent()` sends `consent: 'update'` with `analytics_storage: 'granted'` and GA4 switches to full measurement. `ad_*` stay denied permanently — we never collect for advertising.

Gotchas (both verified in-browser; getting either wrong silently writes `_ga` with consent denied):
- The `consent: 'default'` command **must** land in the dataLayer ahead of the `config` command. Firebase's own `setConsent()` does **not** guarantee that ordering, which is why `firebase.ts` pushes the default via its own gtag shim instead.
- gtag.js only honours commands pushed as an **`arguments` object** (Google's canonical snippet). A plain array is silently ignored — the consent default gets skipped and cookies are written anyway. The `gtag` shim in `firebase.ts` forwards `arguments` for this reason; don't "clean it up" into a rest array.

Firebase Realtime Database holds the ti.to `/tickets` cache (written hourly by `refreshTicketsScheduled`, served to the browser via `/api/tickets` — see below); Firestore holds `speakers`/`sessions` (Sessionize sync) and `invoices`. Deployment targets the `devfest-public` site in the `devfest-cz-app` project via `firebase.json`.

App Check (reCAPTCHA Enterprise) runs in `getApp()` with a committed key (`APPCHECK_SITE_KEY` in `src/lib/firebase.ts`; `PUBLIC_FIREBASE_APPCHECK_SITE_KEY` overrides it — `src/env.d.ts` types it, `.env.example` documents it). The key is public like the Firebase `apiKey`. It initialises on load (whenever `getApp()` first runs — `initAnalytics` triggers it), **not** gated on cookie consent — App Check is a security mechanism (legitimate interest), not analytics. **No browser content read goes through the Firebase SDK anymore** (speakers/sessions/tickets all fetch the cached `/api/*` endpoints below), so App Check only matters for the App-Check-enforced `submitInvoiceCallable` callable; `ticketsWebhook` (external ti.to caller, HMAC-protected) must stay out. See README "App Check".

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
- **a11y:** `scripts/a11y.mjs` serves `/api/lineup` + `/api/tickets` from `scripts/a11y-mocks/fixtures.mjs` (the islands `fetch` them, no SDK). The only Firebase module still mocked under `A11Y_MOCK` is `firebase/app-check` (App Check inits on load via analytics).

### ti.to Tickets pipeline

Visitor browsers read ticket data from the cached `/api/tickets` endpoint (`ticketsApi`), which serves the RTDB `/tickets` cache — never the Firebase SDK (see "Browser data access"). The static build never calls ti.to. Cloud Functions own all ti.to traffic.

```
functions/src/
├── index.ts                # top barrel — `export * from './<domain>/index.js'`
├── lib/admin.ts            # Admin SDK singleton (`db()` returns RTDB)
└── tickets/
    ├── index.ts            # domain barrel
    ├── params.ts           # secrets + string params (single source of truth)
    ├── tito-api.ts         # ti.to HTTP client + `projectRelease()`
    ├── tito-webhook.ts     # `verifyTitoSignature` + header constants + payload type
    ├── slack-client.ts     # `postToSlack()`
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
- `params.ts` is the single source of truth for secrets/strings. Don't duplicate the table elsewhere.
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
│   ├── params.ts              # SESSIONIZE_ENDPOINT_ID secret (reuses tickets SLACK_WEBHOOK_URL)
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
├── params.ts           # iDoklad OAuth + invoice business params (reuses tickets params for ti.to/Slack)
├── idoklad-api.ts      # iDoklad v3 client: OAuth token cache, contacts, invoices, mail send, payment status
├── tito-discount.ts    # resolve company-funded releases + create 100%-off discount_code
├── email.ts            # optional Resend HTTP sender (discount-code email)
├── slack.ts            # best-effort Slack notify (reuses tickets/slack-client.js)
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
- **Invoice email** via `POST /Mails/IssuedInvoice/Send` (`SendToPartner: true`, `SendAttachment: true`) — PDF attached, company pays by bank transfer using the variable symbol. Failure is tolerated and Slack-relayed.
- **ti.to discount code** uses Admin API v3 `POST /discount_codes` with the body wrapped under `discount_code` (`type: 'PercentOffDiscountCode'`, `value: '100.0'`, `release_ids`). Scope = every release whose title contains `INVOICE_RELEASE_MATCH` (default `company funded`).
- **Firestore is server-only.** `firestore.rules` denies all client access; the Admin SDK bypasses it. Like `database.rules.json`, it is **not** wired into `firebase.json` (shared project — auto-deploy would clobber the app's ruleset). `lib/admin.ts` exposes `firestore()` alongside `db()`. The project must have a Firestore database provisioned (it previously used only RTDB).
- **App Check on `submitInvoiceCallable`.** It's a **callable** (`onCall`) with `enforceAppCheck: true` — the client Functions SDK auto-attaches the App Check token (reCAPTCHA Enterprise) and the framework rejects missing/invalid before the handler, blocking bots/curl from minting invoices/emails. The callable protocol handles CORS (no manual headers/preflight). `src/lib/firebase.ts` exposes `getFirebaseApp()` so the form can `getFunctions(app)` on the App-Check-initialised app. Do **not** enforce App Check on `ticketsWebhook` (external HMAC caller) or the schedulers.
- Discount-code email via Resend (`POST https://api.resend.com/emails`, `from` must be a verified-domain sender) is **optional** (`RESEND_API_KEY` is a string param defaulting to empty); when unset the code is still posted to Slack + stored on the doc.

### Styling Conventions

- Global CSS variables (colors, fonts) defined in `BaseLayout.astro`
- React component styles use `.module.scss` files co-located with each component
- Design uses dark theme (`#050505` bg, `#F0EDE6` text, `#CC0000` accent), film grain overlay, scanlines, and atmospheric red glow animations

### SEO & Metadata

`BaseLayout.astro` handles all meta tags, Open Graph/Twitter Card, and JSON-LD structured data. Sitemap auto-generated via `@astrojs/sitemap`.

**Prerendered lineup.** `/speakers`, `/sessions` and `/agenda` used to render entirely client-side, so crawlers got zero speaker names and zero talk titles. `src/lib/lineup-build.ts` now reads the same cached `/api/lineup` at **build time** and each island takes its data as a prop, so Astro server-renders the real grid and hydrates over it. The islands still re-fetch on mount, so live data wins over the snapshot.

- The build snapshot goes stale between deploys, so `.github/workflows/scheduled-rebuild.yml` redeploys daily (06:00 UTC) after `refreshSessionizeScheduled`.
- `lineup-build.ts` **soft-fails** — an `/api/lineup` outage must not block an unrelated hotfix. `scripts/verify-lineup-build.mjs` (`npm run verify:build`) then gates the deploy on the built output actually containing the speakers the API still serves, so a degraded build can never publish over live indexed content. It runs in both the merge and scheduled workflows.
- Ordering that used to be randomised per page load (`/sessions` grid, home speaker wall) is now rolled **once per build**. Rolling again on the client would either disagree with the server HTML (hydration mismatch) or re-order a grid mid-read. `shuffle()` lives in `src/lib/sessions.ts`.
- Under `A11Y_MOCK=1` the build-time fetch is skipped (no network in that job); the islands still get fixtures at runtime.

**Detail routes.** `/speakers/[slug]` and `/sessions/[slug]` are generated by `getStaticPaths` from the build lineup. Slugs come from `src/lib/slug.ts`, shared by the build and the browser so island hrefs always match emitted pages; on a collision every member of the group takes an id-hash suffix (handing the clean slug to whichever sorts first would let a removal move another entry into an indexed URL). The lineup cards are **anchors**, not buttons — they intercept the plain click to open the dialog but stay crawlable and middle-clickable. A speaker confirmed since the last build links to a page that doesn't exist yet; the click still opens the dialog, and the daily rebuild closes the gap.

**Structured data.** Event (home only) carries `performer` (speakers) and `geo`; `subEvent` and the per-session `Event` are emitted **only once `startsAt` is set**, because Google requires `startDate` and Sessionize leaves it empty until the timetable is fixed. Speaker pages carry `Person`, `/faq` carries `FAQPage`. Breadcrumbs walk every path segment; pass `breadcrumb` to `BaseLayout` for a real leaf name.

**Open Graph cards.** `src/lib/og-card.ts` renders one PNG per speaker and per session at build time (satori → resvg), served from `/og/speakers/<slug>.png` and `/og/sessions/<slug>.png` and wired through `BaseLayout`'s `ogImagePath` / `ogImageAltText`. Static pages keep `/og-image.jpg`. Gotchas: the fonts must be **TTF** (satori can't read the woff2 the Fonts API emits) and **static, not variable** (Google's `JetBrainsMono[wght].ttf` makes satori throw during layout); use **explicit column widths**, not `flexGrow`/`flexShrink`, or a long title silently collapses the portrait plate to zero width.

**Analytics events.** `trackEvent()` in `src/lib/firebase.ts`; `ClickTracking.astro` turns `data-track` / `data-track-*` attributes into GA4 events via one delegated listener, and `ConversionPing.astro` fires on the post-conversion landing pages. Events run under the cookieless Consent Mode default, so conversion counts stay complete for visitors who decline.

**Crawler policy.** `public/robots.txt` allows AI crawlers explicitly by name (reversible with a one-word edit). `/llms.txt` is generated (`src/pages/llms.txt.ts`) so its lineup section can't drift from the pages.
