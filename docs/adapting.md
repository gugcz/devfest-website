# Adapting the site

Two checklists: the **next edition** of the same event, and **another
chapter's** event on this code. Both start in `src/site.config.ts`; its shape,
and which field changes when, is `src/lib/site-config.ts`
([ADR 0010](adr/0010-site-config-and-feature-flags.md)).

The gate keeps you honest: `npm run literals` fails on an event, organizer or
origin literal outside the config and the content JSON; `npm run flags-off`
fails on a section a flag did not remove cleanly.

## A new edition

1. **`src/site.config.ts` → `event`**: `edition`, `doors`, `start`, `end`,
   `afterpartyEnd`, `invoicesClose` (ISO 8601 with the local offset; mind
   DST), `timeZoneLabel` (`CET` or `CEST`), `tagline`, `pitch`,
   `previousEditionUrl`, `venue` (`name`, `street`, `postalCode`, `city`,
   `region`, `country`, `countryName`, `mapUrl`, `stationWalkUrl`). `name`,
   `hashtag` and `timeZone` stay.
2. **`functions/src/site.ts`**: the same facts the functions need
   (`event.edition`, `event.invoicesClose`, the e-mail's `dateLine` and
   `venue`). Keep the two files in step by hand.
3. **Content** (`src/content/`, schemas in `src/content.config.ts`):
   `faq.json` (the hours and the venue are written in the answers),
   `partners.json` and the masters under `src/assets/partners/<tier>/`,
   `team.json` and `src/assets/team/`, `topics.json`,
   `press-coverage.json` (empty it), `socials.json` if a profile changed.
   The mobile app bundles `faq.json` and `partners.json` verbatim: keep
   their shape.
4. **Assets with the year in them**: `public/press-kit/` (the brand manual
   and the `df26_*` logo files; `src/lib/press-kit.ts` names them),
   `src/assets/logo.png` and `logo-mono-white.png` (the badge carries the
   year), `public/og-image.jpg`, the hero art and the venue photographs
   under `src/assets/venue/`, `public/gallery/` (last edition's contact
   sheet on the home page; `src/pages/index.astro` names the frames).
5. **Copy that names the day**: the home page's past-editions line
   (`index.astro`, "Ten editions since 2012"), the "flying in" and "last
   train" FAQ answers, the venue route on `/venue` (train line, station,
   walk), the privacy policy's "Last updated".
6. **The production branch**: create the new year's branch from `2026`, add
   the GitHub ruleset (pull request required, the four checks), and point
   the workflow triggers at it: `on.push.branches` in
   `.github/workflows/{correctness,accessibility,firebase-hosting-merge,firebase-functions-merge}.yml`
   (literal globs; GitHub Actions cannot read them from a variable). Update
   `CLAUDE.md` and `README.md` where they name the branch.
7. **Sessionize and ti.to**: a new Sessionize event id
   (`SESSIONIZE_ENDPOINT_ID`) and ti.to event slug (`TITO_EVENT_SLUG`);
   `README.md` lists every secret and param. Clear the Firestore `speakers`
   / `sessions` / `rooms` mirror and RTDB `/tickets` so the old lineup does
   not show until the first sync.

## Another chapter

Everything above, plus:

1. **`src/site.config.ts`, every block**: `event.name` and `hashtag`;
   `organizer` (`name`, `legalName`, `url`, `email`, `repoUrl`); `site`
   (`url`; `firebase`, the web config as the console prints it: `apiKey`,
   `authDomain`, `databaseURL`, `projectId`, `storageBucket`,
   `messagingSenderId`, `appId`, `measurementId`; `functionsRegion`,
   `hostingSite`, `analyticsHosts`, `appCheckSiteKey`); `apps` (`android`,
   `iosId`, `pwaUrl`, or turn the `app` flag off).
2. **Feature flags** (`features` in the config; the list and what needs
   what: `src/lib/features.ts`):

   | Flag | What it removes | Needs |
   | --- | --- | --- |
   | `tickets` | the ticket section, `/thank-you`, every "Get tickets" action, the JSON-LD offers | |
   | `invoice` | `/invoice` and its links | `tickets` |
   | `workshops` | `/workshops` and its links | `app` |
   | `app` | `/app`, `/login`, `/delete-account`, the store badges | |
   | `invite` | `/invite/<member>` and its OG cards | `tickets` |
   | `partners` | `/partners`, the partner bands, the TV credits | |
   | `newsletter` | the form, `/newsletter-subscription-thank-you`, every "Get notified" link | |
   | `attending` | `/attending`, `/speaker-card` | |

   Not flags: `/tv` (delete `src/pages/tv.astro`) and `/press` (delete
   `src/pages/press.astro`, `src/pages/press/` and the band in
   `src/pages/contact.astro`). Flags own routes, links and sections, never
   prose: a sentence that names a feature stays as written
   (`src/pages/llms.txt.ts` "talks and workshops", the agenda's "Workshops
   only" room label, the contact desks, the privacy policy's processors).
3. **Cloud Functions and `firebase.json`** are not gated by flag. For a
   domain you do not run, delete its `export * from './<domain>/index.js'`
   line in `functions/src/index.ts` and its `/api/*` rewrite in
   `firebase.json`:

   | Domain | Rewrites | Secrets and params |
   | --- | --- | --- |
   | `tickets` | `/api/tickets` | `TITO_API_TOKEN`, `TITO_WEBHOOK_SECRET`, `TITO_ACCOUNT_SLUG`, `TITO_EVENT_SLUG`, `SLACK_WEBHOOK_URL` |
   | `invoice` (needs `tickets`) | none | `IDOKLAD_CLIENT_ID`, `IDOKLAD_CLIENT_SECRET`, `RESEND_API_KEY`; Czech VAT and iDoklad are written into `functions/src/invoice/` |
   | `sessionize` | none | `SESSIONIZE_ENDPOINT_ID` |
   | `lineup` | `/api/lineup`, `/api/speaker-photo` | |
   | `workshops` | `/api/workshops` | the mobile app's sign-in callables (ADR 0005) |

4. **Firebase**: your own project in `.firebaserc` and `firebase.json`
   (`hosting.site`, the rewrite regions), the Storage `speakers/` rules,
   the Firestore and RTDB rules (this repo's live in the mobile app's repo,
   [ADR 0009](adr/0009-database-rules-live-in-the-app-repo.md)), App Check,
   GA4 and Performance Monitoring in the console (`README.md`). The
   workflows name the project in three `--project` arguments
   (`firebase-hosting-merge.yml`, `firebase-hosting-pull-request.yml`,
   `firebase-functions-merge.yml`) and the `FIREBASE_SERVICE_ACCOUNT_*`
   secret.
5. **The functions mirror**, `functions/src/site.ts`: every value, plus
   `FUNCTIONS_ONLY` (sender address and name, the e-mail's date and venue
   lines, the app's second Hosting origin).
6. **Legal pages are prose, not templates**: rewrite
   `src/pages/privacy-policy.astro`, `src/routes/delete-account.astro` and
   `src/pages/code-of-conduct.astro` for your entity and processors.
7. **Brand**: the three faces are a brand mandate (`astro.config.ts`,
   `docs/design.md`); the design record is yours to replace through the
   Impeccable loop (`.claude/rules/design.md`). `public/.well-known/` holds
   the iOS app links for the DevFest app; replace or delete.
8. **The organizer's details in content**: `team.json`, `socials.json`,
   the contact desks in `src/pages/contact.astro` (named e-mails), the
   Code of Conduct listener.

## What the guard excludes, and why

`npm run literals` skips the three legal pages (prose), `src/lib/press-kit.ts`
(brand asset file names, listed above), tests and comments. Everything else
under `src/` reads the config.
