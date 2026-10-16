---
name: DevFest.cz 2026
description: Noir, but loud. One dark theme, one red, poster-scale Bebas headlines, typewriter body, mono labels.
colors:
  bg: "#000000"
  text: "#FFFFFF"
  cream: "#FFFFFF"
  grey: "#8C8C8C"
  accent: "#F11000"
  accent-hot: "#F11000"
  error: "#F11000"
  on-accent: "#000000"
  on-accent-ink: "#FFFFFF"
  on-accent-border: "rgba(0,0,0,0.85)"
  on-accent-field: "#FFFFFF"
  panel: "#0C0C0C"
  panel-2: "#111111"
  panel-hover: "#161616"
  panel-lit: "#0A0A0A"
  panel-lit-2: "#0E0E0E"
  rule: "rgba(255,255,255,0.13)"
  rule-soft: "rgba(255,255,255,0.06)"
  rule-strong: "rgba(255,255,255,0.22)"
  rule-red: "rgba(241,16,0,0.55)"
  field-border: "rgba(255,255,255,0.4)"
  ink-strong: "rgba(255,255,255,0.85)"
  ink: "rgba(255,255,255,0.78)"
  ink-soft: "rgba(255,255,255,0.7)"
  ink-meta: "rgba(255,255,255,0.62)"
  ink-dim: "rgba(255,255,255,0.6)"
  ink-muted: "rgba(255,255,255,0.55)"
  ink-faint: "rgba(255,255,255,0.5)"
  ink-wordmark: "rgba(255,255,255,0.38)"
typography:
  display:
    fontFamily: "var(--font-bebas-neue), sans-serif"
    fontSize: "clamp(3rem, 9.5vw, 9rem)"
    fontWeight: 400
    lineHeight: 0.84
    letterSpacing: "0.005em"
  headline:
    fontFamily: "var(--font-bebas-neue), sans-serif"
    fontSize: "clamp(2.25rem, min(6vw, 9svh), 5.5rem)"
    fontWeight: 400
    lineHeight: 0.84
    letterSpacing: "0.005em"
  wordmark:
    fontFamily: "var(--font-bebas-neue), sans-serif"
    fontSize: "clamp(3rem, calc((100vw - 2 * var(--gutter)) * 0.28), calc(var(--maxw) * 0.28))"
    fontWeight: 400
    lineHeight: 0.82
    letterSpacing: "0.005em"
  title:
    fontFamily: "var(--font-bebas-neue), sans-serif"
    fontSize: "clamp(1.7rem, min(4vw, 6svh), 3.4rem)"
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
  label-xs:
    fontFamily: "var(--font-jetbrains-mono), monospace"
    fontSize: "0.6875rem"
    fontWeight: 400
    letterSpacing: "0.14em"
rounded:
  sharp: "2px"
spacing:
  gutter: "min(clamp(1.5rem, 5vw, 4.5rem), 6.25vw)"
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
    backgroundColor: "{colors.text}"
    textColor: "{colors.bg}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.sharp}"
    padding: "1.25rem min(2rem, 10vw)"
  eyebrow:
    textColor: "{colors.ink-muted}"
    typography: "{typography.label}"
  hairline-link:
    textColor: "{colors.text}"
    typography: "{typography.label-lg}"
    padding: "0.4em 0 0.3em"
  end-line:
    textColor: "{colors.ink-soft}"
    typography: "{typography.lede}"
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
| `src/layouts/BaseLayout.scss` | all tokens (`:root`, lines 2–181), resets, global primitives. Injected `is:global`, so every `.astro` page and `.tsx` island uses the class names directly |
| `src/styles/_type.scss` | the type recipes as mixins — `mono()`, `display()`, `row-title()`, `prose()`, `hairline-link()`. A CSS Module that cannot compose a global class includes the mixin instead |
| `src/styles/_controls.scss` | control recipes — `lit-field()` |
| `src/components/Sheet.module.scss`, `Print.module.scss` | shared chrome composed by more than one island (the detail sheets; the mounted 4:5 print) |
| `astro.config.mjs:72–106` | the three brand faces, self-hosted via the Astro Fonts API |
| `src/components/*.module.scss` | co-located CSS Modules for React islands (`import s from './X.module.scss'`) |
| `src/components/*.astro` + `*.scss` | static components with a sibling stylesheet |
| `src/pages/*.scss` | page-scoped styles, one file per page |

**[MUST] No Tailwind, no CSS-in-JS, no utility framework.** SCSS + CSS custom
properties only. There is no `tailwind.config`, no theme object, and no runtime
style library in `package.json`.

## Color

The palette follows the **DevFest.cz 2026 Brand Manual v1.0**
(`public/press-kit/DevFest.cz_2026_Brand_Manual.pdf`, p. 08–09): three colours,
no more. Noir Black `#000000`, Paper White `#FFFFFF`, Evidence Red `#F11000`.
Greys exist only as white or black at an opacity; the solid neutrals below are
those opacities flattened onto black, never a warm tint.

All tokens are declared in `BaseLayout.scss` `:root`.

| Token | Value | Use |
| --- | --- | --- |
| `--color-bg` | `#000000` | page ground |
| `--color-text` | `#FFFFFF` | ink |
| `--color-cream` | `#FFFFFF` | legacy alias of Paper White (paper cards, chips) |
| `--color-grey` | `#8C8C8C` | muted meta (= 55% white) |
| `--color-accent` | `#F11000` | the accent — CTA fill, red bands, the reach field, red words |
| `--color-accent-hot` | `#F11000` | focus rings, live status; same red, kept as a role |
| `--color-error` | `#F11000` | **form-error text only** (4.8:1 on black) |
| `--on-accent` | `#000000` | ink on the red field, any size |
| `--on-accent-ink` | `#FFFFFF` | large type on red; ink on an inverted (black) control |
| `--on-accent-border` | `rgba(0,0,0,0.85)` | control boundary on the red field |

Surfaces: `--panel` `#0C0C0C`, `--panel-2` `#111111`, `--panel-hover`
`#161616`, `--panel-lit` `#0A0A0A`, `--panel-lit-2` `#0E0E0E`.

Hairlines: `--rule` `rgba(255,255,255,0.13)`, `--rule-soft` `0.06`,
`--rule-strong` `0.22`, `--rule-red` `rgba(241,16,0,0.55)`,
`--field-border` `rgba(255,255,255,0.4)`.

**[MUST] No decorative hairlines.** A line is drawn only where it carries
structure: the agenda's time × room grid, data tables (privacy policy), tile
grids (press kit), a form control's boundary, a link's
underline, a progress spine (the card builder's steps), and the cookie
banner's edge over the page. The partner wall draws no tiles or borders at
all. Never a divider between sections, a rule under a
section head (`.head-split` and `.head-stack` close on space), a line
above the home hero's footing line, a ruled readout
(the invoice total), or an edge down a block's left side. Space separates;
the maintainer asked for the "random lines" to go.

Ink ramp: `--ink-strong` `0.85`, `--ink` `0.78`, `--ink-soft` `0.7`,
`--ink-meta` `0.62`, `--ink-dim` `0.6`, `--ink-muted` `0.55`, `--ink-faint`
`0.5` (all `rgba(255,255,255,…)`), plus `--ink-wordmark` `0.38` (the footer
wordmark only: the quietest ink that clears 3:1 as large text). Named steps
only; a one-off alpha stays a raw literal.

Atmosphere: `--lit`, `--field-feather`, `--print-mount`, `--wash` /
`--wash-strong` (the raking light a reached row / cell takes),
`--ink-monogram` `0.46` and `--ink-monogram-sm` `0.66`. No glow token and no
page vignette token; the plate vignette is `.scene-vignette`'s own gradient.

**[MUST] No glow anywhere.** Hover and live states are flat colour changes:
an inverted fill for buttons, a border or ink change for rows and fields.

**[MUST] Red is evidence, not mood.** Per the manual it marks details (a dot,
1–2 words in a headline, the year, CTA words, stamps) and, as a large area,
only title bars, red bands and primary CTA buttons. No red washes behind
photographs, no red running text, no other accent hue, no red-to-other-hue
gradients.

| Use of `#F11000` | Allowed? |
| --- | --- |
| a fill (CTA background, `.band--accent`, the row reach field) | yes |
| display type, highlighted words, the year | yes |
| a rule / keyline (`--rule-red`) | yes |
| a focus indicator | yes — 4.8:1 on black |
| body copy, lore, paragraphs | **no** — use `--color-text` |

**[MUST] `--color-error` is error prose only.** Never an accent, a fill or a
rule.

**[MUST] `--field-border` is the boundary of an interactive form control**
(WCAG 1.4.11, ≥3:1). Structural hairlines (see above) stay at `--rule`.

**[MUST] Measured ink on `#F11000`** — hierarchy on the accent field comes from
SIZE, never from dimming:

| ink | ratio | verdict |
| --- | --- | --- |
| `#000000` | 4.82:1 | anything, incl. small mono labels and body copy |
| `#000000` @ 85% | ~4.2:1 | control boundaries only (1.4.11) |
| `#FFFFFF` | 4.36:1 | large text only (Bebas headline on a red band) |

So a CTA label on a red button is black; a red band's poster headline stays
white with its one highlighted word in black; an inverted control on red is a
black fill with white ink.

**[MUST] No translucent field fills on the red band.** A contrast checker
resolves a placeholder against the band *behind* an `rgba()` fill, so the
newsletter field on the band is opaque Paper White with black ink.

## Dark / light

**[MUST] There is one theme, and it is dark.** `<meta name="color-scheme"
content="dark">` (`BaseLayout.astro:219`) and `theme-color` `#000000` declared
identically for both `prefers-color-scheme` branches (`BaseLayout.astro:216–218`)
— the site does not respond to the OS preference. There is no
`prefers-color-scheme` rule anywhere in `src/**/*.scss`.

The only light/dark fork is the favicon: `favicon-light.webp` /
`favicon-dark.webp` (`BaseLayout.astro:260–261`), which serves the browser
chrome, not the page.

Consequence **[MUST]**: never introduce a `prefers-color-scheme` block for a
single component. A light theme is a whole-system decision, not a local one; the
measured red-band ratios above assume the dark ground.

## Typography

Three faces, self-hosted through the Astro Fonts API (`astro.config.mjs:72–106`).

| Token | Face | Weights | Line | Role |
| --- | --- | --- | --- | --- |
| `--font-bebas-neue` | Bebas Neue | 400 | 73–80 | every headline at `--fs-h3` and above: hero, section titles, nav destinations, figures, prices, row titles, footer wordmark |
| `--font-special-elite` | Special Elite | 400 | 89–105 | body, lede and long-form reading copy. Texture, never a headline |
| `--font-jetbrains-mono` | JetBrains Mono | 400, 500 | 81–88 | labels, eyebrows, meta, counts, buttons, status words |

- **[MUST] Only these three families** (`BaseLayout.scss:16–18`).
- **[MUST] Reference the injected variable, never a literal family name** —
  the resolved family is a build-time hash (`BaseLayout.scss:16–18`). Keep a
  generic fallback: `var(--font-jetbrains-mono), monospace`.
- **[MUST] Go through the recipe, not the raw declaration.** `_type.scss`
  has `mono($size, $track, $case)`, `display($size)`, `row-title($size)`,
  `prose($size, $lh)` and `hairline-link($color)`; a stylesheet that writes
  `font-family: var(--font-…)` by hand is re-implementing one of them.
- **[MUST] Roles do not mix.** Special Elite is wide; Bebas is condensed and
  is what makes the poster scale fit the column.
- **[MUST] Czech letters Special Elite lacks fall to JetBrains Mono.** Google
  ships Special Elite in Latin only; its Fonts API entry sets
  `fallbacks: ['var(--font-jetbrains-mono)', 'monospace']` with
  `optimizedFallbacks: false` (`astro.config.mjs`), so `--font-special-elite`
  resolves to Special Elite → JetBrains Mono (latin-ext loaded). The default
  metric fallback was Arial at 117%, which printed "Libčice" as "LibČice".
  Never add a `subsets` entry or a fourth face to fix a glyph.
- **[MUST] No synthesised bold or italic.** `body { font-synthesis: none }`.
  Every face ships one weight (JetBrains Mono two) and no italic; emphasis in
  prose is ink — `strong` / `b` step up to `--color-text` — never weight or
  slant. Don't write `font-style: italic`.

**The ramp [MUST].** Every `font-size` goes through one of these steps; add a
step here before using a new value. **[CURRENT]** ~35 call sites still bypass
it — see Open points.

Poster scale (Bebas), `BaseLayout.scss:61–81`:

| Token | Value | Line | Use |
| --- | --- | --- | --- |
| `--fs-display` | `clamp(3rem, 9.5vw, 9rem)` | 61 | the subpage `<h1>` — **one per page** |
| `--fs-wordmark` | `clamp(3rem, calc((100vw - 2 * var(--gutter)) * 0.28), calc(var(--maxw) * 0.28))` | 66 | the footer `DEVFEST.CZ` wordmark, one line at the column's width |
| `--fs-hero` | `clamp(3rem, 9.5vw, 8.5rem)` | 67 | named for the home hero statement, but only `privacy-policy.scss:35` reads it; the statement sets its own height-aware clamp (`index.scss:78`, `307`) |
| `--fs-h2` | `clamp(2.25rem, min(6vw, 9svh), 5.5rem)` | 71 | section headline |
| `--fs-h3` | `clamp(1.8rem, 3.4vw, 2.6rem)` | 72 | sub-section headline; casting-sheet names; every `/partners` tier heading |
| `--fs-card-title` | `1.95rem` | 73 | card / dossier title |
| `--fs-title-compact` | `1.6rem` | 74 | **no caller** |
| `--fs-row` | `clamp(2.1rem, min(5.2vw, 7.5svh), 4.5rem)`; `2.1rem` ≤600px | 79 | row title, **short** list (waves, desks, home credits) |
| `--fs-row-sm` | `clamp(1.7rem, min(4vw, 6svh), 3.4rem)`; `1.7rem` ≤600px | 80 | row title, **long** list (sessions, FAQ, clippings) |
| `--fs-row-figure` | `clamp(2.1rem, min(4.2vw, 6svh), 4rem)`; `2.1rem` ≤600px | 81 | the figure opposite a row title |

**[MUST] hero > h2 > row > row-sm at every viewport.** `--fs-h2` and the row
steps carry an `svh` term so a short desktop screen brings them down with the
home statement (capped at `11svh` there, `index.scss:307`): a width-only term
let a 1280×720 section head tie the hero, and a list row outrank its section
head (`BaseLayout.scss:68–78`).

Text scale, `BaseLayout.scss:85–94`:

| Token | Value | Line | Use |
| --- | --- | --- | --- |
| `--fs-label-xs` | `0.6875rem` (11px) | 85 | micro mono: avatar counts, kit tags, portrait captions |
| `--fs-label-sm` | `0.74rem` | 86 | mono: counts, chips, inline clears, casting-sheet tags |
| `--fs-label` | `0.78rem` | 87 | mono: eyebrows, section labels |
| `--fs-label-lg` | `0.84rem` | 88 | mono: nav, buttons, email links, hairline links |
| `--fs-ui` | `0.95rem` | 89 | small UI prose, help text |
| `--fs-body` | `1.05rem` | 90 | long-form reading copy |
| `--fs-body-lg` | `1.15rem` | 91 | footnotes, short ledes |
| `--fs-lede` | `clamp(1.2rem, 1.6vw, 1.5rem)` | 92 | section ledes, status prose, the `EndLine` |
| `--fs-title-sm` | `1.45rem` | 93 | small titles, mobile record titles |
| `--fs-monogram` | `3.4rem` | 94 | initials in an empty photo well |

**[MUST] Mono labels never set under 11px.** `--fs-label-xs` is the floor;
there is no smaller mono step.

**[MUST]** Display type uses `--lh-display` (`0.84`, line 97) and
`--track-display` (`0.005em`, line 98), never a per-file `line-height`, and
no `text-shadow`. The one exception is the footer wordmark's `line-height:
0.82` (`Footer.scss`).

**[CURRENT]** Mono labels are uppercase at `0.22em`–`0.24em` tracking.

**[MUST] Phones take their own list step and tracking.** At ≤600px the
`:root` phone block (last in `:root`, so it wins over the base steps) sets
the row steps above to their phone values and `--track-scale: 0.72`; the
`mono()` mixin multiplies its tracking by `--track-scale`, so a 0.24em label
sets at ~0.17em on a phone. `--fs-h2`, `--fs-display` and `--fs-hero` keep
their floors: the section head and the page title stay poster scale while
the lists under them come down.

**[MUST] Body text caps at 65–75ch.** Cap the container, don't shrink the
type. `0.06em` letter-spacing is for short uppercase labels only.

**[MUST] Sheet prose sets ragged on a phone.** The session abstract and the
speaker bio are justified with `hyphens: auto` on wider screens; at ≤600px
they go `text-align: left` at `--fs-body`. A ~30-character Special Elite
column opens rivers between three or four words when justified.

## Spacing & layout

| Token | Value | Line | Use |
| --- | --- | --- | --- |
| `--maxw` | `90rem` (1440px) | 22 | the content column (`.u-container`, `.band-inner`) |
| `--gutter` | `min(clamp(1.5rem, 5vw, 4.5rem), 6.25vw)` | 29 | page gutter; also the negative inset for full-bleed row fields |
| `--section-y-tight` | `clamp(3.75rem, 6vw, 6.5rem)` | 32 | a cut |
| `--section-y` | `clamp(6rem, 10vw, 11rem)` | 33 | the normal beat |
| `--section-y-wide` | `clamp(8.5rem, 15vw, 17rem)`; `6.5rem` ≤600px | 34, 179 | a held shot before something that matters |
| `--radius` | `2px` | 57 | **[MUST]** sharp corners — never pill-shaped |
| `--focus-gap-tight` / `--focus-gap` / `--focus-gap-lg` | `2px` / `3px` / `4px` | 136–138 | focus-ring standoff, see Accessibility |

**[MUST] Large screens scale, they do not widen.** Up to 1920px the root is
the browser default. Past it `html` grows the root linearly
(`100% + (100vw - 1920px) / 120`, capped at 200%), so a 2560px viewport (4K at
150%) renders the page at 1.33x and 3840px (4K at 100%) at 2x: the same
composition as 1920px, not a 1440px column adrift in black. It only works
because layout caps and grid minimums are in rem; a new `max-width`,
`minmax()` floor or image cap goes in rem, and a px value is for phone
floors and physical sizes (the 44px tap target, hairlines) only.

**[MUST] Three section densities, not one** (`BaseLayout.scss:31–34`).

**[MUST] Row rhythm is `--field-step` on the row** (`BaseLayout.scss:685–699`):
`clamp(1.9rem, 2.8vw, 2.5rem)` default, `clamp(2.25rem, 3.6vw, 3.25rem)` for
`--short`. Vertical only.

**[MUST] `.anchor-target` cancels a section's opening air with a negative
`scroll-margin-top` reading `--section-air`** (`BaseLayout.scss:434–436`), the
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
| `max-width: 600px` | 24 | the main phone breakpoint |
| `max-width: 900px` | 10 | wide layout collapse |
| `max-width: 860px` | 5 | header / hero |
| `max-width: 720px` | 5 | mid collapse |
| `max-width: 500px` | 4 | small phone — 2× `500px` + 2× `31.25em` (`Footer.scss:53,125`) |
| `max-width: 380px` | 3 | narrowest phone |
| `max-width: 760px` | 2 | the casting sheet and the home credits drop their portrait (`Speakers.module.scss:113`, `SpeakersTeaser.module.scss:141`) |
| `max-width: 1000px` | 1 | widest collapse (`index.scss:542`) |
| `max-width: 1200px` | 1 | `75em`, `Footer.scss:36` |
| `max-width: 960px` | 1 | `60em`, `Footer.scss:44` |
| `max-width: 700px` | 1 | `venue.scss:23` |
| `min-width: 700px` … `max-width: 999px` (compound) | 1 | `press/downloads.scss:51` |
| `min-width: 1000px` … `max-width: 1279px` (compound) | 1 | `press/downloads.scss:55` |

**[CURRENT]** `min-width` queries exist (`press/downloads.scss:29–59`,
`index.scss` `901px` ×5, `Menu.scss:219` `601px`, the `1921px` root scale)
— see Open points.

**[MUST] No horizontal-nav breakpoint:** `Menu.astro` is a three-slot bar
with all destinations behind one toggle at every width (`Menu.scss:1–13`).

**[CURRENT]** Two JS-only breakpoints: header auto-hide `760px`
(`Menu.astro:246`), agenda view switch `1024px` (`Agenda.tsx:50`).

## Z-index & layering

**[MUST]** A new fixed/overlay element joins one of these layers.

| z | Element | Source |
| --- | --- | --- |
| `10060` | a sheet stacked on another sheet (speaker opened from a session) | `SpeakerDetail.module.scss:7` (`--sheet-z`) |
| `10050` | detail sheet (default `--sheet-z`) | `Sheet.module.scss:18` |
| `10001` | fixed site header | `Menu.scss:11` |
| `10001` | `.skip-link` | `BaseLayout.scss:273` |
| `10000` | cookie banner | `CookieBanner.scss:19` |
| `10000` | `.status-bar-cover` (iOS safe-area paint) | `BaseLayout.scss:849` |
| `20` | `Ticker` running band | `Ticker.scss:5` |
| `10` | subpage hero content over its photograph | `SubpageHero.scss:27` |
| `0`–`4` | in-component ordering only (Agenda columns, Tickets wave; inside a scene: plate, `.scene-vignette` 1 (3 in `SubpageHero`), film grain 2) | local modules, `BaseLayout.scss:797–822` |
| `-1` | a row's full-bleed reach field / wash, under the row's own content | `BaseLayout.scss:712`, `755` |

**[MUST] Grain lives on the photograph.** The film grain is
`.scene:has(> .scene-vignette)::before` (`BaseLayout.scss:808`), z `2` inside
the scene, static, `pointer-events: none`: only a scene that carries a plate
(home hero, subpage hero, invite) takes it. No page-level grain or vignette
overlay.

**[MUST] A sheet is portalled to `document.body`** (`Sheet.tsx:88–117`)
— any positioned ancestor with a z-index traps it under the header.

**[MUST] A row painting a `z-index: -1` layer needs `isolation: isolate`**
(`BaseLayout.scss:688–689`). A second full-bleed layer uses `::after` —
`--link` / `--holds` own `::before`.

**[MUST] Any full-bleed `::before` on a row is feathered** with
`mask-image: var(--field-feather)` (`BaseLayout.scss:161`, applied `759–760`). The red reach
field is the one exception.

**[MUST] Decorative overlays are `pointer-events: none`** and stay inside
their scene, under its content.

## Motion

**[CURRENT] There are no duration or easing tokens** — every value is written at
its call site. The de-facto scale, by frequency:

| Duration | Where |
| --- | --- |
| `0.2s` (dominant, ~68 uses) | the standard control transition: buttons, inputs, links (`BaseLayout.scss:615`, `_type.scss:63`) |
| `0.28s` | the row reach field's colour + opacity fade (`BaseLayout.scss:703`, `713`) |
| `0.3s` | the warm wash opacity, cookie banner (`BaseLayout.scss:756`, `CookieBanner.scss:23`) |
| `0.32s` | the row pull (`translateX`) and the sheet entry (`BaseLayout.scss:746`, `Sheet.module.scss:23`) |
| `0.6s` | a B&W photograph developing to colour (`index.scss:371`, `471`: mill plate, gallery; `Print.module.scss:42`: speaker plates) |
| `1.3s` / `1.6s` infinite | loading pulse and skeleton shimmer while data loads (`DataState.module.scss:41`, `55`; `Tickets.module.scss:303`, `325`) |
| `46s` linear infinite | the `Ticker` marquee (`Ticker.scss:44`) |

| Easing | Where |
| --- | --- |
| `ease` | the default for control transitions |
| `cubic-bezier(0.16, 1, 0.3, 1)` | the house "arrive" curve — sheet entry, row pull (8 uses) |
| `cubic-bezier(0.22, 1, 0.36, 1)` | the portrait view transition |
| `linear` | marquee and shimmer, where any easing would read as a stutter |
| `ease-in-out` | loading pulses |

Rules:

- **[MUST] Every animation and transition has a `prefers-reduced-motion:
  reduce` opt-out**, including `scroll-behavior` (`BaseLayout.scss:220–224`),
  row transitions (`774–787`), ticker (`Ticker.scss:75`), sheet
  (`Sheet.module.scss:162`).
- **[MUST] No scroll reveal, no per-section entrance.** Sections are simply
  there. The `.reveal` fade-and-rise on every band was removed: the same
  entrance seventeen times spent the page's motion before anything happened.
  **No page-entry animation either: the hero lands still** (the staged
  `fadeInUp` on the hero and the tickets band is gone). Everything moves only
  to show a change (a sheet opening, a row's field). Anything `.js`-gated
  never hides content without that gate.
- **[MUST] One signature motion: a B&W photograph develops to colour on
  hover** (`filter: grayscale(1) …` → `grayscale(0)` over `0.6s`: the gallery
  strip, the facts mill plate, and the speaker plates on `/speakers` and the
  home credits, which develop via `[data-developed]` on the print while a row
  of their list is hovered or focused (`Print.module.scss:45`); on `/team` the
  colour bleeds from the cursor). With the portrait view transition into a
  sheet, it is the site's only decorative motion.
- **[MUST] Nothing moves on its own except the home hero's topic rotor, the
  home ticker and the countdown.** The topics stay on the home page: the
  rotor (no visible label, the group's `aria-label` names the set;
  hover/focus holds it; hidden on phones where the ticker sits right under
  the hero) sits between the statement and the actions. The agenda's live
  dot is static: the "Live now" word carries the state. The 180s gallery marquee was removed; the gallery is a strip the visitor
  scrolls (`.gallery-strip`, focusable region, `scroll-snap: proximity`,
  fixed photo order — a shuffle made snap jump to the moved photo).
- **[MUST] Animate only `opacity` and `transform`.**
- **[MUST] No `translateX` on the red reach field** (`BaseLayout.scss:701–702`);
  the pull belongs to the warm wash.
- **[CURRENT]** The grain is static, not animated (`BaseLayout.scss:808`).

## Component states

**[MUST] Hover paints, focus rings.** Never paint the reach field on `:focus`
— it persists after a sheet closes (`BaseLayout.scss:716–720`).

`.btn-primary` (`BaseLayout.scss:579–616`):

| State | Treatment |
| --- | --- |
| rest | `--color-accent` fill, `--on-accent` ink at weight 500 and `0.16em` tracking (thin, wide-set black on red read faint), 1px accent border, `--radius` |
| hover | fill and border → `--color-text`, label → `--color-bg`. No lift, no glow, no shadow |
| focus-visible | `2px solid var(--color-accent-hot)` at `--focus-gap` |
| disabled | not styled globally — see the form buttons below |

`.btn-ghost` (`BaseLayout.scss:618–645`): transparent, `--field-border` border;
hover/focus brighten to `--color-text`, `gap` `0.6rem → 0.85rem`.

**[MUST] On `.band--accent` both buttons invert** (`BaseLayout.scss:488–514`),
black fill with white ink, white fill with black ink on hover, flat; focus-visible
to black (`516–518`). The newsletter button follows `.btn-primary`: inverted
fill on hover, no shadow on either ground, nothing glows or moves
(`NewsletterForm.module.scss:73–78`, `194–199`).

**Live state is a red border, nothing more.** The agenda's now line
(`.nowLine`) is a 2px `--color-accent-hot` top border; the session on now
(`.cellLive`) turns its 1px top border `--color-accent`. Neither carries a
shadow (`Agenda.module.scss:504`, `570–572`). The live dot (`.liveDot`,
`561`) is a static 5px red dot, no pulse, no ring.

`.field-row` reach states — **[MUST] chosen by whether the row IS the
control**:

| The row | Rest | Hover | Focus |
| --- | --- | --- | --- |
| **IS** the control (`--link`: sessions, FAQ, clippings, agenda entries — a real `<button>` / `<a>` / `<summary>`) | field at `opacity: 0` | `::before` inset `0 calc(-1 * var(--gutter))`, `--color-accent`, opacity → 1 over `0.28s`; **every** ink goes full black `--on-accent` (`724–730`) | ring `2px solid --color-accent-hot` at `--focus-gap-tight` (4.8:1); if hovered **and** focused the ring inverts to black — red on red is not a ring (`733–742`) |
| **CONTAINS** a control (`--holds`: ticket waves, contact/press desks) | wash at `opacity: 0` | feathered `104deg` warm wash → 1, plus `translateX(0.6rem)`; also fires on `:focus-within` (`764–771`) | the inner control carries the ring |

**[MUST] Red is spent once per list, not once per row.** Resting row labels
are muted mono `rgba(255,255,255,0.55)`. Exception: the on-sale wave's lit
ground.

**[MUST] An open `<details>` does not hold the red field** — it takes a flat
`--panel-lit` ground (no wash, no feather) and the turned marker
(`faq.scss:47–65`, `104–106`).

**[MUST] No opacity-based "inactive" state on content** — status is a word,
not a fade (`BaseLayout.scss:668–673`).

**[CURRENT] Disabled controls:** the newsletter submit (`disabled` until
consent) takes a dedicated `--panel-hover` / 60% white pair, not a fade
(`NewsletterForm.module.scss:80–88`); the invoice submit dims to
`opacity: 0.55` only while in flight (`[aria-disabled='true']`,
`InvoiceForm.module.scss:182–194`); `/partners` marks a not-yet-live CTA with
`aria-disabled="true"` on a `<span>` (`partners.astro:185`). See Open points.

**Loading / empty / error [CURRENT]:** skeleton (`Tickets.module.scss:254–325`)
or the `DataState.tsx` loading pulse, then content or the shared `DataState.tsx`
`ErrorState`. **[MUST]** Every data-backed page ships a `.fallback-note`
(`BaseLayout.scss:418`) — except `/`, see Open points.

## Forms & errors

Two forms exist: `NewsletterForm` (native POST to SmartEmailing) and
`InvoiceForm` (Firebase callable).

- **[MUST] Control boundary is `--field-border`** at rest (≥3:1;
  `lit-field()` `_controls.scss:15`, `NewsletterForm.module.scss:24`). Not `--rule`.
- **[MUST] Focus warms the boundary to `--color-accent-hot`** **and** keyboard
  focus gets the ring at `--focus-gap-tight` (`_controls.scss:22–31`).
  Never `outline: none` on an input.
- **[MUST] Minimum control height `2.75rem`** (`_controls.scss:13`).
- **[MUST] Error text is `--color-error`** on a `data-tone="error"` element
  reserving `min-height: 1.2em` (`InvoiceForm.module.scss:199–207`).
- **[MUST] A submit button is never `disabled` for a missing input.**
  Validation runs on blur and first submit; a failed submit focuses the first
  bad field (`InvoiceForm.tsx`, `validate()`). `aria-disabled` covers only the
  in-flight submit; button states key off `[aria-disabled='true']`.
- **[MUST] Field components live at module scope** (`TextField`,
  `InvoiceForm.tsx:141`) — declared in a render body they remount on every
  keystroke.
- **[MUST] Status messages are announced:** `aria-live="polite"` on the message
  region, `role="status"` on success, `aria-describedby` to help text.
- **[CURRENT] Validation is native** (`required` + type/pattern, `.honeypot`).
  No `aria-invalid` in `src` — see Open points.
- **[MUST] On the red band the whole form inverts**
  (`NewsletterForm.module.scss:158–233`): opaque Paper White fill with black
  ink, black boundary at 85%, black button with white ink.

## Images & media

- **[MUST] The photograph well is 4:5** (`.print`, `BaseLayout.scss:386`;
  `Print.module.scss:24`, the plate the casting sheet and the home credits
  share).
- **[CURRENT] Other ratios in use:** `16 / 9` press clippings on `/contact`
  (`press.scss:65`), `3 / 2` gallery (`index.scss:468`), `1` the session sheet's
  speaker thumb (`SessionDetail.module.scss:82`). The facts mill plate
  fills its grid track (the 60% column, `min-height: clamp(28rem, 52vw,
  47.5rem)`) and goes 4:5 at ≤900px (`index.scss:354–396`).
- **[MUST] Portraits crop `object-fit: cover; object-position: center 22%`**
  (`Print.module.scss:36–37`); the sheet plate `center 20%`
  (`SpeakerDetail.module.scss:39`).
- **[MUST] The DevFest.cz logo is the official file, never a redraw.**
  `src/assets/logo.png` is `public/press-kit/DF26_logo_white_and_red_dot.png`
  (3000×600, clear space built into the artboard, 2026 badge included);
  share cards on a red band use `src/assets/logo-mono-white.png`
  (`DF26_logo_white.png`), the manual's only version on red. Never tint,
  recolour, crop the badge or retype the wordmark (manual p. 03–07).
- **[MUST] Logo minimum: 180px wide for the logo itself** — 188–190px for the
  artboard (header 38px tall, hero 188px floor). The footer carries no logo:
  its `DEVFEST.CZ` is a typeset wordmark (see Component conventions). Where a bar has
  no room, the image shrinks within `max-width: 100%` rather than distorting.
- **[MUST] The standalone symbol is white or dark only** (favicons, app
  icons); never red.
- **[MUST] Partner and press logos are `object-fit: contain`** — never cropped
  (`partners.scss:71`, `index.scss:612`, `downloads.scss:112`).
- **[MUST] The partner wall draws no tiles.** No cell, no border, no lit
  plate: open logos on the page ground, wrapping with generous gaps
  (`partners.scss:36–48`). Rank reads from the logo's size alone: each tier
  has a reference box (`CELLS`, `partners.astro:21`: Platinum 600×300,
  Diamond 312×190, Gold / Silver 246×150, Media / Community 200×110) that
  `opticalBox()` sizes the mark against; no box is drawn. Every tier heading,
  Platinum included, is Bebas at `--fs-h3` (`.wall-title`,
  `partners.scss:31–34`). On a phone (≤600px) Platinum keeps its size
  (clamped to the column); every other tier scales by `--logo-scale: 0.72`
  (`partners.scss:91–95`).
- **[MUST] No cream tiles.** Every mark sits on the page ground. A mark made
  for a light ground is inverted (`.logo--dark-ink`, `invert(1)
  hue-rotate(180deg)`) until a light asset exists — see Open points.
- **[CURRENT] The home partner strip is headless and quiet:** no title, no
  tier names (they live on `/partners`), one row of logos per tier, top tier
  first and largest, Media left out (`index.astro:193–217`). Logos are sized
  by tier through the `$strip-tiers` cap ladder (`index.scss:646–678`:
  height, max width, resting opacity). On a phone Platinum keeps a free row;
  Diamond sets three to a line, Gold, Silver and Community four, in an even
  grid at 60% of the desktop cap. The strip ends on a "See all partners"
  hairline link (`.partners-more`, `index.scss:682–697`).
- **[MUST] Logos get equal ink area, not equal width.** `opticalBox()`
  (`partners.astro:69`) → `--logo-w` / `--logo-h`, as a share of the tier's
  reference box (in a Gold box a 5:1 wordmark ≈190×38, a square glyph ≈75×75).
  `plated` is a per-partner flag, not a tier inversion.
- **[MUST] A missing photograph falls back to initials** at `--ink-monogram` /
  `--ink-monogram-sm` (4.21:1 / 7.71:1, `BaseLayout.scss:149–152`).
- **[MUST] Every `<img>` below the fold is `loading="lazy" decoding="async"`**
  with intrinsic `width`/`height`; above the fold `eager`. Local assets use
  Astro `<Image>` with `layout: 'constrained'`, `responsiveStyles: true`
  (`astro.config.mjs:107–112`).
- **[MUST] Decorative images take `alt=""`** (`contact.astro:76`,
  `press/downloads.astro:52`).
- **[CURRENT]** Imagery is `.webp`; OG card `.jpg` 1200×630; the mill plate
  is `src/assets/venue/uhelny-mlyn-chimney.jpg`. **[MUST]** The detective key
  art, `/hero-detective.webp`, is the home hero and the default subpage plate
  (`HeroBackground.scss:15`); a page about the event may swap in a documentary
  shot from a past edition, graded B&W (`PRODUCT.md`). `SubpageHero` `plate`
  (→ `HeroBackground` `src`) does that: `/speakers` `devfest-2025-03`,
  `/partners` `devfest-2025-01`. A new subpage picks its own crop (`focus`),
  and its own plate where a documentary shot fits.

## Component conventions

- **[MUST] Astro for layout and static UI; React islands only for behaviour**
  (`Countdown`, `NewsletterForm`, `Speakers`, `SpeakersTeaser`, `Sessions`,
  `Agenda`, `Tickets`, `InvoiceForm`).
- **[CURRENT] `client:load` by default;** `NewsletterForm`
  (`index.astro:263`) and the invite page's island use `client:visible`.
  `Tickets` takes `client:load` (`index.astro:182`): the hero's "Get tickets"
  jumps straight to it. **[MUST] An island that renders nothing until data
  resolves takes `client:load`** — a zero-height placeholder never intersects
  (`SpeakersTeaser`, `index.astro:188`).
- **[MUST] Styling location:** islands import a co-located CSS Module; Astro
  components use a sibling `.scss` or global primitives; pages use
  `src/pages/<page>.scss`.
- **[MUST] Global primitives are used by class name, never copied.**
- **[MUST] Anything on more than one page is a component or a primitive.**
- **[MUST] A measured value is decided once, as a token.**

Primitives, all in `BaseLayout.scss`:

| Class | Line | What it is |
| --- | --- | --- |
| `.u-container` | 320 | centred column at `--maxw` with the page gutter |
| `.page-stack` | 398 | every page's `<main>` |
| `.band` (+ `--accent` 454, `--lit` 460) / `.band-inner` | 442 / 471 | a section's ground. `--accent` **at most once per page**; `--lit` is the subpage ground |
| `.eyebrow` | 328 | plain mono section label — no decoration, no trailing hairline |
| `.display` (+ `.red` 347) | 337 | poster headline; `.red` only on the home hero statement (see Structural rules) |
| `.head-split` / `.head-title` / `.head-note` | 353 / 362 / 366 | two-column section head: statement left, one line right |
| `.head-stack` | 405 | the one-column section head, closed by space (no hairline) |
| `.print` | 386 | the mounted photograph well at 4:5 |
| `.fallback-note` | 418 | the no-JS / endpoint-down prose |
| `.anchor-target` | 434 | a jump lands on the section head |
| `.closer` family | 520 | the closing statement (see `Closer.astro`) |
| `.btn-primary` / `.btn-ghost` | 579 / 618 | the two buttons |
| `.hairline-link` | 652 | **the** "see all" / next-step link: white mono `--fs-label-lg` label on a `--rule-red` hairline, lit to `--color-accent-hot` on hover/focus. Never a grey or plain variant. Inline prose links may include the mixin as `hairline-link(var(--color-accent-hot))` without the label voice (`faq.scss:127`, `privacy-policy.scss:110`) |
| `.field` / `.field-row` (+ `--short` 697, `--link` 702, `--holds` 745) | 675 / 685 | the open-field list and row |
| `.record-status` | 790 | the last survivor of the retired `.ledger` / `.record` family |
| `.scene` / `.scene-vignette` | 796 / 797 | a photographed scene: plate, vignette, film grain (`::before`, 808) |
| `.skip-link` / `.sr-only` | 263 / 306 | see Accessibility |
| `.status-bar-cover` | 842 | iOS safe-area paint |

Shared components: `Desk.astro` (one inbox), `SubpageHero.astro` (takes
`focus` and a `plate`), `HeroBackground.astro` (takes a `focus` crop and a
`src` plate, default the detective key art), `Ticker.astro` (the running band
under the home hero — home only; solid `--ink-faint` topics, red `•`
separators, no outlined text), `Closer.astro`, `EndLine.astro`, `Menu.astro`,
`Footer.astro`, `CookieBanner.astro`, `NextStep.astro`, `DataState.tsx`,
`SpeakerPhoto.tsx`, and
`Sheet.module.scss` (the shared detail-view chrome for `SessionDetail` /
`SpeakerDetail`).

- **`EndLine.astro`** — the last line of a page that asks for no decision,
  in place of a `Closer`: one Special Elite `--fs-lede` line in `--ink-soft`
  and one hairline link to the useful next step, on one baseline, wrapping
  under on a phone; `6rem` of air above it, inside the last band's inner
  column (`EndLine.scss`). Ends `/404`, `/team`, `/attending`, `/invoice`,
  `/thank-you`, `/newsletter-subscription-thank-you`, `/press/downloads`,
  `/faq`.
- **`NextStep.astro`** — one thing to do, in an open field; `/thank-you`,
  `/newsletter-subscription-thank-you`, `/404`, and the route steps on
  `/venue`. Takes `.field-row--holds`.
- **`DataState.tsx`** (`ErrorState` / `EmptyState`) — left-set; **an empty
  state always offers somewhere to go**.
- **`SpeakerPhoto.tsx`** — no URL or a failed load both land on the monogram;
  caller passes classes for the shape.
- **Credits** (`SpeakersTeaser`, home) — head "Starring" with a mono
  `--fs-label-sm` count on its baseline; up to 6 rows (`CREDITS_SIZE`), each
  a Bebas `--fs-row` name in `--ink-dim` and a mono `--fs-label-sm` tag in
  `--ink-muted` on the same baseline, space-separated, no rules. The active
  row (hovered, focused, or the first by default) lights to `--color-text` /
  `--ink-soft`. A fixed 360px column holds one 360×450 print plus an
  `--fs-label-xs` caption, `aria-hidden`, swapping instantly with the row.
  The plate develops to colour while a row is hovered or focused
  (`data-developed`, see Motion). Rows link to `/speakers?speaker=<id>`; a
  `.hairline-link`-style "See all N speakers" closes the list. No
  auto-rotation. ≤760px: no portrait, names at `--fs-h3`.
- **Casting sheet** (`Speakers`, `/speakers`) — a numbered `<ol>` beside a
  sticky `26.25rem` (420px) portrait. Row grid `2.5rem minmax(0, max-content)
  minmax(0, 1fr)` (`Speakers.module.scss:29`): mono index `--fs-label-sm`,
  Bebas `--fs-h3` name via `row-title()`, mono `--fs-label-sm` tag on **one
  line, cut with an ellipsis** (the full tagline is in the sheet); the active
  row lights like the credits. Two trailing slots ("Unidentified suspect" /
  "To be revealed"), name at `--ink-faint`, not interactive. The portrait
  (plate, name at `--fs-title-sm`, mono `--fs-label-xs` hint) mirrors the
  active row, `aria-hidden`, develops while a row is hovered or focused, and
  carries the view transition into the sheet. ≤760px: no portrait, grid
  `2.5rem minmax(0, 1fr)` with the tag under the name, names at
  `--fs-card-title`.
- **Speaker sheet** (`SpeakerDetail`) — opens on the name; no "Speaker"
  kicker above it (the session sheet keeps its "Session" kicker).

**Structural rules [MUST]:** no decorated eyebrow; red text is flat; **the
red word and the closing full stop belong to the home hero statement**
(and the invite title). Subpage hero titles carry neither ("The voices on
the stand", "In good company", "Asked and answered", "Getting there"); every
`SubpageHero` title is migrated. Section heads and every `Closer` title
are plain cream, because a red final word on ~30 headlines made none of them
the loud one. On the refreshed pages section heads drop the full stop
("Buy your way in", "Look back", "Starring"); a couplet keeps it ("One day. /
One mill."). One `--fs-display` per page; section heads left-set; no accent
bars down a block's left edge; lists carry **no rules**; detail views are
full-bleed sheets. `Closer.astro` ends a page that asks for a decision:
`/speakers`, `/agenda`, `/workshops`, `/venue`, `/invite/<member>`. A page
that asks for none ends on an `EndLine` (list above); `/contact` ends on its
"Open the press kit" button, `/partners` on its own `.band--accent` CTA, and
`/privacy-policy` and `/code-of-conduct` on their content.

**The footer is the open sitemap [MUST].** The menu hides every destination
behind one toggle at every width, so `Footer.astro` lists every page in two
groups, *Attend* and *About*, with the menu's labels. A new route is added to
both.

**Footer anatomy [MUST]:** columns → a full-width `DEVFEST.CZ` wordmark
(`--fs-wordmark`, `line-height: 0.82`, `--ink-wordmark`, one line,
`aria-hidden`) → the bottom line (`© 2026 GUG.cz, z.s.` left, "Open source ↗"
right). No logo, no rules; space separates the rows (`Footer.scss`).

## Anatomy of a page

**[MUST] A subpage is:** `SubpageHero` → `.band` sections → `Closer` where
the page asks for a decision, otherwise an `EndLine` inside the last band →
`Footer`. No `Ticker`: it runs under the home hero only (it was the same five
topics under every hero, including /404 and /invoice). The first band after
the hero opens on `--section-y-tight` (`.subpage-hero + .band`); neither the
hero nor the band draws a line between them. `privacy-policy` and `code-of-conduct` (same legal
column) are the exception; `/` and `/partners`
are out of scope.

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import SubpageHero from '../components/SubpageHero.astro';
import Closer from '../components/Closer.astro';
import EndLine from '../components/EndLine.astro';
---
<BaseLayout title="…" description="…">
	<main class="page-stack">
		<SubpageHero
			titleHtml={'…'}
			lede="…"
			seoHeading="…"
			titleId="…"
			focus="center 30%"
			<!-- plate="/gallery/<shot>.webp" for a documentary plate -->
			<!-- photo={false} instead of focus, for a type-only opener -->
			<!-- link={{ href: '#talks', label: 'Browse all talks' }} for a way across -->
		/>
		<section class="band band--lit" aria-label="…">
			<div class="band-inner">
				<!-- The hero names the first band, so its head is sr-only. -->
				<h2 class="sr-only">…</h2>
				<!-- .field / .field-row list, or a component grid -->
				<!-- A page that asks for no decision ends here: -->
				<EndLine text="…" href="…" label="…" />
			</div>
		</section>
		<!-- A page that asks for a decision ends on a Closer instead: -->
		<Closer tone="accent" titleHtml={'…'} note="…" actions={[…]} titleId="…" />
	</main>
</BaseLayout>
```

Decision criteria, picked per page:

- **`photo` crop vs `photo={false}`.** Photo (own `focus` crop) for
  `speakers`, `partners`, `agenda`, `team`, and `venue` on the default crop;
  `speakers` and `partners` also take their own documentary `plate`.
  `photo={false}` where content starts right below the fold: `faq`,
  `contact`, `invoice`, `press/downloads`, `workshops`, `attending`,
  `speaker-card`, `404` and the two thank-you pages.
- **`.band--lit`.** The one subpage ground. A `--lit-red` variant existed for
  the people / programme pages but was byte-identical; it was folded in.
- **`.band--accent`.** At most once per page, only when the band contains a
  form (`index.astro:254`, `partners.astro:160`). Otherwise close on red with
  `Closer tone="accent"`.
- **The first band's head.** **[MUST]** When the hero already names what the
  band holds (`speakers`, `agenda`, `contact`, `press/downloads`), the band opens straight on its content with an
  `sr-only` `h2`. A second poster headline under the hero ("Who's talking"
  under "The voices on the stand") says the same thing twice. A visible head
  is for a band the hero does not name: the `NextStep` field on `/404` and the
  thank-you pages, the FAQ groups, a second band further down.
- **A way across** goes in the hero as `SubpageHero link`, a hairline mono
  link with a `→` under the lede, not in a band head: `/agenda` "Browse all
  talks" (`#talks`; `/sessions` now redirects there), `/faq` "Get in touch"
  (`mailto:`).
- **`.head-split` vs `.head-stack`.** `.head-split` when there is a secondary
  fact for the right column; otherwise `.head-stack`.
- **Eyebrows on a `Closer`.** Only when the eyebrow carries a fact the title
  does not (`invite`: "The list closes"). A mood label
  ("Be there", "Join us") above the closing title is filler; leave it off.
- **`--fs-row` vs `--fs-row-sm`.** **[CURRENT]** no numeric cutoff in code;
  treat more than ~4 rows as the signal for `--fs-row-sm`. See Open points.
- **`/thank-you`, `/newsletter-subscription-thank-you`, `/404`** run
  `SubpageHero photo={false}` → `.band--lit` field of `NextStep`
  rows → `EndLine`. `/thank-you` also has calendar, venue, next steps, share
  and an `@media print` block. Event facts in `src/lib/event.ts` + the `.ics`
  in `public/` — keep in step with the Event JSON-LD in `BaseLayout.astro`.
- **The facts band on `/`.** The couplet "One day. / One mill." at `--fs-h2`
  and one Special Elite `--fs-lede` line in `--ink-soft` (max `32ch`), beside
  a documentary plate of the mill bleeding off the right edge. Grid 40/60
  aligned to the container inset: `calc(max(0px, (100% - var(--maxw)) / 2) +
  var(--gutter)) minmax(0, 2fr) minmax(0, 3fr)`, so the text starts on the
  gallery head's x (`index.scss:341–346`). The plate is graded
  `grayscale(1) contrast(1.35) brightness(0.62)`, feathered on its left edge
  by a mask (opaque by 38%), and develops on hover (`354–383`). ≤900px it
  stacks under the text at 4:5 with the feather on its top edge
  (`385–396`). No figures: a stat row was the hero-metric template.
- **The home gallery** opens on a `.head-stack` "Look back", no note.
- **The home hero and the cookie banner.** While the banner is up it publishes
  its height as `--consent-h` on `<html>` (`CookieBanner.astro`); `#hero`
  takes it as its bottom inset, so the bottom-set content rises into the sky
  of the photograph instead of sliding under the banner.
- **The home hero's foot is one typed line** (`index.astro:122–146`): the
  date as a `<time>`, the venue as a maps link, the wave on sale
  (`HeroOffer`: mono wave qualifier, "· until <date>" when it has one, then
  "From <price>" linked to `#tickets`) and "Doors open in" + the compact
  countdown. Values in Bebas at one size (`index.scss:259–268`,
  `HeroOffer.module.scss:32`, `Countdown.module.scss:54`); no Date / Place
  labels, no stat row. The line wraps at the phone measure. The rotor carries
  no "What we cover" label.
- **The home header shows Tickets on a phone.** Above 600px the bar's
  "Get tickets" hides while the home hero is in view; at ≤600px it stays, like
  every subpage (`Menu.scss:214–235`).
- **The ticket and invoice facts sit where the decision is.** Each stub
  prints its price once; another variant's price is one mono data line under
  it ("Company funded 1 452 Kč"). The buttons read "Buy" / "Company pays";
  their accessible names lead with that visible label (WCAG 2.5.3). The
  on-sale stub explains the company variant in one line ("Company pays: same
  ticket, invoiced to your employer."). "VAT included in every price." sits
  once under the list, in the footnote (max `70ch`, `Tickets.module.scss:370`)
  that also offers the invoice (`Tickets.tsx:56–117`, `324–330`). `/invoice`
  names the rate it prices from (no "Estimated"), the 14-day due date
  (`INVOICE_DUE_DAYS`, mirrored in `InvoiceForm.tsx`), that the price holds
  once the invoice is issued, and that one code claims every ticket. Its
  `EndLine` answers invoice questions; it does not send the visitor to card
  checkout.
- **A `<details>` list opens with its first item open** (`faq.astro:91`).
  A section must not reuse the hero's `aria-labelledby` (`landmark-unique`).
- **`Closer` tone.** Pass `tone="accent"` explicitly. The `'raised'` default
  has no CSS (Open points). A `Closer` ends a page that asks for a decision
  (buy, register, come); a reference page ends on an `EndLine` (`/faq`:
  "Still stuck?" and a `mailto:` link) or on its content (`privacy-policy`,
  `code-of-conduct`).
- **`/faq`.** The detective-theme question sits in Essentials
  (`src/content/faq.json`); an open item takes a flat `--panel-lit`
  ground.

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
  `--focus-gap-lg` (alone in space) (`BaseLayout.scss:134–138`). Two commented
  exceptions: agenda cell inset ring, home partner-strip logo wider gap
  (`index.scss:636`).
- **[MUST] Semantics before ARIA.** A row that IS a control is a real
  `<button>` / `<a>` / `<summary>`.
- **[MUST] `.skip-link` is the first focusable element** (`BaseLayout.astro:332`,
  `BaseLayout.scss:263–295`). `html { scroll-padding-top: calc(var(--header-h)
  + 1.5rem); scroll-padding-bottom: 8rem }` keeps targets clear of header and banner.
  `#main-content` has `tabindex="-1"` so `Enter` moves focus, not just the
  fragment; its ring alone is suppressed.
- **[MUST] The cookie banner is second in the DOM**, `Escape` handler on
  `document` (`CookieBanner.astro:89–93`).
- **[MUST] The home ticker is its own pause control (2.2.2):** `tabindex="0"` +
  `aria-label` (`Ticker.astro:31,33`), paused on `:hover` and `:focus-within`;
  the doubled list is `aria-hidden`. No visible pause button.
- **[MUST] `.sr-only`** for text in the a11y tree but off screen
  (`BaseLayout.scss:306`).
- **[MUST] Sheets return focus** to the opening row (`src/lib/useReturnFocus.ts`)
  and close on Esc.
- **[MUST] Reduced motion** — see Motion.
- **[MUST] `html { overflow-x: clip }`, never `hidden`** — `hidden` makes
  `html` a scroll container on iOS Safari and breaks `position: fixed` and
  safe-area `env()` (`BaseLayout.scss:213–217`).

## Open points

Places the code contradicts itself or this document. Each needs a decision.

1. **No motion tokens.** `0.2s` at ~68 sites, the arrive curve at 8, and
   no rule for `0.28s` vs `0.3s` vs `0.32s`. Proposal: `--dur-control`,
   `--dur-field`, `--ease-arrive`.
2. **No z-index scale.** Literals across six files; cookie banner and
   `.status-bar-cover` both `10000`, `.skip-link` and header both `10001`.
3. **The in-flight dim contradicts the no-dimming rule.** The invoice submit
   drops to `opacity: 0.55` while submitting (`InvoiceForm.module.scss:185`).
   The newsletter's disabled state now uses a dedicated colour pair instead.
4. **Three ways to say "not available":** disabled `<button>`,
   `aria-disabled` `<span>` (`partners.astro:185`), `.record-status` word.
5. **No `aria-invalid` in `src`.** Errors go through one `aria-live` region.
   Acceptable for two forms, but should be a stated decision.
6. **`--fs-figure` and `--fs-stat` are gone from `:root`.**
   `--fs-title-compact` has no caller; `--fs-hero` has one, and it is
   `privacy-policy.scss:35`, not the home hero. `--panel-2` and
   `--panel-hover` are each used in one file.
7. **`min-width` queries** (`press/downloads.scss:29–59`, `index.scss`
   `901px` ×5, `Menu.scss:219` `601px`) against a max-width convention.
8. **JS-only breakpoint:** `1024px` (`Agenda.tsx:50`), in no stylesheet.
   The header's `760px` (`Menu.astro:246`) matches the two speaker
   lists' CSS collapse, but the two are not tied together.
9. ~~**Special Elite declares no `subsets`**~~ Resolved: Latin-Ext letters
   fall to JetBrains Mono via the Fonts API `fallbacks` (see Typography).
10. **Split with `CLAUDE.md`.** Rules live here; `CLAUDE.md` points here.
    Nothing enforces it.
11. **`Closer` default `tone="raised"` renders `band--raised`, which has no
    CSS.** Harmless today (every call site passes `tone="accent"`).
12. **The font-size ramp is [MUST] but broken at ~35 call sites:** 29
    literals (`Countdown.module.scss:19,31,54,75,84,95,107`,
    `HeroOffer.module.scss:32,55`, `Menu.scss:369,440,540,549`,
    `AttendingCard.module.scss:57,541`, `team.scss:98,116`,
    `invite/member.scss:74`,
    `index.scss:78,124,261,307,315,709,714,744,792,805,866`), 2 relative
    (`Footer.scss:109`, `Ticker.scss:65`), 3 inherited
    (`Footer.scss:262,266,271`), 1 own token (`Ticker.scss:53`). The hero
    footing value `clamp(1.6rem, 2.4vw, 2.2rem)` is written three times
    (`index.scss:261`, `HeroOffer.module.scss:32`,
    `Countdown.module.scss:54`): a token candidate. The same claim in
    `BaseLayout.scss:84` is equally untrue. Fold into the ramp or downgrade
    to [CURRENT].
13. **`/` has no `.fallback-note`** while `agenda`, `speakers` and
    `workshops` do.
14. **`file:line` citations drift.** This pass re-cited the whole document
    against the uncommitted tree; token and class names stay the durable
    reference (`/impeccable doctor` reports drift as truth drift).
15. ~~**Dead CSS left by the refresh.**~~ Resolved: `.facts` / `.fact*`,
    `--fs-stat`, `.develop` + `print-fade` and `.head-split--ruled` are
    deleted.
16. ~~**Speaker plates no longer develop to colour.**~~ Resolved: the print
    develops via `[data-developed]` while a row of its list is hovered or
    focused; the dead `.frame` states, crop brackets and `.vignette` are
    deleted (`Print.module.scss`).
17. **One section head still carries a full stop:** the final-wave title
    "Last chance to get in." (`Tickets.tsx:232`). Every `SubpageHero` title
    is migrated.
18. ~~**"Closer only where the page asks for a decision" is not applied
    yet.**~~ Resolved: `EndLine` ends the reference pages, `/contact` ends
    on its press-kit button; `Closer` stays on `speakers`, `agenda`,
    `workshops`, `venue`, `invite`.
19. ~~**Glow remnants against "No glow anywhere".**~~ Resolved: the agenda
    live dot is static, the now line and live cell carry no shadow, the
    newsletter button has no shadow on either ground, and an open FAQ item
    is a flat `--panel-lit`.
20. **Dark-ink partner logos are inverted in CSS.** `dotekomanie` and
    `whitewhalemedia` are matched by filename in `DARK_INK`
    (`partners.astro:34`) and get `.logo--dark-ink`. They need light asset
    files, and the flag belongs in `src/content/partners.json` per partner.
21. **`.hairline-link` has no markup caller.** The canonical "see all" /
    next-step link is re-implemented by every caller: `.partners-more`
    (`index.scss:682`), `.end-line-link` (`EndLine.scss:16`, `0.18em`
    tracking) and `.hero-link a` (`SubpageHero.scss:64`) include the mixins;
    the credits' `.allLink` (`SpeakersTeaser.module.scss:113`) hand-writes
    the same look without the mixin. Use the class, or state why a caller
    cannot.
