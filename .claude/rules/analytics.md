---
paths:
  - "src/lib/firebase.ts"
  - "src/lib/analytics.ts"
  - "src/lib/consent.ts"
  - "src/lib/ads.ts"
  - "src/lib/ad-events.ts"
  - "src/lib/tracking-gates.ts"
  - "src/components/aether/CookieBanner.astro"
  - "src/lib/cookie-banner.ts"
  - "src/routes/thank-you.astro"
  - "src/routes/newsletter-subscription-thank-you.astro"
---

# Analytics (`src/lib/firebase.ts`)

GA4 via Firebase Analytics in **basic Google Consent Mode**: nothing loads and
nothing is sent to Google until the visitor accepts. `initAnalytics()` is a
no-op until `hasAnalyticsConsent()` (`src/lib/consent.ts`: `accepted` =
"Analytics only", or `accepted-marketing` = "Allow all"); the accept handler in `src/lib/cookie-banner.ts` (the banner's behaviour;
markup in `src/components/aether/CookieBanner.astro`) stores the decision
and calls
`trackPageView()`, which boots the tag. The boot pushes `consent: 'default'`
with `analytics_storage` granted and `ad_*` denied (GA4 is never used for
advertising; the Meta and LinkedIn tags are their own consent, "Ad tags"
below), then `initializeAnalytics()`.

Why not the cookieless "advanced" mode (PR #288 → this): GA4 surfaces
unconsented pings only through behavioral modeling, which needs ≥1000
consenting **and** ≥1000 non-consenting visitors a day on 7 of 28 days. This
site never qualifies (Reporting identity shows modeling inactive), so the
pings bought nothing — and the tag's own `page_view` (the one carrying
`_ss`/`_fv` and the campaign parameters) went out only cookieless and was
dropped. Consented visitors only, honestly counted, is the better deal.
Re-tested 2026-11-27 (ADR 0007, "Revisited"): Firebase Analytics writes a
Firebase Installations id to IndexedDB (`firebase-installations-database`)
the moment it loads, before any choice, and sends it as `_fid` with
cookieless hits too. So advanced mode is off the table while GA4 runs
through the Firebase SDK; it would need plain gtag.js.

Rules (each verified in-browser):

- `consent: 'default'` must precede `config`. Firebase `setConsent()` doesn't
  guarantee that, so `firebase.ts` uses its own gtag shim.
- gtag.js only honours commands pushed as an **`arguments` object**. Don't
  refactor the shim to a rest array.
- `initAnalytics()` memoises the **in-flight promise**, not just the instance
  — callers overlap. The consent gate sits *before* the memo, so a page-load
  call while undecided doesn't pin "not booted" for the accept that follows.
  Nothing else boots here: App Check is the callables' business, not the
  page's (below).
- The tag's own `config` page_view is off (`send_page_view: false`).
  `reportEntry()` sends the **entry page** captured at module load
  (`entryLocation`/`entryTitle`/`entryReferrer`, before `<ClientRouter />`
  rewrites `location.href`), then the current page if the visitor
  soft-navigated before accepting. A late accept still attributes the session
  to the URL they arrived on (`utm_*`, external referrer).
- **Host-gated** (`TRACKING_HOSTS` in `src/lib/tracking-gates.ts`;
  `PUBLIC_ANALYTICS_ALLOWED_HOSTS` overrides) — dev and previews send
  nothing. The ad tags share the gate.
- Hits leave gtag's queue a few seconds after an accept (batched with the
  engagement ping; gtag flushes on `pagehide`). gtag's scheduling, not ours.

**Withdrawing consent** (GDPR Art. 7(3)): every `[data-cookie-settings]`
button (the footer's About column, privacy policy §3) runs one delegated
click listener in `src/lib/cookie-banner.ts`. It `clearConsent()`s and shows the
banner, focused. After either accept the SDKs are already in the document and
cannot be unloaded, so instead it `deleteMarketingData()`s (the first-party
ad cookies in `MARKETING_COOKIES`, LinkedIn's `li_adsId` in localStorage) and
`deleteAnalyticsData()`s (`consent.ts`:
`_ga*` cookies on the host and each parent domain, the
`firebase-installations-database` IndexedDB, Performance's cached config in
localStorage, Crashlytics' session id in sessionStorage) and reloads. A
one-shot `sessionStorage` flag makes the fresh page delete once more (the
old page's tag can write a cookie on `pagehide`, and its open connection
blocks the IndexedDB delete) and focus the banner.
Nothing runs while the visitor decides again. A
new store set after consent is added to `deleteAnalyticsData()` and to the
privacy policy's table.

**The banner** shares the foot of the screen with focus: while it is up,
`--cookie-slip-h` on `<html>` (a `ResizeObserver`) drives
`scroll-padding-bottom` and the body's bottom padding, and a `focusin`
listener scrolls an element the slip covers into view (WCAG 2.4.11).
`Escape` declines only while the banner is visible and not `inert`: the open
mobile menu makes it inert, and that Escape closes the menu alone.

**Performance Monitoring** (`firebase/performance`): booted by
`schedulePerformance()` at the end of the GA4 boot, so it shares both gates
(consent + `ANALYTICS_HOSTS`) — it stores a Firebase Installations id in
IndexedDB, which needs consent like `_ga`. The SDK is a separate dynamic
chunk loaded on `requestIdleCallback` (5s timeout; `setTimeout` fallback).
A late boot still reports the entry page load and Web Vitals: the SDK reads
the buffered Performance API. Console: Firebase → Performance.

**Crashlytics** (`firebase/crashlytics`, a preview SDK): booted by
`scheduleCrashlytics()` next to Performance, so it shares both gates. It
stores the same Installations id and a session id in sessionStorage
(`firebasecrashlytics.sessionid`), and sends both with every report
([ADR 0015](../../docs/adr/0015-crashlytics-behind-the-consent-gate.md)).
`getCrashlytics()` boots with `captureUnhandledErrors: false`; our own
`error` and `unhandledrejection` listeners call `recordError()` with
`readableError()` (`src/lib/react-errors.ts`), which turns React's
"Minified React error #N" back into its text (the hydration codes; any
other keeps its number and link). Nothing else calls `recordError()`. It also sends one "Session created"
record per tab at boot, with no error, and flushes on `pagehide`. A separate dynamic chunk on idle (the
SDK brings OpenTelemetry), so an error thrown before the boot, or for a
visitor who has not accepted, is never reported. No `breadcrumbs()`: that
feature sends navigation, request and interaction trails. Never boots on
`/login/<code>`. No source maps are uploaded yet, so stacks are minified.
Console: Firebase → Crashlytics, after the project Owner has run
`firebase crashlytics:setup`.

**Page views under `<ClientRouter />`:** GA4 sees only what we send, never
`pushState`. `trackPageView()` runs on every `astro:page-load`: a no-op until
accepted and for the page the boot has just reported, otherwise a `page_view`
with explicit `page_location`/`page_title`/`page_referrer`.

**Sign-in link URLs never reach GA4, Performance or Crashlytics:** `/login/<code>`
carries a credential in the path. `sendPageView()` cuts it to `/login/`
(query and hash dropped) in `page_location` and `page_referrer`, and
`gtag('set')`s that URL for the page's later events. Performance Monitoring
reports `location.href` with no hook to rewrite it, so `schedulePerformance()`
never boots on that path; `scheduleCrashlytics()` follows the same rule.

**Conversion events**, all via `src/lib/analytics.ts`:

| Event | Where | Notes |
| --- | --- | --- |
| `begin_checkout` | `Tickets.tsx` Buy CTA (one per variant); `InviteCta.tsx` (adds `invite_member*`); both via `trackBeginCheckout()` in `checkout.ts` | ecommerce shape: `currency`, `value`, `items[]` (the one variant clicked, gross via `grossPrice()`) |
| `ticket_purchase_confirmed` | `/thank-you` | ti.to thank-you URL. Not GA4 `purchase` — redirect carries no `transaction_id`/`value` |
| `sign_up` (`method: 'newsletter'`) | `/newsletter-subscription-thank-you` | native POST to SmartEmailing; this page load is the signal |
| `generate_lead` | `InvoiceForm.tsx` on callable success | `value`/`currency` from the ti.to estimate |

- `analytics.ts` exists so components never statically import `firebase.ts`
  (would bundle the whole SDK). `track()` imports dynamically, never throws.
- `trackConversion(pathname, name)` guards path **and** repeats — an
  `astro:page-load` listener survives soft navigations.
- Mark the three conversions as key events in GA4 (README "Analytics").

**Ad tags** (`src/lib/ads.ts`, ADR 0016): the Meta Pixel and the LinkedIn
Insight Tag, only after "Allow all" (`hasMarketingConsent()`), on the
`TRACKING_HOSTS`, never on `/login/<code>`, and only when their build-time
ids are set (`PUBLIC_META_PIXEL_ID`, `PUBLIC_LINKEDIN_PARTNER_ID`,
`PUBLIC_LINKEDIN_CONVERSION_IDS`; repository variables, never in the repo).

- `initAds()` installs each tag's queue stub (the official snippets; Meta's
  queues the `arguments` object, like gtag) and loads its script at once,
  not on idle: a tag reads the page URL when its script runs. An event
  fired right after the accept queues.
  The consent and `/login/` gates sit before the memo, like `initAnalytics()`.
- Page views are ours: `trackAdPageView()` on every `astro:page-load`
  (from `cookie-banner.ts`, next to `trackPageView()`). Meta's own
  `pushState` tracking is off (`fbq.disablePushState`), so a soft
  navigation to `/login/<code>` is never reported. The Insight Tag counts
  the page it loads on; soft navigations after its script ran are
  `lintrk('track')`, earlier ones are left to it.
- Events ride `track()` in `analytics.ts`, which also hands them to
  `trackAdEvent()`; `ad-events.ts` maps them (pure, tested):
  `begin_checkout` → `InitiateCheckout`, `ticket_purchase_confirmed` →
  `Purchase` (no value), `generate_lead` → `Lead`, `sign_up` →
  `CompleteRegistration`; value and currency go together or not at all.
  LinkedIn gets a conversion only for an event with an id in
  `PUBLIC_LINKEDIN_CONVERSION_IDS`.
- A late "Allow all" after a soft navigation loses the entry URL for Meta
  (`fbclid`, `utm_*`): the pixel reads the current URL. GA4 keeps it.
- No server-side Conversions API and no GTM (brainstorm
  `2026-11-23-ads-conversion-tracking`).

**Data stores:** RTDB `/tickets` (ti.to cache, daily) and `/workshops`
(seats, registrations); Firestore `speakers`/`sessions`/`rooms` (Sessionize)
and `invoices`. Project `devfest-cz-app`,
site `devfest-public`.

**App Check** (reCAPTCHA Enterprise): committed public key `APPCHECK_SITE_KEY`
(`PUBLIC_FIREBASE_APPCHECK_SITE_KEY` overrides). Starts only through
`getFirebaseApp()`, the callables' entry: `InvoiceForm` on mount, the
workshop sign-in (`src/lib/workshops.ts`). Not gated on consent (security),
and never on a page without a callable form: reCAPTCHA is a Google script,
a frame and a third-party cookie (`_GRECAPTCHA`)
([ADR 0014](../../docs/adr/0014-app-check-only-where-a-callable-runs.md)).
Consumers: `submitInvoiceCallable` and `workshopRegistrationCallable`. Never
enforce on `ticketsWebhook` (external HMAC caller) or schedulers.
