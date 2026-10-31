# 0002. One Firebase project, shared with the mobile app

- Status: accepted; the rules bullet superseded by [0009](0009-database-rules-live-in-the-app-repo.md)
- Date: 2026-05-10
- PR: [#134](https://github.com/gugcz/devfest-website/pull/134)

## Context

The website and the DevFest.cz mobile app (`ryzizub/devfest_mobile_app`) are
built from the same lineup and the same ti.to event, and the app's ticket login
is later reused by the website. Two Firebase projects would mean copying data
and accounts between them. One project means two repositories deploy into it,
and a careless deploy from either can delete or overwrite the other's
functions.

## Decision

- Both repos deploy to `devfest-cz-app`. This repo declares
  `"codebase": "website"` and deploys only `--only functions:website`, from
  `firebase-functions-merge.yml`, without `--force` (a function removed from
  the code makes the deploy fail instead of deleting it). The app is codebase
  `app`.
- Hosting: the website is the `devfest-public` site; the app owns its own.
- Function names are unique across the project: `camelCase` plus a trigger
  suffix, no prefix. CLAUDE.md lists this repo's functions; the app's
  CLAUDE.md lists its own.
- Rules are split by collection and merged by hand in the console. The website
  owns Firestore `sessions`, `speakers`, `rooms`, `invoices` and
  `invoiceRateLimits`, all of RTDB and Storage `speakers/`; the app owns
  Firestore `users`, `verification_codes` and its game collections. Neither
  repo wires its rules file into `firebase.json`.
- App Check enforcement and the single `beforeUserCreated` blocking slot are
  project-wide; either side coordinates before changing them.

## Consequences

- A rename on either side can break the other: the website calls two of the
  app's callables and reads its `users` docs
  ([0005](0005-workshop-sign-up-on-the-app-login.md)); the app bundles the
  website's `faq.json` and `partners.json`.
- Rules changes are a manual console step, documented in README.
- `public/.well-known/apple-app-site-association` on devfest.cz decides which
  links open the iOS app; it lists only paths the app has a route for.
