# 0013. A past edition's build lives on its year branch; `main` pins it

- Status: accepted
- Date: 2026-11-09
- PR: [#534](https://github.com/gugcz/devfest-website/pull/534) (`main`),
  [#540](https://github.com/gugcz/devfest-website/pull/540) (the build on
  `2026`); plan
  [2026-11-08-refactor-archive-builds-on-archives-branch-plan.md](../plan/2026-11-08-refactor-archive-builds-on-archives-branch-plan.md)

## Context

ADR 0011 made a past edition a frozen build committed under
`archive/<year>/` on `main`. For 2026 that is 423 generated files (15 MB) in
every checkout, `git grep` and diff, and another set every year.

Rebuilding an archive from its year branch on every deploy stays rejected
(ADR 0011): the year branch has no archive tooling, its lineup is no longer
live, every deploy would pay another install and build, and its toolchain
would rot. Storing the finished build is enough.

A first version of this decision kept every build on an orphan `archives`
branch. It was replaced before merge: the year branch already is the
edition, it has the ruleset, and its build belongs next to its source
instead of on a second long-lived branch.

## Decision

- **The build lives on its year branch** as `archive/<year>/`, exactly
  what `npm run archive -- <year>` wrote. It arrives through one PR into
  the year branch, the one commit the branch takes after it is frozen. The
  year branches carry the same ruleset as `main` (pull request required).
  `2026` also loses its two deploy workflows in that PR: it predates #532,
  which moved the deploy trigger to `main`, so a push to it would still
  start a deploy run (the `production` environment only accepts `main`).
- **`main` pins it.** `archive/sources.json` maps each archived year to a
  commit on its year branch; `.gitignore` ignores the rest of `archive/`.
  A pin, not the branch tip: only a PR to `main` that moves the pin changes
  what `/<year>` serves. The repository squash-merges, so the pin is the
  commit the year branch holds after the merge.
- **Every build fetches what it lacks.** `ensureArchives()`
  (`src/lib/archive-sources.ts`), called at the top of `astro.config.ts`,
  puts each pinned `archive/<year>/` in place before anything reads it,
  archive builds included. It fetches the one commit (`--depth=1` only in a
  clone that is already shallow), extracts it through a temp dir so no
  stale file survives a pin change, and stamps `archive/<year>.source`; a
  stamped year needs no network. A pin it cannot get fails the build by
  year and commit. Every entry point loads the config, so no script or
  workflow has a fetch step of its own.
- **The pins are the list.** `archivedEditions()` reads
  `archive/sources.json`, not the directory, so a build without a fetched
  archive fails instead of dropping it from the footer, the sitemap and the
  home page's last-edition lines.

Everything else in ADR 0011 stands: how an archive is built, the live legal
pages, full loads between builds, the redirects, and the live build copying
every archive into its output.

## Consequences

- `main`'s tree carries no build output; the 15 MB #531 added stays in its
  history.
- A build needs the network once per pin change; offline without a stamp
  it fails with the fix in the message.
- Archiving an edition is two PRs: its build into its year branch, then
  its pin into `main` (`docs/adapting.md` → "The yearly switch"). `/<year>`
  is live once the pin merges.
- Re-archiving a pinned year locally is overwritten by the next live build,
  which refetches the pinned commit; publish it first.
