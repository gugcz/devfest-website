---
name: ship
description: Finish a change in this repo — run the verify gate, review the diff, commit in the house format, push the branch, open a draft PR against 2026 (or update it) and hand back its preview URL. Use when the user says ship, wrap up, open a PR, or the work is done. Use it instead of wingspan's /create-pr. Never merges or deploys.
---

# Ship a change

Carries a change from "code is written" to the definition of done in
`CLAUDE.md`. It stops at an open draft PR with CI reported. It never merges, never
pushes to `2026`, never deploys; "ship it" is not merge permission.

## 1. Check the branch

- `git branch --show-current` must not be `2026`. If it is, create a branch
  first (`claude/<short-topic>` unless the session names one).
- `git status` and `git diff` — read the whole diff once, adversarially. Look
  for leftover debug output, stray files, and anything the public-repo rule in
  `CLAUDE.md` forbids (real names, emails, ids, codes). Remove it before
  going on.

## 2. Run the gate

```bash
npm run verify
```

That is `npm run check` (astro check), `npm run complexity` (cognitive
complexity, max 15), the functions test suite and the axe sweep — the checks
CI runs on every PR against `2026`.

- If dependencies are missing, run `npm ci && npm --prefix functions ci`.
- If Chromium is missing for `npm run a11y`, try the preinstalled browser
  first (`PLAYWRIGHT_BROWSERS_PATH`), then `npx playwright install chromium`.
- A check the change cannot affect (e.g. a11y for a functions-only change) may
  be skipped only if it cannot run here; note which one and why in the PR.
- Fix every failure and re-run. Do not continue on red.
- Run the `update-docs` skill over the diff. A change that adds or renames a
  function, endpoint, page, secret or rule, alters what a visitor sees or how
  the site looks, or makes an architecture decision moves the docs in the
  same PR (`.claude/rules/docs.md`).

## 3. Review

Run wingspan `/review` (or at least the
`vgv-wingspan:codebase-review:vgv-review-agent` agent) over the diff. Fix
each finding or answer it in one line. Where a finding contradicts
`CLAUDE.md`, `docs/design.md` or `.claude/rules/`, the repo wins; say so
rather than changing the code. If a fix touches code, re-run step 2.

## 4. Commit

Conventional Commits with a scope; the subject says what a visitor or the
maintainer notices:

```
fix(tickets): sold-out wave stays visible with a struck price
```

Keep commits focused; add the attribution trailer the session requires.

## 5. Push and open the PR

- `git push -u origin <branch>` (retry on network errors only).
- Open a **draft** PR against `2026` (`gh pr create --draft`, or the GitHub
  MCP `create_pull_request` with `draft: true`), or update the existing one
  for this branch. Title = the commit subject format. Body follows
  `.github/PULL_REQUEST_TEMPLATE.md`: **Summary**, **Why**, **Behavior**,
  **Files**, **Type of Change**, in that order and nothing else. No test
  plan section.
- If the session has PR-attribution or assignee rules, apply them.

## 6. Report

- Wait for CI on the PR head (correctness gate, accessibility audit, hosting
  preview). If a check fails, fix, re-run the gate, push, repeat.
- Hand the user the PR link and the preview URL from the hosting check
  (`devfest-public--pr-<n>-*.web.app`), never a production URL. A PR preview
  calls **production** functions: say so if the change touches `functions/`.
