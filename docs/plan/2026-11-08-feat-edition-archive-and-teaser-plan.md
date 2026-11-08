---
title: "feat(home): the 2027 teaser takes the root, 2026 moves to a frozen /2026 archive"
type: feat
date: 2026-11-08
brainstorm: docs/brainstorm/2026-11-08-edition-archive-and-teaser-brainstorm-doc.md
---

## feat(home): the 2027 teaser takes the root, 2026 moves to /2026 - Standard

**Status:** In progress

## Overview

`devfest.cz` becomes the DF27 teaser; the 2026 site is frozen into
`archive/2026/` and served at `/2026`, every moved URL 301s there, and the
design record switches to the 2027 system. Variant A of the brainstorm.

## Phases

### 1. Base-aware links (`refactor`, no visible change)

- `src/lib/base.ts`: `BASE` (`''`, or `/2026` in an archive build, from
  `import.meta.env.BASE_URL`), `withBase(path)`, `absoluteUrl(path)`,
  `withBaseHtml(html)` (authored HTML such as FAQ answers), `apiUrl(name)`
  (`/api/lineup` live, `/2026/api/lineup.json` in the archive).
- Every root-relative URL a page or island emits goes through them: links,
  public assets, canonical, OG, JSON-LD, `/api/*` reads. Flag tables
  (`FEATURE_LINKS`, `unlinkDisabled`) keep matching unprefixed paths, so
  unlinking runs before prefixing.
- `base.test.ts`. A normal build is unchanged.

### 2. Archive mode and `npm run archive`

- `PUBLIC_ARCHIVE=<year>` builds the site as that year's archive:
  `base: '/<year>'`, `outDir` under `.archive/`, `readStaticApi()` reads
  the frozen JSON instead of production, the `app` and `newsletter` flags
  off, and a banner on every page pointing to the current edition
  (`config.upcoming`).
- `scripts/archive.mjs <year>`: freeze `/api/lineup` and the speaker
  photos (resized WebP), build, copy the frozen data into the output, drop
  `robots.txt` and `404.html`, then **fail** on any root-relative or
  absolute site URL outside `/<year>/`. Writes `archive/<year>/`.
- `src/integrations/archives.ts` copies `archive/*/` into `dist/` after
  every build. The archive's URLs join the root sitemap (`customPages`).
- `firebase.json`: the immutable cache header also covers `/<year>/_astro/`.
- Run it: `archive/2026/` is committed.

### 3. The teaser takes the root

- `config.upcoming = { edition: 2027, season: 'Fall 2027' }` and
  `event.audience` (the 350 the 2026 pages state twice).
- New flag **`edition`**: `agenda`, `speakers` (+ `[id]`), `talks/[id]`,
  `sessions`, `venue`, `faq`, `team`, `contact`, `press` (+ `downloads`),
  `tv`, `calendar.ics` move to `src/routes/`. `tickets`, `workshops` and
  `attending` need it. The home page is injected from `routes/index.astro`
  while it is on and from `routes/teaser.astro` while it is off.
- `features`: `edition` and `partners` off.
- `src/layouts/Head.astro`: the meta, OG, canonical and JSON-LD block of
  `BaseLayout` moves here (JSON-LD builders to `src/lib/structured-data.ts`)
  so the teaser layout shares it. Teaser JSON-LD: `Organization` +
  `WebSite`, no `Event`.
- `src/layouts/TeaserLayout.astro` and `src/components/teaser/`: the aether
  canvas (`src/lib/aether.ts`, stops on navigation and under reduced
  motion, CSS gradient without WebGL), the logo, the season lettering, the
  portal button to `/2026`, then below the fold: what DevFest.cz is, 2026 in
  figures, prints from past editions, the newsletter (the existing form with
  teaser styles), past editions, and a footer (organizer, contact, privacy,
  code of conduct, cookie settings, archive).
- The cookie banner's script moves to `src/lib/cookie-banner.ts`; the noir
  and teaser banners share it.
- Title "DevFest.cz 2027 — Prague's developer conference & festival, fall
  2027"; a 2027 OG image.
- `firebase.json`: 301s from every moved path to `/2026/…`; `/workshops`,
  `/invoice`, `/attending`, `/thank-you` to the archive home.
- `llms.txt` describes the teaser and points to `/2026/llms.txt`.

### 4. Records

- `docs/design.md` → `docs/design-2026.md` (still binding for the archive
  and the noir evergreen pages); a new `docs/design.md` and
  `.impeccable/design.json` for the 2027 teaser system.
- ADR 0011, `docs/product.md`, `docs/adapting.md` (the yearly switch),
  README key pages, CLAUDE.md map and commands, `.claude/rules/pages.md`.

## Acceptance criteria

- [ ] `/` is the teaser: logo, "Fall 2027", Prague, description, 2026
      figures, prints, newsletter, link to `/2026` in the hero and footer.
- [ ] `/2026` and every 2026 page render from `archive/2026/` with working
      links, lineup and photos, and no request to `/api/*`.
- [ ] `/agenda`, `/speakers/<id>`, `/talks/<id>`, `/venue` … answer 301 to
      `/2026/…`.
- [ ] Sitemap lists the root pages and every `/2026/…` page.
- [ ] Teaser JSON-LD has no `Event`; `/2026` keeps its past `Event`.
- [ ] `npm run verify` and `npm run flags-off` green.

## Out of scope

- Moving 2025 and older from their subdomains.
- Reskinning the evergreen pages (privacy policy, code of conduct, app,
  delete account, newsletter thank-you, 404) in the 2027 system.
- Search Console: the maintainer submits the new sitemap after deploy.
