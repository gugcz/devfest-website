# 0016. Meta Pixel and LinkedIn Insight Tag run behind a marketing consent

- Status: accepted
- Date: 2026-11-27
- PR: to be linked when merged
- Supersedes: the "never for advertising" and "one tag only" lines of [0007](0007-analytics-basic-consent-mode.md)

## Context

The site advertises on Facebook, Instagram and LinkedIn. Neither ad tool
could see a conversion or build an audience of visitors: the site ran GA4
only, with every `ad_*` consent denied. Checkout runs on hosted ti.to,
whose pixel plugins need its embedded widget. Variants weighed (GTM as one
container, direct tags, server-side Conversions APIs from the ti.to
webhook): `docs/brainstorm/2026-11-23-ads-conversion-tracking-brainstorm-doc.md`.

## Decision

- The Meta Pixel and the LinkedIn Insight Tag load directly from
  `src/lib/ads.ts`. No GTM container.
- They run only after "Allow all" (`accepted-marketing` in
  `cookie-consent`), a choice separate from analytics: the slip offers
  "Allow all", "Analytics only" and "Decline". Every `accepted` stored
  before this means analytics only.
- Same gates as GA4: production hosts only, never on `/login/<code>`.
  Page views and events are ours to send (Meta's own `pushState` tracking
  is off).
- Five signals: page view, `InitiateCheckout`, `Purchase` (on `/thank-you`,
  no value), `Lead`, `CompleteRegistration`; LinkedIn conversion ids per
  event.
- The tag ids are build-time GitHub Actions variables, never in the repo.
  A build without them loads no tag.
- No server-side Conversions API for now.
- GA4 keeps `ad_*` denied: Google Ads is not in scope.

## Consequences

- Only "Allow all" visitors are counted and retargetable in Meta and
  LinkedIn. The purchase has no value; revenue stays in ti.to.
- Meta and LinkedIn receive IP, browser, pages and events, and use them for
  their own purposes. The privacy policy says so (§2g, §3, §4).
- "Cookie settings" also deletes the first-party ad cookies; cookies on
  facebook.com and linkedin.com stay out of our reach.
- A header CSP (`feat/csp-header`) must allow `connect.facebook.net`,
  `www.facebook.com`, `snap.licdn.com` and `px.ads.linkedin.com` when it lands.
- No change to the Firebase project or the functions.
- Details: `.claude/rules/analytics.md` ("Ad tags").
