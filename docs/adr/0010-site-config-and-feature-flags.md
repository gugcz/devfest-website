# 0010. Every edition fact lives in one typed site config; sections switch off by flag

- Status: accepted
- Date: 2026-10-31
- PR: the config in the first PR of the plan
  [2026-10-31-refactor-site-config-and-feature-flags-plan.md](../plan/2026-10-31-refactor-site-config-and-feature-flags-plan.md);
  each later phase appends its paragraph and PR link below

## Context

After the 2026 edition the repo was reusable as code but not as
configuration. `src/lib/event.ts` held the event facts, yet most pages,
components, the canvas cards and the Cloud Functions repeated the event name,
the date (in six spellings), the venue, the organizer's contacts and the
origin as literal strings; the social links were kept twice; the Firebase
identity sat in nine places. A new edition meant editing about seventy files
by hand. A chapter that runs no workshops, no company invoices or no mobile
app had to delete routes, menu items, footer links, sitemap filters and
`llms.txt` lines. The repo is public and meant to be reused
([brainstorm](../brainstorm/2026-10-31-reusable-site-config-brainstorm-doc.md)).

## Decision

- **One typed module, `src/site.config.ts`**, holds every fact about the
  edition, the organizer and the deployment that the site states more than
  once: the dates and hours, the venue, the brand and the pitch, the
  organizer's names and contact, the origin, the Firebase web config, the
  functions region, the hosting site and the app ids. Its shape is
  `SiteConfig` in `src/lib/site-config.ts`, whose comments say which fields
  change per edition and which only per chapter. Secrets stay Firebase
  params; the Firebase web config and the App Check site key were already in
  the bundle.
- **Everything derives from it.** `src/lib/event.ts` keeps its `EVENT`
  export but computes every field from the config; `src/lib/dates.ts`
  formats the dates in the event's time zone, one style per spelling the site
  uses; the calendar file and `robots.txt` are build-time endpoints read from
  the config instead of hand-kept files in `public/`; `astro.config.ts` takes
  `site` and the sitemap priorities from it; `src/lib/firebase.ts` reads the
  web config and the App Check key from it.
- **Planned in the same plan, recorded here when they land:** the literal
  sweep with a `literals` guard in the gate (phase 2), the feature flags that
  remove routes (phase 3), the functions' mirror `functions/src/site.ts`
  with derived CORS lists (phase 4), the social, topic and press-coverage
  content collections (phase 5), `docs/adapting.md` (phase 6).

## Consequences

- A new edition starts as a change to `src/site.config.ts`; until phase 2
  lands, the pages still carry their literals and `npm run literals` does
  not exist yet.
- The calendar file moved from `/devfest-cz-2026.ics` to `/calendar.ics`;
  nothing linked the old name.
- `EVENT` now pulls the whole config and the `Intl` formatters into every
  island that imports it (the countdown, the TV screen, the sheets, the
  tickets): about 2.5 kB more client JS, and the clock strings on `/tv`
  come from the TV's ICU rather than a string slice (`en-GB` defaults to a
  24-hour clock, so the output is the same; check a venue TV before the
  next edition).
- `INVOICES_CLOSE` in `functions/src/invoice/submit.ts` still repeats
  `event.invoicesClose` by hand until the functions mirror lands.
- The legal pages (privacy policy, delete account, code of conduct) read the
  organizer from the config but their prose is not templated; another
  chapter rewrites them.
