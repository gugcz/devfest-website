---
name: DevFest.cz 2026
description: Film-noir case file — near-black surfaces, hairline rules, typewriter headlines, one red marker.
colors:
  bg: "#050505"
  near-black: "#0D0D0D"
  dark: "#1A1A1A"
  mid: "#2E2E2E"
  grey: "#8C8C8C"
  text: "#F2EFE9"
  cream: "#E8E0CC"
  accent: "#CC0000"
  accent-hot: "#FF1111"
  on-accent: "#F7EFE6"
  panel: "#0C0B0B"
  panel-2: "#111010"
  panel-hover: "#161413"
  panel-lit: "#0A0908"
  panel-lit-2: "#0E0C0B"
  surface: "rgba(255, 255, 255, 0.03)"
  border: "rgba(255, 255, 255, 0.08)"
  rule: "rgba(240, 237, 230, 0.13)"
  rule-soft: "rgba(240, 237, 230, 0.06)"
  rule-strong: "rgba(240, 237, 230, 0.22)"
  rule-red: "rgba(204, 0, 0, 0.55)"
  field-border: "rgba(240, 237, 230, 0.4)"
  matte: "rgba(240, 237, 230, 0.035)"
  matte-red: "rgba(204, 0, 0, 0.28)"
  light-warm: "#FFECD6"
typography:
  display:
    fontFamily: "'Special Elite', cursive"
    fontSize: "clamp(2.6rem, 6vw, 5rem)"
    fontWeight: 400
    lineHeight: 1.04
    letterSpacing: "0.01em"
  headline:
    fontFamily: "'Special Elite', cursive"
    fontSize: "clamp(2.2rem, 4.8vw, 4rem)"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "0.01em"
  title:
    fontFamily: "'Special Elite', cursive"
    fontSize: "1.85rem"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "0.01em"
  title-compact:
    fontFamily: "'Bebas Neue', sans-serif"
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.06em"
  lede:
    fontFamily: "'IM Fell English', serif"
    fontSize: "clamp(1.18rem, 1.7vw, 1.4rem)"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "normal"
  body:
    fontFamily: "'Special Elite', cursive"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.85
    letterSpacing: "0.01em"
  numeric:
    fontFamily: "'Bebas Neue', sans-serif"
    fontSize: "clamp(2.2rem, 3vw, 3.6rem)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.04em"
  figure:
    fontFamily: "'Bebas Neue', sans-serif"
    fontSize: "1.7rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.04em"
  exhibit:
    fontFamily: "'Bebas Neue', sans-serif"
    fontSize: "2.4rem"
    fontWeight: 400
    lineHeight: 0.85
    letterSpacing: "0.02em"
  label:
    fontFamily: "'JetBrains Mono', monospace"
    fontSize: "0.78rem"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0.3em"
  label-xs:
    fontFamily: "'JetBrains Mono', monospace"
    fontSize: "0.68rem"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0.22em"
  label-sm:
    fontFamily: "'JetBrains Mono', monospace"
    fontSize: "0.74rem"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0.24em"
  ui:
    fontFamily: "'JetBrains Mono', monospace"
    fontSize: "0.95rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.02em"
  body-lg:
    fontFamily: "'IM Fell English', serif"
    fontSize: "1.05rem"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "normal"
  title-sm:
    fontFamily: "'Bebas Neue', sans-serif"
    fontSize: "1.4rem"
    fontWeight: 400
    lineHeight: 1.06
    letterSpacing: "0.02em"
  monogram:
    fontFamily: "'Bebas Neue', sans-serif"
    fontSize: "3.4rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.04em"
  folio:
    fontFamily: "'Bebas Neue', sans-serif"
    fontSize: "5.5rem"
    fontWeight: 400
    lineHeight: 0.8
    letterSpacing: "0.02em"
  label-lg:
    fontFamily: "'JetBrains Mono', monospace"
    fontSize: "0.84rem"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0.22em"
rounded:
  base: "2px"
  pill: "50%"
spacing:
  gutter: "clamp(1.25rem, 5vw, 3rem)"
  section-y: "clamp(4.5rem, 8vw, 8.5rem)"
  card-pad: "1.9rem 1.7rem"
  maxw: "1200px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    typography: "{typography.label}"
    rounded: "{rounded.base}"
    padding: "1.05rem 2.4rem"
  button-primary-hover:
    backgroundColor: "{colors.accent-hot}"
    textColor: "{colors.on-accent}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    typography: "{typography.label}"
    rounded: "{rounded.base}"
    padding: "1.05rem 1.8rem"
  button-ghost-hover:
    backgroundColor: "rgba(204, 0, 0, 0.06)"
    textColor: "{colors.accent-hot}"
  record:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    padding: "clamp(1.6rem, 2.6vw, 2.4rem) 0"
  record-lit:
    backgroundColor: "{colors.panel-lit}"
    textColor: "{colors.text}"
  record-status:
    backgroundColor: "transparent"
    textColor: "rgba(240, 237, 230, 0.72)"
    typography: "{typography.label-sm}"
    padding: "0 0 0.3rem"
  record-status-live:
    textColor: "{colors.accent-hot}"
  input-field:
    backgroundColor: "{colors.panel-2}"
    textColor: "{colors.text}"
    typography: "{typography.body}"
    rounded: "{rounded.base}"
    padding: "0.95rem 1.1rem"
    height: "3rem"
  nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    typography: "{typography.label}"
    padding: "0.6rem 0.2rem"
    height: "2.75rem"
  nav-link-hover:
    textColor: "{colors.accent-hot}"
  index-tag:
    backgroundColor: "transparent"
    textColor: "{colors.accent-hot}"
    typography: "{typography.label}"
    padding: "0.22em 0.5em"
  countdown-card:
    backgroundColor: "{colors.panel-2}"
    textColor: "{colors.text}"
    typography: "{typography.numeric}"
    rounded: "{rounded.base}"
    width: "clamp(2.6rem, 3.4vw, 4.2rem)"
    height: "clamp(3.8rem, 5.1vw, 6rem)"
---

# Design System: DevFest.cz 2026

## Overview

**Creative North Star: "The Case File"**

Every screen is a page from an open case file. Hairlines are the file's ruling; the mono eyebrow is its tab; the small boxed number beside it (`N° 01`) is its stamp. Sections do not sit in cards floating on a canvas — they are stacked entries stitched together by full-bleed 1px rules, indexed, labelled, and filed. The visitor is reading evidence, in order, toward a decision.

The world it is filed in is film noir, but noir as *lighting*, not as costume. Surfaces are near-black (`#050505` page, `#0A0908`–`#111010` panels) and almost never lit evenly: a soft elliptical pool (`--lit`) falls behind the content of an important section, a vignette darkens every frame edge, and photography is graded hard to black-and-white (`grayscale(1) contrast(1.12) brightness(0.82)`). Nothing is glossy, nothing is textured, nothing is rotated. The atmosphere is achieved entirely with light and contrast on flat surfaces.

Red is the investigator's marker, and it is rationed. It appears as a hairline that fades to nothing beside an eyebrow, a boxed index number, a single lit word inside a typewriter headline, the fill of the one CTA that matters, and the halation that blooms when the visitor touches something. It never fills a panel, never becomes a background, and never has company: the palette is achromatic plus one red, and the system has no second hue for any purpose, including status.

This world was reached by deletion. An earlier skeuomorphic layer — rotated rubber stamps, cream paper slips, deckled edges, simulated grain and tape — was stripped out and must not return; the current system is its deliberate replacement, not a stage on the way back to it.

A case file is a **ledger**, not a stack of cards, and the system takes that literally. Collections — ticket waves, questions, contact desks, sessions, partners — are ruled entries on a shared column grid: index left, substance centre, figure and action right. Nothing is enclosed. The hairline does the work a border used to do, light does the work a highlight used to do, and a horizontal pull does the work a hover-lift used to do.

**Key Characteristics:**
- Ruled entries, never cards. The container language is `.ledger` / `.record`.
- Near-black ground, hairline structure, `2px` corners on controls only — flat by construction.
- Four typefaces, single weights each; hierarchy comes from size, tracking, case, and face-pairing, never from font-weight.
- Typewriter (Special Elite) headlines, uppercase, with one word lit in red.
- Achromatic + one red. No second accent hue anywhere, including status states.
- Depth is lighting, not elevation: pools, vignettes, and state-triggered halation.
- Interactive elements move: `translateY(-2px)`, warm to hot red, and glow on hover.

## Colors

Achromatic near-black through bone-white, plus a single red that behaves as marker ink and, on interaction, as light.

### Primary
- **Case Red** (`#CC0000`): the resting accent. Fill of the primary CTA, the countdown's header strip, and the source colour of every red hairline, halation shadow, and separator. It is the fixture — the thing that can be switched on.
- **Flashbulb Red** (`#FF1111`): the lit state. Every interactive hover/focus, the global focus ring, index numbers, the single lit word inside a headline, and inline links in long-form copy. Brighter than Case Red specifically so it clears contrast on the near-black ground where the base red would not.

### Neutral
- **Cellar Black** (`#050505`): the page ground and the canvas colour set on `html` (also backs the iOS status-bar scrim so no white flashes during rubber-band scroll).
- **Strip Black** (`#0D0D0D`): supporting bands that must separate from the page without becoming a panel — the topic ticker under the hero.
- **Interrogation Panel** (`#0A0908`) and **Panel Two** (`#111010`): the two working surfaces. `panel-lit` is for cards standing inside a lit section (ticket cards); `panel-2` is for input fields and countdown cards. `#0C0B0B` (`panel`) and `#161413` (`panel-hover`) complete the ladder.
- **Bone** (`#F2EFE9`): all primary text. Body copy at 78% opacity, ledes and secondary copy step down through **Ash Grey** (`#8C8C8C`).
- **Warm Bone** (`#F7EFE6`): text on the red CTA only — very slightly warmer than Bone so it reads as ink printed on red, not white knocked out of it.
- **Rule** (`rgba(240,237,230,0.13)`), **Rule Soft** (`0.06`), **Rule Strong** (`0.22`): the three hairline weights that build the entire layout grid. Soft stitches sections; base separates items; strong bounds interactive chrome such as the ghost button.
- **Field Border** (`rgba(240,237,230,0.4)`): deliberately separate from the decorative rules so form controls clear WCAG 1.4.11 (≥3:1) while grouping hairlines stay whisper-faint. Never substitute `--rule` on an input.
- **Error Red** (`rgba(220,110,110,0.95)`, `--color-error`): form-error prose only, and the one place a red other than the two accents is permitted. It is Case Red desaturated far enough to reach ~5.7:1 on a panel, where Case Red itself sits at ~3.3:1 and fails 1.4.3 as small copy. It is a *text* colour: never a fill, a rule, a border or a mark. Both form surfaces use it; nothing else may.

### Light

- **Lamp Warm** (`#FFECD6`): not a surface colour — the colour of the light source itself. It appears only inside gradients (`--lamp`, the hover washes, `--lit`) at very low alpha, typically `0.026`–`0.075`, and the alpha is what varies between layers, never the hue. Nothing in the system is ever *filled* with this colour.

### Named Rules

**The One Mark Rule.** At most one red-lit element commands any given viewport. If a headline already has a lit word, the CTA in that same frame is the ghost variant, not the filled one. Red coverage stays under ~10% of any screen — its scarcity is the entire reason it works.

**The Single-Hue Rule.** The palette is achromatic plus one red. There is no second chromatic colour in the system for any purpose. Status — sold out, paused, coming soon, error, disabled — is expressed through opacity (`0.5` for inactive), hairline weight, and an explicit mono label. Never introduce green for success or amber for warning.

**The Field Border Rule.** Anything a visitor can type into or toggle uses `--field-border`; anything purely decorative uses a `--rule` weight. Mixing them fails contrast in one direction and shouts in the other.

## Typography

**Display Font:** Special Elite (with `cursive` fallback) — distressed typewriter
**Numeric / Condensed Font:** Bebas Neue (with `sans-serif` fallback)
**Reading Font:** Special Elite for long-form body; IM Fell English (italic) for ledes and pull-quotes
**Label / Mono Font:** JetBrains Mono (with `monospace` fallback)

**Character:** A typewritten case report annotated in a monospaced hand, with a literary aside in italic serif and hard condensed numerals for anything countable. Every face is loaded at a single weight — hierarchy is built from size, letter-spacing, case, colour, and which face is used, never from weight.

### The ramp

**Sixteen steps, declared once in `:root`, and every `font-size` in the codebase goes through one of them — `BaseLayout.scss` included.** Before this the repo carried **43** distinct values — ten of them inside the `0.60`–`0.78rem` label band alone, which is not drift around a ramp but the absence of one.

| Token | Size | Job |
|---|---|---|
| `--fs-label-xs` | `0.68rem` | micro mono: avatar counts, kit tags |
| `--fs-label-sm` | `0.74rem` | mono: counts, chips, inline clears |
| `--fs-label` | `0.78rem` | mono: eyebrows, section labels |
| `--fs-label-lg` | `0.84rem` | mono: nav, buttons, email links |
| `--fs-ui` | `0.95rem` | small UI prose, help text |
| `--fs-body` | `1rem` | long-form reading copy |
| `--fs-body-lg` | `1.05rem` | footnotes, short ledes |
| `--fs-lede` | `1.2rem` | section ledes, status prose |
| `--fs-title-sm` | `1.4rem` | small titles, mobile record titles |
| `--fs-title-compact` | `1.5rem` | compact ledger record title |
| `--fs-figure` | `1.7rem` | ledger row figures |
| `--fs-card-title` | `1.85rem` | dossier and detail titles |
| `--fs-exhibit` | `2.4rem` | hollow ledger exhibit numeral |
| `--fs-exhibit-sm` | `1.9rem` | the exhibit numeral in the narrow (≤720px) index column |
| `--fs-monogram` | `3.4rem` | initials in an empty photo well |
| `--fs-folio` | `5.5rem` | oversized outlined folio numeral |

Fluid steps sit alongside them and are *not* literals:

| Token | Value | Job |
|---|---|---|
| `--fs-display` | `clamp(2.6rem, 6.5vw, 5rem)` | poster scale — the subpage hero title, **once per page** |
| `--fs-hero` | `clamp(2.6rem, 6vw, 5rem)` | in-page hero headline |
| `--fs-h2` | `clamp(2.2rem, 4.8vw, 4rem)` | in-page section headline |
| `--fs-h3` | `clamp(1.9rem, 4vw, 2.4rem)` | sub-section: dialog names, press-kit section titles, session detail heads |

**The One-Poster Rule.** `--fs-display` appears at most **once per page**, on the subpage hero title and nothing else. Every headline on the site used to sit inside a single octave, so nothing ever read as loud; a noir one-sheet runs its title over the body and that contrast *is* the genre. A second display-scale element on the same page cancels the first. It is deliberately restrained (`5rem` cap, not the `8.5rem` first tried): the louder size filled the hero and pushed the fold down so the page always needed a scroll to reach its content. It stays the biggest thing on the page without owning the viewport.

Note the knock-on: the hero centres its content, so if the title ever grows past the padding box the block overflows **equally in both directions** and top padding stops protecting anything. The hero's top padding therefore clears the 65px fixed header on its own — independent of `min-height` — so the eyebrow never hides behind the header.

**The Nearest-Step Rule.** Reach for the nearest existing token. Introducing a new value means adding it here *and* to `:root` — a ramp with exceptions is a ramp that describes nothing, which is exactly the state this replaced. `--fs-h3` was added rather than tolerated as drift: three files were each carrying their own clamp in the 2.0–2.9rem band because the ramp had no step between `--fs-h2` and `--fs-card-title`.

### Hierarchy
- **Display** (Special Elite, `clamp(2.6rem, 6vw, 5rem)`, `1.04`, uppercase, `0.01em`): subpage hero headlines. Always carries `text-shadow: 0 2px 18px rgba(0,0,0,0.7)` when it sits over photography — a legibility scrim, never an emboss.
- **Headline** (Special Elite, `clamp(2.2rem, 4.8vw, 4rem)`, `1.05`, uppercase): in-page section headlines. One word inside it may be `.red` — Flashbulb Red plus `--glow-red`.
- **Title** (Special Elite, `1.85rem`, `--fs-card-title`): dossier and detail titles.
- **Title Compact** (Bebas Neue, `1.5rem`, `--fs-title-compact`): the title of a one-line ledger record. A deliberate step below the full record's `clamp(1.85rem, 3.2vw, 2.6rem)` so a settled entry reads as subordinate to the live one at a glance.
- **Lede** (IM Fell English italic, `clamp(1.18rem, 1.7vw, 1.4rem)`, `1.7`, Ash Grey, max ~56ch): the sentence directly under a headline. Frequently set with a `2px solid var(--rule-red)` left border and `1.4rem` of padding — the pull-quote gesture of the system.
- **Body** (Special Elite, `1rem`, `1.85`, `rgba(240,237,230,0.78)`, max `70ch`): long-form reading copy — FAQ answers, privacy policy, form help. The generous `1.85` line-height and 70ch measure are what make a distressed typewriter face survive at paragraph length; do not tighten either.
- **Numeric** (Bebas Neue, `clamp(2.2rem, 3vw, 3.6rem)`, `0.04em`): countdown digits, prices, oversized folio numerals. Also at `1.5rem` for hero meta values (date, venue).
- **Exhibit** (Bebas Neue, `2.4rem`, `0.85` leading; `1.9rem` under 720px): the hollow exhibit number in a ledger's index column. Set in outline only — `color: transparent` with `-webkit-text-stroke: 1px rgba(204,0,0,0.5)` — lighting to Flashbulb Red on the lit entry. Decorative by construction and `aria-hidden` at every call site.
- **Label** (JetBrains Mono, `0.75–0.84rem`, `0.18em`–`0.32em`, uppercase, `rgba(240,237,230,0.62)`): eyebrows, nav links, button text, meta labels, index numbers, ticker items. The widest tracking in the system — this face is what makes data read as data.

### Named Rules

**The Four Faces Rule.** Bebas Neue, IM Fell English, JetBrains Mono, Special Elite. Adding a fifth typeface is a brand violation, not a design decision. They are loaded from one Google Fonts link in `BaseLayout.astro`; there are no `--font-*` custom properties, so families are written literally at each rule.

**The No-Weight Rule.** Every face ships one weight (JetBrains Mono carries 400/500 but 500 is effectively unused). If a heading needs more presence, increase size, tracking, or switch face — never reach for `font-weight: 700`, which will silently synthesise a fake bold.

**The Mono-Is-Data Rule.** JetBrains Mono is for things that are catalogued: labels, numbers, dates, nav, buttons, eyebrows. It is never used for a sentence. Special Elite is never used for a label.

## Layout

A single centred column at `--maxw: 1200px` with `--gutter: clamp(1.25rem, 5vw, 3rem)`, applied through the `.u-container` primitive. Sections stack full-bleed and are separated by `1px solid var(--rule-soft)` top/bottom borders — the hairlines, not margins, are what make the page read as a filed document.

### Vertical rhythm — three densities

Vertical rhythm is **three** tokens, not one:

| Token | Value | Reads as |
| --- | --- | --- |
| `--section-y-tight` | `clamp(2.75rem, 4.6vw, 4.75rem)` | a cut — a single line and a CTA (call for speakers, newsletter) |
| `--section-y` | `clamp(4.5rem, 8vw, 8.5rem)` | the normal beat — every content section |
| `--section-y-wide` | `clamp(7rem, 12.5vw, 13.5rem)` | a held shot — tickets, the past-editions gallery |

**The Tempo Rule.** Thirteen sections all set at `--section-y` gave the scroll a single tempo, and a single tempo is the structural signature of generated layout — more than any individual component. Emphasis here is *relative*: a wide section only reads as emphasis because its neighbours don't. Never set two adjacent sections wide, and never promote a section to wide because its content is long — length is what the normal beat is for.

Heads are no longer uniformly centred either. `/speakers` and `/sessions` are left-set over their left-reading grids; the home teaser and gallery stay centred. A head centred over a left-aligned grid is the template move.

The homepage hero is the one asymmetric layout: `grid-template-columns: minmax(0, 1fr) auto` with a `6rem` gap, content left and the countdown right, at `min-height: 100vh`. Subpage heroes use `min-height: max(560px, 62vh)` with a floor so page-to-page height stays stable regardless of lede length. Card regions use `repeat(auto-fit, minmax(280px, 1fr))` with a `1.4rem` gap — the grid decides its own column count rather than being told at breakpoints.

Responsive behaviour is mobile-adjusted, not mobile-redesigned. The working breakpoints are **900px** (hero collapses to one column, hero photograph goes full-width behind the content at reduced opacity and switches its mask from left-to-right to top-to-bottom), **600px** (type steps down, heroes shorten, eyebrow hairlines shrink to 32px), and **500px / 380px** for the tightest chrome. Fixed nav is cleared by `scroll-padding-top: 6rem`, and the fixed cookie banner by `scroll-padding-bottom: 8rem`, so anchor jumps never park a title under chrome.

**The Hairline Grid Rule.** Structure is drawn with 1px rules, never with boxes. If a region needs separating, give it a `--rule-soft` border, not a background change and not a card.

## Elevation & Depth

Two depth systems, applied in one direction only: **the scene is lit, the object is flat.**

Depth at rest comes from lighting the room — `--lit` drops a soft elliptical pool of warm light behind a section's content, `--vignette` darkens every frame edge globally (`body::after`, `z-index: 9998`), and `.scene > .scene-vignette` applies a stronger per-section version for "film still" framing. Black drop shadows give cards physical weight against the ground (`0 10px 28px rgba(0,0,0,0.45)`). Nothing red glows until it is touched.

**The atmosphere layer.** Three fixed, decorative, `pointer-events: none` layers give the page its film stock. All three are `aria-hidden` by construction and none of them move any text/background pair off its measured contrast ratio.

- **Film grain** (`body::before`, z 9999): an SVG `feTurbulence` tile at `opacity: 0.06`, `mix-blend-mode: screen`. **Screen, not overlay** — overlay leaves near-black essentially untouched, so on the `#050505` ground the grain is invisible. Grain is emulsion catching light; it lifts. Static, not animated: a still frame has static grain, and animating a full-viewport overlay costs a repaint per frame for nothing.
- **Vignette** (`body::after`, z 9998): `--vignette`, edge-darkening so every section reads as a film still.
- **The lamp** (`--lamp`): one raking light source, high and to the left, falling off to near-black. Applied at **section** scale (`.ledger--lamp` and the page-level ledger containers), never per element — the room is lit, objects are not each carrying their own lamp. It bleeds `var(--gutter)` past the content column so the falloff is never a visible rectangle.

Without these the system reads as a modern data table rather than a case file. The structure is austere on purpose; the atmosphere is what makes it noir.

**Shadow Vocabulary**
- **Card weight** (`box-shadow: 0 10px 28px rgba(0, 0, 0, 0.45)`): resting weight for evidence cards. Deepens to `0 22px 46px rgba(0,0,0,0.6)` on hover.
- **Text scrim** (`text-shadow: 0 2px 18px rgba(0, 0, 0, 0.6)`): under headlines that sit over photography or a lit pool.
- **Halation, soft** (`--glow-red-soft: 0 0 22px rgba(204, 0, 0, 0.32)`): hover on secondary surfaces — ghost buttons, focused fields, card edges.
- **Halation, full** (`--glow-red: 0 0 16px rgba(204,0,0,0.55), 0 0 38px rgba(204,0,0,0.28)`): primary CTA hover, and the `.neon` text treatment on a lit headline word.
- **Halation, hot** (`--glow-red-hot: 0 0 14px rgba(255,40,40,0.7), 0 0 40px rgba(204,0,0,0.45)`): reserved for the most emissive moment on a screen; use at most once.

**The Flat-At-Rest Rule.** No element glows until the visitor touches it. Red halation is a *state*, never decoration. Black shadow carries physical weight; red shadow carries attention — never swap their jobs.

**The No-Dimming Rule.** A finished, sold-out, closed or unavailable item is never expressed with `opacity`. Dropping a record to `opacity: 0.5` takes its secondary text from ~4.8:1 to ~2.5:1 against the ground — a straight WCAG 1.4.3 failure on content that is still meant to be read. State is carried by an explicit mono status word, a softened rule weight, and the absence of the lit treatment. Only genuinely disabled *controls* (exempt from 1.4.3) may dim.

**The Lit Section Rule.** A section that gets `--lit` must put its content above it (`position: relative; z-index: 1` on the inner wrapper) and the glow layer must be `pointer-events: none`. Lighting never intercepts a click.

## Shapes

**Content is not enclosed.** The system has no card: grouping is done with hairlines and a shared column grid, and emphasis with light. A four-sided border around a block of content is the one shape this system does not have — it carries no information the content doesn't already carry, and it is the single strongest tell of generic interface design. Borders survive only where they bound an interactive control (buttons, fields) or draw a table's cells.

Sharp by default. `--radius: 2px` is the only corner value in the system — enough to stop a corner looking accidental, never enough to read as soft. It applies to controls, not containers, because containers no longer exist. Circles (`50%`) exist solely for genuinely round objects: loading dots, social icon bounds, checkbox marks.

Borders are the primary form language: 1px hairlines in three weights, plus `2px solid var(--rule-red)` as a left border for ledes and quoted answers. The one signature geometry is the **crop bracket** — two 16px L-shaped corners in `2px solid var(--color-accent-hot)` at the top-left and bottom-right of a photograph, opening to 22px on hover. Photographic frames are `aspect-ratio: 4 / 5`; imagery is masked with long linear gradients rather than cropped hard, so a photo dissolves into the dark instead of ending at a seam.

**The Two-Pixel Rule.** Nothing in this system is more rounded than 2px. Pills, rounded cards, and `border-radius: 8px+` belong to a different product.

### Sanctioned exceptions

Four cases legitimately keep a bounded surface. They share one test: **the boundary is doing a job the content cannot do without it.** Anything that fails that test is a card.

- **Floating chrome** — modal dialogs (`SessionDetail`, `SpeakerDetail`) and the cookie banner sit *over* the page rather than in it, so they need an edge to separate them from whatever is behind. They keep a border and a panel fill; they do **not** get an accent bar down one side.
- **The countdown stub** — the bounded rectangle *is* the depicted object (a ticket stub), not a container wrapped around content. It keeps its hairline edge, at `border-radius: 0`.
- **Media partner plates** — media wordmarks ship dark and are illegible on the page ground, so the cream fill is functional. It stays; the shadow, mounted frame and hover-lift do not.
- **Interactive controls** — buttons, fields and filter chips keep `--radius: 2px` and a `--field-border` boundary, because WCAG 1.4.11 requires a perceivable edge on things you can operate.

## Components

Components are **tactile and confident**: they lift, warm, and light when touched. Resting states are precise and quiet; the interaction is where the system asserts itself.

### Buttons
- **Shape:** Effectively square (`--radius: 2px`), generous horizontal padding, mono uppercase label at `0.22em` tracking.
- **Primary:** Case Red fill with a matching 1px border, Warm Bone label, `1.05rem 2.4rem` padding.
- **Primary hover:** fill and border go Flashbulb Red, `translateY(-2px)`, `box-shadow: var(--glow-red), 0 12px 30px rgba(204,0,0,0.3)`. `:active` returns to `translateY(0)` — the press is felt.
- **Ghost:** transparent on a `--rule-strong` hairline with Bone text and `1.05rem 1.8rem` padding. On hover: text and border warm to red, background lifts to `rgba(204,0,0,0.06)`, soft halation appears, and the gap widens `0.6rem → 0.85rem` so the trailing `↘` arrow drifts `translate(2px, 2px)`.
- **Focus:** every button carries `outline: 2px solid var(--color-accent-hot); outline-offset: 3px`, matching the global `:focus-visible`.
- **Disabled:** `opacity: 0.55`, `cursor: not-allowed`. No colour change — the palette has no disabled hue.

### Ledger & Record (the container language)

**There are no cards.** A collection of things is a `.ledger`; each thing in it is a `.record`. Defined globally in `BaseLayout.scss`.

- **Ledger:** opens on a `1px solid var(--rule-strong)` top rule. No fill, no padding, no enclosure.
- **Record:** a three-column grid — `3.25rem` index / `minmax(0, 1fr)` body / `minmax(13.5rem, auto)` data-and-action — with `clamp(1.6rem, 2.6vw, 2.4rem)` vertical padding and a `1px solid var(--rule)` bottom rule. The third column carries a **floor**, not `auto`: without it a record holding a CTA sizes its column wider than its neighbours and the right-hand figure axis wobbles row to row, which is the one thing a ruled table may never do.
- **Columns:** `.record-index` (the exhibit number — Bebas at `2.4rem`, hollow, `-webkit-text-stroke: 1px rgba(204,0,0,0.5)`, lighting to Flashbulb Red on the lit entry), `.record-body` (title + note + optional `.record-table`), `.record-data` (status word, then action). Hollow type carries no contrast, so the index is decorative by construction and is `aria-hidden` at every call site; an index that must be *read* stays solid mono.
- **The head:** a ledger opens on a **double rule** — `3px` `--rule-strong` with a `1px` `--rule` beneath it via `box-shadow: 0 3px 0 -2px`. Printed ledgers and forms open on a thick/thin pair, and this one detail does more period work than any amount of panel chrome.
- **The pull (`.record--pull`):** hover or focus-within translates the entry `0.6rem` right and draws a red hairline along its bottom rule, left to right, over `0.4s cubic-bezier(0.16, 1, 0.3, 1)` — a file being drawn out of the drawer. This replaces the card's hover-lift entirely.
- **The lit entry (`.record--lit`):** the one record that matters. An angled warm gradient plus a low red pool bleeds `var(--gutter)` past the content column on both sides so the emphasis reads as a lamp falling across the page, never as a highlighted rectangle. Its own bottom rule goes `--rule-red`, and its index lights to Flashbulb Red. **It gets no side bar** — a thick accent border down one edge is the accent-tab cliché this language exists to replace, and the ledger marks things with rules.
- **The closed entry (`.record--closed`):** a finished item. Its bottom rule softens to `--rule-soft` and **nothing else changes**. Full text contrast is retained.
- **The compact entry (`.record--compact`):** a settled item collapsed to one line — index, title at `1.5rem`, a single `.record-summary` figure on the shared right axis, status. Explanatory copy and detail tables are dropped, not hidden: a wave you cannot buy needs to show that it existed and what it cost, not to sell itself. **Height is hierarchy** — giving every record equal room is what makes a ledger read long and flattens the one entry that matters. A three-wave ticket ledger runs ~454px with one full entry and two compact, against ~1839px with three full ones.
- **`.record-table`:** the detail rows inside a record — label left, `.record-figure` right, `--rule-soft` between, full body width so figures stack into one right-hand axis.

### Ticket stub (objects, not rows)

**A ticket is an object, and objects are not rendered as ledger rows.** This is the same exception the countdown already holds — the bounded rectangle *is* the depicted thing — and it is the one place the ledger was applied wrongly and had to be taken back.

Horizontal and short by design (~150px), so the height won by killing the card grid is kept: a real stub is wide, not tall.

- **Counterfoil** (`4.75rem`): punch hole and a serial set **vertically**, the way it is printed down a torn edge.
- **Perforation** (`.stubPerf`): round holes from a repeating radial-gradient — *not* a dashed border. A dashed rule is drafting-tool vocabulary; perforation is punched paper. Notches bite the edge where the tear line meets it.
- **Live pass** (`.stubLive`): a red **ADMIT ONE** band across the head. This is the section's one red fill, so it lands on exactly one stub.
- **Spent pass** (`.stubSpent`): cancelled with a hollow **VOID** on the counterfoil — where a real ticket is cancelled — never overprinted across the copy, which would take live text off its contrast.

**The Object Test.** Before choosing a container, ask what the content *is*. A list of records (questions, sessions, desks) is a **ledger**. A thing you hold (a pass, a photograph, a logo plate, a downloadable asset) is an **object** and keeps its edges. Applying one container language to both is what made tickets read as a bank statement.

### Mounted print (photographs)

Speaker, team and teaser photographs are evidence prints, and they carry their mount: a bone keyline (`inset 0 0 0 1px rgba(240,237,230,0.16)`) for the print's own border, plus a real drop shadow so the print sits *on* something. Crop-brackets ride on top. Stripping the mount left photographs floating on flat black, which is exactly when they stopped reading as objects.

### Case-file tab

Category labels (contact desks, press desks) are **folder divider tabs**: an angled leading edge via `clip-path: polygon(0.62rem 0, …)`, red keyline, accent-hot mono. The **shape** carries the case-file signal so the red stays rationed — the tab fills solid `--color-accent` only for the desk under the pointer, rather than spending the accent fill three times on one page.

**The Equal-Prints Rule.** No photograph in a lineup or roster is bigger than another. A featured 2×2 lead cell was tried on `/speakers` and `/team` and pulled: no one attendee, speaker or organiser is elevated over the rest, and a single enlarged print forces an off-grid crop ratio besides. Every print in these grids is the same size; hierarchy comes from order, not scale.

### Contact sheet (grids of artifacts)

Logo walls and image grids use a single ruled sheet, not tiles: `gap: 0`, container `border-top` + `border-left`, each cell `border-right` + `border-bottom`, all `--rule`. Cells are transparent; the one under the cursor lights with the same angled warm gradient. Nothing lifts.

### Inputs / Fields
- **Style:** `--panel-2` fill on a `--field-border` hairline; the input itself is borderless and transparent, so the *wrapper* is the visible control. Text is Special Elite at `1rem`; placeholders are italic at 62% Bone.
- **Focus:** the wrapper takes `border-color: var(--color-accent-hot)` plus `--glow-red-soft`; the input additionally shows the 2px accent-hot ring. Minimum height `3rem`; checkboxes are `1.5rem` with a `2.75rem` touch row.
- **Paired controls:** field and submit button form one continuous control group — the field's right border is removed and the radii meet (`2px 0 0 2px` / `0 2px 2px 0`).

### Navigation
- Fixed header at `z-index: 10001` on a solid `#050505` band (never translucent — no gradient bleed at any scroll position), constant `0.75rem 3rem` padding so height never reflows.
- Links are mono uppercase `0.82rem` at `0.22em`, full Bone for AA contrast, `2.75rem` minimum touch height, warming to Flashbulb Red on hover/focus.
- Hides on scroll-down via `translate3d(0, -100%, 0)` only in the hidden state — the resting header stays transform-free so iOS Safari keeps extending the layout viewport behind the status bar.
- On the homepage at scroll-top the brand logo is hidden (`opacity: 0; visibility: hidden`) because the hero already carries identity; the flex slot is preserved so nav never jumps.

### Eyebrow / Index Tag (signature)
The tab of the file. A mono uppercase label at `0.3em` tracking in 62% Bone, followed by a `56px` hairline that fades from `--rule-red` to transparent. Beside it may sit the index tag: a tabular-nums number in Flashbulb Red inside a `1px solid rgba(204,0,0,0.4)` box at `0.22em 0.5em`. Centred variants drop the trailing hairline (it reads off-centre); left-aligned section heads let it flex to the column edge instead.

### Evidence Photograph (signature)
Portraits and stills are treated as case photographs: `4 / 5` frame, `grayscale(1) contrast(1.14) brightness(0.82)` at rest, a faint red interrogation-spotlight gradient over the top of the frame, an `inset 0 0 0 1px rgba(204,0,0,0.14)` hairline, and red crop brackets at two opposing corners. On hover the plate lifts `3px`, the photo pushes in (`scale(1.07)`) and thaws toward colour over `0.7s cubic-bezier(0.16, 1, 0.3, 1)`, the brackets open, and the spotlight recedes.

### Ticker (signature)
A thin `--near-black` band bounded top and bottom by `--rule`, scrolling mono topics at `0.76rem / 0.2em` in 62% Bone with `rgba(204,0,0,0.55)` separators, on a 38s linear loop. It pauses on hover (WCAG 2.2.2) and is disabled entirely under `prefers-reduced-motion`. It is a supporting band, never a glowing neon sign.

### Motion
Standard easing is `ease` at `0.2s` for colour/border state and `0.3s` for transform and shadow. The signature curve is `cubic-bezier(0.16, 1, 0.3, 1)`; entrances use `cubic-bezier(0.22, 1, 0.36, 1)`. Every one of these is neutralised under `prefers-reduced-motion: reduce`, and reveals fall back to fully visible when JS is absent so no-JS and crawler renders show complete content.

**The reveal** is a quiet fade with a short rise (`opacity` + `translateY(16px)` → none, `0.6s`). A clip-path shutter was tried and pulled — it read as heavier than the material wanted. Both properties are compositor-cheap; the resting state is `transform: none`, so nothing lingers as a containing block once the reveal settles. The IntersectionObserver fires it **early** — `rootMargin` bottom is `+15%`, so a section reveals about 15% of viewport height *before* it reaches the fold and reads as already there rather than arriving late.

**Develop** (`print-fade`, `0.6s`) staggers photographs so a grid fades its prints in one at a time rather than snapping in as a block. `--i` is set per item by the owning grid and capped at 10 steps × 55ms. Suppressed only while an enclosing `.reveal` is still closed, which covers both owners: Astro grids wait for their reveal, React grids (rendered after `astro:page-load`) fade in on first paint.

**The Rake** is red used as *light* rather than as a colour applied to a noun: a beam that crosses a section as the section crosses the viewport, driven by `animation-timeline: view()`. Strictly an enhancement — `animation-timeline` ships in Chromium and Safari but is still behind a flag in Firefox, so it sits inside `@supports` and carries no meaning, contrast or state. The beam is **full-bleed** (`inset: 0 calc(50% - 50vw)`): the tickets section is a centred max-width column, so a beam at `inset: 0` stopped at the column edge and the light read as a padded box with black sides. The Lit Section Rule applies: `.rake > *:not(.rake-beam)` is lifted to `z-index: 1` so content sits *in* the light, not under it.

**The Portrait Morph** carries the clicked lineup print into the speaker dialog's photo via the View Transitions API. A `view-transition-name` must be on exactly one element per capture, and the name must already be painted before the capture — so opening is deliberately two renders (paint the name on the card, then start the transition in an effect) and the name is handed over *inside* the transition callback, wrapped in `flushSync` so the DOM has actually changed before the second capture. See `usePortraitMorph` in `Speakers.tsx`.

## Do's and Don'ts

### Do:
- **Do** build structure from hairlines: `--rule-soft` to stitch sections, `--rule` to separate items, `--rule-strong` to bound interactive chrome.
- **Do** keep red under ~10% of any viewport, and only one red-lit element commanding each frame (**The One Mark Rule**).
- **Do** use `--field-border` on every control a visitor can type into or toggle, so it clears WCAG 1.4.11.
- **Do** light sections with `--lit` pools and `.scene-vignette` framing, and put content above them with `position: relative; z-index: 1`.
- **Do** grade every photograph to hard B&W (`grayscale(1) contrast(~1.12) brightness(~0.82)`) and dissolve it with a gradient mask rather than cutting it at a hard edge.
- **Do** build hierarchy from size, tracking, case, and face choice — the four faces are single-weight.
- **Do** set long-form copy in Special Elite at `1rem / 1.85` with a `70ch` measure, and keep ledes in italic IM Fell English under ~56ch.
- **Do** give every interactive element a visible `2px solid var(--color-accent-hot)` focus ring at `3px` offset, and a `2.75rem` minimum touch target.
- **Do** neutralise every animation under `prefers-reduced-motion: reduce`, and make marquees pausable on hover.

### Don't:
- **Don't** build a card. No four-sided border, corner radius, panel fill and drop shadow around a block of content, and no `repeat(auto-fit, minmax(280px, 1fr))` grid of equal-height panels. Use a `.ledger` of `.record`s, or a contact sheet. This is the system's hardest rule: the card grid is what made the old build read as generic.
- **Don't** flatten an object into a ledger row (**The Object Test**). A pass, a photograph, a logo plate and a downloadable asset keep their edges; only lists of records become rows. Over-applying the ledger is how tickets came to read as a bank statement.
- **Don't** strip the material along with the container. Removing the card is not the same as removing the light, the mount, the grain or the tab — that mistake is what drained the noir out of the first ledger pass.
- **Don't** express "unavailable" with `opacity` on content (**The No-Dimming Rule**).
- **Don't** use a filled coloured chip for status. Status is a mono word on a rule; the red fill belongs to the one CTA on the page.
- **Don't** give a record a hover-lift (`translateY(-4px)` + deeper shadow). The pull is horizontal and the mark is a rule.
- **Don't** run a coloured bar down one side of anything — no `border-left`/`border-right` above 1px, and no `inset` box-shadow imitating one. The 2px red left border on ledes and quoted answers is the one sanctioned exception, and it marks a quotation, not a state.
- **Don't** rotate elements for "authenticity", or simulate paper, tape, torn/deckled edges, coffee stains, or applied grain texture. That layer was deliberately removed.
- **Don't** exceed `--radius: 2px`, and apply it only to controls — containers have no corners because they have no edges.
- **Don't** introduce a second chromatic hue — no green for success, no amber for warning, no blue for information. Status is opacity, hairline weight, and a mono label.
- **Don't** add a fifth typeface, and don't reach for `font-weight: 700` on faces that ship one weight (it synthesises a fake bold).
- **Don't** let anything glow red at rest. Halation is a hover/focus/live state only.
- **Don't** fill a large area with red, or place red text on a red ground; Case Red is a fixture and Flashbulb Red is it lit, not background colours.
- **Don't** use Special Elite for labels or JetBrains Mono for sentences (**The Mono-Is-Data Rule**).
- **Don't** make the fixed header translucent or variable-height — it is solid `#050505` at constant padding, for iOS Safari stability.
- **Don't** use `overflow-x: hidden` on `html`; it turns `html` into a scroll container on iOS Safari and breaks `position: fixed` chrome. Use `overflow-x: clip`.
