# DevFest.cz 2026

The most original developer conference in Prague is back.

![DevFest.cz 2026](public/og-image.jpg)

DevFest.cz 2026 is a community-built conference and festival for developers, geeks, and tech enthusiasts focusing on Web/Mobile Development, Cybersecurity, AI/ML, and more — happening **October 30, 2026** in Prague, Czech Republic.

## Tech Stack

- **Framework:** [Astro](https://astro.build/) 7
- **Language:** TypeScript (strict mode)
- **Styling:** Sass — the design system is documented in [DESIGN.md](DESIGN.md)
- **UI:** React 19 (interactive islands)
- **Backend:** Firebase
- **Node:** 22 (see `.nvmrc`; `engine-strict` is on)
- **CSP:** `scripts/gen-csp-header.mjs` runs as a postbuild step, hashes every inline `<script>`/`<style>` in the built HTML, unions them into a single site-wide `Content-Security-Policy` response header, and strips Astro's per-page `<meta>` CSP (a meta CSP locks to the page that set it, so it doesn't survive `<ClientRouter/>` soft navigation). `script-src`/`style-src` carry no `'unsafe-inline'`. Adding a third-party script or endpoint means adding its host to `scripts/csp.config.mjs`.
- **`firebase.json` is generated, not committed:** `firebase.template.json` (committed) is the source of truth for hosting/functions config; `npm run build`'s postbuild step renders it into `firebase.json` with the real CSP hashes filled in. `firebase.json` is gitignored — **run `npm run build` before any `firebase` CLI command** (`firebase deploy`, `firebase emulators:start`, `firebase hosting:channel:deploy`, …), otherwise it's missing or stale. Edit `firebase.template.json`, never `firebase.json` directly.

[DESIGN.md](DESIGN.md) is the binding visual system — check it before styling anything.

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Accessibility audit (mock-data build + axe)
npm run a11y
```

`npm run dev` has no Hosting rewrite table, so it serves `/api/lineup` and
`/api/tickets` from the fixtures in `scripts/a11y-mocks/api.mjs` (otherwise the
lineup, agenda and ticket sections render "unavailable"). `npm run a11y` uses
the same fixtures.

`DEVFEST_LIVE_API=1 npm run dev` skips the fixtures and hits the deployed
functions — use it when changing the functions.

## ti.to Tickets — Cloud Functions + RTDB cache

The ticket section renders client-side from an RTDB cache, read through `/api/tickets` — never the Firebase SDK (see [CLAUDE.md](CLAUDE.md)). The static build never calls ti.to.

```
Cloud Scheduler (every 1 h, Europe/Prague)
  └─> Cloud Function `refreshTicketsScheduled` (europe-west1)
        ├─ fetch  https://api.tito.io/v3/<acc>/<evt>/releases
        └─ write  RTDB /tickets = { releases, accountSlug, eventSlug, fetchedAt }

Browser
  └─> Tickets.tsx (client:load)
        └─ fetch /api/tickets  ─→  Hosting rewrite  ─→  Cloud Function `ticketsApi` (europe-west1)
                                                              └─ read RTDB /tickets via Admin SDK (cached, 5-min edge TTL)
```

The Blaze plan is required for scheduled functions and Secret Manager.

> **Shared Firebase project.** `devfest-cz-app` also hosts the mobile app's functions. This repo declares `"codebase": "website"`; the app repo must use a different codebase and function names.

### Configure & deploy the functions

```bash
# Install function deps
npm --prefix functions install

# Set secrets (one-time each)
firebase functions:secrets:set TITO_API_TOKEN          # ti.to admin API
firebase functions:secrets:set TITO_WEBHOOK_SECRET     # ti.to webhook security token
firebase functions:secrets:set SLACK_WEBHOOK_URL       # Slack incoming-webhook URL

# Set ti.to slugs as non-secret params (functions/.env)
echo 'TITO_ACCOUNT_SLUG=your-account' >> functions/.env
echo 'TITO_EVENT_SLUG=your-event'      >> functions/.env

# Deploy
firebase deploy --only functions
```

The default Cloud Functions service account has the IAM needed to write RTDB; no extra service-account JSON is required at runtime.

### Functions

| Name | Trigger | Purpose |
| ---- | ------- | ------- |
| `refreshTicketsScheduled` | Cloud Scheduler, hourly | Sync ti.to releases → RTDB `/tickets` |
| `ticketsApi` | HTTPS, public (`/api/tickets`) | Serve the cached `/tickets` roadmap as JSON for the browser to `fetch()` (5-min edge TTL) |
| `ticketsWebhook` | HTTPS, public | Verifies `Tito-Signature` and posts purchase notifications to Slack |
| `weeklyTicketStatusScheduled` | Cloud Scheduler, Mondays `09:00 Europe/Prague` | Fetches live releases from ti.to and posts a sales summary to Slack |
| `thursdayTicketStatusScheduled` | Cloud Scheduler, Thursdays `18:00 Europe/Prague` | Same handler as `weeklyTicketStatusScheduled` — second weekly status report |

Wire up the webhook in ti.to → Customize → Webhook Endpoints:
1. Paste the deployed `ticketsWebhook` URL.
2. Copy ti.to's security token into `TITO_WEBHOOK_SECRET` (Secret Manager).
3. Subscribe to `registration.finished` — that event fires once per completed order and already lists every ticket in the registration, so subscribing to `ticket.completed` as well would double-post.

### RTDB rules

`database.rules.json` documents the required rules. Either paste it into the Firebase console, or add `"database": { "rules": "database.rules.json" }` to `firebase.template.json` and run `firebase deploy --only database`.

`/tickets` is read only by `ticketsApi` (Admin SDK), so `tickets.".read": true` is not required. Root default and all writes stay `false`. The cache omits raw counts (`quantity` / `quantity_sold` / `tickets_count`) and ships a coarse `has_sales` boolean — see `tito-api.ts::projectRelease`.

### App Check

reCAPTCHA Enterprise in `src/lib/firebase.ts`, committed public key
`APPCHECK_SITE_KEY`. Inits on page load. Only gated surface:
`submitInvoiceCallable` (`enforceAppCheck: true`). **Do not** enforce on
`ticketsWebhook` (HMAC, external caller) or the schedulers.

Setup:

1. **Register the key in Firebase App Check.** GCP console (project
   `devfest-cz-app`) → Security → reCAPTCHA holds the **score-based website key**
   (`6Ld…WChra`); add `devfest.cz` and any preview domains to its allowed
   domains. Then Firebase console → App Check → Apps: register the web app and
   point it at that reCAPTCHA Enterprise key. (Per-environment override: set
   `PUBLIC_FIREBASE_APPCHECK_SITE_KEY` in `.env` to use a different key ID.)
2. **Local dev.** Set `PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN=true` in `.env`, load
   the site, copy the debug token from the console, and register it under
   App Check → Apps → Manage debug tokens. Leave this empty in production.
3. **Watch metrics.** App Check → APIs shows the verified-vs-unverified split for
   Cloud Functions; confirm real invoice submissions are verified.

### Filtering

Only `secret` releases are dropped (`isWebsiteVisible`, again client-side). Every other state renders a badge in `Tickets.tsx`; `sale_status` is synthesised in `tito-api.ts::deriveSaleStatus`.

## Speakers & Sessions — Sessionize → Firestore → `/api/lineup`

`/speakers` and `/sessions` render client-side from **Firestore**, mirrored daily from **Sessionize** by a Cloud Function. Browsers never touch Sessionize; they read the cached `/api/lineup` endpoint, not the Firebase SDK.

```
Cloud Scheduler (every day 06:00, Europe/Prague)
  └─> Cloud Function `refreshSessionizeScheduled` (europe-west1)
        ├─ fetch  Sessionize "All data" JSON view (SESSIONIZE_ENDPOINT_ID)
        ├─ mirror speaker photos → Firebase Storage `speakers/{id}` (idempotent)
        └─ write  Firestore `speakers` + `sessions` (cross-referenced, atomic batches)

Browser
  └─> Speakers.tsx / Sessions.tsx (client:load)
        └─ fetch /api/lineup  ─→  Hosting rewrite  ─→  Cloud Function `lineupApi` (europe-west1)
                                                            └─ read Firestore speakers+sessions via Admin SDK (cached, 1-h edge TTL)
```

### Functions

| Name | Trigger | Purpose |
| ---- | ------- | ------- |
| `refreshSessionizeScheduled` | Cloud Scheduler, daily 06:00 | Sync Sessionize → Storage photos + Firestore `speakers`/`sessions` |
| `lineupApi` | HTTPS, public (`/api/lineup`) | Serve `{ speakers, sessions }` as JSON for the browser to `fetch()` (15-min edge TTL) |

### Config

```bash
firebase functions:secrets:set SESSIONIZE_ENDPOINT_ID   # Sessionize JSON API endpoint id (or full URL)
```

Must be a **JSON API** endpoint ("All data" / "Speakers" view; an embed id returns HTML). Photos are mirrored to Firebase Storage. Requires the Firestore database.

## Company invoices — iDoklad invoice-first flow

ti.to only takes cards; some companies must pay by bank transfer against an invoice. `/invoice` lets them request one; once paid, we mint a 100%-off ti.to code so they can claim the tickets.

```
Browser  /invoice  (InvoiceForm, client:load)
  └─> submitInvoiceCallable (callable, validates) → Firestore invoices/{id} (status: pending)

Firestore onCreate
  └─> processInvoiceTrigger (europe-west1)
        ├─ claim pending → processing (transaction; a redelivered event is a no-op)
        ├─ ti.to:   read company-funded release → price (CZK, no FX)
        ├─ iDoklad: find/create contact → create issued invoice → email it (PDF attached)
        └─ invoices/{id} = { status: invoiced, idokladInvoiceId, variableSymbol, … }

Cloud Scheduler (hourly) — iDoklad has NO webhooks
  └─> pollPaidInvoicesScheduled (europe-west1)
        ├─ for each `invoiced` doc → GET iDoklad PaymentStatus
        └─ if paid:
             ├─ ti.to: create 100%-off discount_code scoped to company-funded releases
             ├─ email the code (Resend, optional) + post to Slack
             └─ invoices/{id} = { status: completed, discountCode, discountLink }
```

The browser never touches Firestore — it calls `submitInvoiceCallable`, so `invoices` stays server-only and input is validated before reaching iDoklad.

### Functions

| Name | Trigger | Purpose |
| ---- | ------- | ------- |
| `submitInvoiceCallable` | Callable (App Check enforced, single-use tokens) | Validate the form (honeypot), apply the global + per-company throttles, write `invoices/{id}` |
| `processInvoiceTrigger` | Firestore onCreate `invoices/{id}` | Create the iDoklad contact + issued invoice and email it |
| `pollPaidInvoicesScheduled` | Cloud Scheduler, hourly | Check unpaid invoices' iDoklad PaymentStatus; on paid, mint + deliver the 100%-off ti.to code |

> iDoklad has no webhooks — payment is polled hourly, so a paid invoice is claimed up to ~1 h later.

> `invoiceRateLimits` (the per-company throttle) writes an `expiresAt` timestamp. Set a Firestore **TTL policy** on that collection with field `expiresAt` (console → Firestore → TTL) so spent windows are deleted; the code does not depend on it, the collection just grows without it.

> **Abuse limits.** App Check tokens are single-use (`consumeAppCheckToken` + `limitedUseAppCheckTokens` in `InvoiceForm.tsx`), so every submit is its own reCAPTCHA assessment. On top: a global ceiling of 20 requests per hour across all companies (`GLOBAL_LIMIT_MAX` in `submit.ts` — every request mints an iDoklad invoice and an email) and 3 per hour per (IČO, email). Hitting either returns `resource-exhausted`; the form tells the visitor to retry in an hour.

> **Existing iDoklad contacts are read, never written.** An IČO is public data, so the form must not be able to rewrite a customer's stored email or address. When an IČO already exists in iDoklad the contact is reused as-is, the invoice carries its stored details, and the mail goes to the *submitted* address only (`SendToPartner: false`). The Slack line lists which submitted fields differ from the stored record (`contactDiffers` on the doc) so a human decides whether the company moved or a stranger typed someone else's IČO.

### Secrets & config

All credentials are secrets (Secret Manager) — set each once:

```bash
firebase functions:secrets:set IDOKLAD_CLIENT_ID      # iDoklad → Settings → API
firebase functions:secrets:set IDOKLAD_CLIENT_SECRET
firebase functions:secrets:set RESEND_API_KEY         # discount-code email (Slack fallback if empty)
```

Plus the tickets-domain secrets `TITO_API_TOKEN` and `SLACK_WEBHOOK_URL`, and the string params `TITO_ACCOUNT_SLUG` / `TITO_EVENT_SLUG` (`functions/.env`).

Everything else is a **code constant** in `functions/src/invoice/params.ts` (no env, nothing to set): `INVOICE_RELEASE_MATCH` (`company funded`), `INVOICE_VAT_RATE` (`21`), `INVOICE_DUE_DAYS` (`14`), `INVOICE_FROM_EMAIL` (`devfest@gug.cz`), `INVOICE_FROM_NAME`. Change them there and redeploy.

The invoice **price is taken automatically** from the active ti.to release whose title contains `INVOICE_RELEASE_MATCH` — there is no manual price anywhere.

### Wiring

- **iDoklad OAuth:** iDoklad → Settings → API → client credentials into the secrets above. Token endpoint and lifetime: [`.claude/rules/invoices.md`](.claude/rules/invoices.md).
- **Invoice email** is sent by iDoklad (PDF attached, pay by bank transfer). If it fails, the invoice number goes to Slack for manual relay. Copy: `buildInvoiceEmail` in `functions/src/invoice/email.ts`.
- **Discount-code email:** branded HTML from `email-template.ts`. Preview by building `functions/` and rendering `buildDiscountEmail(...).html`.
- **Invoice fields** are seeded from `GET /IssuedInvoices/Default`; contact `CountryId` from `GET /Contacts/Default` (free-text country stored, not mapped; foreign companies handled manually).
- **ti.to** needs release(s) whose title contains `INVOICE_RELEASE_MATCH` (`company funded`); their price drives the invoice and the code is scoped to them.
- **Frontend:** `submitInvoiceCallable` via `getFunctions(app, 'europe-west1')` → `httpsCallable`. App Check enforced; for local dev set `PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN` and register the token.

### Firestore rules

> **One-time setup:** create a **Firestore database (Native mode)**. Backs `invoices` and the Sessionize sync.

`firestore.rules` denies all client access. Not wired into `firebase.json` (ruleset is project-global, shared with the app) — merge the `invoices` block in the console manually.

## Analytics (GA4)

Firebase Analytics, measurement ID `G-L5NK2S2EZ0`, in Google Consent Mode. Architecture and gotchas: [`.claude/rules/analytics.md`](.claude/rules/analytics.md). This section is the console-side setup, **not** in the repo.

- **Mark conversions as key events.** GA4 → Admin → Events: `ticket_purchase_confirmed`, `sign_up` (newsletter), `generate_lead` (company invoice). `begin_checkout` is a recommended ecommerce event and needs no marking; pair it with `ticket_purchase_confirmed` for checkout drop-off.
- **Register invitation parameters as custom dimensions.** GA4 → Admin → Custom definitions → two event-scoped dimensions: `invite_member` (the `team.json` id) and `invite_member_name`. GA4 does not report on unregistered custom parameters, and registration is not retroactive — do it before the links go out.
- **No revenue in reports.** ti.to's thank-you redirect carries no order id or amount, so `ticket_purchase_confirmed` isn't GA4's `purchase` and has no value. Revenue lives in ti.to. `begin_checkout` and `generate_lead` carry `value` (gross CZK), so *intent* is measurable.
- **Consent Mode is the source of truth** — no second GA4 tag, no GTM container. A declining visitor produces cookieless, identifier-free pings by design (aggregate-only).
- **Development traffic is excluded in code**, not by a GA4 filter: measurement is limited to `devfest.cz` (and subdomains) plus `devfest-public.web.app` / `devfest-public.firebaseapp.com`. `npm run dev` and preview channels send nothing. To measure a preview, build with `PUBLIC_ANALYTICS_ALLOWED_HOSTS=<host>`.
- **Verifying a change** needs a real host: GA4 DebugView, or devtools Network filtered to `/g/collect`. EEA traffic can route to `region1.google-analytics.com`, which is why the CSP `connect-src` (`csp` in `astro.config.mjs`) allows `https://*.google-analytics.com`.

## Key Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with countdown and newsletter signup |
| `/speakers` | Speaker lineup (reads `/api/lineup`) |
| `/sessions` | Session schedule (reads `/api/lineup`) |
| `/agenda` | Conference-day timetable — room grid on wide screens, time-ordered list on a phone or a single-room day (reads `/api/lineup`) |
| `/invoice` | Request a company invoice to buy tickets by bank transfer |
| `/partners` | Sponsors & partners |
| `/press`, `/press/downloads` | Press kit and downloadable assets |
| `/team` | Organizing team |
| `/contact` | Contact page |
| `/faq` | Frequently asked questions |
| `/attending` | "I'm attending" share-card generator (client-side canvas → PNG) |
| `/privacy-policy` | GDPR privacy policy |
| `/newsletter-subscription-thank-you` | Post-signup confirmation |
| `/thank-you` | Post-purchase confirmation (ti.to "thank you URL") |
| `/404` | Not-found page |

## Links

- Website: [devfest.cz](https://devfest.cz)
- Last year's edition: [2025.devfest.cz](https://2025.devfest.cz)
