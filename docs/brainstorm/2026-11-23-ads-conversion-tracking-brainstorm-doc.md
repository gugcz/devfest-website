---
date: 2026-11-23
topic: ads-conversion-tracking
status: variant not chosen yet
---

# Ad conversion tracking: GTM, Meta Pixel, LinkedIn Insight Tag

## What We're Building

An external review of the 2026 ad campaigns (Facebook/Instagram, LinkedIn)
asked for three things:

- one consistent site with Google Tag Manager,
- conversion tracking set up in Meta and LinkedIn,
- remarketing audiences.

Today the site has no GTM and no ad pixels.
GA4 runs through the Firebase SDK in basic Consent Mode
([ADR 0007](../adr/0007-analytics-basic-consent-mode.md)).
Nothing loads before the visitor accepts.
`ad_*` consent is always denied: "we never collect for advertising".

So this is a policy change first and a code change second.
Every variant below supersedes part of ADR 0007 and the privacy policy.

The conversions we can see today (`.claude/rules/analytics.md`):

| Signal | Where | Value known? |
| --- | --- | --- |
| Checkout started | Buy CTA click, `begin_checkout` | Yes, gross CZK of the variant |
| Ticket bought | `/thank-you`, ti.to redirect | No, the redirect has no order id or amount |
| Company invoice lead | `InvoiceForm.tsx`, `generate_lead` | Yes, the ti.to estimate |
| Newsletter sign-up | `/newsletter-subscription-thank-you` | n/a |
| Ticket bought (server) | `ticketsWebhook`, `registration.finished` | Yes, plus buyer email and `source` |

## Facts that shape every variant

**Checkout runs on hosted ti.to, not on our site.**
The site links to `ti.to/...`; it does not embed the ti.to widget.
`src/lib/attribution.ts` forwards `utm_*` and `source` to those links.

**ti.to's pixel support needs the widget, not hosted checkout.**

- The LinkedIn article says hosted checkout is "not currently supported".
  It needs the widget plus our own Insight Tag on the page.
  Events: Checkout started, Purchase.
  [ti.to: LinkedIn Ads conversions](https://help.tito.io/en/articles/15013898-how-to-track-linkedin-ads-conversions-from-your-tito-checkout)
- Facebook Ads and Google Ads tracking also require the widget.
  [ti.to: Facebook Ads and Google Ads](https://help.tito.io/en/articles/4819439-can-i-integrate-tito-with-facebook-ads-and-google-ads-tracking)
- Widget plugins: `facebook` (uses our `fbq`), `ga4` (trial).
  `gtm`, `gtag` and `google_analytics` are deprecated.
  [ti.to: Widget V2, Plugins](https://ti.to/docs/api/widget)
- The ga4 plugin sends `begin_checkout` and `purchase`, widget only.
  [ti.to: Google Analytics](https://help.tito.io/en/articles/2006249-google-analytics)
- No consent mode on ti.to's side.
  The LinkedIn article says to gate the tag behind our own consent tool.
- No documented order data on the redirect / thank-you URL.

So on hosted checkout the only browser-side purchase signal is our
`/thank-you` page, without value.
The only signal with value and identity is the webhook.

**Server-side APIs need identity we only have on the server.**

- Meta CAPI: `action_source` is required for every event.
  Website events also need `client_user_agent` and `event_source_url`.
  `event_id` deduplicates against the pixel.
  [Meta: server event parameters](https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/server-event),
  [Meta: payload helper](https://developers.facebook.com/documentation/ads-commerce/conversions-api/payload-helper)
- LinkedIn CAPI: at least one user id, e.g. SHA-256 email (unsalted)
  or the first-party `li_fat_id`.
  [LinkedIn: Conversions API](https://learn.microsoft.com/en-us/linkedin/marketing/integrations/ads-reporting/conversions-api),
  [LinkedIn: CAPI FAQ](https://learn.microsoft.com/en-us/linkedin/marketing/conversions/conversions-faq)
- The ti.to webhook has the buyer email, price and `source`.
  It has no user agent, no `_fbp`/`_fbc`, no `li_fat_id`.

**CSP today is `frame-ancestors 'none'` only** (`firebase.json`).
Nothing blocks a third-party script now.
A header CSP is designed on `feat/csp-header` but not live.
Whatever lands here must list its hosts there when that ships.

## Variants

### A. GTM as the single container (GA4 moved into it) — not recommended

GTM loads after consent and carries GA4, Meta Pixel and the Insight Tag.
`firebase.ts` keeps only Performance and Crashlytics.

- Pros:
  - what the consultant asked for;
  - marketing can add tags and events without a deploy.
- Cons:
  - redoes what ADR 0007 solved in code and verified in-browser:
    `consent: 'default'` before `config`,
    entry page and campaign reported after a late accept,
    `/login/<code>` cut out of every URL,
    soft-navigation page views under `<ClientRouter />`;
    each becomes GTM config that no test or review sees;
  - a tag published in the GTM UI bypasses PRs, `verify` and the
    "nothing before consent" rule;
  - CSP: GTM Custom HTML and custom JS variables need
    `'unsafe-inline'` / `'unsafe-eval'` (to verify at plan time);
  - one more script before the ad tags (`gtm.js`) for consenting visitors;
  - still no purchase value: GTM cannot see hosted ti.to either.
- Consent: one trigger on our consent signal; every tag must respect it.
  GTM's built-in consent checks only cover Google tags natively
  (to verify for Meta/LinkedIn templates).
- Firebase shared project: no impact.
- Best when: a non-developer runs campaigns weekly and needs to ship tags.

**A2. GTM for ad tags only, GA4 stays on Firebase.**
Avoids the GA4 rewrite.
Keeps every other con above, and adds a second Google loader.

### B. Meta Pixel + LinkedIn Insight Tag loaded directly — recommended

A new `src/lib/ads.ts` loads `fbevents.js` and the Insight Tag
after a separate "marketing" consent.
Same pattern as Performance and Crashlytics:
dynamic, on idle, host-gated, never on `/login/<code>`.
`analytics.ts` fans each conversion out to GA4 and the ad tags.

| Our event | Meta | LinkedIn |
| --- | --- | --- |
| page view | `PageView` | Insight Tag page view |
| `begin_checkout` | `InitiateCheckout` + value | conversion "Initiate checkout" |
| `ticket_purchase_confirmed` | `Purchase` (no value) | conversion "Purchase" |
| `generate_lead` | `Lead` + value | conversion "Lead" |
| newsletter `sign_up` | `CompleteRegistration` | conversion "Sign up" |

- Pros:
  - small, reviewed, tested; follows the code we already trust;
  - consent, host gate and `/login/` rule stay in one place;
  - visitor remarketing audiences come for free from the pixels;
  - no backend, no secrets, no shared-project change.
- Cons:
  - purchase has no value, same as GA4 today;
  - only consenting visitors are counted and retargetable;
  - every new tag is a PR (that is also a pro).
- Consent:
  - needs a "marketing" category separate from "analytics";
  - the banner redesign in the parallel session owns that UI;
    this needs its storage shape (`consent.ts`) agreed with it;
  - withdrawal: `deleteAnalyticsData()` grows `_fbp`, `_fbc`,
    LinkedIn cookies (`li_fat_id`, `lidc`, … to list at plan time),
    and the privacy policy table grows with it.
- CSP (when the header lands): `connect.facebook.net`, `www.facebook.com`,
  `snap.licdn.com`, `px.ads.linkedin.com` (to verify at plan time).
- Performance: zero for visitors who decline; two idle scripts for those
  who accept.
- Firebase shared project: no impact.
- Best when: a handful of fixed conversions, a developer owns the site.

### C. Server-side Conversions APIs from the ti.to webhook — add-on, not alone

`ticketsWebhook` on `registration.finished` sends a Purchase with value
to Meta CAPI and LinkedIn CAPI, keyed on the hashed buyer email.

- Pros:
  - the only variant with a real purchase value;
  - counts buyers who block scripts or decline cookies
    (legal basis to confirm, below);
  - no browser cost.
- Cons:
  - Meta website events want `client_user_agent` and `event_source_url`;
    the webhook has neither, so `action_source` would be non-website
    and match quality lower (to verify);
  - no `_fbp` / `li_fat_id` to tie the buyer to the ad click,
    unless B runs and we pass ids through ti.to (no documented way);
  - two API tokens as function secrets; retries; dedup with
    `webhookDedup`;
  - a PR preview hits production functions, so test locally only.
- Consent / GDPR: biggest risk.
  Sending a buyer's hashed email to Meta and LinkedIn needs a lawful basis.
  Hashing is pseudonymisation, not anonymisation.
  Needs a checkbox or notice in the ti.to checkout and in our policy.
- CSP / performance: none.
- Firebase shared project: no new function name if it lives in
  `ticketsWebhook`; new secrets in codebase `website`; ADR needed.
- Best when: B is live and purchase value or match rate is the gap.

### D. Switch to the embedded ti.to widget — noted, not explored

The widget would unlock ti.to's `facebook`, `ga4` and LinkedIn plugins
with real purchase events.
It changes the checkout UX and the whole tickets surface.
Out of scope for a tracking brainstorm; its own brainstorm if wanted.

## Why This Approach

B first, C later only if value or match rate proves to be the gap.

- B solves what the consultant needs most: conversions and visitor
  audiences in both ad tools.
- It keeps the guarantees ADR 0007 built (consent order, late accept,
  `/login/` redaction) in reviewed code.
- A buys editing speed we do not need for five fixed events,
  and costs those guarantees plus a looser CSP.
- C is the only path to purchase value, but carries the GDPR question
  and gives no visitor audiences on its own.

## Remarketing audiences

- **Website visitors**: built in Meta and LinkedIn from the pixels (B or A).
  Consenting visitors only.
- **Past attendees**: a customer list upload in each ad tool.
  Needs a lawful basis for ad use of the email (consent at ti.to checkout,
  or the newsletter opt-in).
  Done by hand in the ad tools. Never through this repo.
- **Buyers to exclude**: same list, used as an exclusion.
  Same legal question.

## Key Decisions

- Recommend B, with C as a later add-on: see "Why This Approach".
- A separate "marketing" consent, never bundled with analytics:
  GDPR needs a granular, specific choice.
- Nothing loads before that consent, same rule as ADR 0007.
- The ad tags never see `/login/<code>`.
- A new ADR supersedes ADR 0007's "never for advertising" and
  "one tag only" lines; the privacy policy changes in the same PR.
- Purchase stays without value on the browser side; ti.to stays the
  revenue source of truth.

## Open Questions

- Which variant? (maintainer)
- Who runs the campaigns, and how often do they need new events?
  A weekly need tips the scale towards A2.
- Consent shape: one "marketing" toggle, or Meta and LinkedIn separately?
  Needs the banner session's design.
- Legal basis for C and for attendee lists: does the ti.to checkout ask
  for marketing consent today? Who signs off for GUG.cz, z.s.?
- Meta CAPI from a server with no user agent: which `action_source`,
  and is the match quality worth it? Verify before planning C.
- Do Meta's and LinkedIn's GTM templates honour Consent Mode, or only our
  trigger? Verify only if A is chosen.
- Exact cookie names and CSP hosts for both tags: verify at plan time.
