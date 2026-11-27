# 0015. Crashlytics reports browser errors only after consent

- Status: accepted
- Date: 2026-11-17
- PR: to be linked when merged

## Context

An error in a React island or a page script was invisible: nothing reported
it, and a visitor rarely does. Firebase Crashlytics now has a web SDK
(`firebase/crashlytics`, a preview release since `firebase` 13.2.0) that
reports uncaught errors and unhandled promise rejections into the Firebase
project the site already uses.

The SDK writes to the device: it reads the Firebase Installations id
(IndexedDB, the one Performance Monitoring uses) and keeps a session id in
sessionStorage, and sends both with every report. The site runs in basic
Consent Mode ([0007](0007-analytics-basic-consent-mode.md)): nothing is
stored or sent before the visitor accepts.

## Decision

- Crashlytics boots at the end of the GA4 boot, next to Performance
  Monitoring: only after an accept, only on the production hosts.
- It loads as its own chunk when the browser is idle. The SDK brings
  OpenTelemetry with it and must not compete with the page.
- Only uncaught errors and unhandled rejections are reported, through our
  own `error` and `unhandledrejection` listeners in place of the SDK's
  (`captureUnhandledErrors: false`). They pass each error through
  `readableError()` (`src/lib/react-errors.ts`) first, because React's
  production build reports "Minified React error #418" with no text.
  Amended 2026-11-24. The SDK also sends one "Session created" record per tab at boot,
  with both ids, even when no error happens. The
  experimental `breadcrumbs()` feature stays off: it sends navigation,
  request and interaction trails.
- It never boots on `/login/<code>`, whose path is a credential.
- Withdrawing consent deletes the session id with the rest
  (`deleteAnalyticsData()`); the privacy policy lists the store.
- Not chosen: booting without consent, as error reporting under legitimate
  interest. It would see every visitor's errors, but it puts two identifiers
  on the device before the visitor has decided, which the site promises not
  to do.
- Not in this change: uploading source maps in the deploy workflow, for
  readable stacks. It touches the production deploy.

## Consequences

- Errors of visitors who have not accepted, and errors thrown before the idle
  boot, are never reported. The console shows a lower bound.
- Stack traces are minified until source maps are uploaded.
- The SDK is a preview: its API can change in a minor `firebase` release.
- A project Owner runs `firebase crashlytics:setup` once. Reports are stored
  in Cloud Logging in the shared project `devfest-cz-app` and shown in the
  Crashlytics console.
- Details: `.claude/rules/analytics.md`.
