---
paths:
  - "src/lib/firebase.ts"
  - "src/lib/analytics.ts"
  - "src/lib/consent.ts"
  - "src/components/CookieBanner.astro"
  - "src/pages/thank-you.astro"
  - "src/pages/newsletter-subscription-thank-you.astro"
---

# Analytics (`src/lib/firebase.ts`)

GA4 via Firebase Analytics in **basic Google Consent Mode**: nothing loads and
nothing is sent to Google until the visitor accepts. `initAnalytics()` is a
no-op while `readConsent()` (`src/lib/consent.ts`) isn't `accepted`; the
accept handler in `CookieBanner.astro` stores the decision and calls
`trackPageView()`, which boots the tag. The boot pushes `consent: 'default'`
with `analytics_storage` granted and `ad_*` denied (we never collect for
advertising), then `initializeAnalytics()`.

Why not the cookieless "advanced" mode (PR #288 → this): GA4 surfaces
unconsented pings only through behavioral modeling, which needs ≥1000
consenting **and** ≥1000 non-consenting visitors a day on 7 of 28 days. This
site never qualifies (Reporting identity shows modeling inactive), so the
pings bought nothing — and the tag's own `page_view` (the one carrying
`_ss`/`_fv` and the campaign parameters) went out only cookieless and was
dropped. Consented visitors only, honestly counted, is the better deal.

Rules (each verified in-browser):

- `consent: 'default'` must precede `config`. Firebase `setConsent()` doesn't
  guarantee that, so `firebase.ts` uses its own gtag shim.
- gtag.js only honours commands pushed as an **`arguments` object**. Don't
  refactor the shim to a rest array.
- `initAnalytics()` memoises the **in-flight promise**, not just the instance
  — callers overlap. The consent gate sits *before* the memo, so a page-load
  call while undecided doesn't pin "not booted" for the accept that follows.
  App Check init sits before the gate (security, every environment,
  regardless of consent).
- The tag's own `config` page_view is off (`send_page_view: false`).
  `reportEntry()` sends the **entry page** captured at module load
  (`entryLocation`/`entryTitle`/`entryReferrer`, before `<ClientRouter />`
  rewrites `location.href`), then the current page if the visitor
  soft-navigated before accepting. A late accept still attributes the session
  to the URL they arrived on (`utm_*`, external referrer).
- **Host-gated** (`ANALYTICS_HOSTS`; `PUBLIC_ANALYTICS_ALLOWED_HOSTS`
  overrides) — dev and previews send nothing.
- Hits leave gtag's queue a few seconds after an accept (batched with the
  engagement ping; gtag flushes on `pagehide`). gtag's scheduling, not ours.

**Page views under `<ClientRouter />`:** GA4 sees only what we send, never
`pushState`. `trackPageView()` runs on every `astro:page-load`: a no-op until
accepted and for the page the boot has just reported, otherwise a `page_view`
with explicit `page_location`/`page_title`/`page_referrer`.

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
