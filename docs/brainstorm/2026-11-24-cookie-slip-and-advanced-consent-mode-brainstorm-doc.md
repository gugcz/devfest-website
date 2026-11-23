---
date: 2026-11-24
topic: cookie-slip-and-advanced-consent-mode
---

# A cookie slip visitors notice and understand; GA4 in advanced Consent Mode

## What We're Building

Two changes to how the site asks for analytics consent.

**The slip.** The cookie slip (`src/components/aether/CookieBanner.astro`)
is easy to miss on the painting: small text, a faint brass edge, one
terse question. It does not say why we ask or what we never collect.
Decline is an underlined text action next to a solid Accept button. The
slip stays bottom-right and never blocks the page, but it becomes:

- a short heading that asks the question in plain words;
- one or two sentences: what analytics tells us, and what it never
  collects (no ads, no name or email), with the Privacy Policy link;
- two buttons of equal size and weight, Allow and Decline;
- a clearer edge and a little more size, inside the aether's materials.

Draft copy (final wording in the plan):

> **Can we count your visit?**
> Google Analytics shows us which pages help. No ads, no name or email.
> Privacy Policy.
> [Allow analytics] [Decline]

**Consent Mode.** GA4 moves from basic to advanced Consent Mode. Today
nothing from Google loads before Accept (ADR 0007). In advanced mode the
tag loads on every visit with `analytics_storage` denied and sends
cookieless pings before the visitor decides. Per Google's consent mode
docs these carry the user agent, screen resolution, IP address, referrer,
a timestamp and the consent state; no cookie is set or read. Accept
updates consent to granted and the tag sets `_ga` as today.

## Why This Approach

**Slip, three options weighed:**

- **Clearer slip (chosen).** Same place, more presence, plainer copy,
  equal buttons. Keeps the page readable for a visitor landing from a
  link and fits `docs/design.md`.
- Full-width bottom bar. More visible, but covers more of the page and
  the painting on every page.
- Centred modal. Most visible, but blocks the page a visitor just
  opened and needs a focus trap. Rejected.

Equal buttons also make Decline exactly as easy as Allow, which the
current text action does not quite do.

**Consent Mode, three options weighed:**

- Keep basic (ADR 0007). Nothing reaches Google before Accept.
- **Advanced (chosen by the maintainer).** The tag runs for every
  visitor and sends cookieless pings before consent.
- Basic now, revisit with the GTM/pixel work.

What advanced buys and costs, stated plainly:

- Google uses unconsented pings in reports only through behavioral
  modeling. Eligibility per Google: at least 1,000 events a day with
  `analytics_storage` denied for 7 days, and at least 1,000 daily users
  with it granted on 7 of the previous 28 days. Without modeling the
  denied events are not reported. This is why ADR 0007 reverted.
- Advanced mode is also the input Google Ads conversion modeling prefers
  (an advertiser-specific model rather than a general one).
- A Google script loads and a request with the visitor's IP reaches
  Google before they choose. The privacy policy's "Before you decide,
  and if you decline: analytics does not run" stops being true.
- Last time a late Accept started the session without `session_start`
  and `first_visit` (ADR 0007). The plan has to solve that, not repeat it.

## Key Decisions

- **Slip stays a slip:** bottom-right, non-blocking, `Escape` still
  declines, the WCAG 2.4.11 scroll padding stays.
- **Equal choices:** Allow and Decline share one button style and size;
  no pre-ticked option, no hidden Decline.
- **Copy says why and what not:** one heading, at most two short
  sentences, the Privacy Policy link.
- **Advanced Consent Mode for GA4 only.** `ad_storage`,
  `ad_user_data` and `ad_personalization` stay denied. Performance
  Monitoring and Crashlytics stay behind Accept: they store an
  installation id, which needs consent (ADR 0015).
- **Gates that stay:** the production-host gate (`ANALYTICS_HOSTS`) and
  the `/login/<code>` URL cut apply to the pre-consent pings too.
- **Decline stays meaningful:** after Decline the tag keeps
  `analytics_storage` denied and never sets a cookie; "Cookie settings"
  still deletes what an Accept left and asks again.
- **Docs in the same PR:** a new ADR superseding 0007, the privacy
  policy §2b rewritten for pings before consent, `.claude/rules/analytics.md`,
  `docs/product.md`, and the slip in `docs/design.md`.

## Open Questions

- **Legal reading.** Is sending IP and user agent to Google before
  consent fine under Czech ePrivacy rules (Act 127/2005, §89(3)) and GDPR?
  Unverified. The maintainer decides before the PR leaves draft.
- **Late Accept.** How does the session keep `session_start`,
  `first_visit` and the entry page's campaign once consent updates
  mid-page? Options for the plan: `consent: 'update'` then a fresh
  entry `page_view`, or the current `reportEntry()` adapted. Verify
  in-browser.
- **`ads_data_redaction` and `url_passthrough`.** Probably redaction on,
  passthrough off (it rewrites links). Confirm in the plan.
- **Archive.** `/2026` is a frozen build and keeps the old slip and basic
  mode. Fine as is?
- **GTM/pixel brainstorm.** A separate brainstorm covers GTM and
  Meta/LinkedIn pixels. The plan should not pre-empt it, only keep the
  gtag shim easy to move.
