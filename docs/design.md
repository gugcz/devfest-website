---
name: DevFest.cz 2027
description: The aether. A dark painted sky of smoke, turning sigil rings and circuit traces behind one logo; ivory type in one system sans, brass ink for ornament and labels, and a cold aether light that appears only when something is hovered, focused or lit by the painting. One solid portal per page.
colors:
  ink: "#05090f"
  ink-veil: "rgba(5, 9, 15, 0.9)"
  ivory: "#f6ecd6"
  ivory-muted: "#c9c0ad"
  brass: "#cfa862"
  brass-light: "#fbf1da"
  brass-deep: "#d9b26a"
  aether: "#74ebe0"
typography:
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
spacing:
  gutter: "max(24px, env(safe-area-inset-left), env(safe-area-inset-right))"
  measure: "40rem"
  section: "clamp(4.5rem, 3rem + 7vw, 9rem)"
  stage-gap: "clamp(20px, 4.2vh, 44px)"
components:
  portal:
    backgroundColor: "rgba(6, 16, 22, 0.86)"
    textColor: "{colors.ivory}"
    typography: "{typography.label}"
    width: "280px"
    height: "62px"
  portal-hover:
    textColor: "{colors.aether}"
  rubric:
    textColor: "{colors.brass}"
    typography: "{typography.label}"
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
  print:
    backgroundColor: "rgba(5, 9, 15, 0.6)"
    padding: "6px"
  field:
    backgroundColor: "rgba(5, 9, 15, 0.7)"
    textColor: "{colors.ivory}"
    typography: "{typography.body}"
    padding: "0.75rem 1rem"
    height: "3.25rem"
  cookie-accept:
    backgroundColor: "{colors.brass}"
    textColor: "{colors.ink}"
    height: "44px"
    padding: "0 1.1rem"
  cookie-accept-hover:
    backgroundColor: "{colors.aether}"
  cookie-slip:
    backgroundColor: "{colors.ink-veil}"
    textColor: "{colors.ivory}"
    padding: "1.25rem 1.4rem"
  footer:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ivory-muted}"
    typography: "{typography.small}"
---

# Design System: DevFest.cz 2027

> **Scope.** This record governs the root of devfest.cz while the next
> edition has no date: the teaser (`src/routes/teaser.astro` on
> `TeaserLayout.astro`, ADR 0011). The frozen 2026 archive (`archive/2026/`)
> and every page still rendered by `BaseLayout.astro` (the legal pages, the
> app pages, the 404, the newsletter thank-you, every page under the
> `edition` flag) follow [`docs/design-2026.md`](design-2026.md) until they
> are reskinned; the archive is never restyled. A page
> moves to this system by moving to `TeaserLayout.astro`, never by mixing
> the two.

Every value here was read out of the shipped code. Rules are labelled
**[MUST]** (binding: a PR that breaks it is sent back) or **[CURRENT]** (the
state of the code today; changing it is a normal design decision).

| Where | What |
| --- | --- |
| `src/layouts/TeaserLayout.scss` | every token, on `:root.aether`; the base, links, focus, the skip link, the `rise` entrance |
| `src/styles/_aether.scss` | the recipes: `label()`, `bevel()`, `focus-ring()` |
| `src/layouts/TeaserLayout.astro` | the shared SVG defs: the `aether-ink` tremor filter and the `aether-brass` lettering gradient |
| `src/components/teaser/` | the portal, the season mark, the canvas, the footer, the cookie slip, the newsletter skin |
| `src/lib/aether/` | the WebGL painting (`index.ts` loop, `shader.ts`, `textures.ts`) |
| `src/routes/teaser.scss` | the stage, the veil, the bands |

## Overview

**Creative North Star: "The Aether"**

The page is a painting first. A slow WebGL sky of dark petrol smoke, warm
plum and rust, three sigil rings cut into the paint around the logo,
circuit traces running out to the edges, embers rising and a hatched,
inked vignette in the corners. On it sits a single, centred stage: the DF27
logo, the season lettered in brass ink, one tracked line, and one beveled
brass portal. Nothing else competes on the first screen.

Below the stage a veil darkens the painting to near-black and the page
becomes a quiet single column: brass rubric headings between inked rules,
a large ivory lead, what is announced, the last edition in figures,
photographs in thin brass frames, the newsletter. The materials are few
and old-world (ink, ivory, brass), and the one modern element, the cold
aether light, is spent only on response: hover, focus, and the painting's
own glow.

**Key Characteristics:**
- An ink ground under a live painting; text lives on the veil, not on the paint.
- Ivory type in one system sans; brass for ornament, labels and figures.
- The aether light (cyan) means "this responds"; it never decorates at rest.
- A beveled, eight-sided brass portal is the one button, once per screen.
- Inked, slightly trembling strokes (the `aether-ink` filter) on every drawn line.
- Centred and symmetric throughout; no cards, no grid of panels.

## Colors

A night palette: blue-black ink, warm ivory, aged brass, and one cold light.

### Primary
- **Aged Brass** (`brass`): the ornament and the label voice. Rubric
  headings and their rules, fact terms, footer titles, form labels, the
  portal's frame and arrow, link underlines, print frames, the checked
  consent box, the cookie Accept fill. 8.96:1 on ink.
- **Brass Light** (`brass-light`) and **Brass Deep** (`brass-deep`): the two
  stops of the lettering gradient (`aether-brass`, top to bottom) used by the
  season mark. Brass Light is also the figures' colour and the link hover
  text (17.77:1); Brass Deep draws the inked rules and diamonds (10.0:1).

### Tertiary
- **Aether Light** (`aether`): the cold light. The portal's frame, arrow and
  sweeping band on hover and focus, every focus ring, a footer edition link
  or the cookie Decline on hover, the cookie Accept on hover, a link
  underline on hover, and the painting's glow (the logo's halo, the sigil
  and traces lit in the shader). 13.97:1 on ink.

### Neutral
- **Night Ink** (`ink`): the ground, the footer, the skip link, the theme
  colour and the text on a brass or aether fill.
- **Ink Veil** (`ink-veil`, ink at 90%): the veil the bands sit on, and the
  cookie slip.
- **Ivory** (`ivory`): headings, leads, fact values, body, links. 17.0:1 on ink.
- **Muted Ivory** (`ivory-muted`): secondary text: the stage line, figure
  terms, fact notes, consent copy, the footer's running text. 11.05:1 on ink.

Brass as a border (an alpha of `brass` over ink) is decoration where it
frames a print (50%, 2.91:1) or the cookie slip (45%), and a control
boundary on the newsletter field (70%, 4.76:1, above the 3:1 non-text floor).

### Named Rules
**[MUST] The Cold Light Rule.** The aether colour is a response, never a
resting colour: hover, focus, selected text, a field a failed submit
points at, and the painting's glow only. A control at rest is ivory and
brass; it turns aether when the visitor reaches it.

**[MUST] The Three Materials Rule.** Ink, ivory and brass carry everything
at rest. No new hue enters the page chrome; the painting's petrol, plum and
rust stay inside the canvas and its CSS fallback gradients.

## Typography

**Display Font:** none. The logo (`public/df27-logo.svg`) and the drawn
season are the display; both are artwork, not type.
**Body Font:** one system sans stack (`--font-sans`): Avenir Next, Segoe UI
Variable Display, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif.
**Label/Mono Font:** the same stack, in the label voice.

**Character:** a clean humanist sans that recedes behind the painting and
the brass; hierarchy comes from size, weight and tracking, not from faces.

### Hierarchy
- **Figure** (600, `figure`, line-height 1, -0.02em, lining tabular
  numerals): the last edition in figures, in brass light.
- **Lead** (500, `lead`, 1.45, balanced wrap): one lead per band, ivory,
  inside the 40rem measure.
- **Fact** (600, 1.25rem): an announced fact (when, where, language); its
  note under it in the small size, 400, muted ivory.
- **Body** (400, 1.0625rem, 1.6): the base size; form fields use it.
- **Small** (400, 0.875rem, 1.55): the footer, the cookie slip, consent copy,
  form messages.
- **Label** (600, uppercase, tracked): the `label()` recipe, 0.90625rem at
  0.24em by default. Rubrics and the portal at the default; fact terms,
  figure terms, form labels and footer titles at 0.78rem / 0.22em; the stage
  line at 0.28em; the band link and cookie buttons at 0.875rem / 0.18em.

### Named Rules
**[MUST] The One Stack Rule.** The aether loads no web font. Bebas Neue,
Special Elite and JetBrains Mono belong to the 2026 system
(`docs/design-2026.md`) and never appear on a `TeaserLayout` page; nothing
else is added either.

**[MUST] The Label Voice Rule.** Small captions and headings speak in the
label voice: uppercase, 600, tracked between 0.18em and 0.28em, always
through `label()`. Running text is never uppercase.

## Layout

**The stage** fills the first viewport (`min-height: 100svh`), a centred
column with `stage-gap` between the logo (at most 860px wide), the season
mark (at most 460px, 84% on small screens), the stage line and the portal,
which sits slightly lower (an extra 6–18px), as in the designer's comp.
`rise` brings them in in order (0, 0.25s, 0.4s, 0.55s).

**The veil** starts under the stage: a gradient from transparent to
`ink-veil` over the first 14rem, then solid. **Bands** are centred
single columns at the `measure` (40rem), separated by `section` top
padding; all text is centred. The prints are the one element that steps
out: two columns, then four from 900px, widening past the measure by up to
14rem on each side.

**The footer** is ink, a 64rem column: the past editions as a row, then an
auto-fit grid of columns (min 13rem), then the fine print.

The side `gutter` honours the safe areas. The cookie slip reserves its
height at the bottom (`--cookie-slip-h`) so it never hides the last line.

**[MUST] The Veil Rule.** Text never sits on the bright painting. Below the
stage every band is on the veil; on the stage only the logo, the season,
one label line (with a dark text shadow) and the portal sit over the paint,
where the shader keeps the smoke darkest and calmest behind the logo.

## Elevation & Depth

Flat chrome over a deep, painted field. Depth comes from the canvas, the
veil and light, not from stacked surfaces; there are no cards and no
box shadows.

### Shadow Vocabulary
- **Logo halo** (`drop-shadow(0 0 26px rgba(116,235,224,0.22)) drop-shadow(0 2px 2px rgba(0,0,0,0.55))`): the logo glowing in the aether.
- **Ink lift** (`drop-shadow(0 1px 2px rgba(0,0,0,0.7))`, text-shadow `0 1px 2px rgba(0,0,0,0.8)`): the season mark and the stage line, lifted off the paint.
- **Portal glow** (`drop-shadow(0 0 14px rgba(116,235,224,0.4))`, 22px at 0.65 when pressed): the portal under the pointer or focus.

### Named Rules
**[MUST] The Light Is Response Rule.** A glow is the aether light: only on
the logo (part of the painting) and on the portal in response. Nothing
else glows.

### The aether (the painting)
**[CURRENT]** `AetherCanvas.astro` is a fixed full-viewport WebGL 1 canvas
behind the page, fading in over 1.8s. It paints smoke, the sigil (centred
on the element marked `data-aether-anchor`, the logo), the traces with
pulses, embers, the hatched vignette and paper grain; a lamp follows the
pointer for five seconds, then drifts. It runs at 24 fps, drops a fifth of
its resolution when 48 frames average slower than about 16 fps (down to
40%), caps its pixel count (lower on a small screen), and stops, freeing
the GPU, before a navigation swaps the page.

**[MUST]** Under `prefers-reduced-motion` it paints one still frame and
never animates. Without WebGL the body's three radial gradients in the same
palette (rust below, petrol top-left, plum top-right) are the painting.

## Shapes

No radius anywhere. The one signature form is the **bevel**: an
eight-sided outline with cut corners (`bevel()`; the portal at a 14px cut,
the cookie Accept at 8px). Frames are hairline brass (1px) with the
picture inset 6px. Drawn lines (the portal frame, the season lettering, the
rubric rules) pass through the `aether-ink` tremor filter so they read as
inked by hand.

**[MUST] The Brass Ornament Rule.** The inked rule ending in a diamond
appears in exactly two places: either side of the season mark, and either
side of a rubric heading (mirrored). It is never a divider, a bullet or a
background.

## Components

### Portal (the button)
A beveled brass frame drawn in ink, the aether's one button
(`Portal.astro`).
- **Shape:** 280 × 62px, an outer brass bevel (1.6) and an inner one (0.8,
  50%), both through the ink filter, over a dark petrol plate clipped to the
  bevel.
- **Content:** the label voice in ivory, then a brass SVG arrow (no glyph).
- **Hover / Focus:** a band of aether light sweeps across the plate
  (0.8s, `--ease-rise`), the strokes and arrow turn aether, the arrow steps
  5px forward, the portal glows; focus adds the aether ring at 5px.
- **Reduced motion:** all transitions off.
- **Solid variant** (`variant="solid"`): the bevel filled with brass, the
  label and arrow in ink, the outer stroke brass-light; hover and focus fill
  it with aether instead of the sweep. The page's one action (on the stage:
  "Hear it first", a jump to the newsletter).
- **Submit variant:** the newsletter submit is the same frame drawn as a
  background; hover deepens the plate to a dark aether tint instead of the
  sweep.

**[MUST] The One Portal Rule.** One solid portal per page, at most two
portals per screen. The stage carries the solid one (the newsletter) and a
framed one (the last edition's archive), side by side where both fit,
stacked on a phone; the newsletter's submit is the only other, a full
screen below.

### Season mark
`SeasonMark.astro`: "Fall 2027" hand-lettered as SVG strokes in the brass
gradient, flanked by the brass ornament, with the season as screen-reader
text. **[MUST]** Any other season falls back to type in the label voice
(brass light) until someone draws it; never a stretched or retyped drawing.

### Rubric
A section heading (`h2`) in the label voice, brass, between two inked rules
with diamonds (`clamp(2.5rem, 8vw, 4.5rem)` each).

### Facts and figures
Description lists, centred and wrapping. A fact: brass term over an ivory
value, an optional muted note. A figure: the number in brass light over
its muted term.

### Prints
Photographs from past editions in a thin brass frame (1px, 50%) on an ink
plate, 3:2, slightly desaturated (`saturate(0.85) contrast(1.05)`). Flat,
square, untilted.

### Inputs / Fields
- **Style:** a 1px brass border (70%) on an ink plate (70%), ivory text,
  square, at least 3.25rem high; the label above in brass.
- **Hover:** border to brass light. **Focus:** the aether ring inset 3px.
- **Consent box:** a 1.5rem square brass outline; checked, filled brass
  with an ink tick; native in forced colours.

### Cookie slip
Fixed bottom-right, at most 26rem: ink veil, a 1px brass border (45%), small
ivory text. Accept is a beveled brass fill with ink text, turning aether on
hover; Decline is an underlined text button. Both at least 44px high.

### Navigation (footer)
The teaser has no header or menu. The footer carries the site's
navigation: past editions in a large label row (ivory, aether on hover),
then "Organised by", "Follow" and "About" columns with brass titles and
underlined ivory links, the cookie-settings button, and the fine print.

### Links
Ivory with a 1px brass underline at 0.25em; on hover the text turns brass
light and the underline aether (0.3s). Focus is always the aether ring
(`focus-ring()`, 2px, 4px offset by default).

## Do's and Don'ts

### Do:
- **Do** take every colour, size and space from the `:root.aether` tokens and the `_aether.scss` recipes.
- **Do** set every caption and heading through `label()`, tracked 0.18–0.28em.
- **Do** keep text below the stage on the veil.
- **Do** give every animation and transition a `prefers-reduced-motion` opt-out; the painting becomes one still frame.
- **Do** pass every drawn stroke through `aether-ink` so it reads as inked.
- **Do** meet WCAG 2.2 AA; the `npm run a11y` axe sweep covers `/`.

### Don't:
- **Don't** use the aether colour at rest; it is hover, focus and the painting's glow.
- **Don't** put a second solid portal on a page, more than two portals on a screen, or round a portal's corners.
- **Don't** use the brass rule and diamond anywhere but the season mark and rubric headings.
- **Don't** load a web font or bring a 2026 face (Bebas Neue, Special Elite, JetBrains Mono) onto a teaser page.
- **Don't** add cards, box shadows or radius; depth is the painting and the veil.
- **Don't** set text over the bright painting.
