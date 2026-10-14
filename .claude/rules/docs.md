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
- **`DESIGN.md`** and `.impeccable/design.json` are the design record;
  **`PRODUCT.md`** the product record (`.claude/rules/design-pencil.md`).
- When a change adds or renames a function, an endpoint, a page, a secret or a
  rule, update README's table, CLAUDE.md's function list and endpoint table,
  and the matching rule **in the same PR**.
- The repo is public: no customer data and no business internals in any of
  these files (CLAUDE.md, top).
