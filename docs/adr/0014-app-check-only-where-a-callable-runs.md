# 0014. App Check starts only on a page with a callable form

- Status: accepted
- Date: 2026-11-12
- PR: to be linked when merged

## Context

App Check (reCAPTCHA Enterprise, [0004](0004-app-check-with-plain-tokens.md))
protects the two callables, `submitInvoiceCallable` and
`workshopRegistrationCallable`. It was started on every page load: the
cookie banner's page-view hook imported `src/lib/firebase.ts` on every page,
and `initAnalytics()` initialised the app, and App Check with it, ahead of
the consent gate. So every page of the site, with no form on it, loaded
Google's reCAPTCHA script into the page, its frame, and the `_GRECAPTCHA`
cookie on `www.google.com`.

On a page without a form, that bought nothing: no callable runs there. It cost
a third-party script on the main thread, a third-party cookie, and a request
to Google from every visitor on every page. Lighthouse counts all three: the
script in Total Blocking Time, the cookie in Best Practices ("Uses
third-party cookies"), and a failed load as a console error.

## Decision

- `getFirebaseApp()` (the callables' entry in `src/lib/firebase.ts`) is the
  only path that starts App Check. Analytics and Performance Monitoring use
  the app without it.
- A page with a callable form starts it early, so a token is ready by the
  submit: `InvoiceForm` on mount, the workshop sign-in when its island asks
  for the session (`src/lib/workshops.ts`). No other page loads reCAPTCHA.
- App Check stays outside the consent gate
  ([0007](0007-analytics-basic-consent-mode.md)): it is a security measure on
  the pages that write data.

## Consequences

- Pages without a form send nothing to Google before consent, and nothing
  but the YouTube player ([0012](0012-aftermovie-as-a-lazy-youtube-embed.md))
  after it unless the visitor accepts analytics.
- reCAPTCHA sees the visitor only on the form's page, so its score rests on
  the time spent there. The callables keep their throttles
  ([0004](0004-app-check-with-plain-tokens.md)) whatever the score.
- A new callable form must call `getFirebaseApp()` when it mounts, not first
  on submit, or the first token waits for reCAPTCHA to load.
- The privacy policy (§2d, the cookie table) names the pages reCAPTCHA runs
  on.
