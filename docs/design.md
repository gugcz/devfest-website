---
name: DevFest.cz 2026
description: Noir, but loud. One dark theme, one red, poster-scale Bebas headlines, typewriter body, mono labels.
colors:
  bg: "#000000"
  text: "#FFFFFF"
  cream: "#FFFFFF"
  grey: "rgba(255,255,255,0.55)"
  accent: "#F11000"
  accent-hot: "#F11000"
  error: "#F11000"
  on-accent: "#000000"
  on-accent-ink: "#FFFFFF"
  on-accent-border: "rgba(0,0,0,0.85)"
  on-accent-field: "#FFFFFF"
  panel: "rgba(255,255,255,0.047)"
  panel-2: "rgba(255,255,255,0.067)"
  panel-hover: "rgba(255,255,255,0.086)"
  panel-lit: "rgba(255,255,255,0.04)"
  panel-lit-2: "rgba(255,255,255,0.055)"
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
typography:
  display:
    fontFamily: "var(--font-bebas-neue), sans-serif"
    fontSize: "clamp(3rem, 9.5vw, 9rem)"
    fontWeight: 400
    lineHeight: 0.9
    letterSpacing: "0"
  headline:
    fontFamily: "var(--font-bebas-neue), sans-serif"
    fontSize: "clamp(2.25rem, min(6vw, 9svh), 5.5rem)"
    fontWeight: 400
    lineHeight: 0.9
    letterSpacing: "0"
  title:
    fontFamily: "var(--font-bebas-neue), sans-serif"
    fontSize: "clamp(1.7rem, min(4vw, 6svh), 3.4rem)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0"
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
    letterSpacing: "0.2em"
  label-lg:
    fontFamily: "var(--font-jetbrains-mono), monospace"
    fontSize: "0.84rem"
    fontWeight: 400
    letterSpacing: "0.2em"
  label-xs:
    fontFamily: "var(--font-jetbrains-mono), monospace"
    fontSize: "0.6875rem"
    fontWeight: 400
    letterSpacing: "0.15em"
  cta:
    fontFamily: "var(--font-jetbrains-mono), monospace"
    fontSize: "1.17rem"
    fontWeight: 700
    letterSpacing: "0.12em"
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
    textColor: "{colors.text}"
    typography: "{typography.cta}"
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
    # --red-toned: radial black gradient over #F11000; this is its brightest point
    backgroundColor: "#C10D00"
    textColor: "{colors.text}"
    padding: "{spacing.section} {spacing.gutter}"
  lit-field:
    backgroundColor: "{colors.panel-lit-2}"
    textColor: "{colors.text}"
    typography: "{typography.body}"
    rounded: "{rounded.sharp}"
    padding: "0.85rem 0.95rem"
    height: "2.75rem"
  speaker-tile:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    typography: "{typography.title}"
  step-list-label:
    textColor: "{colors.ink-muted}"
    typography: "{typography.label}"
  partner-logo:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
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
| `src/layouts/BaseLayout.scss` | all tokens (`:root`, lines 2–193), resets, global primitives. Injected `is:global`, so every `.astro` page and `.tsx` island uses the class names directly |
| `src/styles/_type.scss` | the type recipes as mixins — `mono()`, `cta-label()`, `display()`, `row-title()`, `prose()`, `hairline-link()`. A CSS Module that cannot compose a global class includes the mixin instead |
| `src/styles/_controls.scss` | control recipes — `lit-field()` |
| `src/styles/_logos.scss` | partner-mark recipe — `partner-logo()` (original colours; `.logo--dark` on a paper card) |
| `src/components/Sheet.module.scss`, `Print.module.scss` | shared chrome composed by more than one island (the detail sheets; the mounted 4:5 print) |
| `astro.config.mjs:72–106` | the three brand faces, self-hosted via the Astro Fonts API |
| `src/components/*.module.scss` | co-located CSS Modules for React islands (`import s from './X.module.scss'`) |
| `src/components/*.astro` + `*.scss` | static components with a sibling stylesheet |
| `src/pages/*.scss` | page-scoped styles, one file per page |

**[MUST] No Tailwind, no CSS-in-JS, no utility framework.** SCSS + CSS custom
properties only. There is no `tailwind.config`, no theme object, and no runtime
style library in `package.json`.

## Brand manual v1.0

The rules below trace to the **DevFest.cz 2026 Brand Manual v1.0**
(`public/press-kit/DevFest.cz_2026_Brand_Manual.pdf`). A compliance pass
brought the code in line; where a rule cites a page, it comes from here.

| Page | Rule here |
| --- | --- |
| p. 03–07 | official logo files only; white mono on red; 180px digital minimum, never shrink (change the layout); no recolour, glow or overlay |
| p. 08 | three colours; greys only as white or black at an opacity |
| p. 09 | red marks details; large red only as title bars, red-toned backgrounds, primary CTAs; never running text |
| p. 10 | Bebas uppercase at line-height 0.9–1.0, tracking 0; Special Elite sentence case; JetBrains Mono 400/500/700 at 0.1–0.2em |
| p. 11 | mono buttons, CTA labels white on red; speaker names in Special Elite; one red mark per list |
| p. 13 | photography B&W, high contrast |
| p. 15 | partner logos keep their original colours |

## Color

The palette follows the **DevFest.cz 2026 Brand Manual v1.0**
(`public/press-kit/DevFest.cz_2026_Brand_Manual.pdf`, p. 08–09): three colours,
no more. Noir Black `#000000`, Paper White `#FFFFFF`, Evidence Red `#F11000`.
Greys exist only as white or black at an opacity (manual p. 08): every neutral
token below is an `rgba()` of white, never a tinted grey or a solid near-black
hex (`BaseLayout.scss:3–5`).

All tokens are declared in `BaseLayout.scss` `:root`.

| Token | Value | Use |
| --- | --- | --- |
| `--color-bg` | `#000000` | page ground |
| `--color-text` | `#FFFFFF` | ink |
| `--color-cream` | `#FFFFFF` | legacy alias of Paper White (paper cards, chips) |
| `--color-grey` | `rgba(255,255,255,0.55)` | muted meta |
| `--color-accent` | `#F11000` | the accent — CTA fill, the reach field, flat-red chips, red words |
| `--color-accent-hot` | `#F11000` | focus rings, live status; same red, kept as a role |
| `--color-error` | `#F11000` | **form-error text only** (4.8:1 on black). Errors stay red: a state, not lore |
| `--on-accent` | `#000000`; `#FFFFFF` inside `.band--accent` | ink on flat red, any size (the hovered `.field-row--link`, the agenda `.nowLabel`, the sessions `.avatarMore`); white ink on the red-toned band |
| `--on-accent-ink` | `#FFFFFF`; `#000000` inside `.band--accent` | large type on flat red; the label on an inverted control (black on the band's white fill) |
| `--fs-cta` | `1.17rem` (18.7px) | the CTA label on red, white Bold: just over the 18.66px bold large-text line (`BaseLayout.scss:129–131`) |
| `--on-accent-border` | `rgba(0,0,0,0.85)`; `rgba(255,255,255,0.7)` inside `.band--accent` | control boundary on red |
| `--red-toned` | `radial-gradient(130% 110% at 50% 0%, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.78) 100%), #F11000` | the `.band--accent` ground (manual p. 04, p. 09): Evidence Red darkened by black, never a hue shift; brightest point `#C10D00` at the top centre (`BaseLayout.scss:139`) |

The `:root` values of the `--on-accent-*` trio are for **flat** `#F11000`.
`.band--accent` re-points all three to white ink for its darker ground
(`BaseLayout.scss:471–479`); a flat-red chip outside the band keeps black.

Surfaces, white at an opacity over the black ground (`BaseLayout.scss:117–122`,
`153–155`): `--panel` `0.047`, `--panel-2` `0.067`, `--panel-hover` `0.086`,
`--panel-lit` `0.04`, `--panel-lit-2` `0.055`. Same look on `#000` as the old
solid `#0C0C0C`…`#161616`. **[MUST]** A plate that must be opaque (a fixed bar
over content) layers the token over `--color-bg`: the cookie banner is
`linear-gradient(var(--panel-lit), var(--panel-lit)), var(--color-bg)`
(`CookieBanner.scss:18`). Canvas-drawn plates (speaker / attending card
monograms) fill black first, then the panel (`SpeakerCard.tsx:47–52`,
`AttendingCard.tsx:41–46`), or they export see-through. The footer ground is
`--color-bg` (`Footer.scss:7`).

Hairlines: `--rule` `rgba(255,255,255,0.13)`, `--rule-soft` `0.06`,
`--rule-strong` `0.22`, `--rule-red` `rgba(241,16,0,0.55)`,
`--field-border` `rgba(255,255,255,0.4)`.

**[MUST] No decorative hairlines.** A line is drawn only where it carries
structure: the agenda's time × room grid, data tables (privacy policy), a
form control's boundary (the press kit's format chips included), a link's
underline, a progress spine (the card builder's steps), and the cookie
banner's edge over the page. The partner wall draws no tiles or borders at
all. Never a divider between sections, a rule under a
section head (`.head-split` and `.head-stack` close on space), a line
above the home hero's footing line, a ruled readout
(the invoice total), or an edge down a block's left side. Space separates;
the maintainer asked for the "random lines" to go.

Ink ramp: `--ink-strong` `0.85`, `--ink` `0.78`, `--ink-soft` `0.7`,
`--ink-meta` `0.62`, `--ink-dim` `0.6`, `--ink-muted` `0.55`, `--ink-faint`
`0.5` (all `rgba(255,255,255,…)`). Named steps only; a one-off alpha stays a
raw literal.

Atmosphere: `--lit` (the spotlight pool, `ellipse 78% 50% at 50% 38%`, gone
by 72% so it fades out before the band's top and bottom edges: no seam
against the section above, `BaseLayout.scss:162–166`), `--field-feather`, `--print-mount`, `--wash` /
`--wash-strong` (the raking light a reached row / cell takes; pure white
alphas, `170–171`),
`--ink-monogram` `0.46` and `--ink-monogram-sm` `0.66`. No glow token and no
page vignette token; the plate vignette is `.scene-vignette`'s own gradient.

**[MUST] No glow anywhere.** Hover and live states are flat colour changes:
an inverted fill for buttons, a border or ink change for rows and fields.

**[MUST] Red is evidence, not mood.** Per the manual it marks details (a dot,
1–2 words in a headline, the year, CTA words, stamps) and, as a large area,
only title bars, red-toned backgrounds and primary CTA buttons. A full-width
red band is `--red-toned`, never flat `#F11000`. No red washes behind photographs, no red
running text, no other accent hue, no red-to-other-hue gradients.

**[MUST] One red mark per list.** A list spends red once: the invoice step
numbers are `--ink-muted` (`invoice.scss:39–45`), the ticket grant separator
`--ink-faint` (`Tickets.module.scss:126–130`), so the live wave's state is the
list's one red mark.

| Use of `#F11000` | Allowed? |
| --- | --- |
| a fill (CTA background, the row reach field, a chip) | yes |
| a full-width band | only as `--red-toned` (`.band--accent`) |
| display type, highlighted words, the year | yes |
| a rule / keyline (`--rule-red`) | yes |
| a focus indicator | yes — 4.8:1 on black |
| body copy, lore, paragraphs, inline prose links | **no** — use `--color-text`; a prose link is white on the red hairline |

**[MUST] `--color-error` is error prose only.** Never an accent, a fill or a
rule.

**[MUST] `--field-border` is the boundary of an interactive form control**
(WCAG 1.4.11, ≥3:1). Structural hairlines (see above) stay at `--rule`.

**[MUST] Measured ink on flat `#F11000`** (chips, the reach field) —
hierarchy on red comes from SIZE, never from dimming:

| ink | ratio | verdict |
| --- | --- | --- |
| `#000000` | 4.82:1 | anything, incl. small mono labels and body copy |
| `#000000` @ 85% | ~4.2:1 | control boundaries only (1.4.11) |
| `#FFFFFF` | 4.36:1 | large text only (≥18.66px bold / 24px regular): Bebas headlines, the `cta-label` |

**[MUST] Measured on the red-toned band**, at its brightest point `#C10D00`
(worst case; the darker the ground, the better white reads). Black fails
small text there, so the band's ink is white:

| ink | ratio | verdict |
| --- | --- | --- |
| `#FFFFFF` | 6.33:1 | anything: headline, red words, eyebrow, body, labels, focus ring, a white control edge |
| `#FFFFFF` @ 70% | 3.60:1 | control boundaries only (`--on-accent-border`, 1.4.11) |
| `#000000` | 3.32:1 | a boundary only: the hovered button's black fill edge |
| `#000000` on `#FFFFFF` | 21:1 | the label on a white button, the newsletter field text, the status panel |
| `rgba(0,0,0,0.6)` on `#FFFFFF` | 5.74:1 | the newsletter placeholder |

**[MUST] A label on a red button is white JetBrains Mono Bold at `--fs-cta`.**
Manual p. 11 sets CTA labels white on red; 4.36:1 clears AA only as large
text, so the `cta-label` mixin (`_type.scss:11–14`: `--fs-cta`, `0.12em`,
uppercase, weight 700) is the floor. **Never shrink it** or drop the weight.
Callers: `.btn-primary` (`BaseLayout.scss:607`), the header Tickets
(`Menu.scss:191`), the newsletter button (`NewsletterForm.module.scss:68`);
the cookie buttons take its size and tracking (`CookieBanner.scss:72–73`).
On the red-toned band the poster headline and its highlighted words are
white (no red on red); an inverted control is a white fill with a black Bold
label.

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
| `--font-bebas-neue` | Bebas Neue | 400 | 73–80 | every headline at `--fs-h3` and above: hero, section titles, nav destinations, figures, prices, row titles, speaker-grid names |
| `--font-special-elite` | Special Elite | 400 | 89–105 | body, lede and long-form reading copy. Texture, never a headline |
| `--font-jetbrains-mono` | JetBrains Mono | 400, 500, 700 | 81–88 | labels, eyebrows, meta, counts, buttons, status words; 700 only for `cta-label` |

- **[MUST] Only these three families** (`BaseLayout.scss:16–18`).
- **[MUST] Reference the injected variable, never a literal family name** —
  the resolved family is a build-time hash (`BaseLayout.scss:16–18`). Keep a
  generic fallback: `var(--font-jetbrains-mono), monospace`.
- **[MUST] Go through the recipe, not the raw declaration.** `_type.scss`
  has `mono($size, $track, $case)`, `cta-label`, `display($size)`,
  `row-title($size)`, `prose($size, $lh)` and `hairline-link($color)`; a stylesheet that writes
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
  Every face ships one weight (JetBrains Mono three: 400, 500, and 700 for
  the CTA label) and no italic; emphasis in
  prose is ink — `strong` / `b` step up to `--color-text` — never weight or
  slant. Don't write `font-style: italic`.

**The ramp [MUST].** Every `font-size` goes through one of these steps; add a
step here before using a new value. **[CURRENT]** ~35 call sites still bypass
it — see Open points.

Poster scale (Bebas), `BaseLayout.scss:61–76`:

| Token | Value | Line | Use |
| --- | --- | --- | --- |
| `--fs-display` | `clamp(3rem, 9.5vw, 9rem)` | 61 | the subpage `<h1>` — **one per page** |
| `--fs-hero` | `clamp(3rem, 9.5vw, 8.5rem)` | 62 | **no caller** since the legal pages moved to `SubpageHero`; the home statement sets its own height-aware clamp (`index.scss:86`, `323`) |
| `--fs-h2` | `clamp(2.25rem, min(6vw, 9svh), 5.5rem)` | 66 | section headline; the menu's primary links ≥901px; the speaker grid's "?" |
| `--fs-h3` | `clamp(1.8rem, 3.4vw, 2.6rem)` | 67 | sub-section headline; `NextStep` titles; the menu's secondary links ≥901px; every `/partners` tier heading; legal `h2` |
| `--fs-card-title` | `1.95rem` | 68 | card / dossier title; speaker-grid names ≥760px |
| `--fs-title-compact` | `1.6rem` | 69 | **no caller** |
| `--fs-row` | `clamp(2.1rem, min(5.2vw, 7.5svh), 4.5rem)`; `2.1rem` ≤600px | 74 | row title, **short** list (waves, desks, home credits) |
| `--fs-row-sm` | `clamp(1.7rem, min(4vw, 6svh), 3.4rem)`; `1.7rem` ≤600px | 75 | row title, **long** list (sessions, FAQ, clippings) |
| `--fs-row-figure` | `clamp(2.1rem, min(4.2vw, 6svh), 4rem)`; `2.1rem` ≤600px | 76 | the figure opposite a row title |

**[MUST] hero > h2 > row > row-sm at every viewport.** `--fs-h2` and the row
steps carry an `svh` term so a short desktop screen brings them down with the
home statement (capped at `11svh` there, `index.scss:323`): a width-only term
let a 1280×720 section head tie the hero, and a list row outrank its section
head (`BaseLayout.scss:63–76`).

Text scale, `BaseLayout.scss:80–89`:

| Token | Value | Line | Use |
| --- | --- | --- | --- |
| `--fs-label-xs` | `0.6875rem` (11px) | 80 | micro mono: avatar counts, kit tags, portrait captions |
| `--fs-label-sm` | `0.74rem` | 81 | mono: counts, chips, inline clears, credit tags |
| `--fs-label` | `0.78rem` | 82 | mono: eyebrows, section labels |
| `--fs-label-lg` | `0.84rem` | 83 | mono: nav, buttons, email links, hairline links |
| `--fs-ui` | `0.95rem` | 84 | small UI prose, help text, speaker-grid roles |
| `--fs-body` | `1.05rem` | 85 | long-form reading copy |
| `--fs-body-lg` | `1.15rem` | 86 | footnotes, short ledes |
| `--fs-lede` | `clamp(1.2rem, 1.6vw, 1.5rem)` | 87 | section ledes, status prose, the `EndLine` |
| `--fs-title-sm` | `1.45rem` | 88 | small titles, mobile record titles, agenda run-sheet titles, press-kit variant names, speaker-grid names <760px |
| `--fs-monogram` | `3.4rem` | 89 | initials in an empty photo well |

**[MUST] Mono labels never set under 11px.** `--fs-label-xs` is the floor;
there is no smaller mono step.

**[MUST] Bebas sets at line-height 0.9–1.0, tracking 0, uppercase** (manual
p. 10). Display type uses `--lh-display` (`0.9`, line 93) and
`--track-display` (`0`, line 94), never a per-file `line-height`, and no
`text-shadow`; `row-title()` sets `line-height: 1`, `letter-spacing: 0`
(`_type.scss:50–57`). No Bebas rule carries a `letter-spacing` of its own.

**[MUST] JetBrains Mono tracks at `0.1em`, `0.15em` or `0.2em`** (manual
p. 10: 0.1–0.2em). The CTA label's `0.12em` is the one in-range exception.
Mono labels are uppercase by CSS. Stragglers: see Open points.

**[MUST] Phones take their own list step and tracking.** At ≤600px the
`:root` phone block (last in `:root`, so it wins over the base steps) sets
the row steps above to their phone values and `--track-scale: 0.72`; the
`mono()` mixin multiplies its tracking by `--track-scale` and floors the
result at `0.1em` (`max(0.1em, …)`, `_type.scss:24–26`), so a 0.2em label
sets at 0.144em on a phone and a 0.1em one stays at 0.1em. `--fs-h2` and `--fs-display` keep their floors: the section head and the page title stay poster scale while
the lists under them come down.

**[MUST] Body text caps at 65–75ch.** Cap the container, don't shrink the
type. Mono never tracks under `0.1em`, a sentence-case mono line included.

**[MUST] Speaker-sheet prose sets ragged at every width.** The bio and the
talk line under it are `text-align: left; hyphens: manual`
(`SpeakerDetail.module.scss:101–102`, `131–132`); justified, Special Elite
opened rivers down the whole bio. The session abstract is still justified
with `hyphens: auto` above 600px and ragged at ≤600px
(`SessionDetail.module.scss:44–45`, `135`).

## Spacing & layout

| Token | Value | Line | Use |
| --- | --- | --- | --- |
| `--maxw` | `90rem` (1440px) | 22 | the content column (`.u-container`, `.band-inner`) |
| `--gutter` | `min(clamp(1.5rem, 5vw, 4.5rem), 6.25vw)` | 29 | page gutter; also the negative inset for full-bleed row fields |
| `--section-y-tight` | `clamp(3.75rem, 6vw, 6.5rem)` | 32 | a cut |
| `--section-y` | `clamp(6rem, 10vw, 11rem)` | 33 | the normal beat |
| `--section-y-wide` | `clamp(8.5rem, 15vw, 17rem)`; `6.5rem` ≤600px | 34, 191 | a held shot before something that matters |
| `--radius` | `2px` | 57 | **[MUST]** sharp corners — never pill-shaped |
| `--focus-gap-tight` / `--focus-gap` / `--focus-gap-lg` | `2px` / `3px` / `4px` | 143–145 | focus-ring standoff, see Accessibility |

**[MUST] Large screens scale, they do not widen.** Up to 1920px the root is
the browser default. Past it `html` grows the root linearly
(`100% + (100vw - 1920px) / 120`, capped at 200%), so a 2560px viewport (4K at
150%) renders the page at 1.33x and 3840px (4K at 100%) at 2x: the same
composition as 1920px, not a 1440px column adrift in black. It only works
because layout caps and grid minimums are in rem; a new `max-width`,
`minmax()` floor or image cap goes in rem, and a px value is for phone
floors and physical sizes (the 44px tap target, hairlines) only.

**[MUST] Three section densities, not one** (`BaseLayout.scss:31–34`).

**[MUST] Row rhythm is `--field-step` on the row** (`BaseLayout.scss:704–718`):
`clamp(1.9rem, 2.8vw, 2.5rem)` default, `clamp(2.25rem, 3.6vw, 3.25rem)` for
`--short`. Vertical only.

**[MUST] `.anchor-target` cancels a section's opening air with a negative
`scroll-margin-top` reading `--section-air`** (`BaseLayout.scss:446–448`), the
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
| `max-width: 600px` | 25 | the main phone breakpoint |
| `max-width: 900px` | 10 | wide layout collapse |
| `max-width: 860px` | 5 | header / hero |
| `max-width: 720px` | 5 | mid collapse |
| `max-width: 500px` | 4 | small phone — 2× `500px` + 2× `31.25em` (`Footer.scss:76,148`) |
| `max-width: 380px` | 2 | narrowest phone (`BaseLayout.scss:46` header padding, `Countdown.module.scss:104`) |
| `max-width: 383.98px` | 1 | the header Tickets leaves the bar (`Menu.scss:571`) |
| `max-width: 760px` / `759px` | 2 | the home credits drop their portrait (`SpeakersTeaser.module.scss:152`); the speaker grid's names step down (`Speakers.module.scss:70`) |
| `max-width: 700px` | 2 | `venue.scss:53`, `thank-you.scss:70` |
| `max-width: 1100px` | 1 | the calendar stub folds to two columns (`thank-you.scss:58`) |
| `max-width: 1000px` | 1 | widest collapse (`index.scss:565`) |
| `max-width: 1200px` | 1 | `75em`, `Footer.scss:59` |
| `max-width: 960px` | 1 | `60em`, `Footer.scss:67` |

**[CURRENT]** `min-width` queries exist: `901px` ×6 (`index.scss` ×5, the
menu's two-column overlay `Menu.scss:363`), `601px` ×2 (`Menu.scss:219`,
`invite/member.scss:164`), the speaker grid's `760px` / `1100px`
(`Speakers.module.scss:15`, `20`), the press kit's `640px` / `1100px`
(`press/downloads.scss:26`, `30`), and the `1921px` root scale ×3 — see
Open points.

**[MUST] No horizontal-nav breakpoint:** `Menu.astro` is a three-slot bar
with all destinations behind one toggle at every width (`Menu.scss:1–13`).

**[CURRENT]** Two JS-only breakpoints: header auto-hide `760px`
(`Menu.astro:282`), agenda view switch `1024px` (`Agenda.tsx:58`).

## Z-index & layering

**[MUST]** A new fixed/overlay element joins one of these layers.

| z | Element | Source |
| --- | --- | --- |
| `10060` | a sheet stacked on another sheet (speaker opened from a session) | `SpeakerDetail.module.scss:7` (`--sheet-z`) |
| `10050` | detail sheet (default `--sheet-z`) | `Sheet.module.scss:18` |
| `10001` | fixed site header | `Menu.scss:11` |
| `10001` | `.skip-link` | `BaseLayout.scss:285` |
| `10000` | cookie banner | `CookieBanner.scss:20` |
| `10000` | `.status-bar-cover` (iOS safe-area paint) | `BaseLayout.scss:875` |
| `10` | subpage hero content over its photograph | `SubpageHero.scss:27` |
| `0`–`4` | in-component ordering only (Agenda columns, Tickets wave; the header mark at 2 over the open menu panel at 1, `Menu.scss`; inside a scene: plate, `.scene-vignette` 1 (3 in `SubpageHero`), film grain 2) | local modules, `BaseLayout.scss:822–846` |
| `-1` | a row's full-bleed reach field / wash, under the row's own content | `BaseLayout.scss:731`, `781` |

**[MUST] Grain lives on the photograph.** The film grain is
`.scene:has(> .scene-vignette)::before` (`BaseLayout.scss:834`), z `2` inside
the scene, static, `pointer-events: none`: only a scene that carries a plate
(home hero, subpage hero, invite) takes it. No page-level grain or vignette
overlay.

**[MUST] A sheet is portalled to `document.body`** (`Sheet.tsx:88–117`)
— any positioned ancestor with a z-index traps it under the header.

**[MUST] A row painting a `z-index: -1` layer needs `isolation: isolate`**
(`BaseLayout.scss:707–708`). A second full-bleed layer uses `::after` —
`--link` / `--holds` own `::before`.

**[MUST] Any full-bleed `::before` on a row is feathered** with
`mask-image: var(--field-feather)` (`BaseLayout.scss:173`, applied `785–786`). The red reach
field is the one exception.

**[MUST] Decorative overlays are `pointer-events: none`** and stay inside
their scene, under its content.

## Motion

**[CURRENT] There are no duration or easing tokens** — every value is written at
its call site. The de-facto scale, by frequency:

| Duration | Where |
| --- | --- |
| `0.2s` (dominant, ~68 uses) | the standard control transition: buttons, inputs, links (`BaseLayout.scss:626`, `_type.scss:75`) |
| `0.15s` | the header mark / Tickets hiding under the home hero (`Menu.scss`), a partner mark lighting (`_logos.scss`) |
| `0.28s` | the row reach field's colour + opacity fade (`BaseLayout.scss:722`, `732`) |
| `0.3s` | the wash opacity, cookie banner (`BaseLayout.scss:782`, `CookieBanner.scss:24`) |
| `0.32s` | the row pull (`translateX`) and the sheet entry (`BaseLayout.scss:772`, `Sheet.module.scss:23`) |
| `0.6s` | a B&W photograph developing to colour (`index.scss:394`, `493`: mill plate, gallery; `venue.scss:32`: venue photos; `Print.module.scss:42`: speaker plates) |
| `1.3s` / `1.6s` infinite | loading pulse and skeleton shimmer while data loads (`DataState.module.scss:41`, `55`; `Tickets.module.scss:305`, `327`) |

| Easing | Where |
| --- | --- |
| `ease` | the default for control transitions |
| `cubic-bezier(0.16, 1, 0.3, 1)` | the house "arrive" curve — sheet entry, row pull (8 uses) |
| `cubic-bezier(0.22, 1, 0.36, 1)` | the portrait view transition |
| `linear` | shimmer, where any easing would read as a stutter |
| `ease-in-out` | loading pulses |

Rules:

- **[MUST] Every animation and transition has a `prefers-reduced-motion:
  reduce` opt-out**, including `scroll-behavior` (`BaseLayout.scss:232–236`),
  row transitions (`800–812`), sheet (`Sheet.module.scss:162`).
- **[MUST] No scroll reveal, no per-section entrance.** Sections are simply
  there. The `.reveal` fade-and-rise on every band was removed: the same
  entrance seventeen times spent the page's motion before anything happened.
  **No page-entry animation either: the hero lands still** (the staged
  `fadeInUp` on the hero and the tickets band is gone). Everything moves only
  to show a change (a sheet opening, a row's field). Anything `.js`-gated
  never hides content without that gate.
- **[MUST] One signature motion: a B&W photograph develops to colour on
  hover** (`filter: grayscale(1) …` → `grayscale(0)` over `0.6s`: the gallery
  collage, the facts mill plate, the venue route photos, and the speaker
  prints via `[data-developed]` (`Print.module.scss:45`): on `/speakers` per
  tile while that tile is hovered or focused, on the home credits while a row
  of the list is; on `/team` the colour bleeds from the cursor). With the portrait view transition into a
  sheet, it is the site's only decorative motion.
- **[MUST] Nothing moves on its own except the home hero's topic rotor and
  the countdown.** The ticker band is gone (component deleted). The rotor sits between the statement and
  the actions at every width, phones included, under a mono `--fs-label`
  "On the programme" caption in `--ink-muted` (`index.scss:115–121`,
  `aria-hidden`; the group's `aria-label` repeats it with the set);
  hover/focus holds it. The agenda's live dot is static: the "Live now" word
  carries the state. The gallery is a static collage: nothing scrolls,
  nothing marquees (see Anatomy).
- **[MUST] Animate only `opacity` and `transform`.**
- **[MUST] No `translateX` on the red reach field** (`BaseLayout.scss:720`);
  the pull belongs to the wash.
- **[CURRENT]** The grain is static, not animated (`BaseLayout.scss:834`).

## Component states

**[MUST] Hover paints, focus rings.** Never paint the reach field on `:focus`
— it persists after a sheet closes (`BaseLayout.scss:735–742`). **[MUST]
Hover painting sits under `@media (hover: hover)`**: on touch a tap left the
red field painted (`738`, `746`, `763`).

`.btn-primary` (`BaseLayout.scss:600–635`):

| State | Treatment |
| --- | --- |
| rest | `--color-accent` fill, white `--color-text` label via `cta-label` (Bold 700, `--fs-cta`, `0.12em`; see Color), 1px accent border, `--radius` |
| hover | fill and border → `--color-text`, label → `--color-bg`. No lift, no glow, no shadow |
| focus-visible | `2px solid var(--color-accent-hot)` at `--focus-gap` |
| disabled | not styled globally — see the form buttons below |

`.btn-ghost` (`BaseLayout.scss:637–664`): transparent, `--field-border` border;
hover/focus brighten to `--color-text`, `gap` `0.6rem → 0.85rem`.

**[MUST] On `.band--accent` both buttons invert** (`BaseLayout.scss:499–534`):
`.btn-primary` is a white fill with a black Bold label, black fill with a
white label on hover, flat; `.btn-ghost` takes a white label and a white 70%
edge (`522–534`); focus-visible goes white (`536–539`). The newsletter button
and the header Tickets follow `.btn-primary`: white `cta-label` on red,
inverted fill on hover, no shadow on either ground, nothing glows or moves
(`NewsletterForm.module.scss:62–78`; on the band `237–252`, same inversion
as `.btn-primary`; `Menu.scss:187–217`).

**Live state is a red border, nothing more.** The agenda's now line
(`.nowLine`) is a 2px `--color-accent-hot` top border; the session on now
(`.cellLive`) turns its 1px top border `--color-accent`. Neither carries a
shadow (`Agenda.module.scss:517`, `588–590`). The live dot (`.liveDot`,
`579`) is a static 5px red dot, no pulse, no ring.

`.field-row` reach states — **[MUST] chosen by whether the row IS the
control**:

| The row | Rest | Hover | Focus |
| --- | --- | --- | --- |
| **IS** the control (`--link`: sessions, clippings, agenda entries — a real `<button>` / `<a>`) | field at `opacity: 0` | `::before` inset `0 calc(-1 * var(--gutter))`, `--color-accent`, opacity → 1 over `0.28s`; **every** ink goes full black `--on-accent` (`746–754`) | ring `2px solid --color-accent-hot` at `--focus-gap-tight` (4.8:1); if hovered **and** focused the ring inverts to black — red on red is not a ring (`757–767`) |
| **CONTAINS** a control (`--holds`: ticket waves, contact/press desks, `NextStep` rows) | wash at `opacity: 0` | feathered `104deg` white wash → 1, plus `translateX(0.6rem)`; also fires on `:focus-within` (`789–797`) | the inner control carries the ring |

The FAQ `<summary>` is a plain `.field-row`, not `--link`: a red block under
a toggle stayed lit after a tap. Its reach state is the question and marker
in `--color-accent-hot` under `(hover: hover)`, and keyboard focus draws an
inset ring (`outline-offset: -2px`) plus the same red text
(`faq.scss:90–106`).

**[MUST] Red is spent once per list, not once per row.** Resting row labels
are muted mono `rgba(255,255,255,0.55)`; step numbers and separators are
muted too (see Color). Exception: the on-sale wave's lit ground and state.

**[MUST] An open `<details>` does not hold the red field** — it takes a flat
`--panel-lit` ground (no wash, no feather) inside the question column, not
full-bleed, and the turned marker; question and answer share one side inset
(`--faq-inset`), so the answer is not indented further (`faq.scss:48–67`,
`127–129`, `132–137`).

**[MUST] No opacity-based "inactive" state on content** — status is a word,
not a fade (`BaseLayout.scss:687–692`).

**[CURRENT] Disabled controls:** the newsletter submit (`disabled` until
consent) takes a dedicated `--panel-hover` / 60% white pair, not a fade
(`NewsletterForm.module.scss:80–88`); the invoice submit dims to
`opacity: 0.55` only while in flight (`[aria-disabled='true']`,
`InvoiceForm.module.scss:178–179`); `/partners` marks a not-yet-live CTA with
`aria-disabled="true"` on a `<span>` (`partners.astro:103`). See Open points.

**Loading / empty / error [CURRENT]:** skeleton (`Tickets.module.scss:256–327`)
or the `DataState.tsx` loading pulse, then content or the shared `DataState.tsx`
`ErrorState`. **[MUST]** Every data-backed page ships a `.fallback-note`
(`BaseLayout.scss:430`) — except `/`, see Open points.

## Forms & errors

Two forms exist: `NewsletterForm` (native POST to SmartEmailing) and
`InvoiceForm` (Firebase callable).

- **[MUST] Control boundary is `--field-border`** at rest (≥3:1;
  `lit-field()` `_controls.scss:15`, `NewsletterForm.module.scss:24`). Not `--rule`.
- **[MUST] Focus turns the boundary `--color-accent-hot`** **and** keyboard
  focus gets the ring at `--focus-gap-tight` (`_controls.scss:22–31`).
  Never `outline: none` on an input.
- **[MUST] Minimum control height `2.75rem`** (`_controls.scss:13`).
- **[MUST] Error text is `--color-error`** on a `data-tone="error"` element
  reserving `min-height: 1.2em` (`InvoiceForm.module.scss:193–202`).
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
  (`NewsletterForm.module.scss:198–291`): opaque Paper White field with a
  white edge and black text, placeholder black at 60%, keyboard ring black
  inset at `-4px`; white button with a black label (black on hover); white
  checkbox with a black tick; white consent text; a status or error lands on
  a Paper White panel in black ink (`.message:not(:empty)`, `281–290`),
  never red on red.
- **[MUST] The consent checkbox is drawn, not native**
  (`NewsletterForm.module.scss:104–141`): `appearance: none`, a 1.5rem box
  with a 2px border in the ground's ink (`--box-ink`: white on dark and on the
  red-toned band), filled with that ink and a cut-out tick (`--box-tick`) when checked;
  `--radius` corners, focus ring at `--focus-gap`. The UA box read as
  disabled on both grounds.
- **[MUST] Form and builder pages share one column.** `/invoice`,
  `/workshops`, `/attending`, `/speaker-card` run the standard shell
  (`SubpageHero` → `.band.band--lit` → `.band-inner`); the form or builder
  is capped at `47.5rem` (7 of 12 columns) and sits left on the gutter like
  the hero, never centred (`invoice.scss:3–4`, `Workshops.module.scss:10`,
  `AttendingCard.module.scss:15`). The card builders put their live preview
  beside it on desktop (`7fr` / `5fr`, `AttendingCard.module.scss:3–9`).

## Images & media

- **[MUST] The photograph well is 4:5** (`.print`, `BaseLayout.scss:398`;
  `Print.module.scss:24`, the plate the speaker grid and the home credits
  share).
- **[CURRENT] Other ratios in use:** `16 / 9` press clippings on `/contact`
  (`press.scss:65`) and press-kit previews (`press/downloads.scss:46`), `1`
  the session sheet's speaker thumb (`SessionDetail.module.scss:82`). The
  home gallery frames are `object-fit: cover` cells of their grid, no fixed
  ratio (`index.scss:449–499`). The facts mill plate fills its grid track
  (the 60% column, `min-height: clamp(28rem, 52vw, 47.5rem)`) and goes 4:5
  at ≤900px (`index.scss:368–421`).
- **[MUST] Portraits crop `object-fit: cover; object-position: center 22%`**
  (`Print.module.scss:36–37`); the sheet plate `center 20%`
  (`SpeakerDetail.module.scss:39`).
- **[MUST] The DevFest.cz logo is the official file, never a redraw.**
  `src/assets/logo.png` is `public/press-kit/DF26_logo_white_and_red_dot.png`
  (3000×600, clear space built into the artboard, 2026 badge included);
  share cards on a red band use `src/assets/logo-mono-white.png`
  (`DF26_logo_white.png`), the manual's only version on red. Both mono files
  are pure `#FFFFFF`, alpha as supplied. Never tint, recolour, crop the badge
  or retype the wordmark (manual p. 03–07).
- **[MUST] Nothing dims or covers the logo.** No opacity change on hover or
  focus, header or footer: keyboard focus draws the ring around the link
  (`Menu.scss:103–105`; `Footer.scss:26–37`, its own ring at
  `--focus-gap-lg`). No darkening overlay over it: the invite OG card
  composites the logo layer after the vignette, so it lands at full white
  (`og/invite/[member].jpg.ts:287–302`).
- **[MUST] Logo minimum: 180px wide for the logo itself** (manual, digital) —
  188–190px for the artboard (header 38px tall = 190px, hero 188px floor,
  footer `clamp(188px, 18vw, 12.75rem)`, `Footer.scss:39–44`). Never typeset
  the name as a second wordmark.
- **[MUST] The header logo never shrinks.** `.brand-logo` is `max-width:
  none` (`Menu.scss:122–133`); the brand track floors at `max-content`
  (`grid-template-columns: minmax(max-content, 1fr) …`, `Menu.scss:18`;
  `max-content minmax(0, 1fr)` ≤860px, `529`;
  `.brand` `min-width: max-content`, `90`). The bar gives way instead: ≤600px
  a tighter inset (`min(var(--gutter), 3.2vw)`), `0.5rem` / `0.375rem` gaps
  and a square toggle (`Menu.scss:543–565`); under 384px the header Tickets
  is hidden (`571–575`) and stays the first menu line (`Menu.astro:30`). That
  is the only way to keep the full logo and an AA-sized CTA label in one row
  at 320 / 360px.
- **[MUST] The standalone symbol is white or dark only** (favicons, app
  icons); never red.
- **[MUST] Partner and press logos are `object-fit: contain`** — never cropped
  (`_logos.scss:12`, `press/downloads.scss:55`).
- **[MUST] Partner marks keep their original colours** (brand manual
  p. 15: the one exception to the three-colour rule). Never recolour,
  flatten to white, dim or tint a partner logo. One recipe for the home strip
  and the `/partners` wall: `partner-logo()` in `src/styles/_logos.scss`.
  `LogoMono` in `src/lib/partners.ts` flags masters made for a light ground
  (`dark`: Dotěkománie, White Whale Media), which sit on a paper-white card;
  every other master is shown as supplied.
- **[MUST] The partner wall draws no tiles.** No cell, no border, no lit
  plate, no cream tile: open marks on the page ground. Each tier is a
  regular, left-set grid whose column is the tier's box width
  (`--wall-col` from `tierColumnRem()`, `partners.scss:43–54`), so a short
  last row stands on the full row's columns. Rank reads from the logo's
  size alone: each tier has a reference box (`CELLS`, `partners.ts:100`:
  Platinum 600×300, Diamond 288×176, Gold / Silver 246×150, Media /
  Community 200×110) that `opticalBox()` sizes the mark against; no box is
  drawn. A mark at ratio ≥6 (`WIDE_RATIO`, `partners.ts:122`) takes the full
  box width and two grid cells (`.logo-item--wide`). Every tier heading,
  Platinum included, is Bebas at `--fs-h3` (`.wall-title`,
  `partners.scss:32`). On a phone (≤600px) Platinum keeps its size (clamped
  to the column); every other tier sets two to a row at `--logo-scale: 0.8`,
  a wide mark keeps `1` across both (`partners.scss:92–105`).
- **[CURRENT] The home partner strip is quiet:** one mono `--fs-label`
  "Partners" label in `--ink-muted` (`.partners-label`, an `h2`,
  `index.scss:608–613`), no tier names (they live on `/partners`), one grid
  of marks per tier, top tier first, Media left out (`index.astro:186–213`).
  Each mark is sized against its tier's `/partners` box at 110%
  (`STRIP_SCALE` 1.1, `index.astro:29`); every tier shares one `auto-fill`
  grid of `13.5rem` tracks, so the tiers' columns line up (Community on its
  own `11rem` track); `grid-auto-flow: row dense`; Platinum and wide marks
  span two cells (`index.scss:622–651`). On a phone two columns, Platinum
  and wide marks across the row (`index.scss:678–690`). The strip ends on a
  "See all partners" hairline link (`.partners-more`, `index.scss:694–708`).
- **[MUST] Logos get equal ink area, not equal width.** `opticalBox()`
  (`partners.ts:129`) → `--logo-w` (via `partnerLogo()`, `partners.ts:152`),
  as a share of the tier's reference box (in a Gold box a 5:1 wordmark
  ≈190×38, a square glyph ≈75×75). `plated` is a per-partner flag (a larger
  box for a master with its padding baked in), not a tier inversion.
- **[MUST] A missing photograph falls back to initials** at `--ink-monogram` /
  `--ink-monogram-sm` (4.21:1 / 7.71:1, `BaseLayout.scss:157–160`).
- **[MUST] Photography is B&W at high contrast** (manual p. 13). The gallery
  rests at `grayscale(1) contrast(1.3) brightness(0.78)` (`index.scss:492`);
  avatars and the session sheet's speaker thumb at `contrast(1.3)`
  (`Agenda.module.scss:415`, `Sessions.module.scss:169`, `269`, `288`,
  `SessionDetail.module.scss:100`). **[CURRENT]** The speaker prints, the
  speaker-sheet plate, `/team` and the hero plate still rest at
  `contrast(1.12–1.14)`; the mill and venue plates at `1.35` (see Open
  points).
- **[MUST] Every `<img>` below the fold is `loading="lazy" decoding="async"`**
  with intrinsic `width`/`height`; above the fold `eager`. Local assets use
  Astro `<Image>` with `layout: 'constrained'`, `responsiveStyles: true`
  (`astro.config.mjs:107–112`).
- **[MUST] Decorative images take `alt=""`** (`contact.astro:76`,
  `press/downloads.astro:60`). The home gallery's six frames carry real
  `alt` text: they are the content of "Look back" (`index.astro:33–40`).
- **[CURRENT]** Imagery is `.webp`; OG card `.jpg` 1200×630
  (`public/og-image.jpg`: "30 OCT 2026" with only "2026" red, the official
  white red-dot logo, a white CTA label on red); the mill plate
  is `src/assets/venue/uhelny-mlyn-chimney.jpg`. **[MUST]** The detective key
  art, `/hero-detective.webp`, is the home hero and the default subpage plate
  (`HeroBackground.scss:15`); a page about the event may swap in a documentary
  shot from a past edition, graded B&W (`docs/product.md`). `SubpageHero` `plate`
  (→ `HeroBackground` `src`) does that: `/speakers` `devfest-2025-03`,
  `/partners` `devfest-2025-01`. A new subpage picks its own crop (`focus`),
  and its own plate where a documentary shot fits.

## Component conventions

- **[MUST] Astro for layout and static UI; React islands only for behaviour**
  (`Countdown`, `NewsletterForm`, `Speakers`, `SpeakersTeaser`, `Sessions`,
  `Agenda`, `Tickets`, `InvoiceForm`).
- **[CURRENT] `client:load` by default;** `NewsletterForm`
  (`index.astro:255`) and the invite page's island use `client:visible`.
  `Tickets` takes `client:load` (`index.astro:175`): the hero's "Get tickets"
  jumps straight to it. **[MUST] An island that renders nothing until data
  resolves takes `client:load`** — a zero-height placeholder never intersects
  (`SpeakersTeaser`, `index.astro:181`).
- **[MUST] Styling location:** islands import a co-located CSS Module; Astro
  components use a sibling `.scss` or global primitives; pages use
  `src/pages/<page>.scss`.
- **[MUST] Global primitives are used by class name, never copied.**
- **[MUST] Anything on more than one page is a component or a primitive.**
- **[MUST] A measured value is decided once, as a token.**

Primitives, all in `BaseLayout.scss`:

| Class | Line | What it is |
| --- | --- | --- |
| `.u-container` | 332 | centred column at `--maxw` with the page gutter |
| `.page-stack` | 410 | every page's `<main>` |
| `.band` (+ `--accent` 471, `--lit` 482) / `.band-inner` | 454 / 491 | a section's ground. `--accent` **at most once per page**; `--lit` is the subpage ground |
| `.eyebrow` | 340 | plain mono section label — no decoration, no trailing hairline; also the head of a `NextStepList` |
| `.display` (+ `.red` 359) | 349 | poster headline; `.red` only on the home hero statement (see Structural rules) |
| `.head-split` / `.head-title` / `.head-note` | 365 / 374 / 378 | two-column section head: statement left, one line right |
| `.head-stack` | 417 | the one-column section head, closed by space (no hairline) |
| `.print` | 398 | the mounted photograph well at 4:5 |
| `.fallback-note` | 430 | the no-JS / endpoint-down prose |
| `.anchor-target` | 446 | a jump lands on the section head |
| `.closer` family | 541 | the closing statement (see `Closer.astro`) |
| `.btn-primary` / `.btn-ghost` | 600 / 637 | the two buttons |
| `.hairline-link` | 671 | **the** "see all" / next-step link: white mono `--fs-label-lg` label on a `--rule-red` hairline, lit to `--color-accent-hot` on hover/focus. Never a grey or plain variant. **[MUST]** Inline prose links include the default mixin (white text, red hairline) without the label voice, never a red-text variant: red is not running text (`faq.scss:147–150`, `privacy-policy.scss:43–46`) |
| `.field` / `.field-row` (+ `--short` 716, `--link` 721, `--holds` 771) | 694 / 704 | the open-field list and row |
| `.record-status` | 816 | the last survivor of the retired `.ledger` / `.record` family |
| `.scene` / `.scene-vignette` | 822 / 823 | a photographed scene: plate, vignette, film grain (`::before`, 834) |
| `.skip-link` / `.sr-only` | 275 / 318 | see Accessibility |
| `.status-bar-cover` | 868 | iOS safe-area paint |

Shared components: `Desk.astro` (one inbox), `SubpageHero.astro` (takes
`focus` and a `plate`), `HeroBackground.astro` (takes a `focus` crop and a
`src` plate, default the detective key art; opt-in `tightMask` and
`fadeBottom`), `Closer.astro` (takes an extra
`class`), `EndLine.astro`, `Menu.astro`, `Footer.astro`, `CookieBanner.astro`,
`NextStep.astro`, `NextStepList.astro`, `DataState.tsx`, `SpeakerPhoto.tsx`,
and
`Sheet.module.scss` (the shared detail-view chrome for `SessionDetail` /
`SpeakerDetail`).

- **`EndLine.astro`** — the last line of a page that asks for no decision,
  in place of a `Closer`: one Special Elite `--fs-lede` line in `--ink-soft`
  and one hairline link to the useful next step, on one baseline, wrapping
  under on a phone; `6rem` of air above it, inside the last band's inner
  column (`EndLine.scss`). Ends `/team`, `/attending`, `/invoice`,
  `/thank-you`, `/newsletter-subscription-thank-you`, `/press/downloads`,
  `/faq`.
- **`NextStepList.astro`** — the list and its head: a mono `.eyebrow` `h2`
  (`label`, `labelId` for the section's `aria-labelledby`), then a `.field`
  `<ul>`, or `<ol>` when `ordered` (a real sequence). Never a poster head:
  the row titles under it are the larger type. `/404` "Try one of these",
  `/thank-you` "Before you go", `/newsletter-subscription-thank-you` "While
  you wait", `/venue` "The route" (ordered).
- **`NextStep.astro`** — one thing to do, a `.field-row--holds` row inside a
  `NextStepList`. Grid `0.8fr` / `1.2fr`, stacked ≤900px
  (`NextStep.scss:7–12`, `59–63`): left an optional mono `--fs-label-lg`
  index in `--ink-faint` (`index`, `01`, visual only — the `<ol>` carries
  the order) over a Bebas `--fs-h3` title; right the Special Elite note
  (`--fs-body`, `--ink`, max `52ch`) with its actions **under** it,
  left-set, ghost by default. The default slot takes media for the step
  (the venue photos).
- **`DataState.tsx`** (`ErrorState` / `EmptyState`) — left-set; **an empty
  state always offers somewhere to go**.
- **`SpeakerPhoto.tsx`** — no URL or a failed load both land on the monogram;
  caller passes classes for the shape.
- **Credits** (`SpeakersTeaser`, home) — head "Starring" with a mono
  `--fs-label-sm` count on its baseline; up to 6 rows (`CREDITS_SIZE`), each
  a Bebas `--fs-row` name in `--ink-dim` and a mono `--fs-label-sm` tag in
  `--ink-muted` on the same baseline, space-separated, no rules. The tag is
  `cleanTagline()` (`src/lib/speakers.ts`: pictographs and hashtag-only
  fragments dropped, `|` separators joined by ", ") on **one line, cut with
  an ellipsis** (`flex: 1 1 12rem`, dropping under the name when 12rem does
  not fit). The active row (hovered, focused, or the first by default)
  lights to `--color-text` / `--ink-soft`. A fixed 360px column holds one 360×450 print plus an
  `--fs-label-xs` caption, `aria-hidden`, swapping instantly with the row.
  The plate develops to colour while a row is hovered or focused
  (`data-developed`, see Motion). Rows link to `/speakers?speaker=<id>`; a
  `.hairline-link`-style "See all N speakers" closes the list. No
  auto-rotation. ≤760px: no portrait, names at `--fs-h3`. The teaser opens on
  `--section-y` and closes on no padding of its own; the partner strip opens
  on its own `--section-y-tight` cut (`SpeakersTeaser.module.scss:9–11`,
  `index.scss:586–590`).
- **Speaker grid** (`Speakers`, `/speakers`, `Speakers.module.scss`) — one
  tile per speaker: its own 4:5 print, the name, one role line. 4 columns
  ≥1100px, 3 ≥760px, 2 below; column gaps `2rem` / `1.5rem` / `1rem`, row
  gaps `3.5rem` / `3rem` / `2.5rem` (`Speakers.module.scss:6–23`). Name:
  Bebas `--fs-card-title` via `row-title()` in `--color-text`
  (`--fs-title-sm` <760px), under the print on space alone. Role:
  `cleanTagline()`, Special Elite `--fs-ui` in `--ink-soft`, clamped at two
  lines (the full tagline is in the sheet). The tile is a `<button>`; its
  print develops via `[data-developed]` while that tile is hovered or
  focused, and carries the view transition into the sheet. No placeholder
  tile for names still to come (removed in #465). No list, no index, no sticky
  portrait.
- **Speaker sheet** (`SpeakerDetail`) — opens on the name; no "Speaker"
  kicker above it (the session sheet keeps its "Session" kicker). Bio and
  talk line ragged, no hyphens (see Typography). Links are named mono
  `--fs-label-lg` text in `--ink-dim` on a `--rule-strong` underline, lit to
  `--color-accent-hot`: the network's name for a known kind ("LinkedIn",
  "GitHub"), the bare domain for a website; no icons. The accessible name
  says who, what, the host and "opens in a new tab"
  (`SpeakerDetail.tsx:9–31`, `SpeakerDetail.module.scss:56–89`).
- **Sessions** (`Sessions`, "Every talk") — an unscheduled talk shows
  "Time TBA" (plus the room if it has one) where the time goes
  (`Sessions.tsx:25`). Speaker names under a row are lore, not metadata:
  Special Elite via `prose(--fs-label-lg)`, `--ink-soft`, sentence case
  (manual p. 11; `.names`, `Sessions.module.scss:312–315`). Card avatars put the initials **under** each photo,
  so a lazy or failed photo still reads as a name (`CardAvatars`,
  `Sessions.tsx:35`).
- **Agenda** (`Agenda`) — breaks and dead time are flat `--panel-lit`
  strips, no hatching, ruled on the top edge only (`Agenda.module.scss:62–65`),
  compressed to 2–3 rows (`NON_TALK_ROWS`, `Agenda.tsx:40`). A speakerless
  "TBA"/"TBD" slot renders as "Slot open": its time and a mono `--fs-ui`
  label on `--panel` inside a dashed `--rule-strong` outline, not a control
  (`.slotOpen`, `Agenda.module.scss:301–319`). A cell's speaker names set
  like the Sessions list: Special Elite `--fs-label-lg`, `--ink-soft`,
  sentence case (`.cellSpeakers`, `Agenda.module.scss:286–290`). A speakerless service
  session running ≥180 minutes (the lounge) leaves the grid for a banner
  above it, one `--panel-lit` line each: time, title, room
  (`AllDayStrip`, `Agenda.tsx:224`; `.allDay`, `Agenda.module.scss:322`).
  The narrow layout (≤1024px, JS) is a run sheet: time, Bebas
  `--fs-title-sm` title, mono `--fs-label` room, at a tighter
  `--field-step` (`ListRow`, `Agenda.tsx:450`; `Agenda.module.scss:436`);
  abstracts, tags and photos live only in "Every talk" below.
- **Menu** (`Menu.astro`) — the header mark link is a full 44px tap target
  (`min-height: var(--header-tap)`, `Menu.scss:89`) and stays over the
  open panel (z 2). Open, the toggle label reads "Close"
  (`Menu.astro:345–346`). ≥901px the panel is two columns: the lists left,
  primary links at `--fs-h2`, secondary at `--fs-h3`; right the hero's
  detective plate graded like the hero and feathered on every edge, painted
  only while the panel is open, so nothing loads it unopened
  (`Menu.scss:358–389`). Below 901px the lists alone.

**Structural rules [MUST]:** no decorated eyebrow; red text is flat; **the
red word and the closing full stop belong to the home hero statement**
(and the invite title). Subpage hero titles carry neither (see the title
list under Voice); every `SubpageHero` title is migrated. Section heads and every `Closer` title
are plain cream, because a red final word on ~30 headlines made none of them
the loud one. On the refreshed pages section heads drop the full stop
("Buy your way in", "Look back", "Starring"); a couplet keeps it ("One day. /
One mill."). One `--fs-display` per page; section heads left-set; no accent
bars down a block's left edge; lists carry **no rules**; detail views are
full-bleed sheets. `Closer.astro` ends a page that asks for a decision:
`/speakers`, `/agenda`, `/workshops`, `/venue`, `/invite/<member>`. A page
that asks for none ends on an `EndLine` (list above); `/contact` ends on its
"Open the press kit" button, `/partners` on its own `.band--accent` CTA,
`/404` on its `NextStepList`, and `/privacy-policy`, `/code-of-conduct` and
`/delete-account` on their content.

**The footer is the open sitemap [MUST].** The menu hides every destination
behind one toggle at every width, so `Footer.astro` lists every page in two
groups, *Attend* and *About*, with the menu's labels. A new route is added to
both.

**Footer anatomy [MUST]:** columns → the bottom line (`© 2026 GUG.cz, z.s.`
left, "Open source ↗" right). The brand column leads with the official logo
file (`src/assets/logo.png`, a link home, `Footer.astro:79–89`), then the
tagline; no typeset `DEVFEST.CZ` wordmark (it disagreed with the header's
mark). Ground `--color-bg`. No rules; space separates the rows
(`Footer.scss:2–44`).

## Anatomy of a page

**[MUST] A subpage is:** `SubpageHero` → `.band` sections → `Closer` where
the page asks for a decision, otherwise an `EndLine` inside the last band →
`Footer`. No `Ticker` anywhere (it was the same five topics under every
hero, then under the home hero only; now no page renders it). The first
band after the hero opens on `--section-y-tight` (`.subpage-hero + .band`);
neither the hero nor the band draws a line between them. The legal pages
(`/privacy-policy`, `/code-of-conduct`, `/delete-account`) run this shell
too, with a footer; `/` and `/partners` are out of scope.

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
  `speaker-card`, `404`, the two thank-you pages and the three legal pages.
- **Legal pages.** Inside the lit band a `.policy` reading column, left on
  the gutter, max `70ch`, Special Elite `--fs-body`, `h2` at `--fs-h3`
  (`privacy-policy.scss:6–21`, shared by all three). Data tables stack into
  labelled cards ≤600px: each `td` prints its column head from
  `data-label`, the `thead` is visually hidden but kept for assistive tech
  (`privacy-policy.scss:118–170`).
- **`.band--lit`.** The one subpage ground. A `--lit-red` variant existed for
  the people / programme pages but was byte-identical; it was folded in.
- **`.band--accent`.** At most once per page, only when the band contains a
  form (`index.astro:246`, `partners.astro:79`). Otherwise close on red with
  `Closer tone="accent"`.
- **The first band's head.** **[MUST]** When the hero already names what the
  band holds (`speakers`, `agenda`, `contact`, `press/downloads`), the band opens straight on its content with an
  `sr-only` `h2`. A second poster headline under the hero ("Who's talking"
  under "Speakers") says the same thing twice. A visible head is for a band
  the hero does not name: the FAQ groups, a second band further down. A
  `NextStep` field is headed by its `NextStepList` mono label, not a poster
  head.
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
  `SubpageHero photo={false}` → `.band--lit` with a `NextStepList` →
  `EndLine` (not `/404`). `/thank-you` opens the band on the calendar as a
  stub panel (`.event-stub`, `thank-you.scss:6–56`): `--panel-2` at
  `--radius`, the date as a `<time>` at `--fs-h2` under a mono "Put it in
  your calendar" eyebrow, a mono Time / Place list, then "Download .ics"
  (primary) and "Google Calendar" (ghost); three columns, two ≤1100px, one
  ≤700px. Then "Before you go", share and an `@media print` block.
- **`/venue`** — "The route" is an ordered `NextStepList`, steps 01–03; the
  three photos ride on the last step (where the visitor has to recognise
  the building), graded `grayscale(1) contrast(1.35) brightness(0.62)` and
  developing on hover (`venue.scss:7–38`). "Flying in" sits after it as an
  unnumbered step in its own `.field` (`.venue-aside`).
- **`/press/downloads`** — one card per logo variant, not one per file: the
  mark on a 16:9 tile (cream, or `--panel-2` for a light mark), a Bebas
  `--fs-title-sm` name, its formats as mono chips (each a download control
  with the `--field-border` edge, 44px tall); 1 / 2 / 4 columns, separated
  by air. The brand manual, with no preview, is a `--panel-2` row with an
  `--fs-h3` name and a ghost download button
  (`press/downloads.scss:14–145`). The back link reads "← In the news" and
  lands on `/contact#press` (an `.anchor-target`).
- **Event facts** live in `src/lib/event.ts` (doors 08:00, keynote 09:00,
  close 19:00, afterparty to 23:00, `dateLabel` / `dateShort`, venue, map,
  `.ics`); every page that states an hour or the date reads them from
  there. Keep in step with the `.ics` in `public/` and the Event JSON-LD in
  `BaseLayout.astro` (`startDate` 09:00, `doorTime` 08:00, `endDate` 19:00,
  `BaseLayout.astro:94–97`).
- **The facts band on `/`.** The couplet "One day. / One mill." at `--fs-h2`
  and one Special Elite `--fs-lede` line in `--ink-soft` (max `32ch`), beside
  a documentary plate of the mill bleeding off the right edge. Grid 40/60
  aligned to the container inset: `calc(max(0px, (100% - var(--maxw)) / 2) +
  var(--gutter)) minmax(0, 2fr) minmax(0, 3fr)`, so the text starts on the
  gallery head's x (`index.scss:357–362`). The plate is graded
  `grayscale(1) contrast(1.35) brightness(0.62)` and develops on hover
  (`368–404`). Its mask is two feathers intersected: left (opaque by 38%)
  and top (black at 0, fully visible by 32%), so the sky rises out of the
  hero's faded bottom with no band edge (`373–385`). ≤900px it stacks under
  the text at 4:5 with its single top feather (`transparent` → `#000` at
  18%, composite reset to `add`, `406–421`). No figures: a stat row was the
  hero-metric template.
- **The home hero runs into the mill without a seam.** `HeroBackground`
  takes an opt-in `fadeBottom` (home only, `index.astro:67`): the plate
  fades to `#000` over its bottom ~26% (opaque to 74%, transparent at 100%,
  `HeroBackground.scss:62–71`), and the hero grain fades with it
  (`#hero::before`, `index.scss:21–27`). The fade is a second mask layer
  (`--hero-mask-fade`) intersected with the plate's shape
  (`--hero-mask-shape`: the left feather, or the ≤900px top-down curve;
  `HeroBackground.scss:20–40`, `73–84`). **[MUST]** Two mask
  layers combine with `mask-composite: intersect`, preceded by the legacy
  `-webkit-mask-composite: source-in`.
- **The home gallery** opens on a `.head-stack` "Look back", no note, then
  a static six-photo collage inside the content column: a 6-track grid, the
  first frame 4 tracks × 2 rows, two stacked beside it, three across under
  them; rows `clamp(9rem, 15vw, 14rem)`. ≤600px two columns, the first and
  last frames across both (`index.scss:449–485`). Fixed order (`GALLERY`,
  `index.astro:34–41`), B&W, develops on hover. No scroll strip.
- **Home section spacing** comes from the section tokens, not stacked
  paddings: `#tickets` closes on no bottom padding and the credits open on
  one `--section-y` (`index.scss:573–579`); the credits close on none and
  the partner strip opens on `--section-y-tight`; the gallery opens on
  `--section-y` after it (`index.scss:586–595`).
- **The home hero and the cookie banner.** While the banner is up it publishes
  its height as `--consent-h` on `<html>` (`CookieBanner.astro`); `#hero`
  takes it as its bottom inset, so the bottom-set content rises into the sky
  of the photograph instead of sliding under the banner.
- **The home hero's foot is one typed line** (`index.astro:118–142`): the
  date as a `<time>`, the venue as a maps link, the wave on sale
  (`HeroOffer`: mono wave qualifier, "· until <date>" when it has one, then
  "From <price>" linked to `#tickets`) and "Doors open in" + the compact
  countdown. Values in Bebas at one size (`index.scss:274–282`,
  `HeroOffer.module.scss:32`, `Countdown.module.scss:53`); the countdown's
  unit letters are Bebas caps, uppercase, not lowercase
  (`Countdown.module.scss:72–79`); no Date / Place
  labels, no stat row. The line wraps at the phone measure. The rotor is
  captioned "On the programme" (see Motion).
- **The home statement fills the phone column.** ≤600px it sets at
  `clamp(2.6rem, 16.5vw, 4.5rem)` with no `ch` cap, so the longest line
  spans the column (`index.scss:766–767`); still the page's largest type.
- **The hero covers the bar.** The home hero's lockup carries
  `data-covers="brand"` and its actions `data-covers="cta"`; while either is
  in view below the bar, `trackHeroCover` (`Menu.astro:222`) writes the
  token into the header's `data-covered` and the bar's own mark or "Get
  tickets" fades out (`visibility` kept, so nothing reflows), at every
  width (`Menu.scss:107–120`). The open menu always shows the mark. Without
  JS the attribute never appears and both stay visible.
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
  `code-of-conduct`, `delete-account`).
- **`/faq`.** The detective-theme question sits in Essentials
  (`src/content/faq.json`); an open item takes a flat `--panel-lit`
  ground inside the column (see Component states).

## Iconography

**[MUST] No icon library.** The only inline `<svg>` elements are the
`Footer.astro` social marks, each `aria-hidden="true"` beside a visible text
link. Don't add an icon package for a UI glyph. Speaker-sheet links are
named text, not network glyphs (`SPEAKER_ICON_PATHS` is deleted): three
identical chain icons told the visitor nothing.

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

**[MUST] Dates, hours and spelling.** Day-month-year: "30 October 2026" in
running copy (`EVENT.dateLabel`), "30 Oct 2026" in mono stamps and meta
lines (`EVENT.dateShort`), never "October 30". Hours are 24-hour `HH:MM`
("08:00", not "8:00" or "9 AM"), read from `src/lib/event.ts`. British
spelling: "programme", not "program".

**[MUST] Noir wordplay is spent in a few earned places, not everywhere.**
It lives in: the home hero statement, the `/404` title "Nothing filed under
that", the newsletter's "Follow the leads.", "Starring", "Buy your way in", "See them in the room.". Every other
title says plainly what the page or block is ("Speakers", "Partners", "The
team", "Questions", "Become a partner"). No triads, no em-dash chains, no
hype words.

**[CURRENT] Subpage titles** (`SubpageHero titleHtml`): `/speakers`
"Speakers", `/partners` "Partners", `/team` "The team", `/faq` "Questions",
`/agenda` "The day on a timeline", `/venue` "Getting there", `/contact`
"Get in touch", `/press/downloads` "Logos & assets", `/invoice` "Buy on a
company invoice", `/workshops` "Save your seat at a workshop", `/attending`
"I'm attending", `/speaker-card` "I'm speaking", `/thank-you` "You're in",
`/newsletter-subscription-thank-you` "You're on the list", `/404` "Nothing
filed under that", `/privacy-policy` "Privacy Policy", `/code-of-conduct`
"Code of Conduct", `/delete-account` "Delete your app account". Closers:
"See them in the room." (`/speakers`), "Doors open 30 October."
(`/agenda`), "No ticket yet?" (`/workshops`), "See you on the 30th."
(`/venue`), "Take the ticket." (`/invite/<member>`); the `/partners` CTA is
"Become a partner".

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
  `--focus-gap-lg` (alone in space) (`BaseLayout.scss:141–145`). Commented
  exceptions: agenda cell inset ring, the FAQ question's inset ring
  (`faq.scss:90–93`), and a partner logo's wider `6px` gap on the home strip
  and `/partners` (`index.scss:674`, `partners.scss:78–81`).
- **[MUST] Semantics before ARIA.** A row that IS a control is a real
  `<button>` / `<a>` / `<summary>`.
- **[MUST] `.skip-link` is the first focusable element** (`BaseLayout.astro:332`,
  `BaseLayout.scss:275–307`). `html { scroll-padding-top: calc(var(--header-h)
  + 1.5rem); scroll-padding-bottom: 8rem }` keeps targets clear of header and banner.
  `#main-content` has `tabindex="-1"` so `Enter` moves focus, not just the
  fragment; its ring alone is suppressed.
- **[MUST] The cookie banner is second in the DOM**, `Escape` handler on
  `document` (`CookieBanner.astro:89–93`).
- **[MUST] Anything that moves on its own pauses on hover and focus (2.2.2).**
  The topic rotor is its own pause control: `tabindex="0"`, `role="group"`
  with an `aria-label` naming the set, held on `:hover` / `:focus-within`.
  No visible pause button.
- **[MUST] Header controls are 44px tap targets.** The mark link and the
  bar's buttons take `min-height: var(--header-tap)` (`Menu.scss:89`, `201`).
- **[MUST] A white label on red is large text or it does not ship.** The
  `cta-label` size is the AA floor (see Color); where it does not fit, the
  control moves (the header Tickets into the menu under 384px), the label
  never shrinks.
- **[MUST] `.sr-only`** for text in the a11y tree but off screen
  (`BaseLayout.scss:318`).
- **[MUST] Sheets return focus** to the opening row (`src/lib/useReturnFocus.ts`)
  and close on Esc.
- **[MUST] Reduced motion** — see Motion.
- **[MUST] `html { overflow-x: clip }`, never `hidden`** — `hidden` makes
  `html` a scroll container on iOS Safari and breaks `position: fixed` and
  safe-area `env()` (`BaseLayout.scss:225–229`).

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
6. **Orphaned tokens.** `--fs-title-compact` (`BaseLayout.scss:69`) and
   `--fs-hero` (`62`) have no `var()` caller: the legal pages that read
   `--fs-hero` moved to `SubpageHero`, and the home statement sets its own
   clamp. Delete both or give them a caller. (`--fs-wordmark` and
   `--ink-wordmark` went with the footer wordmark.)
7. **`min-width` queries** against a max-width convention: `901px` ×6
   (`index.scss` ×5, `Menu.scss:363`), `601px` ×2 (`Menu.scss:219`,
   `invite/member.scss:164`), `Speakers.module.scss:15,20`
   (`760px` / `1100px`), `press/downloads.scss:26,30` (`640px` / `1100px`).
8. **JS-only breakpoint:** `1024px` (`Agenda.tsx:58`), in no stylesheet.
   The header's `760px` (`Menu.astro:282`) matches the credits' collapse
   and the speaker grid's 3 → 2 step, but nothing ties them together.
9. ~~**Special Elite declares no `subsets`**~~ Resolved: Latin-Ext letters
   fall to JetBrains Mono via the Fonts API `fallbacks` (see Typography).
10. **Split with `CLAUDE.md`.** Rules live here; `CLAUDE.md` points here.
    Nothing enforces it.
11. **`Closer` default `tone="raised"` renders `band--raised`, which has no
    CSS.** Harmless today (every call site passes `tone="accent"`).
12. **The font-size ramp is [MUST] but broken at ~35 call sites:** 29
    literals (`Countdown.module.scss:19,30,53,74,84,95,107`,
    `HeroOffer.module.scss:32,54`, `Menu.scss:407,478,580,589`,
    `AttendingCard.module.scss:38,524`, `team.scss:98,117`,
    `invite/member.scss:74`,
    `index.scss:85,139,276,321,329,721,726,759,796,809,870`), 1 relative
    (`Footer.scss:133`), 3 inherited
    (`Footer.scss:274,278,283`).
    The hero footing value `clamp(1.6rem, 2.4vw, 2.2rem)` is written three
    times (`index.scss:276`, `HeroOffer.module.scss:32`,
    `Countdown.module.scss:53`): a token candidate. The same claim in
    `BaseLayout.scss:79` is equally untrue. Fold into the ramp or downgrade
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
20. **Partner mono modes are a filename map.** `LOGO_MONO`
    (`src/lib/partners.ts:22–27`) picks `tile` / `dark` / `colour` by master
    filename; it belongs in the `partners` collection schema
    (`content.config.ts`) as a per-partner field.
21. **`.hairline-link` has no markup caller.** The canonical "see all" /
    next-step link is re-implemented by every caller: `.partners-more`
    (`index.scss:694`), `.end-line-link` (`EndLine.scss:17`) and
    `.hero-link a` (`SubpageHero.scss:64`) include the mixins;
    the credits' `.allLink` (`SpeakersTeaser.module.scss:125`) hand-writes
    the same look without the mixin. Use the class, or state why a caller
    cannot.
22. **Dark-ink partner masters sit on a paper card.** Dotěkománie and White
    Whale Media only ship dark-ink artwork; light versions would let them
    drop the card. `LogoMono` is keyed by filename and belongs as a field
    in the partners schema.
23. **Canvas drift.** `design/devfest.pen` now carries the footer with its
    logo, the speaker grid, the home collage gallery, the plain subpage
    titles and `EndLine`, and the brand-manual tokens, white Bold CTA labels
    and red-toned bands (see Pencil canvas). Still not re-synced: the
    `Mobile` frames, the menu, the agenda, `NextStepList`. The canvas
    `$on-accent` / `$on-accent-ink` still hold `#F7EFE6` / `#1A0000` (code:
    `#000000` / `#FFFFFF`), and the red-toned fills are literal, with no
    `$red-toned` variable.
24. ~~**Full-width flat red bands are not an approved large red area.**~~
    Resolved: `.band--accent` (the newsletter, the `/partners` CTA and every
    `Closer tone="accent"`) paints `--red-toned` (`BaseLayout.scss:139`,
    `471–479`), the manual's red-toned background.
28. **The attending card still draws a flat red band.** The generated card's
    bottom band "mirrors `.band--accent`" but fills flat `accent`
    (`src/lib/attending-card.ts:369–374`). Red-toned gradient, or a stated
    exception for a small edge band.
27. **Photo contrast is mixed.** Gallery and avatars rest at
    `contrast(1.3)`; speaker prints (`Print.module.scss:40`), the speaker
    sheet (`SpeakerDetail.module.scss:40`), `/team` (`team.scss:60`) and
    the hero plate (`HeroBackground.scss:19`) at 1.12–1.14. Manual p. 13
    also allows speaker portraits in colour on black.
