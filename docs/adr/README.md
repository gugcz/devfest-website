# Architecture decision records

One file per decision that shaped how the site is built: `NNNN-<slug>.md`,
numbered in order, never renumbered. Each has a Status, a Date and the PR it
landed in, then Context, Decision and Consequences. A reversed decision gets a
new record that supersedes the old one; the old one stays.

The first seven were written down on 2026-10-14 from the PRs that made them;
their dates are the PRs' merge dates. When to write one: `.claude/rules/docs.md`.

| # | Decision | Status |
| --- | --- | --- |
| [0001](0001-browser-reads-through-cached-api.md) | The browser reads data through cached `/api/*` functions, never the Firebase client SDK | accepted |
| [0002](0002-shared-firebase-project.md) | One Firebase project, shared with the mobile app, split by codebase and collection | accepted |
| [0003](0003-invoice-first-company-tickets.md) | Company tickets go invoice first through iDoklad, payment is polled | accepted |
| [0004](0004-app-check-with-plain-tokens.md) | Callables enforce App Check with plain tokens, plus throttles | accepted |
| [0005](0005-workshop-sign-up-on-the-app-login.md) | Workshop sign-up reuses the mobile app's ticket login; seats live in RTDB | accepted |
| [0006](0006-share-pages-built-from-the-live-lineup.md) | Talk and speaker share pages are built from the live lineup at build time | accepted |
| [0007](0007-analytics-basic-consent-mode.md) | GA4 runs in basic Consent Mode: nothing loads before consent | accepted |
