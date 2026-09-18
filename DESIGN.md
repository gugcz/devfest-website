---
name: DevFest.cz 2026
description: Noir, but loud. One dark theme, one red, poster-scale Bebas headlines, typewriter body, mono labels.
colors:
  bg: "#050505"
  text: "#F2EFE9"
  cream: "#E8E0CC"
  grey: "#8C8C8C"
  accent: "#CC0000"
  accent-hot: "#FF1111"
  error: "rgba(220,110,110,0.95)"
  on-accent: "#F7EFE6"
  on-accent-ink: "#1A0000"
  on-accent-border: "rgba(247,239,230,0.85)"
  on-accent-field: "#9A0000"
  panel: "#0C0B0B"
  panel-2: "#111010"
  panel-hover: "#161413"
  panel-lit: "#0A0908"
  panel-lit-2: "#0E0C0B"
  rule: "rgba(240,237,230,0.13)"
  rule-soft: "rgba(240,237,230,0.06)"
  rule-strong: "rgba(240,237,230,0.22)"
  rule-red: "rgba(204,0,0,0.55)"
  field-border: "rgba(240,237,230,0.4)"
  ink-strong: "rgba(240,237,230,0.85)"
  ink: "rgba(240,237,230,0.78)"
  ink-soft: "rgba(240,237,230,0.7)"
  ink-meta: "rgba(240,237,230,0.62)"
  ink-dim: "rgba(240,237,230,0.6)"
  ink-muted: "rgba(240,237,230,0.55)"
  ink-faint: "rgba(240,237,230,0.5)"
typography:
  display:
    fontFamily: "var(--font-bebas-neue), sans-serif"
    fontSize: "clamp(3rem, 9.5vw, 9rem)"
    fontWeight: 400
    lineHeight: 0.84
    letterSpacing: "0.005em"
  headline:
    fontFamily: "var(--font-bebas-neue), sans-serif"
    fontSize: "clamp(2.9rem, 8vw, 7rem)"
    fontWeight: 400
    lineHeight: 0.84
    letterSpacing: "0.005em"
  title:
    fontFamily: "var(--font-bebas-neue), sans-serif"
    fontSize: "clamp(2.2rem, 4vw, 3.4rem)"
    fontWeight: 400
    lineHeight: 1.06
    letterSpacing: "0.02em"
  lede:
    fontFamily: "var(--font-special-elite), cursive"
    fontSize: "clamp(1.2rem, 1.6vw, 1.5rem)"
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontFamily: "var(--font-special-elite), cursive"
    fontSize: "1.05rem"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "var(--font-jetbrains-mono), monospace"
    fontSize: "0.78rem"
    fontWeight: 400
    letterSpacing: "0.28em"
  label-lg:
    fontFamily: "var(--font-jetbrains-mono), monospace"
    fontSize: "0.84rem"
    fontWeight: 400
    letterSpacing: "0.22em"
rounded:
  sharp: "2px"
spacing:
  gutter: "clamp(1.25rem, 5vw, 4.5rem)"
  section-tight: "clamp(3.75rem, 6vw, 6.5rem)"
  section: "clamp(6rem, 10vw, 11rem)"
  section-wide: "clamp(8.5rem, 15vw, 17rem)"
  field-step: "clamp(1.9rem, 2.8vw, 2.5rem)"
  field-step-short: "clamp(2.25rem, 3.6vw, 3.25rem)"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.sharp}"
    padding: "1.25rem min(2.8rem, 14vw)"
  button-primary-hover:
    backgroundColor: "{colors.accent-hot}"
    textColor: "{colors.on-accent}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.sharp}"
    padding: "1.25rem min(2rem, 10vw)"
  eyebrow:
    textColor: "{colors.ink-muted}"
    typography: "{typography.label}"
  field-row:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    typography: "{typography.title}"
    padding: "{spacing.field-step} 0"
  field-row-hover:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
  band-accent:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    padding: "{spacing.section} {spacing.gutter}"
  lit-field:
    backgroundColor: "{colors.panel-lit-2}"
    textColor: "{colors.text}"
    typography: "{typography.body}"
    rounded: "{rounded.sharp}"
    padding: "0.85rem 0.95rem"
    height: "2.75rem"
---

Design system for the DevFest.cz 2026 site. Every value was read out of the
codebase and carries its source as `file:line`. Rationale lives here, inline
with the rules; `CLAUDE.md` only points here.

## How to read this document

| Label | Meaning |
| --- | --- |
| **[MUST]** | binding. A PR that breaks it should be sent back. Either enforced by `npm run a11y`, or a decision the redesign exists to protect |
| **[CURRENT]** | the state of the code today. Not a rule; changing it is a normal design decision |

Where the code contradicts itself, see "Open points" at the end. Line numbers
are against the commit this document ships in; if one drifts, the token name is
the durable reference.

## Where things live

| | |
| --- | --- |
| `src/layouts/BaseLayout.scss` | all tokens (`:root`, lines 1–161), resets, global primitives. Injected `is:global`, so every `.astro` page and `.tsx` island uses the class names directly |
| `src/styles/_type.scss` | the type recipes as mixins — `mono()`, `display()`, `row-title()`, `prose()`, `hairline-link()`. A CSS Module that cannot compose a global class includes the mixin instead |
| `src/styles/_controls.scss` | control recipes — `lit-field()` |
| `src/components/Sheet.module.scss`, `Print.module.scss` | shared chrome composed by more than one island (the detail sheets; the mounted 4:5 print) |
| `astro.config.mjs:73–97` | the three brand faces, self-hosted via the Astro Fonts API |
| `src/components/*.module.scss` | co-located CSS Modules for React islands (`import s from './X.module.scss'`) |
| `src/components/*.astro` + `*.scss` | static components with a sibling stylesheet |
| `src/pages/*.scss` | page-scoped styles, one file per page |

**[MUST] No Tailwind, no CSS-in-JS, no utility framework.** SCSS + CSS custom
properties only. There is no `tailwind.config`, no theme object, and no runtime
style library in `package.json`.

## Color

All tokens are declared in `BaseLayout.scss` `:root`.

| Token | Value | Line | Use |
| --- | --- | --- | --- |
| `--color-bg` | `#050505` | 2 | page ground |
| `--color-text` | `#F2EFE9` | 4 | ink |
| `--color-cream` | `#E8E0CC` | 5 | warm ink variant (3 files) |
| `--color-grey` | `#8C8C8C` | 3 | muted meta (8 files) |
| `--color-accent` | `#CC0000` | 6 | the accent — CTA fill, red bands, the reach field |
| `--color-accent-hot` | `#FF1111` | 7 | focus rings, live status, figures on a facts band |
| `--color-error` | `rgba(220,110,110,0.95)` | 12 | **form-error text only** |
| `--on-accent` | `#F7EFE6` | 139 | ink on the red field |
| `--on-accent-ink` | `#1A0000` | | dark ink on the red field — large text only |
| `--on-accent-border` | `rgba(247,239,230,0.85)` | | control boundary on the red field (3.95:1) |

Surfaces: `--panel` `#0C0B0B` (134), `--panel-2` `#111010` (135), `--panel-hover`
`#161413` (136), `--panel-lit` `#0A0908` (175), `--panel-lit-2` `#0E0C0B` (176).

Hairlines: `--rule` `rgba(240,237,230,0.13)` (118), `--rule-soft` `0.06` (119),
`--rule-strong` `0.22` (120), `--rule-red` `rgba(204,0,0,0.55)` (121),
`--field-border` `rgba(240,237,230,0.4)` (131).

Ink ramp: `--ink-strong` `0.85`, `--ink` `0.78`, `--ink-soft` `0.7`,
`--ink-meta` `0.62`, `--ink-dim` `0.6`, `--ink-muted` `0.55`, `--ink-faint`
`0.5` (all `rgba(240,237,230,…)`). Named steps only; a one-off alpha stays a
raw literal.

Atmosphere: `--glow-red` / `--glow-red-soft` (162–163), `--lit` (190),
`--vignette` (195), `--field-feather` (193), `--print-mount` (170–172),
`--wash` / `--wash-strong` (the raking light a reached row / cell takes),
`--ink-monogram` `0.46` → 4.21:1 and `--ink-monogram-sm` `0.66` → 7.71:1
(186–187, ratios measured in the source comment at 184–185).

**[MUST] `--color-accent` is never small text.** `#CC0000` on `#050505` is
~3.3:1 and fails 1.4.3 for body copy (`BaseLayout.scss:8–12`). Where it may and
may not appear:

| Use of `#CC0000` | Allowed? |
| --- | --- |
| a fill (CTA background, `.band--accent`, the row reach field) | yes |
| large display type (`--fs-h3` and above) | yes |
| a rule / keyline (`--rule-red`) | yes |
| body copy, labels, meta, links in prose, error text | **no** — use `--color-text`, or `--color-error` for errors |
| a focus indicator | **no** — the ring is `--color-accent-hot` (4.96:1) |

**[MUST] `--color-error` is error prose only.** Never an accent, a fill or a
rule (`BaseLayout.scss:8–12`).

**[MUST] `--field-border` is the boundary of an interactive form control**
(WCAG 1.4.11, ≥3:1). Decorative grouping hairlines stay at `--rule`
(`BaseLayout.scss:122–131`).

**[MUST] Measured ink on `#CC0000`** — hierarchy on the accent field comes from
SIZE, never from dimming:

| ink | ratio | verdict |
| --- | --- | --- |
| `#F7EFE6` | 5.17:1 | anything, incl. body copy |
| `#F7EFE6` @ 85% | 3.95:1 | control boundaries only (1.4.11) |
| `#F7EFE6` @ 80% | 3.58:1 | fails body copy |
| `#1A0000` | 3.42:1 | large text only — the accent word |
| `#000000` | 3.57:1 | large text only |

**[MUST] No translucent field fills on the red band.** A contrast checker
resolves a placeholder against the band *behind* an `rgba()` fill, so
`NewsletterForm.module.scss:208` uses an opaque `#9A0000`.

## Dark / light

**[MUST] There is one theme, and it is dark.** `<meta name="color-scheme"
content="dark">` (`BaseLayout.astro:190`) and `theme-color` `#050505` declared
identically for both `prefers-color-scheme` branches (`BaseLayout.astro:188–189`)
— the site does not respond to the OS preference. There is no
`prefers-color-scheme` rule anywhere in `src/**/*.scss`.

The only light/dark fork is the favicon: `favicon-light.webp` /
`favicon-dark.webp` (`BaseLayout.astro:223–224`), which serves the browser
chrome, not the page.

Consequence **[MUST]**: never introduce a `prefers-color-scheme` block for a
single component. A light theme is a whole-system decision, not a local one; the
measured red-band ratios above assume the dark ground.

## Typography

Three faces, self-hosted through the Astro Fonts API (`astro.config.mjs:73–97`).

| Token | Face | Weights | Line | Role |
| --- | --- | --- | --- | --- |
| `--font-bebas-neue` | Bebas Neue | 400 | 74–81 | every headline at `--fs-h3` and above: hero, section titles, nav destinations, figures, prices, row titles, footer wordmark |
| `--font-special-elite` | Special Elite | 400 | 90–96 | body, lede and long-form reading copy. Texture, never a headline |
| `--font-jetbrains-mono` | JetBrains Mono | 400, 500 | 82–89 | labels, eyebrows, meta, counts, buttons, status words |

- **[MUST] Only these three families** (`BaseLayout.scss:21`).
- **[MUST] Reference the injected variable, never a literal family name** —
  the resolved family is a build-time hash (`BaseLayout.scss:15–20`). Keep a
  generic fallback: `var(--font-jetbrains-mono), monospace`.
- **[MUST] Go through the recipe, not the raw declaration.** `_type.scss`
  has `mono($size, $track, $case)`, `display($size)`, `row-title($size)`,
  `prose($size, $lh)` and `hairline-link($color)`; a stylesheet that writes
  `font-family: var(--font-…)` by hand is re-implementing one of them.
- **[MUST] Roles do not mix.** Special Elite is wide; Bebas is condensed and
  is what makes the poster scale fit the column.
- **[CURRENT]** Special Elite declares no `subsets` (`astro.config.mjs:96`) —
  see Open points.

**The ramp [MUST].** Every `font-size` goes through one of these steps; add a
step here before using a new value. **[CURRENT]** 18 literals still bypass it
— see Open points.

Poster scale (Bebas), `BaseLayout.scss:81–95`:

| Token | Value | Line | Use |
| --- | --- | --- | --- |
| `--fs-display` | `clamp(3rem, 9.5vw, 9rem)` | 81 | the subpage `<h1>` — **one per page** |
| `--fs-hero` | `clamp(3rem, 9.5vw, 8.5rem)` | 82 | home hero statement |
| `--fs-h2` | `clamp(2.9rem, 8vw, 7rem)` | 83 | section headline |
| `--fs-stat` | `clamp(3.4rem, 10vw, 9.5rem)` | 84 | figure in a facts band |
| `--fs-h3` | `clamp(1.8rem, 3.4vw, 2.6rem)` | 85 | sub-section headline |
| `--fs-card-title` | `1.95rem` | 86 | card / dossier title |
| `--fs-title-compact` | `1.6rem` | 87 | compact record title |
| `--fs-row` | `clamp(2.6rem, 5.2vw, 4.5rem)` | 93 | row title, **short** list (waves, desks) |
| `--fs-row-sm` | `clamp(2.2rem, 4vw, 3.4rem)` | 94 | row title, **long** list (sessions, FAQ, clippings) |
| `--fs-row-figure` | `clamp(2.5rem, 4.2vw, 4rem)` | 95 | the figure opposite a row title |

Text scale, `BaseLayout.scss:100–110`:

| Token | Value | Line | Use |
| --- | --- | --- | --- |
| `--fs-label-xs` | `0.68rem` | 100 | micro mono: avatar counts, kit tags |
| `--fs-label-sm` | `0.74rem` | 101 | mono: counts, chips, inline clears |
| `--fs-label` | `0.78rem` | 102 | mono: eyebrows, section labels |
| `--fs-label-lg` | `0.84rem` | 103 | mono: nav, buttons, email links |
| `--fs-ui` | `0.95rem` | 104 | small UI prose, help text |
| `--fs-body` | `1.05rem` | 105 | long-form reading copy |
| `--fs-body-lg` | `1.15rem` | 106 | footnotes, short ledes |
| `--fs-lede` | `clamp(1.2rem, 1.6vw, 1.5rem)` | 107 | section ledes, status prose |
| `--fs-title-sm` | `1.45rem` | 108 | small titles, mobile record titles |
| `--fs-figure` | `1.9rem` | 109 | row figures — **no call sites today**, see Open points |
| `--fs-monogram` | `3.4rem` | 110 | initials in an empty photo well |

**[MUST]** Display type uses `--lh-display` (`0.84`, line 114) and
`--track-display` (`0.005em`, line 115), never a per-file `line-height`, and
no `text-shadow`.

**[CURRENT]** Mono labels are uppercase at `0.22em`–`0.24em` tracking.

**[MUST] Body text caps at 65–75ch.** Cap the container, don't shrink the
type. `0.06em` letter-spacing is for short uppercase labels only.

## Spacing & layout

| Token | Value | Line | Use |
| --- | --- | --- | --- |
| `--maxw` | `1440px` | 29 | the content column (`.u-container`, `.band-inner`) |
| `--gutter` | `clamp(1.25rem, 5vw, 4.5rem)` | 30 | page gutter; also the negative inset for full-bleed row fields |
| `--section-y-tight` | `clamp(3.75rem, 6vw, 6.5rem)` | 35 | a cut |
| `--section-y` | `clamp(6rem, 10vw, 11rem)` | 36 | the normal beat |
| `--section-y-wide` | `clamp(8.5rem, 15vw, 17rem)` | 37 | a held shot before something that matters |
| `--radius` | `2px` | 40 | **[MUST]** sharp corners — never pill-shaped |
| `--focus-gap-tight` / `--focus-gap` / `--focus-gap-lg` | `2px` / `3px` / `4px` | 117–119 | focus-ring standoff, see Accessibility |

**[MUST] Three section densities, not one** (`BaseLayout.scss:43–45`).

**[MUST] Row rhythm is `--field-step` on the row** (`BaseLayout.scss:913–932`):
`clamp(1.9rem, 2.8vw, 2.5rem)` default, `clamp(2.25rem, 3.6vw, 3.25rem)` for
`--short`. Vertical only.

**[MUST] `.anchor-target` cancels a section's opening air with a negative
`scroll-margin-top` reading `--section-air`** (`BaseLayout.scss:446–447`), the
same variable the padding is built from. `--header-h` is the single source
for the bar height. `src/lib/anchor.ts` keeps a jump landed while islands
grow the page; its click handler must **not** check `event.defaultPrevented`
and the hold must be armed **before** the landing (see the file). `npm run
anchors` measures every landing.

## Breakpoints

**[MUST] Max-width media queries, mobile last.** No named breakpoints; use a
value from the histogram.

**[CURRENT]** Actual media-query histogram over `src/**` (occurrences):

| Query | Count | Where |
| --- | --- | --- |
| `max-width: 600px` | 18 | the main phone breakpoint |
| `max-width: 900px` | 10 | wide layout collapse |
| `max-width: 500px` | 6 | small phone — 2× `500px` + 4× `31.25em` (`Footer.scss:84,169,314,332`) |
| `max-width: 720px` | 4 | mid collapse |
| `max-width: 380px` | 3 | narrowest phone |
| `max-width: 860px` | 4 | header / hero |
| `max-width: 1000px` | 1 | widest collapse |
| `max-width: 960px` | 1 | widest collapse (`60em`, `Footer.scss:75`) |
| `min-width: 700px` … `max-width: 999px` (compound) | 1 | `press/downloads.scss:131` |
| `min-width: 1000px` … `max-width: 1279px` (compound) | 1 | `press/downloads.scss:135` |

**[CURRENT]** 7 `min-width` queries exist (`SpeakersTeaser.module.scss:60`,
`press/downloads.scss:109–139`) — see Open points.

**[MUST] No horizontal-nav breakpoint:** `Menu.astro` is a three-slot bar
with all destinations behind one toggle at every width (`Menu.scss:1–13`).

**[CURRENT]** Two JS-only breakpoints: header auto-hide `760px`
(`Menu.astro:217`), agenda view switch `1024px` (`Agenda.tsx:52`).

## Z-index & layering

**[MUST]** A new fixed/overlay element joins one of these layers.

| z | Element | Source |
| --- | --- | --- |
| `10060` | a sheet stacked on another sheet (speaker opened from a session) | `SpeakerDetail.module.scss:10` (`--sheet-z`) |
| `10050` | detail sheet (default `--sheet-z`) | `Sheet.module.scss:25` |
| `10001` | fixed site header | `Menu.scss:13` |
| `10001` | `.skip-link` | `BaseLayout.scss:339` |
| `10000` | cookie banner | `CookieBanner.scss:21` |
| `10000` | `.status-bar-cover` (iOS safe-area paint) | `BaseLayout.scss:1247` |
| `9999` | film-grain overlay (`body::before`, `pointer-events: none`) | `BaseLayout.scss:295` |
| `9998` | vignette overlay (`body::after`, `pointer-events: none`) | `BaseLayout.scss:314` |
| `20` | `Ticker` running band | `Ticker.scss:7` |
| `10` | subpage hero content over its photograph | `SubpageHero.scss:40` |
| `0`–`4` | in-component ordering only (Agenda columns, Speakers grid, Tickets wave) | local modules |
| `-1` | a row's full-bleed reach field / wash, under the row's own content | `BaseLayout.scss:949`, `1012` |

**[MUST] A sheet is portalled to `document.body`** (`SpeakerDetail.tsx:69–73`)
— any positioned ancestor with a z-index traps it under the header.

**[MUST] A row painting a `z-index: -1` layer needs `isolation: isolate`**
(`BaseLayout.scss:919–921`). A second full-bleed layer uses `::after` —
`--link` / `--holds` own `::before`.

**[MUST] Any full-bleed `::before` on a row is feathered** with
`mask-image: var(--field-feather)` (`BaseLayout.scss:193`). The red reach
field is the one exception.

**[MUST] Decorative overlays are `pointer-events: none`** and sit below the
chrome (grain 9999 / vignette 9998).

## Motion

**[CURRENT] There are no duration or easing tokens** — every value is written at
its call site. The de-facto scale, by frequency:

| Duration | Where |
| --- | --- |
| `0.2s` (dominant, ~96 uses) | the standard control transition: buttons, inputs, links (`BaseLayout.scss:821`, `862`) |
| `0.28s` | the row reach field's colour + opacity fade (`BaseLayout.scss:940`, `950`) |
| `0.3s` | the warm wash opacity, cookie banner (`BaseLayout.scss:1013`, `CookieBanner.scss:22`) |
| `0.32s` | the row pull (`translateX`) and the sheet entry (`BaseLayout.scss:998`, `Sheet.module.scss:33`) |
| `0.6s` | scroll reveal (`BaseLayout.scss:1091`) |
| `1s` / `1.2s` | staged page-entry fades (`Tickets.module.scss:16`; the `LandingNotice.scss` component this cited has since been removed — see Open points) |
| `1.3s` / `1.4s` / `1.6s` infinite | skeleton pulse and shimmer while data loads (`Sessions.module.scss:365`, `Tickets.module.scss:322`; the generic loading spinner's `1.3s` pulse now lives in `DataState.module.scss:55`) |
| `46s` linear infinite | the `Ticker` marquee (`Ticker.scss:48`) |

| Easing | Where |
| --- | --- |
| `ease` | the default for control transitions (~96 uses) |
| `cubic-bezier(0.16, 1, 0.3, 1)` | the house "arrive" curve — sheet entry, row pull, staged fades (14 uses) |
| `cubic-bezier(0.22, 1, 0.36, 1)` | scroll reveal only (`BaseLayout.scss:1091`) |
| `linear` | marquee and shimmer, where any easing would read as a stutter |
| `ease-in-out` | skeleton pulses |

Rules:

- **[MUST] Every animation and transition has a `prefers-reduced-motion:
  reduce` opt-out**, including `scroll-behavior` (`BaseLayout.scss:205–213`),
  row transitions (`1034–1046`), ticker (`Ticker.scss:88`), sheet
  (`Sheet.module.scss:174`).
- **[MUST] Scroll reveal is JS-gated.** `.reveal` hides only under `.js` on
  `<html>` (`BaseLayout.scss:1088`). Never hide content on `opacity: 0`
  without that gate.
- **[MUST] Animate only `opacity` and `transform`.** The reveal rests at
  `transform: none` (`BaseLayout.scss:1088–1096`).
- **[MUST] No `translateX` on the red reach field** (`BaseLayout.scss:934–938`);
  the pull belongs to the warm wash.
- **[CURRENT]** The grain is static, not animated (`BaseLayout.scss:287–289`).

## Component states

**[MUST] Hover paints, focus rings.** Never paint the reach field on `:focus`
— it persists after a sheet closes (`BaseLayout.scss:953–960`).

`.btn-primary` (`BaseLayout.scss:787–838`):

| State | Treatment |
| --- | --- |
| rest | `--color-accent` fill, `--on-accent` ink, 1px accent border, `--radius` |
| hover | fill → `--color-accent-hot`, `translateY(-2px)`, `--glow-red` halation (one of the two places the glow survives) |
| active | `transform: translateY(0)` |
| focus-visible | `2px solid var(--color-accent-hot)` at `--focus-gap` |
| disabled | not styled globally — see the form buttons below |

`.btn-ghost` (`BaseLayout.scss:841–877`): transparent, `--rule-strong` border;
hover/focus brighten to `--color-text`, `gap` `0.6rem → 0.85rem`.

**[MUST] On `.band--accent` both buttons invert** (`BaseLayout.scss:662–686`),
focus-visible to cream (`688–690`).

`.field-row` reach states — **[MUST] chosen by whether the row IS the
control**:

| The row | Rest | Hover | Focus |
| --- | --- | --- | --- |
| **IS** the control (`--link`: sessions, FAQ, clippings, agenda entries — a real `<button>` / `<a>` / `<summary>`) | field at `opacity: 0` | `::before` inset `0 calc(-1 * var(--gutter))`, `--color-accent`, opacity → 1 over `0.28s`; **every** ink goes full cream `#F7EFE6` (`971–977`) | ring `2px solid --color-accent-hot` at `--focus-gap-tight` (4.96:1); if hovered **and** focused the ring inverts to `#F7EFE6` — red on red is not a ring (`981–990`) |
| **CONTAINS** a control (`--holds`: ticket waves, contact/press desks) | wash at `opacity: 0` | feathered `104deg` warm wash → 1, plus `translateX(0.6rem)`; also fires on `:focus-within` (`1023–1031`) | the inner control carries the ring |

**[MUST] Red is spent once per list, not once per row.** Resting row labels
are muted mono `rgba(240,237,230,0.55)`. Exception: the on-sale wave's lit
ground.

**[MUST] An open `<details>` does not hold the red field** — it shows the
warm wash and turned marker.

**[MUST] No opacity-based "inactive" state on content** — status is a word,
not a fade (`BaseLayout.scss:899–902`).

**[CURRENT] Disabled controls** use `opacity: 0.55` + `cursor: not-allowed`
(`NewsletterForm.module.scss:90–93`, `InvoiceForm.module.scss:253–256`);
`/partners` marks a not-yet-live CTA with `aria-disabled="true"` on a `<span>`
(`partners.astro:202`). See Open points.

**Loading / empty / error [CURRENT]:** skeleton (`Tickets.module.scss:310–322`,
`Sessions.module.scss:365`), then content or the shared `DataState.tsx`
`ErrorState`. **[MUST]** Every data-backed page ships a `.fallback-note`
(`BaseLayout.scss:550`) — except `/`, see Open points.

## Forms & errors

Two forms exist: `NewsletterForm` (native POST to SmartEmailing) and
`InvoiceForm` (Firebase callable).

- **[MUST] Control boundary is `--field-border`** at rest (≥3:1;
  `InvoiceForm.module.scss:54`, `NewsletterForm.module.scss:23`). Not `--rule`.
- **[MUST] Focus warms the boundary to `--color-accent-hot`** **and** keyboard
  focus gets the ring at `--focus-gap-tight` (`InvoiceForm.module.scss:67–80`).
  Never `outline: none` on an input.
- **[MUST] Minimum control height `2.75rem`** (`InvoiceForm.module.scss:52`).
- **[MUST] Error text is `--color-error`** on a `data-tone="error"` element
  reserving `min-height: 1.2em` (`InvoiceForm.module.scss:259–269`).
- **[MUST] A submit button is never `disabled` for a missing input.**
  Validation runs on blur and first submit; a failed submit focuses the first
  bad field (`InvoiceForm.tsx`, `validate()`). `aria-disabled` covers only the
  in-flight submit; button states key off `[aria-disabled='true']`.
- **[MUST] Field components live at module scope** (`TextField`,
  `InvoiceForm.tsx:107–112`) — declared in a render body they remount on every
  keystroke.
- **[MUST] Status messages are announced:** `aria-live="polite"` on the message
  region, `role="status"` on success, `aria-describedby` to help text.
- **[CURRENT] Validation is native** (`required` + type/pattern, `.honeypot`).
  No `aria-invalid` in `src` — see Open points.
- **[MUST] On the red band the whole form inverts**
  (`NewsletterForm.module.scss:199–276`): opaque `#9A0000` fill, cream
  boundary at 85%, cream button with dark ink.

## Images & media

- **[MUST] The photograph well is 4:5** (`.print`, `BaseLayout.scss:496–506`;
  `Speakers.module.scss:65`, `SpeakersTeaser.module.scss:96`).
- **[CURRENT] Other ratios in use:** `16 / 9` press clippings
  (`press.scss:95`), `3 / 2` gallery (`index.scss:277`), `1` the session sheet's
  speaker thumb (`SessionDetail.module.scss:103`).
- **[MUST] Portraits crop `object-fit: cover; object-position: center 22%`**
  (`Speakers.module.scss:115–116` etc.); the sheet plate `center 20%`.
- **[MUST] Partner and press logos are `object-fit: contain`** — never cropped
  (`partners.scss:235`, `index.scss:461`, `downloads.scss:202`).
- **[MUST] The partner wall is one grid module, `.logo-grid` / `.logo-cell`**
  (`partners.scss:158,172`), one track size for every tier. The tier is
  carried by heading and section order.
- **[MUST] Logos get equal ink area, not equal width.** `opticalBox()`
  (`partners.astro:53`) → `--logo-w` / `--logo-h` (5:1 wordmark ≈190×38,
  square glyph ≈76×76). `plated` is a per-partner flag, not a tier inversion.
- **[MUST] A missing photograph falls back to initials** at `--ink-monogram` /
  `--ink-monogram-sm` (4.21:1 / 7.71:1, `BaseLayout.scss:178–187`).
- **[MUST] Every `<img>` below the fold is `loading="lazy" decoding="async"`**
  with intrinsic `width`/`height`; above the fold `eager`. Local assets use
  Astro `<Image>` with `layout: 'constrained'`, `responsiveStyles: true`
  (`astro.config.mjs:98–103`).
- **[MUST] Decorative images take `alt=""`** (`press.astro:105`,
  `downloads.astro:63`).
- **[CURRENT]** Imagery is `.webp`; OG card `.jpg` 1200×630. One hero plate,
  `/hero-detective.webp`, reframed per page via `HeroBackground` `focus` —
  **[MUST]** a new subpage picks its own crop.

## Component conventions

- **[MUST] Astro for layout and static UI; React islands only for behaviour**
  (`Countdown`, `NewsletterForm`, `Speakers`, `SpeakersTeaser`, `Sessions`,
  `Agenda`, `Tickets`, `InvoiceForm`).
- **[CURRENT] `client:load` by default;** `Tickets` and `NewsletterForm` use
  `client:visible`. **[MUST] An island that renders nothing until data
  resolves takes `client:load`** — a zero-height placeholder never intersects
  (`SpeakersTeaser`, `index.astro:172–176`).
- **[MUST] Styling location:** islands import a co-located CSS Module; Astro
  components use a sibling `.scss` or global primitives; pages use
  `src/pages/<page>.scss`.
- **[MUST] Global primitives are used by class name, never copied.**
- **[MUST] Anything on more than one page is a component or a primitive.**
- **[MUST] A measured value is decided once, as a token.**

Primitives, all in `BaseLayout.scss`:

| Class | Line | What it is |
| --- | --- | --- |
| `.u-container` | 386 | centred column at `--maxw` with the page gutter |
| `.page-stack` | 511 | every page's `<main>` |
| `.band` (+ `--accent` 617, `--lit` 625, `--lit-red` 634) / `.band-inner` | 602 | a section's ground. `--accent` **at most once per page**; `--lit` is the subpage ground, `--lit-red` the variant for pages about people and the programme |
| `.eyebrow` | 399 | plain mono section label — no decoration, no trailing hairline |
| `.display` (+ `.red`) | 414 | poster headline |
| `.head-split` / `.head-title` / `.head-note` (+ `--ruled` 454) | 446 | two-column section head: statement left, one line right |
| `.head-stack` | 524 | the one-column section head, closed by a hairline |
| `.print` | 496 | the mounted photograph well at 4:5 |
| `.fallback-note` | 550 | the no-JS / endpoint-down prose |
| `.closer` family | 696 | the closing statement (see `Closer.astro`) |
| `.facts` / `.fact` / `.fact-figure` / `.fact-label` | 747 | a figures band |
| `.btn-primary` / `.btn-ghost` | 787 / 841 | the two buttons |
| `.field` / `.field-row` (+ `--short` 930, `--link` 939, `--holds` 997) | 904 / 916 | the open-field list and row |
| `.record-status` | 1054 | the last survivor of the retired `.ledger` / `.record` family |
| `.scene` / `.reveal` / `.develop` | 1069 / 1088 / 1110 | lighting and scroll reveal, `.js`-gated, reduced-motion-disabled |
| `.skip-link` / `.sr-only` | 322 / 367 | see Accessibility |
| `.status-bar-cover` | 1240 | iOS safe-area paint |

Shared components: `Desk.astro` (one inbox), `SubpageHero.astro`,
`HeroBackground.astro` (takes a `focus` crop), `Ticker.astro` (the running band
under every hero), `Closer.astro`, `Menu.astro`, `Footer.astro`,
`CookieBanner.astro`, `NextStep.astro`, `DataState.tsx`, `SpeakerPhoto.tsx`, and
`Sheet.module.scss` (the shared detail-view chrome for `SessionDetail` /
`SpeakerDetail`).

- **`NextStep.astro`** — one thing to do, in an open field; `/thank-you`,
  `/newsletter-subscription-thank-you`, `/404`. Takes `.field-row--holds`.
- **`DataState.tsx`** (`ErrorState` / `EmptyState`) — left-set; **an empty
  state always offers somewhere to go**.
- **`SpeakerPhoto.tsx`** — no URL or a failed load both land on the monogram;
  caller passes classes for the shape.

**Structural rules [MUST]:** no decorated eyebrow; red text is flat; one
`--fs-display` per page; section heads left-set; no accent bars down a block's
left edge; lists carry **no rules**; detail views are full-bleed sheets;
`Closer.astro` ends every page except `/privacy-policy`.

## Anatomy of a page

**[MUST] A subpage is:** `SubpageHero` → `Ticker` → `.band` sections →
`Closer` → `Footer`. `privacy-policy` is the exception; `/` and `/partners`
are out of scope.

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import SubpageHero from '../components/SubpageHero.astro';
import Ticker from '../components/Ticker.astro';
import Closer from '../components/Closer.astro';
import { EVENT_TOPICS } from '../lib/ticker';
---
<BaseLayout title="…" description="…">
	<main class="page-stack">
		<SubpageHero
			titleHtml={'…'}
			lede="…"
			seoHeading="…"
			titleId="…"
			focus="68% 42%"
			<!-- photo={false} instead of focus, for a type-only opener -->
		/>
		<Ticker items={EVENT_TOPICS} size="sm" />
		<section class="band band--lit" aria-label="…">
			<div class="band-inner">
				<header class="head-stack">
					<p class="eyebrow">…</p>
					<h2 class="display head-title">…</h2>
				</header>
				<!-- .field / .field-row list, or a component grid -->
			</div>
		</section>
		<Closer tone="accent" titleHtml={'…'} note="…" actions={[…]} titleId="…" />
	</main>
</BaseLayout>
```

Decision criteria, picked per page:

- **`photo` crop vs `photo={false}`.** Photo (own `focus` crop) for
  `speakers`, `sessions`, `agenda`, `team`, `press`. `photo={false}` where
  content starts right below the fold: `faq`, `contact`, `invoice`,
  `press/downloads`.
- **`.band--lit`.** The one subpage ground. A `--lit-red` variant existed for
  the people / programme pages but was byte-identical; it was folded in.
- **`.band--accent`.** At most once per page, only when the band contains a
  form (`index.astro:271`, `partners.astro:176`). Otherwise close on red with
  `Closer tone="accent"`.
- **`.head-split` vs `.head-stack`.** `.head-split` when there is a secondary
  fact for the right column; otherwise `.head-stack`.
- **`--fs-row` vs `--fs-row-sm`.** **[CURRENT]** no numeric cutoff in code;
  treat more than ~4 rows as the signal for `--fs-row-sm`. See Open points.
- **`/thank-you`, `/newsletter-subscription-thank-you`, `/404`** run
  `SubpageHero photo={false}` → `Ticker` → `.band--lit` field of `NextStep`
  rows → `Closer`. `/thank-you` also has calendar, venue, next steps, share
  and an `@media print` block. Event facts in `src/lib/event.ts` + the `.ics`
  in `public/` — keep in step with the Event JSON-LD in `BaseLayout.astro`.
- **A `<details>` list opens with its first item open** (`faq.astro:106`).
  A section must not reuse the hero's `aria-labelledby` (`landmark-unique`).
- **`Closer` tone.** Pass `tone="accent"` explicitly. The `'raised'` default
  has no CSS (Open points). `privacy-policy` has no `Closer`.

## Iconography

**[MUST] No icon library.** The only inline `<svg>` elements are the
`Footer.astro` social marks, each `aria-hidden="true"` beside a visible text
link. Don't add an icon package for a UI glyph.

**[MUST] Any other glyph is text** — `Close ✕`, `→`. No emoji in UI copy.

## Voice

**[CURRENT]** Inferred from existing copy:

- Mono labels are one to three words, sentence case in source, uppercased by
  CSS. Never type caps — screen readers read them as shouting.
- Ledes run one to two sentences, no italic.
- Copy is English; Czech appears only in quoted press clippings. **[MUST]**
  no third mixed-language block without the same justification.
- Prices via `formatPrice` (`src/lib/tito.ts`); dates via
  `Intl.DateTimeFormat`.

## Accessibility

`npm run a11y` (`scripts/a11y.mjs`) builds with `A11Y_MOCK=1` and runs axe
over 15 routes at desktop and 375×812, plus inside opened `[role="dialog"]`
sheets. Tags: `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`.

**[MUST] Zero violations.** Run it before a PR touching markup or styles.

- **[MUST] Contrast.** Body 1.4.3; boundaries and focus rings ≥3:1 (1.4.11).
  `--field-border` for control boundaries, `--color-error` for error prose.
  Don't dim ink on the red band; change size.
- **[MUST] Focus is always visible:** `:focus-visible { outline: 2px solid
  var(--color-accent-hot) }`. Gap by how much edge the control has:
  `--focus-gap-tight` (own boundary), `--focus-gap` (type on ground),
  `--focus-gap-lg` (alone in space) (`BaseLayout.scss:141–154`). Two commented
  exceptions: agenda cell inset ring, partner logo wider gap.
- **[MUST] Semantics before ARIA.** A row that IS a control is a real
  `<button>` / `<a>` / `<summary>`.
- **[MUST] `.skip-link` is the first focusable element** (`BaseLayout.astro:301`,
  `BaseLayout.scss:322–354`). `html { scroll-padding-top: 6rem;
  scroll-padding-bottom: 8rem }` keeps targets clear of header and banner.
  `#main-content` has `tabindex="-1"` so `Enter` moves focus, not just the
  fragment; its ring alone is suppressed.
- **[MUST] The cookie banner is second in the DOM**, `Escape` handler on
  `document` (`CookieBanner.astro:89,96`).
- **[MUST] The ticker is its own pause control (2.2.2):** `tabindex="0"` +
  `aria-label` (`Ticker.astro:31,33`), paused on `:hover` and `:focus-within`;
  the doubled list is `aria-hidden`. No visible pause button.
- **[MUST] `.sr-only`** for text in the a11y tree but off screen
  (`BaseLayout.scss:367`).
- **[MUST] Sheets return focus** to the opening row (`src/lib/useReturnFocus.ts`)
  and close on Esc.
- **[MUST] Reduced motion** — see Motion.
- **[MUST] `html { overflow-x: clip }`, never `hidden`** — `hidden` makes
  `html` a scroll container on iOS Safari and breaks `position: fixed` and
  safe-area `env()` (`BaseLayout.scss:217–229`).

## Pencil canvas

`design/devfest.pen` is the visual companion to this document, edited through
the `pencil` MCP server (pen.dev). Workflow, loop and guardrails:
`.claude/rules/design-pencil.md`. The canvas was rebuilt from the **deployed
site** (devfest.cz, 1440px, computed styles sampled with Playwright), not from
this prose, so it is the current visual truth at desktop width.

- **[MUST] Canvas variables mirror `:root`.** `$color-accent` is
  `--color-accent`, `$fs-h2` is `--fs-h2`, `$gutter` is `--gutter`. A token
  added to one is added to the other in the same PR, and to the frontmatter
  above.
- **[CURRENT]** Fluid `clamp()` tokens are stored at their 1440px value on
  the canvas (`$fs-display` 144, `$fs-h2` 112, `$gutter` 72, `$section-y`
  176). The home statement is a per-page override (117px, see
  `index.scss:71`) and is written literally on the `Home` frame.
- **[MUST] The `Components` frame is the only place a primitive is drawn.**
  `Header`, `Eyebrow`, `Button/Primary` (+ hover), `Button/Ghost`,
  `Hairline Link`, `Ticker/Item`, `Head/Stack`, `Head/Split`,
  `Field/Row Link` (+ hover), `Ticket/Stub`, `Speaker/Tile`, `Session/Row`,
  `Fact`, `Band/Closer Accent`, `Footer`. A surface instances them; a new
  primitive in code gets a component on the canvas.
- **[MUST] One root frame per surface.** Every route has a frame traced
  from production at 1440px: `Home`, `Sessions`, `Agenda`, `Speakers`,
  `Team`, `Contact`, `FAQ`, `Attending`, `Invoice`, `Partners`, `Press`,
  `Press downloads`, `Thank you`, `Newsletter thank you`, `404`,
  `Privacy policy`, `Invite`. `Surfaces` holds the overlays (menu, cookie
  banner, session sheet, speaker sheet) and `Mobile` the 375px `Home` and
  `Sessions`. Frames sit in a grid: row 1 `Components` + `Home`, rows 2–3
  the routes, row 4 the rest. Exploration frames are deleted once a
  direction is chosen.
- **[MUST] Nothing on the canvas breaks a `[MUST]` here.** The canvas is where
  a rule is tested first, not where it is waived.
- **[CURRENT] Hairlines on the canvas use `$rule` (13%), not `$rule-soft`
  (6%).** Pencil paints the alpha faithfully and a 6% line vanishes in a
  half-scale export; the code keeps `--rule-soft` on section edges.
- **[CURRENT] Renderer notes.** Gradient fills (linear, radial, mesh) and
  layered fills paint, so the hero feather, scene vignette, `--lit` pool
  and the hero's red wash are real gradients on the canvas. Linear
  `rotation` runs position 0 from the right at 90° and from the left at
  270°. Text strokes, CSS masks, `mix-blend-mode` grain and repeating
  hatch patterns do not exist; the film grain is omitted and the agenda
  hatch is a solid `$panel-lit`. A fresh image fill shows white until
  the app reloads the document (quit and reopen Pen); a root frame built
  from many inserts can stay unpainted until it is copied onto itself.
  Export in a call of its own, never in the call that built the frame.
  Images point at the repo's own WebP/PNG files; nothing is copied into
  `design/`. SVG/AVIF logos are wordmark placeholders and runtime data
  (speaker portraits, press clippings) is an example plate.

The YAML frontmatter at the top of this file is the machine-readable layer
(the DESIGN.md spec impeccable and the live panel read). It is derived from
the tables below; the prose stays normative where they disagree, and the
disagreement is a bug to fix in both.

## Open points

Places the code contradicts itself or this document. Each needs a decision.

1. **No motion tokens.** `0.2s ease` at ~96 sites, the arrive curve at 14, and
   no rule for `0.28s` vs `0.3s` vs `0.32s`. Proposal: `--dur-control`,
   `--dur-field`, `--ease-arrive`.
2. **No z-index scale.** Literals across six files; cookie banner and
   `.status-bar-cover` both `10000`, `.skip-link` and header both `10001`.
3. **Disabled state contradicts the no-dimming rule.** Both form buttons use
   `opacity: 0.55`. WCAG exempts disabled controls, but the doc and code
   disagree.
4. **Three ways to say "not available":** disabled `<button>`,
   `aria-disabled` `<span>` (`partners.astro:202`), `.record-status` word.
5. **No `aria-invalid` in `src`.** Errors go through one `aria-live` region.
   Acceptable for two forms, but should be a stated decision.
6. **`--fs-figure` has zero call sites.** `--panel-2` and `--panel-hover` are
   each used in one file.
7. **7 `min-width` queries** (`SpeakersTeaser.module.scss:60`,
   `press/downloads.scss:109–139`) against a max-width convention.
8. **Two JS-only breakpoints:** `760px` (`Menu.astro:217`), `1024px`
   (`Agenda.tsx:52`), in no stylesheet.
9. **Special Elite declares no `subsets`** (`astro.config.mjs:96`); Czech
   diacritics may fall back (cf. `7b96e4df`).
10. **Split with `CLAUDE.md`.** Rules live here; `CLAUDE.md` points here.
    Nothing enforces it.
11. **`Closer` default `tone="raised"` renders `band--raised`, which has no
    CSS.** Harmless today (every call site passes `tone="accent"`).
12. **The font-size ramp is [MUST] but broken at ~23 call sites:** 18 literals
    (`Countdown.module.scss:33,47,72,84`, `Menu.scss:348,471`,
    `Speakers.module.scss:201,277`, `faq.scss:33`, `press.scss:162`,
    `team.scss:121,141`, `index.scss:73,148,598,643,666,756`), 2 relative
    (`Footer.scss:153`, `Ticker.scss:78`), 2 inherited (`Footer.scss:321,325`),
    1 own token (`Ticker.scss:57`). The same claim in `BaseLayout.scss:98` is
    equally untrue. Fold into the ramp or downgrade to [CURRENT].
    **[UNRESOLVED]** two originally cited sites (`LandingNotice.scss`, deleted;
    `index.scss:135`, now a token) no longer back the count.
13. **`/` has no `.fallback-note`** while `agenda`, `sessions`, `speakers` do.
14. **`file:line` citations have drifted.** `BaseLayout.scss` was reworked
    after this document was written: `.btn-primary` is at 557 (cited 787),
    `.eyebrow` at 285 (399), `.u-container` at 277 (386), `.print` at 347
    (496). Token names still resolve; the line numbers need a refresh pass
    (`/impeccable doctor` reports it as truth drift).
