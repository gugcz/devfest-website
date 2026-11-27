# 0007. GA4 runs in basic Consent Mode

- Status: accepted; "never for advertising" and "one tag only" superseded by [0016](0016-ad-tags-behind-a-marketing-consent.md)
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

## Revisited (2026-11-27)

Advanced mode was tried again on a local build, with the tag loading on
every page and the first hit held back until the visitor decided. Two
findings keep this decision:

- A hit sent before consent takes `first_visit` and `session_start`
  (`_fv`, `_ss`) with it. A later accept then starts a session without
  them, whether it follows with `consent: 'update'`, a second `config` or
  a second `page_view`. Holding the first hit until the choice avoids it.
- Firebase Analytics creates a Firebase Installations id in IndexedDB as
  soon as it loads, before any choice, and sends it as `_fid` with every
  hit, cookieless ones included. That is an identifier stored on the device
  without consent. Advanced mode would need gtag.js without the Firebase
  Analytics SDK; that belongs with any change to how tags load.
