---
title: "refactor(archive): past editions' builds live on the archives branch, main pins them"
type: refactor
date: 2026-11-08
brainstorm: docs/brainstorm/2026-11-08-edition-archive-and-teaser-brainstorm-doc.md
---

## refactor(archive): past editions' builds live on the archives branch, main pins them - Standard

**Status:** Done.

## Overview

`archive/2026/` (the frozen `/2026` build, 423 files, 15 MB) moves out of
`main`'s tree onto an orphan branch, `archives`, as `2026/`. `main` keeps one
committed file, `archive/sources.json` (`{ "2026": "<commit on archives>" }`),
and every build fetches the pinned `archive/<year>/` before it reads it.
Visitors see no change: `devfest.cz/2026` serves the same bytes.

## Problem Statement / Motivation

- `main` carries generated output: 423 files in every checkout, `git grep`
  and diffs, and another ~15 MB per edition from now on.
- Rebuilding `/2026` from the `2026` branch on every deploy stays rejected
  (ADR 0011, brainstorm option C): `origin/2026` has no archive tooling, its
  lineup is no longer live, every deploy would pay another install and
  build, and its toolchain would rot.
- The build cannot live on `2026` itself: a year branch is frozen and never
  deploys (#532), and `origin/2026` still carries a deploy workflow that runs
  on a push to `2026`. An orphan branch has no workflows, so nothing runs or
  deploys from it.

## Proposed Solution

1. **`archives` holds every frozen build**, one top-level `<year>/` per
   edition, byte-identical to what `npm run archive -- <year>` wrote. Its
   first commit reuses the tree `main@2f9c9b9e` has at `archive/2026`
   (`git mktree` + `git commit-tree`, no file copy), so the bytes cannot
   drift. Later editions are PRs into `archives`.
2. **`main` pins it.** `archive/sources.json` maps each archived year to a
   commit on `archives`. `.gitignore` ignores `archive/*` except that file.
   A pinned SHA, not the branch tip: only a PR to `main` that moves the pin
   changes production.
3. **One fetch point: `ensureArchives()`** in `src/integrations/archives.ts`,
   called at the top of `astro.config.ts` for every build, archive builds
   included (an archive's home states its last edition through
   `lastEdition()`). Every entry point loads the config (`dev`, `build`,
   `check`, `a11y`, `anchors`, `flags-off`, the workflows), so no npm script
   or workflow changes. Per pinned year:
   - skip when `archive/<year>.source` holds the pinned SHA and
     `archive/<year>/` exists (no network after the first build);
   - unless `git cat-file -e <sha>^{commit}` passes, `git fetch origin <sha>`,
     with `--depth=1` only when `git rev-parse --is-shallow-repository` says
     the clone is already shallow (a full clone stays full);
   - `git archive <sha> <year>` into a temp dir under `archive/`, then
     replace `archive/<year>/` with it and write the stamp last, so a changed
     pin or an interrupted run never leaves stale files behind;
   - log `archive/<year> ← <sha>` when it fetches; on failure throw one
     sentence naming the year, the SHA and the fix.
4. **`archivedEditions()` reads `archive/sources.json`**, not the directory
   listing, so a missing fetch fails the build instead of silently dropping
   `/2026` from the footer, the sitemap and `lastEdition()`.
5. **`npm run archive -- <year>`** deletes `archive/<year>.source` when it
   writes `archive/<year>/`, so the next live build refetches the pinned
   build instead of trusting a local one. The publish steps live in
   `docs/adapting.md`.

## Technical Considerations

- **Architecture:** ADR 0012 records "past editions' builds live on the
  `archives` branch; `main` pins them". ADR 0011's status becomes "accepted;
  the 'live build carries the archives' bullet superseded by 0012" (the
  format of 0002), and `docs/adr/README.md` says the same.
- **History:** the 15 MB stays in `main`'s history from #531; no rewrite.
  The win is the tree and every future edition.
- **CI:** `actions/checkout` leaves `origin` authenticated, so the fetch
  works in every job. The axe container has git (`git version 2.43.0` in
  its last run).
- **`archives` is production input:** the maintainer gives it the same
  PR-required ruleset as `main`. A force-push could drop a pinned commit.

## Implementation Phases

### Phase 1: The archives branch

- **Status:** Done
- **Scope:** Create the orphan `archives` commit whose only entry is `2026/`
  (the tree of `2f9c9b9e:archive/2026`) and push it as `archives`. The
  maintainer adds the ruleset.
- **Files touched:** none on `main`.
- **Acceptance criteria:** `origin/archives:2026` is the same tree as
  `2f9c9b9e:archive/2026`.
- **Validation:** `git fetch -q origin archives && test "$(git rev-parse origin/archives:2026)" = "$(git rev-parse 2f9c9b9e:archive/2026)"`

### Phase 2: main pins and fetches

- **Status:** Done
- **Scope:** One PR into `main`, with the deletion of `archive/2026/` in its
  own commit so the code reads alone.
- **Files touched:**
  - new: `archive/sources.json`,
    `docs/adr/0012-past-editions-live-on-the-archives-branch.md`
  - code: `.gitignore`, `astro.config.ts`, `src/integrations/archives.ts`,
    `src/lib/editions.ts`, `scripts/archive.mjs`
  - deleted: `archive/2026/**`
  - docs: `docs/adr/0011-root-for-the-next-edition-archives-under-the-year.md`
    (status), `docs/adr/README.md`, `docs/adapting.md` ("The yearly
    switch" step 1: archive, publish to `archives` through a PR, pin the
    merged commit), `CLAUDE.md` (map entry `archive/<year>/` and the
    "Archive an edition" command row), `README.md` (intro line, the archive
    block under the commands, the `/2026/…` page row),
    `.claude/rules/pages.md` (the Archives bullet), `docs/product.md` (the
    yearly switch and the frozen-lineup line)
- **Acceptance criteria:** the success criteria below.
- **Validation:** the verification command below.

## Success Criteria

```success-criteria
GOAL: devfest.cz/2026 serves the same frozen build, fetched at build time from a pinned commit on the archives branch, and main's tree no longer carries it.

SUCCESS CRITERIA:
- main tracks only the pin under archive/ | verify: test "$(git ls-files archive)" = "archive/sources.json"
- The pin is a commit on origin/archives whose 2026/ is the frozen build from #531 | verify: git fetch -q origin archives && S=$(node -p "require('./archive/sources.json')['2026']") && git merge-base --is-ancestor "$S" origin/archives && test "$(git rev-parse "$S:2026")" = "$(git rev-parse 2f9c9b9e:archive/2026)"
- A build with no local archive fetches it, and dist/2026 equals the frozen build | verify: rm -rf archive/2026 archive/2026.source && npm run build && T=$(mktemp -d) && git archive 2f9c9b9e archive/2026 | tar -x -C "$T" && diff -r "$T/archive/2026" dist/2026
- The next build does not fetch again | verify: ! npm run build 2>&1 | grep -q 'archive/2026 ←'
- A pin that cannot be fetched fails the build by name | verify: manual 1. Set the 2026 pin to forty zeros. 2. Delete archive/2026 and archive/2026.source. 3. npm run build fails with a sentence naming 2026 and the SHA. 4. Restore the pin.
- The full gate is green | verify: npm run verify
- CI is green on the PR and its preview serves /2026 | verify: manual 1. All PR checks green. 2. devfest-public--pr-<n>-*.web.app/2026 and one speaker page under it render, photos included.

NON-GOALS:
- Rewriting main's history to drop the 15 MB #531 added.
- Rebuilding any archive in CI or on deploy.
- Touching the 2026 branch, or the editions on their own subdomains (2025 and older).
- Workflow changes.

VERIFICATION COMMAND: test "$(git ls-files archive)" = "archive/sources.json" && git fetch -q origin archives && S=$(node -p "require('./archive/sources.json')['2026']") && git merge-base --is-ancestor "$S" origin/archives && test "$(git rev-parse "$S:2026")" = "$(git rev-parse 2f9c9b9e:archive/2026)" && rm -rf archive/2026 archive/2026.source && npm run build && T=$(mktemp -d) && git archive 2f9c9b9e archive/2026 | tar -x -C "$T" && diff -r "$T/archive/2026" dist/2026 && ! npm run build 2>&1 | grep -q 'archive/2026 ←' && npm run verify
```

## Success Metrics

- `main`'s tree has 422 fewer files; the 2027 archive adds none to it.
- `devfest.cz/2026` unchanged (same bytes, same sitemap entries).

## Dependencies & Risks

- **Order:** Phase 1 before Phase 2; the pin needs the pushed commit.
- **Ruleset on `archives`** is the maintainer's; until it exists the branch
  is unprotected (the pin still guards production).
- **Build needs the network once per pin**; offline without the stamp, it
  fails with the fix in the message.
- **Re-archiving a pinned year** locally is overwritten by the next live
  build; publish from `.archive/<year>/site` first (`docs/adapting.md`).

## Definition of done

This plan and the change ship in one PR: `npm run verify` green, `/review`
over the diff with findings fixed or answered, draft PR against `main` via
the `ship` skill, CI green, PR and preview URL handed back.

## References & Research

- ADR 0011: `docs/adr/0011-root-for-the-next-edition-archives-under-the-year.md`
- Brainstorm option C (rebuild per deploy, rejected):
  `docs/brainstorm/2026-11-08-edition-archive-and-teaser-brainstorm-doc.md:47`
- Archive copy and sitemap: `src/integrations/archives.ts`
- Readers of `archive/<year>/`: `src/lib/editions.ts` (`archivedEditions`,
  `pastEditions`, `lastEdition`, `flagHref`, `crossesBuild`),
  `astro.config.ts:27`
- Archive script: `scripts/archive.mjs`
- Yearly switch: `docs/adapting.md` → "The yearly switch"
- Branch switch: #532; the archive's arrival: #531 (2f9c9b9e)
