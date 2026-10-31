---
title: "refactor(site): one site config, feature flags and typed content so the next edition is a config change"
type: refactor
date: 2026-10-31
---

## One site config, feature flags and typed content - Extensive

Brainstorm: [2026-10-31-reusable-site-config-brainstorm-doc.md](../brainstorm/2026-10-31-reusable-site-config-brainstorm-doc.md).
Reviewed on 2026-10-31 by the simplicity, convention and scope agents; their
findings are folded in below (fewer flags, fewer helpers, no new collection
that one page owns, docs in the PR of the change, six PRs).

## Overview

Every fact about the event, the organizer and the deployment moves into one
typed module, `src/site.config.ts`. Every page, component, build-time
endpoint and (through a mirror) every Cloud Function reads from it. A
`features` block turns whole sections of the site on and off: a flag set to
`false` removes the routes, the links, the sitemap entries, the structured
data and the `llms.txt` lines in one place. Data that is kept twice today
(social links) or lives in TypeScript without a schema (topics, press
coverage) becomes content collections with zod schemas. The public repo gets a
LICENSE, a CONTRIBUTING guide and `docs/adapting.md`, the checklist for a new
edition or a new chapter.

Six phases, each its own PR against `2026`, each leaving `npm run verify`
green. With every flag on, the site renders the same HTML after phases 1 to 5
except where the plan names a line; the diff is in where the words come from.

## Problem Statement

The audit of 2026-10-31 (in the brainstorm) found:

- "DevFest.cz 2026" in about 45 page titles and descriptions, 10 components,
  the two canvas cards and the invoice e-mails. `EVENT.name` exists and is
  read by almost none of them.
- The date in six spellings outside `src/lib/event.ts`: `30 / 10 / 26`
  (`Menu.astro:182`, `SpeakerDetail.tsx:72`, `invite/[member].astro:127`),
  `30.10.2026` (`SpeakerCard.tsx:523`, `AttendingCard.tsx:906`),
  `30 OCT 2026 · LIBČICE NAD VLTAVOU` (`speaker-card.ts:254`,
  `attending-card.ts:308`), `datetime="2026-10-30"` (`index.astro:112,161`),
  the JSON-LD ISO strings (`BaseLayout.astro:74-77`) and the hand-written
  `public/devfest-cz-2026.ics`. `INVOICES_CLOSE` is defined twice
  (`event.ts`, `functions/src/invoice/submit.ts:23`).
- "CET" in copy in nine files.
- `https://devfest.cz` as a literal in `astro.config.mjs` (sitemap
  priorities), `static-api.ts:11`, `BaseLayout.astro:33`, `Share.astro:30`,
  `og.ts:74`, `public/robots.txt`, the invoice e-mail and `invite/[member].astro`.
- The Firebase identity in `firebase.ts` (web config, `ANALYTICS_HOSTS`),
  `.firebaserc`, `firebase.json`, three workflows, three CORS lists in the
  functions, `FUNCTIONS_REGION` in `InvoiceForm.tsx:18` and
  `workshops.ts:15`, and the GA id in the privacy policy prose.
- The organizer with no config: `devfest@gug.cz` about 30 times, the social
  links as two hand-kept lists (`Footer.astro:6-29`, `BaseLayout.astro:116`).
- No switch for a section. A chapter without workshops, invoices or the app
  deletes routes, menu items, footer links, sitemap filters and `llms.txt`
  lines by hand.
- No `LICENSE`, no `CONTRIBUTING.md`, no guide for adopting the repo.

## Proposed Solution

### `src/site.config.ts`

One module, one default export, typed by `SiteConfig` in
`src/lib/site-config.ts` (the type lives apart from the values so the
functions mirror and `docs/adapting.md` can point at it). Only facts that two
or more places read go in; a single-use fact stays where it is used. The
type's comments say which fields change per edition and which only per
chapter.

```ts
// src/site.config.ts — every fact about this edition. docs/adapting.md walks the fields.
import type { SiteConfig } from './lib/site-config';

const config: SiteConfig = {
	event: {
		name: 'DevFest.cz',          // brand, without the year
		edition: 2026,               // eventName() = "DevFest.cz 2026"
		hashtag: '#DevFestCZ',
		timeZone: 'Europe/Prague',
		timeZoneLabel: 'CET',        // what the copy says after a time
		doors: '2026-10-30T08:00:00+01:00',
		start: '2026-10-30T09:00:00+01:00',
		end: '2026-10-30T19:00:00+01:00',
		afterpartyEnd: '2026-10-30T23:00:00+01:00',
		invoicesClose: '2026-10-30T07:00:00+01:00',
		tagline: "Prague's developer conference & festival",
		pitch: 'AI agents, generative UI, cloud & backends, mobile & web accessibility, and the humans behind it.',
		previousEditionUrl: 'https://2025.devfest.cz',
		venue: { name: 'Uhelný Mlýn', street: 'Areál Šroubáren 860', postalCode: '252 66', city: 'Libčice nad Vltavou', region: 'Central Bohemia', country: 'CZ', mapUrl: '…' },
	},
	organizer: { name: 'GUG.cz', legalName: 'GUG.cz, z.s.', url: 'https://gug.cz', email: 'devfest@gug.cz', repoUrl: 'https://github.com/gugcz/devfest-website' },
	site: {
		url: 'https://devfest.cz',
		firebase: { /* the web config from src/lib/firebase.ts, unchanged */ },
		functionsRegion: 'europe-west1',
		hostingSite: 'devfest-public',
		analyticsHosts: ['devfest.cz', 'devfest-public.web.app', 'devfest-public.firebaseapp.com'],
		appCheckSiteKey: '…',
	},
	apps: { android: 'cz.devfest.app', iosId: '6818298786', pwaUrl: 'https://app.devfest.cz' },
	features: { tickets: true, invoice: true, workshops: true, app: true, invite: true, partners: true, newsletter: true, attending: true },
};
export default config;
```

Secrets stay Firebase params. The web Firebase config and the App Check site
key already ship in the bundle today; they move, they are not newly exposed.

### Derived facts, not more config

`src/lib/event.ts` keeps its `EVENT` export so its importers do not change in
phase 1, but every field is derived from the config. `eventName()` returns
`${name} ${edition}`; `pageTitle(section)` returns `${eventName()} — ${section}`
for the titles that follow that shape. One formatter in `src/lib/dates.ts`,
`formatDate(iso, style)`, over a style table with the spellings the site uses
and more than one caller: `label` (`30 October 2026`), `short` (`30 Oct 2026`),
`slash` (`30 / 10 / 26`), `dots` (`30.10.2026`), `stamp` (`30 OCT 2026`),
`iso` (`2026-10-30`). It uses `Intl.DateTimeFormat('en-GB', { timeZone })`
with the config's time zone, so the DST comment in `event.ts` becomes a test.
The time-zone abbreviation is the config string `timeZoneLabel`, not a
computed value (one edition, one label; no Node-versus-browser `Intl` risk).

### Calendar file as a build-time endpoint

`public/devfest-cz-2026.ics` becomes `src/pages/calendar.ics.ts`, rendered
from the config (`DTSTART`/`DTEND` from `event.doors`/`event.end`, `SUMMARY`
from `eventName()`, `LOCATION` from the venue). `EVENT.icsUrl` becomes
`/calendar.ics`; the two pages that print it (`thank-you.astro:89`,
`llms.txt.ts:60`) change by that one href, which the phase 1 diff names.
Likewise `public/robots.txt` cannot read the config, so it becomes
`src/pages/robots.txt.ts`.

### Feature flags remove routes

Astro builds every file under `src/pages/`, and a static page has no
`getStaticPaths` to return empty. The documented way to add a route
conditionally is `injectRoute` from an integration's `astro:config:setup`
hook (Astro integrations reference). So:

- Flagged pages move to `src/routes/` with the same nesting
  (`src/routes/workshops.astro`, `src/routes/invite/[member].astro`, …).
  Their relative imports keep working because the depth is unchanged.
- `src/integrations/feature-routes.ts` holds one
  `Record<FeatureFlag, string[]>` of route patterns and calls `injectRoute`
  for each enabled flag. Unflagged pages stay in `src/pages/`.
- Eight flags, the sections a chapter may not run: `tickets`, `invoice`,
  `workshops`, `app`, `invite`, `partners`, `newsletter`, `attending`. Not
  flags: `tv` (unlisted, links nothing, delete the page if unwanted),
  `press` (half of it is a band inside `/contact`; delete the two pages and
  the band if unwanted). `docs/adapting.md` says so.

| Flag | Routes (moved to `src/routes/`) | Also gated (routes, links, whole sections) |
| --- | --- | --- |
| `tickets` | `thank-you` | home `#tickets` section with `TicketIndex`, `HeroOffer`, hero CTA, menu CTA, footer link, Event JSON-LD `offers`, `llms.txt` Tickets section, the `/#tickets` links (`Sheet.tsx`, `agenda`, `speakers`, `venue`, `workshops`, `404`, `newsletter-subscription-thank-you`, `InviteCta` fallback), FAQ "Tickets" group |
| `invoice` | `invoice` | footer link, the invoice line in the Tickets section and `TicketIndex`, `404` card, `invoicesOpen()` returns `false`, FAQ items that link `/invoice` |
| `workshops` | `workshops` | footer link, the agenda's "Save a workshop seat" bar, `llms.txt` Workshops section, FAQ group |
| `app` | `app`, `login/index`, `delete-account` | `StoreBadges` band on home, footer "Get the app", `404` card, FAQ item. `.well-known/apple-app-site-association` and the privacy policy's app sections stay (static file, legal prose) |
| `invite` | `invite/[member]`, `og/invite/[member].jpg` | `InviteCta`, `og-version.ts` reading the invite files at build, Menu's `isInvite` branch |
| `partners` | `partners` | home partners band, menu and footer links, `llms.txt` line, the TV credits band, FAQ item |
| `newsletter` | `newsletter-subscription-thank-you` | `NewsletterForm` section on home, footer link, the `#newsletter` links (Tickets footnotes; `Speakers` and `Sessions` empty states keep their sentence and drop the link), FAQ items |
| `attending` | `attending`, `speaker-card` | footer link, thank-you page CTA, FAQ item (both canvas cards share `attending-card.ts`) |

**Flags own routes, links and sections, not prose.** A sentence that names a
feature ("talks and workshops in English", the agenda's "Workshops only" room
label, the privacy policy's processors, the contact desks) is left as
written; `docs/adapting.md` lists these spots. The one exception is the
default meta description's "Tickets on sale now", a call to action, which is
gated.

**Dependencies are three lines in the config module**, not a helper: after
the object is built, `if (features.invoice && !features.tickets) throw new
Error(…)`, the same for `invite ⇒ tickets` and `workshops ⇒ app`. A build
with an impossible combination fails with a sentence. `tv` with `partners`
off renders no credits band.

**One `enabled(flag)` and one `ticketsHref`.** `src/lib/features.ts` exports
`enabled(flag)` and `ticketsHref` (`'/#tickets'` or `null`). The link lists
that exist today (`Menu.astro`, `Footer.astro`, `BaseLayout.astro`'s
`pageNames`, `404.astro`'s cards, `llms.txt.ts`'s `PAGES`) each gain an
optional `feature` key and are filtered once with `enabled`. Templates decide
what to render when `ticketsHref` is `null`; the hero and the menu render
nothing (the countdown stays). No CTA fallback chain.

**Flags off for a check.** The config module reads
`process.env.DEVFEST_FEATURES_OFF` (comma-separated flags, build time only,
the same `DEVFEST_*` convention as `DEVFEST_LIVE_API`) and sets those flags
to `false`. `scripts/flags-off-build.mjs` builds once with every optional
flag off (`tickets` stays on so the dependencies hold; a second run turns
`tickets`, `invoice` and `invite` off together) into `dist/` and asserts: no
flagged route directory, none in `dist/sitemap-0.xml`, and no `href` to a
flagged route or to `#tickets`/`#newsletter` in any built page. `npm run
a11y` is not run in that state.

**Sweeps.** `scripts/a11y.mjs` and `scripts/anchor-measure.mjs` keep their
route lists and skip a route whose `dist/<route>/index.html` is missing,
logging the skip; the two route-specific steps (`anchor-measure.mjs:58`,
`:280`) are guarded the same way. The sitemap lists only built pages.

**Cloud Functions and `firebase.json` are not gated.** ESM exports cannot be
conditional and Firebase discovers functions from them; `firebase.json` is
static JSON. A deployed function behind a flag off costs nothing and breaks
nothing; a rewrite to a function that is not deployed answers 404 as the
missing page would. `docs/adapting.md` names the export line and the rewrite
per domain, and that `invoice/` imports `tickets/` params.

### The functions mirror

The functions build is a separate `tsconfig` (`rootDir: src`) and cannot
import `../../src/site.config.ts`. `functions/src/site.ts` holds the subset
the functions need (`eventName`, `invoicesClose`, `siteUrl`, `hostingSite`,
`organizer`, `contactEmail`, `fromEmail`, `region`, `timeZone`) and derives
the two CORS lists: `siteOrigins()` for the callables, `appOrigins()` for
`lineupApi`. `functions/src/site.test.ts` asserts the derived patterns accept
`https://devfest.cz`, `https://www.devfest.cz`, a preview host,
`https://app.devfest.cz` (app list) and `http://localhost:4321`, and reject
`https://evil.example`. A comment at the top of both files names the other;
a shared package is the follow-up named in the brainstorm. A PR preview hits
production functions (CLAUDE.md), so the phase runs the compiled callables in
the emulator against the preview origin and the app origin before the PR is
marked ready; the deploy on merge is the maintainer's.

### Content collections

Three new JSON files in `src/content/`, schemas in `src/content.config.ts`,
each with the `order` field the existing collections carry (the file loader
gives no ordering guarantee, see the comment in `content.config.ts`):

| Collection | Replaces | Shape |
| --- | --- | --- |
| `socials.json` | `Footer.astro` `SOCIALS`, `BaseLayout.astro` `sameAs`, `twitter:site` | `{ id, order, network, url, label }`; `network` is a string that selects the SVG path from the map that stays in `Footer.astro` |
| `topics.json` | `src/lib/topics.ts` | `{ id, order, name, desc }` |
| `press-coverage.json` | `MEDIA_COVERAGE` in `press-coverage.ts` | `{ id, order, href, outlet?, title?, date?, image?, description? }` (the OG scrape stays) |

Not collections: the venue route (two steps on one page, read
`config.event.venue`), the contact desks (four entries on three pages, read
`config.organizer.email`). `faq.json` groups and items gain
`feature?: enum(flags)` in phase 3. The mobile app bundles `faq.json` and
`partners.json` verbatim (CLAUDE.md); an added optional field is backward
compatible, filtering happens at render time, and the maintainer confirms
with the app before phase 3 merges.

### Docs and open-source basics

- ADR `docs/adr/0010-site-config-and-feature-flags.md` lands in phase 1
  (Decision and Consequences; the flags phase appends a paragraph), per
  `.claude/rules/docs.md`: same PR as the change.
- CLAUDE.md map and rules table, README's key pages and the path-scoped
  rules change in the phase that changes the files they describe.
- Phase 6: `LICENSE` (MIT, "Copyright (c) 2026 GUG.cz, z.s.", the maintainer
  confirms before merge), `CONTRIBUTING.md`, `docs/adapting.md`.
- The production branch and the Firebase project id stay literals in the
  four workflow files (`on.push.branches` is a literal glob;
  `--project devfest-cz-app` is three lines). `docs/adapting.md` lists them.
  The brainstorm's "branch as a workflow variable" is dropped for that
  reason, see Alternatives.

## Technical Approach

### Architecture

```
src/site.config.ts ──typed by──> src/lib/site-config.ts (SiteConfig)
        │   (reads DEVFEST_FEATURES_OFF at build; three dependency checks)
        ├─> src/lib/event.ts        (EVENT, derived; unchanged export surface)
        ├─> src/lib/dates.ts        (formatDate(iso, style))
        ├─> src/lib/features.ts     (enabled(flag), ticketsHref, FeatureFlag)
        ├─> src/integrations/feature-routes.ts  (injectRoute per enabled flag)
        ├─> astro.config.ts         (site, sitemap priorities keyed by path)
        ├─> src/layouts/*, src/components/*, src/pages/*, src/routes/*
        └─> src/pages/{calendar.ics,robots.txt,llms.txt}.ts

functions/src/site.ts  (mirror; comment points at src/site.config.ts)
        ├─> invoice/{submit,email-template,params,process}.ts
        ├─> workshops/register.ts, lineup/lineup-api.ts (derived CORS)
        └─> options.ts (region, timeZone)

src/content/{socials,topics,press-coverage}.json ──zod──> content.config.ts
```

`astro.config.mjs` becomes `astro.config.ts` so it can import the TypeScript
config (Astro supports `astro.config.ts`, configuration guide). Everything
that names the file follows in the same phase: `package.json` `complexity`,
the `paths:` of `.claude/rules/pages.md` and `.claude/rules/api.md`, the
CLAUDE.md rules table, and `docs/design.md`'s four citations through
`update-docs`.

### Tests on the site side

`src/lib/dates.test.ts` and `src/lib/features.test.ts` run with
`node --experimental-strip-types --test 'src/**/*.test.ts'` as
`npm run test:site`, no new dependency (the flag is accepted on the Node 22
line `.nvmrc` pins and on newer; the phase verifies it on the CI Node before
merge). `test:site` joins `verify` and gets its own job in
`correctness.yml`, since that workflow mirrors `verify` job by job.
`tsconfig.json` includes `**/*`, so `astro check` type-checks the tests too.

### Literal guard

`npm run literals` is one grep in `package.json`, no script file:

```
! grep -rnE "DevFest\.cz 2026|2026-10-30|30 October|30 Oct|30 / 10 / 26|30\.10\.2026|https://devfest\.cz|devfest@gug\.cz|Libčice|Uhelný" src --include='*.astro' --include='*.ts' --include='*.tsx' --exclude=site.config.ts --exclude=privacy-policy.astro --exclude=delete-account.astro --exclude=code-of-conduct.astro --exclude=press-kit.ts --exclude='*.test.ts'
```

Excluded with a reason: the three legal pages (prose, not templated),
`press-kit.ts` (brand asset file names, listed in `docs/adapting.md`), tests
(fixtures). Comments that mention the domain as an example
(`src/lib/tito.ts:248`, the functions' `devfest_mobile_app` repo name) are
reworded so the guard needs no comment stripping. `literals` joins `verify`
and the `complexity` job in `correctness.yml` in phase 2.

### Phase order and why

1. Config foundation, no sweep: the new module, the type, derived `EVENT`,
   the formatter, the two endpoints, the ADR. Small, the one PR that needs
   a careful read.
2. The sweep: every literal in `src/` replaced by a read, the guard turned
   on. Large and mechanical; reviewed by the `dist/` diff.
3. Flags: the integration, the moves, the gating. Two commits in one PR
   (move, then gate) so `git diff -M` reads the move alone.
4. Functions mirror: only `functions/`; independent of 1 to 3, built in a
   parallel worktree from the start, merged whenever ready.
5. Collections: after 3, since it edits `Footer`, `BaseLayout`, `index`,
   `contact` and `routes/partners`.
6. LICENSE, CONTRIBUTING, `docs/adapting.md`, written against the finished
   code.

Parallel: phase 4 alongside everything; phases 1 to 3 and 5 are a chain.

## Implementation Phases

### Phase 1: config foundation

- **Status:** Done
- **Scope:** `src/site.config.ts` and `SiteConfig`; `EVENT` derived from it;
  `formatDate`; `eventName()`/`pageTitle()`; `calendar.ics` and `robots.txt`
  endpoints; `astro.config.ts`; the ADR; the docs that name the renamed and
  new files. No literal outside these files changes yet.
- **Files touched:** `src/site.config.ts` (new), `src/lib/site-config.ts`
  (new), `src/lib/dates.ts` (new), `src/lib/dates.test.ts` (new),
  `src/lib/event.ts`, `src/pages/calendar.ics.ts` (new),
  `src/pages/robots.txt.ts` (new), `public/devfest-cz-2026.ics` (deleted),
  `public/robots.txt` (deleted), `src/pages/thank-you.astro` and
  `src/pages/llms.txt.ts` (the `icsUrl` read only), `astro.config.mjs` →
  `astro.config.ts` (imports the config for `site` and the sitemap
  priorities keyed by path), `package.json` (`complexity`, `test:site`,
  `verify`), `.github/workflows/correctness.yml` (`site-test` job),
  `.claude/rules/pages.md` and `.claude/rules/api.md` (`paths:`),
  `CLAUDE.md` (map, commands, rules table), `README.md` (key pages: the two
  endpoints), `docs/adr/0010-site-config-and-feature-flags.md` (new),
  `docs/adr/README.md`, `docs/design.md` (the `astro.config` citations, via
  `update-docs`).
- **Acceptance criteria:** `npm run build` output equals the `2026` build
  after normalising the build stamps (`BUILD_DATE`, `BUILD_DAY`) except:
  `/calendar.ics` replaces `/devfest-cz-2026.ics`, and the href on
  `/thank-you` and in `/llms.txt`. `dist/calendar.ics` contains
  `DTSTART:20261030T070000Z`. `dist/robots.txt` names
  `https://devfest.cz/sitemap-index.xml`. `npm run test:site` passes on the
  CI Node.
- **Validation:** `npm run verify` (now including `test:site`) and
  `manual 1. build 2026 and this branch; 2. diff -r the two dist/ trees with the two stamps and the .ics href sed-normalised; 3. confirm the diff is empty` (the diff is run in the PR, not committed).

### Phase 2: the literal sweep and the guard

- **Status:** Not started
- **Scope:** Every event, organizer and origin literal in `src/` and the a11y
  fixtures replaced by a read from the config, `EVENT`, `formatDate` or
  `pageTitle`; `npm run literals` added to `verify` and to the
  `complexity` job.
- **Files touched:** `src/layouts/{BaseLayout,Share}.astro`,
  `src/components/{Menu,Footer,StoreBadges,TalkIndex,SpeakerIndex}.astro`,
  `src/components/{SpeakerCard,AttendingCard,SpeakerDetail,Countdown,SpeakersTeaser,Agenda,Sessions,Speakers,Tickets,InvoiceForm,NewsletterForm,TvScreen,InviteCta}.tsx`,
  `src/lib/{invite,static-api,og,firebase,app-links,speaker-card,attending-card,workshops,tito}.ts`,
  every `src/pages/**/*.astro` with a title, description, date, contact or
  origin (including `404`, `team`, `press/downloads`, `invite/[member]`),
  `src/pages/llms.txt.ts`, `scripts/a11y-mocks/fixtures.mjs` (dates from one
  constant), `package.json` (`literals`, `verify`),
  `.github/workflows/correctness.yml` (`literals` step in the complexity
  job).
- **Acceptance criteria:** `npm run literals` exits 0; the `dist/` diff
  against phase 1 is empty after the same normalisation; the canvas cards
  still draw `30 OCT 2026 · LIBČICE NAD VLTAVOU` (`formatDate(…, 'stamp')`
  plus `venue.city.toUpperCase()`).
- **Validation:** `npm run verify` and `manual 1. diff -r the phase 1 and phase 2 dist/ trees, stamps normalised; 2. empty; 3. open /attending in the preview and download a card: the date line reads 30 OCT 2026 · LIBČICE NAD VLTAVOU`.

### Phase 3: feature flags and injected routes

- **Status:** Not started
- **Scope:** `features` block with the three dependency checks and
  `DEVFEST_FEATURES_OFF`; `src/lib/features.ts`; the `feature-routes`
  integration; flagged pages moved to `src/routes/` (commit 1); links,
  sections, JSON-LD offers, `llms.txt` sections and `faq.feature` gated
  (commit 2); the sweeps skip missing routes; `flags-off-build.mjs`.
- **Files touched:** `src/site.config.ts`, `src/lib/site-config.ts`,
  `src/lib/features.ts` (new), `src/lib/features.test.ts` (new),
  `src/integrations/feature-routes.ts` (new), `astro.config.ts`,
  `src/routes/**` (moved from `src/pages/`: `thank-you`, `invoice`,
  `workshops`, `login/index`, `app`, `delete-account`, `invite/[member]`,
  `og/invite/[member].jpg`, `partners`, `newsletter-subscription-thank-you`,
  `attending`, `speaker-card` and their `.scss`),
  `src/lib/{event,og-version,tv}.ts`,
  `src/components/{Menu,Footer,StoreBadges,Closer,EndLine,TicketIndex}.astro`,
  `src/components/{HeroOffer,Tickets,Speakers,Sessions,Sheet,Agenda,InviteCta,NewsletterForm,TvScreen}.tsx`,
  `src/layouts/BaseLayout.astro`,
  `src/pages/{index,agenda,speakers,venue,faq,404}.astro`,
  `src/pages/llms.txt.ts`, `src/content.config.ts`, `src/content/faq.json`,
  `scripts/a11y.mjs`, `scripts/anchor-measure.mjs`,
  `scripts/flags-off-build.mjs` (new), `package.json` (`flags-off`),
  `.claude/rules/pages.md` (routes also under `src/routes/`, the flag
  table), `CLAUDE.md` (map: `src/routes/`, `src/integrations/`; rules
  table), `README.md` (key pages marked with their flag),
  `docs/adr/0010-…md` (flags paragraph).
- **Acceptance criteria:** with every flag on, the `dist/` diff against
  phase 2 is empty; `node scripts/flags-off-build.mjs` passes both runs
  (described above); `features.test.ts` proves that `invoice` on with
  `tickets` off throws with a one-sentence message; the mobile app's owner
  has confirmed the extra optional `feature` field in `faq.json`.
- **Validation:** `npm run verify && npm run flags-off` and
  `manual 1. diff the phase 2 and phase 3 dist/ trees, stamps normalised, empty; 2. confirm the faq.json field with the app repo`.

### Phase 4: the functions mirror

- **Status:** Done
- **Scope:** `functions/src/site.ts` with derived CORS origins and the brand
  block; `INVOICES_CLOSE`, `BRAND`, `INVOICE_FROM_*`, the iDoklad line
  description in `process.ts`, the three CORS lists and `REGION`/`TIME_ZONE`
  read from it; comments that name the domain reworded.
- **Files touched:** `functions/src/site.ts` (new),
  `functions/src/site.test.ts` (new), `functions/src/options.ts`,
  `functions/src/invoice/{submit,email-template,params,process}.ts`,
  `functions/src/workshops/register.ts`, `functions/src/lineup/lineup-api.ts`,
  `functions/src/lineup/speaker-photo-api.ts` (comment),
  `.claude/rules/backend.md` (the mirror and its rule).
- **Acceptance criteria:** `grep -rnE "devfest|gug|2026" functions/src --include='*.ts' --exclude=site.ts --exclude='*.test.ts'` prints nothing; `npm --prefix functions test` includes the origin tests (accept the site, `www.`, a site preview host, the app origins and localhost; reject `https://evil.example`, the app's own preview host against the site list, `https://www.app.devfest.cz`, `https://localhost:4321`) and passes; the derived `RegExp.source` strings equal the old literals.
- **Validation:** `npm run verify`. The emulator cannot prove the CORS lists: `firebase emulators:start` sets `enableCors` in `FIREBASE_DEBUG_FEATURES`, and `firebase-functions` then answers every origin (`v2/providers/https.js`), so the unit tests are the evidence. The PR body's Behavior section states that previews hit production functions and the deploy is the maintainer's.

### Phase 5: content collections

- **Status:** Not started
- **Scope:** `socials`, `topics` and `press-coverage` collections with zod
  schemas; `Footer`, `BaseLayout` and the pages read them; `topics.ts`
  deleted.
- **Files touched:** `src/content/{socials,topics,press-coverage}.json`
  (new), `src/content.config.ts`, `src/lib/topics.ts` (deleted),
  `src/lib/press-coverage.ts`, `src/components/Footer.astro`,
  `src/layouts/BaseLayout.astro`, `src/pages/{index,contact}.astro`,
  `src/pages/llms.txt.ts`, `CLAUDE.md` (map: the content files),
  `README.md` if it lists the content files.
- **Acceptance criteria:** `npm run check` validates the three files; the
  `dist/` diff against phase 3 is empty; `sameAs` in the Organization
  JSON-LD and the footer icons list the same URLs in the same order.
- **Validation:** `npm run verify` and `manual 1. diff the phase 3 and phase 5 dist/ trees, stamps normalised; 2. empty`.

### Phase 6: LICENSE, CONTRIBUTING, adapting guide

- **Status:** Not started
- **Scope:** `LICENSE` (MIT), `CONTRIBUTING.md`, `docs/adapting.md`; README
  gains the "Adapting the site" pointer; `docs/product.md` names the flags.
- **Files touched:** `LICENSE` (new), `CONTRIBUTING.md` (new),
  `docs/adapting.md` (new), `README.md`, `docs/product.md`,
  `.claude/rules/docs.md` (where `adapting.md` sits).
- **Acceptance criteria:** `docs/adapting.md` has a line for every top-level
  key of `SiteConfig` and every flag, the four workflow lines with the
  branch and project id, the function export lines and rewrites per domain,
  the brand assets with the year in their name, the prose spots that name a
  feature, and the `faq.json`/`partners.json` app constraint; every path it
  names exists (`grep -oE '`[^`]+`' docs/adapting.md` checked against the
  tree in the PR); the maintainer has confirmed the license text.
- **Validation:** `npm run verify && test -f LICENSE && test -f CONTRIBUTING.md && grep -q 'MIT License' LICENSE` and `manual 1. walk docs/adapting.md's new-edition checklist on a scratch branch, changing only the config and content; 2. git diff --stat touches no .astro, .tsx or functions .ts file`.

## Alternative Approaches Considered

- **Environment variables instead of a config module.** Rejected: twenty
  `PUBLIC_*` names hide the facts in CI settings and give no type checking;
  the repo's own `PUBLIC_SITE_URL` fallback shows the drift that causes.
- **Hiding a disabled section with `display: none` or an early `return`.**
  Rejected: the route, its sitemap entry and its JSON-LD still ship.
- **Empty `getStaticPaths` or a 404 `Response` from a prerendered page.**
  `getStaticPaths` exists only on dynamic routes; the Astro docs document
  `injectRoute` for adding routes conditionally and document that rewriting
  a 404 inside a static page is not allowed; nothing documents a prerendered
  page skipping its own output. Not used.
- **Ten flags, a CTA fallback chain, an `assertFeatures` helper, a
  `tzAbbr` formatter, `travel` and `contacts` collections, four helper
  scripts.** In the first draft; cut by the simplicity review as single-use
  or speculative. The flags left are the sections that need back-end or
  partner setup; the rest is "delete the page".
- **The production branch name as a workflow variable** (brainstorm key
  decision). Dropped: `on.push.branches` filters are literal globs; `vars`
  work only inside steps. The four lines are listed in `docs/adapting.md`.
- **One shared `contracts/` package for `src/` and `functions/`.** Deferred
  (brainstorm, approach 2); the functions mirror is the smallest step that
  removes the duplicated literals.
- **A template repository.** Rejected in the brainstorm: two repos for one
  chapter.

## Success Criteria

```success-criteria
GOAL: A new edition of the site, or another chapter's event, is a change to src/site.config.ts, the content JSON and the brand assets, with each back-end-backed section switchable by a flag; the public repo carries a license and an adopter's guide.

SUCCESS CRITERIA:
- No event, organizer or origin literal in src/ outside the config, the content JSON, the three legal pages and press-kit.ts | verify: npm run literals
- No such literal in functions/src outside site.ts and tests | verify: ! grep -rnE "devfest|gug|2026" functions/src --include='*.ts' --exclude=site.ts --exclude='*.test.ts'
- With every flag on, the built HTML matches the 2026 branch after normalising build stamps and the .ics href | verify: manual 1. build both; 2. diff -r with sed normalisation; 3. empty
- With every optional flag off, the build succeeds, dist/ and the sitemap hold none of the flagged routes, and no built page links to one or to #tickets / #newsletter | verify: npm run flags-off
- A config with invoice on and tickets off fails the build with a one-sentence error | verify: npm run test:site
- formatDate produces the six spellings for 2026-10-30 in Europe/Prague | verify: npm run test:site
- /calendar.ics is generated from the config with DTSTART in UTC from event.doors | verify: npm run build && grep -q '^DTSTART:20261030T070000Z' dist/calendar.ics
- Derived CORS origins accept the site, www, a preview host, the app origin and localhost, and reject others | verify: npm --prefix functions test
- The three collections validate at build time | verify: npm run check
- docs/adapting.md names every top-level SiteConfig key and every flag | verify: manual 1. list the keys of SiteConfig and FeatureFlag; 2. grep each in docs/adapting.md
- The repo carries LICENSE (MIT) and CONTRIBUTING.md | verify: test -f LICENSE && test -f CONTRIBUTING.md && grep -q 'MIT License' LICENSE
- The full gate stays green after every phase | verify: npm run verify

NON-GOALS:
- Sharing one TypeScript module between src/ and functions/ (follow-up: data contracts).
- Gating Cloud Functions or firebase.json rewrites by flag; adopters delete the export line and the rewrite.
- Gating prose that names a feature; flags own routes, links and sections.
- Flags for /tv and /press; adopters delete the pages.
- Templating the privacy policy, delete-account and code-of-conduct prose.
- Renaming the 2026 production branch or parameterising the workflow files.
- Changing anything a visitor sees with every flag on, beyond the .ics URL.

VERIFICATION COMMAND: npm run verify && npm run flags-off && test -f LICENSE && test -f CONTRIBUTING.md
```

## Success Metrics

- Lines a maintainer edits for the 2027 edition: the config fields, the
  content JSON and the asset files. Measured in phase 6 by walking the
  checklist on a scratch branch: `git diff --stat` touches no `.astro`,
  `.tsx` or functions `.ts` file.
- `npm run literals` stays at zero hits in CI from phase 2 on.

## Dependencies & Prerequisites

- Astro 7 `injectRoute` and `astro.config.ts` (documented in the
  integrations reference and the configuration guide).
- Node's `--experimental-strip-types` on the CI Node 22 line (checked in
  phase 1; fallback is `tsx` as a dev dependency, decided then).
- The mobile app's copy of `faq.json` tolerates an extra optional field
  (confirm in `ryzizub/devfest_mobile_app` before phase 3 merges).
- Maintainer confirmation of the MIT license and copyright line before
  phase 6 merges.
- The maintainer deploys phase 4's functions on merge; previews hit
  production functions.

## Risk Analysis & Mitigation

| Risk | Mitigation |
| --- | --- |
| A literal replacement changes rendered copy (a stray space, a different dash) | Every phase diffs `dist/` against the previous phase with build stamps normalised; the diff must be empty except the lines the phase names |
| Moving pages to `src/routes/` breaks a relative import or a co-located `.scss` | Same nesting depth; `astro check` and `build` catch a broken import; the a11y sweep loads every route; the move is its own commit |
| `injectRoute` with `getStaticPaths` on `invite/[member]` and `og/invite/[member].jpg` | Dynamic patterns are documented for `injectRoute`; the a11y list keeps `/invite/<member>/` |
| The `.ics` URL changes | Nothing on the site or in the app links the old name; phase 1 names the two changed lines; `docs/adapting.md` notes it |
| A wrong derived CORS pattern breaks the mobile app's PWA, not the site | Unit test with accept and reject cases; emulator check against `https://app.devfest.cz` before the PR is ready |
| Functions mirror drifts from the site config | Comment at the top of both; `docs/adapting.md` step; the follow-up contracts package |
| `faq.json` field breaks the app's parser | Optional field, confirmed against the app repo before merge |
| `--experimental-strip-types` behaves differently on CI | Phase 1 runs `test:site` in its own `correctness.yml` job on `.nvmrc`'s Node before merge |
| `DEVFEST_FEATURES_OFF` leaks into a production build | Read only at build time; the deploy workflows set no such variable; `flags-off-build.mjs` sets it for its child process only |

## Resource Requirements

Six PRs. Phase 4 in a parallel worktree from the start; phases 1, 2, 3, 5,
6 in sequence. Each phase fits one build session.

## Future Considerations

- Shared data contracts (`contracts/`) for lineup, tickets and workshops,
  imported by both sides and validated at the `/api/*` boundary.
- A `features.agenda` / `features.speakers` flag once a chapter runs the
  site before Sessionize exists; today the empty states cover it.
- Per-edition asset folders if the brand badge keeps the year.

## Documentation Plan

- Phase 1: ADR 0010 and its index line; CLAUDE.md map, commands and rules
  table; `.claude/rules/pages.md` and `api.md` paths; README key pages;
  `docs/design.md` citations via `update-docs`.
- Phase 3: `.claude/rules/pages.md` (routes under `src/routes/`, the flag
  table); CLAUDE.md map; README key pages with flags; ADR 0010 paragraph.
- Phase 4: `.claude/rules/backend.md`.
- Phase 5: CLAUDE.md map (content files).
- Phase 6: `LICENSE`, `CONTRIBUTING.md`, `docs/adapting.md`, README pointer,
  `docs/product.md`, `.claude/rules/docs.md`.

## References & Research

### Internal References

- Event facts today: `src/lib/event.ts:1-73`
- Content collections pattern: `src/content.config.ts:1-72`
- JSON-LD literals: `src/layouts/BaseLayout.astro:22-125`
- Social lists kept twice: `src/components/Footer.astro:6-29`,
  `src/layouts/BaseLayout.astro:116-121`
- Menu and footer link lists: `src/components/Menu.astro:32-49`,
  `src/components/Footer.astro:40-70`
- Sitemap priorities and filter: `astro.config.mjs:11-27, 128-140`
- Build-time origin: `src/lib/static-api.ts:11`
- Functions constants: `functions/src/options.ts:18-21`,
  `functions/src/invoice/params.ts:22-33`, `functions/src/invoice/submit.ts:17-39`,
  `functions/src/invoice/email-template.ts:16-25`,
  `functions/src/lineup/lineup-api.ts:27-31`, `functions/src/workshops/register.ts:100-104`
- a11y route list: `scripts/a11y.mjs:18-46`; anchor measure
  `scripts/anchor-measure.mjs:58,117-131,280`
- `llms.txt` page list: `src/pages/llms.txt.ts:21-34`
- Shared Firebase project rules: `docs/adr/0002-shared-firebase-project.md`,
  CLAUDE.md "Firebase shared project"
- Existing `DEVFEST_*` build-time env convention: `astro.config.mjs:69`,
  `src/lib/{lineup,tickets,workshops}-static.ts`

### External References

- Astro integrations reference, `injectRoute` and `astro:config:setup`:
  https://docs.astro.build/en/reference/integrations-reference/
- Astro configuration guide, `astro.config.ts`:
  https://docs.astro.build/en/guides/configuring-astro/
- Astro routing reference, `prerender` and rewrites:
  https://docs.astro.build/en/reference/routing-reference/
- GitHub Actions: `on.push.branches` are glob filters; `vars` context in
  steps: https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-variables

### Related Work

- Post-event cleanup that preceded this: #511, #510
- Brainstorm: `docs/brainstorm/2026-10-31-reusable-site-config-brainstorm-doc.md`
