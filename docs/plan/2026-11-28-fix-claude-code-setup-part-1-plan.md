---
title: "fix(claude): deploy guards cover the Firebase CLI, gh merges and MCP tools"
type: fix
date: 2026-11-28
---

## fix(claude): deploy guards cover the Firebase CLI, gh merges and MCP tools - Standard

Part 1 of 3 of [the Claude Code setup fix](2026-11-28-fix-claude-code-setup-plan.md).

## Overview

`block-deploy.sh` lets through production Firebase commands and several merge
spellings, and only watches Bash. `guard-edits.sh` misses paths written
another way. `session-start.sh` can leave a broken install behind. This part
closes those gaps, denies the MCP tools that deploy or merge, and adds a test
file so the hooks stay closed.

## Problem Statement / Motivation

The GitHub ruleset guards `main` and the year branches. Nothing but these
hooks and the deny rules guards the Firebase CLI and the MCP tools. On
2026-11-28 these exited 0 from `block-deploy.sh`:

- `npx -y firebase-tools@latest deploy`
- `firebase hosting:clone devfest-public:pr-1 devfest-public:live`
- `gh pr -R owner/repo merge 12`

`git tag -l 'v2*'` exited 2 as a "release tag".

## Proposed Solution

- Put the Firebase CLI on an allowlist: `emulators:*`, any `*:list`, `login`,
  `logout`, `use`, `help`, `--version`, and `hosting:channel:deploy` to any
  channel except `live`. Deny every other verb.
- Unwrap the shell structures and package-runner wrappers the review showed
  hiding a command, then run the existing checks on the inner command.
- Deny the MCP tools that deploy, write to the shared Firebase project, or
  merge a PR, in `permissions.deny`.
- Add `scripts/claude-setup.test.mjs`: one table of allow/deny cases fed to
  the hooks on stdin, the `settings.json` deny assertions, and a dead-glob
  check over `.claude/rules/`. `node --test`, no framework, no helpers. It
  sits under `scripts/` so `npm run complexity` lints it.

## Technical Considerations

- **Security.** Record the posture change in ADR 0017, as
  `.claude/rules/docs.md` requires for security posture.
- **Deny globs.** `permissions.md`: "Deny and ask rules also accept glob
  patterns in the tool-name position." A denied tool leaves Claude's context.
  The list names write tools only; read tools stay.
- **Fail-open hooks.** `hooks.md`: "In shell form, wrap each placeholder in
  double quotes." An unquoted path with a space fails to start the hook, and
  the tool call goes ahead.
- **Worktrees.** `CLAUDE_PROJECT_DIR` stays at the session's start root, so
  `guard-edits.sh` resolves each file against its own worktree root.
- **Terminal panel.** `mcp__terminal__run_in_terminal` takes `command` and
  `cwd` (schema checked on 2026-11-28), so the Bash hook can read it as is.

## Implementation Phases

### Phase 1: Deploy and edit guards

- **Status:** Done
- **Scope:** Close every bypass and false positive the review found in the three hooks, deny the MCP tools that deploy or merge, and add the setup test file to `verify` and CI.
- **Files touched:** `.claude/hooks/block-deploy.sh`, `.claude/hooks/guard-edits.sh`, `.claude/hooks/session-start.sh`, `.claude/hooks/HookLib.pm` (new, the guarded paths both hooks share), `scripts/claude-setup.test.mjs` (new), `.claude/rules/sessionize.md` (its two dead globs, which the new check fails on), `.claude/settings.json`, `package.json`, `.github/workflows/correctness.yml`, `docs/adr/0017-agent-guardrails-cover-the-firebase-cli-and-mcp.md` (new), `docs/adr/README.md`, `CLAUDE.md`, `README.md`, `CONTRIBUTING.md`
- **Acceptance criteria:**
  - [x] `block-deploy.sh` denies `firebase-tools@<version>` behind any wrapper: `npx`, `npm exec`, `pnpm dlx`, `yarn dlx`, `bun x`.
  - [x] It denies every Firebase verb outside the allowlist, global flags before the verb included, and `hosting:channel:deploy live`.
  - [x] It denies `gh pr … merge` with `-R`/`--repo` anywhere, `gh api` merges, auto-merge and reruns, `gh run rerun` and `gh alias set`.
  - [x] It denies `git push --all`, `--mirror` and `*` refspecs.
  - [x] It unwraps subshells, braces, `if/then`, `for/do`, `!`, `timeout N`, `nice`, a leading `\`, `$()`, backticks, `xargs`, `bash <<<`, `| sh`, a trailing `&` and redirections.
  - [x] It allows `git tag -l/--list/--contains`, `git push origin fix/main`, and a quoted multi-line commit or PR body that mentions a blocked command.
  - [x] It asks when a Bash command writes to a guarded path: `sed -i`, `perl -i`, `>`, `tee`, `cp` or `mv` into it.
  - [x] It also runs for `mcp__terminal__run_in_terminal`, preferring `tool_input.cwd` when present.
  - [x] `guard-edits.sh` normalises `./`, `..`, `//`, case and a trailing slash, and resolves each file against its own worktree root.
  - [x] `guard-edits.sh` asks before edits to `.claude/hooks/**`, `.claude/settings.json` and `.firebaserc`.
  - [x] `session-start.sh` checks `node_modules/.package-lock.json`, removes a partial `node_modules` after a failed `npm ci`, and prints the failure to stdout.
  - [x] `settings.json` gains `$schema`, `disableBypassPermissionsMode: "disable"`, exec-form hook commands (`args: []`, which the hooks docs prefer to quoting), and `**/` forms of the existing `.env` denies. `Read(**/.env.*)` would also hide the committed `.env.example`.
  - [x] `settings.json` allows `npm run literals`, `npm run test:site` and `npm run test:claude`.
  - [x] `settings.json` denies the Firebase MCP write tools, `mcp__ccd_pr__set_auto_merge` and `mcp__*__merge_pull_request`.
  - [x] `npm run verify` and the `site-checks` CI job run `test:claude`, the job step guarded like its siblings.
  - [x] ADR 0017 records the Firebase CLI allowlist and the MCP deny rules, and `docs/adr/README.md` lists it.
  - [x] CLAUDE.md, README and CONTRIBUTING.md list `test:claude` among the `verify` steps, and CLAUDE.md's hook lines describe the new coverage.
- **Validation:** `npm run test:claude`

## Success Criteria

```success-criteria
GOAL: Every deploy, merge and edit bypass the review found is denied, every false positive is allowed, and a test keeps it that way.

SUCCESS CRITERIA:
- Every bypass and false positive from the review behaves as intended, settings.json denies the MCP deploy and merge tools, and no rule glob is dead | verify: npm run test:claude
- settings.json disables bypass mode | verify: node -e "process.exit(JSON.parse(require('fs').readFileSync('.claude/settings.json','utf8')).permissions.disableBypassPermissionsMode==='disable'?0:1)"
- The hooks still start from a checkout path with a space | verify: manual 1. Clone the branch into a folder whose name has a space. 2. Start a session there. 3. Ask Claude to run git tag v9.9.9 and confirm the hook blocks it.
- The full gate is green | verify: npm run verify

NON-GOALS:
- The skills, rules and CLAUDE.md trim (part 2).
- The functions tagline (part 3).
- Pinning marketplaces to a commit SHA.

VERIFICATION COMMAND: npm run verify
```

## Success Metrics

- Every case in `scripts/claude-setup.test.mjs` passes.
- No normal command from the review's allow list prompts or fails.

## Dependencies

None. Merges first; part 2 stacks on it.

## Dependencies & Risks

- **A stricter Bash hook blocks normal work.** The test table carries the
  normal commands the review found (`git log main`, `git diff main...HEAD`,
  heredoc PR bodies, `npm run verify`) as allow cases.
- **A deny glob hides a tool the maintainer uses.** Only write tools go on the
  list.
- **Later hook edits prompt.** The ask on `.claude/hooks/**` is the point.

## References & Research

- Deny globs for MCP tools: https://code.claude.com/docs/en/permissions
- Hook quoting and output: https://code.claude.com/docs/en/hooks
- Worktree root: https://code.claude.com/docs/en/worktrees
- Existing hooks: `.claude/hooks/block-deploy.sh:91-159`, `.claude/hooks/guard-edits.sh:21-45`
- Related ADR: `docs/adr/0002-shared-firebase-project.md`
