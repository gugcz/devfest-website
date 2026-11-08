---
title: "feat: devfest.cz becomes the 2027 edition, in the aether design"
type: feat
date: 2026-11-08
status: Approved
---

## feat: devfest.cz becomes the 2027 edition, in the aether design - Extensive

Supersedes the teaser half of
[`2026-11-08-feat-edition-archive-and-teaser-plan.md`](2026-11-08-feat-edition-archive-and-teaser-plan.md).
The archive half of that plan stays as built. Brainstorm:
[`2026-11-08-edition-archive-and-teaser-brainstorm-doc.md`](../brainstorm/2026-11-08-edition-archive-and-teaser-brainstorm-doc.md).
PR: [gugcz/devfest-website#531](https://github.com/gugcz/devfest-website/pull/531).

## Overview

`devfest.cz` stops being a standalone teaser. It becomes the 2027
edition's site, built from the same pages as 2026:

- `config.event` is the 2027 edition. Its date and venue stay unset until
  they are announced.
- Feature flags hide every section that is not ready.
- The whole live site moves to the 2027 aether design system
  (`docs/design.md`), including the sections behind off flags.
- The 2026 site stays frozen under `/2026`.

## Problem Statement

PR #531 built the next edition as a separate page:

- `src/routes/teaser.astro` on its own `TeaserLayout`.
- An `edition` flag that switched off every dated page and 301-redirected
  them to `/2026`.
- Every other root page left in the 2026 noir skin.

The maintainer rejects that shape. The feature flags exist so the next
edition can be prepared on the real site, section by section. A one-off
teaser bypasses them, leaves two design systems on the live site, and
starts 2027 from a page it later throws away.

## Proposed Solution

1. **Config.** `config.event` describes 2027.
   - `date` (doors, start, end, afterparty end, invoice close), `venue` and
     `audience` become optional.
   - Until they are set, the site states only what is announced:
     `event.season` ("Fall 2027") and `event.city` ("Prague").
   - Nothing that needs a day renders without one: the countdown,
     `/calendar.ics`, the `Event` JSON-LD, the agenda times, tickets.
   - `upcoming` goes.
2. **Last edition's facts.** The archive carries them.
   - `npm run archive` also writes `archive/<year>/edition.json`: name,
     date label, venue, city, audience.
   - For 2026 it is written once, by the same script in a facts-only mode,
     while `config.event` is still 2026.
   - The home page figures, `llms.txt` and the "last edition" lines read it
     instead of `config.event`.
3. **Flags.** `edition` goes. Two flags replace it:
   - `lineup`: `/agenda`, `/speakers`, `/speakers/[id]`, `/talks/[id]`,
     `/sessions`, `/tv`, the home speakers teaser and the lineup FAQ items.
   - `venue`: `/venue`, the venue facts and the venue FAQ items.
   - A `needs` entry may name `date` or `venue`. `tickets`, `invoice`,
     `attending` and `workshops` need `date`; `venue` needs `venue`. The
     existing `DEPENDENCIES` loop checks it against the config.
   - On today: `app`, `newsletter`, and the always-on pages (home, FAQ,
     team, contact, press downloads, legal).
   - Off: `tickets`, `invoice`, `workshops`, `invite`, `partners`,
     `attending`, `lineup`, `venue`.
4. **Redirects** (`firebase.json`).
   - Paths the 2027 edition will reuse answer **302** to their `/2026/…`
     copy while their flag is off: `/agenda`, `/speakers`, `/sessions`,
     `/venue`, `/partners`, `/workshops`, `/tv`, `/calendar.ics`,
     `/invoice`, `/attending`, `/thank-you`, `/speaker-card`.
     - Google shows the source of a temporary redirect in its results and
       does not move canonical signals to the target. A temporary redirect
       "may help keep the old URL in its Search results"
       ([Google Search Central, Redirects](https://developers.google.com/search/docs/crawling-indexing/301-redirects)).
       So `devfest.cz/agenda` keeps its ranking for the 2027 agenda, and
       browsers do not cache the hop for good.
     - The maintainer asked for the best SEO outcome. A 301 there would hand
       the root path's signals to `/2026/…`. Google advises one only "when
       you're sure that the redirect won't be reverted".
   - Per-edition URLs answer **301** for good: `/speakers/<id>` and
     `/talks/<id>` (2027 has its own ids).
   - `/invite/<member>` answers 302 to `/` while `invite` is off, so shared
     invitations do not 404.
   - FAQ, team, contact and press come back to the root.
   - Query strings survive Hosting redirects (verified in the emulator on
     PR #531).
5. **Redirect guard.** `npm run build` fails when a `firebase.json`
   redirect matches a page in `dist/` outside `/<year>`.
   - It runs as an `astro:build:done` hook over the real output, so it sees
     `src/pages/` and injected routes alike.
   - A pure `shadowedPaths(redirects, builtPaths)` carries the logic and
     has a unit test.
   - Turning a flag on without dropping its redirect becomes a red build.
6. **Design.** One system on the live site, the aether.
   - `BaseLayout.astro` takes over the aether chrome and `TeaserLayout` is
     deleted.
   - New tokens all land in phase 2, so phases 4 and 5 add none.
   - The `_type.scss` mixins and the global primitives (`.band`, `.closer`,
     `.btn-primary`, `.action`, `.eyebrow`, `.head-rule`, `.paper`,
     `.display`) keep their names and get aether recipes, so most
     components follow without edits.
   - Components are then fixed one by one.
   - The comp (DF27 `Web.zip`) covers only the hero. Everything else is
     designed in the aether language and recorded in `docs/design.md`.
   - Until a flagged surface is reskinned, `docs/design-2026.md` still
     binds it, and its flag may not be turned on.
7. **Archive.** `archive/2026/` is unchanged except the added
   `edition.json`. `scripts/archive.mjs` drops the `edition` override.

## Technical Approach

### Architecture

- **`src/lib/site-config.ts`**:
  - `EventConfig.date?: EventDate`, where `EventDate` holds `doors`,
    `start`, `end`, `afterpartyEnd`, `invoicesClose`.
  - `EventConfig.venue?: Venue` and `audience?: number`.
  - New `season` and `city`. `UpcomingConfig` and `upcoming` go.
- **`src/lib/event.ts`**:
  - `EVENT` keeps its fields; the date and venue fields are `undefined`
    without their group.
  - `EVENT.when` falls back to `season`, `EVENT.where` to `city`.
  - `hasDate` and `hasVenue` are exported for templates.
  - `googleCalendarUrl`, `calendarDescription`, `cardStamp` and
    `invoicesOpen` require a date (callers are all behind date-needing
    flags).
- **`src/lib/editions.ts`**:
  - `lastEdition()` reads `archive/<latest>/edition.json` plus the lineup
    counts that `lastEditionFigures()` has today.
  - `editionHref` becomes `flagHref(flag, path)`: the root path when the
    flag is on, else the last archive's copy. The 404, the newsletter
    thank-you and the menu use it.
- **`src/lib/features.ts`**:
  - `lineup` and `venue` in, `edition` out.
  - `DEPENDENCIES.needs` widens to `FeatureFlag | 'date' | 'venue'`, still
    one table-driven loop to stay under complexity 15.
  - `features.test.ts` covers it.
- **`src/integrations/feature-routes.ts`**:
  - `ROUTES.lineup` and `ROUTES.venue`; `STAND_INS` goes.
  - `/calendar.ics` is injected only with a date, from a separate
    `DATE_ROUTES` list kept outside the hook body.
- **`src/integrations/redirect-guard.ts`** + `src/lib/redirects.ts` (+
  `.test.ts`): the guard above.
- **Routes**:
  - `index`, `faq`, `team`, `contact`, `press` (a `Redirect.astro` to
    `/contact#press`) and `press/downloads` move back to `src/pages/`.
  - Lineup and venue pages stay in `src/routes/`.
  - `teaser.astro` and its SCSS go.
- **`astro.config.ts`**: the archive guard drops `features.edition`, and the
  noir fonts leave `fonts` in phase 2. The sitemap filter and `PRIORITY`
  follow the new route set.
- **SEO**:
  - The `Event` JSON-LD only with a date; `Organization` and `WebSite`
    always.
  - The title and description name 2027.
  - `og-2027.jpg` is the default card, with an alt text that names 2027.
  - `llms.txt` describes 2027 and links the 2026 archive.
- **Consent.** The aether cookie banner keeps the `cookie-consent` key and
  its values, which the frozen `/2026` banner reads on the same origin.
- **Portal**: one markup source.
  - `PortalFace.tsx` renders the inked frame, the label and the arrow.
  - `Portal.astro` wraps it in a link; React islands (the newsletter
    submit, later the ticket CTAs) render it in a `<button>`.
  - One size. A compact one only if the cookie banner cannot take the
    default.
- **Backgrounds**: the live WebGL painting on the home hero only. Subpages
  use the aether body gradient; no still-frame asset.
- **Folder**: `src/components/teaser/` → `src/components/aether/`, since
  nothing is a teaser any more.
- **Checks**:
  - `npm run a11y` builds the live config (no date, today's flags) as now.
  - A second build with `PUBLIC_FEATURES_ON=<every flag>` and
    `PUBLIC_EVENT_FIXTURE=1` audits every flagged surface. Its date and
    venue come from `src/lib/event-fixture.ts`, obviously fake (`Example
    Hall`), applied in `site.config.ts` through `buildVariable`. That build
    lands with phase 4, when the first flagged surface is aether.
  - `scripts/flags-off-build.mjs` gets `lineup` and `venue` in `ROUTES` and
    `RUNS`. It already runs on the date-less live config, which proves that
    no countdown, `/calendar.ics` or `Event` survives.

### FAQ on day one

Of the 27 items in `src/content/faq.json`:

- **Rewritten now** to what is announced: "When and where is DevFest.cz
  2027?", answered with Fall 2027, Prague, and the date and venue to be
  announced.
- **Gated on flags:**
  - On `venue`: the venue route, parking, last train, the airport and stay.
  - On `lineup`: the day's shape, who is speaking, recordings.
  - On `tickets`: ticket prices and types, how to get in.
- **Theme items** ("What's the story with the detective theme?", the 1940s
  clothing in "What should I wear?") go to the maintainer for rewrite. Until
  then they are gated on `lineup`.
- **The CFP item** points at the 2026 lineup. It is rewritten to say the
  2027 call is not open yet, with no date.
- **The mobile app** shows any item whose `feature` is not in its
  `websiteFeaturesOff` list
  (`ryzizub/devfest_mobile_app`, `lib/event_info/models/faq.dart`). It
  copies `faq.json` only by hand. When it next copies, it adds `lineup` and
  `venue` to that list. A note goes into the PR, and the app repo gets a
  follow-up, never this one.

## Implementation Phases

PR boundaries follow the split assessment.

- **PR 1** (#531) = phases 1–3, with its own docs. It is the only one a
  visitor sees.
- **PR 2** = phase 4.
- **PR 3** = phase 5.

PR 2 and PR 3 depend on PR 1, not on each other. Each carries its own
docs.

### Phase 1: 2027 config, flags and redirects (PR 1)

- **Status:** Done
- **Scope:**
  - Archive 2026's facts, then switch `config.event` to 2027 without date
    or venue.
  - `lineup` and `venue` replace `edition`; the teaser and `TeaserLayout`
    are deleted.
  - The home page is the regular one; redirects split into 302 and 301; the
    redirect guard; the FAQ gating.
  - Still noir.
- **Files touched:**
  - `scripts/archive.mjs`, `archive/2026/edition.json`.
  - Config and libs: `src/site.config.ts`, `src/lib/site-config.ts`,
    `src/lib/event.ts`, `src/lib/dates.ts` (+ test), `src/lib/features.ts`
    (+ test), `src/lib/flags.ts`, `src/lib/editions.ts`.
  - Integrations: `src/integrations/feature-routes.ts`,
    `src/integrations/redirect-guard.ts`, `src/lib/redirects.ts`
    (+ test), `astro.config.ts`.
  - Pages: `src/pages/` (moved back), `src/routes/` (teaser out),
    `src/layouts/TeaserLayout.*` (deleted), `src/layouts/BaseLayout.astro`,
    `src/components/Menu.astro`, `src/components/Footer.astro`,
    `src/pages/404.astro`, `src/pages/llms.txt.ts`,
    `src/routes/newsletter-subscription-thank-you.astro`,
    `src/content/faq.json`, `firebase.json`.
  - Scripts: `scripts/flags-off-build.mjs`.
- **Acceptance criteria:**
  - The build has no `/agenda`, `/speakers` or `/venue` and no `Event`
    JSON-LD; `/faq`, `/team` and `/contact` are built.
  - Adding a redirect for `/faq` fails `npm run build`.
- **Validation:** `npm run verify && npm run flags-off`

### Phase 2: Aether foundation, chrome and home hero (PR 1)

- **Status:** Done
- **Scope:** the aether becomes `BaseLayout`'s system:
  - Every token, the recipes for the global primitives and `_type.scss`.
  - Menu, footer, cookie banner, `SubpageHero`, `EndLine`, `NextStep`.
  - The shared portal (link and button).
  - The comp's hero on the home page.
  - The noir fonts leave `astro.config.ts`.
- **Files touched:** `src/layouts/BaseLayout.astro`,
  `src/layouts/BaseLayout.scss`, `src/styles/_aether.scss`,
  `src/styles/_type.scss`, `src/components/aether/*` (moved from `teaser/`),
  `src/components/aether/PortalFace.tsx`, `Menu.astro`, `Footer.astro`,
  `CookieBanner.astro`, `SubpageHero.astro`, `EndLine.astro`,
  `NextStep*.astro`, `HeroBackground.astro` (deleted),
  `src/pages/index.astro`, `astro.config.ts`.
- **Acceptance criteria:**
  - No live page requests a noir font.
  - The home hero matches the comp at 375, 768 and 1440 px.
  - The menu, the footer and the cookie banner pass axe.
- **Validation:** `npm run verify`, then manual: 1. `npm run dev` (or
  `dev-live-api`); 2. open `/` at 375, 768 and 1440 px next to the comp;
  3. tab through the menu, the portals and the footer.

### Phase 3: Always-on pages (PR 1)

- **Status:** Not started
- **Scope:** reskin every page live today, then the PR 1 docs.
  - Pages: the home sections, `/faq`, `/team`, `/contact`,
    `/press/downloads`, `/privacy-policy`, `/code-of-conduct`, `/app`,
    `/login`, `/delete-account`, the newsletter form and thank-you page,
    and `/404`.
  - Docs:
    - `docs/design.md` (the system and these surfaces, via `/impeccable
      document`) and `.impeccable/design.json`.
    - `docs/design-2026.md` (the archive and the flagged surfaces still
      noir).
    - ADR 0011 rewritten (unmerged, so edited, not superseded).
    - `docs/product.md` and `docs/adapting.md` (date, venue and audience
      optional, `lineup` and `venue`, 302 vs 301, "a flag turns on only
      once its section is aether").
    - README, CLAUDE.md, `.claude/rules/pages.md`, `design.md`, `api.md`,
      `analytics.md`.
    - The old plan marked `status: Superseded (teaser half)`.
- **Files touched:** those pages under `src/pages/` and their `.scss`,
  `NewsletterForm.tsx` and its skins, `StoreBadges.astro`, the docs above.
- **Acceptance criteria:**
  - Every page the live build produces renders in the aether.
  - `update-docs` finds nothing stale.
  - `/review` findings are fixed or answered, and PR #531 is green with its
    preview URL.
- **Validation:** `npm run verify && npm run flags-off`

### Phase 4: Lineup surfaces (PR 2)

- **Status:** Not started
- **Scope:**
  - Reskin what `lineup` turns on: `/agenda` (`Agenda`, `Sessions`,
    `SessionDetail`, `Sheet`, `TalkIndex`), `/speakers` (`Speakers`,
    `SpeakerTile`, `SpeakerDetail`, `SpeakerPhoto`, `SpeakerIndex`), the
    home `SpeakersTeaser`, the share pages (`Share.astro`), `/tv`
    (`TvScreen`) and `DataState`.
  - Add the all-flags-on a11y build with `PUBLIC_EVENT_FIXTURE`.
  - Docs for these surfaces.
- **Files touched:** the components above and their `.module.scss`; in
  `src/routes/`: `agenda.*`, `speakers.*`, `speakers/[id].astro`,
  `talks/[id].astro`, `tv.astro`; `src/layouts/Share.astro`,
  `src/lib/event-fixture.ts`, `src/site.config.ts`, `scripts/a11y.mjs`,
  `docs/design.md`, `docs/design-2026.md`.
- **Acceptance criteria:** the all-flags-on build renders agenda and
  speakers in the aether from the fixtures and passes axe.
- **Validation:** `npm run verify`

### Phase 5: Tickets, workshops, invitations, partners and venue (PR 3)

- **Status:** Not started
- **Scope:** reskin what needs a date or a venue, then the docs for these
  surfaces.
  - Tickets: `Tickets`, `TicketIndex`, `HeroOffer`, `Countdown` and
    `/thank-you`.
  - Invoices: `InvoiceForm` and `/invoice`.
  - Workshops: `Workshops` and `/workshops`.
  - Invites: `/invite/[member]`, `InviteCta` and the invite OG image.
  - Share cards: `/attending`, `/speaker-card` and the canvas cards (font
    and colour constants).
  - Venue and partners: `/venue`, `Closer`, `/partners` and the partner
    bands.
  - `docs/design-2026.md` then binds only the archive.
- **Files touched:** the components and routes above,
  `src/lib/attending-card.ts`, `src/lib/speaker-card.ts`,
  `src/routes/og/invite/[member].jpg.ts`, `src/styles/_logos.scss`,
  `docs/design.md`, `docs/design-2026.md`, `docs/adapting.md`.
- **Acceptance criteria:** the all-flags-on build renders every surface in
  the aether and passes axe. No source outside `archive/` names a noir
  font.
- **Validation:** `npm run verify`
- **Re-estimate after phase 2.** If the primitives carry most components,
  phases 4 and 5 shrink to fixes and may merge into one PR.

## Alternative Approaches Considered

- **Keep the teaser (PR #531 as it was).** Rejected by the maintainer. It
  bypasses the flags, leaves two systems live and starts 2027 from a
  throwaway page.
- **Reskin only what is visible.** Faster. But every off flag would hide a
  noir section that must be reskinned before it can turn on.
- **Retheme the noir tokens only.** Whole site at once, but it yields the
  2026 layouts in 2027 colours, not the comp's look.
- **A redirect test over the route table** (first draft). It cannot see
  `src/pages/` and needs sample params for dynamic routes. The build-output
  guard sees what Hosting would serve.
- **Generating `firebase.json` redirects from the flags.** No hand edit
  ever. But `firebase.json` stops being a plain file the maintainer reads,
  and the hosting deploy would depend on a build step. Not worth it for
  about 15 lines.

## Success Criteria

```success-criteria
GOAL: devfest.cz is the 2027 edition's site, built from the regular pages with unready sections behind flags, entirely in the aether design, with 2026 frozen under /2026.

SUCCESS CRITERIA:
- The full gate passes (types, complexity, site and function tests, axe) | verify: npm run verify
- Every flag removes its section completely, on the date-less live config | verify: npm run flags-off
- No teaser, `edition` flag or `upcoming` remains | verify: ! grep -rnE "teaser\.astro|TeaserLayout|[\"']edition[\"']|features\.edition|config\.upcoming|UpcomingConfig" src scripts astro.config.ts
- A redirect that shadows a built page fails the build | verify: npm run test:site
- The root has no Event JSON-LD while 2027 has no date | verify: npm run build && ! grep -q '"@type":"Event"' dist/index.html
- FAQ, team and contact are built at the root | verify: npm run build && test -f dist/faq/index.html && test -f dist/team/index.html && test -f dist/contact/index.html
- The 2026 archive changes only by edition.json | verify: test -z "$(git diff --name-only 902bb75c -- archive/ | grep -v '^archive/2026/edition.json$')"
- No live source names a noir font (end of phase 5) | verify: ! grep -rnE "Bebas|Special Elite|JetBrains|--font-(bebas-neue|special-elite|jetbrains-mono)" src
- The home hero matches the DF27 comp | verify: manual 1. npm run dev 2. open / at 375, 768 and 1440 px beside Web.zip index.html 3. logo, season, tagline, portals and painting match

NON-GOALS:
- Restyling or rebuilding archive/2026/ (beyond adding edition.json).
- Moving 2025 and older editions from their subdomains.
- Writing 2027 copy that is not announced (date, venue, prices, CFP dates); the theme FAQ items go to the maintainer.
- Changing Cloud Functions or the mobile app.

VERIFICATION COMMAND: npm run verify && npm run flags-off && npm run build && ! grep -q '"@type":"Event"' dist/index.html && test -f dist/faq/index.html && test -z "$(git diff --name-only 902bb75c -- archive/ | grep -v '^archive/2026/edition.json$')"
```

## Success Metrics

- After the deploy, Search Console shows the root and `/2026/*` indexed,
  with no new 404s: invites and `/calendar.ics` redirect.
- Turning a flag on in 2027 changes `site.config.ts` and drops its redirect
  line, nothing else. The build guard catches a forgotten one.

## Dependencies & Prerequisites

- Approved by the maintainer on 2026-11-08, with redirects chosen for the
  best SEO outcome (302 for paths that return, 301 for per-edition URLs).
- The 2027 date, venue and the theme FAQ copy are not needed to build. They
  are needed before `tickets`, `venue` or `lineup` turn on.

## Risk Analysis & Mitigation

- **PR size.** Split into three PRs. PR 1 carries the visible change;
  PRs 2 and 3 touch only surfaces that are not built today.
- **Unseen surfaces regress.** The all-flags-on a11y build (from PR 2)
  audits them. Flags-off proves they vanish.
- **302 vs 301.** A 302 leaves the archive copy of `/agenda` and the like
  ranking on its own signals, not the root path's. That is intended: the
  root path ranks again for 2027, and the archive keeps the per-edition
  URLs (301).
- **Consent drift across builds.** The key and values are fixed by
  `src/lib/consent.ts`, which both builds share at freeze time. The aether
  banner reuses `src/lib/cookie-banner.ts`.
- **Parallel PRs 2 and 3** touch the same docs. All new tokens land in
  phase 2. Manual dev in two worktrees needs two ports (`astro dev --port`).

## Resource Requirements

One engineer with Claude Code.

- Phases 1–3 run in sequence in this session, one commit each.
- After PR 1 is up, PRs 2 and 3 can run in parallel sessions in their own
  worktrees.

## Future Considerations

- **Date announced:** set `event.date` and turn on `tickets` (with
  `invoice` and `attending`). Drop their redirects, and update
  `INVOICES_CLOSE` in `functions/src/invoice/submit.ts`, which deploys only
  through `firebase-functions-merge.yml`. Point ti.to's return URL at the
  root.
- **Lineup ready:** move the Sessionize sync to the 2027 event (shared with
  the app) and turn on `lineup`.
- **Venue announced:** turn on `venue`.
- **Late 2027:** `npm run archive -- 2027`.

## Documentation Plan

Each PR carries its own docs (`.claude/rules/docs.md`): PR 1 in phase 3, PRs
2 and 3 in their phases.

## References & Research

### Internal References

- Event facts: `src/site.config.ts`, `src/lib/site-config.ts`,
  `src/lib/event.ts`.
- Flags: `src/lib/features.ts`, `src/integrations/feature-routes.ts`,
  `src/lib/flags.ts`, `scripts/flags-off-build.mjs`.
- Archive: `scripts/archive.mjs`, `src/lib/base.ts`, `src/middleware.ts`,
  `src/integrations/archives.ts`, `src/lib/editions.ts`.
- Last-edition facts read today from `config.event`:
  `src/routes/index.astro:157,171-176`, `src/pages/llms.txt.ts`.
- Noir primitives: `src/layouts/BaseLayout.scss` (`.band`, `.closer`,
  `.paper`, `.btn-primary`, `.action`), `src/styles/_type.scss`.
- Aether: `src/layouts/TeaserLayout.scss`, `src/styles/_aether.scss`,
  `src/components/teaser/`, `src/lib/aether/`.
- The mobile app's FAQ filter: `ryzizub/devfest_mobile_app`,
  `lib/event_info/models/faq.dart` (`websiteFeaturesOff`).

### External References

- Firebase Hosting, priority of redirects over static content:
  https://firebase.google.com/docs/hosting/full-config#hosting-priority-order

### Related Work

- [gugcz/devfest-website#531](https://github.com/gugcz/devfest-website/pull/531)
- Design comp: DF27 `Web.zip` (`index.html`, `styles.css`, `background.js`,
  the logos, the favicon).
