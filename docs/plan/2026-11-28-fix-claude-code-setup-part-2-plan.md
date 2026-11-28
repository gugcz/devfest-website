---
title: "fix(claude): the project PR skill loads and the instructions match the code"
type: fix
date: 2026-11-28
---

## fix(claude): the project PR skill loads and the instructions match the code - Standard

Part 2 of 3 of [the Claude Code setup fix](2026-11-28-fix-claude-code-setup-plan.md).

## Overview

The project `ship` skill never loads, CLAUDE.md names wingspan commands that
run built-ins instead, the rules carry dead globs and stale facts, and
CLAUDE.md sits over the documented size target. This part fixes the skills,
the rules and CLAUDE.md.

## Problem Statement / Motivation

Agents read these files before the code. Evidence, checked on 2026-11-28
against Claude Code 2.1.325:

- `skills.md`: "A skill or command of yours named `ship`, `ship-local`, or
  `steward` … Claude Code doesn't load yours."
- `commands.md`: `/plan` enters plan mode; `/review` is an alias of
  `/code-review`.
- Wingspan `/build` pushes and opens a non-draft PR with `## Test plan`
  (`build/SKILL.md:294`, plugin 0.1.0).
- `memory.md`: "target under 200 lines per CLAUDE.md file." CLAUDE.md has 263.
- `.claude/rules/sessionize.md:12-13` globs `src/pages/speakers/**` and
  `src/pages/talks/**`; those pages live in `src/routes/`.

## Proposed Solution

- Rename `ship` to `finish-pr` and make it user-only.
- Write wingspan commands by their full names and say where `/build` stops.
- Branches are `<type>/<slug>` for humans and Claude alike; agents keep
  pushing and opening a draft PR, as the Definition of done says.
- Fix the rules against the code, and let part 1's dead-glob check prove it.
- Trim CLAUDE.md below 200 lines by moving detail to the rules it belongs to.

## Technical Considerations

- **Hard rules stay.** No merge or deploy, no customer data, the Firebase
  split, the Definition of done.
- **Functions mirror.** `functions/src/site.ts` keeps edition 2026, the
  invoice close date, `dateLine` and `venue` until 2027 has those facts. The
  ticket e-mails print all four together. `backend.md` says so.
- **ADRs are not rewritten.** `analytics.md` links ADRs 0007, 0015 and 0016
  instead of restating them.

## Implementation Phases

### Phase 1: Skills and the wingspan workflow

- **Status:** Not started
- **Scope:** Rename `ship` to `finish-pr` so it loads, stop it triggering on its own, and make CLAUDE.md name the wingspan commands that run and say where `/build` stops.
- **Files touched:** `.claude/skills/ship/SKILL.md` → `.claude/skills/finish-pr/SKILL.md`, `.claude/skills/update-docs/SKILL.md`, `CLAUDE.md`
- **Acceptance criteria:**
  - [ ] `finish-pr` has `disable-model-invocation: true`, a third-person description without "or the work is done", the full `verify` list, `<type>/<slug>` branches and no vague attribution lines.
  - [ ] `update-docs` has a third-person description, a `docs/adapting.md` row, and asks the user to run `/finish-pr` rather than calling it.
  - [ ] CLAUDE.md uses `/vgv-wingspan:<skill>` names, says `/build` stops after review and `/finish-pr` opens the draft PR, and says `/vgv-wingspan:review` runs the review agents without a count.
  - [ ] CLAUDE.md's branch line reads `<type>/<slug>` for humans and Claude.
- **Validation:** `! git grep -nE '`ship`|/ship( |$)|claude/<' -- CLAUDE.md README.md CONTRIBUTING.md .claude && test -f .claude/skills/finish-pr/SKILL.md`

### Phase 2: Rules match the code

- **Status:** Not started
- **Scope:** Fix dead globs, stale facts and coverage gaps in `.claude/rules/`, and shorten `analytics.md`.
- **Files touched:** `.claude/rules/*.md`, `README.md`
- **Acceptance criteria:**
  - [ ] `sessionize.md` drops the 2026-only lines. (Its dead globs were fixed in part 1, whose dead-glob check needed them.)
  - [ ] `invoices.md` points the close date at `src/site.config.ts` and `functions/src/site.ts`.
  - [ ] `analytics.md` names `TRACKING_HOSTS` and globs `checkout.ts` and `react-errors.ts`.
  - [ ] `analytics.md` links ADRs 0007, 0015 and 0016 instead of restating them, moves console steps to README and App Check to `backend.md`. No ADR is edited.
  - [ ] `api.md` and `pages.md` glob the files their bodies name.
  - [ ] `tickets.md` drops `InvoiceForm.tsx` and the "sales are closed" line.
  - [ ] `docs.md` globs `.claude/rules/**`, `.claude/skills/**`, `.claude/hooks/**` and `.claude/settings.json` instead of `.claude/**`.
  - [ ] `design.md` and `update-docs` agree: `/impeccable doctor` findings are reported and fixed only when asked.
  - [ ] `backend.md` says which `functions/src/site.ts` facts stay on 2026 and why.
- **Validation:** `npm run test:claude`

### Phase 3: CLAUDE.md under 200 lines

- **Status:** Not started
- **Scope:** Trim CLAUDE.md below 200 lines without losing a hard rule, and fix its remaining drift.
- **Files touched:** `CLAUDE.md`, `README.md`, `CONTRIBUTING.md`, `.claude/rules/backend.md`, `.claude/rules/docs.md`, `.claude/skills/update-docs/SKILL.md`
- **Acceptance criteria:**
  - [ ] CLAUDE.md is under 200 lines.
  - [ ] Hook internals shrink to one line each; the rules table loses its Paths column; the function list moves to `backend.md`; lines repeated from `pages.md` and `settings.json` go.
  - [ ] Every hard rule stays: no merge or deploy, no customer data, the Firebase split, the Definition of done.
  - [ ] CLAUDE.md, README and CONTRIBUTING.md list every `verify` step, and the map names `scripts/flags-off-build.mjs`.
  - [ ] `docs.md` and `update-docs` point at the function list's new home in `backend.md`.
- **Validation:** `test $(wc -l < CLAUDE.md) -lt 200`

## Success Criteria

```success-criteria
GOAL: The project PR skill loads, and CLAUDE.md, the rules and the skills state only what the code and the plugins do.

SUCCESS CRITERIA:
- The finish-pr skill exists and is user-only | verify: test -f .claude/skills/finish-pr/SKILL.md && grep -q '^disable-model-invocation: true' .claude/skills/finish-pr/SKILL.md
- No reference to the old ship skill, /ship or claude/<slug> branches remains | verify: ! git grep -nE '`ship`|/ship( |$)|claude/<' -- CLAUDE.md README.md CONTRIBUTING.md .claude
- No rule glob is dead | verify: npm run test:claude
- CLAUDE.md is under the documented 200-line target | verify: test $(wc -l < CLAUDE.md) -lt 200
- The project skill shows in a fresh session | verify: manual 1. Start a new Claude Code session on the branch. 2. Type /finish-pr and confirm the project skill's text loads. 3. Confirm /ship still runs the bundled skill.
- The full gate is green | verify: npm run verify

NON-GOALS:
- Hook and settings changes (part 1).
- The functions tagline (part 3).
- A repo-specific reviewer agent in .claude/agents/.
- The wrong path in docs/adapting.md:178.

VERIFICATION COMMAND: test $(wc -l < CLAUDE.md) -lt 200 && npm run verify
```

## Success Metrics

- `/finish-pr` appears in a new session's skill list.
- `/doctor prompt-audit` finds no contradiction between CLAUDE.md, the rules and the skills.

## Dependencies

Part 1 (`docs/plan/2026-11-28-fix-claude-code-setup-part-1-plan.md`). This
part uses its `test:claude` dead-glob check and trims the CLAUDE.md hook
lines it writes. Branch from part 1's branch, and rebase onto `main` once
part 1 merges.

## Dependencies & Risks

- **The bundled `/ship` may change name again.** `skills.md` lists the
  reserved names; `finish-pr` is not among them.
- **The trim drops a rule.** The phase 3 criteria name every hard rule; the
  review reads the CLAUDE.md diff against them.

## References & Research

- Skill name precedence: https://code.claude.com/docs/en/skills (table "Resolve skills that share a name")
- CLAUDE.md size: https://code.claude.com/docs/en/memory
- `/plan` and `/review` built-ins: https://code.claude.com/docs/en/commands
- Wingspan `/build` PR step: `vgv-wingspan/skills/build/SKILL.md:294` (plugin 0.1.0)
