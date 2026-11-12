---
title: "perf(site): Lighthouse 100 in all four categories on every page of the live site"
type: perf
date: 2026-11-12
---

## Lighthouse 100 on the live site

Goal: Performance, Accessibility, Best Practices and SEO at 100 in Chrome's
Lighthouse (13.6, mobile and desktop presets) on every indexable page the
root build serves. Out of scope: the frozen `/2026` archive (ADR 0013, never
edited), the YouTube aftermovie (ADR 0012; a cross-origin frame, which
Lighthouse's main-thread, console and cookie audits do not count), and the
`noindex` pages (thank-you, `/login`, 404), whose SEO "not crawlable" is
deliberate.

Measured on a local build served like Hosting (clean URLs, brotli, the
`firebase.json` headers), headless Chromium 153.

| Page | Before (mobile) | Cause |
| --- | --- | --- |
| `/` | 59 / 100 / 96 / 100 | TBT 56 s, SI 9.5 s; LCP from the stage's fade |
| `/faq`, `/contact`, legal pages | 62–65 / 100 / 96 / 100 | TBT 29–48 s, SI 6–8 s |

## 1. The painting leaves the main thread

`src/lib/aether` drew its two textures (thousands of 2D strokes), compiled
its shader and drew every frame on the main thread. Lighthouse multiplies
main-thread tasks by its CPU slowdown (4× on mobile), so the set-up alone
blocks; on a software rasterizer every frame is a 400–600 ms task, for as
long as the page is open.

- `painter.ts`: the context, the set-up and the loop, DOM-free; it takes a
  `Layout` (canvas box, DPR, the anchor's resting centre) and `Command`s.
- `worker.ts`: receives the canvas as an `OffscreenCanvas`
  (`transferControlToOffscreen()`) and runs the painter there.
- `index.ts`: stays on the page, measures, observes (intersection, resize,
  pointer, reduced motion) and sends commands. Without
  `transferControlToOffscreen` it paints on the main thread (painter loaded
  on demand, its settings read once loaded); a worker without WebGL at all
  (Safari 16) hands back and the page paints on a fresh canvas.
- No painting on a software rasterizer (`failIfMajorPerformanceCaveat`, and
  the renderer's name: SwiftShader, llvmpipe, WARP): the root's gradients
  stay, as without WebGL, and nothing is left listening. A context refused
  in the worker is not retried on the main thread.
- Check: TBT 0 with the painting running (the software check bypassed);
  the three paths (worker, main thread, worker without WebGL) each paint;
  soft navigations start a worker per page and end the last; a repeated
  `astro:page-load` leaves the running canvas alone.

## 2. The stage is there from the first paint

`rise` faded the stage in from opacity 0. Chrome takes nothing first painted
at opacity 0 as the largest contentful paint, so the home page had no LCP
candidate until the stage settled (~2.2 s observed, 2.8–3.0 s simulated).

- `rise` keeps its 14px rise, order and timing, without the fade.
- Check: the logo is the LCP at first paint, mobile and desktop.

## 3. reCAPTCHA only where a form needs it

App Check started on every page (the cookie banner's page-view hook, then
`initAnalytics()` ahead of the consent gate), loading reCAPTCHA Enterprise's
script, frame and `_GRECAPTCHA` cookie on pages without a callable.

- `getFirebaseApp()` alone starts App Check; `InvoiceForm` calls it on mount,
  the workshop sign-in already does when it asks for the session.
- ADR 0014; the privacy policy names the pages; README and the analytics
  rule follow.
- Check: no request to `www.google.com` on any page without a form.

## Result

Every indexable page: 100 / 100 / 100 / 100, mobile and desktop, with the
painting off (software) and with it running.

## Records

`docs/design.md` and `.impeccable/design.json` (the aether in a worker, the
software rule, `rise` without the fade), ADR 0014 and its index,
`.claude/rules/analytics.md`, README's App Check section, the privacy policy.
