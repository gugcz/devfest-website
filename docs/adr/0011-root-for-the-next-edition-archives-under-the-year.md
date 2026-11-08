# 0011. The root belongs to the next edition; past editions are frozen under `/<year>`

- Status: accepted
- Date: 2026-11-08
- PR: to be linked; plan
  [2026-11-08-feat-edition-archive-and-teaser-plan.md](../plan/2026-11-08-feat-edition-archive-and-teaser-plan.md),
  brainstorm
  [2026-11-08-edition-archive-and-teaser-brainstorm-doc.md](../brainstorm/2026-11-08-edition-archive-and-teaser-brainstorm-doc.md)

## Context

Each edition used to get its own subdomain (`2025.devfest.cz`) and the root
started over. Links, rankings and search authority were split across
hosts every year, and the root had nothing to say between editions. After
DevFest.cz 2026 (30 October 2026) the 2027 teaser design arrived with one
rule: `devfest.cz` always belongs to the current or next edition; every
past edition lives on at `devfest.cz/<year>`, indexed and linked.

Three ways to serve `/2026` were weighed (brainstorm): a frozen build
output, the old pages kept live in the same build under `src/pages/2026/`,
or an archive rebuilt from a git tag on every deploy. A live archive keeps
every edition's code and global styles in the tree forever; a rebuilt one
slows every deploy and rots with its toolchain.

## Decision

- **An archive is a frozen build.** `npm run archive -- <year>`
  (`scripts/archive.mjs`) builds the site as it stands with
  `PUBLIC_ARCHIVE=<year>`: Astro's `base` is `/<year>`,
  `src/middleware.ts` rebases every root-relative URL in the rendered HTML,
  client code calls `withBase()` / `apiUrl()` (`src/lib/base.ts`), and the
  live-only sections (`app`, `newsletter`) are off. The script freezes
  `/api/lineup` and every speaker photo into the output first (production
  moves on to the next edition's lineup), fails on any URL outside
  `/<year>`, and writes `archive/<year>/`. Nobody edits it by hand and it is
  not rebuilt; an archive build refuses to run once `features.edition` is
  off.
- **The live build carries the archives.** `src/integrations/archives.ts`
  copies every `archive/<year>/` into `dist/` after the build and lists its
  pages in the live sitemap. Every archived page names the live site in its
  header and footer.
- **The root switches by flag.** The `edition` flag owns the dated
  edition's pages (the event home, `/agenda`, `/speakers`, the share pages,
  `/venue`, `/faq`, `/team`, `/contact`, `/press`, `/tv`, `/calendar.ics`).
  Off, the home page is the teaser of `config.upcoming` (`src/routes/teaser.astro`)
  with `Organization` JSON-LD and no `Event`; `tickets`, `workshops` and
  `attending` need it on. The legal pages, the app's pages, the 404 and the
  newsletter thank-you stay at the root.
- **Moved URLs answer 301.** `firebase.json` redirects every path the
  edition owned to `/2026/…`. Hosting applies redirects before static
  files, so a path the next edition reclaims needs its redirect deleted in
  the same change.
- **Each edition has its own design record.** `docs/design.md` is the
  current system (the 2027 aether); `docs/design-2026.md` stays binding for
  the 2026 archive and for the pages still on `BaseLayout.astro`.

## Consequences

- The root keeps its links and authority across editions; the archive
  keeps the old talks and speakers indexed.
- About 14 MB of built files per archived edition sit in git.
- An archive gets no fixes. A security header or a redirect still applies
  to it (Hosting config), and the cache header for `/_astro/` covers
  `/<year>/_astro/` too.
- Browsers cache a 301. A visitor who followed `/agenda` to `/2026/agenda`
  may keep landing there after 2027 reclaims `/agenda`, until their cache
  lets go.
- The live teaser's figures come from the latest archive's frozen lineup
  (`src/lib/editions.ts`).
- Editions before 2026 still live on their own subdomains, served by other
  repositories; the footer links them there.
- Adding the next archive is `docs/adapting.md` → "The yearly switch".
