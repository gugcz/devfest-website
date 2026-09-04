Design system for the DevFest.cz 2026 site. Every value below was read back out
of the codebase and carries its source as `file:line`, so a reviewer can check a
claim without trusting this file.

The style *rationale* (why the eyebrow lost its hairline, why lists have no
rules, why detail views are sheets) lives in `CLAUDE.md` → "Styling
Conventions". This file is the reference: the values, the names, the rules.

## How to read this document

Every rule is labelled, because a design doc nobody can apply during review is
decoration:

| Label | Meaning |
| --- | --- |
| **[MUST]** | binding. A PR that breaks it is wrong and should be sent back. It is either enforced by `npm run a11y`, or it is a decision the redesign exists to protect |
| **[CURRENT]** | a description of the state of the code today. Useful for matching what is already there; not a rule, and changing it is a normal design decision, not a violation |

Where the code contradicts itself, this file **does not smooth it over** — see
"Open points" at the end. Line numbers are against the commit this document
ships in; if one has drifted, the token name is the durable reference.

## Where things live

| | |
| --- | --- |
| `src/layouts/BaseLayout.scss` | all tokens (`:root`, lines 1–161), resets, global primitives. Injected `is:global`, so every `.astro` page and `.tsx` island uses the class names directly |
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

Surfaces: `--panel` `#0C0B0B` (134), `--panel-2` `#111010` (135), `--panel-hover`
`#161413` (136), `--panel-lit` `#0A0908` (175), `--panel-lit-2` `#0E0C0B` (176).

Hairlines: `--rule` `rgba(240,237,230,0.13)` (118), `--rule-soft` `0.06` (119),
`--rule-strong` `0.22` (120), `--rule-red` `rgba(204,0,0,0.55)` (121),
`--field-border` `rgba(240,237,230,0.4)` (131).

Atmosphere: `--glow-red` / `--glow-red-soft` (162–163), `--lit` (190),
`--vignette` (195), `--field-feather` (193), `--print-mount` (170–172),
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

- **[MUST] Only these three families.** Never add a fourth to
  `astro.config.mjs` (`BaseLayout.scss:21`).
- **[MUST] Reference the injected variable, never a literal family name.** The
  resolved family is a build-time hash (`BaseLayout.scss:15–20`). Every call
  site keeps a generic fallback: `var(--font-jetbrains-mono), monospace`.
- **[MUST] Roles do not mix.** Special Elite is wide and wrapped a three-word
  title over three lines at `--fs-h2`; Bebas is condensed, which is what makes
  the poster scale fit the column.
- **[CURRENT]** Bebas and JetBrains Mono subset `latin` + `latin-ext`; Special
  Elite declares no `subsets` (`astro.config.mjs:96`) — see Open points.

**The ramp [MUST].** Every `font-size` goes through one of these steps. Pick the
nearest; do not introduce a new value without adding it here. **[CURRENT]** the
code does not hold this line yet — 18 declarations bypass the ramp with an
absolute literal today, plus a handful more that inherit or compute off one.
See Open points for the full list and the same claim's other copy, in a source
comment at `BaseLayout.scss:98`.

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

**[MUST]** Display type is set through `--lh-display` (`0.84`, line 114) and
`--track-display` (`0.005em`, line 115) — never a per-file `line-height` — and
carries **no `text-shadow`**.

**[CURRENT]** Mono labels are uppercase at `0.22em`–`0.24em` tracking
(`.btn-primary` 787, `.record-status` 1054, `.skip-link` 322).

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

**[MUST] Three section densities, not one** (`BaseLayout.scss:43–45`) — a single
tempo across every section is what makes a long page read as generated.

**[MUST] Row rhythm is the `--field-step` variable on the row**, not a value
each caller picks, because the padding is simultaneously the rhythm and the band
the reach field fills (`BaseLayout.scss:913–932`): `clamp(1.9rem, 2.8vw, 2.5rem)`
default, `clamp(2.25rem, 3.6vw, 3.25rem)` for `--short`. Vertical only — a row
has no horizontal padding at any width.

## Breakpoints

**[MUST] Max-width media queries, mobile last.** There is no named breakpoint
variable set; use a value already in the histogram rather than inventing one.

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

**[CURRENT]** `min-width` is no longer a single outlier: **7** call sites —
`SpeakersTeaser.module.scss:60` plus the six `press/downloads.scss:109,113,117,131,135,139`
added by merges since this document's baseline (`7b96e4d`, where the count was
0). See Open points.

**[MUST]** There is no horizontal-nav breakpoint: `Menu.astro` is a three-slot
bar with all destinations behind one toggle at **every** width
(`Menu.scss:1–13`). Do not re-add a desktop nav.

**[CURRENT]** Two behavioural breakpoints live in JS, not CSS: the header
auto-hide-on-scroll is limited to `matchMedia('(max-width: 760px)')`
(`Menu.astro:217`), and the agenda view switch uses
`matchMedia('(max-width: 1024px)')` (`Agenda.tsx:52`). Neither value is in any
stylesheet — see Open points.

## Z-index & layering

**[MUST]** These are the layers. A new fixed/overlay element joins one of them
rather than picking its own number.

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

**[MUST] A sheet is portalled to `document.body`** (`createPortal`,
`SpeakerDetail.tsx:69–73`). It renders from inside an island in `<main>`, and any
positioned ancestor with a z-index traps it in that stacking context — on
`/speakers` the fixed header (10001) drew straight over the sheet's 10060.

**[MUST] A row that paints a `z-index: -1` layer needs `isolation: isolate`.**
Without its own stacking context the field paints behind the *section's*
background and vanishes (`BaseLayout.scss:919–921`). `.field-row` sets it; a row
adding a SECOND full-bleed layer (the on-sale wave's lit ground, the open FAQ
wash) must use `::after` or a lower z-index, because `--link` / `--holds`
already own `::before`.

**[MUST] Any full-bleed `::before` on a row is feathered** with
`mask-image: var(--field-feather)` (`BaseLayout.scss:193`, applied at 1019–1020) —
an un-masked `inset: 0 calc(-1 * var(--gutter))` box shows its own top and bottom
edges as hard horizontal steps across the page. The red reach field is the one
deliberate exception: it is meant to read as a band with edges.

**[MUST] Decorative overlays are `pointer-events: none`** and sit below the
chrome (grain 9999 / vignette 9998, `BaseLayout.scss:290–317`).

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

- **[MUST] Every animation and transition has a `prefers-reduced-motion: reduce`
  opt-out.** 23 stylesheets carry one today; a new animation must add its own. That
  includes `scroll-behavior` (`BaseLayout.scss:205–213`), the row transitions and
  transforms (`1034–1046`), the ticker (`Ticker.scss:88`) and the sheet
  (`Sheet.module.scss:174`).
- **[MUST] Scroll reveal is JS-gated.** `.reveal` is only hidden under the
  inline `.js` class on `<html>` (`BaseLayout.scss:1088`), so a no-JS or crawler
  render shows everything. Never hide content on `opacity: 0` without that gate.
- **[MUST] Animate compositor-cheap properties** — `opacity` and `transform`.
  The reveal's resting state is `transform: none` so it leaves no containing
  block behind (`BaseLayout.scss:1088–1096`).
- **[MUST] No `translateX` on the red reach field.** Dragging a band that runs to
  both viewport edges reads as a rendering fault (`BaseLayout.scss:934–938`); the
  pull belongs to the warm wash only.
- **[CURRENT]** The full-viewport grain is deliberately static, not animated — a
  still frame has static grain and animating it costs a repaint per frame
  (`BaseLayout.scss:287–289`).

## Component states

**[MUST] Hover paints, focus rings.** Never paint the reach field on `:focus`:
focus legitimately persists after a sheet closes, and a stuck red band is
indistinguishable from a rendering fault (`BaseLayout.scss:953–960`).

`.btn-primary` (`BaseLayout.scss:787–838`):

| State | Treatment |
| --- | --- |
| rest | `--color-accent` fill, `--on-accent` ink, 1px accent border, `--radius` |
| hover | fill → `--color-accent-hot`, `translateY(-2px)`, `--glow-red` halation (one of the two places the glow survives) |
| active | `transform: translateY(0)` |
| focus-visible | `2px solid var(--color-accent-hot)` at `--focus-gap` |
| disabled | not styled globally — see the form buttons below |

`.btn-ghost` (`BaseLayout.scss:841–877`): transparent fill, `--rule-strong`
border; hover/focus brighten the border to `--color-text` and open `gap`
`0.6rem → 0.85rem`; focus-visible adds the same ring at `--focus-gap`.

**[MUST] On `.band--accent` both buttons invert** (`BaseLayout.scss:662–686`) —
a red button on a red field is invisible — and focus-visible inverts to cream
(`688–690`).

`.field-row` reach states — **[MUST] which one applies is decided by whether the
row IS the control**, because a red band under something you cannot click
promises a click:

| The row | Rest | Hover | Focus |
| --- | --- | --- | --- |
| **IS** the control (`--link`: sessions, FAQ, clippings, agenda entries — a real `<button>` / `<a>` / `<summary>`) | field at `opacity: 0` | `::before` inset `0 calc(-1 * var(--gutter))`, `--color-accent`, opacity → 1 over `0.28s`; **every** ink goes full cream `#F7EFE6` (`971–977`) | ring `2px solid --color-accent-hot` at `--focus-gap-tight` (4.96:1); if hovered **and** focused the ring inverts to `#F7EFE6` — red on red is not a ring (`981–990`) |
| **CONTAINS** a control (`--holds`: ticket waves, contact/press desks) | wash at `opacity: 0` | feathered `104deg` warm wash → 1, plus `translateX(0.6rem)`; also fires on `:focus-within` (`1023–1031`) | the inner control carries the ring |

**[MUST] Red is spent once per list, not once per row.** A resting per-row label
is muted mono `rgba(240,237,230,0.55)`; a resting red label competes with the one
state the colour is for. The single exception is a persistent mark on the ONE
row that is genuinely different — the on-sale ticket wave, which carries a lit
ground, not red text.

**[MUST] An open `<details>` does not hold the red field.** Several FAQ items can
be open at once; four permanent red bands is the accent as texture. An open
question is marked by the feathered warm wash and its turned marker.

**[MUST] No opacity-based "inactive" state on content.** Dimming secondary text
under 4.5:1 fails 1.4.3 — status is a word, not a fade (`BaseLayout.scss:899–902`).

**[CURRENT] Disabled controls** use `opacity: 0.55` + `cursor: not-allowed`
(`NewsletterForm.module.scss:90–93`, `InvoiceForm.module.scss:253–256`), and
hover/active are gated behind `:not(:disabled)`. A non-purchasable ticket wave
disables its CTA rather than hiding it; `/partners` marks a not-yet-live CTA with
`aria-disabled="true"` on a `<span>` (`partners.astro:202`) rather than a
disabled button. See Open points.

**Loading / empty / error states [CURRENT]:** data-backed islands render a
skeleton (`shimmer`, `Tickets.module.scss:310–322`; `skelPulse`,
`Sessions.module.scss:365`), then either content or a `role="alert"` status
block, now shared by all four islands in `DataState.tsx:41` (`ErrorState`,
imported by `Speakers.tsx`, `Sessions.tsx`, `Agenda.tsx`, `Tickets.tsx`).
**[MUST]** Every data-backed page also ships a `.fallback-note`
(`BaseLayout.scss:550`) for the no-JS / endpoint-down case — except `/`
(`Tickets`), which has none. See Open points.

## Forms & errors

Two forms exist: `NewsletterForm` (native POST to SmartEmailing) and
`InvoiceForm` (Firebase callable).

- **[MUST] A control's boundary is `--field-border`** at rest
  (`InvoiceForm.module.scss:54`, `NewsletterForm.module.scss:23`) — ≥3:1 for
  1.4.11. Not `--rule`, which is decorative.
- **[MUST] Focus warms the boundary to `--color-accent-hot`**, so pointer focus
  keeps a ≥3:1 boundary too (`InvoiceForm.module.scss:67–75`,
  `NewsletterForm.module.scss:28–33`), **and** keyboard focus additionally gets
  the ring at `--focus-gap-tight` (`InvoiceForm.module.scss:77–80`). One is not a
  substitute for the other: `outline: none` on an input was a real regression
  (`NewsletterForm.module.scss:57–58`).
- **[MUST] Minimum control height `2.75rem`** (`InvoiceForm.module.scss:52`,
  the consent row at `NewsletterForm.module.scss:114`); the newsletter input is
  `3rem` (`NewsletterForm.module.scss:39`).
- **[MUST] Error text is `--color-error`**, carried on a `data-tone="error"`
  message element that reserves `min-height: 1.2em` so the layout does not jump
  when it appears (`InvoiceForm.module.scss:259–269`,
  `NewsletterForm.module.scss:154–161`).
- **[MUST] Status messages are announced.** `aria-live="polite"` on the message
  region (`InvoiceForm.tsx:425`, `NewsletterForm.tsx:93`), `role="status"` on the
  success block (`InvoiceForm.tsx:304`), and inputs point at their help text with
  `aria-describedby` (`NewsletterForm.tsx:59`, `68`).
- **[CURRENT] Validation is native**, not a validation library: `required` on
  each field plus type/pattern, with a spam honeypot field hidden via
  `.honeypot` (`InvoiceForm.tsx:358–366`). There is no per-field inline error
  message and no `aria-invalid` anywhere in `src` — see Open points.
- **[MUST] On the red band the whole form inverts**
  (`NewsletterForm.module.scss:199–276`): opaque `#9A0000` field fill, cream
  boundary at 85%, cream-filled button with dark ink.

## Images & media

- **[MUST] The photograph well is 4:5.** `.print` (`BaseLayout.scss:496–506`) is
  the mounted plate: `--print-mount` keyline + shadow on `--panel-lit`. The
  speaker grid and teaser use the same ratio
  (`Speakers.module.scss:65`, `261`, `SpeakersTeaser.module.scss:96`).
- **[CURRENT] Other ratios in use:** `16 / 9` press clippings
  (`press.scss:95`), `3 / 2` gallery (`index.scss:277`), `1` the session sheet's
  speaker thumb (`SessionDetail.module.scss:103`).
- **[MUST] Portraits crop `object-fit: cover; object-position: center 22%`** —
  faces sit high in the frame (`Speakers.module.scss:115–116`,
  `Sessions.module.scss:300–301`, `Agenda.module.scss:336–337`,
  `SpeakersTeaser.module.scss:139–140`). The sheet plate uses `center 20%`
  (`SpeakerDetail.module.scss:46`).
- **[MUST] Partner and press logos are `object-fit: contain`** — never cropped
  (`partners.scss:235`, `index.scss:461`, `downloads.scss:202`).
- **[MUST] A missing photograph falls back to initials**, not an empty box, at
  `--ink-monogram` / `--ink-monogram-sm` — both measured (4.21:1 / 7.71:1). Every
  hand-picked alpha before the token measured *under* the 3:1 the plate needs
  (`BaseLayout.scss:178–187`).
- **[MUST] Every `<img>` below the fold is `loading="lazy" decoding="async"`**
  and carries intrinsic `width`/`height`; above-the-fold marks are `eager`
  (`Menu.astro:49`, `SpeakerPhoto.tsx:48–58`, used by `Speakers.tsx` and
  `SpeakersTeaser.tsx`). Local assets go through Astro's
  `<Image>` (`astro:assets`) with `layout: 'constrained'` and
  `responsiveStyles: true` (`astro.config.mjs:98–103`).
- **[MUST] Decorative images take `alt=""`** (`press.astro:105`,
  `downloads.astro:63`).
- **[CURRENT]** Site imagery is `.webp`; the OG card is `.jpg` at 1200×630
  (`BaseLayout.astro:263–267`). One hero plate, `/hero-detective.webp`, is
  reframed per page through `HeroBackground`'s `focus` prop — **[MUST]** a new
  subpage picks its own crop rather than reusing another page's.

## Component conventions

- **[MUST] Astro (`.astro`) for layout and non-interactive UI; React (`.tsx`)
  islands only where behaviour is needed** — `Countdown`, `NewsletterForm`,
  `Speakers`, `SpeakersTeaser`, `Sessions`, `Agenda`, `Tickets`, `InvoiceForm`.
- **[CURRENT] Mount strategy is `client:load` by default**
  (`Countdown`, `SpeakersTeaser`, `Speakers`, `Sessions`, `Agenda`,
  `InvoiceForm`). `Tickets` and `NewsletterForm` use `client:visible`
  (`index.astro:170`, `280`) — both sit below the fold. **[MUST] An island
  whose first render is empty until data resolves takes `client:load`, not
  `client:visible`** — a zero-height placeholder never crosses the
  intersection threshold, so the observer never fires. `SpeakersTeaser`
  is `client:load` for exactly this reason (`index.astro:172–176`), even
  though it also sits below the fold.
- **[MUST] Styling location:** React islands import a co-located CSS Module
  (`import s from './X.module.scss'`); Astro components use a sibling `.scss` or
  the global primitives; page styles live in `src/pages/<page>.scss`.
- **[MUST] Global primitives are used by class name from both `.astro` and
  `.tsx`** — they are not imported. Six files each kept a copy of the row rhythm,
  reach states, `isolation`, feather mask and focus ring, and the copies drifted.
- **[MUST] Anything appearing on more than one page is a component or a global
  primitive — never a copied block.** `/contact` and `/press` each kept a
  `card-head` / `card-title` / `email-link` set; by the time they were merged the
  address size, the label colour and the column split all disagreed.
- **[MUST] A measured value is decided once, as a token.** `--print-mount`,
  `--ink-monogram`, the `--focus-gap-*` scale each replaced a value four to
  thirty call sites had picked for themselves.

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
`CookieBanner.astro`, and `Sheet.module.scss` (the shared detail-view chrome for
`SessionDetail` / `SpeakerDetail`).

**Structural rules the redesign exists to keep [MUST]** (full rationale in
`CLAUDE.md`): no decorated eyebrow; red text is flat; one `--fs-display` element
per page; section heads are left-set; no accent bars down the left edge of a
block; lists carry **no rules** — separation is air and type scale; detail views
are full-bleed sheets, not dialog boxes; `Closer.astro` ends every page except
`/privacy-policy`.

## Anatomy of a page

**[MUST] A subpage is this sequence, in this order:** `SubpageHero` → `Ticker`
→ one or more `.band` sections → `Closer` → `Footer`. Every subpage under
`src/pages/` (`speakers`, `sessions`, `agenda`, `team`, `faq`, `contact`,
`invoice`, `press`, `press/downloads`) follows it; `privacy-policy` is the one
deliberate exception (below). `/` (home) and `/partners` are the two pages
that don't run `SubpageHero`/`Ticker` and are out of scope here.

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
		<section class="band band--lit-red" aria-label="…">
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

Decision criteria — each one picked per page, not by copying the nearest
existing page:

- **`photo` crop vs `photo={false}`.** `SubpageHero` shows the shared
  `/hero-detective.webp` plate at a per-page `focus` crop by default
  (`speakers`, `sessions`, `agenda`, `team`, `press`). `photo={false}` opens
  on type alone — used where the page's own content starts immediately below
  the fold and a repeated photo would compete with it: `faq`, `contact`,
  `invoice`, `press/downloads` (`faq.astro:74`, `contact.astro:21`,
  `invoice.astro:20`, `downloads.astro:39`). **[MUST]** a new subpage picks
  its own `focus` crop rather than reusing another page's — see Images &
  media.
- **`.band--lit` vs `.band--lit-red`.** `--lit-red` is for pages **about
  people and the live programme** — `speakers`, `sessions`, `agenda`, `team`
  (`speakers.astro:25`, `sessions.astro:25`, `agenda.astro:25`,
  `team.astro:113`). `--lit` (no red bleed) is for **administrative /
  transactional** pages — `faq`, `contact`, `press`
  (`faq.astro:86`, `contact.astro:28`, `press.astro:90`). The test for a new
  page: does it show the humans or the schedule of the conference, or does it
  process a request? The former gets `--lit-red`.
- **`.band--accent`.** At most once per page, for the page's next step — a
  conversion moment, not a content section. The only two call sites are the
  home page newsletter capture (`index.astro:271`) and the partners CTA
  (`partners.astro:176`). A `Closer` with `tone="accent"` is the more common
  way to close on red; reach for a full `.band--accent` section only when the
  accent band itself contains an interactive form, not just a closing
  statement.
- **`.head-split` vs `.head-stack`.** `.head-split` (statement left, one line
  right, optional `--ruled` hairline) is for a section that pairs a heading
  with a secondary fact — a count, a link, a note (`contact.astro:35`,
  `index.astro:237` gallery). `.head-stack` (one column, closed by a
  hairline) is for a section that is just a heading before a list
  (`speakers.astro:29`, `sessions.astro:27`, `agenda.astro:27`). If there is
  nothing to put in the right column, it's `.head-stack`.
- **`--fs-row` vs `--fs-row-sm`.** **[CURRENT]** no numeric cutoff is stated
  in code — the existing split is three ticket waves / three contact desks /
  two press desks at `--fs-row` (72px) against sessions / FAQ / clippings /
  agenda at `--fs-row-sm` (54px). Treat **more than ~4 rows** as the signal to
  drop to `--fs-row-sm`; a row count decided ahead of time, not by how it
  looks once built, is what the existing pages did. See Open points.
- **`Closer` tone.** Pass `tone="accent"` explicitly — every subpage
  (`speakers`, `sessions`, `agenda`, `team`, `faq`, `contact`, `invoice`,
  `press`, `press/downloads`) does, for a red closing band with the page's
  final CTA. `tone` defaults to `'raised'` and a `tone="plain"` also exists,
  but see Open points: no page passes either, and `band--raised` has no
  matching CSS, so both are currently dead paths — don't rely on the
  default. `privacy-policy` is the only page with **no** `Closer` at all: a
  legal document doesn't get a CTA.

## Iconography

**[MUST] No icon library.** `package.json` has no `lucide`, `heroicons`,
`feather` or similar — six inline `<svg>` elements exist in the whole
codebase and all six are the `Footer.astro` social-platform marks (X,
Facebook, Bluesky, LinkedIn, YouTube), each `aria-hidden="true"` beside a
visible text link. Don't add an icon package for a UI glyph.

**[MUST] Any other glyph is text, not an image or icon font** — `Close ✕`
(`Sheet.module.scss:5`), `→` in link labels. No emoji anywhere in UI copy.

## Voice

**[CURRENT]** No single stated rule; inferred from the copy that exists —
worth confirming as a decision, not just a pattern:

- Mono labels (eyebrows, buttons, row meta) are short — one to three words
  — written in sentence case in source and capitalised by CSS
  `text-transform: uppercase` (`BaseLayout.scss:403`, `781`, `1058`, …), never
  typed in caps. Typing caps in the source would read as shouting to a
  screen reader, which ignores the CSS transform.
- Ledes (`--fs-lede`) run one to two sentences, no italic — see CLAUDE.md
  "One lede shape" for why.
- Copy is UI-English throughout (`src/pages/**/*.astro`); Czech appears only
  in `src/pages/press/**` clippings content, which is quoted source material,
  not site voice. **[MUST]** don't introduce a third mixed-language block
  without the same justification.
- Prices are CZK, formatted by `formatPrice` (`src/lib/tito.ts:157`); dates
  go through `Intl.DateTimeFormat` (`Agenda.tsx:65`) rather than a
  hand-written string.

## Accessibility

`npm run a11y` is the only automated check in the repo (`scripts/a11y.mjs`): it
builds with `A11Y_MOCK=1`, serves `dist/` plus `/api/*` fixtures, and runs
`@axe-core/playwright` over 15 routes (`a11y.mjs:19–33`) at desktop, once more at
375×812 (`a11y.mjs:440`), and scoped inside opened `[role="dialog"]` sheets
(`a11y.mjs:292–353`). Tags: `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`,
`wcag22aa` (`a11y.mjs:376`).

**[MUST] Zero violations is the passing bar.** Run it before opening a PR that
touches markup or styles.

- **[MUST] Contrast.** Body copy meets 1.4.3; non-text UI boundaries and focus
  indicators meet 1.4.11 (≥3:1). Use `--field-border` for a control boundary and
  `--color-error` for error prose. Don't dim ink on the red band; change size.
- **[MUST] Focus is always visible.** Global `:focus-visible { outline: 2px solid
  var(--color-accent-hot) }`. The gap is chosen by ONE question — how much
  visible edge the control already has: `--focus-gap-tight` it has its own
  boundary, `--focus-gap` type on the ground, `--focus-gap-lg` it stands alone in
  open space (`BaseLayout.scss:141–154`). Two deliberate exceptions carry a
  comment saying why: the agenda cell's inset ring and the partner logo's wider
  gap.
- **[MUST] Semantics before ARIA.** A row that IS a control is a real
  `<button>` / `<a>` / `<summary>` — which is also what decides `--link` vs
  `--holds`.
- **[MUST] `.skip-link` is the first focusable element on every page**
  (`BaseLayout.astro:301`), hidden with `clip-path: inset(50%)` and revealed on
  `:focus` (`BaseLayout.scss:322–354`).
  `html { scroll-padding-top: 6rem; scroll-padding-bottom: 8rem }`
  (`BaseLayout.scss:211–213`) keeps an anchored or focused target clear of the
  fixed header and cookie banner.
- **[MUST] `.sr-only`** for text that must stay in the a11y tree and the
  crawlable HTML but not on screen (`BaseLayout.scss:367`).
- **[MUST] Sheets return focus** to the row that opened them
  (`src/lib/useReturnFocus.ts`) and close on Esc.
- **[MUST] Reduced motion** — see Motion above.
- **[MUST] `html` clips horizontal overflow with `overflow-x: clip`, never
  `hidden`** (`BaseLayout.scss:217–229`): `hidden` turns `html` into a scroll
  container on iOS Safari, which breaks `position: fixed` and `env()` safe-area
  insets.

## Open points

Places the code contradicts itself or this document. Listed, not smoothed over —
each needs a decision, none is fixed by this PR.

1. **No motion tokens.** `0.2s ease` is written out at roughly 96 call sites and
   the "arrive" curve `cubic-bezier(0.16, 1, 0.3, 1)` at 14, while every other
   measured value in the system is a token. There is also no stated rule for when
   a transition is `0.28s` vs `0.3s` vs `0.32s` (the row field, the row wash and
   the row pull each picked a different one). Proposal: `--dur-control`,
   `--dur-field`, `--ease-arrive`.
2. **No z-index scale.** The layer numbers (9998 / 9999 / 10000 / 10001 / 10050 /
   10060) are literals spread across six files, and **two different elements both
   sit at `10000`** — the cookie banner (`CookieBanner.scss:21`) and
   `.status-bar-cover` (`BaseLayout.scss:1247`) — so their order is source order,
   not a decision. `.skip-link` and the site header likewise share `10001`.
3. **Disabled state contradicts the no-dimming rule.** `BaseLayout.scss:899–902`
   bans opacity-based inactive states because dimming fails 1.4.3, yet both form
   buttons use `opacity: 0.55` (`NewsletterForm.module.scss:91`,
   `InvoiceForm.module.scss:254`). WCAG exempts disabled controls, so this is
   probably fine — but the document currently states a rule the code breaks, and
   one of the two should change.
4. **Three ways to say "not available".** A disabled `<button>`, an
   `aria-disabled="true"` `<span>` (`partners.astro:202`), and a `.record-status`
   word. No rule says which applies when.
5. **No `aria-invalid` anywhere in `src`.** Form errors are announced through a
   single `aria-live` region; individual invalid fields are not marked, and there
   is no per-field inline error. Acceptable for a two-form site, but it should be
   a stated decision rather than an omission.
6. **`--fs-figure` (`BaseLayout.scss:109`) has zero call sites.** Either it is
   dead and should be deleted, or something is using a literal `1.9rem` where it
   should use the token. `--panel-2` and `--panel-hover` are each used in exactly
   one file, which is close to the same question.
7. **`min-width` is no longer an outlier.** `SpeakersTeaser.module.scss:60` was
   the only mobile-first query when this document was written; six more
   (`press/downloads.scss:109,113,117,131,135,139`) landed via merged PRs since,
   so the codebase now has 7. Worth deciding whether mobile-first is acceptable
   there or should be flipped to match the rest.
8. **Two behavioural breakpoints outside the CSS set.** The header auto-hide
   uses `760px` in JS (`Menu.astro:217`); no stylesheet uses that value, and the
   nearest CSS breakpoints are `720px` and `860px`. The agenda view switch adds
   a second one, `1024px` (`Agenda.tsx:52`), also absent from any stylesheet.
9. **Special Elite declares no `subsets`** (`astro.config.mjs:96`) while the
   other two request `latin` + `latin-ext`. The site ships Czech copy; a face
   without `latin-ext` risks fallback glyphs for diacritics. Worth confirming
   against the same class of bug fixed in commit `7b96e4df` (Czech press
   clippings set in a face without the diacritics).
10. **Split with `CLAUDE.md`.** Values, tokens and binding rules ([MUST] /
    [CURRENT]) live here, in `DESIGN.md`. Decisions, product context and the
    *why* behind them live in `CLAUDE.md` → "Styling Conventions", which now
    just points back here instead of restating the ramp. Nothing enforces the
    split beyond this line — if a rule changes, check both files.
11. **`Closer`'s `tone="raised"` default renders `band--raised`, which has no
    CSS** (`Closer.astro:42`; the class is never defined in
    `BaseLayout.scss`). Pre-existing, not introduced by this document.
    Currently harmless — every `Closer` call site passes `tone="accent"`
    explicitly — but the default itself is dead and would silently render
    unstyled if a future page omitted `tone`.
12. **The font-size ramp is stated as [MUST] but broken at 23 call sites: 18**
    **absolute literals** (`Countdown.module.scss:33,47,72,84`,
    `Menu.scss:348,471`, `Speakers.module.scss:201,277`,
    `faq.scss:33`, `press.scss:162`, `team.scss:121,141`,
    `index.scss:73,148,598,643,666,756`; the `index.scss:135`
    site this counted no longer exists — see below), **2 relative**
    (`Footer.scss:153`, `0.85em`; `Ticker.scss:78`, `0.5em`),
    **2 inherited** (`Footer.scss:321,325`), and **1 on its own token**
    (`Ticker.scss:57`, `--ticker-size`). The same "every
    `font-size` goes through one of these steps" claim is repeated in a source
    comment at `BaseLayout.scss:98` and is equally untrue there — worth fixing
    next time that file is touched, not on its own. Either these get folded
    into the ramp as named steps, or downgraded to `[CURRENT]` literals with a
    reason each.
    **[UNRESOLVED — flagged, not guessed]** Two of the cited call sites no
    longer back this count after the rebase, rather than having simply moved:
    `LandingNotice.scss` (component + stylesheet) was deleted in `d38c5187`
    and replaced by `NextStep.astro`, which uses `var(--fs-row)` /
    `var(--fs-body)` — no literal, so that count-of-14 entry has no current
    home. `index.scss:135` is now `font-size: var(--fs-label);` (not a
    literal); the file does have four literal `font-size` declarations today
    (`index.scss:598,643,666,756`, all `.hero-statement` / `.meta-value`
    breakpoint overrides), any/all of which may be what this site meant to
    count, but which one(s) requires a decision, not a relocation.
13. **`/` has no `.fallback-note`.** `agenda`, `sessions` and `speakers` each
    ship one for the no-JS / endpoint-down case; the home page's `Tickets`
    island does not. Either add one, or state the exception in the MUST
    instead of leaving the home page silently uncovered.
