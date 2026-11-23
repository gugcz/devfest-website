# Plan: Meta Pixel + LinkedIn Insight Tag behind a marketing consent

## Context

An ads consultant asked for conversion tracking in Meta and LinkedIn and for remarketing audiences.
Brainstorm: `docs/brainstorm/2026-11-23-ads-conversion-tracking-brainstorm-doc.md`.
The maintainer picked variant B: load both tags directly, no GTM, no server-side API.

Decisions (maintainer, 2026-11-24):
- The slip gets three equal buttons: "Allow all", "Analytics only", "Decline".
- One marketing choice covers Meta and LinkedIn together.
- Build only after the slip redesign PR (`feat/cookie-slip-advanced-consent`) is merged. Branch from `main` then.
- Pixel and conversion IDs never go into the repo. They come from build-time env vars.

Outcome: consenting visitors are counted in Meta and LinkedIn for five events, and they feed the visitor audiences there.
Visitors who decline, choose analytics only, or have not decided yet load nothing from Meta or LinkedIn.

## Prerequisite

The slip redesign (`feat/cookie-slip-advanced-consent`) is merged.
Its brainstorm draft copy says "No ads"; that line changes here.

## Build (after the slip PR merges)

Branch `feat/ads-conversion-pixels` from `main`. One commit per phase.

### Phase 1: consent gets a marketing level
- `src/lib/consent.ts`:
  - add `'accepted-marketing'` to `ConsentDecision`;
  - existing `'accepted'` keeps meaning analytics only, so old visitors never get ads by default;
  - add `hasAnalyticsConsent()` (accepted or accepted-marketing) and `hasMarketingConsent()`;
  - add `deleteMarketingData()` for first-party `_fbp`, `_fbc` and LinkedIn first-party cookies.
    Verify the cookie names on a live test first.
- `src/lib/firebase.ts`: the gate in `initAnalytics()` uses `hasAnalyticsConsent()` instead of `=== 'accepted'`.
- Move the private `isAnalyticsHost()` and `isAppLinkPath()` / `redactAppLink()` into `src/lib/tracking-gates.ts`.
  Then `ads.ts` can share them without importing the Firebase SDK.
- Tests: extend `src/lib/consent.test.ts`; add `tracking-gates.test.ts`.

### Phase 2: the slip asks three ways
- `src/components/aether/CookieBanner.astro` + `src/lib/cookie-banner.ts`, on top of the merged redesign:
  - three equal buttons;
  - "Allow all" stores `accepted-marketing`, "Analytics only" stores `accepted`;
  - Escape still declines;
  - withdrawal (`[data-cookie-settings]`) also runs `deleteMarketingData()` before the reload.
- Final copy and look follow the merged slip and `docs/design.md` (Impeccable loop, `.claude/rules/design.md`).

### Phase 3: `src/lib/ads.ts`
- `initAds()` sits behind four gates:
  - marketing consent;
  - the production host gate;
  - not on `/login/<code>`;
  - IDs present (`PUBLIC_META_PIXEL_ID`, `PUBLIC_LINKEDIN_PARTNER_ID`).
  If any gate fails, it does nothing. Dev, previews and the a11y build send nothing.
- Loading:
  - Meta's `fbq` stub and `connect.facebook.net/.../fbevents.js`;
  - LinkedIn's `_linkedin_partner_id` and `snap.licdn.com/.../insight.min.js`.
  Both load on idle, like `schedulePerformance()`.
  The in-flight promise is memoised, as in `initAnalytics()`.
- Page views: Meta `PageView` on every `astro:page-load`.
  Hook it in `cookie-banner.ts` next to `trackPageView()`.
  LinkedIn's soft-navigation behaviour: verify at build time.
- A pure mapper `adEventsFor(name, params)` turns our event names into Meta and LinkedIn calls:
  - `begin_checkout` → `InitiateCheckout` + value;
  - `ticket_purchase_confirmed` → `Purchase`, no value;
  - `generate_lead` → `Lead` + value;
  - `sign_up` → `CompleteRegistration`.
  LinkedIn conversion IDs come from `PUBLIC_LINKEDIN_CONVERSION_IDS` (`event:id,…`).
  An unmapped event or a missing ID is skipped.
- `src/lib/analytics.ts`: `track()` also dynamically imports `ads.ts` and forwards.
  This means no call-site changes in `Tickets.tsx`, `InviteCta.tsx`, `InvoiceForm.tsx` or the thank-you pages.
  `trackConversion()`'s once-per-document guard covers both tools.
- `src/env.d.ts`: declare the three env vars.
- Tests: `ads.test.ts` for the mapper and the gates. Stub globals, the `consent.test.ts` style.

### Phase 4: config and docs
- Production deploy workflow: pass the three vars from GitHub Actions variables.
  The guard hook will ask before this edit.
- New ADR (next free number). It supersedes ADR 0007's "never for advertising" and "one tag only" lines.
  It also records that CSP hosts are needed when `feat/csp-header` lands.
- `src/pages/privacy-policy.astro`:
  - §2b gets a marketing paragraph;
  - §3 gets new table rows for the cookies;
  - §4 names Meta Platforms Ireland and LinkedIn Ireland as recipients.
- `.claude/rules/analytics.md`: section on ads plus `ads.ts` in its paths. The CLAUDE.md rules table gets the same.
- `README.md` "Analytics": the env vars, and that Events Manager / Campaign Manager are set up by hand.
- `docs/adapting.md`: the three env vars.
- `docs/product.md`: the consent choice.

## Out of scope
- GTM, Meta CAPI and LinkedIn CAPI (variant C stays a possible follow-up).
- Purchase value. ti.to's redirect has none.
- Building audiences and uploading attendee lists. That is done by hand in the ad tools, never via the repo.

## Reused
- The consent gate pattern and memo from `initAnalytics()`: `src/lib/firebase.ts:131`.
- `whenIdle()`: `src/lib/firebase.ts:206`. Move it to `tracking-gates.ts` too if `ads.ts` needs it.
- `cookieDomains()` for cookie deletion: `src/lib/consent.ts:43`.
- `trackConversion()` guard: `src/lib/analytics.ts:20`.

## Verification
- `npm run verify` is green.
- In-browser on a local build with `PUBLIC_ANALYTICS_ALLOWED_HOSTS=localhost` and test IDs:
  - undecided, Decline, Analytics only → zero requests to facebook.* / licdn.com / linkedin.com;
  - Allow all → both scripts load on idle, `PageView` fires on soft navigation, and Buy CTA sends `InitiateCheckout`;
  - `/thank-you` sends `Purchase` once, also after a reload;
  - `/login/<code>` → no ad requests;
  - Cookie settings → `_fbp` and the LinkedIn cookies are gone after the reload.
- On the PR preview, the maintainer checks Meta Events Manager "Test events" and the LinkedIn Insight Tag status.
- `/review` over the diff, then `ship` (draft PR, preview URL).
