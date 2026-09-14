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
