Design system for the DevFest.cz 2026 site. It documents what is actually in
the codebase — the tokens in `src/layouts/BaseLayout.scss`, the fonts declared
in `astro.config.mjs`, the primitives every page composes from, and the
accessibility bar `npm run a11y` enforces.

The style *rationale* (why the eyebrow lost its hairline, why lists have no
rules, why detail views are sheets) lives in `CLAUDE.md` → "Styling
Conventions". This file is the reference: the values, the names, the rules.

## Where things live

| | |
| --- | --- |
| `src/layouts/BaseLayout.scss` | all tokens (`:root`), resets, global primitives. Injected `is:global`, so every `.astro` page and `.tsx` island can use the class names directly |
| `astro.config.mjs` (`fonts`) | the three brand faces, self-hosted via the Astro Fonts API |
| `src/components/*.module.scss` | co-located CSS Modules for React islands (`import s from './X.module.scss'`) |
| `src/components/*.astro` + `*.scss` | static components with a sibling stylesheet |
| `src/pages/*.scss` | page-scoped styles, one file per page |

**No Tailwind, no CSS-in-JS, no utility framework.** SCSS + CSS custom
properties only.

## Color

Tokens, from `BaseLayout.scss`:

| Token | Value | Use |
| --- | --- | --- |
| `--color-bg` | `#050505` | page ground |
| `--color-text` | `#F2EFE9` | ink |
| `--color-cream` | `#E8E0CC` | warm ink variant |
| `--color-grey` | `#8C8C8C` | muted meta |
| `--color-accent` | `#CC0000` | the accent — CTA fill, red bands, the reach field |
| `--color-accent-hot` | `#FF1111` | focus rings, live status, figures on a facts band |
| `--color-error` | `rgba(220, 110, 110, 0.95)` | **form-error text only.** The accent desaturated to clear AA as small copy (~5.7:1) where `--color-accent` fails at ~3.3:1. Never an accent, fill or rule |
| `--on-accent` | `#F7EFE6` | ink on the red field |

Surfaces: `--panel` `#0C0B0B`, `--panel-2` `#111010`, `--panel-hover` `#161413`,
and the lit pair `--panel-lit` `#0A0908` / `--panel-lit-2` `#0E0C0B`.

Rules (hairlines): `--rule` `rgba(240,237,230,0.13)`, `--rule-soft` `0.06`,
`--rule-strong` `0.22`, `--rule-red` `rgba(204,0,0,0.55)`.
`--field-border` `rgba(240,237,230,0.4)` is the *perceivable* boundary for
interactive form controls (WCAG 1.4.11, ≥3:1) — decorative grouping hairlines
stay at `--rule`.

Atmosphere: `--glow-red` / `--glow-red-soft` (interactive + live status only —
red **text** is flat), `--lit` (the soft pool behind a lit section),
`--vignette`, `--field-feather`, `--print-mount` (photograph keyline + shadow),
`--ink-monogram` / `--ink-monogram-sm` (initials in an empty photo well; both
values are measured — 4.21:1 and 7.71:1).

**Measured ink on `#CC0000`.** Hierarchy on the accent field comes from SIZE,
never from dimming:

| ink | ratio | verdict |
| --- | --- | --- |
| `#F7EFE6` | 5.17:1 | anything, incl. body copy |
| `#F7EFE6` @ 85% | 3.95:1 | control boundaries only (1.4.11) |
| `#F7EFE6` @ 80% | 3.58:1 | fails body copy |
| `#1A0000` | 3.42:1 | large text only — the accent word |
| `#000000` | 3.57:1 | large text only |

Translucent field fills are banned on the red band: a contrast checker resolves
a placeholder against the band *behind* an `rgba()` fill, so
`NewsletterForm.module.scss` uses an opaque `#9A0000`.

## Typography

Three faces, self-hosted through the Astro Fonts API. **Only these three** —
never add a fourth family to `astro.config.mjs`. Stylesheets reference the
injected variable, never a literal family name (the resolved family is a
build-time hash).

| Token | Face | Weights | Role |
| --- | --- | --- | --- |
| `--font-bebas-neue` | Bebas Neue | 400 | every headline at `--fs-h3` and above: hero, section titles, nav destinations, figures, prices, row titles, the footer wordmark |
| `--font-special-elite` | Special Elite | 400 | body, lede and long-form reading copy. The typewriter voice — texture, never a headline (it is wide; it wrapped a three-word title over three lines at `--fs-h2`) |
| `--font-jetbrains-mono` | JetBrains Mono | 400, 500 | labels, eyebrows, meta, counts, buttons, status words |

**The ramp.** Every `font-size` in the codebase goes through one of these
steps. Pick the nearest; do not introduce a new value without adding it here.

Poster scale (Bebas):

| Token | Value | Use |
| --- | --- | --- |
| `--fs-display` | `clamp(3rem, 9.5vw, 9rem)` | the subpage `<h1>` — **one per page** |
| `--fs-hero` | `clamp(3rem, 9.5vw, 8.5rem)` | home hero statement |
| `--fs-h2` | `clamp(2.9rem, 8vw, 7rem)` | section headline |
| `--fs-stat` | `clamp(3.4rem, 10vw, 9.5rem)` | figure in a facts band |
| `--fs-h3` | `clamp(1.8rem, 3.4vw, 2.6rem)` | sub-section headline |
| `--fs-card-title` | `1.95rem` | card / dossier title |
| `--fs-title-compact` | `1.6rem` | compact record title |
| `--fs-row` | `clamp(2.6rem, 5.2vw, 4.5rem)` | row title, **short** list (waves, desks) |
| `--fs-row-sm` | `clamp(2.2rem, 4vw, 3.4rem)` | row title, **long** list (sessions, FAQ, clippings) |
| `--fs-row-figure` | `clamp(2.5rem, 4.2vw, 4rem)` | the figure opposite a row title |

Text scale:

| Token | Value | Use |
| --- | --- | --- |
| `--fs-label-xs` | `0.68rem` | micro mono: avatar counts, kit tags |
| `--fs-label-sm` | `0.74rem` | mono: counts, chips, inline clears |
| `--fs-label` | `0.78rem` | mono: eyebrows, section labels |
| `--fs-label-lg` | `0.84rem` | mono: nav, buttons, email links |
| `--fs-ui` | `0.95rem` | small UI prose, help text |
| `--fs-body` | `1.05rem` | long-form reading copy |
| `--fs-body-lg` | `1.15rem` | footnotes, short ledes |
| `--fs-lede` | `clamp(1.2rem, 1.6vw, 1.5rem)` | section ledes, status prose |
| `--fs-title-sm` | `1.45rem` | small titles, mobile record titles |
| `--fs-figure` | `1.9rem` | row figures |
| `--fs-monogram` | `3.4rem` | initials in an empty photo well |

Display type is set through `--lh-display` (`0.84`) and `--track-display`
(`0.005em`) — never a per-file `line-height` — and carries no `text-shadow`.

## Spacing & layout

| Token | Value | Use |
| --- | --- | --- |
| `--maxw` | `1440px` | the content column (`.u-container`, `.band-inner`) |
| `--gutter` | `clamp(1.25rem, 5vw, 4.5rem)` | page gutter; also the negative inset for full-bleed row fields |
| `--section-y-tight` | `clamp(3.75rem, 6vw, 6.5rem)` | a cut |
| `--section-y` | `clamp(6rem, 10vw, 11rem)` | the normal beat |
| `--section-y-wide` | `clamp(8.5rem, 15vw, 17rem)` | a held shot before something that matters |
| `--radius` | `2px` | sharp corners — a hint of softening, never pill-shaped |
| `--focus-gap-tight` / `--focus-gap` / `--focus-gap-lg` | `2px` / `3px` / `4px` | focus-ring standoff, see a11y below |

Three section densities exist because a single tempo across every section is
what makes a long page read as generated. Row padding inside a list is fluid
and horizontal-padding-free: `clamp(2.25rem, 3.6vw, 3.25rem) 0` for a short
list, `clamp(1.9rem, 2.8vw, 2.5rem) 0` for a long one, overridable per row with
`--field-step`.

## Breakpoints

Max-width media queries only, mobile last. There is **no** named breakpoint
variable set — use the values already in use rather than inventing a new one:

| Query | Where |
| --- | --- |
| `max-width: 1000px` / `960px` / `900px` | wide layout collapses (two-column heads, grids) |
| `max-width: 860px` | header / hero adjustments |
| `max-width: 720px` | mid collapse |
| `max-width: 600px` | the main phone breakpoint (most used) |
| `max-width: 500px` | small phone |
| `max-width: 380px` | narrowest phone |

There is no horizontal-nav breakpoint: `Menu.astro` is a three-slot bar with
all destinations behind one toggle at **every** width.

## Component conventions

- **Astro (`.astro`) for layout and non-interactive UI; React (`.tsx`) islands
  only where behaviour is needed** — `Countdown`, `NewsletterForm`, `Speakers`,
  `SpeakersTeaser`, `Sessions`, `Agenda`, `Tickets`, `InvoiceForm`. Islands are
  mounted `client:load`.
- **Styling**: React islands import a co-located CSS Module
  (`import s from './X.module.scss'`). Astro components use a sibling `.scss`
  or the global primitives. Page-level styles live in `src/pages/<page>.scss`.
- **Global primitives are used by class name from both `.astro` and `.tsx`** —
  they are not imported. The `.field` / `.field-row` list primitive is the
  clearest case: six files used to keep their own copy of the rhythm, reach
  states, `isolation`, feather mask and focus ring, and the copies had drifted.
- **Anything appearing on more than one page is a component or a global
  primitive — never a copied block.** Copies always drift (`/contact` and
  `/press` each kept a `card-head` / `card-title` / `email-link` set, and by the
  time they were merged the address, the label color and the column split all
  disagreed).
- **A measured value is decided once, as a token.** `--print-mount`,
  `--ink-monogram`, the `--focus-gap-*` scale each replaced a value four to
  thirty call sites had picked for themselves; every copy of the monogram alpha
  measured *under* the contrast it needed.

The primitives, all in `BaseLayout.scss`:

| Class | What it is |
| --- | --- |
| `.u-container` | centred column at `--maxw` with the page gutter |
| `.page-stack` | every page's `<main>` |
| `.band` (+ `--raised`, `--accent`, `--lit`, `--lit-red`, `--tight`, `--wide`) with `.band-inner` | a section's ground. `--accent` (the red field) **at most once per page**; `--lit` is the subpage ground, `--lit-red` the variant for pages about people and the programme |
| `.eyebrow` | plain mono section label — no decoration, no trailing hairline |
| `.display` (+ `.red`, `.hollow`) | poster headline |
| `.head-split` / `.head-title` / `.head-note` (+ `--ruled`) | two-column section head: statement left, one line right |
| `.head-stack` | the one-column section head, closed by a hairline |
| `.field` / `.field-row` (+ `--short`, `--link`, `--holds`) | the open-field list and row |
| `.facts` / `.fact` / `.fact-figure` / `.fact-label` | a figures band |
| `.btn-primary` / `.btn-ghost` | the two buttons |
| `.closer` / `.closer-title` / `.closer-note` / `.closer-actions` | the closing statement (see `Closer.astro`) |
| `.print` | the mounted photograph well at 4:5 |
| `.fallback-note` | the no-JS / endpoint-down prose on a data-backed page |
| `.record-status` | the last survivor of the retired `.ledger` / `.record` family |
| `.reveal` / `.develop` / `.scene` / `.rake` | scroll-reveal and lighting, all `.js`-gated and all disabled under reduced motion |

Shared components: `Desk.astro` (one inbox), `SubpageHero.astro`,
`HeroBackground.astro` (takes a `focus` crop), `Ticker.astro` (the running band
under every hero), `Closer.astro`, `Menu.astro`, `Footer.astro`,
`CookieBanner.astro`, and `Sheet.module.scss` (the shared detail-view chrome for
`SessionDetail` / `SpeakerDetail`).

**Structural rules the redesign exists to keep** (full rationale in
`CLAUDE.md`): no decorated eyebrow; red text is flat; one `--fs-display`
element per page; section heads are left-set; no accent bars down the left edge
of a block; lists carry **no rules** — separation is air and type scale;
`red is spent once per list, not once per row`; detail views are full-bleed
sheets portalled to `document.body`, not dialog boxes.

## Accessibility minimum

`npm run a11y` is the only automated check in the repo: it builds with
`A11Y_MOCK=1`, serves `dist/` plus `/api/*` fixtures, and runs
`@axe-core/playwright` over all 15 routes — desktop, a mobile viewport, and
inside opened `[role="dialog"]` sheets. **Zero violations is the passing bar**,
against tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`. Run it
before opening a PR that touches markup or styles.

What that means when writing UI:

- **Contrast.** Body copy meets 1.4.3; non-text UI boundaries and focus
  indicators meet 1.4.11 (≥3:1). Use `--field-border` for a control's
  boundary and `--color-error` for error prose — the plain accent fails both.
  Don't dim ink on the red band; change size instead.
- **Focus is always visible.** Global `:focus { outline: none }` +
  `:focus-visible { outline: 2px solid var(--color-accent-hot); outline-offset:
  var(--focus-gap) }`. The gap is chosen by ONE question — how much visible edge
  the control already has: `--focus-gap-tight` it has its own boundary,
  `--focus-gap` type on the ground, `--focus-gap-lg` it stands alone in open
  space. A row that is both hovered and focused inverts the ring to `#F7EFE6`
  (red on red is not a ring).
- **Hover paints, focus rings.** Never paint the reach field on `:focus` —
  focus legitimately persists after a sheet closes, and a stuck red band reads
  as a rendering fault.
- **Reduced motion.** Every animation is behind `.js` and every one of them is
  disabled in `@media (prefers-reduced-motion: reduce)`, including
  `scroll-behavior`, `.reveal`, `.develop`, the row transitions and the rake
  beam. A new animation must add its own opt-out.
- **Semantics before ARIA.** A row that IS a control is a real `<button>` /
  `<a>` / `<summary>` — that is also what decides whether it gets the red reach
  field (`--link`) or the warm wash (`--holds`); a red band under something you
  cannot click promises a click.
- **`.skip-link`** is the first focusable element on every page, and
  `html { scroll-padding-top: 6rem; scroll-padding-bottom: 8rem }` keeps an
  anchored or focused target clear of the fixed header and cookie banner.
- **`.sr-only`** for text that must stay in the a11y tree and the crawlable
  HTML but not on screen.
- Detail sheets return focus to the row that opened them
  (`src/lib/useReturnFocus.ts`) and close on Esc.
- Every data-backed island ships a `.fallback-note` for the no-JS /
  endpoint-down state.
