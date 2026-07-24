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

App Check (reCAPTCHA Enterprise) runs in `getApp()` with a committed key (`APPCHECK_SITE_KEY` in `src/lib/firebase.ts`; `PUBLIC_FIREBASE_APPCHECK_SITE_KEY` overrides it — `src/env.d.ts` types it, `.env.example` documents it). The key is public like the Firebase `apiKey`. Tokens already attach to RTDB reads, but reads keep working until **enforcement** is toggled on for Realtime Database in the Firebase console (do that only after metrics show real traffic is verified). It runs unconditionally, **not** gated on cookie consent, because RTDB reads in `Tickets.tsx` fire on mount before any consent — App Check is a security mechanism (legitimate interest), not analytics. Only RTDB `/tickets` is in scope; `titoWebhook` (external ti.to caller, HMAC-protected) must stay out. See README "App Check".

### Speakers & Sessions lineup (SSR)

`/speakers` and `/sessions` are **server-rendered on demand**, NOT client Firestore reads. The daily `refreshSessionize` Cloud Function mirrors Sessionize into the public-read Firestore `speakers` / `sessions` collections; the two routes read them **server-side via the Admin SDK** (which bypasses App Check + rules), so the grid ships in the initial HTML and mobile never waits on a reCAPTCHA/App Check token. This was a fix for a ~30s mobile load caused by the old client `onSnapshot` reads blocking on the App Check token (see `docs/plan/2026-07-24-fix-speakers-sessions-ssr-plan.md`). It is deliberately compatible with **enforcing App Check on Firestore** — the intended follow-up (gated on a staging test that the Admin read is unaffected).

Wiring / gotchas:
- **Node adapter, hybrid.** `astro.config.mjs` adds `@astrojs/node` (`mode: 'middleware'`); `output` stays `'static'`. Only `speakers.astro` + `sessions.astro` carry `export const prerender = false` (must be a **literal** — Astro's prerender detection is static, so a non-literal silently falls back to prerendering). The build therefore splits into `dist/client` (static/prerendered) and `dist/server` (the SSR handler); Hosting `public` is **`dist/client`**.
- **`renderPages` function.** A 2nd-gen `onRequest` in `ssr/` (codebase **`website-ssr`**, region `europe-west1`, `invoker: 'public'`, `minInstances: 1` so no cold start, `maxInstances: 10` shared-billing cap). It wraps the pre-built Astro handler (`dist/server/entry.mjs`), staged into `ssr/server` by the `firebase.json` `predeploy` (`cp` only — the site build runs on the CI runner, never in the deploy container). `firebase.json` `rewrites` send `/speakers` + `/sessions` here (`pinTag: true`). Deployed by `firebase-hosting-merge.yml` (`--only functions:website-ssr,hosting`, functions first so the rewrite target exists). **A PR preview channel pins the *production* renderPages** — verify SSR-route changes via a local render, not the preview.
- **firebase-admin is a SECOND Admin runtime** (`src/lib/firebase-admin.ts`), distinct from `functions/src/lib/admin.ts`; it's bundled into the Astro SSR output (kept `external` in Vite so its native/gRPC bits survive) and installed from `ssr/package.json`. It's server-only (an `import.meta.env.SSR` guard fails loudly if a client island imports it).
- **Homepage teaser** (`SpeakersTeaser`) reads the roster at **build time** (Admin SDK, `/` stays prerendered) and gets it as a prop. `SessionDetail`'s speaker drill-down reads a server-provided `speakersById` map, not Firestore. **No island reads Firestore** anymore, so `firebase/firestore` is out of the client bundle and App Check no longer inits on the content path.
- **Cache + failure.** A populated render sets `Cache-Control: public, s-maxage=…` (see `src/lib/ssr-cache.ts`); a failed/empty read is `no-store` + HTTP 503 so a transient blip is never cached or indexed. The two routes are excluded from hover-prefetch (`data-astro-prefetch="false"`) so a hover can't trigger an SSR invocation.
- **a11y build.** `npm run a11y` (`A11Y_MOCK=1`) aliases `firebase-admin` to a fixture replayer (`scripts/a11y-mocks/`) so the reads are deterministic, and `scripts/a11y.mjs` runs the built SSR handler (the static file server can't render on-demand routes).

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

Browser side: `src/components/Tickets.tsx` subscribes to `/tickets` via `firebase/database`'s `onValue`. `src/lib/tito.ts` holds browser-safe helpers (types, `filterDisplayable`, `checkoutUrl`, `formatPrice`). RTDB rules in `database.rules.json` (not wired into `firebase.json` — paste manually in console).

`/tickets` is publicly readable (`tickets.\".read\": true` in `database.rules.json`) so the browser `Tickets.tsx` subscriber can render live release data. Writes remain blocked for everyone; Cloud Functions write via Admin SDK (which bypasses rules). The root `.read`/`.write` default stays `false`. **Reminder:** `database.rules.json` is not wired into `firebase.json` — paste rule changes into the Firebase console manually.

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
