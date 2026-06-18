# DevFest.cz 2026

The most original developer conference in Prague is back.

![DevFest.cz 2026](public/og-image.jpg)

DevFest.cz 2026 is a community-built conference and festival for developers, geeks, and tech enthusiasts focusing on Web/Mobile Development, Cybersecurity, AI/ML, and more — happening **October 30, 2026** in Prague, Czech Republic.

## Tech Stack

- **Framework:** [Astro](https://astro.build/) 6
- **Language:** TypeScript (strict mode)
- **Styling:** Sass
- **UI:** React 19 (interactive islands)
- **Backend:** Firebase
- **Node:** >= 22.12.0

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
```

## ti.to Tickets — Cloud Functions + RTDB cache

The "Get your ticket" section is rendered client-side from a Firebase Realtime Database cache. The static build never calls ti.to, and a scheduled Cloud Function keeps the cache fresh.

```
Cloud Scheduler (every 1 h, Europe/Prague)
  └─> Cloud Function `refreshTitoCache` (europe-west1)
        ├─ fetch  https://api.tito.io/v3/<acc>/<evt>/releases
        └─ write  RTDB /tickets = { releases, accountSlug, eventSlug, fetchedAt }

Browser
  └─> Tickets.tsx (client:load)
        └─ subscribe RTDB /tickets via firebase/database onValue
```

The Blaze plan is required for scheduled functions and Secret Manager.

> **Shared Firebase project.** `devfest-cz-app` also hosts the mobile app's Cloud Functions from a separate repo. This repo declares `"codebase": "website"` in `firebase.json` so deploys here only touch our own functions. The app repo must use a different codebase name and avoid colliding function names.

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
| `refreshTitoCache` | Cloud Scheduler, hourly | Sync ti.to releases → RTDB `/tickets` |
| `titoWebhook` | HTTPS, public | Verifies `Tito-Signature` and posts purchase notifications to Slack |
| `weeklyTicketStatus` | Cloud Scheduler, Mondays `09:00 Europe/Prague` | Fetches live releases from ti.to and posts a sales summary to Slack |
| `thursdayTicketStatus` | Cloud Scheduler, Thursdays `18:00 Europe/Prague` | Same handler as `weeklyTicketStatus` — second weekly status report |

Wire up the webhook in ti.to → Customize → Webhook Endpoints:
1. Paste the deployed `titoWebhook` URL.
2. Copy ti.to's security token into `TITO_WEBHOOK_SECRET` (Secret Manager).
3. Subscribe to `registration.finished` — that event fires once per completed order and already lists every ticket in the registration, so subscribing to `ticket.completed` as well would double-post.

### RTDB rules

`database.rules.json` documents the required rules. Either paste it into the Firebase console, or add `"database": { "rules": "database.rules.json" }` to `firebase.json` and run `firebase deploy --only database`.

`/tickets` is publicly readable (`tickets.".read": true`) so the browser `Tickets.tsx` subscriber can render live release data; the root default and all writes stay `false`. The Cloud Functions write the cache via the Admin SDK (which bypasses rules). Note the projected cache deliberately omits raw inventory counts (`quantity` / `quantity_sold` / `tickets_count`) and ships only a coarse `has_sales` boolean, so public reads can't derive per-wave sales velocity — see `functions/src/tickets/tito-api.ts::projectRelease`.

### App Check

App Check attests that RTDB reads come from the real site, not a scraper. The
web client uses **reCAPTCHA Enterprise** in `src/lib/firebase.ts` with the key
committed (`APPCHECK_SITE_KEY` — public, like the Firebase `apiKey`). App Check
tokens already attach to RTDB reads; reads keep working until you toggle
enforcement on, so it's safe to ship before enforcing.

**Scope.** Only the public surface needs it: RTDB `/tickets`, which the browser
reads directly. The `titoWebhook` function is called by ti.to (an external
server that cannot mint an App Check token) and is already protected by an HMAC
signature — **do not** enforce App Check on it. The scheduled functions take no
public traffic, so App Check is irrelevant there.

Remaining steps (do 1–3 before turning on enforcement):

1. **Register the key in Firebase App Check.** GCP console (project
   `devfest-cz-app`) → Security → reCAPTCHA holds the **score-based website key**
   (`6Ld…WChra`); add `devfest.cz` and any preview domains to its allowed
   domains. Then Firebase console → App Check → Apps: register the web app and
   point it at that reCAPTCHA Enterprise key. (Per-environment override: set
   `PUBLIC_FIREBASE_APPCHECK_SITE_KEY` in `.env` to use a different key ID.)
2. **Local dev.** Set `PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN=true` in `.env`, load
   the site, copy the debug token from the console, and register it under
   App Check → Apps → Manage debug tokens. Leave this empty in production.
3. **Watch metrics.** With tokens flowing but enforcement still off, App Check →
   APIs shows the verified-vs-unverified split for Realtime Database. Wait until
   nearly all real traffic is verified.
4. **Enforce.** Once the metrics look clean, turn on enforcement for **Realtime
   Database** in App Check → APIs. This is a console toggle — no code or
   `database.rules.json` change. Leave Cloud Functions enforcement off.

### Filtering

Only releases that are on sale or sold out are displayed. Archived, secret, expired, upcoming, paused (`off_sale` / `locked`) releases are dropped server-side before writing to RTDB, with the same predicate applied again client-side as defence-in-depth. A single `sale_status` string is synthesised from ti.to's flag set (`sold_out`, `off_sale`, `expired`, `upcoming`, `archived`, `locked`) — see `functions/src/tickets/tito-api.ts::deriveSaleStatus`.

## Company invoices — iDoklad invoice-first flow

Some companies must pay by bank transfer against a real invoice before they can attend — ti.to only takes cards. The `/invoice` page lets them request an invoice; once it's paid we mint a 100%-off ti.to code so they can claim the tickets they already paid for.

```
Browser  /invoice  (InvoiceForm, client:load)
  └─> submitInvoiceRequest (callable, validates) → Firestore invoices/{id} (status: pending)

Firestore onCreate
  └─> processInvoiceRequest (europe-west1)
        ├─ ti.to:   read company-funded release → price (CZK, no FX)
        ├─ iDoklad: find/create contact → create issued invoice → email it (PDF attached)
        └─ invoices/{id} = { status: invoiced, idokladInvoiceId, variableSymbol, … }

Cloud Scheduler (hourly) — iDoklad has NO webhooks
  └─> pollPaidInvoices (europe-west1)
        ├─ for each `invoiced` doc → GET iDoklad PaymentStatus
        └─ if paid:
             ├─ ti.to: create 100%-off discount_code scoped to company-funded releases
             ├─ email the code (Resend, optional) + post to Slack
             └─ invoices/{id} = { status: completed, discountCode, discountLink }
```

The browser never touches Firestore — it calls the `submitInvoiceRequest` callable, so the `invoices` collection stays server-only and input is validated before reaching iDoklad.

### Functions

| Name | Trigger | Purpose |
| ---- | ------- | ------- |
| `submitInvoiceRequest` | Callable (App Check enforced) | Validate the form (honeypot) and write `invoices/{id}` |
| `processInvoiceRequest` | Firestore onCreate `invoices/{id}` | Create the iDoklad contact + issued invoice and email it |
| `pollPaidInvoices` | Cloud Scheduler, hourly | Check unpaid invoices' iDoklad PaymentStatus; on paid, mint + deliver the 100%-off ti.to code |

> **Why a poller, not a webhook:** iDoklad has no webhooks (every integration polls). So payment is detected by an hourly scheduled check of each outstanding invoice's `PaymentStatus`, not pushed. A paid invoice is therefore claimed up to ~1 h after payment.

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

- **iDoklad OAuth:** iDoklad → Settings → API, create client credentials and copy the client id/secret into the secrets above. The token is issued by `https://identity.idoklad.cz/server/connect/token` (scope `idoklad_api`) — this v1 endpoint needs only client id + secret (no `application_id`/Developer-portal app); lasts ~2 h, no refresh, cached in-process. No webhook to configure — payment is polled.
- **Invoice email** is sent by iDoklad itself (`POST /Mails/IssuedInvoice/Send`, PDF attached); the company pays by bank transfer using the variable symbol on the invoice. If iDoklad can't send mail, the run still succeeds and the invoice number is posted to Slack to relay manually.
- **Invoice fields** are seeded from iDoklad's `GET /IssuedInvoices/Default` template (currency, payment option, numeric sequence, dates) and overridden with the partner, line, and maturity — so account-specific ids are never hardcoded. The contact's `CountryId` likewise comes from `GET /Contacts/Default` (the form's free-text country is stored but not mapped to an iDoklad country id; foreign companies are handled manually).
- **ti.to** must have release(s) whose title contains `INVOICE_RELEASE_MATCH` (default `company funded`). Their price drives the invoice amount and the 100%-off code is scoped to them.
- **Frontend call:** the form invokes the `submitInvoiceRequest` **callable** via the Functions SDK (`getFunctions(app, 'europe-west1')` → `httpsCallable`). No endpoint URL to configure — the SDK resolves it from the Firebase config and the same FirebaseApp that App Check is initialised on.
- **App Check (abuse protection):** `submitInvoiceRequest` is a callable with `enforceAppCheck: true`. The Functions SDK auto-attaches the App Check token (reCAPTCHA Enterprise) and the framework rejects any request without a valid one *before* the handler runs — so bots/curl can't trigger invoices or emails. The callable protocol also handles CORS. For local dev, set `PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN` and register the printed debug token (App Check → Apps → Manage debug tokens).

### Firestore rules

> **One-time setup:** the project currently uses only RTDB. Create a **Firestore database (Native mode)** in the Firebase console once, or `submitInvoiceRequest` writes (and the `processInvoiceRequest` trigger) will fail.

`firestore.rules` denies all client access to `invoices` (company PII; written/read only by Cloud Functions via the Admin SDK, which bypasses rules). It is **not** wired into `firebase.json` on purpose — the Firestore ruleset is project-global and the project is shared with the mobile app, so auto-deploying would clobber the app's rules. Merge the `invoices` block into the project's live ruleset in the Firebase console (same manual approach as `database.rules.json`).

## Project Structure

```
src/
  pages/        # File-based routing (.astro pages)
  components/   # Reusable UI components
  layouts/      # Page layouts
public/         # Static assets (images, favicon, etc.)
astro.config.mjs
tsconfig.json
```

## Key Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with countdown and newsletter signup |
| `/invoice` | Request a company invoice to buy tickets by bank transfer |
| `/privacy-policy` | GDPR privacy policy |
| `/newsletter-subscription-thank-you` | Post-signup confirmation |

## Links

- Website: [devfest.cz](https://devfest.cz)
- Last year's edition: [2025.devfest.cz](https://2025.devfest.cz)
