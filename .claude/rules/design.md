---
paths:
  - "docs/design.md"
  - "docs/product.md"
  - ".impeccable/**"
  - "src/components/**"
  - "src/pages/**"
  - "src/layouts/**"
  - "src/styles/**"
---

# Design workflow: impeccable as the gate, docs/design.md as the law

**`docs/design.md`** (+ `.impeccable/design.json`) is the binding record.
**Impeccable** (`/impeccable …`) is how a surface is briefed, critiqued and
audited. There is no design canvas in the repo.

## The loop for a new or redesigned surface

1. **Brief.** `/impeccable shape <surface>` (writes a surface brief under
   `.impeccable/surfaces/`). Commit the brief with the surface it shaped.
   `docs/product.md` is the product truth it reads; fix facts there, not in
   the brief.
2. **Code it.** Build in Astro + SCSS per `docs/design.md` (primitives by
   class name, recipes from `_type.scss`, tokens only). Every text uses a
   `--fs-*` step, every colour a token, every gap a spacing token. A value
   the tokens lack goes into `BaseLayout.scss` and `docs/design.md`
   (frontmatter + prose).
3. **Critique.** `/impeccable critique` on the built route.
4. **Audit the build.** The impeccable design hook fires on every UI edit;
   triage its findings per `/impeccable hooks` (fix, or `ignore-value` with
   named evidence — never `ignore-file` on your own judgment). Then
   `npm run a11y` (zero violations) and `/impeccable audit <route>`.
5. **Record.** If the build changed a token, a primitive or a rule, update
   `docs/design.md` and regenerate `.impeccable/design.json` in the same PR.

A narrow refinement of an existing surface (copy, spacing, a state) may skip
steps 1 and 3 and still passes steps 4 and 5.

## Guardrails

- Impeccable owns `.impeccable/config.json` through its CLI
  (`/impeccable hooks …`); do not hand-edit it except `detector.extensions`.
- `impeccable context` reports `CONTEXT_STALE` when `docs/design.md` and the code
  drift; report it, and fix it only when asked (`/impeccable doctor`).
