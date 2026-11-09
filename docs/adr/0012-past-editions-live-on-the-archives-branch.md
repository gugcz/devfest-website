# 0012. Past editions' builds live on the `archives` branch; `main` pins them

- Status: accepted
- Date: 2026-11-09
- PR: [#534](https://github.com/gugcz/devfest-website/pull/534); plan
  [2026-11-08-refactor-archive-builds-on-archives-branch-plan.md](../plan/2026-11-08-refactor-archive-builds-on-archives-branch-plan.md)

## Context

ADR 0011 made a past edition a frozen build committed under
`archive/<year>/` on `main`. For 2026 that is 423 generated files (15 MB) in
every checkout, `git grep` and diff, and another set every year.

Rebuilding an archive from its year branch on every deploy stays rejected
(ADR 0011): the year branch has no archive tooling, its lineup is no longer
live, every deploy would pay another install and build, and its toolchain
would rot. The build cannot be stored on the year branch either: a year
branch is frozen and never deploys (#532), and `2026` still carries a
deploy workflow that runs on a push to it.

## Decision

- **The builds live on `archives`**, an orphan branch with one top-level
  `<year>/` per edition, exactly what `npm run archive -- <year>` wrote. It
  has no workflows, so nothing runs or deploys from it. A new edition is a
  PR into it. The maintainer gives it `main`'s ruleset (PRs only, no
  force-push, no deletion): a force-push could orphan a pinned commit and
  fail every build.
- **`main` pins them.** `archive/sources.json` maps each archived year to a
  commit on `archives`; `.gitignore` ignores the rest of `archive/`. A pin,
  not the branch tip: only a PR to `main` that moves the pin changes what
  `/<year>` serves.
- **Every build fetches what it lacks.** `ensureArchives()`
  (`src/lib/archive-sources.ts`), called at the top of `astro.config.ts`,
  puts each pinned `<year>/` at `archive/<year>/` before anything reads it,
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
- Archiving an edition is two PRs: its build into `archives`, then its pin
  into `main` (`docs/adapting.md` → "The yearly switch"). `/<year>` is live
  once the pin merges.
- Re-archiving a pinned year locally is overwritten by the next live build,
  which refetches the pinned commit; publish it first.
