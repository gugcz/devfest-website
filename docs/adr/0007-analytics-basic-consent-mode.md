# 0007. GA4 runs in basic Consent Mode

- Status: accepted
- Date: 2026-09-16
- PR: [#383](https://github.com/gugcz/devfest-website/pull/383) (supersedes the advanced mode from [#258](https://github.com/gugcz/devfest-website/pull/258))

## Context

GA4 first ran in advanced Consent Mode: visitors who had not accepted sent
cookieless pings. GA4 only uses those through behavioral modeling, whose
traffic thresholds this property does not meet, so the pings bought nothing.
Worse, a visitor who accepted after landing started their session without
`session_start` and `first_visit`.

## Decision

- Nothing from Google loads or is sent before the visitor accepts.
  `initAnalytics()` is a no-op until consent is `accepted`.
- On accept the tag boots with `analytics_storage` granted and `ad_*`
  denied, and reports the entry page captured at load, so a late accept keeps
  the landing URL and campaign.
- One tag only: Firebase Analytics, no GTM container. Measurement is limited
  to the production hosts in code; dev and preview channels send nothing.
- Firebase Performance Monitoring (added in [#458](https://github.com/gugcz/devfest-website/pull/458)) rides the same
  consent and host gates.

## Consequences

- GA4 counts consenting visitors only. Reports are a lower bound, and revenue
  lives in ti.to, not GA4.
- The privacy policy states that nothing runs before consent.
- Details: `.claude/rules/analytics.md`.
