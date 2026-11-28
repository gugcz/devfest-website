# 0017. Agent guardrails cover the Firebase CLI and MCP tools, not only git

- Status: accepted
- Date: 2026-11-28
- PR: to be linked when merged

## Context

Agents never merge to `main` or deploy (CLAUDE.md). The GitHub ruleset
guards `main` and the year branches, so a push or a merge that slips past
the agent hook still stops there. Nothing like it guards the Firebase CLI
or MCP tools: a CLI session or an MCP server acts on the production
project shared with the mobile app (ADR 0002) directly.

A review on 2026-11-28 ran the hooks against about 110 commands.
`npx -y firebase-tools@latest deploy`,
`firebase hosting:clone … :live`, `firebase functions:delete` and
`gh pr -R owner/repo merge` all got through `block-deploy.sh`, which
denied only the spellings it listed. The hook watched Bash only, while the
Firebase MCP plugin offers `firebase_deploy` and Firestore, RTDB and
Remote Config writes. Plan:
`docs/plan/2026-11-28-fix-claude-code-setup-part-1-plan.md`.

## Decision

- The Firebase CLI runs on an allowlist in `.claude/hooks/block-deploy.sh`:
  `emulators:*`, any `*:list`, `login`, `logout`, `use`, `help`,
  `--version`, and `hosting:channel:deploy` to a channel other than `live`.
  Every other verb is denied, behind any wrapper (`npx`, `npm exec`,
  `pnpm dlx`, `yarn dlx`, `bun x`, a pinned `firebase-tools@<version>`).
- The hook reads the whole command line: quotes, `$(…)`, backticks,
  subshells, shell keywords, `timeout`, `nice`, `xargs` and here-strings.
  It runs for Bash and for the terminal panel tool.
- `.claude/settings.json` denies the MCP tools that deploy, write to the
  shared project, send messages to app users, or merge a PR, by tool-name
  glob, so any server name matches. Read tools stay available.
- Bypass permissions mode is off for the repo.
- Writes to the hooks and the shared permissions ask first, in an Edit and
  in a Bash command.
- `npm run test:claude` (`scripts/claude-setup.test.mjs`) holds the cases
  and runs in `verify` and the required CI job.

## Consequences

- An agent cannot deploy, delete a function or clone a channel to live,
  even when the maintainer is signed in to the Firebase CLI on that
  machine. The maintainer runs those from their own shell.
- A Firebase verb an agent needs, such as a new read-only command, needs a
  change to the allowlist and a test case.
- A new MCP server with a write tool under a new name is not covered until
  a deny rule names it.
- Editing a hook or `settings.json` prompts, including for agents doing
  the edit on purpose.
- The hooks stay a belt: a command built at run time from variables still
  gets past them. The ruleset stays the boundary for `main`.
