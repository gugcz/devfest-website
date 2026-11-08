---
date: 2026-11-08
topic: edition-archive-and-teaser
---

# The root belongs to the next edition; past editions live under /<year>

## What we're building

DevFest.cz 2026 is over (30 October 2026). The maintainer handed over the
DF27 teaser design (a painted WebGL background, the DF27 logo, hand-lettered
"FALL 2027", a brass "2026 Edition" button) and one rule: `devfest.cz` always
belongs to the current or next edition, and every past edition moves to an
archive at `devfest.cz/<year>`. The domain keeps its authority and backlinks;
each year it is switched, not restarted.

Requirements from the maintainer's SEO brief:

- Archive on a subpath (`/2026`), not a subdomain; indexed, in the sitemap,
  linked from the footer.
- The teaser is not thin content: year and season, city, a short
  description, last edition's figures, photographs, a link to the archive,
  the newsletter.
- Every moved URL answers with a 301 to its archive address.
- JSON-LD: `Organization` on the teaser until the date is known; the
  archive keeps its own past `Event`.
- Title and description carry the year.
- Sitemap keeps the archive URLs.
- hreflang between language versions: the site is English only, so the
  existing self-referencing `en` / `x-default` pair stays.

## Why this approach

Three ways to serve `/2026` were weighed:

- **A. Frozen snapshot (chosen).** Build the 2026 site once with Astro's
  `base: '/2026'`, with the lineup and speaker photos frozen into the
  output, and commit the output under `archive/2026/`. The root build copies
  it into `dist/`. The archive never breaks when the code moves on to 2027,
  needs no live `/api/*`, and the same script archives every later edition.
  Cost: about 15 MB of built files per edition in git, no bug fixes reach the
  archive, and every root-relative link in the source must go through a
  base-aware helper once.
- **B. Live archive in the same build** (`src/pages/2026/`). One build and
  the gates cover it, but every edition's code and global styles stay in
  the tree forever and every upgrade must keep all of them green.
- **C. Archive built from a git tag in CI on every deploy.** No build output
  in git, but deploys get slower every year, old toolchains rot, the data
  still has to be frozen, and the deploy workflows of the shared project
  change.

## Key decisions

- **The archive is an artifact.** `npm run archive` writes `archive/<year>/`;
  nobody edits it by hand and it is not rebuilt.
- **The archive is self-contained**: every link stays under `/2026`, except
  one banner on every page that points to the current edition. The
  live-only sections (`app`, `newsletter`) are off in the snapshot; they
  live at the root.
- **The root switches with a flag.** A new `edition` flag owns the dated
  edition's pages (agenda, speakers, talks, venue, FAQ, team, contact,
  press, TV, calendar). Off, the home page is the teaser of
  `config.upcoming`; on, it is the event home. Evergreen pages (privacy
  policy, code of conduct, the app's pages, newsletter thank-you, 404) stay
  at the root.
- **Redirects are 301s in `firebase.json`.** Hosting applies redirects
  before static content, so turning `edition` back on in 2027 also means
  deleting the redirects for the paths it reclaims.
- **The teaser has its own layout and design system** (`docs/design.md`,
  2027). The 2026 noir record moves to `docs/design-2026.md` and still
  governs the archive and the evergreen pages until they are reskinned.
- **The teaser states only known facts**: "Fall 2027", Prague (the brand's
  city, no venue), the 2026 audience from config, talk and speaker counts
  read from the frozen lineup. No date, venue, price or CFP is invented.

## Open questions

- Photographs of 2026 and an aftermovie: the repo has only the 2025 contact
  sheet. The teaser uses those frames until 2026 prints arrive.
- Older editions (2025, 2019, 2018, 2017) live on subdomains served by other
  repositories. Moving them to `/2025` etc. is separate work; the teaser
  links them where they are.

## Next steps

→ `docs/plan/2026-11-08-feat-edition-archive-and-teaser-plan.md`
