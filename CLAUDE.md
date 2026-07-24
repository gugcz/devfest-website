# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## PR conventions

- **Do not add a `## Test plan` section to PR descriptions.** The maintainer verifies changes manually and the checklist adds noise. Keep PR bodies to Summary / Why / Follow-up only.

# DevFest Website

Conference landing page for DevFest.cz 2026, built with Astro 6 and deployed to Firebase Hosting.

## Tech Stack

- **Framework:** Astro 6 with React islands (`@astrojs/react`)
- **Language:** TypeScript (strict mode)
- **Styling:** SCSS with CSS Modules for React components, global styles in `BaseLayout.astro`
- **Node:** >= 22.12.0

## Commands

| Command           | Action                   |
| ----------------- | ------------------------ |
| `npm run dev`     | Start dev server         |
| `npm run build`   | Build for production     |
| `npm run preview` | Preview production build |

No lint or test scripts are configured — TypeScript strict mode provides type safety.

## PR conventions

- **No "Test plan" sections in PR bodies.** This repo has no automated test suite and reviewers verify visually against deploy previews. PR descriptions should cover Summary / Why / Behavior / Files only — skip the test checklist entirely.

## Architecture

### Pages & Routing

Pages under `src/pages/` using Astro file-based routing:
- `/` — Main landing page (hero, countdown timer, newsletter form, footer)
- `/privacy-policy` — GDPR privacy policy
- `/newsletter-subscription-thank-you` — Post-signup confirmation
- `/thank-you` — Post-purchase confirmation (configure as ti.to event "thank you URL")

### Component Model

Static Astro components (`.astro`) for layout and non-interactive UI. React components (`.tsx`) with `client:load` for interactive features:
- `Countdown.tsx` — Live countdown to October 30, 2026, 9:00 AM CET; updates every second
- `NewsletterForm.tsx` — SmartEmailing integration for email capture with GDPR consent checkbox
- `Footer.tsx` — Social links (X, Facebook, Bluesky, LinkedIn, YouTube)
- `CookieBanner.astro` — Cookie consent stored in localStorage; dispatches `cookie-consent-accepted` DOM event

### Firebase Integration (`src/lib/firebase.ts`)

Firebase Analytics (GA4) runs in **Google Consent Mode** for every visitor, not just those who accept. `initAnalytics()` pushes a gtag `consent: 'default'` with **everything denied** onto the dataLayer *before* `getAnalytics()`, so GA4 boots cookieless — no `_ga` / `client_id`, no storage, only aggregated identifier-free pings. That yields basic traffic numbers from visitors who decline or never decide, which is the ePrivacy-exempt part. On accept, `grantAnalyticsConsent()` sends `consent: 'update'` with `analytics_storage: 'granted'` and GA4 switches to full measurement. `ad_*` stay denied permanently — we never collect for advertising.

Gotchas (both verified in-browser; getting either wrong silently writes `_ga` with consent denied):
- The `consent: 'default'` command **must** land in the dataLayer ahead of the `config` command. Firebase's own `setConsent()` does **not** guarantee that ordering, which is why `firebase.ts` pushes the default via its own gtag shim instead.
- gtag.js only honours commands pushed as an **`arguments` object** (Google's canonical snippet). A plain array is silently ignored — the consent default gets skipped and cookies are written anyway. The `gtag` shim in `firebase.ts` forwards `arguments` for this reason; don't "clean it up" into a rest array.

Firebase Realtime Database is configured but not currently used. Deployment targets the `devfest-public` site in the `devfest-cz-app` project via `firebase.json`.

App Check (reCAPTCHA Enterprise) runs in `getApp()` with a committed key (`APPCHECK_SITE_KEY` in `src/lib/firebase.ts`; `PUBLIC_FIREBASE_APPCHECK_SITE_KEY` overrides it — `src/env.d.ts` types it, `.env.example` documents it). The key is public like the Firebase `apiKey`. It initialises on load (whenever `getApp()` first runs — `initAnalytics` triggers it), **not** gated on cookie consent — App Check is a security mechanism (legitimate interest), not analytics. **No browser content read goes through the Firebase SDK anymore** (speakers/sessions/tickets all fetch the cached `/api/*` endpoints below), so App Check only matters for the App-Check-enforced `submitInvoiceRequest` callable; `titoWebhook` (external ti.to caller, HMAC-protected) must stay out. See README "App Check".

### Browser data access (cached `/api/*` functions)

**Every browser read of DB-backed data goes through a cached HTTP Cloud Function, never the Firebase client SDK.** This was a fix for a ~30s mobile load: the old client Firestore/RTDB reads blocked on an App Check (reCAPTCHA) token before the first read. A plain `fetch()` to an `/api/*` endpoint has no such wait, and stays compatible with enforcing App Check on Firestore/RTDB later (the functions read via the Admin SDK, which bypasses App Check + rules).

| Endpoint (Hosting rewrite) | Function | Reads | Browser caller |
| -------------------------- | -------- | ----- | -------------- |
| `/api/lineup` | `lineupApi` (`functions/src/lineup/`) | Firestore `speakers` + `sessions` | `src/lib/lineup.ts` → `Speakers`/`Sessions`/`SpeakersTeaser` |
| `/api/tickets` | `ticketsApi` (`functions/src/tickets/tickets-api.ts`) | RTDB `/tickets` | `src/lib/tito.ts::fetchTickets` → `Tickets`/`InvoiceForm` |

- Both are 2nd-gen `onRequest` (`invoker: 'public'`, region `europe-west1`, in the `website` functions codebase — deployed by `firebase-functions-merge.yml`). Two-layer caching: a `Cache-Control` `s-maxage` so Firebase Hosting's CDN answers most requests from the edge, plus a short in-instance memo so a warm instance coalesces revalidation reads. Lineup TTL is 1h (daily data); tickets 5min (sold-out surfaces faster). A failed read → `no-store` + 503; the browser shows its "unavailable" state.
- **Deploy split (no `pinTag`):** the `/api/*` rewrites carry **no** `pinTag`, so hosting deploys (live + PR preview) are pure hosting and never build/deploy the functions — that keeps preview channels from pushing PR function code toward production, and avoids running the functions predeploy `tsc` in the hosting-deploy container (which has no `functions/` devDeps). `lineupApi`/`ticketsApi` deploy **only** via `firebase-functions-merge.yml`; the rewrites route to whatever version is live. A first deploy can briefly 404 `/api/*` until the functions land (graceful — the island shows its unavailable state, a reload recovers), and a PR preview hits the **production** functions (so verify function CHANGES locally, not on the preview).
- The endpoints return raw docs (`{ id, ...fields }` / the RTDB cache verbatim); the browser reuses the existing `speakerFromDoc` / `sessionFromDoc` / `filterDisplayable` parsers so shape logic isn't duplicated in `functions/`.
- **a11y:** `scripts/a11y.mjs` serves `/api/lineup` + `/api/tickets` from `scripts/a11y-mocks/fixtures.mjs` (the islands `fetch` them, no SDK). The only Firebase module still mocked under `A11Y_MOCK` is `firebase/app-check` (App Check inits on load via analytics).

### ti.to Tickets pipeline

Visitor browsers read ticket data from RTDB `/tickets`. The static build never calls ti.to. Cloud Functions own all ti.to traffic.

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
    ├── refresh-cache.ts    # `refreshTitoCache`
    ├── notify-purchase.ts  # `titoWebhook`
    └── weekly-status.ts    # `weeklyTicketStatus` + `thursdayTicketStatus` (shared handler)
```

Functions exposed (region `europe-west1`):

| Name | Trigger | Effect |
| ---- | ------- | ------ |
| `refreshTitoCache` | `onSchedule('every 1 hours')` | Fetch releases → write RTDB `/tickets` |
| `titoWebhook` | `onRequest` (`invoker: 'public'`) | Verify `Tito-Signature` HMAC, post `registration.finished` to Slack (other events 200-acked and ignored) |
| `weeklyTicketStatus` | `onSchedule('every monday 09:00', Europe/Prague)` | Fetch live releases from ti.to and post sales summary to Slack |
| `thursdayTicketStatus` | `onSchedule('every thursday 18:00', Europe/Prague)` | Same handler as `weeklyTicketStatus` — second weekly status report |

Browser side: `src/components/Tickets.tsx` (and `InvoiceForm.tsx`'s price estimate) read the roadmap by `fetch()`ing the cached **`/api/tickets`** endpoint (`ticketsApi`), NOT the RTDB SDK — see "Browser data access" above. `src/lib/tito.ts` holds browser-safe helpers (types, `fetchTickets`, `filterDisplayable`, `checkoutUrl`, `formatPrice`). RTDB rules in `database.rules.json` (not wired into `firebase.json` — paste manually in console).

`/tickets` is read only by `ticketsApi` (Admin SDK, bypasses rules), so `tickets.\".read\"` no longer needs to be public for the website — the browser hits `/api/tickets`, not RTDB. Writes remain blocked for everyone; Cloud Functions write via Admin SDK. The root `.read`/`.write` default stays `false`. **Reminder:** `database.rules.json` is not wired into `firebase.json` — paste rule changes into the Firebase console manually.

Conventions / gotchas:
- New function in existing domain: add file → re-export in `tickets/index.ts`. New domain: new folder same shape + `export * from './<domain>/index.js'` in `src/index.ts`.
- `params.ts` is the single source of truth for secrets/strings. Don't duplicate the table elsewhere.
- TS imports inside `functions/` use `.js` suffixes (NodeNext module resolution).
- `titoWebhook` reads `req.rawBody` (Buffer) for HMAC, not `req.body`.
- ti.to Admin API v3.0 (stable; v3.1 is beta and we don't opt in) returns releases as a flag set (`sold_out`, `off_sale`, `expired`, `upcoming`, `archived`, `locked`, `secret`) plus `state_name`. There is **no** `sale_status` or `accessibility` field on the wire. `functions/src/tickets/tito-api.ts::deriveSaleStatus` synthesises a single `sale_status` string from those flags (`on_sale` / `sold_out` / `paused` / `not_yet_on_sale` / `ended` / `archived`) so the rest of the codebase has one stable thing to switch on. Sale window dates are `start_at` / `end_at` (not `sales_start` / `sales_end`).
- Visibility is enforced **at write time** in `refresh-cache.ts` via `isWebsiteVisible()` (`functions/src/tickets/tito-api.ts`). Only `secret` releases are dropped — every other state (on-sale, sold-out, paused via `off_sale`/`locked`, upcoming, expired, archived) is persisted so the UI can render the full pricing-wave roadmap. `Tickets.tsx` maps each `sale_status` to a badge (On sale / Sold out / Paused / Coming soon / Ended / Unavailable) and disables the Buy CTA when no variant in a group is purchasable. A `paused` release with zero tickets sold renders "Coming soon" instead of "Paused" (`releaseStatus()` in `src/lib/tito.ts`) — future waves are kept `off_sale` in ti.to with no scheduled `start_at`, so they never get the `upcoming` flag; visitors should read them as not-yet-started, not interrupted. The browser's `filterDisplayable` (`src/lib/tito.ts`) mirrors the same `secret`-only drop as defence-in-depth.
- Surviving releases render either an "On sale" badge + Buy CTA (`releaseStatus()` returns `purchasable: true`) or a dimmed "Sold out" badge + disabled CTA. Buy URL pattern: `https://ti.to/<account>/<event>/with/<release-slug>`.
- Default Cloud Functions service account has the IAM to write RTDB; no explicit creds needed at runtime.
- The Firebase project (`devfest-cz-app`) is **shared with the mobile app repo**, which deploys its own functions to the same project. To keep deploys isolated, this repo declares `"codebase": "website"` in `firebase.json`. The app repo must use a **different** codebase name (e.g. `app`) and **different function names**, otherwise deploys overwrite each other. `firebase deploy --only functions` only touches codebases declared in the local `firebase.json`.

Deploy steps, secret setup, and ti.to/Slack wiring live in [README.md](README.md).

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
├── submit.ts           # `submitInvoiceRequest`
├── process.ts          # `processInvoiceRequest`
└── poll.ts             # `pollPaidInvoices`
```

| Name | Trigger | Effect |
| ---- | ------- | ------ |
| `submitInvoiceRequest` | `onCall` (`enforceAppCheck: true`) | Validate form (honeypot), write `invoices/{id}` (status `pending`) |
| `processInvoiceRequest` | `onDocumentCreated('invoices/{id}')` | Price from ti.to → iDoklad contact + invoice → email it → status `invoiced` |
| `pollPaidInvoices` | `onSchedule('every 1 hours', Europe/Prague)` | For each `invoiced` doc, check iDoklad `PaymentStatus`; on paid mint 100%-off ti.to code + deliver → status `completed` |

Browser side: `src/components/InvoiceForm.tsx` (page `src/pages/invoice.astro`) calls the `submitInvoiceRequest` **callable** via the Functions SDK (`getFunctions(getFirebaseApp(), 'europe-west1')` → `httpsCallable`) — it never touches Firestore directly. No endpoint URL config.

Conventions / gotchas:
- **iDoklad has NO webhooks** — every integration polls. So payment is detected by `pollPaidInvoices` (hourly), which lists `status == 'invoiced'` docs and GETs each invoice's `PaymentStatus` (enum: Unpaid=0, **Paid=1**, PartialPaid=2, **Overpaid=3**). Completion flips the doc to `completed`, so each paid invoice is processed exactly once. There is no paid-webhook endpoint.
- **iDoklad OAuth2 Client Credentials.** Token at `https://identity.idoklad.cz/server/connect/token` (the API itself is `v3`), `application/x-www-form-urlencoded`, `grant_type=client_credentials`, `scope=idoklad_api`. This v1 endpoint needs only `client_id` + `client_secret` from the account (Nastavení → Aplikace → API) — the `/server/v2/connect/token` variant additionally demands an `application_id` from the iDoklad Developer portal, which we deliberately avoid. ~2h token, **no refresh**; `idoklad-api.ts` caches it. API base `https://api.idoklad.cz/v3`. Every response is wrapped in `{ Data, IsSuccess, Message }`; lists wrap `Data` as `{ Items, TotalItems, TotalPages }` — `unwrap()` peels it.
- **Invoice creation = Default→edit→Post.** `GET /IssuedInvoices/Default` returns a fully-defaulted template (CurrencyId, PaymentOptionId, NumericSequenceId, dates); we override `PartnerId` / `Items` / `DateOfMaturity` and POST it back (dropping the readonly `Prices` block). Same pattern for contacts via `GET /Contacts/Default` (inherits the account `CountryId`; the form's free-text country is stored but not mapped).
- **Item pricing:** line `UnitPrice` is **net**, `PriceType=WithoutVat (1)`, `VatRateType=Basic (1)` for 21 % (or `Zero (2)` when `INVOICE_VAT_RATE=0`). `releaseNetUnitPrice` backs net out of the ti.to gross. **No FX** — the 2026 event is CZK, so the 2018 EUR→CZK machinery (and the dead `exchangeratesapi.io`) is gone.
- **Invoice email** via `POST /Mails/IssuedInvoice/Send` (`SendToPartner: true`, `SendAttachment: true`) — PDF attached, company pays by bank transfer using the variable symbol. Failure is tolerated and Slack-relayed.
- **ti.to discount code** uses Admin API v3 `POST /discount_codes` with the body wrapped under `discount_code` (`type: 'PercentOffDiscountCode'`, `value: '100.0'`, `release_ids`). Scope = every release whose title contains `INVOICE_RELEASE_MATCH` (default `company funded`).
- **Firestore is server-only.** `firestore.rules` denies all client access; the Admin SDK bypasses it. Like `database.rules.json`, it is **not** wired into `firebase.json` (shared project — auto-deploy would clobber the app's ruleset). `lib/admin.ts` exposes `firestore()` alongside `db()`. The project must have a Firestore database provisioned (it previously used only RTDB).
- **App Check on `submitInvoiceRequest`.** It's a **callable** (`onCall`) with `enforceAppCheck: true` — the client Functions SDK auto-attaches the App Check token (reCAPTCHA Enterprise) and the framework rejects missing/invalid before the handler, blocking bots/curl from minting invoices/emails. The callable protocol handles CORS (no manual headers/preflight). `src/lib/firebase.ts` exposes `getFirebaseApp()` so the form can `getFunctions(app)` on the App-Check-initialised app. Do **not** enforce App Check on `titoWebhook` (external HMAC caller) or the schedulers.
- Discount-code email via Resend (`POST https://api.resend.com/emails`, `from` must be a verified-domain sender) is **optional** (`RESEND_API_KEY` is a string param defaulting to empty); when unset the code is still posted to Slack + stored on the doc.

### Styling Conventions

- Global CSS variables (colors, fonts) defined in `BaseLayout.astro`
- React component styles use `.module.scss` files co-located with each component
- Design uses dark theme (`#050505` bg, `#F0EDE6` text, `#CC0000` accent), film grain overlay, scanlines, and atmospheric red glow animations

### SEO & Metadata

`BaseLayout.astro` handles all meta tags, Open Graph/Twitter Card, and JSON-LD structured data (Event + WebSite schemas). Sitemap auto-generated via `@astrojs/sitemap`.
