---
name: DevFest.cz 2026
description: Noir, but loud, in the darkroom. Photographs are tilted paper prints on a flat black table, each with one tape and a numbered edge; the facts beside them are straight paper slips; a page spends one red grease-pencil mark. Poster-scale Bebas section heads on space, two controls, three voices (Bebas speaks, Special Elite tells, mono records figures), no arrow glyphs.
colors:
  bg: "#000000"
  text: "#FFFFFF"
  grey: "rgba(255,255,255,0.55)"
  accent: "#F11000"
  accent-hot: "#F11000"
  panel-lit: "rgba(255,255,255,0.04)"
  panel-lit-2: "rgba(255,255,255,0.055)"
  rule: "rgba(255,255,255,0.13)"
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
    fontSize: "clamp(4rem, 9vw, 8rem)"
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
  side-col: "24rem"
  side-gap: "clamp(1.5rem, 4vw, 4rem)"
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
  closer:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text}"
    padding: "{spacing.section} {spacing.gutter}"
  typed-field:
    backgroundColor: "transparent"
    textColor: "{colors.paper-ink}"
    typography: "{typography.lede}"
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
| `src/layouts/BaseLayout.scss` | all tokens (`:root`, lines 2–176), resets, global primitives, the darkroom primitives (`.paper`, `.paper-photo`, `.paper-edge`, `.tape`, `.grease`). Injected `is:global`, so every `.astro` page and `.tsx` island uses the class names directly |
| `src/styles/_type.scss` | the type recipes as mixins, one per voice — `note()`, `action()`, `cta-label()`, `mono()`, `display()`, `row-title()`, `prose()`, `hairline-link()`, `paper-action()`. A CSS Module that cannot compose a global class includes the mixin instead |
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
| p. 09 | red marks details; large red only as title bars, darkened red grounds, primary CTAs; never running text. The site spends the allowance on buttons only: no red ground |
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
| `--color-grey` | `rgba(255,255,255,0.55)` | muted meta |
| `--color-accent` | `#F11000` | the accent — CTA fill, the grease stroke, a margin mark, red words |
| `--color-accent-hot` | `#F11000` | focus rings, live status; same red, kept as a role |
| `--fs-cta` | `1.5rem` (24px) | the CTA label on red, white Bebas: the 24px regular-weight large-text line |

There is no red ground token and no ink-on-red token: red is a button,
a stroke or a word, and the button's white label is measured below.

Surfaces, white at an opacity over the black ground: `--panel-lit` `0.04`
and `--panel-lit-2` `0.055`, the "Every talk" search field's plate
(`Sessions.module.scss`). **[MUST]** A plate that must be opaque (a fixed bar
over content) layers it over `--color-bg` (the sheet ground is
`--color-bg` itself, `Sheet.module.scss`); paper is already opaque enough to sit over content
(the cookie slip, `CookieBanner.scss`). Canvas-drawn plates (speaker / attending card
monograms) fill black first, then the panel (`SpeakerCard.tsx:47–52`,
`AttendingCard.tsx:41–46`), or they export see-through. The footer ground is
`--color-bg` (`Footer.scss:10`).

**The darkroom** (`BaseLayout.scss:152–165`). Photographs and the facts that
travel with them are paper on the black table. **[MUST]** Paper is white at
an opacity, never a cream hex (the manual has no cream): `--paper`
`rgba(255,255,255,0.94)`, `--tape` `0.82`. Ink on paper is black:
`--paper-ink` `#000000`, `--paper-ink-dim` `rgba(0,0,0,0.66)` (5.3:1 on
`--paper`, the floor for small mono edge labels and notes on a print).
**[MUST] Paper is flat.** One even tone, no gradient, no curl: a print
sits on the table by the tight `--paper-shadow` (`0 1.5rem 1.5rem -1rem
rgba(0,0,0,0.85), 0 2px 6px rgba(0,0,0,0.7)`), a drop pulled in by its
negative spread so it stays under its own print and never falls across a
neighbour as a grey band, plus one contact shadow. It is a static property
of the paper, never a hover state. **[MUST] One shadow for all paper.**
Every print, slip, card, clipping and form takes `--paper-shadow`; no
paper carries a shadow of its own. A card set a gap apart takes it as is
(the `/contact` index cards through `.paper`, the clippings in
`press.scss`); a grid of close-set slips draws the same token on each
slip's `::before` under the isolated grid, so no neighbour's drop lands on
paper (`Agenda.module.scss`, `Sessions.module.scss`,
`Workshops.module.scss`). The share page's no-script slip
(`Share.astro`) loads no site stylesheet and writes the token's value out.

**[MUST] Only photographs tilt.** A `.paper` print that holds a
photograph tilts; a slip, a card, a form, a clipping or a cookie banner
sits straight, the speaker sheet's talk slips, the invite page's quote
slip and the share page's no-script slip included. The one exception is the home ticket slips, set down like
tickets on the table (`Tickets.module.scss`). Tilts are `--tilt-1`
`0.8deg`, `--tilt-2` `1.4deg`, `--tilt-3` `2.2deg`; nothing tilts past
`--tilt-3`, and under 720px a `.paper` clamps to ±`--tilt-1`
(`BaseLayout.scss`, `@media (max-width: 720px)` after `.grease`). Callers
vary the sign and take fractions of a step so neighbours never match.

Hairlines: `--rule` `rgba(255,255,255,0.13)`, `--rule-strong` `0.22`, `--rule-red` `rgba(241,16,0,0.55)`,
`--field-border` `rgba(255,255,255,0.4)`.

**[MUST] Rules only where they carry structure.** Space and paper part the
page, not lines: a section head sits on space (`.head-rule` draws no rule,
`BaseLayout.scss:362–387`), a print or a slip is set apart by its own
edge and shadow, and the footer opens on space (`Footer.scss`). A line
is drawn only in data tables (privacy policy), as a form control's
boundary (on paper a field is a 2px `--paper-ink` underline), as an
in-prose link's underline (the hero facts line's venue link,
`index.scss`), as a progress spine (the card builder's steps), as the
dashed `--field-border` outline of a place still empty (the agenda's open
slot) and as the short `--rule-strong` mark
between the two link groups in the desktop bar (`.bar-sep`, `Menu.scss`).
There is no ruled list: the sheets and the `NextStep` cards are paper.
Never a divider floating between
sections, a rule under a section head, a line above the hero's facts line,
a ruled readout (the invoice total), a rule down an agenda room column (the
gap between slips parts the rooms), a box drawn round a partner mark, or an
edge down a block's left side.

Ink ramp: `--ink-strong` `0.85`, `--ink` `0.78`, `--ink-soft` `0.7`,
`--ink-meta` `0.62`, `--ink-dim` `0.6`, `--ink-muted` `0.55`, `--ink-faint`
`0.5` (all `rgba(255,255,255,…)`). Named steps only; a one-off alpha stays a
raw literal.

**[MUST] The ground is flat black.** No spotlight pool, no haze, no
gradient under a band: `.band--lit` and the sheet ground are plain
`--color-bg` (`BaseLayout.scss`, `Sheet.module.scss`). Atmosphere left:
`--ink-monogram` `0.46` and `--ink-monogram-sm` `0.66`. Every photograph
is a `.paper` print. No glow token, no vignette, no grain.

**[MUST] No glow anywhere.** Hover and live states are flat colour changes:
an inverted fill for buttons, a border or ink change for rows and fields.
The paper shadow is the paper's, at rest and under the pointer alike.

**[MUST] Red is evidence, not mood.** Per the manual it marks details (a dot,
1–2 words in a headline, the year, CTA words, a grease-pencil stroke) and,
as a large area, only primary CTA buttons. **No red
ground**: every `Closer`, the `/partners` CTA and the newsletter sit on the
black ground (`Closer.astro`). Red is a verb: one word, one button, one
state at a time. No red washes behind photographs, no red running text, no
other accent hue, no red-to-other-hue gradients.

**[MUST] Red fills: the header's Tickets plus at most one per screen.**
The header Tickets rides on every page; under it a screen carries one red
fill at most. On `/` the hero's "Get tickets" and the live ticket slip's
Buy are on different screens; the newsletter submit and the cookie
Accept are black fills on their paper (`NewsletterForm.module.scss`,
`CookieBanner.scss`), and `/speakers` ends on a plain `.action` "Get
tickets" in its `EndLine` (`speakers.astro`). A spent wave's grease cross
is a mark, not a fill, and does not count.

**[MUST] The grease pencil is one decorative red mark per page.**
`.grease` (`BaseLayout.scss`) is an `aria-hidden` SVG stroke in
`--color-accent`, 3px, non-scaling, drawn over what it marks. A page spends
it once: frame 12A ringed on the home contact sheet (`index.astro`), the
entrance print ringed on `/venue` (`venue.astro`), the general inbox
underlined on `/contact` (`contact.astro`). The cross over a sold-out
ticket wave (`Tickets.tsx`) is functional, a state, and does not count
against the page's one mark. It is never a fill and never text.

**[MUST] One red mark per list.** A list spends red once: the invoice step
numbers are mono figures in `--ink-dim` (`.invoice-step-no`,
`invoice.scss`); on the ticket slips the live wave's red Buy button is the
mark and its state ("On sale.") is a note in `--paper-ink-dim`
(`Tickets.module.scss`). A spent wave's
grease cross is allowed beside it: it records a closed wave, not a call.

| Use of `#F11000` | Allowed? |
| --- | --- |
| a fill (a CTA background, the live dot, a margin mark) | yes |
| a full-width band or a section ground | **no** — closers and forms sit on black |
| display type, highlighted words, the year | yes |
| a rule / keyline (`--rule-red`) | yes |
| a focus indicator | yes — 4.8:1 on black |
| body copy, lore, paragraphs, inline prose links | **no** — use `--color-text`; a prose link is white on the red hairline |

**[MUST] An error is never red prose.** Every form sits on paper, where
an error is paper ink behind a red margin mark (see Forms); there is no
error-text token.

**[MUST] `--field-border` is the boundary of an interactive form control**
(WCAG 1.4.11, ≥3:1). Structural hairlines (see above) stay at `--rule`.

**[MUST] Measured ink on flat `#F11000`** (a red button) — hierarchy on
red comes from SIZE, never from dimming:

| ink | ratio | verdict |
| --- | --- | --- |
| `#000000` | 4.82:1 | anything, incl. small notes, mono figures and body copy |
| `#000000` @ 85% | ~4.2:1 | control boundaries only (1.4.11) |
| `#FFFFFF` | 4.36:1 | large text only (≥18.66px bold / 24px regular): Bebas headlines, the `cta-label` |

**[MUST] Red on paper is a mark or large type, never small text.**
`#F11000` on `--paper` measures about 3.8:1: enough for a grease stroke, a
dot and Bebas at card scale (the speaker name reached, `--fs-card-title`),
not for a note. The agenda's "Live now" stays in paper ink with a red dot
in front of it for this reason (`.flag`, `Agenda.module.scss`); on the
black table the same word is red (`.band .flagLive`). **The reach state on
paper is an ink underline or a red dot, never red text**: the open FAQ
question underlines and its marker goes to full ink (`faq.scss`), a FAQ
answer link, the partnerships and `/contact` addresses thicken their ink
underline (`partners.scss`, `contact.scss`), a clipping's "Read article"
underlines in ink, every text action on paper takes `paper-action()` (see
Component states), and a form field's
error is paper ink behind a red margin mark (`InvoiceForm.module.scss`,
`Workshops.module.scss`).

**[MUST] A label on a red button is white Bebas at `--fs-cta`.** Manual
p. 11 sets CTA labels white on red; 4.36:1 clears AA only as large text, and
Bebas has no bold, so the size carries it: `--fs-cta` is `1.5rem` = 24px,
the regular-weight large-text line. The `cta-label` mixin is
`action(var(--fs-cta))` (`_type.scss:32–37`: Bebas caps, tracking 0,
line-height 1). **Never shrink it.** Callers: `.btn-primary`
(`BaseLayout.scss`), the header Tickets (`.header-cta`, `Menu.scss`), and
the newsletter button and the cookie Accept (white on a black fill); the
cookie Decline takes its size (`CookieBanner.scss`). The live ticket
slip's Buy sets larger, at `--fs-card-title` (`Tickets.module.scss`).

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
| `--font-jetbrains-mono` | JetBrains Mono | 400, 500 | 81–88 | **records**: figures only; prices, times, indices, frame numbers, counts, codes, the footer folio. 500 for the large figures on paper (the `NextStep` index, the invoice estimate, the card builder's step numbers) |

- **[MUST] Only these three families** (`BaseLayout.scss:16–18`).
- **[MUST] Reference the injected variable, never a literal family name** —
  the resolved family is a build-time hash (`BaseLayout.scss:16–18`). Keep a
  generic fallback: `var(--font-jetbrains-mono), monospace`.
- **[MUST] Go through the recipe, not the raw declaration.** `_type.scss`
  has `note($size)`, `action($size)`, `cta-label`, `mono($size, $track,
  $case)`, `display($size)`, `row-title($size)`, `prose($size, $lh)`,
  `hairline-link($color)` and `paper-action`; a stylesheet that writes `font-family:
  var(--font-…)` by hand is re-implementing one of them.
- **[MUST] The three voices** (`_type.scss:6–9`). **Bebas speaks**:
  headlines and actions (`display()`, `row-title()`, `action()`,
  `cta-label`). **Special Elite tells**: prose and every label made of words
  (`prose()`, `note()`): the head-rule note, eyebrows, roles, captions, tape
  labels, form labels, error and pending lines, status words, the ticket
  state and deadline, agenda room notes, the hosts label, nav meta, the
  footer.
  **[MUST] JetBrains Mono records figures only** (`mono()`): prices, times,
  frame and sheet numbers on a print's edge, counts, codes, the footer
  folio. A paper edge is figures only (frame, sheet number, time, year):
  "30 / 10 / 26" on the speaker sheet's print, "2019" on the `/contact`
  press print. A word on an edge is a note (`.paper-edge .edge-word`,
  `BaseLayout.scss`: "On the back" on the home event card, the venue's
  name on the `/venue` entrance print, a clipping's outlet on `/contact`),
  and so are the agenda
  flags ("Live now", "Next", "Now") and the words on a slip's edge (track
  and length, room, "Time TBA"). **Mono never sets a word-label**; a
  tracked mono caption was
  the site's "AI" tell. A word in mono is a defect, a figure in Special
  Elite is one too (the ticket alt price "Company funded 1 452 Kč" is a
  note because it is a sentence; the folio "Case no. DF-2026" is mono
  because it is a code).
- **[MUST] `note()` is sentence case, tracking 0, line-height 1.45**
  (`_type.scss:14–20`); the typewriter does not shout. **`action()` is
  Bebas caps at `--fs-action`, tracking 0, line-height 1**
  (`_type.scss:24–30`). Neither takes a `text-transform` or
  `letter-spacing` from the caller.
- **Two recorded exceptions to mono for figures only.** (1) The press
  clipping's excerpt (the scraped standfirst) sets in mono (`press.scss`):
  Special Elite ships Latin only and a Czech excerpt is whole sentences of
  ř, ě and č. The clipping's headline is Bebas and its outlet a note on
  the edge (`contact.astro`). (2) Speaker names on the
  prints and slips stay Bebas (`SpeakerTile`, the agenda `.who`, the
  session `.names`), where manual p. 11 sets them in Special Elite: on a
  print the name is the headline.
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
  the large figures on paper: the `NextStep` index, the invoice estimate
  and the card builder's step numbers; the ticket price and the
  `/venue` card numbers are plain `mono()` at 400, tracking 0) and no italic;
  emphasis in prose is ink — `strong` / `b` step up to `--color-text` —
  never weight or slant. Don't write `font-style: italic`.

**The ramp [MUST].** Every `font-size` goes through one of these steps; add a
step here before using a new value. **[CURRENT]** ~35 call sites still bypass
it — see Open points.

Poster scale (Bebas), `BaseLayout.scss:61–79`:

| Token | Value | Line | Use |
| --- | --- | --- | --- |
| `--fs-subpage` | `clamp(5rem, 13vw, 12.5rem)` | 70 | the subpage `<h1>` in `SubpageHero` — **one per page** |
| `--fs-hero` | `clamp(4.5rem, 10.5vw, 9.25rem)` | 62 | the home statement (`index.scss:55–62`): `/`'s one display element, above every section head at every width |
| `--fs-section` | `clamp(4rem, 9vw, 8rem)` | 69 | **the section head** (`.head-rule-title`): The eleventh DevFest.cz, Tickets, Speakers, Past editions, Partners on `/`; "Every talk" on `/agenda`; "The route" on `/venue`; "In the news" on `/contact`. **And every secondary poster title**: "Newsletter", the `/venue` address and "The entrance", "Become a partner", "Press kit", and every `Closer` title (`Closer.scss`) |
| `--fs-display` | `clamp(3rem, 9.5vw, 9rem)` | 61 | the speaker sheet's name; the menu panel's primary links under 901px; the invite title; the live ticket slip's name and price on a phone |
| `--fs-h2` | `clamp(2.25rem, min(6vw, 9svh), 5.5rem)` | 66 | the FAQ categories; the session sheet's title; the `/thank-you` date; the `/invoice` steps head; the live ticket slip's name and price; the menu's primary links ≥901px |
| `--fs-h3` | `clamp(1.8rem, 3.4vw, 2.6rem)` | 67 | a ticket slip's price; `/team` names; the menu's secondary links |
| `--fs-head` | `clamp(2.1rem, 3.4vw, 3rem)` | 68 | a compact head on paper: the `NextStep` titles and index, the `/contact` index-card titles, the `/venue` card titles and numbers, a clipping's headline, the partnerships contact's name, the legal `h2`, the workshop slip title, the invoice step numbers and estimate |
| `--fs-card-title` | `1.95rem` | 71 | the speaker name on a print, the live slip's Buy label |
| `--fs-row-sm` | `clamp(1.7rem, min(4vw, 6svh), 3.4rem)`; `1.7rem` ≤600px | 78 | a ticket slip's wave name |

**[MUST] One display element per page, and it outranks the section
heads.** On a subpage that is the `SubpageHero` title (`--fs-subpage`); on
`/` the statement (`--fs-hero`, floor 4.5rem, cap 9.25rem = 148px), above
`--fs-section` (floor 4rem, cap 8rem) at every width. Every other poster
title is a section step: subpage / hero > section > h2 > h3. `--fs-h2` and
the row steps carry an `svh` term so a short desktop screen brings them
down (`BaseLayout.scss:63–79`).

Text scale, `BaseLayout.scss:83–95`:

| Token | Value | Line | Use |
| --- | --- | --- | --- |
| `--fs-label-xs` | `0.6875rem` (11px) | 83 | micro mono figure: every `.paper-edge`, the agenda and session slip edges, the FAQ question numbers, avatar counts, kit file sizes, the footer folio |
| `--fs-label-sm` | `0.74rem` | 84 | mono figure: the agenda time gutter ≤1100px, counts |
| `--fs-label` | `0.78rem` | 85 | mono figure: the ticket slip's date stamp and company figure, the FAQ index numbers, agenda break times |
| `--fs-label-lg` | `0.84rem` | 86 | mono figure: the agenda time gutter and the lounge hours, the session sheet's time, the invite meta line |
| `--fs-note-sm` | `0.85rem` | 87 | Special Elite note: roles, captions, tape labels, row metadata (the ticket alt price and edge; the speaker role and "With …"; agenda room notes; a form label on paper) |
| `--fs-note` | `0.95rem` | 88 | Special Elite note: `.eyebrow`, a speaker print's talk, the hosts label, a partner tier label, a press-kit variant label, the lounge line, nav meta, the FAQ index label, the "Every talk" search query |
| `--fs-action` | `1.3rem` | 89 | Bebas action: the text action (`.action` / `.btn-ghost`), nav toggle, desktop bar links, footer links, Sheet close, speaker social links, the session filters, "Clear", the agenda room names and the session sheet's room (`.room`) |
| `--fs-ui` | `0.95rem` | 90 | small UI prose, help text |
| `--fs-body` | `1.05rem` | 91 | long-form reading copy; an agenda slip's title |
| `--fs-body-lg` | `1.15rem` | 92 | the `.head-rule` note, subpage ledes, footnotes, a session slip's title |
| `--fs-lede` | `clamp(1.2rem, 1.6vw, 1.5rem)` | 93 | section ledes, status prose, the `EndLine`, a FAQ question, a typed field on paper |
| `--fs-title-sm` | `1.45rem` | 94 | small titles, a talk slip's title on the speaker sheet, a clipping's headline ≤720px, speaker print names ≤720px (`SpeakerTile.module.scss`) |
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
its own (the desktop bar and footer links set at 0). No `text-shadow` on
type on the black ground. **[CURRENT]** Two exceptions sit on a photograph:
the home statement (`line-height: 0.86`, `text-shadow: 0 2px 30px
rgba(0,0,0,0.6)`, `index.scss`) and the subtitle line set over the home
event print (`index.scss`, `.event-subtitle`);
both are legibility devices for type on a photograph, not a style for type
on black (see Open points).

**[MUST] JetBrains Mono tracks at `0.1em`, `0.15em` or `0.2em`** (manual
p. 10: 0.1–0.2em). A figure has no case to force: `.paper-edge` and the
footer folio keep `uppercase` at `0.12`–`0.16em`, which
only reaches a code ("DF-2026") since their words left for the note voice;
the slip edges set their times without it. The ticket price and the
`/venue` card numbers set at tracking 0.

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

**[MUST] A hyphenated word in a Bebas title never breaks at its
hyphen.** Bebas caps leave "FULL-" hanging at a line end, so the workshop
slip title holds each hyphenated word in one `white-space: nowrap` span
(`unbrokenHyphens`, `Workshops.tsx`; `.nobreak`,
`Workshops.module.scss`).

**[MUST] Sheet prose sets ragged at every width.** The speaker bio, the
talk slips under it and the session abstract are `text-align: left;
hyphens: manual` (`SpeakerDetail.module.scss`, `.bio`, `.slipDesc`;
`SessionDetail.module.scss`); justified, Special Elite opened rivers down
the whole bio.

## Spacing & layout

| Token | Value | Line | Use |
| --- | --- | --- | --- |
| `--maxw` | `90rem` (1440px) | 22 | the content column (`.u-container`, `.band-inner`) |
| `--gutter` | `min(clamp(1.5rem, 5vw, 4.5rem), 6.25vw)` | 29 | page gutter; also the negative inset for full-bleed row fields |
| `--section-y-tight` | `clamp(3.75rem, 6vw, 6.5rem)` | 32 | a cut |
| `--section-y` | `clamp(6rem, 10vw, 11rem)` | 33 | the normal beat |
| `--side-col` / `--side-gap` | `24rem` / `clamp(1.5rem, 4vw, 4rem)` | 22–23 | the right column of every head and its gap: `SubpageHero`'s note and every `.head-rule` note or action start at one x on desktop |
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

**[MUST] Two section densities:** `--section-y` the beat between
sections, `--section-y-tight` the last band's close (`BaseLayout.scss`).

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
| `max-width: 720px` | 29 | **the darkroom's phone step**: prints go one or two across and stop tilting past `--tilt-1` (`BaseLayout.scss`); the speaker grid goes two across (`SpeakerTile.module.scss`); the teaser trims; ticket slips stack; the agenda becomes the list; the FAQ index becomes a row of links; the subpage hero and every `.head-rule` stack; `Sessions`, `Sheet`, `NextStep`, the newsletter card, the `/venue`, `/contact`, `/team`, `/partners`, press and legal grids |
| `max-width: 1100px` | 16 | tablet: the `/speakers` grid goes three across; the home event grid, the `/venue`, `/contact`, press and `/partners` CTA grids go one column; the agenda tightens; `/team` three across; the FAQ grid `4fr / 8fr`; the calendar stub folds (`thank-you.scss`) |
| `max-width: 600px` | 8 | the phone type steps in `:root`; the menu bar tightens (`Menu.scss`); sheets and forms |
| `max-width: 900px` | 5 | `NextStepList` one column, the card builder, `HeroBackground`, `BaseLayout.scss` |
| `max-width: 860px` | 4 | the speaker sheet stacks, the invite page |
| `max-width: 1240px` / `1000px` | 1 / 1 | four `NextStep` cards go two across (`NextStepList.astro`); `Workshops.module.scss` |
| `max-width: 500px` | 1 | the newsletter form stacks |
| `max-width: 45em` / `23.75em` | 2 / 1 | the footer goes two columns, then one (`Footer.scss`) |
| `max-width: 700px` | 1 | `thank-you.scss` |
| `max-width: 380px` | 1 | narrowest phone (`BaseLayout.scss` header padding) |
| `max-width: 379.98px` | 1 | the header Tickets leaves the bar (`Menu.scss`) |

**[CURRENT]** `min-width` queries exist: `1100px` ×2 (the inline desktop
nav, `Menu.scss`; the press-kit page, `press/downloads.scss`), `901px` ×2
(the menu panel's poster-scale link steps and its print, the latter also
`min-height: 621px`, `Menu.scss`), `601px` ×1 (`invite/member.scss`),
`640px` ×1 (`press/downloads.scss`), and the `1921px` root scale ×3 — see
Open points.

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
| `0`–`4` | in-component ordering only (the header mark at 2 over the open menu panel at 1, `Menu.scss`; on a print, the tape at 2 and the grease stroke at 3, `BaseLayout.scss:440–454`; on the home hero, the shade 1 and the type 3, `index.scss`) | local modules |
| `-1` | a close-set slip's paper shadow, on its `::before` under the isolated grid | `Agenda.module.scss`, `Sessions.module.scss`, `Workshops.module.scss` |

**[MUST] No grain, no vignette overlay.** No page, scene or print carries
film grain or a vignette layer: the home hero has a shade
(`.hero-shade`), the invite portrait is a paper print, subpages open on
type.

**[MUST] A sheet is portalled to `document.body`** (`Sheet.tsx:88–117`)
— any positioned ancestor with a z-index traps it under the header.

**[MUST] A grid whose slips paint a `z-index: -1` layer needs
`isolation: isolate`** (`Agenda.module.scss`, `Sessions.module.scss`,
`Workshops.module.scss`), or the layer paints behind the section ground.

**[MUST] Decorative overlays are `pointer-events: none`** and stay inside
their scene, under its content.

## Motion

**[CURRENT] There are no duration or easing tokens** — every value is written at
its call site. The de-facto scale, by frequency:

| Duration | Where |
| --- | --- |
| `0.2s` (dominant) | the standard control transition: buttons, inputs, links; the text action's colour to `--color-accent-hot` (`BaseLayout.scss:695`, `727`; `_type.scss:105`) |
| `0.18s` | the desktop bar links' colour (`Menu.scss:193`) |
| `0.3s` | the cookie slip's fade (`CookieBanner.scss`) |
| `0.32s` | the sheet entry (`Sheet.module.scss`) |
| `0.6s` | a B&W speaker print developing to colour (`SpeakerTile.module.scss:53`) |
| `0.7s` | the `/team` colour bleed from the cursor (`team.scss:115`) |
| `1.3s` / `1.6s` infinite | loading pulse and skeleton shimmer while data loads (`DataState.module.scss:41`, `55`; the two blank ticket slips, `Tickets.module.scss:259–264`) |

| Easing | Where |
| --- | --- |
| `ease` | the default for control transitions |
| `cubic-bezier(0.16, 1, 0.3, 1)` | the house "arrive" curve — sheet entry (3 uses) |
| `cubic-bezier(0.22, 1, 0.36, 1)` | the portrait view transition |
| `linear` | shimmer, where any easing would read as a stutter |
| `ease-in-out` | loading pulses |

Rules:

- **[MUST] Every animation and transition has a `prefers-reduced-motion:
  reduce` opt-out**, including `scroll-behavior` (`BaseLayout.scss:229–233`),
  controls (`BaseLayout.scss`), sheet
  (`Sheet.module.scss:162`), the speaker print and name
  (`SpeakerTile.module.scss:296–301`), the
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
  from the cursor; the session sheet's speaker prints develop the same way
  (`SessionDetail.module.scss`); on `/invite/<member>` the portrait
  develops once on arrival (`.is-lit`, `invite/member.scss`). Every other
  print (the
  home event print, the contact sheet and its enlargement, the `/venue`
  entrance, the menu panel's print) stays B&W. With the portrait view
  transition into a sheet, it is the site's
  only decorative motion. The hero plate is still, and a print's tilt is
  set, never animated.
- **[MUST] Nothing moves on its own.** The ticker band, the hero countdown
  and the home topic rotor are gone (a ticking readout or a cycling word
  under a still poster was the one thing on the page that moved for its own
  sake; the topics are a "Programme" line on the event card). The agenda's
  live dot is static: the "Live now" word carries the state. Nothing
  scrolls, nothing marquees: the contact sheet is still. A text action's
  hover is a colour change to `--color-accent-hot`, nothing slides: nothing
  lifts under the pointer, and no partner mark dims.
- **[MUST] Animate only `opacity` and `transform`.**

## Component states

**[MUST] Hover paints, focus rings.** A hover treatment never also fires
on `:focus`: focus returns to a sheet's opener after it closes, and a
painted state left behind reads as stuck. **[MUST] Hover painting sits
under `@media (hover: hover)`**: on touch a tap leaves it painted.

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
name its older callers use (`Closer`, `InviteCta`, `DataState`, the cookie
Decline, the ticket slip's "Company pays", the card builders); `.action`
is the same thing by its new name: the home "All partners" and "Become a
partner", the teaser's "All N speakers", the ticket head's "Request a
company invoice", the `/venue` map links, the press-kit back link, the
`EndLine` links and `SubpageHero`'s way-across link take the class
directly. **On paper a text action takes `paper-action()`** (`_type.scss`):
`--paper-ink`, no line at rest, a 2px ink underline at a 4px offset on
hover (under `(hover: hover)`) and on focus; red text misses 4.5:1 on
paper, so the line is the reach state. One treatment for every paper
card: the ticket slip's "Company pays" (`Tickets.module.scss`), the
partnerships card's "Email Filip" at `--fs-cta` (`partners.scss`), the
`/venue` route actions (`venue.scss`), a `NextStep` card's `.step-go`
(`NextStep.scss`), the `/thank-you` calendar link (`thank-you.scss`), the
workshop slips' and sign-in's text actions (`Workshops.module.scss`) and
the card builders' (`AttendingCard.module.scss`).

**A filter is a Bebas word, red when on.** The agenda room filter
(`action(--fs-cta)`, `Agenda.module.scss:27–50`) and the session filters
(`action(--fs-action)`, `Sessions.module.scss`) are words in `--ink-soft`,
white under the pointer, `--color-accent-hot` when `aria-pressed`. No box,
no chip.

**The red fills** (see Color: the header plus one per screen). The
header Tickets is a red button at every width (`.header-cta`, `Menu.scss`:
`cta-label` on `--color-accent`, `--radius`, `padding: 0.3rem 1.1rem
0.1rem`, `min-height: var(--header-tap)`, inverted on hover), hidden under
380px and first in the menu; it is dropped on `/invite/*`. Under it, each
screen spends at most one: the home hero's "Get tickets" (`.hero-cta`),
the live slip's "Buy"; a closer's primary; the brand-manual download on
`/contact` and `/press/downloads`; the partnership deck; the invoice and
workshop sign-in submits; a sheet's "Get tickets" (`Sheet.tsx`); the card
builders' download; the `/thank-you` "Download .ics". A workshop slip's
"Register" / "Join the waitlist" is a black fill on its paper
(`.slipActionFill`). The toggle beside the
header Tickets is Bebas with no box (`.nav-toggle`, `Menu.scss`; on the
home hero's first screen its border is transparent).

The same voice sets every in-island action: the Sheet's `Close`
(`Sheet.module.scss`), the session filters' "Clear", the speaker sheet's
social links (`SpeakerDetail.module.scss`, in `--ink-soft`, no underline),
the card builders' choose and link buttons. The newsletter button and the
cookie Accept are black fills on their paper: white `cta-label` on
`--paper-ink`; on hover the newsletter button inverts to the card's
`--paper` with an ink label and border; focus draws a `--paper-ink` ring.
Neither is red: the screen's red belongs to the ticket.

**Live state is a dot and a word.** On an agenda slip "Live now" stays in
`--paper-ink` behind a static 0.5rem red dot, and "Next" in
`--paper-ink-dim`, both notes (`.flag`, `Agenda.module.scss`);
on a break line across the table the word itself is red (`.band
.flagLive`). The start time in the gutter turns `--color-accent-hot` while
something at it is live (`.tickLive`); in the phone list the group's time
carries a red "Now HH:MM" note (`.groupNow`). No pulse, no ring, no
shadow.

**A slip is the control.** An agenda slip and a session slip are each one
`<button>` that opens the sheet: no hover fill and no lift under the
pointer; focus draws the ring outside the paper at `--focus-gap-lg`
(`Agenda.module.scss`, `Sessions.module.scss`).

**A FAQ question is a row; only the open one is paper.** A closed
`<details>` is a straight row on the black table in white ink, set apart
by space alone; the open one becomes a `--paper` slip with the paper
shadow, its ink switching to `--paper-ink` (`--faq-ink`, `faq.scss`). The
`<summary>` carries no red block (a red block under a toggle stayed lit
after a tap). Its reach state is an underline under the question and its
drawn "+" marker going to full ink, under `(hover: hover)`; open, the "+"
turns 45deg into a "×". Keyboard focus draws an inset red ring
(`outline-offset: -4px`) plus the same underline (`faq.scss`). Red text on
paper misses 4.5:1.

**[MUST] Red is spent once per list, not once per row.** Resting labels
are muted typewriter notes; step numbers, frame numbers and separators are
muted too (see Color). Exception: the live wave's Buy button.

**[MUST] An open `<details>` opens on its own slip** — no panel, no wash,
no feather inside the paper, only the marker turned to "×" and the answer
under its question. The answer starts under the question text, not under
its number (`.faq-a`, `faq.scss`), so nothing shifts when it opens.

**[MUST] No opacity-based "inactive" state on content** — status is a word,
not a fade. **[CURRENT]** A spent ticket slip's paper is a shade darker
(`filter: brightness(0.93)`, `Tickets.module.scss`) under its
state word and grease cross.

**[CURRENT] Disabled controls:** the newsletter submit (`disabled` until
consent) is an outlined slot in `--paper-ink-dim` on the card (5.3:1), not
a dimmed red; the invoice submit dims to `opacity: 0.55` only while in
flight (`[aria-disabled='true']`, `InvoiceForm.module.scss`);
`/partners` marks a not-yet-live deck with `aria-disabled="true"` on a
`<span>` drawn as a dashed paper-ink slot (`.partners-cta-soon`,
`partners.scss`). See Open points.

**Loading / empty / error [CURRENT]:** skeleton (two blank shimmering slips
in the live layout, `Tickets.module.scss`, so nothing reflows on
load) or the `DataState.tsx` loading pulse, then content or the shared
`DataState.tsx` `ErrorState`. **[MUST]** Every data-backed page ships a
`.fallback-note` (`BaseLayout.scss:554`) — except `/`, see Open points.

## Forms & errors

Every form is straight paper on the black table: `NewsletterForm` (native
POST to SmartEmailing), `InvoiceForm` (Firebase callable), the workshop
sign-in (`Workshops.tsx`) and the card builders' step sheet
(`AttendingCard.module.scss`, shared by `/speaker-card`). **[MUST] A form
is not a print: it sits straight, untaped.**

- **[MUST] A field is a typed line, no box.** Special Elite `--fs-lede` on
  a 2px `--paper-ink` underline that turns `--color-accent` on focus and on
  `aria-invalid="true"`, with the keyboard ring at `--focus-gap`
  (`InvoiceForm.module.scss`, `Workshops.module.scss`,
  `NewsletterForm.module.scss`). Never `outline: none` without the ring.
  On the black ground a control keeps the `--field-border` boundary
  (≥3:1): the "Every talk" search field, its query typed as a
  `note(--fs-note)` (`Sessions.module.scss`, `.searchInput`).
- **[MUST] Minimum control height `2.75rem`.**
- **[MUST] An error is paper ink behind a red margin mark.** A per-field
  message (`note(--fs-note-sm)`) and the form's `data-tone="error"` status
  line (`prose(--fs-ui)`) set in `--paper-ink` beside a 4px
  `--color-accent` bar (`InvoiceForm.module.scss`, `.error`, `.message`;
  `Workshops.module.scss`, `.error`): red is the mark, never the words
  (#F11000 on paper is under the small-text floor).
- **[MUST] Field labels, pending and help lines are notes:**
  `note(--fs-note-sm)` in `--paper-ink-dim` for the label, going to
  `--paper-ink` while its field has focus (`InvoiceForm.module.scss`). A
  label is a word, so it is never mono.
- **[MUST] A submit button is never `disabled` for a missing input.**
  Validation runs on blur and first submit; a failed submit focuses the first
  bad field (`InvoiceForm.tsx`, `validate()`). `aria-disabled` covers only the
  in-flight submit; button states key off `[aria-disabled='true']`.
- **[MUST] Field components live at module scope** (`TextField`,
  `InvoiceForm.tsx`) — declared in a render body they remount on every
  keystroke.
- **[MUST] Status messages are announced:** `aria-live="polite"` on the message
  region, `role="status"` on success, `aria-describedby` to help text; an
  invalid field carries `aria-invalid` (`InvoiceForm.tsx`).
- **[CURRENT] Validation is native** (`required` + type/pattern, `.honeypot`)
  plus the invoice form's own rules.
- **The newsletter form is a straight paper card on the table**
  (`NewsletterForm.module.scss`): `--paper`, `--paper-ink`, the paper
  shadow, a typed edge ("DevFest.cz" as a note, a mono figure) across its
  top. Its label a `note(--fs-note-sm)` in `--paper-ink-dim`. The black
  submit sits beside the field and stacks under it ≤500px.
- **[MUST] The consent checkbox is drawn, not native**
  (`NewsletterForm.module.scss`): `appearance: none`, a 2px border in the
  card's ink (`--box-ink: var(--paper-ink)`), filled with that ink and a
  cut-out tick (`--box-tick: var(--paper)`) when checked; `--radius`
  corners, focus ring at `--focus-gap`. The UA box read as disabled.
- **Form pages.** `/invoice` runs two plain bands: "How it works" as a
  numbered list on black (mono `--fs-head` numbers, three across), then
  the paper form on an `8fr / 4fr` grid with its `EndLine` beside it (one
  column ≤1100px, `invoice.scss`). `/workshops` sets the sign-in as a
  sticky paper form on a `5fr / 7fr` grid beside the workshop slips (one
  column, max `44rem`, ≤1000px; `Workshops.module.scss`). The card
  builders (`/attending`, `/speaker-card`) put the straight paper step
  sheet (max `47.5rem`) on 7 of 12 columns and the live preview beside it
  on 5, mounted as a tilted print, the canvas its photograph
  (`AttendingCard.module.scss`, `.cardWrap`).

## Images & media

- **[MUST] A photograph is a paper print.** `.paper` (`BaseLayout.scss`)
  is the white border (`--paper`, `0.65rem` on three sides, open at the
  foot for the edge), the paper shadow and a `--tilt`; `.paper-photo` is
  the black well inside it, its `<img>` covering the well in
  `grayscale(1) contrast(1.1)`; `.paper-edge` is the margin under the
  photograph: mono figures (a frame or sheet number, a date or a time) at
  `--fs-label-xs` in `--paper-ink-dim`, pushed apart, a word on it a note
  (`.edge-word`). Every photograph on the site is one, the speaker sheet's
  and the session sheet's speakers included.
- **[MUST] One tape per print, top-left, never truncated.** A `.tape` on a
  print (`.paper > .tape`) overlaps its top edge at `top: -0.85rem; left:
  1rem` (z 2) with a typewritten label, one line at `width: max-content`.
  A label that does not fit gets a shorter text (`SpeakerTile`'s
  `tapeShort` on a phone) or a smaller tape, never an ellipsis; as a last
  resort it wraps inside the print. A host's print carries no tape (the
  "Hosts" label over their row says it).
- **[MUST] A group label is plain, never tape.** A partner tier, the home
  partner rows, the hosts, an agenda room, a press-kit variant: a
  `note(--fs-note)` in `--ink-meta` (or a Bebas `--fs-action` room name on
  the agenda), no tape (`partners.scss`, `.tier-label`; `index.scss`,
  `.partners-label`; `SpeakerTile.module.scss`, `.hostsLabel`;
  `press.scss`). Tape is for prints. The session sheet's room sits on its
  slip as a plain Bebas label (`.room`, `SessionDetail.module.scss`).
- **[MUST] The portrait well is 4:5**: every speaker print
  (`SpeakerTile.module.scss`), the speaker sheet's print, the session
  sheet's speaker prints, every `/team` mugshot, the invite portrait, the
  partnerships contact's mug.
- **[CURRENT] Other ratios in use:** `2.39 / 1` the home event print
  (`4 / 3` ≤720px, `index.scss`); `3 / 2` the contact-sheet frames, the
  home enlargement and the `/contact` press print (`index.scss`,
  `press.scss`); `4 / 3` the `/venue` entrance print; `3 / 4` the menu panel's
  print (`Menu.scss`); press-kit previews `16 / 9`
  (`press/downloads.scss`). The home hero has no ratio: `#hero` is
  `min-height: clamp(45rem, 62vw, 56.25rem)` (`47.5rem` ≤720px) and the
  photograph fills its right-hand 74% (`index.scss`).
- **[MUST] Portraits crop `object-fit: cover`**, the speaker print at
  `object-position: 50% 0%` so the heads line up along a row
  (`SpeakerTile.module.scss`), `/team` at `50% 28%` (`team.scss`), the
  speaker sheet's print and the session slip avatars `center 22%`
  (`SpeakerDetail.module.scss`, `Sessions.module.scss`), the session
  sheet's speaker prints `50% 25%`.
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
  (`og/invite/[member].jpg.ts`).
- **[MUST] Logo minimum: 180px wide for the logo itself** (manual, digital) —
  188–190px for the artboard (header 38px tall = 190px). Never typeset the
  name as a second wordmark. The official mark shows twice: in the header
  and as the footer sign-off at poster scale (see Footer anatomy).
- **[MUST] The header logo never shrinks.** `.brand-logo` is `max-width:
  none`; `.brand` is `min-width: max-content` in a flex bar that puts the
  space between the mark and the actions (`Menu.scss`). The bar gives way
  instead: ≤600px a tighter inset (`min(var(--gutter), 3.2vw)`), `0.5rem` /
  `0.375rem` gaps, a square toggle and a narrower Tickets button; under
  380px the header Tickets is hidden and stays the first menu line. That is
  the only way to keep the full logo and an AA-sized CTA label in one row
  at 320 / 360px.
- **[MUST] The standalone symbol is white or dark only** (favicons, app
  icons); never red.
- **[MUST] Partner and press logos are `object-fit: contain`** — never cropped
  (`_logos.scss`, `press/downloads.scss`).
- **[MUST] Partner marks keep their original colours** (brand manual
  p. 15: the one exception to the three-colour rule). Never recolour,
  flatten to white, tint or dim a partner logo, not even under the
  pointer; a linked mark shows its focus ring and nothing else. One recipe
  for the home wall and the `/partners` wall: `partner-logo()` in
  `src/styles/_logos.scss`. `LogoMono` in `src/lib/partners.ts` flags
  masters made for a light ground (`dark`: Dotěkománie, White Whale Media),
  which sit on a paper card; a master that is its own tile (`tile`) is
  shown as supplied and on `/partners` takes the paper shadow; every other
  master is shown as supplied.
- **[MUST] The partner wall draws no tiles of its own.** No cell, no
  border, no lit plate: open marks on the black table. The one paper is the
  dark-ink card: on `/partners` it is a straight `--paper` chip, `0.75rem
  1.1rem` of padding, the paper shadow (`partners.scss`). Each tier is a
  `9rem` label column beside its marks (the label over them ≤1100px): the
  `h2` is the plain tier label, the tier name plus an `sr-only` "partners"
  (`partners.astro`, `.tier-label`). The marks sit in one left-set flex
  row wrapping when it must (`.wall`), except Diamond two to a row and
  Gold three to a row on a grid so the strong sizes line up into columns
  (≤720px Diamond one column, Gold a wrapped row). The tier order is the
  ladder, then Community, then Media, at every width.
- **[CURRENT] Rank is the tier's box; marks in a tier carry equal ink.**
  Each tier has a reference box (`CELLS`, `partners.ts`, px: Platinum
  600×300, Diamond 330×190, Gold 260×150, Silver 210×120, Community and
  Media 180×100). `partnerLogo()` fits each mark into a box of the same
  area shaped to its ratio (`opticalBox()`, capped so no mark outgrows the
  box) and hands the width to the stylesheet as `--logo-w`; the
  `partner-logo` mixin sets `width: calc(var(--logo-w) *
  var(--logo-scale, 1)); height: auto` (`_logos.scss`). No height per
  tier. `/partners` sets each tier larger than its box through
  `TIER_SCALE` (`partners.astro`: Platinum and Diamond 1.5, Gold and Silver
  1.28, Community and Media 1.2), one size per tier, passed to
  `partnerLogo()` so the srcset is cut for the rendered size. Narrower
  screens step whole tiers down through `--logo-scale`: Diamond and Gold
  0.86 ≤1100px; ≤720px Diamond 0.6, Gold 0.75, Silver 0.7, Community and
  Media 0.8 (`partners.scss`). `plated` is a per-partner flag, not a tier
  inversion.
- **[CURRENT] The home partner wall** (`index.astro`, `index.scss`): the
  `.head-rule` "Partners" with the two text actions "All partners" and
  "Become a partner" in the note's place, then one row per tier under a
  plain label (`.partners-label`, `note(--fs-note)` in `--ink-meta`), top
  tier first: Platinum and Diamond side by side on a `5fr / 7fr` grid, Gold
  and the rest across the page; Silver and Community share the last row
  under one label ("Silver and community", or "Community"), each mark still
  sized by its own tier; Media on `/partners` only. The wall uses the
  reference boxes as they are (`STRIP_SCALE = 1`); each tier's
  `--logo-scale` sets the rank on this page (Platinum 0.85, Diamond 0.9,
  Gold and Silver 1, Community 1.1; 0.55 to 0.85 ≤720px).
- **[MUST] A missing photograph falls back to initials** at `--ink-monogram` /
  `--ink-monogram-sm` (4.21:1 / 7.71:1, `BaseLayout.scss`).
- **[MUST] Photography is B&W at high contrast** (manual p. 13).
  **[CURRENT]** Every `.paper-photo` rests at `grayscale(1) contrast(1.1)`
  (`BaseLayout.scss`), the speaker sheet's and the session sheet's prints
  included; the speaker prints at `contrast(1.15)`
  (`SpeakerTile.module.scss`); the home event print darker at
  `brightness(0.7)` under its subtitle and the contact-sheet frames at
  `contrast(1.15) brightness(0.9)` (`index.scss`); the session slip
  avatars at `contrast(1.1)`; the hero plate at `contrast(1.12)` (see Open
  points). Only the speaker prints (on the grid and in the session sheet),
  `/team` and the invite portrait develop to colour.
- **[MUST] Every `<img>` below the fold is `loading="lazy" decoding="async"`**
  with intrinsic `width`/`height`; above the fold `eager`. Local assets use
  Astro `<Image>` with `layout: 'constrained'`, `responsiveStyles: true`
  (`astro.config.mjs`).
- **[MUST] Decorative images take `alt=""`** (the contact-sheet frames,
  `index.astro`; the menu panel's print and the `/contact` press print,
  both `aria-hidden`; `press/downloads.astro`).
  Where a print repeats what a frame already shows, the print carries the
  description (the home enlargement, `index.astro`).
- **[CURRENT]** Imagery is `.webp`; OG card `.jpg` 1200×630
  (`public/og-image.jpg`: "30 OCT 2026" with only "2026" red, the official
  white red-dot logo, a white CTA label on red). **[MUST]** The detective key
  art, `/hero-detective.webp`, is the home hero's alone (`HeroBackground`,
  `index.astro`: `width="74%"`, full opacity, `focus="38% 42%"`;
  `#hero .hero-photo` re-masks it to fade in from the left and takes
  `grayscale(1) contrast(1.12) brightness(0.95)`, `index.scss`; full width
  over the top of the hero ≤720px). `HeroBackground` has no other caller.
  **[MUST] A subpage opens on type.** `SubpageHero` takes no photograph:
  every subpage opens on its title and lede. `/venue` shows its one print,
  the entrance, in a band; `/contact` its 2019 press print beside the
  clippings; the lineup's portraits and the agenda's slips start right
  under the title. Beyond the hero, `/`
  carries three photographic blocks: the event print of the mill
  (`uhelny-mlyn-chimney`), the speaker prints in the teaser, and the "Past
  editions" contact sheet of eight frames with one enlarged (`STRIPS`,
  `index.astro`, from `public/gallery/`). The menu panel carries one print
  of the venue (`.nav-print`, see Menu).

## Component conventions

- **[MUST] Astro for layout and static UI; React islands only for behaviour**
  (`HeroOffer`, `NewsletterForm`, `Speakers`, `SpeakersTeaser`, `Sessions`,
  `Agenda`, `Tickets`, `InvoiceForm`).
- **[CURRENT] `client:load` by default;** `NewsletterForm`
  (`index.astro`) and the invite closer's `InviteCta` use `client:visible`.
  `Tickets` takes `client:load` (`index.astro`): the hero's "Get tickets"
  jumps straight to it. **[MUST] An island that renders nothing until data
  resolves takes `client:load`** — a zero-height placeholder never intersects
  (`SpeakersTeaser`, `index.astro`).
- **[MUST] Styling location:** islands import a co-located CSS Module; Astro
  components use a sibling `.scss` or global primitives; pages use
  `src/pages/<page>.scss`.
- **[MUST] Global primitives are used by class name, never copied.**
- **[MUST] Anything on more than one page is a component or a primitive.**
- **[MUST] A measured value is decided once, as a token.**

Primitives, all in `BaseLayout.scss`:

| Class | Line | What it is |
| --- | --- | --- |
| `.u-container` | 347 | centred column at `--maxw` with the page gutter |
| `.page-stack` | 545 | every page's `<main>`; its last `.band` closes on `--section-y-tight` (624) and the footer adds no opening air |
| `.band` (+ `--lit` 605) / `.band-inner` | 589 / 628 | a section's ground, flat black; `--lit` is the same flat black, kept as the class of the form, legal and reference subpages (`/agenda`, `/faq` among them). There is no `--accent` variant. **[MUST] One gap between two sections**: a band followed by a closer hands its bottom air to the closer (`.band:has(+ .closer-band)`, 617), and consecutive bands of one page do the same (`/agenda`, `/invoice`), so two paddings never stack |
| `.eyebrow` | 355 | plain typewriter note (`note()`, `--ink-muted`) — no decoration, no trailing hairline, never uppercased; the head of a `NextStepList`, a `Closer` eyebrow |
| `.head-rule` (+ `.head-rule-title`, `.head-rule-note`) | 335 | **the section head**: a `<header>` (or `<div>`) on `SubpageHero`'s grid, `minmax(0, 1fr) minmax(0, var(--side-col))` with `--side-gap` between, aligned to the foot (`align-items: end`): the Bebas `--fs-section` title (`display()`) left and, in the right column, at most one note set as `prose(--fs-body-lg, 1.6)` in `--ink-soft` (max `34ch`) or the section's text actions, so every head's note starts at the hero note's x; a head with no note spans both columns (`> :only-child`); one column ≤720px; no rule, space closes it (`margin-bottom: clamp(2.5rem, 5vw, 4.5rem)`). The class keeps its old name |
| `.paper` | 393 | **a paper print**: `--paper` border (`0.65rem 0.65rem 0`), `--paper-ink`, `--paper-shadow`, `rotate(var(--tilt, 0deg))`; ≤720px the tilt clamps to ±`--tilt-1`. Also the class of a straight paper card, slip or form that carries no photograph (the `/venue` and `/contact` index cards, the `NextStep` cards, the partnerships card, the invoice and workshop forms, the `/thank-you` stub); those set no `--tilt` |
| `.paper-photo` | 403 | the black photograph well inside a print; its `<img>` covers it in `grayscale(1) contrast(1.1)`; the caller sets the ratio |
| `.paper-edge` | 418 | the print's bottom margin: two items pushed apart, `mono(--fs-label-xs, 0.12em, uppercase)` in `--paper-ink-dim`; a word on it is an `.edge-word` note |
| `.tape` (+ `.paper > .tape` 447) | 436 | a strip of tape: `--tape` ground, `note(--fs-note-sm)` in `--paper-ink`, `0.35rem 0.85rem 0.3rem`, a 1px contact shadow, `rotate(var(--tape-tilt, -1.5deg))`. Only on a print: one per print, over the top edge at the top-left (`top: -0.85rem; left: 1rem`, z 2), one line at `width: max-content`, never cut with an ellipsis (see Images) |
| `.grease` | 461 | the red grease pencil: an absolutely placed, `aria-hidden`, `pointer-events: none` SVG at z 3; its `path` is a 3px `--color-accent` stroke, round caps and joins, `non-scaling-stroke`. The caller sets the box. One decorative mark per page (see Color) |
| `.display` (+ `.red` 494) | 484 | poster headline; `.red` only on the home hero statement (see Structural rules) |
| `.fallback-note` | 565 | the no-JS / endpoint-down prose |
| `.anchor-target` | 581 | a jump lands on the section head |
| `.closer` family | 636 | the closing statement (see `Closer.astro`), on the black ground |
| `.btn-primary` | 693 | the red fill; white Bebas `cta-label`, no glyph |
| `.btn-ghost` / `.action` | 733 | the text action: Bebas `--fs-action` caps, no box, no underline, no glyph; red on hover (see Component states) |
| `paper-action()` | `_type.scss:118` | **the text action on paper**, a mixin: `--paper-ink`, no line at rest, a 2px ink underline at 4px offset on hover and focus (see Component states) |
| `hairline-link()` | `_type.scss:99` | **the in-prose link**, a mixin only (the old `.hairline-link` class is gone): plain `underline` in `--rule-red` at 3px offset, white, lit to `--color-accent-hot` on hover/focus (SC 1.4.1: colour alone does not mark it). **[MUST]** A link inside running text on the black table takes it as is (`privacy-policy.scss`, the ticket footnote, the forms' consent lines, the hero facts line's venue link, the press-kit footnote, the FAQ and `/team` inbox addresses); never a red-text variant, red is not running text. On paper an in-prose link is a 1px `--paper-ink` underline (the FAQ answers, the `NextStep` notes). A standalone link is an `.action`, never underlined |
| `.scene` | 690 | `position: relative` for the home hero (`#hero`) |
| `.skip-link` / `.sr-only` | 290 / 333 | see Accessibility; the skip link is set in the action voice |
| `.status-bar-cover` | 954 | iOS safe-area paint |

Shared components: `SubpageHero.astro` (takes `titleHtml`, `lede`,
`seoHeading`, `titleId` and an optional `link`), `HeroBackground.astro`
(the home hero's plate: a `focus` crop, a `src` plate, default the
detective key art, an opt-in `width` / `size`, the two opacities),
`Closer.astro` (takes an extra `class`; every closer renders on black),
`EndLine.astro`,
`Menu.astro`, `Footer.astro`, `CookieBanner.astro`, `NextStep.astro`,
`NextStepList.astro`, `DataState.tsx`, `SpeakerPhoto.tsx`, `SpeakerTile.tsx`
(the speaker print and `billLineup()`), and `Sheet.module.scss` (the shared
detail-view chrome for `SessionDetail` / `SpeakerDetail`).

- **`SubpageHero.astro`** — every subpage opens on type
  (`SubpageHero.scss`): the title Bebas `--fs-subpage`, `text-wrap:
  balance`, left; beside it the lede, `prose(--fs-body-lg, 1.6)` in
  `--ink-soft` (max `34ch`), and the optional way-across `.action` under it,
  on a `minmax(0, 1fr) / minmax(0, var(--side-col))` grid with
  `--side-gap` between, aligned to the foot, so the note sits on the
  title's last line. **[MUST] One column for every note**: `--side-col`
  (`24rem`) and `--side-gap` are shared with `.head-rule`, so every section
  head's note on the page starts at the hero note's x. It carries no
  photograph. ≤720px the title and the lede stack. Its padding is the
  only clearance under the fixed header; its bottom padding
  (`clamp(3.5rem, 7vw, 6.5rem)`) is the pause before the first band, which
  opens with no top padding of its own (`.subpage-hero + .band`,
  `BaseLayout.scss`). Compact on purpose: the first content row shows
  without scrolling.

- **`EndLine.astro`** — the last line of a page that asks for no decision,
  in place of a `Closer`: one Special Elite `--fs-lede` line in `--ink-soft`
  and one `.action` at `--fs-cta` (Bebas caps, no glyph, no underline) to
  the useful next step, plus an optional second one (`also`), on one
  baseline, wrapping under on a phone; `6rem` of air above it, inside the
  last band's inner column (`EndLine.astro`, `EndLine.scss`). Where the
  next step is an address (`/faq`, `/team`) the action is the address
  itself, typed: a `note(--fs-lede)` on the in-prose underline
  (`faq.scss`, `team.scss`). Ends `/speakers` ("Full agenda" and "Get
  tickets"), `/attending`, `/invoice`, `/thank-you`,
  `/newsletter-subscription-thank-you`, `/contact`, `/press/downloads`,
  `/faq`, `/team`.
- **`NextStepList.astro`** — the cards and their head: a typewriter
  `.eyebrow` `h2` (`label`, `labelId` for the section's `aria-labelledby`),
  then a `<ul>`, or `<ol>` when `ordered` (a real sequence), of `NextStep`
  cards laid straight on the table, stretched to one height: three across,
  four when there are four (two ≤1240px), one column (max `36rem`) ≤900px,
  air between them, never a rule (`NextStepList.astro`). Never a poster
  head: the card titles under it are the larger type. `/404` "Try one of
  these", `/thank-you` "Before you go", `/newsletter-subscription-thank-you`
  "While you wait".
- **`NextStep.astro`** — one thing to do, a straight paper index card
  (`.paper`, `NextStep.scss`): an optional mono `--fs-head` index figure at
  500 in paper ink (`index`, `01`, visual only — the `<ol>` carries the
  order), the errand as a Bebas `--fs-head` title, the note as
  `prose(--fs-body)` in paper ink, and its actions at the card's foot:
  ghost by default as `.step-go` (Bebas `--fs-cta` through
  `paper-action()`: no line at rest, a 2px ink underline on hover and
  focus), or the red fill; the default slot, for media, sits in the same
  foot (`.step-foot`). **[MUST] Across a row the cards line up**: each
  card spans three row tracks of the list (four with an index) through
  `grid-template-rows: subgrid`, so every note and every foot starts at
  one height however many lines a title takes; without subgrid the foot
  drops to the card's bottom edge (`margin-top: auto`, `NextStep.scss`).
- **`DataState.tsx`** (`ErrorState` / `EmptyState`) — left-set; **an empty
  state always offers somewhere to go**.
- **`SpeakerPhoto.tsx`** — no URL or a failed load both land on the monogram;
  caller passes classes for the shape.
- **Speaker print** (`SpeakerTile.tsx`, `SpeakerTile.module.scss`) — every
  speaker is a paper print set down on the table, the same print on `/`
  and on `/speakers`, in running order (`billLineup()`: timed talks by
  start, then room; then untimed talks; then the hosts). The whole print is
  the control (`.paper` on the `<a>` or `<button>`): one tape at its
  top-left naming the room ("Time to be announced"; on a phone the short
  label, "Time TBA"), the 4:5 B&W portrait cropped from the top centre so
  the heads line up, then the caption on the paper: the name Bebas
  `--fs-card-title` (`row-title()`, line-height 0.92) in `--paper-ink`, the
  role (`cleanTagline()`) as a `note(--fs-note-sm)` in `--paper-ink-dim`,
  wrapping, never cut, the talk title as a `note(--fs-note)`, "With …" for
  co-speakers, and the edge pinned to the print's foot: "NN / NN" running
  number and the CET start. A row's prints are one height: the caption
  takes the slack (`.cell`, `.caption`). A host's print carries no tape and
  no time. Tilts cycle `--tilt-2`, `-tilt-1`, `--tilt-1`, `-tilt-2` so
  neighbours never match (`TILTS`). Reached, the name turns
  `--color-accent` (Bebas at card scale, large enough on paper) and the
  portrait develops; focus draws the ring at `--focus-gap-lg`. **[MUST] Every
  print is the same size**, the opening keynote (the first timed talk of
  the day) included: only its tape says "Opening keynote, <room>". On a
  phone two to a row, names at `--fs-title-sm`. The grid (`.grid`) is four
  columns (`/speakers`: three ≤1100px; the home teaser stays four), two
  ≤720px, `grid-auto-flow: row dense`, gap `clamp(3.5rem, 5vw, 4.5rem)` ×
  `clamp(1.5rem, 2.8vw, 2.5rem)` with `1rem` of top padding for the first
  row's tapes.
- **Speakers teaser** (`SpeakersTeaser`, home) — a different random
  handful of the lineup on every visit (`pickTeaser`), shown in running
  order with each print's number from the full lineup. Head: the `.head-rule` "Speakers" with the note
  "N confirmed. Times in CET." (the count a mono figure); then eight prints
  (`TEASER_SIZE`), two whole rows of four; each an `<a>` to the speaker.
  ≤720px the prints from the seventh on are hidden: three rows of two. Under the grid one `.action`
  at `--fs-cta`, "All N speakers". No rotation while the page is open. The teaser opens on
  `--section-y` and closes on none, like every home section; nothing
  renders until the lineup resolves (`SpeakersTeaser.tsx`).
- **Speakers lineup** (`Speakers`, `/speakers`) — every speaker with a talk
  as a print on the same grid, each a `<button>` that opens the speaker
  sheet; the pressed print's photograph carries the view transition and
  morphs into the sheet's (`usePortraitMorph`; `SpeakerLineup`,
  `Speakers.tsx`). The first four prints load eagerly. The hosts follow in
  the same grid and the same prints under a plain "Hosts" label
  (`.hostsLabel`, `note(--fs-note)` in `--ink-meta`), so the speakers above
  fill whole rows and the running number stays continuous. The page ends on
  its `EndLine` ("Every talk by time and room.", the `.action`s "Full
  agenda" and "Get tickets"; the header Tickets is the page's red). No
  closer. No placeholder print for names still to come.
- **Speaker sheet** (`SpeakerDetail`) — a print and a reading column. Left,
  the speaker as a large `.paper` print, sticky while the bio scrolls (max
  `30rem`; `min(20rem, 82%)` once the sheet stacks ≤860px): tilted
  `-tilt-1`, the room on its tape, a 4:5 `.paper-photo` that receives the
  portrait morph, the edge "30 / 10 / 26" and the start time. Right, the
  reading column: the name at `--fs-display`, the tagline as a note, the
  links, the bio (`prose(--fs-body-lg, 1.75)`, max `62ch`, ragged), then
  the talks as paper slips (the title Bebas `--fs-title-sm`, the abstract
  ragged), straight. No kicker. Links are named Bebas `--fs-action` text in
  `--ink-soft`, no underline, lit to `--color-accent-hot`: the network's
  name for a known kind ("LinkedIn", "GitHub"), the bare domain for a
  website; no icons. The accessible name says who, what, the host and
  "opens in a new tab" (`SpeakerDetail.tsx`, `SpeakerDetail.module.scss`).
- **Session sheet** (`SessionDetail`) — the talk as one big flat paper slip
  (max `58rem`, `SessionDetail.module.scss`): the room as a plain Bebas
  `--fs-action` label (`.room`, no tape), the time a mono `--fs-label-lg` figure and the tags
  a note on its edge, the title `display(--fs-h2)`, the abstract a ragged
  reading column. Beside it (under it ≤1100px) the speakers as small 4:5
  `.paper` prints, tilted in turn, each a `<button>` that opens the speaker
  sheet on top and develops to colour when reached. Under both, the sheet's
  red "Get tickets" (`SheetTickets`, `Sheet.tsx`).
- **Sessions** (`Sessions`, "Every talk") — every talk as a straight paper
  slip on the table, two to a row (one ≤720px), on a `2.25rem × 1.75rem`
  gap. Flat paper over black with the shadow on a `::before` under the
  isolated grid, like the agenda slips. A slip is one `<button>` that opens
  the session sheet: its edge (time and room left, track right, in
  `--paper-ink-dim`: the time a mono figure, the words notes), the title
  `prose(--fs-body-lg, 1.3)`, three lines of the abstract as
  `prose(--fs-note-sm)` in `--paper-ink-dim`, and at its foot the speakers'
  avatars (paper-ringed, `grayscale(1) contrast(1.1)`, initials **under** a
  lazy or failed photo, `CardAvatars`) beside their names in Bebas
  `--fs-action`. An unscheduled talk shows "Time TBA" (plus the room if it
  has one) where the time goes. On a phone the slips are compact and drop
  the abstract, and before any search or filter the section is one line
  inviting the search, the field and the track filter; the slips come with
  the first query or chip (`.invite`, `Sessions.module.scss`). The filters
  are Bebas words (see Component states).
- **Agenda** (`Agenda`) — the day as slips on the table (`Agenda.tsx`,
  `Agenda.module.scss`). Over it, a bar: the room filter ("All rooms" and
  each room, Bebas `--fs-cta`, red when pressed) left and "All times
  Prague (CET)" as a note right. **A room open all day (the lounge) is one
  line above the sheet, not a column**: the room in Bebas, "<title>, open
  all day <hours>, drop in any time" as a `note(--fs-note)` in
  `--ink-soft`, the hours mono; a `<button>` that opens its sheet, out of
  the live and coming-up state (`LONG_RUN_MIN` 180 minutes, `LoungeLine`,
  `.lounge`). **Desktop (>720px)**: the remaining rooms, three in practice,
  are columns under their names (`.headLabel`, Bebas `--fs-action`, no
  tape; a standing note under a name where a room needs one, "Workshops
  only"); a mono `--fs-label-lg` gutter names each start time. The grid is
  **not to scale**: one row per moment something starts or ends, each as
  tall as what sits in it, so a lunch never outweighs the talks around it
  (`AgendaGrid`). Every talk is a straight `.slip` from its start line to
  its end line, one sheet of paper over its whole span (a workshop
  included): flat paper over black, no radius, `0.875rem 1rem 1rem`, the
  paper shadow on a `::before` under the isolated grid; its edge carries
  the time range (mono `--fs-label-xs`) and the track and length (a note),
  both in `--paper-ink-dim`, then the title `prose(--fs-body, 1.3)` and the
  speakers in Bebas `--fs-action`, then the live or next flag (see
  Component states). A break or lunch is a quiet typewriter line across
  the rooms, mono time and title in `--ink-soft`; the evening programme
  after the last talk is louder (`--fs-lede`, white) and names its room. A
  speakerless "TBA"/"TBD" slot is "Slot open": a dashed `--field-border`
  outline with its time and a note, not a control (`.open`). One room
  picked, the grid narrows to `44rem`. **Phone (≤720px, JS `NARROW`)**: the
  same day as one compact list grouped by start time: a mono `--fs-body-lg`
  time head per group (with a red "Now HH:MM" while live), then each slip
  with its room named on its edge (time and room on the first line, track
  and length on their own); a break alone at a moment is a quiet line with
  no head (`AgendaList`). Abstracts, tags and photos live only in "Every
  talk" below. On a phone the "Every talk" head drops its note (the list
  invites the search itself, `agenda.astro`).
- **Menu** (`Menu.astro`, `Menu.scss`) — the bar is the mark left and the
  actions right (`display: flex; justify-content: space-between`). **At
  ≥1100px the destinations sit in the bar** (`.bar-nav`): Speakers, Agenda,
  Venue, FAQ in `--color-text`, a short `--rule-strong` mark, then
  Partners, Team, Press and Contact in `--ink-soft`, every link Bebas
  `action()` at tracking 0, the current page in `--color-accent-hot` with
  `aria-current`, red on hover; then the red Tickets button; the toggle is
  hidden. Under 1100px the toggle and the Tickets button stay and every
  destination lives in the full-screen panel. The header mark link is a
  full 44px tap target and stays over the open panel (z 2). Open, the
  toggle label reads "Close". The open panel is one column of links: the
  five primary destinations (Tickets, Speakers, Agenda, Venue, FAQ), then
  the second tier, Partners, Team, Press (`/contact#press`) and Contact.
  The primary links set at `--fs-display` (`--fs-h2` ≥901px, `--fs-h3` on a
  short screen) and the second tier at `--fs-h3`. Beside the links, where
  the panel has room (≥901px wide and ≥621px tall), one print of the venue
  (`.nav-print`): `.paper`, tilted `--tilt-2`, taped with the venue's name,
  a 3:4 photograph, the edge "30 / 10 / 26" and the doors time,
  `aria-hidden`.
- **Cookie banner** (`CookieBanner.astro`, `CookieBanner.scss`) — a small
  straight paper slip at the foot of the table: fixed bottom right on a
  wide screen (`min(28rem, …)`, clear of the hero's ticket button), across
  the foot of a phone; `--paper`, `--paper-ink`, the paper shadow, no
  tilt, no edge drawn round it. Accept is the black fill, Decline a
  paper-ink text action; no red, the screen keeps its red for the ticket.
  It fades in and out (opacity and a `1.5rem` drop over `0.3s`, none under
  reduced motion).

**Structural rules [MUST]:** no decorated eyebrow; red text is flat; **the
red word and the closing full stop belong to the home hero statement**
(and the invite title). Subpage hero titles carry neither (see the title
list under Voice); every `SubpageHero` title is migrated. Section heads and every `Closer` title
are plain white, because a red final word on ~30 headlines made none of them
the loud one. On `/` the sections open on a `.head-rule` at poster scale:
"The eleventh DevFest.cz", "Tickets",
"Speakers", "Past editions", "Partners"; "Newsletter" is a `.display` `h2`
on its own card's column. Space under the head, never a rule. No numbered
eyebrow, no stamp. Headings are literal: no puns.

**[MUST] A head note carries a fact, never a label of the section's own
contents.** The note exists only where it tells the visitor something the
section does not already show: Speakers ("N confirmed. Times in CET."),
Past editions ("Ten editions since 2015."), Tickets (the invoice route:
"Need to pay by bank transfer?" over the `.action` "Request a company
invoice", `Tickets.tsx`; "Opens with the first wave" before the
first wave), "Every talk" (how to search), "The route" (the train and the
walk), "In the news" (where the press kit is). Partners takes its two text
actions in the note's place; The eleventh DevFest.cz opens on the title
alone. A note that only names what follows is filler and is left off.
Section titles say what the section is; a full stop belongs to a statement,
not a label. Section heads left-set; detail views are full-bleed sheets.

**Each page ends on its one next step.** `Closer.astro` ends a page that
asks for a decision, on the black ground, its title at `--fs-section`:
`/agenda`, `/workshops`, `/venue`, `/invite/<member>`. A page that asks
for none ends on an `EndLine` (list above): `/speakers` ("Full agenda" and
"Get tickets", no closer), `/contact` after its press kit, `/team` on
"Want to help next year?" and the inbox address. `/partners` ends on its
"Become a partner" block (the title beside the partnerships card), `/404`
on its `NextStepList`, and `/privacy-policy`, `/code-of-conduct` and
`/delete-account` on their content.

**The footer is the open sitemap [MUST].** Under 1100px the menu hides
every destination behind one toggle, and the desktop bar leaves out the
company invoice, the code of conduct and "I'm attending", so `Footer.astro`
lists every page in two groups, *Attend* and *About*, with the menu's
labels. A new route is added to both.

**Footer anatomy:** the logo → five columns → the folio line, parted by
space, never a rule (`Footer.scss`). The footer adds no opening air of its
own: the page's last band closes on `--section-y-tight` and that is the
only space above the sign-off (`.page-stack > .band:last-child`,
`BaseLayout.scss`). **[MUST] The footer signs off with the official logo
file**, never the name typeset: `src/assets/logo.png` through Astro
`Image`, `min(40rem, 80vw)` wide and pulled left by the file's own
transparent margin (83 of 3000 px) so the mark starts on the text column,
alt "DevFest.cz 2026", a link home with the focus ring and no hover
treatment (`.footer-logo-link`, `Footer.astro`). The columns: the brand
(the tagline and the inbox link), *Attend*, *About*, *Event* (Date, Place
as a map link, Format) and *Organizer* (the GUG.cz line and the social
marks, one row at every width, each glyph at its target's left edge so the
first lines up with the column), on a `1.4fr` + four `1fr` grid; two
columns with the brand across the top ≤45em, one ≤23.75em. Column titles and the Event terms are `note(--fs-note-sm)` in
`--ink-meta`, sentence case, no tracking; the links are Bebas `action()` in
white at tracking 0, red on hover. The bottom line: `© 2026 GUG.cz, z.s.` left, the folio `Case no.
DF-2026` centre, "Open source" right as an underlined note, no off-site
glyph. The folio is the case-file mark the manual prints on every page and
the footer's one mono figure: a `<small class="folio" aria-hidden="true">`
at `mono(--fs-label-xs, 0.16em, uppercase)` (`Footer.astro`,
`Footer.scss`); decorative, so it stays out of the accessibility
tree. Ground `--color-bg`.

## Anatomy of a page

**[MUST] A subpage is:** `SubpageHero` → `.band` sections → `Closer` where
the page asks for a decision, otherwise an `EndLine` inside the last band →
`Footer`. No `Ticker` anywhere (it was the same five topics under every
hero, then under the home hero only; now no page renders it). The first
band after the hero opens with no top padding (`.subpage-hero + .band`,
`BaseLayout.scss`): the hero's bottom padding is the pause, and neither
draws a line between them. Between two sections there is one gap, never
two paddings stacked (`.band:has(+ .closer-band)`; see the primitives). The legal pages
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
			<!-- link={{ href: '#talks', label: 'Browse all talks' }} for a way across -->
		/>
		<section class="band band--lit" aria-label="…">
			<div class="band-inner">
				<!-- The hero names the first band, so its head is sr-only. -->
				<h2 class="sr-only">…</h2>
				<!-- a component grid, paper cards or a reading column -->
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

- **Type first.** Every subpage opens on type alone; the detective art is
  the home hero's. A page's photographs live in its bands: `speakers` and
  `agenda` (prints and slips right under the title), `venue` (the
  entrance), `contact` (the 2019 press print), `team` (the crew prints).
- **Legal pages.** Inside the band a `.reading` grid, `3fr / 9fr` (`4fr /
  8fr` ≤1100px, one column ≤720px): a sticky contents index on the left
  (a note label, mono numbers and Bebas `--fs-action` links, red on hover)
  and the `.policy` reading column (max `68ch`, `prose(--fs-body, 1.8)`,
  `h2` `row-title(--fs-head)`, `h3` a `note(--fs-body-lg)`)
  (`privacy-policy.scss`, shared by all three). Data tables are never
  ruled: each row is an entry whose cells print their column head from
  `data-label` as a note, a `6.5rem` label column at every width, one
  column ≤720px. `/code-of-conduct` adds a straight paper card for the
  listeners with paper-ink actions.
- **`.band--lit`.** The class of the form, legal and reference pages
  (`/agenda`, `/faq`, `/workshops`, the thank-you pages, the card builders,
  `/404`, `/press/downloads`, the legal pages). It is the same flat black as
  `.band`: there is no spotlight. The darkroom pages (`/speakers`,
  `/venue`, `/invoice`) run plain `.band`s, and `/partners`, `/contact` and
  `/team` their own black sections.
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
  one fact or the section's actions in the right column, the column the
  hero's note takes.
- **Eyebrows on a `Closer`.** Only when the eyebrow carries a fact the title
  does not (`invite`: "The list closes"). A mood label
  ("Be there", "Join us") above the closing title is filler; leave it off.
- **`/thank-you`, `/newsletter-subscription-thank-you`, `/404`** run
  `SubpageHero` → `.band--lit` with a `NextStepList` →
  `EndLine` (not `/404`). `/thank-you` opens the band on the calendar as a
  straight paper stub (`.event-stub.paper`, `thank-you.scss`): "Put it in
  your calendar" as a note, the date `display(--fs-h2)` from
  `EVENT.dateLabel`, a Time / Place list with note terms and mono hours,
  then the red "Download .ics" and "Google Calendar" as a paper-ink
  underlined action; three columns, two ≤1100px with the actions across,
  one ≤700px. Then "Before you go", share and an `@media print` block.
- **`/app`** (`app.astro`, `app.scss`) — a type-only hero ("Get the
  app"), then the App Store and Google Play badges straight under it on
  black (the venue QR codes land here, so a phone sees them on the first
  screen), the visitor's own store first with a red "Your phone" note, and
  the web app as an `.action` under them. **The store badges are the one
  control the site does not draw**: Apple's and Google's artwork,
  unaltered, at one height (their guidelines forbid recolouring). A store
  without a link yet shows its name and "Coming soon", never a dimmed
  badge. Then "What's inside" as four straight paper index cards (the
  `/venue` route card: mono number, Bebas `--fs-head` title, paper-ink
  prose; four across, two ≤1100px, one ≤600px) and an `EndLine` to the
  agenda.
- **`/venue`** (`venue.astro`, `venue.scss`) — a type-only hero
  ("Venue"), three plain `.band`s, then the closer. **The address**, type
  only: a note "Address", the street at `--fs-section`, the post code (mono)
  and town as a lede, the doors and keynote hours, and the two `.action`s
  "Open in maps" and "Station to venue". **The route**: the `.head-rule`
  "The route" with the train and the walk as its note, then two straight
  **index cards** in an ordered list (`display: contents`, so the `<ol>`
  keeps the order for AT) side by side at one height, and "Flying in" as a
  full-width card under them (a two-column grid, one column ≤720px). A
  step card carries a large mono number (`mono(--fs-head)`, tracking 0),
  the Bebas `--fs-head` title, `prose(--fs-body)` in paper ink with
  `strong` place names on a faint highlighter, a `<dl>` of facts (Get off,
  Ride / Walk, Distance), and, on the walk, an `.action` in paper ink that
  underlines in ink on hover and focus (`.action.venue-go`). **The
  entrance**: the page's one print, the doors, a 4:3 `.paper` tilted
  `--tilt-1`, taped "The black metal building", its edge the venue's name
  as a note and the doors time in mono, ringed in grease (the page's one
  mark), beside "The entrance" at `--fs-section` and one line on a `7fr /
  5fr` grid. The closer's title sets at `--fs-section`.
- **`/faq`** (`faq.astro`, `faq.scss`) — the category index pinned on the
  left (`position: sticky` under the header): a "Categories" note, then a
  mono number and a Bebas `--fs-cta` name per category, red on hover and
  focus (on black); under it "Write to us" and the inbox address as a typed
  note on the in-prose underline. The questions sit on the right, on a
  `3fr / 9fr` grid (`4fr / 8fr` ≤1100px). ≤720px the index becomes a
  wrapped row of Bebas `--fs-action` links above the questions and the
  inbox line drops. Each category is a Bebas `--fs-h2` head; under it every
  question is a `<details>` **row** on the black table, one width, one left
  edge, straight: "Q nn" as a mono figure, the question as
  `prose(--fs-lede)` in white, a drawn "+" marker in `--ink-dim`. **Only
  the open question is paper**: a `--paper` slip with the paper shadow and
  a little air above and below, its ink `--paper-ink`, the "+" turned to
  "×", the answer `prose(--fs-body)` under the question text (max `62ch`).
  The first question opens on arrival. The page ends on its `EndLine`.
- **`/partners`** (`partners.astro`, `partners.scss`) — a type-only hero,
  then one wall per tier under its plain label (see Images &
  media), then "Become a partner": the `.display` title at `--fs-section`
  left and the partnerships card right on a `5fr / 7fr` grid (one column
  ≤1100px). The card is a straight `.paper` with "2026" on its edge, the
  contact's 4:5 mug, a `--fs-lede` line, the name in Bebas `--fs-head`, the
  role as a note, the address as an underlined link (a thicker ink line on
  hover), then the red "See partnership deck" and the paper-ink `.action`
  "Email Filip".
- **`/contact`** (`contact.astro`, `contact.scss`, `press.scss`) — a
  type-only hero, then the three inboxes as straight typed **index cards**
  in one row of equal cards (two columns ≤1100px with the general card
  across, one ≤720px): each a `.paper` with "0n" on its edge, a Bebas
  `--fs-head` title, a line and the address; the general inbox's address
  is underlined in grease, the page's one mark. These cards and the
  clippings take `--paper-shadow` like all paper. **In the news**: the `.head-rule` with the
  press-kit note, then the clippings as straight paper slips cut square
  beside a past-edition print taped "DevFest.cz 2019" (3:2, `--tilt-2`,
  its edge "2019"); each slip is one link: the outlet (a note) and the
  date (mono) on its edge, the headline Bebas `--fs-head` (`--fs-title-sm` ≤720px), the
  excerpt in mono (Czech diacritics; the recorded exception in
  Typography), "Read article" in Bebas, underlined in ink when the slip is
  reached; focus rings outside the slip. **Press kit**: the `.display`
  title at `--fs-section`, a note, the brand manual as the red download
  (its format and size inside the button), and beside them one plain label
  per logo variant with its formats as Bebas download actions and mono
  sizes, two columns (one ≤720px). The page ends on its `EndLine` ("Need a
  format we have not published?", "Write to us").
- **`/team`** (`team.astro`, `team.scss`) — type-only hero, then every
  member as a print on a four-column grid (three ≤1100px, two ≤720px),
  tilts repeating every four and never past `--tilt-2`: the 4:5 B&W
  mugshot with the colour bleeding from the cursor, the name Bebas
  `--fs-h3`, the role as a note, links as Bebas actions, the edge "NN" and
  "2026". No tape: hovering or focusing a card cross-fades the role into
  the member's codename in full paper ink (`.crew-role[data-swap]`); with
  no hover (a phone) both lines print, the codename under the role. It ends on its `EndLine` "Want to help next year?" and
  the inbox address.
- **`/press/downloads`** — under a plain note label per logo variant, one
  straight `.paper` card: the mark in a 16:9 well on the paper (on black
  for a white mark), its formats as Bebas download actions with mono
  sizes; one column, two ≥640px, four ≥1100px, separated by air. The
  brand manual is the page's red download, its format and size inside the
  button (`press/downloads.scss`). The back link is the `.action` "Back to
  In the news" to `/contact#press` (an `.anchor-target`); the page ends on
  the same `EndLine` as `/contact`.
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
  padding (`.sec`, `index.scss`); the next head is the cut, so there is one
  section gap between two sections. The ticket slips and the speakers
  teaser set the same rhythm on their roots (`--section-y` above, none
  below; `Tickets.module.scss`, `SpeakersTeaser.module.scss`). The page
  spends one decorative grease mark, frame 12A on the contact sheet.
- **The home hero** (`#hero`, `index.astro`, `index.scss`):
  `min-height: clamp(45rem, 62vw, 56.25rem)` (`47.5rem` ≤720px), black,
  type at the foot. `HeroBackground` puts the detective art on the right
  74%, fading in from the left; `.hero-shade` lifts the type off it (the
  bar's shade at the top, the left third to black under the statement, the
  foot to black so the page runs on). Set left over it, on the page
  column: the statement (`h1.hero-statement.display` at `--fs-hero`,
  line-height 0.86, max `6.2em`, the red word and the full stop; see
  Typography for its text-shadow); the facts line; the page's red "Get
  tickets" (`.btn-primary.hero-cta`, `padding: 1rem 2.5rem`; full measure
  ≤720px). No stamp, no logo in the hero (the bar carries the mark), no
  rotor, no countdown.
- **The facts line** (`.hero-facts`, `index.astro`, `index.scss`):
  typewriter `note(--fs-body-lg)` in `--ink-strong`, spaced by gap with no
  separators: the date as a mono `<time>` in white, the venue as a maps
  link on the in-prose underline, and `HeroOffer` — the wave on sale ("Last
  chance" for the final wave), "· until <date>" when it has one, and "from
  <price>" linked to `#tickets`, at the line's one size (`note(1em)`), the
  price a mono figure a step down (`mono(0.86em)`, like the line's other
  figures; `HeroOffer.tsx`, `HeroOffer.module.scss`). ≤720px the facts stack one
  per line.
- **"The eleventh DevFest.cz"** (`index.astro`, `index.scss`):
  the `.head-rule` title at `--fs-section`, no note, then on an `8fr / 4fr`
  grid (one column ≤1100px): a widescreen print of the mill (2.39:1, 4:3
  ≤720px) taped "Uhelný Mlýn, Libčice nad Vltavou" (`EVENT.venue`), with the line "One day
  in a converted coal mill 25 minutes north of Prague, for 350 medior and
  senior developers from across CEE." set over the photograph like a
  subtitle, tilted `-tilt-1`, its edge "02 · 2.39 : 1 · 08:00"; and beside
  it the back of the print, a straight paper card (`.event-card`) with the
  edge "On the back" as a note and the facts as a `<dl>`: the term a
  `note(--fs-note-sm)` in `--paper-ink-dim`, the value a `note(--fs-body)` —
  Date (a `<time>`), Place, Doors (mono "08:00–20:00"), Audience (mono
  "350", "developers"), and **Programme**: the `TOPICS` joined by middle
  dots, the line that replaced the rotor.
- **"Past editions"** (`index.astro`, `index.scss`),
  after the speakers teaser: the `.head-rule` "Past editions" with its note
  set beside the title, not across the page; then on a `7fr / 5fr` grid
  (one column ≤720px) the **contact sheet** and the **enlargement**. The
  contact sheet is a dark card (`rgba(255,255,255,0.055)`, tilted
  `-0.6deg`, flat ≤720px) holding two strips of four frames on black with
  sprocket holes along both edges (`radial-gradient`), each frame a 3:2 B&W
  photograph under a mono frame number ("11A", "12" …, running on like a
  roll of film); the hall, frame 12A, is ringed in grease, the page's one
  mark; the sheet's foot reads "2015 · 2025". The sheet holds photographs,
  so it tilts like a print. Four across, two ≤720px. The frames are
  decorative (`alt=""`). The enlargement is that frame as a 3:2 paper
  print tilted `--tilt-3`, taped "The big hall", edge "12A · 2025", and it
  carries the description. Nothing scrolls, nothing develops.
- **The partner wall on `/`** — see Images & media.
- **The newsletter** (`index.astro`, `index.scss`): two
  equal columns (one ≤720px): left the `.display` "Newsletter" at
  `--fs-section` (never broken) over a
  `prose(--fs-body-lg)` lede in `--ink` (max `30ch`); right the form as a
  straight paper card (see Forms).
- **The bar over the home hero.** The mark and the red Tickets stay in the
  bar at every scroll position. At the top of the page the bar's ground is
  the scrim only, and the toggle's border is transparent (`Menu.scss`).
- **The ticket slips** (`Tickets.tsx`, `Tickets.module.scss`): the
  `.head-rule` "Tickets" with the invoice route as its note ("Need to pay
  by bank transfer?" over the `.action` "Request a company invoice" at
  `--fs-cta`): a quiet side door, never a second red button. Then one
  paper **ticket slip** per wave, **the only paper without a photograph
  that tilts**: tickets set down on the table. **The wave on sale leads**:
  with one on sale the slips sit on a grid (`.slipsLed`, `minmax(0, 35rem)
  minmax(0, 28rem)`, spread to the head's edges), the live slip first and
  largest on the left spanning the rows, the other waves small in the
  right column stacked from the top; with none on sale they wrap in a flex
  row aligned to the foot. **The big slip** is tilted `--tilt-1`: the wave
  name Bebas `--fs-h2`, the price mono at `--fs-h2`, the other variant's
  price as one note line under it
  ("Company funded 1 452 Kč", the figure mono), the state as a
  `note(--fs-body-lg)` in `--paper-ink-dim` ("On sale.", "The final wave,
  on sale.", and the deadline when ti.to set one), a perforation (a row of
  punched holes through to the table, bleeding to both edges), then the
  slip's foot: the VAT line and the mono event date stamp left, the red
  `Buy` at `--fs-card-title` and the paper-ink "Company pays" right. **A
  spent wave** is a small slip (`flex: 5 1 18rem`, max `34rem`) tilted
  `-tilt-3`, its paper a shade darker, its price (mono `--fs-h3`) in
  `--paper-ink-dim`, perforated, its state ("Sold out.", "Ended.") as the
  note, and crossed out corner to corner by the grease pencil: a state, not
  the page's decorative mark. **A wave still to come** is a small plain
  slip tilted `-tilt-1` with its state. ≤720px the slips stack full width,
  the live one first, every wave name at `--fs-h2` and the live slip's
  name and price at `--fs-display`; the slips are not `.paper`, so they
  keep their tilt.
  Under the slips, while a later wave is still to come, the footnote
  (`prose(--fs-body-lg)` in `--ink-meta`, max `70ch`) links the
  newsletter. The skeleton is two blank shimmering slips in the led
  layout, big then small.
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
- **A `<details>` list opens with its first item open** (`faq.astro`).
  A section must not reuse the hero's `aria-labelledby` (`landmark-unique`).
- **`Closer` ground.** Every closer renders on the black `.band`
  (`Closer.astro`), its title at `--fs-section`. A `Closer` ends a page
  that asks for a decision
  (buy, register, come); a reference page ends on an `EndLine` (`/faq`:
  "Still stuck?" and a `mailto:` link) or on its content (`privacy-policy`,
  `code-of-conduct`, `delete-account`).
- **`/faq` content.** The detective-theme question sits in Essentials
  (`src/content/faq.json`).
- **`/venue` links.** Both map links ("Open in maps", "Station to venue")
  are text actions, by the address and again on the walk card: two ways
  to the same place are not two decisions; the page's red is the closer's
  button.

**[MUST] The darkroom's rules for a new surface.** A photograph is a
`.paper` print with a `.paper-edge`; a fact that travels with it (a ticket,
a talk, an inbox, an open question) is a straight paper slip or card in the
same flat paper and ink. One tape per print, top-left, never cut; a group
label is plain type, never tape. A page spends one decorative grease mark.
Only prints tilt (the home ticket slips the one exception), by a fraction
or a step of `--tilt-*`, alternating so neighbours never match, and never
past `--tilt-3`. On a phone every print but the keynote is equal and barely
tilted. The ground is flat black, the paper flat, its shadow the tight
`--paper-shadow`. Type on paper is `--paper-ink` / `--paper-ink-dim`; red
on paper is a stroke, a dot or a button, not small text.

## Iconography

**[MUST] No icon library.** The inline `<svg>` elements are the
`Footer.astro` social marks, each `aria-hidden="true"` beside a visible text
link, the Sheet's close cross (`Sheet.tsx`), the "Every talk" search glass
(`Sessions.tsx`) and the card builders' drop marks (`AttendingCard.tsx`),
all drawn inline and `aria-hidden`, plus the grease strokes. Don't add an
icon package for a UI glyph. Speaker-sheet links are
named text, not network glyphs (`SPEAKER_ICON_PATHS` is deleted): three
identical chain icons told the visitor nothing.

**[MUST] No arrow glyphs.** The trailing `→` on links, the `↗` off-site
marker and the teaser's arrow column are deleted (see Component states): a
glyph renders differently on every system and the label already names the
destination. The Sheet's "Close" carries a drawn cross, not a text glyph.
No emoji in UI copy.

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
"The team", "FAQ", "In the news", "Press kit", "Become a partner");
a `.head-rule` note is a fact or absent ("N confirmed. Times in CET.",
"Ten editions since 2015."). The case dressing is the darkroom's own: the
frame numbers and dates on a print's edge and the footer's folio. No triads, no em-dash chains, no hype words.

**[CURRENT] Subpage titles** (`SubpageHero titleHtml`): `/speakers`
"Speakers", `/partners` "Partners", `/team` "The team", `/faq` "FAQ",
`/agenda` "Agenda", `/venue` "Venue", `/contact`
"Contact", `/press/downloads` "Logos & assets", `/invoice` "Buy on a
company invoice", `/workshops` "Save a seat at a workshop", `/attending`
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
  paper, an error in paper ink behind a red mark. On paper, small text is
  `--paper-ink` or `--paper-ink-dim` (5.3:1), never red (see Color).
  Don't dim ink on red; change size.
- **[MUST] Focus is always visible:** `:focus-visible { outline: 2px solid
  var(--color-accent-hot) }`. Gap by how much edge the control has:
  `--focus-gap-tight` (own boundary), `--focus-gap` (type on ground),
  `--focus-gap-lg` (alone in space) (`BaseLayout.scss:138–142`); a whole
  print, slip or card that is the control rings outside its paper at
  `--focus-gap-lg`. Commented exceptions: the FAQ question's inset ring
  (`outline-offset: -4px`, `faq.scss`), the newsletter submit's
  `--paper-ink` ring on its card, and a partner logo's wider `6px` gap on
  the home wall and `/partners` (`index.scss`, `partners.scss`).
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
  print (the menu panel's print, the `/contact` press print). **[CURRENT]** Most paper edges are `aria-hidden` too (the home
  prints, the `/contact` and `/team` cards); the speaker print's tape and
  edge are read as part of its link or button. A label that names a group
  is real text (the `/partners` tier `h2`, the hosts `h3`, the agenda room
  heads).
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
   drops to `opacity: 0.55` while submitting (`InvoiceForm.module.scss`).
   The newsletter's disabled state now uses a dedicated colour pair instead.
4. **Three ways to say "not available":** disabled `<button>`,
   `aria-disabled` `<span>` (`partners.astro`, the deck slot), and a
   spent ticket slip's state note under a grease cross.
5. ~~**No `aria-invalid` in `src`.**~~ Done: the invoice fields carry
   `aria-invalid` and `aria-describedby` (`InvoiceForm.tsx`) and the typed
   line turns red on it.
6. ~~**Orphaned token.**~~ Done: `--fs-title-compact` is deleted.
7. **`min-width` queries** against a max-width convention: `1100px` ×2
   (the inline nav, `Menu.scss`; `press/downloads.scss`), `901px` ×2
   (`Menu.scss`: the panel's link steps and its print), `601px` ×1
   (`invite/member.scss`), `640px` ×1 (`press/downloads.scss`).
8. **JS-only breakpoint:** the header's `760px` auto-hide
   (`Menu.astro:283`) matches no stylesheet query. The agenda's switch is
   `720px` in JS and CSS alike.
9. ~~**Special Elite declares no `subsets`**~~ Resolved: Latin-Ext letters
   fall to JetBrains Mono via the Fonts API `fallbacks` (see Typography).
10. **Split with `CLAUDE.md`.** Rules live here; `CLAUDE.md` points here.
    Nothing enforces it.
11. ~~**`Closer` default `tone="raised"` renders `band--raised`, which has
    no CSS.**~~ Resolved: `Closer.astro` has no `tone` prop; every closer
    renders on the black `.band`.
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
    is flat paper.
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
    (`BaseLayout.scss`, the sheets' prints included), the speaker prints
    and the contact-sheet frames at `1.15`, the hero plate at `1.12`
    (`index.scss`). Manual p. 13 asks for high contrast and also allows
    speaker portraits in colour on black.
29. ~~**`.head-stack` and `.head-split` have no caller.**~~ Done: both
    are deleted with `.head-title` and `.head-note`; `.head-rule` is the
    one section head.
30. **Two `text-shadow`s on photographs** against the Bebas rule's "no
    text-shadow": the home statement (`index.scss:61`) and the subtitle
    set over the home event print (`index.scss`, `.event-subtitle`), legibility lifts for
    white type on a photograph with no scrim. Decide whether a shade or a
    darker grade replaces them, or state the exception in the rule.
31. **`.btn-ghost` is a stale name.** It draws the text action but every
    caller still says "ghost", and the `--field-border` comment in
    `BaseLayout.scss` still describes the outlined box it used to be.
    Rename the callers to `.action` and fix the comment.
32. ~~The cookie buttons track a Bebas label.~~ Done: the `letter-spacing` line is gone.
33. ~~One arrow glyph left.~~ Done: the press-kit back link reads "Back to In the news".
34. **`Desk.scss` is orphaned.** `Desk.astro` is deleted and nothing
    imports `src/components/Desk.scss`. Delete the file.
35. ~~JetBrains Mono 700 is loaded with no caller.~~ Done: the Fonts API entry loads 400 and 500.
36. ~~The header stamp is unrecorded elsewhere.~~ Done: the stamp is gone;
    the bar is the mark, the inline links (≥1100px) and the Tickets button.
37. ~~More than one red fill on a page.~~ Done: red fills are the header's
    Tickets plus at most one per screen (Color). The newsletter submit is a
    black fill, the `/speakers` "Get tickets" a plain `.action`; a spent
    wave's grease cross is a mark and stays.
38. ~~The darkroom bends the type rules.~~ Done: paper edges are figures
    only, their words notes (`.edge-word`); the agenda and session flags and
    slip-edge words are notes; the hero stamp reads "01 · 30.10.2026"; the
    footer titles and terms are sentence-case notes and its links track 0;
    the ticket price and `/venue` card numbers are plain `mono()`. Two
    recorded exceptions (Typography): the mono clipping excerpt, Bebas
    speaker names. The desktop bar links set at tracking 0.
39. ~~The footer typesets the name.~~ Done: the sign-off is the official
    logo file at `min(40rem, 80vw)` (Footer anatomy).
40. ~~Motion and dimming the rules forbid.~~ Done: no slip lifts, no
    partner mark dims (Motion, Images & media).
41. ~~Red text on paper.~~ Done: the reach state on paper is an ink
    underline or a red dot (Color).
42. ~~The section heads outrank the home statement.~~ Done: `--fs-section`
    is `clamp(4rem, 9vw, 8rem)` and `--fs-hero` `clamp(4.5rem, 10.5vw,
    9.25rem)`; every secondary title moved to `--fs-section`, so a page has
    one display element (Typography).
43. ~~Two stray edges.~~ Done: the lounge is one line above the agenda
    sheet and the `/venue` route actions are `.action`s in paper ink.
44. ~~Tilt everywhere.~~ Done: only photo prints tilt; slips, cards, forms,
    clippings, the FAQ and the cookie slip sit straight; the home ticket
    slips are the one exception (Color).
45. ~~Tapes as labels.~~ Done: one tape per print, top-left, never cut
    with an ellipsis; group labels (partner tiers, the home partner rows,
    the hosts, agenda rooms, press-kit variants) are plain type (Images).
46. ~~A grease mark per section.~~ Done: one decorative mark per page
    (frame 12A, the `/venue` door, the `/contact` inbox); the keynote
    corners, the "350" ring and the ride ring are gone; the sold-out cross
    is functional (Color).
47. ~~The spotlight and the long shadow.~~ Done: the ground is flat black
    (no spotlight layer), the paper flat with the tight `--paper-shadow`, and
    one section gap everywhere (`.band:has(+ .closer-band)`, the last band
    on `--section-y-tight`, no footer margin).
48. ~~**Paper that still tilts without a photograph.**~~ Done: the
    speaker sheet's talk slips, the invite quote slip and the share page's
    no-script slip sit straight (Color).
49. ~~**Dead primitives and tokens.**~~ Done: `.print`, `.field` /
    `.field-row`, `.scene-vignette` and its grain, `.head-split` /
    `.head-title` / `.head-note`, `.head-stack`, `.record-status`,
    `_controls.scss` with `lit-field()`, and every token with no `var()`
    caller (`--lit`, `--print-mount`, `--wash`, `--wash-strong`,
    `--field-feather`, `--on-accent`, `--on-accent-ink`,
    `--on-accent-border`, `--color-cream`, `--color-error`, `--panel`,
    `--panel-2`, `--panel-hover`, `--rule-soft`, `--section-y-wide`,
    `--fs-row-figure`, `--fs-title-compact`) are deleted. `.scene` stays
    on `#hero`.
50. ~~**Two words in mono.**~~ Done: a clipping's outlet is an
    `.edge-word` note (`contact.astro`) and the "Every talk" search types
    its query as a `note(--fs-note)` (`Sessions.module.scss`).
51. ~~**Two kinds of paper shadow.**~~ Done: all paper takes
    `--paper-shadow`; the `/contact` cards and the clippings take it as is,
    close-set slips draw it on a `::before` under their isolated grid
    (Color).
52. ~~**The session sheet's room wears `.tape` and undoes it.**~~ Done:
    the room is a plain `.room` label (`SessionDetail.module.scss`).
