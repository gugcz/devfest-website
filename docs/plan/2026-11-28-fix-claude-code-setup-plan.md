---
title: "fix(claude): project skills load, deploy guards close their gaps, instructions match the code"
type: fix
date: 2026-11-28
---

> **Note:** This plan was split into parts. See the -part-N files in this directory.

## fix(claude): project skills load, deploy guards close their gaps, instructions match the code - Overview

## Overview

A review of the repo's Claude Code setup on 2026-11-28 found 18 problems.
Four of them are serious:

- The project `ship` skill never loads. `/ship` runs Claude Code's bundled skill instead.
- The deploy guard only watches Bash. The Firebase MCP plugin can deploy around it.
- `block-deploy.sh` lets through production Firebase commands and several merge spellings.
- Wingspan's `/build` opens its own non-draft PR, against the repo's PR rules.

The rest is drift: dead rule globs, stale facts, a CLAUDE.md over the
documented size target, and conflicts between the repo and the maintainer's
personal instructions. The work ships as three PRs.

## Parts

| Part | PR | Depends on |
| --- | --- | --- |
| [Part 1](2026-11-28-fix-claude-code-setup-part-1-plan.md) | `fix(claude)`: hooks, settings, the setup test file, ADR 0017 | — |
| [Part 2](2026-11-28-fix-claude-code-setup-part-2-plan.md) | `fix(claude)`: `finish-pr` skill, wingspan names, rules, CLAUDE.md under 200 lines | Part 1 |
| [Part 3](2026-11-28-fix-claude-code-setup-part-3-plan.md) | `fix(email)`: the functions tagline | — |

The hooks are security-sensitive and get their own review. Part 3 deploys
production functions on merge, so it does not hide under a `fix(claude)`
subject.

## Decisions

The maintainer made these on 2026-11-28:

- Branches are `<type>/<slug>` for humans and Claude alike. Agents keep
  pushing and opening a draft PR, as the Definition of done says.
- The Firebase CLI goes on an allowlist in `block-deploy.sh`. Allowed:
  `emulators:*`, any `*:list`, `login`, `logout`, `use`, `help`, `--version`,
  and `hosting:channel:deploy` to any channel except `live`.
- `functions/src/site.ts` takes the site's tagline. Edition, invoice close
  date, `dateLine` and `venue` stay on 2026: the e-mails print them together,
  and 2027 has no date or venue yet.
- `settings.json` disables bypass permissions mode. Marketplaces stay unpinned.
- The `ship` skill becomes `finish-pr`.
- The maintainer's personal `~/.claude/CLAUDE.md` gains an exception line for
  this repo. It lives outside the repo and outside these PRs.

## Non-goals

- A repo-specific reviewer agent in `.claude/agents/`.
- Pinning marketplaces to a commit SHA.
- The wrong path in `docs/adapting.md:178`.
- A 2027 invoice close date, event date or venue.

## References & Research

- Skill name precedence: https://code.claude.com/docs/en/skills (table "Resolve skills that share a name")
- CLAUDE.md size: https://code.claude.com/docs/en/memory ("target under 200 lines per CLAUDE.md file")
- Hook quoting and worktree root: https://code.claude.com/docs/en/hooks, https://code.claude.com/docs/en/worktrees
- Deny globs for MCP tools: https://code.claude.com/docs/en/permissions
- `/plan` and `/review` built-ins: https://code.claude.com/docs/en/commands
- Wingspan `/build` PR step: `vgv-wingspan/skills/build/SKILL.md:294` (plugin 0.1.0)
