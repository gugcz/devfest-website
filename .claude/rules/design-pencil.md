---
paths:
  - "design/**"
  - "docs/design.md"
  - "docs/product.md"
  - ".impeccable/**"
  - "src/components/**"
  - "src/pages/**"
  - "src/layouts/**"
  - "src/styles/**"
---

# Design workflow: impeccable as the gate, docs/design.md as the law, pencil as a source

**`docs/design.md`** (+ `.impeccable/design.json`) is the binding record.
**Impeccable** (`/impeccable …`) is how a surface is briefed, critiqued and
audited. **Pencil** (`design/devfest.pen`, pen.dev) is an additional source:
read it for layout, spacing and type when it has a frame for the surface,
but it does not gate code.

**The maintainer owns `design/devfest.pen`.** The maintainer composes in the
Pen app; the agent never writes to that file: no inserts, updates, deletes,
variable changes or cleanup. If the canvas and the code disagree, say so;
do not fix the canvas.

## Agent access: the headless `pen` CLI only

Verified 2026-10-17 with pen 0.3.12 (`pen interactive --help`; reads left
`devfest.pen` byte-identical and wrote no output file).

The `pencil` MCP server drives the running Pen app, so its edits land live in
the document the maintainer has open. The agent does not use it. It uses the
headless CLI (`@pen.dev/cli`, `pen interactive`), which runs the same engine
without the app, piped through Bash:

```sh
printf '%s\n' "execute({ input: 'Get((n,c)=>{c.skipChildren();Print(n.id,n.name)})' })" "exit()" \
  | pen interactive -i design/devfest.pen -o <scratchpad>/read.pen
```

- **Reading** (frames, tokens, exports): `-i design/devfest.pen`, `-o` a
  file in the scratchpad, and never `save()`. `-o` is required in headless
  mode; without `save()` nothing is written.
- **Proposing** a frame: `-o design/drafts/<slug>.pen` and `save()`. Hand
  the maintainer the path; they move what they want into `devfest.pen`.
  Never `-o design/devfest.pen`. `design/drafts/` is gitignored; drafts
  are never committed.
- Comps for critique: `Export(["<frameId>"], "png", "<scratchpad dir>")`
  inside `execute`, then read the PNG.
- `pen status` must show a stored session (`pen login` is the maintainer's
  to run). A `--prompt` run starts the CLI's own AI agent; do not use it.
- Globals carry over between `execute` calls within one `pen interactive`
  run, not between runs.

## The canvas

- `design/devfest.pen` is the visual companion to `docs/design.md`. Its variables
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
  styles via Playwright). When the maintainer changes the canvas first, that
  is the design decision and the code follows.
- Read the pen-dev skill first (`read_skill()`, then `execute.md` and
  `pen-schema.md`, through `pen interactive`). Reference tokens with
  `$name`; never hard-code a hex or a font name on the canvas.
- A draft frame instances the `Components` frame; do not redraw a button.
- Section hairlines on the canvas are `$rule` (13%), never `$rule-soft`
  (6%): the faint step disappears in exports. Code still uses `--rule-soft`.
- Renderer gotchas (verified 2026-09-18): gradients DO paint (linear,
  radial, mesh, layered fills), so draw feathers, vignettes and washes as
  real gradients; linear `rotation: 270` runs left to right. Text stroke,
  CSS masks, blend modes and repeating patterns do not exist. A fresh
  image fill renders white until Pen reloads the document (quit, reopen);
  a root frame built from many inserts can stay unpainted until you
  `Copy` it onto its own position and delete the original (in a
  `design/drafts/` file only). Export in a
  separate call. In the app, Pen saves only on quit; `open -a Pen` during
  a quit cancels the save.
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
   `.impeccable/surfaces/`, creating the folder on first use; none exists
   yet). Commit the brief with the surface it shaped. `docs/product.md` is
   the product truth it reads; fix facts there, not in the brief.
2. **Read the canvas, if there is a frame.** The maintainer composes in Pen;
   the agent reads through `pen interactive` and may propose a frame in
   `design/drafts/<slug>.pen`. A frame present is a reference for labels,
   spacing and type steps; no frame is not a blocker.
3. **Critique.** `/impeccable critique` on the comp (an `Export(...,"png")`
   of the frame) or on the built route.
   Canvas findings go back to the maintainer; do not fix them on the canvas.
4. **Code it.** Build in Astro + SCSS per `docs/design.md` (primitives by
   class name, recipes from `_type.scss`, tokens only). Every text uses a
   `--fs-*` step, every colour a token, every gap a spacing token. A value
   the tokens lack goes into `BaseLayout.scss` and `docs/design.md`
   (frontmatter + prose); tell the maintainer so the `.pen` variable follows.
5. **Audit the build.** The impeccable design hook fires on every UI edit;
   triage its findings per `/impeccable hooks` (fix, or `ignore-value` with
   named evidence — never `ignore-file` on your own judgment). Then
   `npm run a11y` (zero violations) and `/impeccable audit <route>`.
6. **Record.** If the build changed a token, a primitive or a rule, update
   `docs/design.md` and regenerate `.impeccable/design.json` in the same PR.
   Name any canvas drift in the PR for the maintainer; do not sync it.

A narrow refinement of an existing surface (copy, spacing, a state) may skip
steps 1–3 and still passes steps 5 and 6.

## Guardrails

- `docs/design.md` `[MUST]` rules bind the canvas too: `#CC0000` never small
  text, one `$fs-display` per page, `.band--accent` once per page, sharp
  corners (`$radius` = 2), no icon library, three faces only.
- The canvas is a design record, not a screenshot archive. Exploration
  frames are the maintainer's to keep or delete.
- Impeccable owns `.impeccable/config.json` through its CLI
  (`/impeccable hooks …`); do not hand-edit it except `detector.extensions`.
- `impeccable context` reports `CONTEXT_STALE` when `docs/design.md` and the code
  drift; report it, and fix it only when asked (`/impeccable doctor`).
