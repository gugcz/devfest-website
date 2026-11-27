---
title: "feat(consent): a clearer cookie slip and GA4 in advanced Consent Mode"
type: feat
date: 2026-11-24
---

# Plan: clearer cookie slip + GA4 advanced Consent Mode

Brainstorm: `docs/brainstorm/2026-11-24-cookie-slip-and-advanced-consent-mode-brainstorm-doc.md`
Branch: `feat/cookie-slip-advanced-consent` (brainstorm already committed).
On build, this plan is copied to `docs/plan/2026-11-24-feat-cookie-slip-advanced-consent-plan.md` and committed first.

## Outcome (2026-11-27)

Phase 2 shipped; phases 1 and 3 did not. GA4 stays in basic Consent Mode
(ADR 0007, "Revisited").

- The spike confirmed the old bug: `_fv`/`_ss` leave with the first hit,
  so a cookieless hit before an Accept costs the consented session its
  start. Candidates A and B both failed; holding the first hit until the
  choice fixed it.
- It also found Firebase Analytics writing a Firebase Installations id to
  IndexedDB on load, before any choice, and sending it as `_fid`. That
  rules out advanced mode through the Firebase SDK.
- The slip's Accept is labelled "Allow": "Allow analytics" broke inside the
  framed portal. The privacy policy follows the label. The copy promises
  nothing about ads, since a later change may add marketing choices.

## Context

The plan as approved on 2026-11-24 follows; the outcome above supersedes it.

The cookie slip is easy to miss on the painting and does not say why we ask.
Decline is a text action beside a solid Accept.
The maintainer chose a clearer slip with equal buttons.
The maintainer also chose advanced Consent Mode, which reverses ADR 0007.

The last advanced run (#258 → reverted in #383) had one real bug.
A visitor who accepted on the landing page got a consented session without `session_start` / `first_visit`.
That was verified in DebugView.
This plan must not ship advanced mode with that bug again.

## Phase 1 — Spike: late Accept in advanced mode (gate for phase 3)

Goal: find a boot sequence where a late Accept keeps `session_start`, `first_visit` and the entry campaign.

- Dev server with `PUBLIC_ANALYTICS_ALLOWED_HOSTS=localhost`, GA4 DebugView, `?utm_source=spike`.
- Boot denied, send the entry `page_view` cookieless, then Accept.
- Candidate A: `gtag('consent','update',{analytics_storage:'granted'})`, then `sendPageView(entry…)` again.
- Candidate B: update, then a second `gtag('config', measurementId, { page_location: entry, send_page_view: true })`.
- Pass = DebugView shows `first_visit`, `session_start`, `page_view` with the campaign, one session.
- **If neither passes: stop and report to the maintainer before phase 3.** No guess-and-patch.

Throwaway code, not committed.

## Phase 2 — The slip (independent of phase 1)

`src/components/aether/CookieBanner.astro`:
- Heading `Can we count your visit?` (a `<p>` styled as a label, or `<h2>` if axe is happy in a `region`).
- Copy: `Google Analytics shows us which pages help. No ads, no name or email.` + Privacy Policy link.
  Final copy changes once the policy text lands (phase 4), so it stays true for pre-consent pings.
- Buttons: `Allow analytics` and `Decline`, **both `.btn-framed`**, same size.
  Framed for both keeps the One Portal Rule and gives no visual nudge.
  `min-width: 0`, side by side, stacking below ~22rem.
- Slip: a little wider (~28rem), border at `rule-strong` or the 50% frame alpha, small entrance already exists.
- Keep ids `cookie-accept` / `cookie-decline`, `Escape` = decline, `--cookie-slip-h` logic untouched.

`src/lib/cookie-banner.ts`: no behaviour change in this phase.

Design record: `docs/design.md` "Cookie slip" + the One Portal Rule note (Accept is no longer solid).
Regenerate `.impeccable/design.json` via `/impeccable document`.

## Phase 3 — Advanced Consent Mode (only after phase 1 passes)

`src/lib/consent.ts`:
- Add pure `consentDefaults(decision)` → `analytics_storage` granted only for `accepted`; `ad_*` always denied.
- Tests in `src/lib/consent.test.ts`.

`src/lib/firebase.ts`:
- `initAnalytics()` boots on every page load (host gate + `isSupported()` stay). Remove the `readConsent()` gate.
- `gtag('consent','default', consentDefaults(readConsent()))` before `initializeAnalytics` (shim stays).
- `gtag('set','ads_data_redaction', true)`. No `url_passthrough`.
- `initializeAnalytics(app, { config: { send_page_view: false, page_location: redactAppLink(entryLocation) } })`.
  So no hit from `/login/<code>` carries the code, even pre-consent.
- `reportEntry()` runs at boot for everyone (cookieless when denied).
- New `grantAnalytics()`: the sequence phase 1 proved, then `schedulePerformance()` + `scheduleCrashlytics()`.
- Performance and Crashlytics schedule at boot **only** when `readConsent() === 'accepted'`; otherwise only from `grantAnalytics()`.
- `trackEvent` / `trackPageView` no longer drop pre-consent events (they go cookieless).

`src/lib/cookie-banner.ts`:
- Accept → `storeConsent('accepted')`, `hideBanner()`, `grantAnalytics()`.
- Decline → unchanged (stays denied, tag keeps pinging cookieless).
- Withdraw flow unchanged: delete data, reload; the fresh page boots denied.

## Phase 4 — Docs (same PR)

- `docs/adr/0016-ga4-advanced-consent-mode.md` (Context / Decision / Consequences). Supersedes 0007.
- `docs/adr/0007-…`: Status → `Superseded by 0016`. Add 0016 to `docs/adr/README.md`.
- `src/pages/privacy-policy.astro` §2b: rewrite "Before you decide, and if you decline".
  State the pings, what they carry (Google's list), no cookie, IP not stored by GA. "Last updated" stays November 2026.
- `.claude/rules/analytics.md`: rewrite the basic-mode section and the "why not advanced" paragraph.
- `README.md` Analytics section (line ~323): advanced mode, modeling thresholds.
- `docs/product.md` line ~61: who is counted now.
- Shared notes folder: a short note for the GTM/pixel session that the boot sequence changed.
- No business numbers anywhere. Justify by what the visitor sees.

## Critical files

- `src/components/aether/CookieBanner.astro`
- `src/lib/firebase.ts`
- `src/lib/consent.ts`, `src/lib/consent.test.ts`
- `src/lib/cookie-banner.ts`
- `src/pages/privacy-policy.astro`
- `docs/design.md`, `.impeccable/design.json`, `docs/adr/`, `.claude/rules/analytics.md`, `README.md`, `docs/product.md`

## Verification

- `npm run verify` green (types, complexity, site + function tests, axe sweep).
- In-browser on a dev server with the host override:
  - undecided: one cookieless `page_view`, no `_ga` cookie, no Performance/Crashlytics chunk.
  - Decline: same, still no cookie.
  - Accept late after a soft navigation: DebugView shows `first_visit`, `session_start`, entry campaign.
  - `/login/<code>`: no request carries the code.
  - Cookie settings after Accept: cookies and IndexedDB gone, page boots denied.
- Slip: keyboard order, `Escape`, focus ring, 320px width, forced colours, reduced motion.
- `/impeccable audit` on `/`.
- Draft PR, preview URL. Never merge or deploy.

## Open, for the maintainer before the PR leaves draft

- Legal reading of pre-consent pings under Act 127/2005 §89(3). Unverified.
