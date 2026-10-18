---
name: DevFest.cz 2026
description: Noir, but loud, in the darkroom. Photographs and facts are paper prints and slips on a black table, labelled with tape, numbered like frames, marked with one red grease-pencil stroke. Poster-scale Bebas section heads on space, two controls, three voices (Bebas speaks, Special Elite tells, mono records figures), no arrow glyphs.
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
  paper: "rgba(255,255,255,0.94)"
  tape: "rgba(255,255,255,0.82)"
  paper-ink: "#000000"
  paper-ink-dim: "rgba(0,0,0,0.66)"
typography:
  subpage:
    fontFamily: "var(--font-bebas-neue), sans-serif"
    fontSize: "clamp(5rem, 13vw, 12.5rem)"
    fontWeight: 400
    lineHeight: 0.9
    letterSpacing: "0"
  section:
    fontFamily: "var(--font-bebas-neue), sans-serif"
    fontSize: "clamp(4.5rem, 12vw, 12.5rem)"
    fontWeight: 400
    lineHeight: 0.9
    letterSpacing: "0"
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
  head:
    fontFamily: "var(--font-bebas-neue), sans-serif"
    fontSize: "clamp(2.1rem, 3.4vw, 3rem)"
    fontWeight: 400
    lineHeight: 0.9
    letterSpacing: "0"
  title:
    fontFamily: "var(--font-bebas-neue), sans-serif"
    fontSize: "clamp(1.7rem, min(4vw, 6svh), 3.4rem)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0"
  card-title:
    fontFamily: "var(--font-bebas-neue), sans-serif"
    fontSize: "1.95rem"
    fontWeight: 400
    lineHeight: 0.92
    letterSpacing: "0"
  title-sm:
    fontFamily: "var(--font-bebas-neue), sans-serif"
    fontSize: "1.45rem"
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
  body-lg:
    fontFamily: "var(--font-special-elite), cursive"
    fontSize: "1.15rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "var(--font-jetbrains-mono), monospace"
    fontSize: "0.78rem"
    fontWeight: 400
    letterSpacing: "0.15em"
  label-lg:
    fontFamily: "var(--font-jetbrains-mono), monospace"
    fontSize: "0.84rem"
    fontWeight: 400
    letterSpacing: "0.1em"
  label-xs:
    fontFamily: "var(--font-jetbrains-mono), monospace"
    fontSize: "0.6875rem"
    fontWeight: 400
    letterSpacing: "0.15em"
  note-sm:
    fontFamily: "var(--font-special-elite), cursive"
    fontSize: "0.85rem"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "0"
  note:
    fontFamily: "var(--font-special-elite), cursive"
    fontSize: "0.95rem"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "0"
  action:
    fontFamily: "var(--font-bebas-neue), sans-serif"
    fontSize: "1.3rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0"
  cta:
    fontFamily: "var(--font-bebas-neue), sans-serif"
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0"
rounded:
  sharp: "2px"
spacing:
  gutter: "min(clamp(1.5rem, 5vw, 4.5rem), 6.25vw)"
  section-tight: "clamp(3.75rem, 6vw, 6.5rem)"
  section: "clamp(6rem, 10vw, 11rem)"
  section-wide: "clamp(8.5rem, 15vw, 17rem)"
  field-step: "clamp(1.4rem, 2.2vw, 1.9rem)"
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
  action:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    typography: "{typography.action}"
    padding: "0.75rem 0"
    height: "2.75rem"
  action-hover:
    textColor: "{colors.accent-hot}"
  head-rule:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    typography: "{typography.section}"
    padding: "0"
  head-rule-note:
    textColor: "{colors.ink-soft}"
    typography: "{typography.body-lg}"
  paper:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.paper-ink}"
    padding: "0.65rem 0.65rem 0"
  paper-edge:
    textColor: "{colors.paper-ink-dim}"
    typography: "{typography.label-xs}"
    padding: "0.7rem 0.15rem 0.8rem"
  tape:
    backgroundColor: "{colors.tape}"
    textColor: "{colors.paper-ink}"
    typography: "{typography.note-sm}"
    padding: "0.35rem 0.85rem 0.3rem"
  ticket-slip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.paper-ink}"
    typography: "{typography.title}"
    padding: "1.9rem 2.1rem 2.1rem"
  eyebrow:
    textColor: "{colors.ink-muted}"
    typography: "{typography.note}"
  hairline-link:
    textColor: "{colors.text}"
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
  closer:
    backgroundColor: "{colors.bg}"
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
    backgroundColor: "{colors.paper}"
    textColor: "{colors.paper-ink}"
    typography: "{typography.card-title}"
    padding: "0.65rem 0.65rem 0"
  speaker-tile-hover:
    textColor: "{colors.accent}"
  agenda-slip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.paper-ink}"
    typography: "{typography.body}"
    padding: "0.875rem 1rem 1rem"
  step-list-label:
    textColor: "{colors.ink-muted}"
    typography: "{typography.note}"
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
| `src/layouts/BaseLayout.scss` | all tokens (`:root`, lines 2–207), resets, global primitives, the darkroom primitives (`.paper`, `.paper-photo`, `.paper-edge`, `.tape`, `.grease`). Injected `is:global`, so every `.astro` page and `.tsx` island uses the class names directly |
| `src/styles/_type.scss` | the type recipes as mixins, one per voice — `note()`, `action()`, `cta-label()`, `mono()`, `display()`, `row-title()`, `prose()`, `hairline-link()`. A CSS Module that cannot compose a global class includes the mixin instead |
| `src/styles/_controls.scss` | control recipes — `lit-field()` |
| `src/styles/_logos.scss` | partner-mark recipe — `partner-logo()` (original colours; `.logo--dark` on a paper card) |
| `src/components/Sheet.module.scss`, `SpeakerTile.module.scss` | shared chrome composed by more than one island (the detail sheets; the speaker print and its grid, on `/` and `/speakers`) |
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
| p. 09 | red marks details; large red only as title bars, darkened red grounds, primary CTAs; never running text. The site spends the allowance on buttons and the reach field only: no red ground |
| p. 10 | Bebas uppercase at line-height 0.9–1.0, tracking 0; Special Elite sentence case; JetBrains Mono 400/500 at 0.1–0.2em |
| p. 11 | CTA labels white on red; speaker names in Special Elite; one red mark per list. The manual sets buttons in mono; the site sets every action in Bebas since the three-voices pass (see Typography), a recorded divergence |
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
| `--on-accent` | `#000000` | ink on flat red, any size (the hovered `.field-row--link`, the agenda `.nowLabel`, the sessions `.avatarMore`) |
| `--on-accent-ink` | `#FFFFFF` | large type on flat red |
| `--fs-cta` | `1.5rem` (24px) | the CTA label on red, white Bebas: the 24px regular-weight large-text line (`BaseLayout.scss:131–134`) |
| `--on-accent-border` | `rgba(0,0,0,0.85)` | control boundary on flat red |

The `--on-accent-*` trio is for **flat** `#F11000` only (the reach field,
chips, `BaseLayout.scss:129–136`). There is no red ground token: the
darkened red band and its white-ink re-pointing are gone
(`BaseLayout.scss:501–504`).

Surfaces, white at an opacity over the black ground (`BaseLayout.scss:120–125`,
`156–158`): `--panel` `0.047`, `--panel-2` `0.067`, `--panel-hover` `0.086`,
`--panel-lit` `0.04`, `--panel-lit-2` `0.055`. Same look on `#000` as the old
solid `#0C0C0C`…`#161616`. **[MUST]** A plate that must be opaque (a fixed bar
over content) layers the token over `--color-bg`: the cookie banner is
`linear-gradient(var(--panel-lit), var(--panel-lit)), var(--color-bg)`
(`CookieBanner.scss:18`). Canvas-drawn plates (speaker / attending card
monograms) fill black first, then the panel (`SpeakerCard.tsx:47–52`,
`AttendingCard.tsx:41–46`), or they export see-through. The footer ground is
`--color-bg` (`Footer.scss:10`).

**The darkroom** (`BaseLayout.scss:152–165`). Photographs and the facts that
travel with them are paper on the black table. **[MUST]** Paper is white at
an opacity, never a cream hex (the manual has no cream): `--paper`
`rgba(255,255,255,0.94)`, `--tape` `0.82`. Ink on paper is black:
`--paper-ink` `#000000`, `--paper-ink-dim` `rgba(0,0,0,0.66)` (5.3:1 on
`--paper`, the floor for small mono edge labels and notes on a print). A
print is lifted off the table by `--paper-shadow` (`0 2rem 4rem
rgba(0,0,0,0.85), 0 2px 6px rgba(0,0,0,0.7)`): one deep drop, one contact
shadow, a static property of the paper, never a hover state. Tilts are
`--tilt-1` `0.8deg`, `--tilt-2` `1.4deg`, `--tilt-3` `2.2deg`; **[MUST]**
nothing tilts past `--tilt-3`, and under 720px a `.paper` clamps to
±`--tilt-1` (`BaseLayout.scss:466–470`). Callers vary the sign and take
fractions of a step so neighbours never match.

Hairlines: `--rule` `rgba(255,255,255,0.13)`, `--rule-soft` `0.06`,
`--rule-strong` `0.22`, `--rule-red` `rgba(241,16,0,0.55)`,
`--field-border` `rgba(255,255,255,0.4)`.

**[MUST] Rules only where they carry structure.** Space and paper part the
page, not lines: a section head sits on space (`.head-rule` draws no rule,
`BaseLayout.scss:362–387`), a print or a slip is set apart by its own
edge and shadow, and the footer opens on space (`Footer.scss:2–13`). A line
is drawn only under a row of a `.field` list (`border-bottom: 1px solid
var(--rule)`, `BaseLayout.scss:764–777`: the rows in the speaker and
session sheets, the `NextStep` rows on `/404` and the thank-you pages), in
data tables (privacy policy), as a form control's boundary (on paper the
newsletter field is a 2px `--paper-ink` underline), as an in-prose link's
underline (the hero facts line's venue link, `index.scss:81–83`), as a
progress spine (the card builder's steps), as the dashed `--field-border`
outline of a place still empty (the agenda's open slot, the end of "Every
talk"), as the short `--rule-strong` mark between the two link groups in
the desktop bar (`.bar-sep`, `Menu.scss:217–221`) and as the cookie
banner's edge over the page. Never a divider floating between sections, a
rule under a section head, a line above the hero's facts line, a ruled
readout (the invoice total), a rule down an agenda room column (the gap
between slips parts the rooms), or a box drawn round a partner mark
(**[CURRENT]** the agenda lounge block keeps a 3px `--paper` edge down its
left side, `Agenda.module.scss:245`; see Open points).

Ink ramp: `--ink-strong` `0.85`, `--ink` `0.78`, `--ink-soft` `0.7`,
`--ink-meta` `0.62`, `--ink-dim` `0.6`, `--ink-muted` `0.55`, `--ink-faint`
`0.5` (all `rgba(255,255,255,…)`). Named steps only; a one-off alpha stays a
raw literal.

Atmosphere: `--lit` (the spotlight pool, `ellipse 78% 50% at 50% 38%`, gone
by 72% so it fades out before the band's top and bottom edges: no seam
against the section above, `BaseLayout.scss:163–167`), `--field-feather`, `--print-mount`, `--wash` /
`--wash-strong` (the raking light a reached row / cell takes; pure white
alphas, `173–174`),
`--ink-monogram` `0.46` and `--ink-monogram-sm` `0.66`. `--print-mount` now
mounts only the speaker sheet's photograph (`.print`) and the attending
card preview; every other photograph is a `.paper` print. No glow token and
no page vignette token; the plate vignette is `.scene-vignette`'s own
gradient (the invite page is its one caller).

**[MUST] No glow anywhere.** Hover and live states are flat colour changes:
an inverted fill for buttons, a border or ink change for rows and fields.
The paper shadow is the paper's, at rest and under the pointer alike
(**[CURRENT]** an agenda or session slip lifts 3px under the pointer; see
Open points).

**[MUST] Red is evidence, not mood.** Per the manual it marks details (a dot,
1–2 words in a headline, the year, CTA words, a grease-pencil stroke) and,
as a large area, only primary CTA buttons and the row reach field. **No red
ground**: every `Closer`, the `/partners` CTA and the newsletter sit on the
black ground (`Closer.astro`). Red is a verb: one word, one button, one
state per page. No red washes behind photographs, no red running text, no
other accent hue, no red-to-other-hue gradients.

**[MUST] The grease pencil is one red mark per section.** `.grease`
(`BaseLayout.scss:450–464`) is an `aria-hidden` SVG stroke in
`--color-accent`, 3px, non-scaling, drawn over what it marks: the "350"
ringed on the home event card, frame 12A ringed on the contact sheet, the
keynote print's four corners, the 25–30 minute ride ringed on `/venue`, the
entrance print ringed, the general inbox underlined on `/contact`, a spent
ticket wave crossed out. It is never a fill and never text.

**[MUST] One red mark per list.** A list spends red once: the invoice step
numbers are `--ink-muted` (`invoice.scss:39–45`); on the ticket slips the
live wave's red Buy button is the mark and its state ("On sale.") is a
note in `--paper-ink-dim` (`Tickets.module.scss:88–92`). **[CURRENT]** each
spent wave also carries a grease cross; see Open points.

| Use of `#F11000` | Allowed? |
| --- | --- |
| a fill (CTA background, the row reach field, a chip) | yes |
| a full-width band or a section ground | **no** — closers and forms sit on black |
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
| `#000000` | 4.82:1 | anything, incl. small notes, mono figures and body copy |
| `#000000` @ 85% | ~4.2:1 | control boundaries only (1.4.11) |
| `#FFFFFF` | 4.36:1 | large text only (≥18.66px bold / 24px regular): Bebas headlines, the `cta-label` |

**[MUST] Red on paper is a mark or large type, never small text.**
`#F11000` on `--paper` measures about 3.8:1: enough for a grease stroke, a
dot and Bebas at card scale (the speaker name reached, `--fs-card-title`),
not for a note. The agenda's "Live now" stays in paper ink with a red dot
in front of it for this reason (`Agenda.module.scss:211–232`); on the
black table the same word is red (`.band .flagLive`, `234–238`).

**[MUST] A label on a red button is white Bebas at `--fs-cta`.** Manual
p. 11 sets CTA labels white on red; 4.36:1 clears AA only as large text, and
Bebas has no bold, so the size carries it: `--fs-cta` is `1.5rem` = 24px,
the regular-weight large-text line. The `cta-label` mixin is
`action(var(--fs-cta))` (`_type.scss:32–37`: Bebas caps, tracking 0,
line-height 1). **Never shrink it.** Callers: `.btn-primary`
(`BaseLayout.scss:669`), the header Tickets (`.header-cta`,
`Menu.scss:134–155`) and the newsletter button; the cookie buttons take its
size (`CookieBanner.scss:72`). The live ticket slip's Buy sets larger, at
`--fs-card-title` (`Tickets.module.scss:179–182`).

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
measured ratios above assume the dark ground.

## Typography

Three faces, self-hosted through the Astro Fonts API (`astro.config.mjs:72–106`).

| Token | Face | Weights | Line | Role |
| --- | --- | --- | --- | --- |
| `--font-bebas-neue` | Bebas Neue | 400 | 73–80 | **speaks**: every headline at `--fs-h3` and above (hero, section and subpage titles, nav destinations, ticket wave names, speaker names on the prints) and every action: text actions, nav, the header Tickets, buttons, filters, the CTA label |
| `--font-special-elite` | Special Elite | 400 | 89–105 | **tells**: body, lede and long-form reading copy, and every label made of words: section notes, roles, eyebrows, captions, tape labels, form labels, status words, nav meta, the footer. Never a headline |
| `--font-jetbrains-mono` | JetBrains Mono | 400, 500 | 81–88 | **records**: figures only; prices, times, indices, frame numbers, counts, codes, the footer folio. 500 for the ticket slip price and the press clipping headline |

- **[MUST] Only these three families** (`BaseLayout.scss:16–18`).
- **[MUST] Reference the injected variable, never a literal family name** —
  the resolved family is a build-time hash (`BaseLayout.scss:16–18`). Keep a
  generic fallback: `var(--font-jetbrains-mono), monospace`.
- **[MUST] Go through the recipe, not the raw declaration.** `_type.scss`
  has `note($size)`, `action($size)`, `cta-label`, `mono($size, $track,
  $case)`, `display($size)`, `row-title($size)`, `prose($size, $lh)` and
  `hairline-link($color)`; a stylesheet that writes `font-family:
  var(--font-…)` by hand is re-implementing one of them.
- **[MUST] The three voices** (`_type.scss:6–9`). **Bebas speaks**:
  headlines and actions (`display()`, `row-title()`, `action()`,
  `cta-label`). **Special Elite tells**: prose and every label made of words
  (`prose()`, `note()`): the head-rule note, eyebrows, roles, captions, tape
  labels, form labels, error and pending lines, status words, the ticket
  state and deadline, agenda room notes, sheet kicker, nav meta, the footer.
  **JetBrains Mono records**: figures only (`mono()`): prices, times, frame
  and sheet numbers on a print's edge, counts, codes, the footer folio.
  **[CURRENT]** Several paper edges, the agenda flags and the hero frame
  stamp still set words in mono; see Open points. **Mono never sets a
  word-label**; a tracked mono caption was
  the site's "AI" tell. A word in mono is a defect, a figure in Special
  Elite is one too (the ticket alt price "Company funded 1 452 Kč" is a
  note because it is a sentence; the folio "Case no. DF-2026" is mono
  because it is a code).
- **[MUST] `note()` is sentence case, tracking 0, line-height 1.45**
  (`_type.scss:14–20`); the typewriter does not shout. **`action()` is
  Bebas caps at `--fs-action`, tracking 0, line-height 1**
  (`_type.scss:24–30`). Neither takes a `text-transform` or
  `letter-spacing` from the caller.
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
  Every face ships one weight (JetBrains Mono loads 400 and 500; 500 sets
  the ticket slip price, `Tickets.module.scss:65–73`, and the clipping
  headline, `press.scss:74–79`) and no italic;
  emphasis in prose is ink — `strong` / `b` step up to `--color-text` —
  never weight or slant. Don't write `font-style: italic`.

**The ramp [MUST].** Every `font-size` goes through one of these steps; add a
step here before using a new value. **[CURRENT]** ~35 call sites still bypass
it — see Open points.

Poster scale (Bebas), `BaseLayout.scss:61–79`:

| Token | Value | Line | Use |
| --- | --- | --- | --- |
| `--fs-subpage` | `clamp(5rem, 13vw, 12.5rem)` | 70 | the subpage `<h1>` in `SubpageHero` — **one per page** |
| `--fs-section` | `clamp(4.5rem, 12vw, 12.5rem)` | 69 | **the section head** (`.head-rule-title`): Tickets, Speakers, Past editions, Partners on `/`; "Every talk" on `/agenda`; "The route" on `/venue`; "In the news" on `/contact`. Also the footer wordmark, the `/venue` closer title, and Newsletter ≤720px |
| `--fs-display` | `clamp(3rem, 9.5vw, 9rem)` | 61 | a poster title a step under the section head: the home event title and "Newsletter", the `/venue` address and "The entrance", the FAQ categories, "Become a partner", "Press kit"; the live ticket slip's name and price on a phone |
| `--fs-hero` | `clamp(3rem, 9.5vw, 8.5rem)` | 62 | the home statement (`index.scss:55–62`) |
| `--fs-h2` | `clamp(2.25rem, min(6vw, 9svh), 5.5rem)` | 66 | every `Closer` title; the live ticket slip's name and price; the `/team` end title; the menu's primary links ≥901px |
| `--fs-h3` | `clamp(1.8rem, 3.4vw, 2.6rem)` | 67 | sub-section headline; `NextStep` titles; a ticket slip's price; `/team` names; the menu's secondary links ≥901px; legal `h2` |
| `--fs-head` | `clamp(2.1rem, 3.4vw, 3rem)` | 68 | a compact head on a card: the `/contact` index-card titles, the `/venue` card titles and numbers, the partnerships contact's name |
| `--fs-card-title` | `1.95rem` | 71 | the speaker name on a print, the live slip's Buy label, the teaser's "All speakers"; invoice |
| `--fs-title-compact` | `1.6rem` | 72 | **no caller** |
| `--fs-row` | `clamp(2.1rem, min(5.2vw, 7.5svh), 4.5rem)`; `2.1rem` ≤600px | 77 | the keynote print's name |
| `--fs-row-sm` | `clamp(1.7rem, min(4vw, 6svh), 3.4rem)`; `1.7rem` ≤600px | 78 | a ticket slip's wave name |
| `--fs-row-figure` | `clamp(2.1rem, min(4.2vw, 6svh), 4rem)`; `2.1rem` ≤600px | 79 | the teaser's speaker count |

**[CURRENT] subpage ≥ section > display > h2 > h3.** A subpage title and a
section head share the 12.5rem cap; the subpage floor is a step higher. The
home statement at `--fs-hero` (8.5rem cap) sits under the section heads
below it: the poster weight on `/` moved from the hero to the section
heads (see Open points). `--fs-h2` and the row steps carry an `svh` term so
a short desktop screen brings them down (`BaseLayout.scss:63–79`).

Text scale, `BaseLayout.scss:83–95`:

| Token | Value | Line | Use |
| --- | --- | --- | --- |
| `--fs-label-xs` | `0.6875rem` (11px) | 83 | micro mono figure: every `.paper-edge`, the agenda and session slip edges, the FAQ question numbers, avatar counts, kit file sizes, the footer folio, the hero frame stamp |
| `--fs-label-sm` | `0.74rem` | 84 | mono figure: the agenda time gutter ≤1100px, counts |
| `--fs-label` | `0.78rem` | 85 | mono figure: the ticket slip's date stamp and company figure, the FAQ index numbers, agenda break times |
| `--fs-label-lg` | `0.84rem` | 86 | mono figure: the larger index (`NextStep`), the agenda time gutter, the invite meta line |
| `--fs-note-sm` | `0.85rem` | 87 | Special Elite note: roles, captions, tape labels, row metadata (the ticket alt price and edge; the speaker role and "With …"; agenda room notes; `.record-status`) |
| `--fs-note` | `0.95rem` | 88 | Special Elite note: `.eyebrow`, a speaker print's talk, the newsletter label, form labels, the sheet kicker, nav meta, the FAQ index label |
| `--fs-action` | `1.3rem` | 89 | Bebas action: the text action (`.action` / `.btn-ghost`), nav toggle, desktop bar links, footer links, Sheet close, speaker social links, the session filters, "Clear" |
| `--fs-ui` | `0.95rem` | 90 | small UI prose, help text |
| `--fs-body` | `1.05rem` | 91 | long-form reading copy; an agenda slip's title |
| `--fs-body-lg` | `1.15rem` | 92 | the `.head-rule` note, subpage ledes, footnotes, a session slip's title |
| `--fs-lede` | `clamp(1.2rem, 1.6vw, 1.5rem)` | 93 | section ledes, status prose, the `EndLine`, a FAQ question |
| `--fs-title-sm` | `1.45rem` | 94 | small titles, mobile record titles, press-kit variant names, speaker print names ≤720px (`SpeakerTile.module.scss:232–234`) |
| `--fs-monogram` | `3.4rem` | 95 | initials in an empty photo well |

**[MUST] Mono figures never set under 11px.** `--fs-label-xs` is the floor;
there is no smaller mono step. **[MUST] A note never sets under
`--fs-note-sm`** (13.6px): Special Elite's texture breaks up under 13px
(`_type.scss:11–13`).

**[MUST] Bebas sets at line-height 0.9–1.0, tracking 0, uppercase** (manual
p. 10). Display type uses `--lh-display` (`0.9`, line 99) and
`--track-display` (`0`, line 100), never a per-file `line-height`;
`row-title()` and `action()` set `line-height: 1`, `letter-spacing: 0`
(`_type.scss:24–30`, `75–82`). No Bebas rule carries a `letter-spacing` of
its own (**[CURRENT]** the desktop bar links and the footer links do, see
Open points). No `text-shadow` on type on the black ground. **[CURRENT]**
Two exceptions sit on a photograph: the home statement (`line-height:
0.86`, `text-shadow: 0 2px 30px rgba(0,0,0,0.6)`, `index.scss:55–62`) and
the subtitle line set over the home event print (`index.scss:140–151`);
both are legibility devices for type on a photograph, not a style for type
on black (see Open points).

**[MUST] JetBrains Mono tracks at `0.1em`, `0.15em` or `0.2em`** (manual
p. 10: 0.1–0.2em). A figure has no case to force. **[CURRENT]** `mono()`'s
`$case` argument has callers again: `.paper-edge`, the agenda and session
slip edges and flags, the hero frame stamp and the footer folio set
`uppercase`, at `0.12`–`0.16em`; see Open points.

**[MUST] Phones take their own list step and tracking.** At ≤600px the
`:root` phone block (last in `:root`, so it wins over the base steps) sets
the row steps above to their phone values and `--track-scale: 0.72`; the
`mono()` mixin multiplies its tracking by `--track-scale` and floors the
result at `0.1em` (`max(0.1em, …)`, `_type.scss:49–51`), so a 0.15em figure
sets at 0.108em on a phone and a 0.1em one stays at 0.1em; notes and actions
carry no tracking and do not move. `--fs-h2` and `--fs-display` keep their floors: the section head and the page title stay poster scale while
the lists under them come down.

**[MUST] Body text caps at 65–75ch.** Cap the container, don't shrink the
type. Mono never tracks under `0.1em`.

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
| `--focus-gap-tight` / `--focus-gap` / `--focus-gap-lg` | `2px` / `3px` / `4px` | 140–142 | focus-ring standoff, see Accessibility |

**[MUST] Large screens scale, they do not widen.** Up to 1920px the root is
the browser default. Past it `html` grows the root linearly
(`100% + (100vw - 1920px) / 120`, capped at 200%), so a 2560px viewport (4K at
150%) renders the page at 1.33x and 3840px (4K at 100%) at 2x: the same
composition as 1920px, not a 1440px column adrift in black. It only works
because layout caps and grid minimums are in rem; a new `max-width`,
`minmax()` floor or image cap goes in rem, and a px value is for phone
floors and physical sizes (the 44px tap target, hairlines) only.

**[MUST] Three section densities, not one** (`BaseLayout.scss:31–34`).

**[MUST] Row rhythm is `--field-step` on the row** (`BaseLayout.scss:661–677`):
`clamp(1.4rem, 2.2vw, 1.9rem)` default, `clamp(2.25rem, 3.6vw, 3.25rem)` for
`--short`. Vertical only; the row closes on its 1px `--rule`.

**[MUST] `.anchor-target` cancels a section's opening air with a negative
`scroll-margin-top` reading `--section-air`** (`BaseLayout.scss:468–470`), the
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
| `max-width: 720px` | 19 | **the darkroom's phone step**: prints and slips go one or two across and stop tilting past `--tilt-1` (`BaseLayout.scss:466`); the speaker grid goes two across and the keynote print the size of the rest (`SpeakerTile.module.scss:218`); the teaser trims to seven prints and its way on; ticket slips stack; the FAQ index becomes a row of links; the subpage hero stacks; `Sessions`, `Sheet`, the newsletter card, the `/venue`, `/contact`, `/team`, `/partners` grids |
| `max-width: 600px` | 11 | the phone type steps in `:root`; the menu bar tightens (`Menu.scss:519`); sheets and forms |
| `max-width: 1100px` | 11 | tablet: the `/speakers` grid goes three across; the home event grid, the `/venue`, `/contact`, press and `/partners` CTA grids go one column; the subpage print narrows; the agenda tightens; `/team` three across; the calendar stub folds (`thank-you.scss`) |
| `max-width: 900px` | 5 | the closer, `NextStep`, the card builder, `HeroBackground`, the press-kit page |
| `max-width: 860px` | 4 | the sheet plate, `.head-split`, the invite page |
| `max-width: 500px` | 2 | the newsletter form stacks; the cookie banner |
| `max-width: 45em` / `23.75em` | 2 / 1 | the footer goes two columns, then one (`Footer.scss:54`, `63`, `247`) |
| `max-width: 700px` | 1 | `thank-you.scss:70` |
| `max-width: 380px` | 1 | narrowest phone (`BaseLayout.scss:46` header padding) |
| `max-width: 379.98px` | 1 | the header Tickets leaves the bar (`Menu.scss:557`) |

**[CURRENT]** `min-width` queries exist: `1100px` ×2 (the inline desktop
nav, `Menu.scss:223`; the press-kit page, `press/downloads.scss:30`),
`901px` ×1 (the menu panel's poster-scale link steps, `Menu.scss:375`),
`601px` ×1 (`invite/member.scss:164`), `640px` ×1
(`press/downloads.scss:26`), and the `1921px` root scale ×3 — see Open
points.

**[CURRENT] The nav goes inline at 1100px.** At ≥1100px the bar carries
the destinations inline (`.bar-nav`, `Menu.scss:169–236`) and the menu
toggle is hidden; under it every destination lives behind the one toggle.

**[CURRENT]** Two JS-only breakpoints: header auto-hide `760px`
(`Menu.astro:283`) and the agenda's switch from the timetable to the list,
`720px` (`NARROW`, `Agenda.tsx:50`), which matches the stylesheet step.

## Z-index & layering

**[MUST]** A new fixed/overlay element joins one of these layers.

| z | Element | Source |
| --- | --- | --- |
| `10060` | a sheet stacked on another sheet (speaker opened from a session) | `SpeakerDetail.module.scss:7` (`--sheet-z`) |
| `10050` | detail sheet (default `--sheet-z`) | `Sheet.module.scss:18` |
| `10001` | fixed site header | `Menu.scss:11` |
| `10001` | `.skip-link` | `BaseLayout.scss:289` |
| `10000` | cookie banner | `CookieBanner.scss:20` |
| `10000` | `.status-bar-cover` (iOS safe-area paint) | `BaseLayout.scss:930` |
| `0`–`4` | in-component ordering only (the header mark at 2 over the open menu panel at 1, `Menu.scss`; on a print, the tape at 2 and the grease stroke at 3, `BaseLayout.scss:440–454`; on the home hero, the shade 1 and the type 3, `index.scss:35–53`; inside the invite scene: plate, `.scene-vignette` 1, film grain 2) | local modules, `BaseLayout.scss:884–905` |
| `-1` | a row's full-bleed reach field / wash, under the row's own content | `BaseLayout.scss:783–860` |

**[MUST] Grain lives on the photograph.** The film grain is
`.scene:has(> .scene-vignette)::before` (`BaseLayout.scss:896`), z `2` inside
the scene, static, `pointer-events: none`: only a scene that carries a
vignetted plate takes it, and the invite page is the one left (the home
hero has a shade, not a vignette; subpages open on type). No page-level
grain or vignette overlay.

**[MUST] A sheet is portalled to `document.body`** (`Sheet.tsx:88–117`)
— any positioned ancestor with a z-index traps it under the header.

**[MUST] A row painting a `z-index: -1` layer needs `isolation: isolate`**
(`BaseLayout.scss:664–665`). A second full-bleed layer uses `::after` —
`--link` / `--holds` own `::before`.

**[MUST] Any full-bleed `::before` on a row is feathered** with
`mask-image: var(--field-feather)` (`BaseLayout.scss:170`, applied `744–745`). The red reach
field is the one exception.

**[MUST] Decorative overlays are `pointer-events: none`** and stay inside
their scene, under its content.

## Motion

**[CURRENT] There are no duration or easing tokens** — every value is written at
its call site. The de-facto scale, by frequency:

| Duration | Where |
| --- | --- |
| `0.2s` (dominant) | the standard control transition: buttons, inputs, links; the text action's colour to `--color-accent-hot` (`BaseLayout.scss:695`, `727`; `_type.scss:105`); a partner mark's opacity on hover (`partners.scss:105–113`); the agenda and session slips' 3px lift (`Agenda.module.scss:166`, `Sessions.module.scss`) |
| `0.18s` | the desktop bar links' colour (`Menu.scss:193`) |
| `0.28s` | the row reach field's colour + opacity fade (`BaseLayout.scss:681`, `691`) |
| `0.3s` | the wash opacity, cookie banner (`BaseLayout.scss:741`, `CookieBanner.scss:24`) |
| `0.32s` | the row pull (`translateX`) and the sheet entry (`BaseLayout.scss:731`, `Sheet.module.scss:23`) |
| `0.6s` | a B&W speaker print developing to colour (`SpeakerTile.module.scss:53`) |
| `0.7s` | the `/team` colour bleed from the cursor (`team.scss:115`) |
| `1.3s` / `1.6s` infinite | loading pulse and skeleton shimmer while data loads (`DataState.module.scss:41`, `55`; the two blank ticket slips, `Tickets.module.scss:259–264`) |

| Easing | Where |
| --- | --- |
| `ease` | the default for control transitions |
| `cubic-bezier(0.16, 1, 0.3, 1)` | the house "arrive" curve — sheet entry, row pull (8 uses) |
| `cubic-bezier(0.22, 1, 0.36, 1)` | the portrait view transition |
| `linear` | shimmer, where any easing would read as a stutter |
| `ease-in-out` | loading pulses |

Rules:

- **[MUST] Every animation and transition has a `prefers-reduced-motion:
  reduce` opt-out**, including `scroll-behavior` (`BaseLayout.scss:229–233`),
  controls (`738–744`), row transitions (`862–868`), sheet
  (`Sheet.module.scss:162`), the speaker print and name
  (`SpeakerTile.module.scss:296–301`), the agenda and session slips, the
  ticket skeleton (`Tickets.module.scss:282–291`).
- **[MUST] No scroll reveal, no per-section entrance.** Sections are simply
  there. The `.reveal` fade-and-rise on every band was removed: the same
  entrance seventeen times spent the page's motion before anything happened.
  **No page-entry animation either: the hero lands still** (the staged
  `fadeInUp` on the hero and the tickets band is gone). Everything moves only
  to show a change (a sheet opening, a row's field). Anything `.js`-gated
  never hides content without that gate.
- **[MUST] One signature motion: a B&W photograph develops to colour.**
  The speaker print develops (`filter` to `none` over `0.6s`) while its
  link or button is focused, or hovered where a pointer hovers
  (`.tile:focus-visible .img` and `.tile:hover .img` under `@media (hover:
  hover)`, `SpeakerTile.module.scss:69–87`); on `/team` the colour bleeds
  from the cursor. Every other print (the subpage print, the home event
  print, the contact sheet and its enlargement, the `/venue` prints) stays
  B&W. With the portrait view transition into a sheet, it is the site's
  only decorative motion. The hero plate is still, and a print's tilt is
  set, never animated.
- **[MUST] Nothing moves on its own.** The ticker band, the hero countdown
  and the home topic rotor are gone (a ticking readout or a cycling word
  under a still poster was the one thing on the page that moved for its own
  sake; the topics are a "Programme" line on the event card). The agenda's
  live dot is static: the "Live now" word carries the state. Nothing
  scrolls, nothing marquees: the contact sheet is still. A text action's
  hover is a colour change to `--color-accent-hot`, nothing slides
  (**[CURRENT]** an agenda or session slip lifts 3px under the pointer; see
  Open points).
- **[MUST] Animate only `opacity` and `transform`.**
- **[MUST] No `translateX` on the red reach field** (`BaseLayout.scss:679`);
  the pull belongs to the wash.
- **[CURRENT]** The grain is static, not animated (`BaseLayout.scss:896`).

## Component states

**[MUST] Hover paints, focus rings.** Never paint the reach field on `:focus`
— it persists after a sheet closes (`BaseLayout.scss:694–701`). **[MUST]
Hover painting sits under `@media (hover: hover)`**: on touch a tap left the
red field painted (`697`, `705`, `722`).

**[MUST] Two controls site-wide, and no third.** Every action is either a
red fill or a Bebas text action; both set in the action voice.
**No arrow glyph anywhere.** The `→` after a link and the `↗` off-site
marker are deleted everywhere (`a.btn-primary::after`, `.action::after`,
the header Tickets, the speaker teaser's arrow column, the `/partners`
contact, the invoice and consent links, the press "Read article", the
footer's `.ext`): a glyph renders differently on every system, and a
destination is told by the label. A link and a button in the same control
look the same. A boxed secondary (the old outlined ghost), an underlined
standalone link or a second filled colour is a third control and does not
ship.

`.btn-primary` (`BaseLayout.scss:669–706`):

| State | Treatment |
| --- | --- |
| rest | `--color-accent` fill, white `--color-text` label via `cta-label` (Bebas `--fs-cta` 24px, tracking 0; see Color), 1px accent border, `--radius`, `1.25rem min(2.8rem, 14vw)` padding (the hero's `.hero-cta` `1rem 2.5rem`; the live ticket slip's Buy `1.1rem min(4rem, 12vw)` at `--fs-card-title`) |
| hover | fill and border → `--color-text`, label → `--color-bg`. No lift, no glow, no shadow |
| focus-visible | `2px solid var(--color-accent-hot)` at `--focus-gap` |
| disabled | not styled globally — see the form buttons below |

`.btn-ghost` / `.action` (`BaseLayout.scss:709–744`): the second control.
Bebas `--fs-action` caps via `action()` (tracking 0, line-height 1) in
`--color-text`, no box, no fill, no underline, no glyph, `border-radius:
0`; padding `0.75rem 0` (vertical only, so the inline edge stays on the
column) with `min-height: 2.75rem` for the 44px target. **Hover and focus
turn the label `--color-accent-hot`** over `0.2s`: the red the site keeps
for a live state, and nothing moves. `.btn-ghost` is kept as the class
name its older callers use (`Closer`, `NextStep`, `DataState`, the cookie
Decline, the ticket slip's "Company pays", the card builders, the
press-kit page); `.action` is the same thing by its new name: the home
"All partners" and "Become a partner", the ticket head's "Request a
company invoice", the `/speakers` "Full agenda", the `/venue` map links,
the `/team` and FAQ inbox links, the `EndLine` link and `SubpageHero`'s
way-across link take the class directly. On paper the text action takes
`--paper-ink`: the ticket slip's "Company pays" draws a red underline on
hover and focus instead of turning red (`Tickets.module.scss:184–203`), the
partnerships card's "Email Filip" sets in paper ink at `--fs-cta`
(`partners.scss:231–235`).

**A filter is a Bebas word, red when on.** The agenda room filter
(`action(--fs-cta)`, `Agenda.module.scss:27–50`) and the session filters
(`action(--fs-action)`, `Sessions.module.scss`) are words in `--ink-soft`,
white under the pointer, `--color-accent-hot` when `aria-pressed`. No box,
no chip.

**[CURRENT] The red fills on a page.** The header Tickets is a red button
at every width (`.header-cta`, `Menu.scss:134–167`: `cta-label` on
`--color-accent`, `--radius`, `padding: 0.3rem 1.1rem 0.1rem`,
`min-height: var(--header-tap)`, inverted on hover), hidden under 380px
(`557–561`) and first in the menu; it is dropped on `/invite/*`. Under it,
each page spends its own: the home hero's "Get tickets" (`.hero-cta`), the
live slip's "Buy", the newsletter submit; a closer's primary; the
`/speakers` "Get tickets"; the press kit's brand-manual download; the
partnership deck. The toggle beside the header Tickets is Bebas with no
box (`.nav-toggle`, `Menu.scss:256–288`; on the home hero's first screen
its border is transparent, `242–249`). See Open points for the count.

The same voice sets every in-island action: the Sheet's `Close`
(`Sheet.module.scss:68–74`), the session filters' "Clear", the speaker
sheet's social links (`SpeakerDetail.module.scss:69–72`, in `--ink-dim` on
a `--rule-strong` underline), the card builders' choose and link buttons.
The newsletter button follows `.btn-primary` on its paper card: white
`cta-label` on red; on hover the fill inverts to `--paper-ink`, since white
would vanish on the card; focus draws a `--paper-ink` ring.

**Live state is a dot and a word.** On an agenda slip "Live now" stays in
`--paper-ink` behind a static 0.5rem red dot, and "Next" in
`--paper-ink-dim`, both mono caps (`.flag`, `Agenda.module.scss:211–232`);
on a break line across the table the word itself is red (`234–238`). The
start time in the gutter turns `--color-accent-hot` while something at it
is live (`.tickLive`, `104–106`); in the phone list the group's time
carries a red "Now HH:MM" (`.groupNow`, `426–430`). No pulse, no ring, no
shadow.

`.field-row` reach states — **[MUST] chosen by whether the row IS the
control**:

| The row | Rest | Hover | Focus |
| --- | --- | --- | --- |
| **IS** the control (`--link`: a speaker row in the session sheet — a real `<button>` / `<a>`) | field at `opacity: 0` | `::before` inset `0 calc(-1 * var(--gutter))`, `--color-accent`, opacity → 1 over `0.28s`; **every** ink goes full black `--on-accent` (`BaseLayout.scss:783–831`) | ring `2px solid --color-accent-hot` at `--focus-gap-tight` (4.8:1); if hovered **and** focused the ring inverts to black — red on red is not a ring |
| **CONTAINS** a control (`--holds`: the `NextStep` rows) | wash at `opacity: 0` | feathered `104deg` white wash → 1, plus `translateX(0.6rem)`; also fires on `:focus-within` (`833–860`) | the inner control carries the ring |

**A slip is the control.** An agenda slip and a session slip are each one
`<button>` that opens the sheet: no reach field; the slip lifts 3px under
the pointer (**[CURRENT]**, see Open points) and focus draws the ring
outside the paper at `--focus-gap-lg` (`Agenda.module.scss:150–178`).

The FAQ `<summary>` sits on its paper slip: a red block under a toggle
stayed lit after a tap. Its reach state is the question and its
"Open"/"Close" marker in `--color-accent` under `(hover: hover)`, and
keyboard focus draws an inset red ring (`outline-offset: -4px`, so it stays
on the slip) plus the same red text (`faq.scss:100–131`).

**[MUST] Red is spent once per list, not once per row.** Resting labels
are muted typewriter notes; step numbers, frame numbers and separators are
muted too (see Color). Exception: the live wave's Buy button.

**[MUST] An open `<details>` opens on its own slip** — no panel, no wash,
no feather inside the paper, only the marker turned to "Close" and the
answer under its question. The answer starts under the question text, not
under its number (`faq.scss:160–163`), so nothing shifts when it opens.

**[MUST] No opacity-based "inactive" state on content** — status is a word,
not a fade. **[CURRENT]** A spent ticket slip's paper is a shade darker
(`filter: brightness(0.93)`, `Tickets.module.scss:105–113`) under its
state word and grease cross.

**[CURRENT] Disabled controls:** the newsletter submit (`disabled` until
consent) is an outlined slot in `--paper-ink-dim` on the card (5.3:1), not
a dimmed red; the invoice submit dims to `opacity: 0.55` only while in
flight (`[aria-disabled='true']`, `InvoiceForm.module.scss:178–179`);
`/partners` marks a not-yet-live deck with `aria-disabled="true"` on a
`<span>` drawn as a dashed paper-ink slot (`.partners-cta-soon`,
`partners.scss:237–253`). See Open points.

**Loading / empty / error [CURRENT]:** skeleton (two blank shimmering slips
in the live layout, `Tickets.module.scss:257–301`, so nothing reflows on
load) or the `DataState.tsx` loading pulse, then content or the shared
`DataState.tsx` `ErrorState`. **[MUST]** Every data-backed page ships a
`.fallback-note` (`BaseLayout.scss:554`) — except `/`, see Open points.

## Forms & errors

Two forms exist: `NewsletterForm` (native POST to SmartEmailing) and
`InvoiceForm` (Firebase callable).

- **[MUST] Control boundary is `--field-border`** at rest (≥3:1;
  `lit-field()` `_controls.scss:15`) on the black ground, `--paper-ink` on
  paper (the newsletter card). Not `--rule`.
- **[MUST] Focus turns the boundary `--color-accent-hot`** **and** keyboard
  focus gets the ring at `--focus-gap-tight` (`_controls.scss:22–31`).
  Never `outline: none` on an input.
- **[MUST] Minimum control height `2.75rem`** (`_controls.scss:13`).
- **[MUST] Error text is `--color-error`** on a `data-tone="error"` element
  reserving `min-height: 1.2em` (`InvoiceForm.module.scss:180–188`).
- **[MUST] Field labels, per-field errors, pending and help lines are
  notes:** `note(--fs-note)` in `--ink-meta` for the label, the error in
  `--color-accent-hot` (`InvoiceForm.module.scss:34–37`, `66–69`;
  `Workshops.module.scss:19–21`, `46–50`, `75–79`). A label is a word, so it
  is never mono.
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
- **The newsletter form is a paper card on the table**
  (`NewsletterForm.module.scss:6–21`): `--paper`, `--paper-ink`, the paper
  shadow, tilted `-1 * --tilt-2` (`-1 * --tilt-1` ≤720px), a typed edge
  ("DevFest.cz" as a note, a mono figure) across its top. The email field is
  a typed line, no box: Special Elite `--fs-lede` on a 2px `--paper-ink`
  underline that turns `--color-accent` on focus, the keyboard ring at
  `--focus-gap`; its label a `note(--fs-note-sm)` in `--paper-ink-dim`. The
  red submit sits beside it and stacks under it ≤500px.
- **[MUST] The consent checkbox is drawn, not native**
  (`NewsletterForm.module.scss:138–180`): `appearance: none`, a 2px border
  in the card's ink (`--box-ink: var(--paper-ink)`), filled with that ink
  and a cut-out tick (`--box-tick: var(--paper)`) when checked; `--radius`
  corners, focus ring at `--focus-gap`. The UA box read as disabled.
- **[MUST] Form and builder pages share one column.** `/invoice`,
  `/workshops`, `/attending`, `/speaker-card` run the standard shell
  (`SubpageHero` → `.band.band--lit` → `.band-inner`); the form or builder
  is capped at `47.5rem` (7 of 12 columns) and sits left on the gutter like
  the hero, never centred (`invoice.scss:3–4`, `Workshops.module.scss:10`,
  `AttendingCard.module.scss:15`). The card builders put their live preview
  beside it on desktop (`7fr` / `5fr`, `AttendingCard.module.scss:3–9`).

## Images & media

- **[MUST] A photograph is a paper print.** `.paper` (`BaseLayout.scss:392–400`)
  is the white border (`--paper`, `0.65rem` on three sides, open at the
  foot for the edge), the paper shadow and a `--tilt`; `.paper-photo`
  (`402–415`) is the black well inside it, its `<img>` covering the well in
  `grayscale(1) contrast(1.1)`; `.paper-edge` (`417–426`) is the margin
  under the photograph: two mono figures (a frame or sheet number, a date
  or a time) at `--fs-label-xs` in `--paper-ink-dim`, pushed apart. A
  `.tape` (`429–448`) overlaps the print's top edge (`top: -0.85rem`,
  z 2) with a typewritten label; alone, a tape labels a group (a partner
  tier, an agenda room, a press-kit variant). The speaker sheet's
  photograph is the one well left outside the darkroom (`.print`, a 4:5
  `--panel-lit` well with `--print-mount`, `BaseLayout.scss:522–532`).
- **[MUST] The portrait well is 4:5**: every speaker print
  (`SpeakerTile.module.scss:44–47`), every `/team` mugshot, the home
  enlargement, the partnerships contact's mug. The opening keynote's print
  is the one exception: two columns by two rows, its photograph taking the
  height the caption leaves (`min-height: 26rem`, `139–157`), back to 4:5
  ≤720px.
- **[CURRENT] Other ratios in use:** `2.39 / 1` the home event print
  (`4 / 3` ≤720px, `index.scss:130–137`, `487–489`); `4 / 3` the subpage
  print (`SubpageHero.scss:70–79`); `3 / 2` the contact-sheet frames and the
  `/contact` press print (`index.scss:295–306`, `press.scss:106–113`); the
  `/venue` prints as their assets come; press-kit previews `16 / 9`
  (`press/downloads.scss:46`); `1` the session sheet's speaker thumb
  (`SessionDetail.module.scss:82`). The home hero has no ratio: `#hero` is
  `min-height: clamp(45rem, 62vw, 56.25rem)` (`47.5rem` ≤720px) and the
  photograph fills its right-hand 74% (`index.scss:17–31`, `441–451`).
- **[MUST] Portraits crop `object-fit: cover`**, the speaker print at
  `object-position: 50% 30%` (`SpeakerTile.module.scss:49–54`), `/team` at
  `50% 28%` (`team.scss:81`), the sheet plate `center 20%`
  (`SpeakerDetail.module.scss:39`).
- **[MUST] The DevFest.cz logo is the official file, never a redraw.**
  `src/assets/logo.png` is `public/press-kit/DF26_logo_white_and_red_dot.png`
  (3000×600, clear space built into the artboard, 2026 badge included);
  share cards on a red band use `src/assets/logo-mono-white.png`
  (`DF26_logo_white.png`), the manual's only version on red. Both mono files
  are pure `#FFFFFF`, alpha as supplied. Never tint, recolour, crop the badge
  or retype the wordmark (manual p. 03–07).
- **[MUST] Nothing dims or covers the logo.** No opacity change on hover or
  focus: keyboard focus draws the ring around the link (`Menu.scss`). No
  darkening overlay over it: the invite OG card composites the logo layer
  after the vignette, so it lands at full white
  (`og/invite/[member].jpg.ts:287–302`).
- **[MUST] Logo minimum: 180px wide for the logo itself** (manual, digital) —
  188–190px for the artboard (header 38px tall = 190px). Never typeset the
  name as a second wordmark. **[CURRENT]** The footer signs off on a typeset
  "DevFest.cz" at `--fs-section` in place of the logo file (see Footer
  anatomy and Open points); the header is the one place the official mark
  shows.
- **[MUST] The header logo never shrinks.** `.brand-logo` is `max-width:
  none` (`Menu.scss:101`); `.brand` is `min-width: max-content`
  (`76–84`) in a flex bar that puts the space between the mark and the
  actions. The bar gives way instead: ≤600px a tighter inset
  (`min(var(--gutter), 3.2vw)`), `0.5rem` / `0.375rem` gaps, a square
  toggle and a narrower Tickets button (`Menu.scss:519–555`); under 380px
  the header Tickets is hidden (`557–561`) and stays the first menu line.
  That is the only way to keep the full logo and an AA-sized CTA label in
  one row at 320 / 360px.
- **[MUST] The standalone symbol is white or dark only** (favicons, app
  icons); never red.
- **[MUST] Partner and press logos are `object-fit: contain`** — never cropped
  (`_logos.scss:12`, `press/downloads.scss:55`).
- **[MUST] Partner marks keep their original colours** (brand manual
  p. 15: the one exception to the three-colour rule). Never recolour,
  flatten to white or tint a partner logo (**[CURRENT]** a linked mark on
  `/partners` drops to `opacity: 0.82` under the pointer,
  `partners.scss:105–113`; see Open points). One recipe for the home wall
  and the `/partners` wall: `partner-logo()` in `src/styles/_logos.scss`.
  `LogoMono` in `src/lib/partners.ts` flags masters made for a light ground
  (`dark`: Dotěkománie, White Whale Media), which sit on a paper card; a
  master that is its own tile (`tile`) is shown as supplied and on
  `/partners` takes the paper shadow; every other master is shown as
  supplied.
- **[MUST] The partner wall draws no tiles of its own.** No cell, no
  border, no lit plate: open marks on the black table. The one paper is the
  dark-ink card: on `/partners` it is `--paper`, `0.75rem 1.1rem` of
  padding, the paper shadow, tilted ±1–1.2deg in turn
  (`partners.scss:84–95`). Each tier is labelled with a strip of tape, not
  a poster head (the `h2` is the `.tape`, the tier name plus an `sr-only`
  "partners", `partners.astro:60–62`; `partners.scss:22–32`), tilts
  alternating. Under it the marks sit in one left-set flex row wrapping
  when it must (`.wall`, `partners.scss:34–42`), except Diamond two to a
  row and Gold three to a row on a grid so the strong sizes line up into
  columns (`44–60`; one and two ≤720px). The tier order is the ladder, then
  Community, then Media.
- **[CURRENT] Rank is the tier's box; marks in a tier carry equal ink.**
  Each tier has a reference box (`CELLS`, `partners.ts:105–112`, px:
  Platinum 600×300, Diamond 330×190, Gold 260×150, Silver 210×120,
  Community and Media 180×100). `partnerLogo()` (`partners.ts:151–157`)
  fits each mark into a box of the same area shaped to its ratio
  (`opticalBox()`, `129`, capped so no mark outgrows the box) and hands
  the width to the stylesheet as `--logo-w`; the `partner-logo` mixin sets
  `width: calc(var(--logo-w) * var(--logo-scale, 1)); height: auto`
  (`_logos.scss:8–14`). No height per tier. `/partners` sets each tier
  larger than its box through `TIER_SCALE` (`partners.astro:29–36`:
  Platinum 1.5, Diamond 1.9, Gold 1.6, Silver 2, Community and Media 1.9),
  passed to `partnerLogo()` so the srcset is cut for the rendered size; on
  a phone Diamond scales by `--logo-scale: 0.7` and Silver, Community and
  Media by `0.6` (`partners.scss:115–141`). `plated` is a per-partner flag,
  not a tier inversion.
- **[CURRENT] The home partner wall** (`index.astro:225–262`,
  `index.scss:330–401`): the `.head-rule` "Partners" with the two text
  actions "All partners" and "Become a partner" in the note's place, then
  one taped row per tier, top tier first: Platinum and Diamond side by side
  on a `5fr / 7fr` grid, Gold and the rest across the page; Silver and
  Community share the last row under one tape ("Silver and community", or
  "Community"), each mark still sized by its own tier; Media on `/partners`
  only. The wall uses the reference boxes as they are (`STRIP_SCALE = 1`,
  `index.astro:58`); each tier's `--logo-scale` sets the rank on this page
  (Platinum 0.85, Diamond 0.9, Gold and Silver 1, Community 1.1; 0.55 to
  0.85 ≤720px, `index.scss:374–379`, `539–543`).
- **[MUST] A missing photograph falls back to initials** at `--ink-monogram` /
  `--ink-monogram-sm` (4.21:1 / 7.71:1, `BaseLayout.scss:157–160`).
- **[MUST] Photography is B&W at high contrast** (manual p. 13). The
  session sheet's speaker thumb rests at `contrast(1.3)`
  (`SessionDetail.module.scss:100`). **[CURRENT]** Every `.paper-photo`
  rests at `grayscale(1) contrast(1.1)` (`BaseLayout.scss:410`), the home
  event print darker at `brightness(0.7)` under its subtitle
  (`index.scss:135`) and the contact-sheet frames at `contrast(1.15)
  brightness(0.9)` (`304`); the session slip avatars at `contrast(1.1)`;
  the speaker-sheet plate and the hero plate at `contrast(1.12)` (see Open
  points). Only the speaker prints and `/team` develop to colour.
- **[MUST] Every `<img>` below the fold is `loading="lazy" decoding="async"`**
  with intrinsic `width`/`height`; above the fold `eager`. Local assets use
  Astro `<Image>` with `layout: 'constrained'`, `responsiveStyles: true`
  (`astro.config.mjs:107–112`).
- **[MUST] Decorative images take `alt=""`** (the contact-sheet frames,
  `index.astro:187–194`; the subpage print and the `/contact` press print,
  both `aria-hidden`; `press/downloads.astro:60`). Where a print repeats
  what a frame already shows, the print carries the description (the home
  enlargement, `index.astro:210–217`).
- **[CURRENT]** Imagery is `.webp`; OG card `.jpg` 1200×630
  (`public/og-image.jpg`: "30 OCT 2026" with only "2026" red, the official
  white red-dot logo, a white CTA label on red). **[MUST]** The detective key
  art, `/hero-detective.webp`, is the home hero's alone (`HeroBackground`,
  `index.astro:76–82`: `width="74%"`, full opacity, `focus="38% 42%"`;
  `#hero .hero-photo` re-masks it to fade in from the left and takes
  `grayscale(1) contrast(1.12) brightness(0.95)`, `index.scss:28–31`; full
  width over the top of the hero ≤720px). `HeroBackground` has no other
  caller. **[MUST] A subpage opens on type with at most one print**: a page
  about the event or a place takes one documentary photograph, graded B&W,
  as a `.paper` print beside its title (`SubpageHero` `plate` and `focus`):
  `/partners` `devfest-2025-01`, `/venue` `uhelny-mlyn-entrance-tower`,
  `/contact` `devfest-2025-03` (all under `public/gallery/`). Every other
  subpage, `/speakers` and `/agenda` included, carries no print: the
  lineup's portraits and the agenda's slips start right under the title.
  Beyond the hero, `/` carries three photographic blocks: the event print
  of the mill (`uhelny-mlyn-chimney`), the speaker prints in the teaser,
  and the "Past editions" contact sheet of eight frames with one enlarged
  (`STRIPS`, `index.astro:40–54`, from `public/gallery/`).

## Component conventions

- **[MUST] Astro for layout and static UI; React islands only for behaviour**
  (`HeroOffer`, `NewsletterForm`, `Speakers`, `SpeakersTeaser`, `Sessions`,
  `Agenda`, `Tickets`, `InvoiceForm`).
- **[CURRENT] `client:load` by default;** `NewsletterForm`
  (`index.astro:272`) and the invite page's island use `client:visible`.
  `Tickets` takes `client:load` (`index.astro:165`): the hero's "Get tickets"
  jumps straight to it. **[MUST] An island that renders nothing until data
  resolves takes `client:load`** — a zero-height placeholder never intersects
  (`SpeakersTeaser`, `index.astro:168`).
- **[MUST] Styling location:** islands import a co-located CSS Module; Astro
  components use a sibling `.scss` or global primitives; pages use
  `src/pages/<page>.scss`.
- **[MUST] Global primitives are used by class name, never copied.**
- **[MUST] Anything on more than one page is a component or a primitive.**
- **[MUST] A measured value is decided once, as a token.**

Primitives, all in `BaseLayout.scss`:

| Class | Line | What it is |
| --- | --- | --- |
| `.u-container` | 346 | centred column at `--maxw` with the page gutter |
| `.page-stack` | 534 | every page's `<main>` |
| `.band` (+ `--lit` 594) / `.band-inner` | 578 / 604 | a section's ground, black; `--lit` is the ground of the form, legal and reference subpages (`/agenda`, `/faq` among them). There is no `--accent` variant |
| `.eyebrow` | 354 | plain typewriter note (`note()`, `--ink-muted`) — no decoration, no trailing hairline, never uppercased; the head of a `NextStepList`, the `/thank-you` calendar stub, a `Closer` eyebrow, the invite alias |
| `.head-rule` (+ `.head-rule-title`, `.head-rule-note`) | 366 | **the section head**: a `<header>` (or `<div>`) with the Bebas `--fs-section` title (`display()`) left and, on the right, at most one note set as `prose(--fs-body-lg, 1.6)` in `--ink-soft` (max `30ch`) or the section's text actions, both sitting on the title's baseline (`align-items: flex-end`); no rule, space closes it (`margin-bottom: clamp(2.5rem, 5vw, 4.5rem)`); wraps on a phone. The class keeps its old name |
| `.paper` | 392 | **a paper print**: `--paper` border (`0.65rem 0.65rem 0`), `--paper-ink`, `--paper-shadow`, `rotate(var(--tilt, 0deg))`; ≤720px the tilt clamps to ±`--tilt-1` (466–470). Also the class of a paper card or slip that carries no photograph (the FAQ slips, the `/venue` and `/contact` index cards, the partnerships card) |
| `.paper-photo` | 402 | the black photograph well inside a print; its `<img>` covers it in `grayscale(1) contrast(1.1)`; the caller sets the ratio |
| `.paper-edge` | 417 | the print's bottom margin: two items pushed apart, `mono(--fs-label-xs, 0.12em, uppercase)` in `--paper-ink-dim` |
| `.tape` (+ `.paper > .tape` 440) | 429 | a strip of tape: `--tape` ground, `note(--fs-note-sm)` in `--paper-ink`, `0.35rem 0.85rem 0.3rem`, a 1px contact shadow, `rotate(var(--tape-tilt, -1.5deg))`. On a print it overlaps the top edge (`top: -0.85rem; left: 1rem`, z 2); alone it labels a group |
| `.grease` | 450 | the red grease pencil: an absolutely placed, `aria-hidden`, `pointer-events: none` SVG at z 3; its `path` is a 3px `--color-accent` stroke, round caps and joins, `non-scaling-stroke`. The caller sets the box and may thicken the stroke (the keynote corners at 7px, 5px ≤720px) |
| `.display` (+ `.red` 483) | 473 | poster headline; `.red` only on the home hero statement (see Structural rules) |
| `.head-split` / `.head-title` / `.head-note` | 489 | two-column section head: statement left, one line right; **no caller** today |
| `.head-stack` | 541 | the one-column section head, closed by space (no hairline); **no caller** today |
| `.print` | 522 | the mounted photograph well at 4:5 (`--panel-lit`, `--print-mount`); the speaker sheet's photograph only |
| `.fallback-note` | 554 | the no-JS / endpoint-down prose |
| `.anchor-target` | 570 | a jump lands on the section head |
| `.closer` family | 612 | the closing statement (see `Closer.astro`), on the black ground |
| `.btn-primary` | 669 | the red fill; white Bebas `cta-label`, no glyph |
| `.btn-ghost` / `.action` | 709 | the text action: Bebas `--fs-action` caps, no box, no underline, no glyph; red on hover (see Component states) |
| `hairline-link()` | `_type.scss:99` | **the in-prose link**, a mixin only (the old `.hairline-link` class is gone): plain `underline` in `--rule-red` at 3px offset, white, lit to `--color-accent-hot` on hover/focus (SC 1.4.1: colour alone does not mark it). **[MUST]** A link inside running text on the black table takes it as is (`privacy-policy.scss:45`, the ticket footnote, the forms' consent lines, the hero facts line's venue link, `index.scss:81–83`, the press-kit footnote); never a red-text variant, red is not running text. On paper an in-prose link is a 1px `--paper-ink` underline (the FAQ answers, `faq.scss:182–193`). A standalone link is an `.action`, never underlined |
| `.field` / `.field-row` (+ `--short` 778, `--link` 783, `--holds` 833) | 754 / 764 | the ruled list and row: `border-bottom: 1px solid var(--rule)` on every row, `--field-step` of vertical padding. Callers: the speaker and session sheets, `NextStep`; `--short` has no caller |
| `.record-status` | 878 | a state word flush right in an action column; **no caller** since the ticket slips state their own |
| `.scene` / `.scene-vignette` | 884 / 885 | a photographed scene: plate, vignette, film grain (`::before`, 896); the invite page. `#hero` keeps the `.scene` class with no vignette |
| `.skip-link` / `.sr-only` | 289 / 332 | see Accessibility; the skip link is set in the action voice |
| `.status-bar-cover` | 930 | iOS safe-area paint |

Shared components: `SubpageHero.astro` (takes `titleHtml`, `lede`,
`seoHeading`, `titleId`, an optional `plate` with its `focus`, and an
optional `link`; `photo` is kept for the callers' sake), `HeroBackground.astro`
(the home hero's plate: a `focus` crop, a `src` plate, default the
detective key art, an opt-in `width` / `size`, the two opacities),
`Closer.astro` (takes an extra `class`; `tone` is accepted for its call
sites and ignored, every closer renders on black), `EndLine.astro`,
`Menu.astro`, `Footer.astro`, `CookieBanner.astro`, `NextStep.astro`,
`NextStepList.astro`, `DataState.tsx`, `SpeakerPhoto.tsx`, `SpeakerTile.tsx`
(the speaker print and `billLineup()`), and `Sheet.module.scss` (the shared
detail-view chrome for `SessionDetail` / `SpeakerDetail`).

- **`SubpageHero.astro`** — every subpage opens on type
  (`SubpageHero.scss`): the title Bebas `--fs-subpage`, `text-wrap:
  balance`, left; beside it the lede, `prose(--fs-body-lg, 1.6)` in
  `--ink-soft` (max `34ch`), and the optional way-across `.action` under it,
  on a `1fr / 24rem` grid aligned to the foot. With a `plate` the lede goes
  under the title and the one print sits in a `21rem` right column (`17rem`
  ≤1100px): a `.paper` with a 4:3 `.paper-photo`, tilted `--tilt-3`, its
  edge "DevFest.cz · 30.10.2026", `aria-hidden` (`SubpageHero.astro:47–54`).
  ≤720px everything stacks and the print takes 70% of the column, set right.
  Its padding is the only clearance under the fixed header; its bottom
  padding (`clamp(3.5rem, 7vw, 6.5rem)`) is the pause before the first
  band, which opens with no top padding of its own (`.subpage-hero + .band`,
  `BaseLayout.scss:600–602`). Compact on purpose: the first content row
  shows without scrolling.

- **`EndLine.astro`** — the last line of a page that asks for no decision,
  in place of a `Closer`: one Special Elite `--fs-lede` line in `--ink-soft`
  and one `.action` (Bebas caps, no glyph, no underline) to the useful
  next step, on one baseline, wrapping under on a phone; `6rem` of air
  above it, inside the last band's inner column (`EndLine.astro`,
  `EndLine.scss`). Ends `/attending`, `/invoice`, `/thank-you`,
  `/newsletter-subscription-thank-you`, `/press/downloads`, `/faq`.
- **`NextStepList.astro`** — the list and its head: a typewriter `.eyebrow` `h2`
  (`label`, `labelId` for the section's `aria-labelledby`), then a `.field`
  `<ul>`, or `<ol>` when `ordered` (a real sequence). Never a poster head:
  the row titles under it are the larger type. `/404` "Try one of these",
  `/thank-you` "Before you go", `/newsletter-subscription-thank-you` "While
  you wait".
- **`NextStep.astro`** — one thing to do, a `.field-row--holds` row inside a
  `NextStepList`. Grid `0.8fr` / `1.2fr`, stacked ≤900px
  (`NextStep.scss:7–12`, `59–63`): left an optional mono `--fs-label-lg`
  index figure in `--ink-faint` (`index`, `01`, visual only — the `<ol>` carries
  the order) over a Bebas `--fs-h3` title; right the Special Elite note
  (`--fs-body`, `--ink`, max `52ch`) with its actions **under** it,
  left-set, ghost by default. The default slot takes media for the step.
- **`DataState.tsx`** (`ErrorState` / `EmptyState`) — left-set; **an empty
  state always offers somewhere to go**.
- **`SpeakerPhoto.tsx`** — no URL or a failed load both land on the monogram;
  caller passes classes for the shape.
- **Speaker print** (`SpeakerTile.tsx`, `SpeakerTile.module.scss`) — every
  speaker is a paper print set down on the table, the same print on `/`
  and on `/speakers`, in running order (`billLineup()`: timed talks by
  start, then room; then untimed talks; then the hosts;
  `SpeakerTile.tsx:70–116`). The whole print is the control (`.paper` on
  the `<a>` or `<button>`): a tape over its top edge naming the room
  ("Host", or "Time to be announced"), the 4:5 B&W portrait, then the
  caption on the paper: the name Bebas `--fs-card-title` (`row-title()`,
  line-height 0.92) in `--paper-ink`, the role (`cleanTagline()`) as a
  `note(--fs-note-sm)` in `--paper-ink-dim` clamped to two lines, the talk
  title as a `note(--fs-note)`, "With …" for co-speakers, and the edge:
  "NN / NN" running number and the CET start, "TBA" or "Host"
  (`SpeakerTile.tsx:153–184`). Tilts cycle `--tilt-2`, `-tilt-1`,
  `--tilt-1`, `-tilt-2` so neighbours never match (`TILTS`, `118`).
  Reached, the name turns `--color-accent` and the portrait develops; focus
  draws the ring at `--focus-gap-lg` (`SpeakerTile.module.scss:26–87`).
  **The opening keynote** (the first timed talk of the day) is the large
  print: two columns by two rows (`grid-column: 1 / 3; grid-row: 1 / 3`),
  its name at `--fs-row`, role at `--fs-note`, talk at `--fs-lede`, the
  tape "Opening keynote, <room>" at `--fs-body-lg`, and red grease corners
  drawn at its four corners (`GREASE_CORNERS`, `SpeakerTile.tsx:120`; `SpeakerTile.module.scss:137–188`). **[MUST] On a
  phone every print is equal**: two columns, the keynote back to one cell
  at 4:5 with the same type as the rest (`218–294`). The grid (`.grid`) is
  four columns (`/speakers`: three ≤1100px; the home teaser stays four),
  two ≤720px, `grid-auto-flow: row dense`, gap `clamp(3.5rem, 5vw, 4.5rem)`
  × `clamp(1.5rem, 2.8vw, 2.5rem)` with `1rem` of top padding for the
  first row's tapes (`9–19`).
- **Speakers teaser** (`SpeakersTeaser`, home) — the first prints of the
  lineup in running order. Head: the `.head-rule` "Speakers" with the note
  "N confirmed. Times in CET." (the count a mono figure); then eight prints
  (`TEASER_SIZE`), the keynote large, each an `<a>` to the speaker; the last
  cell is the way on: the count as a mono `--fs-row-figure` over "All
  speakers" in Bebas `--fs-card-title`, red on hover and focus
  (`SpeakersTeaser.module.scss:19–66`). ≤720px the eighth print is hidden
  so seven and the way on make four even rows of two. No auto-rotation.
  The teaser opens and closes on `--section-y-tight`; nothing renders until
  the lineup resolves (`SpeakersTeaser.tsx:19–62`).
- **Speakers lineup** (`Speakers`, `/speakers`) — every speaker as a print
  on the same grid, each a `<button>` that opens the speaker sheet; the
  pressed print's photograph carries the view transition and morphs into
  the sheet's (`usePortraitMorph`; `SpeakerLineup`, `Speakers.tsx:96–138`).
  The first four prints load eagerly. The last cell takes the rest of the
  row (`--rest-4` / `--rest-3` / `--rest-2`, counting the keynote's four
  cells) and holds the way on: the `.action` "Full agenda" and the red
  "Get tickets". No closer under it. No placeholder print for names still
  to come.
- **Speaker sheet** (`SpeakerDetail`) — opens on the name; no "Speaker"
  kicker above it (the session sheet keeps its "Session" kicker). Bio and
  talk line ragged, no hyphens (see Typography). Links are named Bebas
  `--fs-action` text in `--ink-dim` on a `--rule-strong` underline, lit to
  `--color-accent-hot`: the network's name for a known kind ("LinkedIn",
  "GitHub"), the bare domain for a website; no icons. The accessible name
  says who, what, the host and "opens in a new tab"
  (`SpeakerDetail.tsx:9–31`, `SpeakerDetail.module.scss:56–89`).
- **Sessions** (`Sessions`, "Every talk") — every talk as a paper slip on
  the table, two to a row (one ≤720px), on a `2.25rem × 1.75rem` gap. A
  slip is one `<button>` that opens the session sheet: its edge (time and
  room left, track right, mono caps in `--paper-ink-dim`), the title
  `prose(--fs-body-lg, 1.3)`, three lines of the abstract as
  `prose(--fs-note-sm)` in `--paper-ink-dim`, and at its foot the speakers'
  avatars (30px, paper-ringed, `grayscale(1) contrast(1.1)`, initials
  **under** a lazy or failed photo, `CardAvatars`) beside their names in
  Bebas `--fs-action`. Tilts cycle through fractions of `--tilt-1`. An
  unscheduled talk shows "Time TBA" (plus the room if it has one) where the
  time goes. The programme's open end is a dashed `--field-border` outline
  where the next slips will go, with a note and a `--fs-lede` line in
  `--ink` (`.moreCard`). The filters are Bebas words (see Component
  states).
- **Agenda** (`Agenda`) — the day as slips on the table
  (`Agenda.tsx:25–30`, `Agenda.module.scss`). Over it, a bar: the room
  filter ("All rooms" and each room, Bebas `--fs-cta`, red when pressed)
  left and "All times Prague (CET)" as a note right. **Desktop (>720px)**:
  the rooms are columns under their tapes (`.headTape`, `--fs-note`,
  tilts alternating; a standing note under a tape where a room needs one,
  "Workshops only", "Talks TBA"); a mono `--fs-label-lg` gutter names each
  start time. The grid is **not to scale**: one row per moment something
  starts or ends, each as tall as what sits in it, so a lunch never
  outweighs the talks around it (`AgendaGrid`, `Agenda.tsx:384–473`). Every
  talk is a `.slip` (`150–184`) from its start line to its end line: paper,
  paper ink, the paper shadow, no radius, `0.875rem 1rem 1rem`, tilted by a
  fraction of `--tilt-1` cycled down the day; its edge carries the time
  range and track or length (mono caps `--fs-label-xs` in
  `--paper-ink-dim`), then the title `prose(--fs-body, 1.3)` and the
  speakers in Bebas `--fs-action`, then the live or next flag (see
  Component states). A break or lunch is a quiet typewriter line across
  the rooms, mono time and title in `--ink-soft`; the evening programme
  after the last talk is louder (`--fs-lede`, white) and names its room. A
  speakerless "TBA"/"TBD" slot is "Slot open": a dashed `--field-border`
  outline with its time and a note, not a control (`.open`, `272–286`). A
  speakerless service session running ≥180 minutes in a room (the lounge)
  is open all day: one dark block (`--panel-hover`) down its narrower
  column from start to end, its name and hours sticky as the day scrolls,
  the note "Open all day, drop in any time"; not a control, out of the
  live and coming-up state (`LONG_RUN_MIN`, `ALL_DAY_NOTE`,
  `Agenda.tsx:32–39`; `.allDay`, `Agenda.module.scss:241–269`). One room
  picked, the grid narrows to `44rem`. **Phone (≤720px, JS `NARROW`)**: the
  same day as one list grouped by start time: a mono `--fs-title-sm` time
  head per group (with a red "Now HH:MM" while live), then each slip with
  its room on a tape over its top edge; a break alone at a moment is a
  quiet line with no head; the lounge becomes a slip like the rest
  (`AgendaList`, `Agenda.tsx:486–536`; `Agenda.module.scss:331–440`).
  Abstracts, tags and photos live only in "Every talk" below.
- **Menu** (`Menu.astro`, `Menu.scss`) — the bar is the mark left and the
  actions right (`display: flex; justify-content: space-between`). **At
  ≥1100px the destinations sit in the bar** (`.bar-nav`, `Menu.astro:76–113`):
  Speakers, Agenda, Venue, FAQ in `--color-text`, a short `--rule-strong`
  mark, then Partners, Team, Press and Contact in `--ink-soft`, every link
  Bebas `action()` (**[CURRENT]** at `letter-spacing: 0.08em`), the
  current page in `--color-accent-hot` with `aria-current`, red on hover
  (`Menu.scss:169–236`); then the red Tickets button; the toggle is hidden.
  Under 1100px the toggle and the Tickets button stay and every destination
  lives in the full-screen panel. The header mark link is a full 44px tap
  target and stays over the open panel (z 2). Open, the toggle label reads
  "Close" (`Menu.astro:347`). The open panel is one column of links and no
  picture (`Menu.scss:314–360`): the five primary destinations (Tickets,
  Speakers, Agenda, Venue, FAQ), then the second tier, Partners, Team,
  Press (`/contact#press`) and Contact (`Menu.astro:29–48`). ≥901px the
  primary links set at `--fs-h2` and the second tier at `--fs-h3`
  (`Menu.scss:375–386`).

**Structural rules [MUST]:** no decorated eyebrow; red text is flat; **the
red word and the closing full stop belong to the home hero statement**
(and the invite title). Subpage hero titles carry neither (see the title
list under Voice); every `SubpageHero` title is migrated. Section heads and every `Closer` title
are plain white, because a red final word on ~30 headlines made none of them
the loud one. On `/` the sections open on a `.head-rule` at poster scale:
"The eleventh DevFest.cz" (set a step down at `--fs-display`), "Tickets",
"Speakers", "Past editions", "Partners"; "Newsletter" is a `.display` `h2`
on its own card's column. Space under the head, never a rule. No numbered
eyebrow, no stamp. Headings are literal: no puns.

**[MUST] A head note carries a fact, never a label of the section's own
contents.** The note exists only where it tells the visitor something the
section does not already show: Speakers ("N confirmed. Times in CET."),
Past editions ("Ten editions since 2015."), Tickets (the invoice route:
"Need to pay by bank transfer?" over the `.action` "Request a company
invoice", `Tickets.tsx:279–289`; "Opens with the first wave" before the
first wave), "Every talk" (how to search), "The route" (the train and the
walk), "In the news" (where the press kit is). Partners takes its two text
actions in the note's place; The eleventh DevFest.cz opens on the title
alone. A note that only names what follows is filler and is left off.
Section titles say what the section is; a full stop belongs to a statement,
not a label. Section heads left-set; detail views are full-bleed sheets.

**Each page ends on its one next step.** `Closer.astro` ends a page that
asks for a decision, on the black ground: `/agenda`, `/workshops`,
`/venue`, `/invite/<member>`. `/speakers` ends on the last cell of its
grid ("Full agenda" and "Get tickets"), with no closer. A page that asks
for none ends on an `EndLine` (list above); `/contact` ends on its press
kit (the brand manual's red download and a line to the inbox), `/partners`
on its "Become a partner" block (the title beside the partnerships card),
`/team` on "Want to help next year?" at `--fs-h2` beside the inbox
`.action` (`team.astro`, `.crew-end`), `/404` on its `NextStepList`, and
`/privacy-policy`, `/code-of-conduct` and `/delete-account` on their
content.

**The footer is the open sitemap [MUST].** Under 1100px the menu hides
every destination behind one toggle, and the desktop bar leaves out the
company invoice, the code of conduct and "I'm attending", so `Footer.astro`
lists every page in two groups, *Attend* and *About*, with the menu's
labels. A new route is added to both.

**Footer anatomy [CURRENT]:** the wordmark → five columns → the folio line,
parted by space, never a rule (`Footer.scss:2–13`). The sign-off is
"DevFest.cz" typeset in Bebas at `--fs-section` (line-height 0.8), a link
home that turns red on hover (`.footer-wordmark`, `Footer.astro:75`,
`Footer.scss:22–42`). The columns: the brand (the tagline and the inbox
link), *Attend*, *About*, *Event* (Date, Place as a map link, Format) and
*Organizer* (the GUG.cz line and the social marks), on a `1.4fr` + four
`1fr` grid; two columns with the brand across the top ≤45em, one ≤23.75em
(`44–66`). Column titles and the Event terms are `note(--fs-note-sm)` in
`--ink-meta`, **[CURRENT]** uppercased and tracked `0.14em`; the links are
Bebas `action()` in white at `0.05em`, red on hover (`103–120`); see Open
points. The bottom line: `© 2026 GUG.cz, z.s.` left, the folio `Case no.
DF-2026` centre, "Open source" right as an underlined note, no off-site
glyph. The folio is the case-file mark the manual prints on every page and
the footer's one mono figure: a `<small class="folio" aria-hidden="true">`
at `mono(--fs-label-xs, 0.16em, uppercase)` (`Footer.astro:160`,
`Footer.scss:258–260`); decorative, so it stays out of the accessibility
tree. Ground `--color-bg`.

## Anatomy of a page

**[MUST] A subpage is:** `SubpageHero` → `.band` sections → `Closer` where
the page asks for a decision, otherwise an `EndLine` inside the last band →
`Footer`. No `Ticker` anywhere (it was the same five topics under every
hero, then under the home hero only; now no page renders it). The first
band after the hero opens with no top padding (`.subpage-hero + .band`,
`BaseLayout.scss:600–602`): the hero's bottom padding is the pause, and
neither draws a line between them. The legal pages
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
			<!-- plate="/gallery/<shot>.webp" focus="50% 40%" for the one print -->
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
		<!-- A page that asks for a decision ends on a Closer instead (on black): -->
		<Closer titleHtml={'…'} note="…" actions={[…]} titleId="…" />
	</main>
</BaseLayout>
```

Decision criteria, picked per page:

- **A print or none.** At most one print per subpage, and the detective
  art is the home hero's: `partners`, `venue` and `contact` each take their
  own documentary `plate` and `focus` (list under Images). Every other
  subpage passes no `plate` and opens on type alone (many still pass
  `photo={false}`, which now changes nothing): `speakers` and `agenda`,
  whose content is pictures and slips already, `team`, `faq`, `invoice`,
  `press/downloads`, `workshops`, `attending`, `speaker-card`, `404`, the
  two thank-you pages and the three legal pages.
- **Legal pages.** Inside the lit band a `.policy` reading column, left on
  the gutter, max `70ch`, Special Elite `--fs-body`, `h2` at `--fs-h3`
  (`privacy-policy.scss:6–21`, shared by all three). Data tables stack into
  labelled cards ≤600px: each `td` prints its column head from
  `data-label`, the `thead` is visually hidden but kept for assistive tech
  (`privacy-policy.scss:118–170`).
- **`.band--lit`.** The subpage ground for forms, legal and reference
  pages (`/agenda`, `/faq`, the form and thank-you pages, the legal pages).
  The darkroom pages (`/speakers`, `/venue`) run plain `.band`s, and
  `/partners`, `/contact` and `/team` their own black sections; the
  spotlight is barely visible under the paper either way.
- **No red band.** The accent band variant and its ground token are gone.
  A closer, the `/partners` CTA and the newsletter sit on black; the red on
  such a screen is the button.
- **The first band's head.** **[MUST]** When the hero already names what the
  band holds (`speakers`, `agenda`, `contact`, `team`), the band opens
  straight on its content with an `sr-only` `h2` (or none: `/team`'s
  section is an `aria-label`). A second poster headline under the hero
  ("Who's talking" under "Speakers") says the same thing twice. A visible
  head is for a band the hero does not name: the FAQ categories, "Every
  talk", "The route", "In the news". A `NextStep` field is headed by its
  `NextStepList` typewriter label, not a poster head.
- **A way across** goes in the hero as `SubpageHero link`, an `.action`
  under the lede (`SubpageHero.astro:41–45`), not in a band head: `/agenda`
  "Browse all talks" (`#talks`; `/sessions` now redirects there), `/faq`
  "Get in touch" (`mailto:`).
- **`.head-rule` is the one section head.** A poster name and, at most,
  one fact or the section's actions on its baseline. `.head-split` and
  `.head-stack` have no caller (see Open points).
- **Eyebrows on a `Closer`.** Only when the eyebrow carries a fact the title
  does not (`invite`: "The list closes"). A mood label
  ("Be there", "Join us") above the closing title is filler; leave it off.
- **`/thank-you`, `/newsletter-subscription-thank-you`, `/404`** run
  `SubpageHero photo={false}` → `.band--lit` with a `NextStepList` →
  `EndLine` (not `/404`). `/thank-you` opens the band on the calendar as a
  stub panel (`.event-stub`, `thank-you.scss:6–56`): `--panel-2` at
  `--radius`, the date as a `<time>` at `--fs-h2` under a mono "Put it in
  your calendar" eyebrow, a mono Time / Place list, then "Download .ics"
  (primary) and "Google Calendar" (ghost); three columns, two ≤1100px, one
  ≤700px. Then "Before you go", share and an `@media print` block.
- **`/venue`** (`venue.astro`, `venue.scss`) — three plain `.band`s, then
  the closer. **The address**: a note "Address", the street at
  `--fs-display`, the post code and town as a lede, the opening hours, and
  the two `.action`s "Open in maps" and "Station to venue" at `--fs-cta`,
  beside a print of the mill taped "A converted industrial mill" on a
  `5fr / 7fr` grid. **The route**: the `.head-rule` "The route" with the
  train and the walk as its note, then three **index cards**: `.paper`
  cards without a photograph in an ordered list (`display: contents`, so
  the `<ol>` keeps the order for AT) on a three-column grid (two ≤1100px,
  one ≤720px), each tilted in turn. A card carries its edge as a note and
  a mono "01 / 03", a large mono number (500, `--fs-head`), the Bebas
  `--fs-head` title, `prose(--fs-body)` in paper ink with `strong` place
  names on a faint highlighter, a `<dl>` of facts (Get off, Ride, From /
  Walk, Distance), and a Bebas `--fs-cta` action in paper ink on a 2px
  underline, red on hover (`.venue-go`, `venue.scss:196–216`; see Open
  points); the 25–30 minute ride is ringed in grease. "Flying in" is a fourth card after the list, taped "Not starting
  in Prague?". **The entrance**: a print of the doors taped "The black
  metal building", ringed in grease, beside "The entrance" at
  `--fs-display` and one line. The closer's title sets at `--fs-section`.
- **`/faq`** (`faq.astro`, `faq.scss`) — the category index pinned on the
  left (`position: sticky` under the header; mono number and Bebas
  `--fs-cta` name per category, red on hover and focus; the inbox `.action`
  under it) and the questions on the right, on a `3fr / 9fr` grid (`4fr /
  8fr` ≤1100px). ≤720px the index becomes a wrapped row of Bebas
  `--fs-action` links above the slips and the inbox line drops. Each
  category is a Bebas `--fs-display` head; under it every question is a
  `<details class="paper">` slip, one width, one left edge, tilted
  ±0.4 × `--tilt-1` in turn: "Q nn" as a mono figure, the question as
  `prose(--fs-lede)` in paper ink, an "Open"/"Close" Bebas marker in
  `--paper-ink-dim`; the answer `prose(--fs-body)` under the question text
  (max `62ch`). The page ends on its `EndLine`.
- **`/partners`** (`partners.astro`, `partners.scss`) — the hero with its
  print, then one taped wall per tier (see Images & media), then "Become a
  partner": the `.display` title at `--fs-display` left and the
  partnerships card right on a `5fr / 7fr` grid (one column ≤1100px). The
  card is a `.paper` with a typed edge, the contact's 4:5 mug, a
  `--fs-lede` line, the name in Bebas `--fs-head`, the role as a note, the
  address as an underlined link, then the red "See partnership deck" and
  the paper-ink `.action` "Email Filip".
- **`/contact`** (`contact.astro`, `contact.scss`, `press.scss`) — the hero
  with its print, then the three inboxes as typed **index cards**: the
  general inbox is the large card on the left (`7fr / 5fr`) with its
  address underlined in grease, the partners and speakers inboxes stacked
  beside it, offset and tilted against each other; each card a `.paper`
  with "0n · DevFest.cz" on its edge, a Bebas `--fs-head` title, a line and
  the address. **In the news**: the `.head-rule` with the press-kit note,
  then the clippings as torn paper slips (`clip-path` rag, a drop shadow,
  alternating tilt and offset) beside a past-edition print taped
  "DevFest.cz 2019"; each slip is one link: the outlet and date on the
  edge, the headline and standfirst in mono (Czech diacritics; see Open
  points), "Read article" in Bebas. **Press kit**: the `.display` title,
  a note, the brand manual as the red download (its format and size in
  mono), and beside them one tape per logo variant with its formats as
  Bebas download actions and mono sizes, two columns (one ≤720px); a line
  to the inbox closes it.
- **`/team`** (`team.astro`, `team.scss`) — type-only hero, then every
  member as a print on a four-column grid (three ≤1100px, two ≤720px),
  tilts repeating every four and never past `--tilt-2`: the 4:5 B&W
  mugshot with the colour bleeding from the cursor, the name Bebas
  `--fs-h3`, the role as a note, links as Bebas actions, the edge "NN ·
  DevFest.cz 2026", and the codename on a tape. It ends on "Want to help
  next year?" and the inbox `.action`.
- **`/press/downloads`** — one card per logo variant, not one per file: the
  mark on a 16:9 tile (cream, or `--panel-2` for a light mark), a Bebas
  `--fs-title-sm` name, its formats as mono chips (each a download control
  with the `--field-border` edge, 44px tall); 1 / 2 / 4 columns, separated
  by air. The brand manual, with no preview, is a `--panel-2` row with an
  `--fs-h3` name and a ghost download button
  (`press/downloads.scss:14–145`). The back link is a Bebas action on the
  in-prose underline (`press/downloads.scss:4–11`) and lands on
  `/contact#press` (an `.anchor-target`); **[CURRENT]** its copy still
  carries a `←` ("← In the news", `press/downloads.astro:49`), the one
  arrow glyph left on the site (see Open points).
- **Event facts** live in `src/lib/event.ts` (doors 08:00, keynote 09:00,
  close 19:00, afterparty to 23:00, `dateLabel` / `dateShort`, venue, map,
  `.ics`); every page that states an hour or the date reads them from
  there. Keep in step with the `.ics` in `public/` and the Event JSON-LD in
  `BaseLayout.astro` (`startDate` 09:00, `doorTime` 08:00, `endDate` 19:00,
  `BaseLayout.astro:94–97`).
- **The home page is prints on a black table** (`index.astro`,
  `index.scss`): the hero plate with the statement, the facts and the red
  fill set over it, then five sections on a poster `.head-rule` (The
  eleventh DevFest.cz, Tickets, Speakers, Past editions, Partners) and the
  Newsletter card. No second hero, no numbered eyebrows, nothing that moves
  on its own. Each section is a `.band .sec` and closes on space, no bottom
  padding (`index.scss:101–103`); the next head is the cut. The ticket
  slips and the speakers teaser set their own padding on their roots
  (`Tickets.module.scss:7–18`, `SpeakersTeaser.module.scss:6–11`).
- **The home hero** (`#hero`, `index.astro:75–103`, `index.scss:14–96`):
  `min-height: clamp(45rem, 62vw, 56.25rem)` (`47.5rem` ≤720px), black,
  type at the foot. `HeroBackground` puts the detective art on the right
  74%, fading in from the left; `.hero-shade` lifts the type off it (the
  bar's shade at the top, the left third to black under the statement, the
  foot to black so the page runs on). Set left over it, on the page
  column: the statement (`h1.hero-statement.display` at `--fs-hero`,
  line-height 0.86, max `6.2em`, the red word and the full stop; see
  Typography for its text-shadow); the facts line; the page's red "Get
  tickets" (`.btn-primary.hero-cta`, `padding: 1rem 2.5rem`; full measure
  ≤720px); and, bottom right, the mono frame stamp "Frame 01 · 30.10.2026"
  (`.hero-frame`, `aria-hidden`, hidden ≤720px). No logo in the hero (the
  bar carries the mark), no rotor, no countdown.
- **The facts line** (`.hero-facts`, `index.astro:90–99`, `index.scss:64–83`):
  typewriter `note(--fs-body-lg)` in `--ink-strong`, spaced by gap with no
  separators: the date as a mono `<time>` in white, the venue as a maps
  link on the in-prose underline, and `HeroOffer` — the wave on sale ("Last
  chance" for the final wave), "· until <date>" when it has one, and "from
  <price>" linked to `#tickets`, the price a mono figure
  (`HeroOffer.tsx`, `HeroOffer.module.scss`). ≤720px the facts stack one
  per line.
- **"The eleventh DevFest.cz"** (`index.astro:105–160`, `index.scss:105–215`):
  the `.head-rule` title at `--fs-display`, no note, then on an `8fr / 4fr`
  grid (one column ≤1100px): a widescreen print of the mill (2.39:1, 4:3
  ≤720px) taped "Uhelný mlýn, Libčice nad Vltavou", with the line "One day
  in a converted coal mill 25 minutes north of Prague, for 350 medior and
  senior developers from across CEE." set over the photograph like a
  subtitle, its edge "Frame 02 · 2.39 : 1 · 08:00"; and beside it the back
  of the print, a paper card tilted `--tilt-2` with the edge "On the back ·
  02" and the facts as a `<dl>`: the term a `note(--fs-note-sm)` in
  `--paper-ink-dim`, the value a `note(--fs-body)` — Date (a `<time>`),
  Place, Doors (mono "08:00–20:00"), Audience (the mono "350" ringed in
  grease, "developers"), and **Programme**: the `TOPICS` joined by middle
  dots, the line that replaced the rotor.
- **"Past editions"** (`index.astro:170–223`, `index.scss:217–328`),
  after the speakers teaser: the `.head-rule` "Past editions" with its note
  set beside the title, not across the page; then on a `7fr / 4fr` grid
  (one column ≤720px) the **contact sheet** and the **enlargement**. The
  contact sheet is a dark card (`rgba(255,255,255,0.055)`, tilted
  `-0.6deg`, flat ≤720px) holding two strips of four frames on black with
  sprocket holes along both edges (`radial-gradient`), each frame a 3:2 B&W
  photograph under a mono frame number ("11A", "12" …, running on like a
  roll of film); the hall, frame 12A, is ringed in grease; the sheet's
  foot reads "2015 · 2025". Four across, two ≤720px. The frames are
  decorative (`alt=""`). The enlargement is that frame as a 4:5 paper
  print tilted `--tilt-3`, taped "The big hall", edge "12A · 2025", and it
  carries the description. Nothing scrolls, nothing develops.
- **The partner wall on `/`** — see Images & media.
- **The newsletter** (`index.astro:264–275`, `index.scss:403–425`): two
  equal columns (one ≤720px): left the `.display` "Newsletter" at
  `--fs-display` (`--fs-section` ≤720px, never broken) over a
  `prose(--fs-body-lg)` lede in `--ink` (max `30ch`); right the form as a
  paper card (see Forms).
- **The bar over the home hero.** The mark and the red Tickets stay in the
  bar at every scroll position. At the top of the page the bar's ground is
  the scrim only, and the toggle's border is transparent
  (`Menu.scss:242–249`).
- **The ticket slips** (`Tickets.tsx:128–314`, `Tickets.module.scss`): the
  `.head-rule` "Tickets" with the invoice route as its note ("Need to pay
  by bank transfer?" over the `.action` "Request a company invoice" at
  `--fs-cta`): a quiet side door, never a second red button. Then one
  paper **ticket slip** per wave in a wrapping flex row aligned to the
  foot. **The wave on sale is the big slip** (`flex: 7 1 28rem`, tilted
  `--tilt-1`): the wave name Bebas `--fs-h2`, the price mono 500 at
  `--fs-h2`, the other variant's price as one note line under it
  ("Company funded 1 452 Kč", the figure mono), the state as a
  `note(--fs-body-lg)` in `--paper-ink-dim` ("On sale.", "The final wave,
  on sale.", and the deadline when ti.to set one), a perforation (a row of
  punched holes through to the table, bleeding to both edges), then the
  slip's foot: the VAT line and the mono event date stamp left, the red
  `Buy` at `--fs-card-title` and the paper-ink "Company pays" right. **A
  spent wave** is a small slip (`flex: 5 1 18rem`, max `34rem`) tilted
  `-tilt-3`, its paper a shade darker, its price in `--paper-ink-dim`,
  perforated, its state ("Sold out.", "Ended.") as the note, and crossed
  out corner to corner by the grease pencil. **A wave still to come** is a
  small plain slip tilted `-tilt-1` with its state. ≤720px the slips stack
  full width and the live slip's name and price go to `--fs-display`.
  Under the slips, while a later wave is still to come, the footnote
  (`prose(--fs-body-lg)` in `--ink-meta`, max `70ch`) links the
  newsletter. The skeleton is two blank shimmering slips in the live
  layout.
- **The ticket and invoice facts sit where the decision is.** Each slip
  prints its price once; another variant's price is one data line under
  it ("Company funded 1 452 Kč", a note: it is a sentence with a figure in
  it). The buttons read "Buy" / "Company pays"; their accessible names lead
  with that visible label (WCAG 2.5.3). That is the whole of who-pays on a
  slip: no admission line, no explainer under the buttons. Every price is
  gross, so the tax line is said once, on the live slip's foot. `/invoice`
  names the rate it prices from (no "Estimated"), the 14-day due date
  (`INVOICE_DUE_DAYS`, mirrored in `InvoiceForm.tsx`), that the price holds
  once the invoice is issued, and that one code claims every ticket. Its
  `EndLine` answers invoice questions; it does not send the visitor to card
  checkout.
- **A `<details>` list opens with its first item open** (`faq.astro:103`).
  A section must not reuse the hero's `aria-labelledby` (`landmark-unique`).
- **`Closer` ground.** Every closer renders on the black `.band`
  (`Closer.astro`); the `tone` prop is accepted for its call sites and
  changes nothing. A `Closer` ends a page that asks for a decision
  (buy, register, come); a reference page ends on an `EndLine` (`/faq`:
  "Still stuck?" and a `mailto:` link) or on its content (`privacy-policy`,
  `code-of-conduct`, `delete-account`).
- **`/faq` content.** The detective-theme question sits in Essentials
  (`src/content/faq.json`).
- **`/venue` links.** Both map links ("Open in maps", "Station to venue")
  are text actions, by the address and again on the route cards: two ways
  to the same place are not two decisions; the page's red is the closer's
  button.

**[MUST] The darkroom's rules for a new surface.** A photograph is a
`.paper` print with a `.paper-edge`; a fact that travels with it (a ticket,
a talk, an inbox, a question) is a paper slip or card in the same paper and
ink. A tape labels; a grease stroke marks one thing per section. Prints
tilt, by a fraction or a step of `--tilt-*`, alternating so neighbours
never match, and never past `--tilt-3`. On a phone every print is equal
and barely tilted. Type on paper is `--paper-ink` / `--paper-ink-dim`;
red on paper is a stroke, a dot or a button, not small text.

## Iconography

**[MUST] No icon library.** The only inline `<svg>` elements are the
`Footer.astro` social marks, each `aria-hidden="true"` beside a visible text
link. Don't add an icon package for a UI glyph. Speaker-sheet links are
named text, not network glyphs (`SPEAKER_ICON_PATHS` is deleted): three
identical chain icons told the visitor nothing.

**[MUST] No arrow glyphs.** The trailing `→` on links, the `↗` off-site
marker and the teaser's arrow column are deleted (see Component states): a
glyph renders differently on every system and the label already names the
destination. The one text glyph left is the Sheet's `Close ✕`. No emoji in
UI copy.

## Voice

**[CURRENT]** Inferred from existing copy:

- Word-labels are typewriter notes: one to three words, sentence case, no
  tracking, never uppercased (`note()` sets `text-transform: none`). Bebas
  uppercases headlines and actions by CSS. Never type caps — screen readers
  read them as shouting.
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
that", and at most one closer line per page ("Doors open 30 October.",
"See you on the 30th."). Every section title and page title says plainly
what it is ("The eleventh DevFest.cz", "Tickets", "Speakers", "Past
editions", "Partners", "Newsletter", "Agenda", "Every talk", "The route",
"The team", "Questions", "In the news", "Press kit", "Become a partner");
a `.head-rule` note is a fact or absent ("N confirmed. Times in CET.",
"Ten editions since 2015."). The case dressing is the darkroom's own: the
frame numbers and dates on a print's edge, the hero's "Frame 01" stamp,
and the footer's folio. No triads, no em-dash chains, no hype words.

**[CURRENT] Subpage titles** (`SubpageHero titleHtml`): `/speakers`
"Speakers", `/partners` "Partners", `/team` "The team", `/faq` "Questions",
`/agenda` "Agenda", `/venue` "Getting there", `/contact`
"Contact", `/press/downloads` "Logos & assets", `/invoice` "Buy on a
company invoice", `/workshops` "Save your seat at a workshop", `/attending`
"I'm attending", `/speaker-card` "I'm speaking", `/thank-you` "You're in",
`/newsletter-subscription-thank-you` "You're on the list", `/404` "Nothing
filed under that", `/privacy-policy` "Privacy Policy", `/code-of-conduct`
"Code of Conduct", `/delete-account` "Delete your app account". Closers:
"Doors open 30 October." (`/agenda`), "No ticket yet?" (`/workshops`), "See you on the 30th."
(`/venue`), "Take the ticket." (`/invite/<member>`); the `/partners` CTA is
"Become a partner".

## Accessibility

`npm run a11y` (`scripts/a11y.mjs`) builds with `A11Y_MOCK=1` and runs axe
over 15 routes at desktop and 375×812, plus inside opened `[role="dialog"]`
sheets. Tags: `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`.

**[MUST] Zero violations.** Run it before a PR touching markup or styles.

- **[MUST] Contrast.** Body 1.4.3; boundaries and focus rings ≥3:1 (1.4.11).
  `--field-border` for control boundaries on black, `--paper-ink` on
  paper, `--color-error` for error prose. On paper, small text is
  `--paper-ink` or `--paper-ink-dim` (5.3:1), never red (see Color).
  Don't dim ink on red; change size.
- **[MUST] Focus is always visible:** `:focus-visible { outline: 2px solid
  var(--color-accent-hot) }`. Gap by how much edge the control has:
  `--focus-gap-tight` (own boundary), `--focus-gap` (type on ground),
  `--focus-gap-lg` (alone in space) (`BaseLayout.scss:138–142`); a whole
  print, slip or card that is the control rings outside its paper at
  `--focus-gap-lg`. Commented exceptions: the FAQ question's inset ring
  (`outline-offset: -4px`, `faq.scss:114–118`), a clipping's inset ring
  (`-0.6rem`, the `clip-path` cuts an outer one, `press.scss:61–64`), the
  newsletter submit's `--paper-ink` ring on its card, and a partner logo's
  wider `6px` gap on the home wall and `/partners` (`index.scss:397–400`,
  `partners.scss:97–102`).
- **[MUST] Semantics before ARIA.** A row that IS a control is a real
  `<button>` / `<a>` / `<summary>`.
- **[MUST] `.skip-link` is the first focusable element** (`BaseLayout.astro:332`,
  `BaseLayout.scss:289–321`). `html { scroll-padding-top: calc(var(--header-h)
  + 1.5rem); scroll-padding-bottom: 8rem }` keeps targets clear of header and banner.
  `#main-content` has `tabindex="-1"` so `Enter` moves focus, not just the
  fragment; its ring alone is suppressed.
- **[MUST] The cookie banner is second in the DOM**, `Escape` handler on
  `document` (`CookieBanner.astro:89–93`).
- **[MUST] Nothing moves on its own (2.2.2 by construction).** The topic
  rotor is gone; the only loops are the loading skeleton and pulse, both
  stopped under reduced motion.
- **[MUST] Header controls are 44px tap targets.** The mark link and the
  bar's controls and the desktop bar links take `min-height:
  var(--header-tap)` (`Menu.scss:83`, `149`, `189`, `267`); the text
  actions take `min-height: 2.75rem` (`BaseLayout.scss:709–736`).
- **[MUST] A white label on red is large text or it does not ship.** The
  `cta-label` size (Bebas 24px, regular large text) is the AA floor (see
  Color); where it does not fit, the
  control moves (the header Tickets into the menu under 380px), the label
  never shrinks.
- **[MUST] `.sr-only`** for text in the a11y tree but off screen
  (`BaseLayout.scss:332`).
- **[MUST] A grease stroke is `aria-hidden`**, and so is a decorative
  print (the subpage print, the `/contact` press print). **[CURRENT]** Most
  paper edges are `aria-hidden` too (the home prints, the `/contact` and
  `/team` cards, an agenda slip's room tape); the speaker print's tape and
  edge are read as part of its link or button. A tape that names a group
  is real text (the `/partners` tier `h2`, the agenda room heads).
- **[MUST] Sheets return focus** to the opening row (`src/lib/useReturnFocus.ts`)
  and close on Esc.
- **[MUST] Reduced motion** — see Motion.
- **[MUST] `html { overflow-x: clip }`, never `hidden`** — `hidden` makes
  `html` a scroll container on iOS Safari and breaks `position: fixed` and
  safe-area `env()` (`BaseLayout.scss:222–226`).

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
   `aria-disabled` `<span>` (`partners.astro`, the deck slot), and a
   spent ticket slip's state note under a grease cross; `.record-status`
   has no caller left. Delete it or give it the slips' state.
5. **No `aria-invalid` in `src`.** Errors go through one `aria-live` region.
   Acceptable for two forms, but should be a stated decision.
6. **Orphaned token.** `--fs-title-compact` (`BaseLayout.scss:72`) has no
   `var()` caller. Delete it or give it one.
7. **`min-width` queries** against a max-width convention: `1100px` ×2
   (the inline nav, `Menu.scss:223`; `press/downloads.scss:30`), `901px` ×1
   (`Menu.scss:375`), `601px` ×1 (`invite/member.scss:164`), `640px` ×1
   (`press/downloads.scss:26`).
8. **JS-only breakpoint:** the header's `760px` auto-hide
   (`Menu.astro:283`) matches no stylesheet query. The agenda's switch is
   `720px` in JS and CSS alike.
9. ~~**Special Elite declares no `subsets`**~~ Resolved: Latin-Ext letters
   fall to JetBrains Mono via the Fonts API `fallbacks` (see Typography).
10. **Split with `CLAUDE.md`.** Rules live here; `CLAUDE.md` points here.
    Nothing enforces it.
11. ~~**`Closer` default `tone="raised"` renders `band--raised`, which has
    no CSS.**~~ Resolved: `Closer.astro` renders every tone on the black
    `.band`; the prop is kept for its call sites and ignored.
12. **The font-size ramp is [MUST] but broken at ~25 call sites:**
    literals in `Menu.scss` (the short-viewport nav steps),
    `AttendingCard.module.scss`, `invite/member.scss`, relative sizes
    (`.fig` at `0.86em` on `/` and `/venue`, the teaser count at `1em`),
    and inherited ones in the footer's bottom line. The same claim in
    `BaseLayout.scss:82` is equally untrue. Fold into the ramp or downgrade
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
    deleted.
17. ~~**One section head still carries a full stop:** the final-wave
    title.~~ Resolved: the ticket section has no poster head; the final
    wave is a note under the numbered eyebrow.
18. ~~**"Closer only where the page asks for a decision" is not applied
    yet.**~~ Resolved: `EndLine` ends the reference pages, `/contact` ends
    on its press kit; `Closer` stays on `agenda`, `workshops`, `venue`,
    `invite`.
19. ~~**Glow remnants against "No glow anywhere".**~~ Resolved: the agenda
    live dot is static, the now line and live cell carry no shadow, the
    newsletter button has no shadow on either ground, and an open FAQ item
    is a flat `--panel-lit`.
20. **Partner mono modes are a filename map.** `LOGO_MONO`
    (`src/lib/partners.ts:22–27`) picks `tile` / `dark` / `colour` by master
    filename; it belongs in the `partners` collection schema
    (`content.config.ts`) as a per-partner field.
21. ~~**`.hairline-link` has no markup caller.**~~ Resolved: the class is
    deleted; standalone links are `.action` (`EndLine`, `SubpageHero`, the
    home walls) and the mixin is the in-prose link only.
22. **Dark-ink partner masters sit on a paper card.** Dotěkománie and White
    Whale Media only ship dark-ink artwork; light versions would let them
    drop the card. `LogoMono` is keyed by filename and belongs as a field
    in the partners schema.
23. ~~**Canvas drift.**~~ Moot: the Pencil canvas left the repo in #473;
    `docs/design.md` and `.impeccable/design.json` are the only design
    record (`.claude/rules/design.md`).
24. ~~**Full-width flat red bands are not an approved large red area.**~~
    Resolved: there is no red band. The accent band variant and its ground token
    are deleted (`BaseLayout.scss:501–504`); every `Closer`, the
    `/partners` CTA and the newsletter sit on black.
28. **The attending card still draws a red band** with a black radial of
    its own (`src/lib/attending-card.ts`), the one red ground left now the
    site has none. Decide whether the generated card follows the site.
27. **Photo contrast is mixed.** The prints rest at `contrast(1.1)`
    (`BaseLayout.scss:410`), the contact-sheet frames at `1.15`, the
    speaker sheet (`SpeakerDetail.module.scss:40`) and the hero plate
    (`index.scss:29`) at `1.12`, the session sheet thumb at `1.3`. Manual
    p. 13 asks for high contrast and also allows speaker portraits in
    colour on black.
29. **`.head-stack` and `.head-split` have no caller**
    (`BaseLayout.scss:489–520`, `541–552`): the poster `.head-rule` is the
    one section head. Delete both primitives.
30. **Two `text-shadow`s on photographs** against the Bebas rule's "no
    text-shadow": the home statement (`index.scss:61`) and the subtitle
    set over the home event print (`index.scss:151`), legibility lifts for
    white type on a photograph with no scrim. Decide whether a shade or a
    darker grade replaces them, or state the exception in the rule.
31. **`.btn-ghost` is a stale name.** It draws the text action but every
    caller still says "ghost", and the `--field-border` comment in
    `BaseLayout.scss:101–106` and `CookieBanner.scss:64–68` still describe
    the outlined box it used to be. Rename the callers to `.action` and
    fix the comments.
32. ~~The cookie buttons track a Bebas label.~~ Done: the `letter-spacing` line is gone.
33. ~~One arrow glyph left.~~ Done: the press-kit back link reads "Back to In the news".
34. **`Desk.scss` is orphaned.** `Desk.astro` is deleted and nothing
    imports `src/components/Desk.scss`. Delete the file.
35. ~~JetBrains Mono 700 is loaded with no caller.~~ Done: the Fonts API entry loads 400 and 500.
36. ~~The header stamp is unrecorded elsewhere.~~ Done: the stamp is gone;
    the bar is the mark, the inline links (≥1100px) and the Tickets button.
37. **More than one red fill on a page.** The header Tickets is now a red
    button on every page (`Menu.scss:134–167`), so `/` carries the header's,
    the hero's "Get tickets", the live slip's "Buy" and the newsletter
    submit; `/speakers` the header's and its own "Get tickets". The ticket
    slips also spend a grease cross per spent wave beside the red Buy.
    Decide whether "one red fill per page" becomes "one per screen" (or
    "the header plus one"), and whether a spent wave's cross counts as the
    list's red mark.
38. **The darkroom bends the type rules.** Words set in mono, uppercased:
    the `.paper-edge` labels ("DevFest.cz", "Frame 02", "The entrance"),
    the agenda and session slip edges, the agenda "Live now" / "Next"
    flags and "Now", the hero "Frame 01 · 30.10.2026" stamp and the
    footer folio, at `0.12`–`0.16em`; the clipping headlines and
    standfirsts are whole sentences in mono for their Czech letters
    (`press.scss:71–90`). Bebas with tracking: the desktop bar links
    (`0.08em`, `Menu.scss:186`) and the footer links (`0.05em`,
    `Footer.scss:105`). Notes uppercased and tracked: the footer column
    titles and Event terms (`Footer.scss:74–81`, `133–138`). Mono with
    negative tracking and weight 500: the ticket slip price (`-0.03em`,
    `Tickets.module.scss:65–73`) and the `/venue` card numbers (`-0.02em`,
    `venue.scss:148–156`). Speaker names in Bebas on the agenda and session
    slips (`action()`), where manual p. 11 sets them in Special Elite.
    Either move each back to its voice or write the darkroom exceptions
    into Typography.
39. **The footer typesets the name.** `.footer-wordmark` sets "DevFest.cz"
    in Bebas at `--fs-section` in place of the official logo file, against
    "never typeset the name as a second wordmark" (manual p. 03–07).
    Decide whether the sign-off is the logo file at poster scale or a
    recorded exception.
40. **Motion and dimming the rules forbid.** The agenda and session slips
    lift 3px under the pointer (`translate`, `Agenda.module.scss:166–178`,
    `Sessions.module.scss`), against "nothing slides" and "no lift on a
    hover"; a linked partner mark on `/partners` drops to `opacity: 0.82`
    under the pointer (`partners.scss:105–113`), against "never dim a
    partner logo". Decide whether the darkroom allows a lift, and replace
    the dim with a ring or nothing.
41. **Red text on paper.** `#F11000` on `--paper` is about 3.8:1. The FAQ
    question and marker turn red on hover and focus at `--fs-lede` /
    `--fs-action` (`faq.scss:120–131`), and so do a FAQ answer link and the
    partnerships address on hover (`faq.scss:189–192`,
    `partners.scss:218–220`): below the large-text line at most widths.
    Move the reach state to an underline or a dot, as the agenda flag and
    the slip's "Company pays" do.
42. **The section heads outrank the home statement.** `--fs-section` caps
    at 12.5rem, the home statement at `--fs-hero` 8.5rem; and a page now
    carries several `--fs-display` titles (on `/`: the event title and
    "Newsletter"; on `/venue`: the address and "The entrance"). Decide
    whether the poster weight on `/` belongs to the hero or the section
    heads, and drop "one `--fs-display` per page" or rename the step.
43. **Two stray edges.** The agenda lounge block keeps a 3px `--paper` edge
    down its left side (`Agenda.module.scss:245`), against "no edge down a
    block's left side"; the `/venue` route actions are Bebas on a 2px
    underline (`venue.scss:196–216`), a third look for a text action.
    Drop the edge; make the route actions `.action`s in paper ink.
