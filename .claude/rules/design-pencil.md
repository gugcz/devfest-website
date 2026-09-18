---
paths:
  - "design/**"
  - "DESIGN.md"
  - "PRODUCT.md"
  - ".impeccable/**"
  - "src/components/**"
  - "src/pages/**"
  - "src/layouts/**"
  - "src/styles/**"
---

# Design workflow: pencil first, impeccable as the gate, DESIGN.md as the law

Three artifacts, one order. **Pencil** (`design/devfest.pen`, pen.dev) is where
a surface is composed. **Impeccable** (`/impeccable …`) is how a surface is
briefed, critiqued and audited. **`DESIGN.md`** (+ `.impeccable/design.json`)
is the binding record that both must agree with. Nothing visual lands in
`src/` that was not first laid out on the canvas or, for a narrow refinement,
checked against it.

## The canvas

- `design/devfest.pen` is the visual companion to `DESIGN.md`. Its variables
  mirror `BaseLayout.scss` `:root` one-to-one (`$color-accent` ↔
  `--color-accent`, `$fs-h2` ↔ `--fs-h2`, `$gutter` ↔ `--gutter`). Fluid
  `clamp()` tokens are stored at their **1440px desktop value**.
- Root frames: `Components` (the primitives: `Header`, `Eyebrow`,
  `Button/*`, `Hairline Link`, `Ticker/Item`, `Ticker/Band sm|lg`,
  `Subpage/Hero`, `Head/Stack`, `Head/Split`, `Field/Row Link` (+ hover),
  `Ticket/Stub`, `Speaker/Tile`, `Session/Row`, `Fact`, `NextStep/Row`,
  `Agenda/Cell`, `Crew/Card`, `Coverage/Row`, `Kit/Item`, `Desk/Row`,
  `FAQ/Row`, `Logo/Cell`, `Band/Closer Accent`, `Footer`), then one frame
  per route (`Home`, `Sessions`, `Agenda`, `Speakers`, `Team`, `Contact`,
  `FAQ`, `Attending`, `Invoice`, `Partners`, `Press`, `Press downloads`,
  `Thank you`, `Newsletter thank you`, `404`, `Privacy policy`, `Invite`),
  plus `Surfaces` (menu overlay, cookie banner, session sheet, speaker
  sheet) and `Mobile` (375px `Home` and `Sessions`). Every one mirrors the
  **deployed** route section by section. A subpage is `Subpage/Hero` →
  `Ticker/Band sm` → lit band with `Head/Stack` → rows → `Band/Closer
  Accent` → `Footer`; overrides go through descendant ids (nested:
  `"<refId>/<nodeId>"`).
- The canvas was measured from production (devfest.cz at 1440px, computed
  styles via Playwright). When the site changes, re-measure and update the
  canvas in the same PR; when the canvas changes first, that is the design
  decision and the code follows.
- **Open the file before any `mcp__pencil__*` call**, or every call fails
  with "A file needs to be open in the editor":
  `code design/devfest.pen` (VS Code extension MCP) or
  `open -a Pen design/devfest.pen` (desktop MCP, `.mcp.json`).
- Read the pen-dev skill first (`mcp__pencil__read_skill`, then
  `execute.md` and `pen-schema.md`). Reference tokens with `$name`; never
  hard-code a hex or a font name on the canvas.
- New surface → new root frame, `placeholder: true` while in progress,
  `FindEmptySpace` anchored on `Home` to place it, `TakeScreenshot` or
  `Export(...,"png")` to verify. Instance the `Components` frame; do not
  redraw a button.
- Section hairlines on the canvas are `$rule` (13%), never `$rule-soft`
  (6%): the faint step disappears in exports. Code still uses `--rule-soft`.
- Renderer gotchas (verified 2026-09-18): gradients DO paint (linear,
  radial, mesh, layered fills), so draw feathers, vignettes and washes as
  real gradients; linear `rotation: 270` runs left to right. Text stroke,
  CSS masks, blend modes and repeating patterns do not exist. A fresh
  image fill renders white until Pen reloads the document (quit, reopen);
  a root frame built from many inserts can stay unpainted until you
  `Copy` it onto its own position and delete the original. Export in a
  separate call. Whichever app the MCP targets
  (`pgrep -fl mcp-server-darwin-arm64`) must have the file open. `execute`
  globals do not survive between calls; carry ids as literals. Pen saves
  only on quit; `open -a Pen` during a quit cancels the save.
- Images reference the repo's own files by relative path
  (`../public/hero-detective.webp`, `../src/assets/team/<slug>-bw.webp`,
  `../src/assets/partners/<tier>/<name>.png`, `../public/press-kit/*.png`).
  Nothing is copied into `design/`. Pencil paints WebP and PNG from local
  paths only (no SVG, AVIF or remote URLs), so SVG/AVIF logos are mono
  wordmark placeholders, and runtime data (speaker portraits from the
  lineup API, press clippings) is a `$panel-lit` example plate. The
  canvas is a design reference, not a content mirror.
- `.pen` files are encrypted: never `Read`, `Grep` or hand-edit one.

## The loop for a new or redesigned surface

1. **Brief.** `/impeccable shape <surface>` (writes a surface brief under
   `.impeccable/surfaces/`). `PRODUCT.md` is the product truth it reads;
   fix facts there, not in the brief.
2. **Compose on the canvas.** Build the surface in `design/devfest.pen`
   from `Components`. Every text uses a `$fs-*` step, every colour a
   `$color-*` / `$ink-*` token, every gap a spacing token. If the design
   needs a value the tokens lack, add the token to **all three**:
   `BaseLayout.scss`, `DESIGN.md` (frontmatter + prose), `.pen` variables.
3. **Critique the comp.** `/impeccable critique` on a `TakeScreenshot` or
   `Export(...,"png")` of the frame before writing code. Fix on the canvas.
4. **Code it.** Translate the frame into Astro + SCSS per `DESIGN.md`
   (primitives by class name, recipes from `_type.scss`, tokens only).
   Same labels, same spacing, same type steps as the canvas.
5. **Audit the build.** The impeccable design hook fires on every UI edit;
   triage its findings per `/impeccable hooks` (fix, or `ignore-value` with
   named evidence — never `ignore-file` on your own judgment). Then
   `npm run a11y` (zero violations) and `/impeccable audit <route>`.
6. **Record.** If the build changed a token, a primitive or a rule, update
   `DESIGN.md` and regenerate `.impeccable/design.json` in the same PR, and
   sync the `Components` frame so the canvas does not drift.

A narrow refinement of an existing surface (copy, spacing, a state) may skip
step 1 and go canvas → code, but still passes steps 5 and 6.

## Guardrails

- `DESIGN.md` `[MUST]` rules bind the canvas too: `#CC0000` never small
  text, one `$fs-display` per page, `.band--accent` once per page, sharp
  corners (`$radius` = 2), no icon library, three faces only.
- The canvas is a design record, not a screenshot archive: delete
  exploration frames once a direction is chosen; keep one frame per
  surface.
- Impeccable owns `.impeccable/config.json` through its CLI
  (`/impeccable hooks …`); do not hand-edit it except `detector.extensions`.
- `impeccable context` reports `CONTEXT_STALE` when `DESIGN.md` and the code
  drift; report it, and fix it only when asked (`/impeccable doctor`).
