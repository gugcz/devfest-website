---
date: 2026-10-31
topic: reusable-site-config
---

# Reusable site: one config, feature flags, typed content

## What We're Building

The repo as it stands after DevFest.cz 2026 is reusable as code but not as
configuration. `src/lib/event.ts` holds the event facts, yet most pages,
cards, layouts and the Cloud Functions repeat the event name, the date, the
venue, the organizer's contacts and the site origin as literal strings. An
audit on 2026-10-31 counted roughly 70 source files that a new edition or a
different chapter would have to edit by hand, six spellings of the date, two
hand-kept copies of the social links, about 30 copies of the contact e-mail,
the Firebase identity spread over nine places, and no way to turn a section
(workshops, invoices, the app, the TV screen, the invite pages) off without
deleting routes.

We make the next edition a configuration change: one typed site config that
every page, component and function reads from; feature flags that remove a
section from the routes, the menu, the sitemap and the structured data in one
place; content collections with zod schemas for the data that still lives in
TypeScript or Astro files (socials, contacts, topics, press coverage, the
venue travel notes); and the open-source basics the public repo lacks
(LICENSE, CONTRIBUTING, a guide to adapting the site for another event).

## Why This Approach

Three approaches were weighed.

1. **Config-first** (chosen). A single `site.config.ts` plus feature flags
   and new content collections; literals replaced by reads; docs for
   adopters. Makes the next edition a config swap without touching the
   Firebase split or the function contracts.
2. **Config-first plus shared data contracts.** Approach 1 and a shared
   `contracts/` package of zod schemas for lineup, tickets and workshops
   imported by both `src/` and `functions/`, validated at the `/api/*`
   boundary. Lets another chapter swap Sessionize or ti.to for a source that
   emits the same shape. Twice the work and reaches into the shared Firebase
   project; deferred to a follow-up.
3. **Template repo.** Extract the generic code into a separate template and
   keep this repo as an instance. Two repos to maintain for one chapter; not
   worth it now.

Approach 1 wins because it removes the actual blocker (hand edits across the
tree) with the pattern the repo already uses (`EVENT` in `event.ts`, zod
content collections in `src/content.config.ts`), and leaves the data
contracts for when a second data source exists.

## Key Decisions

- **One config module, not many env vars.** `src/site.config.ts` exports
  typed `event`, `organizer`, `site` (origin, Firebase ids, functions region,
  analytics hosts), `topics` and `features`. Secrets stay in Firebase
  params; public ids live in the config, where today they are scattered.
  Rationale: a reader of the repo can see every fact in one file, and
  TypeScript catches a missing field; env vars would hide them in CI.
- **Feature flags remove, they do not hide.** A flag set to `false` drops
  the route from the build, its menu item, its sitemap entry and its JSON-LD,
  not just its visible section. Flags: `tickets`, `invoice`, `workshops`,
  `app`, `tv`, `invite`, `partners`, `newsletter`, `attending`, `press`.
  Rationale: a half-disabled page that still appears in the sitemap is worse
  than none.
- **Functions read the same facts.** The invoice closing time, the brand
  block in the invoice e-mail, the CORS allowlists and the sender address
  come from a `functions/src/site.ts` that mirrors the public part of the
  config (the functions build is a separate tsconfig; sharing a file across
  the boundary is the follow-up's job). Rationale: `INVOICES_CLOSE` already
  exists twice and drifted once.
- **Content collections for what is still data.** New collections: `socials`,
  `contacts`, `topics`, `press-coverage`, `travel` (the venue route notes).
  Each has a zod schema in `src/content.config.ts`, which doubles as the
  documentation of the shape. Rationale: the three existing collections are
  the pattern the mobile app already consumes.
- **Dates come from one ISO value.** Every rendered date (`30 / 10 / 26`,
  `30.10.2026`, `30 OCT 2026`, `datetime=`, JSON-LD, the ICS file) is
  formatted from `event.start`. The `.ics` moves from a static file to a
  build-time endpoint so it cannot drift.
- **The production branch name becomes a workflow variable.** CI reads the
  branch from one place instead of four workflow files. The branch itself
  stays `2026` this year.
- **Legal pages stay organizer-specific text.** Privacy policy, delete
  account and code of conduct read the organizer's name and contacts from
  the config, but their prose is not templated; another chapter rewrites
  them. Rationale: legal text is not configuration.
- **Open-source basics.** `LICENSE` (MIT, copyright GUG.cz, z.s., the
  maintainer confirms), `CONTRIBUTING.md` pointing at the existing workflow
  in CLAUDE.md, and `docs/adapting.md`: the checklist for a new edition and
  for a new chapter (config fields, assets to replace, Firebase project and
  secrets, what the flags turn off).
- **ADR.** The config-and-flags shape is an architecture decision; it gets
  `docs/adr/0010-site-config-and-feature-flags.md`.

## Open Questions

- Which pages a disabled `tickets` flag should still show: the home hero
  loses the offer and the countdown stays; the plan decides for the menu CTA.
- Whether `team.json` and the invite pages' `ROLE_LINES` map should merge
  into one collection (the role copy is per person, not per role, in
  practice).
- How the brand assets with the year baked in (the 2026 logo badge, the press
  kit filenames, the 2025 gallery) are listed in `docs/adapting.md` versus
  moved under a per-edition folder.
- The order of PRs: config module and date formatting first (largest literal
  count), flags second, collections third, docs and LICENSE with the last.
