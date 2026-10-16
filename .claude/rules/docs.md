---
paths:
  - "docs/**"
  - "README.md"
  - "CLAUDE.md"
  - ".claude/**"
  - ".github/PULL_REQUEST_TEMPLATE.md"
---

# Docs: what goes where

- **`README.md`** is for a human setting the project up: what the site is,
  how to run it, every function and its trigger, secrets, console-only setup
  (App Check, GA4, TTL policies, rules), and the key pages.
- **`CLAUDE.md`** stays short and always true: the hard rules, commands,
  definition of done, the map, and pointers. Anything that only matters when
  touching certain files is a path-scoped rule in `.claude/rules/`, listed in
  the CLAUDE.md rules table.
- **`docs/adr/NNNN-<slug>.md`** records a decision that shaped the
  architecture: data access, the Firebase split with the mobile app, a new
  integration or store, security posture. Write one in the same PR as the
  change. Format: title, Status, Date, PR; then Context / Decision /
  Consequences. Number in sequence, never reuse a number, and add it to
  `docs/adr/README.md`. A reversed decision gets a new ADR that supersedes it;
  the old one stays, marked `Superseded by NNNN`.
- **`docs/brainstorm/YYYY-MM-DD-<slug>-brainstorm-doc.md`** and
  **`docs/plan/YYYY-MM-DD-<type>-<slug>-plan.md`** come from the
  `vgv-wingspan` `/brainstorm` and `/plan` skills (`<type>` is the
  Conventional Commits type). Commit them in the same PR as the change they
  led to and never delete them. A plan is linked from its issue if there is
  one.
- **`docs/design.md`** and `.impeccable/design.json` are the design record;
  **`docs/product.md`** the product record (`.claude/rules/design-pencil.md`).
- When a change adds or renames a function, an endpoint, a page, a secret or a
  rule, update README's table, CLAUDE.md's function list and rules table,
  the endpoint table in `.claude/rules/api.md`, and the matching rule **in
  the same PR** (the `update-docs` skill walks the list).
- The repo is public: no customer data and no business internals in any of
  these files (CLAUDE.md, top).
