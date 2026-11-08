# 0012. The aftermovie is a lazy YouTube embed, loaded regardless of consent

- Status: accepted
- Date: 2026-11-08
- PR: [#536](https://github.com/gugcz/devfest-website/pull/536)

## Context

The 2026 aftermovie is on YouTube, on the GUG.cz channel. The home page's
last-edition band already shows that edition in figures and prints, and the
film belongs there. Three ways were weighed: a local poster linking out to
YouTube (no third party, but the visitor leaves), a click-to-load facade (a
local poster, the player only after a click), and a plain lazy iframe.

## Decision

- A plain `youtube-nocookie.com` iframe with `loading="lazy"` under the
  prints (`.film` in `src/pages/index.astro`).
- It loads when the visitor scrolls near it, whatever their cookie choice.
  Like reCAPTCHA, it sits outside the consent gate of
  [0007](0007-analytics-basic-consent-mode.md), which covers analytics.
- Video ids by year in `AFTERMOVIES` (`src/lib/editions.ts`), read through
  `lastEdition()`, so the band only ever plays its own edition's film.

## Consequences

- Once the player loads, Google receives the visitor's IP address and
  browser details, and the player stores data in the browser before any
  play. The privacy policy says so (§2f, the cookie table, §4).
- The player brings a third-party frame and its scripts on scroll, phones
  included.
- The axe sweep serves a blank page in place of the player (YouTube's DOM
  is not ours to fix, and the run stays off the network) and still checks
  the iframe and its title (`scripts/a11y.mjs`).
- A Content-Security-Policy with `frame-src` must allow
  `https://www.youtube-nocookie.com`.
