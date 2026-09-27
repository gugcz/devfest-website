---
name: ship
description: Finish a change in this repo — run the verify gate, commit in the house format, push the branch, open or update the PR against 2026 and hand back its preview URL. Use when the user says ship, wrap up, open a PR, or the work is done. Never merges or deploys.
---

# Ship a change

Carries a change from "code is written" to the definition of done in
`CLAUDE.md`. It stops at an open PR with CI reported. It never merges, never
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

That is `npm run check` (astro check), the functions test
suite, and the axe sweep — the three checks the `2026` ruleset requires.

- If dependencies are missing, run `npm ci && npm --prefix functions ci`.
- If Chromium is missing for `npm run a11y`, try the preinstalled browser
  first (`PLAYWRIGHT_BROWSERS_PATH`), then `npx playwright install chromium`.
- A check the change cannot affect (e.g. a11y for a functions-only change) may
  be skipped only if it cannot run here; note which one and why in the PR.
- Fix every failure and re-run. Do not continue on red.

## 3. Commit

Conventional Commits with a scope; the subject says what a visitor or the
maintainer notices:

```
fix(tickets): sold-out wave stays visible with a struck price
```

Keep commits focused; add the attribution trailer the session requires.

## 4. Push and open the PR

- `git push -u origin <branch>` (retry on network errors only).
- Open a PR against `2026`, or update the existing one for this branch. Title
  = the commit subject format. Body sections, in this order and nothing else:
  **Summary**, **Why**, **Behavior**, **Files**. No test plan section.
- If the session has PR-attribution or assignee rules, apply them.

## 5. Report

- Wait for CI on the PR head (correctness gate, accessibility audit, hosting
  preview). If a check fails, fix, re-run the gate, push, repeat.
- Hand the user the PR link and the preview URL from the hosting check
  (`devfest-public--pr-<n>-*.web.app`), never a production URL. A PR preview
  calls **production** functions: say so if the change touches `functions/`.
