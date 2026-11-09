# 0011. The root belongs to the next edition; past editions are frozen under `/<year>`

- Status: accepted; where the builds are stored superseded by [0013](0013-past-editions-live-on-the-archives-branch.md)
- Date: 2026-11-08
- PR: [#531](https://github.com/gugcz/devfest-website/pull/531); plans
  [2026-11-08-feat-edition-archive-and-teaser-plan.md](../plan/2026-11-08-feat-edition-archive-and-teaser-plan.md)
  (the archive) and
  [2026-11-08-feat-2027-edition-on-the-root-plan.md](../plan/2026-11-08-feat-2027-edition-on-the-root-plan.md)
  (the root), brainstorm
  [2026-11-08-edition-archive-and-teaser-brainstorm-doc.md](../brainstorm/2026-11-08-edition-archive-and-teaser-brainstorm-doc.md)

## Context

Each edition used to get its own subdomain (`2025.devfest.cz`) and the root
started over. Links, rankings and search authority were split across
hosts every year, and the root had nothing to say between editions. After
DevFest.cz 2026 (30 October 2026) the 2027 design arrived with one rule:
`devfest.cz` always belongs to the current or next edition; every past
edition lives on at `devfest.cz/<year>`, indexed and linked.

Three ways to serve `/2026` were weighed (brainstorm): a frozen build
output, the old pages kept live in the same build under `src/pages/2026/`,
or an archive rebuilt from a git tag on every deploy. A live archive keeps
every edition's code and global styles in the tree forever; a rebuilt one
slows every deploy and rots with its toolchain.

A first version of this decision made the root a standalone teaser behind
an `edition` flag. It was replaced before merge: the feature flags exist so
the next edition is prepared on the real site, section by section, not on a
page that is thrown away when the date is known.

## Decision

- **An archive is a frozen build.** `npm run archive -- <year>`
  (`scripts/archive.mjs`) builds the site as it stands with
  `PUBLIC_ARCHIVE=<year>`: Astro's `base` is `/<year>`,
  `src/middleware.ts` rebases every root-relative URL in the rendered HTML,
  client code calls `withBase()` / `apiUrl()` (`src/lib/base.ts`) and the
  live-only sections (`app`, `newsletter`) are off. The script freezes
  `/api/lineup` and every speaker photo into the output first (production
  moves on to the next edition's lineup), writes `edition.json` (the
  edition's date, venue and audience, which the root still states about its
  last edition), fails on any URL outside `/<year>` other than the live
  root, another archive or a live-only page, and writes `archive/<year>/`.
  Nobody edits it by hand. It runs while `config.event` is still that
  edition and has its day; the build refuses otherwise.
- **The legal pages stay live.** The privacy policy and the code of conduct
  (`LIVE_ONLY_PATHS`) are not frozen: an archived page links the live ones,
  so the policy behind an archived page's cookie banner is the current one.
- **A link between builds is a full load.** The middleware gives every link
  from the live site into an archive, and from an archive to the live site,
  `data-astro-reload`: `<ClientRouter />` would otherwise swap one build's
  page into the other's document and run both builds' scripts.
- **The live build carries the archives.** `src/integrations/archives.ts`
  copies every `archive/<year>/` into `dist/` after the build and lists its
  pages in the live sitemap. Every archived page names the live site in its
  header and footer.
- **The root is the next edition, prepared behind flags.** `config.event`
  moves to the next edition as soon as the last one is archived. Its day,
  venue and audience are optional until announced; until then the site
  states the season and the city, and nothing that needs a day renders
  (the countdown, `/calendar.ics`, the `Event` JSON-LD: the home page is the
  `Organization`'s). Flags hide what is not ready: `lineup` (agenda,
  speakers, share pages, TV) and `venue` join the existing ones, and a flag
  that states the day or the venue cannot be on without it
  (`checkFeatureDependencies`). The home, FAQ, team, contact, press, legal
  and app pages are always the current edition's.
- **Off paths redirect to the archive, temporarily.** While its flag is
  off, a path the next edition will reuse (`/agenda`, `/speakers`,
  `/venue`, `/partners`, `/workshops`, `/tv`, `/calendar.ics`, the ticket
  pages) answers **302** to its `/<year>/…` copy: Google keeps showing the
  root URL and does not move its signals, and browsers do not cache the hop
  for good ([Google Search Central, Redirects](https://developers.google.com/search/docs/crawling-indexing/301-redirects)).
  Per-edition URLs (`/speakers/<id>`, `/talks/<id>`) answer **301**; an
  `/invite/<member>` link goes to the home page. Hosting applies redirects
  before static files, so the build fails when a redirect matches one of
  its pages (`src/integrations/redirect-guard.ts`): turning a flag on
  deletes its redirect in the same change.
- **One design system on the live site.** `docs/design.md` (the aether)
  binds every live page; `docs/design-2026.md` binds the 2026 archive and
  the flagged surfaces not yet reskinned, which stay off until they are.

## Consequences

- The root keeps its links and authority across editions; the archive
  keeps the old talks and speakers indexed.
- About 14 MB of built files per archived edition sit in git.
- An archive gets no fixes. A security header or a redirect still applies
  to it (Hosting config), and the cache header for `/_astro/` covers
  `/<year>/_astro/` too.
- The home page's last-edition figures come from the latest archive's
  `edition.json` and frozen lineup (`src/lib/editions.ts`).
- Editions before 2026 still live on their own subdomains, served by other
  repositories; the footer links them there.
- Archiving an edition and preparing the next one is `docs/adapting.md` →
  "The yearly switch".
