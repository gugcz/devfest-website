---
title: "fix(a11y): agenda reflows on phones, one Escape closes one layer, the cookie slip never hides focus, consent can be withdrawn"
type: fix
date: 2026-11-01
---

## Agenda reflow and cookie consent fixes

From the design review of 2026-11-01. Five measured bugs, one PR.
Out of scope: Accept/Decline visual parity, copy changes, the home layout,
feature flags.

## 1. `/agenda` overflows on phones (WCAG 1.4.10)

At 390px the page is 446px wide, at 320px 442px; the menu toggle sits
off-screen. `.bar` (`Agenda.module.scss:14`) keeps `flex-wrap: wrap` in the
≤720px block, so the column flex line is sized by the room filter's
max-content width (416–428px) instead of the viewport, and the filter's
`overflow-x: auto` never kicks in.

- In the ≤720px block: `.bar { flex-wrap: nowrap; }` and
  `.rooms { min-width: 0; max-width: 100%; }` so the filter scrolls inside
  the column.
- Check: `document.documentElement.scrollWidth === innerWidth` on `/agenda`
  and `/agenda#talks` at 320 and 390; the room filter still scrolls sideways
  and keeps its focus ring.

## 2. "LUNCH" breaks one letter per line at 768px

`bandColumns()` (`Agenda.tsx:379`) gives the band the free columns left of
the first busy room, one ~100px column here. `.bandTitle { min-width: 0 }`
plus the global `overflow-wrap` lets the flex item shrink below one word.

- `.band { flex-wrap: wrap; }` and `.bandTitle { overflow-wrap: normal; }`:
  in a narrow column the title drops under the time instead of splitting a
  word; in a wide one nothing changes (a long name still wraps beside the
  time).
- No change to `bandColumns()`: the column choice is right, only the
  typography inside it is wrong.
- Check: 721, 768, 900, 1024px; no band title wraps mid-word.

## 3. Escape with the mobile menu open also declines cookies

`CookieBanner.astro:80` declines on any Escape while the banner is visible.
With the menu open, `Menu.astro` makes `#cookie-banner` `inert`, and the
same keypress also closes the menu. Two layers close, and a consent decision
is recorded the visitor never made.

- The banner's handler returns early when the banner is `inert` (or when
  `e.defaultPrevented`); the menu's Escape handler calls `preventDefault()`
  when it closes the menu. Either check alone fixes it; both make the rule
  "one Escape, one layer" explicit.
- Check: open menu, Escape → menu closes, banner stays, nothing stored;
  Escape again → declined.

## 4. The cookie slip hides focused elements on phones (WCAG 2.4.11)

The slip is ~143px tall, 16–20px off the bottom; `scroll-padding-bottom` is a
fixed `8rem` (`BaseLayout.scss:188`). And an element already on screen under
the slip doesn't scroll at all on focus — the browser only scrolls elements
outside the viewport.

- `CookieBanner.astro` sets `--cookie-slip-h` on `<html>` from a
  `ResizeObserver` on the banner while it is shown (height + bottom offset),
  and removes it on hide.
- `BaseLayout.scss`: `scroll-padding-bottom: calc(var(--cookie-slip-h, 0px) + 1rem)`.
  No banner, no padding.
- A `focusin` listener (module scope, banner looked up per event like the
  Escape handler) calls `scrollIntoView({ block: 'nearest' })` when the
  focused element's rect overlaps the visible banner's. `nearest` honours
  the scroll padding, so it lands just above the slip.
- Check: 320 and 390, Tab through the home page and `/agenda` with the
  banner up; no focused element's rect intersects the banner's.

## 5. Consent can only be withdrawn by clearing storage (GDPR Art. 7(3))

Add a "Cookie settings" button: in the footer's link column (after "Privacy
Policy") and in privacy policy §3, replacing the "clear your browser
storage" sentence. It clears the stored decision and shows the banner again,
with focus moved to the banner.

The catch: after an accept, GA4 and Performance Monitoring are already
loaded in the document, and neither can be fully unloaded. Options:

- **A. Withdraw = decline, then reload (recommended).** A Decline that
  follows an accept stores `declined`, deletes the `_ga*` cookies and the
  Firebase Installations IndexedDB (`firebase-installations-database`),
  and reloads the page. Nothing stays in memory; the existing "declined
  loads nothing" path is the only one to trust. Cost: one reload, only on
  this path.
- B. `gtag('consent', 'update', { analytics_storage: 'denied' })` and
  Performance `dataCollectionEnabled = false`, no reload. Stops the tag
  writing cookies, but the SDKs stay loaded and Performance's flag has no
  documented guarantee for already-buffered traces. More code, weaker promise.
- C. Only clear the stored choice and show the banner; a Decline takes
  effect from the next page load. Smallest, but the privacy policy would
  have to say so, and the slip currently promises nothing loads on decline.

With A (chosen 2026-11-01). Built: the clean-up and reload happen on the
"Cookie settings" click itself when the stored choice was `accepted`, not on
the Decline that follows, so GA4 sends nothing while the visitor decides
again; after a decline the click just shows the banner. Focus lands on the
banner either way (a one-shot `sessionStorage` flag across the reload).

- `src/lib/consent.ts`: `clearConsent()` beside `readConsent`/`storeConsent`;
  a `deleteAnalyticsData()` helper (`_ga*` cookies, the Installations
  IndexedDB, Performance's cached config) lives there too so `firebase.ts`
  stays the only Firebase importer.
- Cookie settings buttons carry `data-cookie-settings`; one delegated click
  listener in `CookieBanner.astro` (module scope, survives
  `<ClientRouter />` swaps).
- Unit tests for `clearConsent()` and the cookie-domain list in
  `src/lib/consent.test.ts`.

## Docs (same PR)

- `.claude/rules/analytics.md`: the withdraw path and the Escape rule.
- `docs/product.md`: the Cookie settings control.
- `docs/design.md` via `/impeccable document`: the footer entry and the
  slip's dynamic scroll padding (the z-index/motion tables don't change).
- privacy policy §3 sentence about withdrawal (wording only where the
  current sentence becomes false; no other copy).

## Verification

`npm run verify` (includes `npm run a11y` and the site tests), plus the
in-browser checks listed per item at 320, 390, 768 and 1280px.
