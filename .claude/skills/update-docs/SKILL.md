---
name: update-docs
description: Keep devfest-website's documentation true to the code. Updates the product record (docs/product.md), the design record (docs/design.md and .impeccable/design.json, through Impeccable), the ADRs and their index, CLAUDE.md's map, function list and rules table, the path-scoped rules, and README's setup and functions tables after a change, or audits all of them against 2026. Use when a change alters what a visitor sees, how the site looks, what the functions do, or how the repo is worked on; or when asked to "update the docs", "sync the docs" or "audit the docs".
---

# Update docs

Agents and reviewers read these documents before they read the code; a doc
that no longer matches the code misleads both. This skill never invents a
decision: it records what the code and the maintainer already decided, and
asks when the two disagree.

## 1. Pick the scope

- **After a change** (the usual case, from `ship` before the PR):
  `git diff --name-only origin/2026...HEAD` plus uncommitted changes.
- **Audit** ("audit the docs"): the whole repo on `2026` against every
  document below.

## 2. Map the change to the documents it touches

| What changed | Document | How |
| --- | --- | --- |
| What a visitor can do, see or is told: a page, a section, a flow, the audience, a constraint | `docs/product.md` | Edit in place under its existing headings. Keep the `impeccable:product-schema` marker; a fact the maintainer has not confirmed stays **[inferred]**. Never add a second product record. |
| Tokens, type, spacing, a primitive, a recipe, motion, accessibility | `docs/design.md` and `.impeccable/design.json` | Through Impeccable (step 3). |
| Data access, the Firebase split with the mobile app, a new integration or store, security posture | `docs/adr/NNNN-<slug>.md` + `docs/adr/README.md` | New ADR per new decision, added to the index. A reversed one gets a new ADR that supersedes it and `Superseded by NNNN` on the old one. Never rewrite an accepted ADR's decision. |
| A brainstorm or plan behind the change | `docs/brainstorm/`, `docs/plan/` | Committed in the same PR, never deleted. Mark a plan's steps done if it tracks them; link it from its issue if there is one. |
| A top-level folder, deployed function, command, hook, skill or rule | `CLAUDE.md` | The repo map, the "functions this repo deploys" list, the commands table, plugins and tooling, the path-scoped rules table. Stays short and always true. |
| An `/api/*` endpoint, its TTL or caller | `.claude/rules/api.md` | The endpoint table. |
| Behaviour only true under certain files (a domain's flow, a helper, a guardrail) | the matching `.claude/rules/<rule>.md` | A new topic gets a new rule with `paths:` globs and a row in CLAUDE.md's rules table. |
| Setup, a secret, a param, a function's trigger, console-only setup, a page | `README.md` | The per-domain "Functions" and "Secrets & config" tables, Getting Started, Key Pages. |

No row (a refactor, a test, a small fix restoring intended behaviour): no doc
edit. Say so and stop.

## 3. The design record goes through Impeccable

1. `/impeccable document` refreshes `docs/design.md` and
   `.impeccable/design.json` from the code (`src/layouts/BaseLayout.scss`,
   `src/styles/`, the primitives in `src/components/`). Review its diff: keep
   every `[MUST]` rule and every statement tied to a token or primitive that
   exists.
2. `impeccable context` reports `CONTEXT_STALE`: run `/impeccable doctor` and
   fix what it names.
3. Canvas: `.claude/rules/design-pencil.md`. A new token goes into
   `BaseLayout.scss` and `docs/design.md`. The canvas is the maintainer's:
   name the drift, never edit `design/devfest.pen`.

Impeccable comes from `.claude/settings.json`. If it is unavailable (a cloud
session without the plugin): edit `docs/design.md` by hand to match the code,
say in the PR body that `/impeccable document` did not run, and leave it for
the maintainer's machine.

## 4. Write it

- Audience first: `.claude/rules/docs.md` says which files are for people and
  which for agents, and what goes where.
- Plain, present-tense statements of what is true now. No history, no plans
  (those live in `docs/plan/` and the ADRs).
- Link the code that backs a claim (`src/layouts/BaseLayout.scss`), the ADR
  that decided it, or both.
- No real customer, partner or attendee data and no business internals, ever
  (CLAUDE.md).
- When the code and an agreed document disagree and it is not clear which is
  right, do not pick: ask the maintainer, quoting both.

## 5. Ship it

Docs changes ride the PR that caused them. An audit's fixes go in their own PR
(`docs(<scope>): …`) through the `ship` skill. Name every changed decision
document (`docs/product.md`, `docs/design.md`, an ADR) in the PR body so the
maintainer reviews it.
