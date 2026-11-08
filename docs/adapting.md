# Adapting the site

Three checklists: **the yearly switch** (archive the edition that ended,
the root becomes the next one's teaser), the **next edition** of the same
event, and **another chapter's** event on this code. Both start in `src/site.config.ts`; its shape,
and which field changes when, is `src/lib/site-config.ts`
([ADR 0010](adr/0010-site-config-and-feature-flags.md)).

The gate keeps you honest: `npm run literals` fails on an event, organizer or
origin literal outside the config and the content JSON; `npm run flags-off`
fails on a section a flag did not remove cleanly.

## The yearly switch

`devfest.cz` always belongs to the current or next edition; the one that
ended moves to `devfest.cz/<year>` as a frozen build
([ADR 0011](adr/0011-root-for-the-next-edition-archives-under-the-year.md)).

1. **Archive it**, on the last commit whose config still builds the
   edition (`features.edition` on): `npm run archive -- <year>`. It freezes
   `/api/lineup` and the speaker photos, builds the site under `/<year>`
   with `app` and `newsletter` off, fails on any URL outside `/<year>`, and
   writes `archive/<year>/`. Commit it whole; never edit it by hand.
2. **Switch the root to the teaser** in `src/site.config.ts`:
   `features.edition` off with `tickets`, `invoice`, `invite`, `workshops`,
   `attending` and `partners`; `upcoming` set to what is announced
   (`edition`, `season`, `city`; never a day or a venue). `event` keeps the
   archived edition's facts until the next one has a date.
3. **Redirect what moved**: `firebase.json` → `redirects`, a 301 from every
   path the edition owned to `/<year>/…`. Hosting applies redirects before
   static files.
4. **The teaser's year-bound assets**: `public/df27-logo.svg`,
   `public/favicon-2027.svg`, `public/og-2027.jpg`, and the season lettering
   in `src/components/teaser/SeasonMark.astro` (drawn for "Fall 2027"; any
   other season is set as type until it is drawn). `src/routes/teaser.astro`
   names them.
5. **After the deploy**: submit `https://devfest.cz/sitemap-index.xml` in
   Search Console; it lists the archive's pages too.
6. **When the next edition has a date**: `event` becomes that edition,
   `upcoming` goes, `features.edition` (and what the edition runs) on, and
   the redirect of every path it reclaims is deleted in the same change.
   Then "A new edition" below.

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
   sheet on the home page; `src/routes/index.astro` names the frames).
5. **Copy that names the day**: the home page's past-editions line
   (`index.astro`, "Eleven editions since 2012"), the "flying in" and "last
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
   | `edition` | the event home (the teaser of `upcoming` takes `/`), `/agenda`, `/speakers`, the share pages, `/venue`, `/faq`, `/team`, `/contact`, `/press`, `/tv`, `/calendar.ics` | |
   | `tickets` | the ticket section, `/thank-you`, every "Get tickets" action, the JSON-LD offers | `edition` |
   | `invoice` | `/invoice` and its links | `tickets` |
   | `workshops` | `/workshops` and its links | `app`, `edition` |
   | `app` | `/app`, `/login`, `/delete-account`, the store badges | |
   | `invite` | `/invite/<member>` and its OG cards | `tickets` |
   | `partners` | `/partners`, the partner bands, the TV credits | |
   | `newsletter` | the form, `/newsletter-subscription-thank-you`, every "Get notified" link, the home hero's "Stay in the loop" | |
   | `attending` | `/attending`, `/speaker-card` | `edition` |

   Not flags of their own: `/tv` (delete `src/routes/tv.astro`) and
   `/press` (delete `src/routes/press.astro`, `src/routes/press/` and the
   band in `src/routes/contact.astro`). Flags own routes, links and sections, never
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
   `docs/design-2026.md`; the 2027 teaser uses the system sans stack,
   `docs/design.md`); the design record is yours to replace through the
   Impeccable loop (`.claude/rules/design.md`). `public/.well-known/` holds
   the iOS app links for the DevFest app; replace or delete.
8. **The organizer's details in content**: `team.json`, `socials.json`,
   the contact desks in `src/routes/contact.astro` (named e-mails), the
   Code of Conduct listener.

## What the guard excludes, and why

`npm run literals` skips the three legal pages (prose), `src/lib/press-kit.ts`
(brand asset file names, listed above), tests and comments. Everything else
under `src/` reads the config.
