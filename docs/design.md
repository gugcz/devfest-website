---
name: DevFest.cz 2027
description: The aether. A dark painted sky of smoke, turning sigil rings and circuit traces behind one logo; ivory type in one system sans, brass ink for ornament and labels, and a cold aether light that appears only when something is hovered, focused or lit by the painting. One solid portal per screen.
colors:
  ink: "#05090f"
  ink-veil: "rgba(5, 9, 15, 0.9)"
  plate: "rgba(6, 16, 22, 0.86)"
  print-edge: "rgba(207, 168, 98, 0.5)"
  print-plate: "rgba(5, 9, 15, 0.6)"
  ivory: "#f6ecd6"
  ivory-text: "rgba(246, 236, 214, 0.9)"
  ivory-muted: "#c9c0ad"
  brass: "#cfa862"
  brass-light: "#fbf1da"
  brass-deep: "#d9b26a"
  rule: "rgba(207, 168, 98, 0.22)"
  rule-strong: "rgba(207, 168, 98, 0.4)"
  field-border: "rgba(207, 168, 98, 0.7)"
  aether: "#74ebe0"
typography:
  display:
    fontFamily: "Avenir Next, Segoe UI Variable Display, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(2.5rem, 1.6rem + 3.6vw, 4.5rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Avenir Next, Segoe UI Variable Display, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1.75rem, 1.3rem + 1.8vw, 2.75rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  label:
    fontFamily: "Avenir Next, Segoe UI Variable Display, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.90625rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.24em"
  label-sm:
    fontFamily: "Avenir Next, Segoe UI Variable Display, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.22em"
  action:
    fontFamily: "Avenir Next, Segoe UI Variable Display, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.18em"
  stage-line:
    fontFamily: "Avenir Next, Segoe UI Variable Display, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(0.72rem, 0.66rem + 0.3vw, 0.84rem)"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.28em"
  figure:
    fontFamily: "Avenir Next, Segoe UI Variable Display, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(2.75rem, 1.75rem + 4.5vw, 5rem)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.02em"
    fontFeature: "lnum, tnum"
  lead:
    fontFamily: "Avenir Next, Segoe UI Variable Display, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1.25rem, 1.05rem + 0.9vw, 1.75rem)"
    fontWeight: 500
    lineHeight: 1.45
  row-title:
    fontFamily: "Avenir Next, Segoe UI Variable Display, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1.15rem, 1rem + 0.6vw, 1.45rem)"
    fontWeight: 600
    lineHeight: 1.3
  fact:
    fontFamily: "Avenir Next, Segoe UI Variable Display, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
  body:
    fontFamily: "Avenir Next, Segoe UI Variable Display, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  small:
    fontFamily: "Avenir Next, Segoe UI Variable Display, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.55
rounded:
  none: "0"
spacing:
  gutter: "max(min(clamp(1.5rem, 5vw, 4.5rem), 6.25vw), env(safe-area-inset-left), env(safe-area-inset-right))"
  measure: "40rem"
  maxw: "76rem"
  section: "clamp(4.5rem, 3rem + 7vw, 9rem)"
  section-tight: "clamp(3.5rem, 2.5rem + 4vw, 6rem)"
  stage-gap: "clamp(20px, 4.2vh, 44px)"
  header-h: "calc(0.85rem * 2 + 44px)"
components:
  portal-solid:
    backgroundColor: "{colors.brass}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    width: "280px"
    height: "62px"
  portal-solid-hover:
    backgroundColor: "{colors.aether}"
    textColor: "{colors.ink}"
  portal-framed:
    backgroundColor: "{colors.plate}"
    textColor: "{colors.ivory}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    width: "280px"
    height: "62px"
  portal-framed-hover:
    textColor: "{colors.brass-light}"
  action:
    textColor: "{colors.ivory}"
    typography: "{typography.action}"
    height: "2.75rem"
  action-hover:
    textColor: "{colors.brass-light}"
  rubric:
    textColor: "{colors.brass}"
    typography: "{typography.label}"
  plate:
    backgroundColor: "{colors.plate}"
    textColor: "{colors.ivory}"
    rounded: "{rounded.none}"
    padding: "0.4rem 0.4rem 0"
  print:
    backgroundColor: "rgba(5, 9, 15, 0.6)"
    padding: "6px"
  fact-term:
    textColor: "{colors.brass}"
    typography: "{typography.label-sm}"
  fact-value:
    textColor: "{colors.ivory}"
    typography: "{typography.fact}"
  figure:
    textColor: "{colors.brass-light}"
    typography: "{typography.figure}"
  lead:
    textColor: "{colors.ivory}"
    typography: "{typography.lead}"
  field:
    backgroundColor: "rgba(5, 9, 15, 0.7)"
    textColor: "{colors.ivory}"
    typography: "{typography.body}"
    padding: "0.75rem 1rem"
    height: "3.25rem"
  cookie-slip:
    backgroundColor: "{colors.ink-veil}"
    textColor: "{colors.ivory}"
    typography: "{typography.small}"
    padding: "1.25rem 1.4rem"
  menu-bar:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ivory}"
    typography: "{typography.action}"
    height: "{spacing.header-h}"
  footer:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ivory-text}"
    typography: "{typography.action}"
---

# Design System: DevFest.cz 2027

> **Scope.** This record governs every live page of devfest.cz: all of
> them render through `BaseLayout.astro`, which carries the aether.
> [`docs/design-2026.md`](design-2026.md) binds only the frozen archive
> (`archive/2026/`, never restyled) and the flagged surfaces not yet
> reskinned: the lineup pages (`/agenda`, `/speakers`, the share pages,
> `/tv`) and the tickets, invoice, workshops, invite, attending/speaker-card,
> partners-page and venue surfaces. **[MUST]** None of those flags is turned
> on until its surface is reskinned to this record.

Every value here was read out of the shipped code. Rules are labelled
**[MUST]** (binding: a PR that breaks it is sent back) or **[CURRENT]** (the
state of the code today; changing it is a normal design decision).

| Where | What |
| --- | --- |
| `src/layouts/BaseLayout.scss` | every token on `:root` (the aether palette, then role aliases under the 2026 names: `--color-*`, `--paper*`, `--ink-*`, `--fs-*`); the body ground, links, focus, selection; the primitives (`.btn-primary`, `.btn-framed`, `.action`/`.btn-ghost`, `.head-rule`, `.paper`, `.paper-photo`, `.tape`, `.band`, `.closer`, `.display`) |
| `src/styles/_aether.scss` | the recipes: `label()`, `bevel()`, `focus-ring()`, `rubric` |
| `src/styles/_type.scss` | the 2026 mixin names (`note`, `action`, `mono`, `display`, `row-title`, `prose`, `hairline-link`, `paper-action`), each set in the aether's one sans |
| `src/layouts/BaseLayout.astro` | the shared SVG defs: the `aether-ink` tremor filter and the `aether-brass` lettering gradient |
| `src/components/aether/` | the canvas, the season mark, the portal, the cookie slip |
| `src/components/` | `Menu`, `Footer`, `SubpageHero`, `EndLine`, `NextStep`, `Closer`, `NewsletterForm` in the aether |
| `src/lib/aether/` | the WebGL painting (`index.ts` loop, `shader.ts`, `textures.ts`) |
| `src/pages/index.scss` | the home page: the stage, the veil, the bands |

Components read the role aliases (`--color-accent` is brass,
`--color-accent-hot` is aether, `--paper` is the plate); new code may use
either name, never a literal the tokens already hold.

## Overview

**Creative North Star: "The Aether"**

The site is a painting first. On the home page a slow WebGL sky of dark
petrol smoke, warm plum and rust turns behind the logo: three sigil rings,
circuit traces running to the edges, embers, a hatched, inked vignette. On
it sits a single, centred stage: the DF27 logo, the season lettered in brass
ink, one tracked line, and the portals. Every other page stands on the same
palette as a still ground (three radial gradients over ink) and opens on a
centred title.

Below the stage, and on every subpage, a veil darkens the ground to
near-black and the page becomes quiet centred columns: brass rubric
headings between inked rules, a large ivory lead, facts and figures,
square ink plates edged in faint brass, photographs in thin brass frames.
The materials are few and old-world (ink, ivory, brass), and the one modern
element, the cold aether light, is spent only on response: hover, focus,
and the painting's own glow.

**Key Characteristics:**
- An ink ground under a painting; text lives on the veil, not on the paint.
- Ivory type in one system sans; brass for ornament, labels and figures.
- The aether light (cyan) means "this responds"; it never decorates at rest.
- A beveled, eight-sided brass portal is the button; one solid portal per screen.
- Inked, slightly trembling strokes (the `aether-ink` tremor) on every drawn line.
- Centred and symmetric; content that repeats sits on plates, not cards.

## Colors

A night palette: blue-black ink, warm ivory, aged brass, and one cold light.

### Primary
- **Aged Brass** (`brass`): the ornament and the label voice. Rubric
  headings and their rules, fact terms, footer titles, form labels, the
  current page in the menu, the framed portal's strokes and arrow, link
  underlines, print frames, the checked consent box, the solid portal's
  fill. 8.96:1 on ink.
- **Brass Light** (`brass-light`) and **Brass Deep** (`brass-deep`): the two
  stops of the lettering gradient (`aether-brass`) used by the season mark.
  Brass Light is also the figures, the accent word in a headline, the solid
  portal's outer stroke and the link hover text (17.77:1); Brass Deep draws
  the inked rules and diamonds (10.0:1).

### Tertiary
- **Aether Light** (`aether`): the cold light. A portal's fill or strokes on
  hover and focus, every focus ring, selected text, a menu or footer link
  on hover, a link underline on hover, and the painting's glow. 13.97:1 on
  ink.

### Neutral
- **Night Ink** (`ink`): the ground, the menu bar once scrolled, the footer,
  the theme colour, the text on a brass or aether fill.
- **Ink Veil** (`ink-veil`, ink at 90%): the ground of every band, the end of
  a subpage hero's fade, the cookie slip.
- **Plate** (`plate`, `--paper`): the dark petrol ink of a plate and of the
  framed portal.
- **Ivory** (`ivory`): headings, leads, fact values, body, links. 17.0:1 on
  ink. **Ivory Text** (`ivory-text`, `--ink-text`, 90%): the footer's running text.
- **Muted Ivory** (`ivory-muted`, every `--ink-*` step below text): secondary
  text: the stage line, notes, ledes, consent copy. 11.05:1 on ink.

Brass at an alpha over ink draws every line: `rule` (22%) a plate's edge,
`rule-strong` (40%) a stronger divider, 45% the cookie slip, 50% a print
frame, and `field-border` (70%, 4.76:1, above the 3:1 non-text floor) a
control boundary.

### Named Rules
**[MUST] The Cold Light Rule.** The aether colour is a response, never a
resting colour: hover, focus, selected text, a field a failed submit
points at, and the painting's glow only. A control at rest is ivory and
brass; it turns aether when the visitor reaches it.

**[MUST] The Three Materials Rule.** Ink, ivory and brass carry everything
at rest. No new hue enters the page chrome; the painting's petrol, plum and
rust stay inside the canvas and the root's gradients.

## Typography

**Display Font:** none as a face. The logo (`public/df27-logo.svg`) and the
drawn season are the display; headlines are the body sans at weight 600.
**Body Font:** one system sans stack (`--font-sans`): Avenir Next, Segoe UI
Variable Display, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif.
**Label/Mono Font:** the same stack; the label voice for captions, lining
tabular numerals (`mono()`) for figures.

**Character:** a clean humanist sans that recedes behind the painting and
the brass; hierarchy comes from size, weight and tracking, not from faces.

### Hierarchy
- **Display** (600, `display`, 1.1, -0.01em, balanced): a subpage's title
  (`--fs-subpage`), centred; an accent word in brass light.
- **Headline** (600, `headline`, `--fs-h2`): a closer's title, a band's own
  heading where a rubric is not enough.
- **Figure** (600, `figure`, 1, -0.02em, lining tabular numerals): the last
  edition in figures, in brass light.
- **Lead** (500, `lead`, 1.45, balanced): one lead per band, ivory; ledes
  and closer notes use the same size in muted ivory at 400.
- **Row title** (600, `row-title`, 1.3): a row or plate title (FAQ
  questions, next steps at 1.25rem, crew names).
- **Fact** (600, 1.25rem): an announced fact; its note under it in small,
  400, muted ivory.
- **Body** (400, 1.0625rem, 1.6): the base size; form fields use it.
- **Small** (400, 0.875rem, 1.55): the cookie slip, consent copy, messages.
- **Label** (600, uppercase, tracked): `label()`, 0.90625rem at 0.24em by
  default (rubrics, portals); 0.78rem / 0.22em for fact, figure and footer
  terms and form labels; 0.875rem / 0.18em for `action()` (menu, footer and
  text actions); 0.28em for the stage line.

### Named Rules
**[MUST] The One Stack Rule.** The site loads no web font. Bebas Neue,
Special Elite and JetBrains Mono belong to the 2026 system
(`docs/design-2026.md`) and the archive; they are gone from the build and
never return to a live page; nothing else is added either.

**[MUST] The Label Voice Rule.** Small captions and headings speak in the
label voice: uppercase, 600, tracked between 0.18em and 0.28em, always
through `label()` (or `action()`, which calls it). Running text is never
uppercase.

## Layout

**The home stage** fills the first viewport (`min-height: 100svh`), a
centred column with `stage-gap` between the logo (at most 860px), the
season mark (or, once announced, the date in type), the stage line and the
portals, which sit slightly lower (an extra 6–18px) and side by side where
both fit. `rise` brings them in in order (0, 0.25s, 0.4s, 0.55s). The
fixed menu bar sits over it; the stage pads `header-h` + 1.5rem.

**The veil** starts under the stage: a gradient from transparent to
`ink-veil` over the first 14rem, then solid. Home bands are centred single
columns at the `measure`, separated by `section` top padding; partners
widen to `maxw`; the prints step out to four columns from 900px, past the
measure by up to 14rem a side, and the film under them to the same width.

**A subpage** opens on its own stage (`SubpageHero`, at least 22rem, up to
58svh): the painting behind, anchored on the title; the title and one note
centred over it with the ink lift; the veil rising under them. Its bands sit
on the veil (`.band`, `section` padding, `gutter` sides) as one centred
column: an index (the FAQ's categories, a policy's contents) is a centred
list of label-voice links under a brass label, never a side rail; a group
or a section is headed by the `rubric`; the questions are plates; long
reading stays left-set inside a centred 44rem column. Plates of one width
sit in centred rows, as many as fit. Nothing is numbered for show. A page
ends on a centred closer or end line, then the footer.

**The footer** is ink, up to `maxw`: the logo as artwork (at most 30rem),
then a grid (a wider brand column and the link, event and organizer
columns; two columns under 45em, one under 23.75em), then the folio line.

The `gutter` honours the safe areas. The cookie slip reserves its height at
the bottom (`--cookie-slip-h`) so it never hides the last line.

**[MUST] The Veil Rule.** Text never sits on the bright painting. Every band
is on the veil; on the home stage only the logo, the season, one label
line (with a dark text shadow) and the portals sit over the paint, where
the shader keeps the smoke darkest behind the logo.

## Elevation & Depth

Flat chrome over a deep, painted field. Depth comes from the painting, the
veil and light, not from stacked surfaces; there are no box shadows.

### Shadow Vocabulary
- **Logo halo** (`drop-shadow(0 0 26px rgba(116,235,224,0.22)) drop-shadow(0 2px 2px rgba(0,0,0,0.55))`): the home logo glowing in the aether.
- **Ink lift** (`drop-shadow(0 1px 2px rgba(0,0,0,0.7))`, text-shadow `0 1px 2px rgba(0,0,0,0.8)`): the season mark and stage text, lifted off the paint.
- **Portal glow** (`drop-shadow(0 0 14px rgba(116,235,224,0.4))`, 22px at 0.65 when pressed): a portal under the pointer or focus.

### Named Rules
**[MUST] The Light Is Response Rule.** A glow is the aether light: only on
the home logo (part of the painting) and on a portal in response. Nothing
else glows.

### The aether (the painting)
**[CURRENT]** `AetherCanvas.astro` runs behind every stage: the home page
and every subpage's head. It is a fixed full-viewport WebGL 1 canvas at
z-index -1 (over the root's ground, under every block), fading in over
1.8s. It paints smoke, the sigil (centred on the element marked
`data-aether-anchor`: the logo, a subpage's title), the traces with pulses,
embers, the hatched vignette and paper grain; a lamp follows the pointer
for five seconds, then drifts. It runs at 24 fps and only while its anchor
is on screen (scrolled under the veil it holds its frame), drops a fifth of
its resolution when 48 frames average slower than about 16 fps (down to
40%), caps its pixel count (lower on a small screen), and stops, freeing the
GPU, before a navigation swaps the page. Under it, on the root (`html`), the
three radial gradients (rust below, petrol top-left, plum top-right, fixed)
over ink are the ground of every page.

**[MUST]** Under `prefers-reduced-motion` the painting is one still frame.
Without WebGL the root's gradients are the painting.

## Shapes

No radius anywhere (`--radius: 0`). The one signature form is the
**bevel**: an eight-sided outline with cut corners (the portals at a 14px
cut, the menu's Tickets action at 8px via `bevel()`). Frames and edges are
hairline brass (1px). Drawn lines (the portal frames, the season lettering,
the rubric rules) pass through the ink tremor so they read as inked by
hand; the solid and framed primitives carry their own copy of it inside
their SVG, so the frame needs nothing from the page.

**[MUST] The Brass Ornament Rule.** The inked rule ending in a diamond
appears in exactly two places: either side of the season mark, and either
side of a rubric heading (mirrored). It is never a divider, a bullet or a
background.

## Components

### Portal (the button)
A beveled brass frame drawn in ink, the aether's button.
- **Solid** (`.btn-primary`, `Portal variant="solid"`): the bevel filled
  brass, brass-light outer stroke, ink label and arrow (masked, no glyph);
  at least 280 × 62px, wraps a long label. Drawn by `border-image` from an
  SVG, so any element takes it: a link, a `<button>`, a React island.
  **Hover / Focus:** the fill turns aether, the arrow steps 5px, the portal
  glows; focus adds the aether ring at 5px.
- **Framed** (`.btn-framed`, `Portal.astro` default): brass strokes over a
  plate, ivory label, brass arrow; hover and focus turn strokes and arrow
  aether, the plate a dark aether tint and the label brass light.
- `Portal.astro` is the link form of the two classes; there is one drawing.
- **Reduced motion:** all transitions off. **Forced colours:** the drawn
  frame gives way to a 2px `ButtonText` border.

**[MUST] The One Portal Rule.** One solid portal per screen. A form's
submit (the newsletter) or a second choice (the last edition beside the
stage's action) is framed. The cookie slip's Accept is the solid portal in
its own fixed layer and does not count against the page.

### Text action
`.action` (`.btn-ghost` is the same thing): the action voice in ivory, a
brass underline, aether underline and brass-light text when reached; a
44px target with no box. The second control everywhere: closers, end
lines, plates, the cookie Decline.

### Season mark
`SeasonMark.astro`: "Fall 2027" hand-lettered as SVG strokes in the brass
gradient, flanked by the brass ornament, with the season as screen-reader
text. **[MUST]** Any other season falls back to type in the label voice
(brass light) until someone draws it; never a stretched or retyped drawing.

### Rubric
The section head (`rubric` mixin; `.head-rule` with `.head-rule-title` and
an optional `.head-rule-note` under it): the label voice in brass between
two inked rules with diamonds (`clamp(2.5rem, 8vw, 4.5rem)` each), centred.

### Plates and prints
- **Plate** (`.paper`): a square ink plate on the veil, a 1px `rule` edge,
  ivory text; a caption line along its bottom edge (`.paper-edge`, label
  voice) and an optional label on its top edge (`.tape`, brass on ink).
- **Print** (`.paper-photo`, the home `.print`): a photograph in a 1px brass
  frame (50%), slightly desaturated (`saturate(0.85) contrast(1.05)`).
- **Film** (the home `.film`): the last edition's aftermovie, a 16:9
  YouTube player in the print's frame and plate, as wide as the prints.

**[MUST] The Plates Not Cards Rule.** What repeats sits on square ink plates
with a faint brass edge, never tilted, never shadowed, never rounded. The
2026 paper, tape strip and grease pencil do not come back (`.grease` is
hidden).

### Facts and figures
Description lists, centred and wrapping. A fact: brass term over an ivory
value, an optional muted note. A figure: the number in brass light over
its muted term.

### Inputs / Fields
- **Style:** a 1px `field-border` on an ink plate (70%), ivory text, square,
  at least 3.25rem high; the label above in brass.
- **Hover:** border to brass light. **Focus:** the aether ring inset 3px.
- **Consent box:** a 1.5rem square brass outline; checked, filled brass
  with an ink tick; native in forced colours.

### Cookie slip
Fixed bottom-right, at most 26rem: ink veil, a 1px brass border (45%), small
ivory text. Accept is the solid portal (`.btn-primary`, minimum width
released); Decline is a text action.

### Navigation
- **Menu bar** (`Menu.astro`): fixed, `header-h` tall; the DF27 mark left,
  hidden on the home stage until the page scrolls; a top-down ink scrim at
  the top, solid ink once scrolled, slides away on scroll down. From 1100px
  the destinations sit inline in the action voice (ivory, current page
  brass, aether on hover); below that a full-screen menu toggle.
- **Footer** (`Footer.astro`): brass column titles, links in the action
  voice (ivory, aether on hover), the cookie-settings button styled as a
  link, the folio line.

### Links
Ivory with a 1px brass underline at 0.25em; on hover the text turns brass
light and the underline aether (0.3s). Focus is always the aether ring
(`focus-ring()`, 2px, 3px offset globally).

## Do's and Don'ts

### Do:
- **Do** take every colour, size and space from the `:root` tokens in `BaseLayout.scss` and the `_aether.scss` / `_type.scss` recipes.
- **Do** set every caption and heading through `label()` or `action()`, tracked 0.18–0.28em.
- **Do** keep every band on the veil.
- **Do** give every animation and transition a `prefers-reduced-motion` opt-out; the painting becomes one still frame.
- **Do** pass every drawn stroke through the ink tremor so it reads as inked.
- **Do** meet WCAG 2.2 AA; `npm run a11y` (axe) covers the live pages.

### Don't:
- **Don't** use the aether colour at rest; it is hover, focus and the painting's glow.
- **Don't** put a second solid portal on a screen, or round a portal's corners.
- **Don't** use the brass rule and diamond anywhere but the season mark and rubric headings.
- **Don't** load a web font or bring a 2026 face (Bebas Neue, Special Elite, JetBrains Mono) onto a live page.
- **Don't** add cards, tilt, box shadows or radius; repeated content sits on flat plates.
- **Don't** turn on a flagged surface still in the 2026 system.
- **Don't** set text over the bright painting.
