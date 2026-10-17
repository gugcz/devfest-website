---
name: DevFest.cz 2026
description: Noir, but loud, set as one ruled document. One dark theme, one red fill per page, two controls, Bebas heads on a rule, ruled list rows, three voices (Bebas speaks, Special Elite tells, mono records figures), no arrow glyphs.
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
    typography: "{typography.head}"
    padding: "0 0 0.8rem"
  head-rule-note:
    textColor: "{colors.ink-muted}"
    typography: "{typography.note}"
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
  speaker-row:
    backgroundColor: "transparent"
    textColor: "{colors.ink-dim}"
    typography: "{typography.title}"
    padding: "0.55rem 0"
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
| `src/layouts/BaseLayout.scss` | all tokens (`:root`, lines 2–190), resets, global primitives. Injected `is:global`, so every `.astro` page and `.tsx` island uses the class names directly |
| `src/styles/_type.scss` | the type recipes as mixins, one per voice — `note()`, `action()`, `cta-label()`, `mono()`, `display()`, `row-title()`, `prose()`, `hairline-link()`. A CSS Module that cannot compose a global class includes the mixin instead |
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
`--color-bg` (`Footer.scss:7`).

Hairlines: `--rule` `rgba(255,255,255,0.13)`, `--rule-soft` `0.06`,
`--rule-strong` `0.22`, `--rule-red` `rgba(241,16,0,0.55)`,
`--field-border` `rgba(255,255,255,0.4)`.

**[MUST] Rules only where they carry structure.** The site is a ruled
document: a line is the first or last edge of a list, never ornament. A
rule is drawn at a section head (`.head-rule`: a 1px `--color-text` line
the head sits on, the list's first line, `BaseLayout.scss:348–368`), under
every list row (`.field-row` `border-bottom: 1px solid var(--rule)`,
`661–686`; the speaker register's `.cell`, which also opens on a white top
rule, `Speakers.module.scss:21–32`), on the footer's top edge (`Footer.scss:9`,
the document's last rule), in the agenda's time × room grid, in data tables
(privacy policy), as a form control's boundary (the press kit's format chips
included), as an in-prose link's underline, as a progress spine (the card
builder's steps; the hero facts line's venue link, `index.scss:86–88`), and
as the cookie banner's edge over the page. The partner
walls draw no tiles or borders around a mark. Never a divider floating
between sections, a line above the hero's facts line, a ruled readout (the
invoice total), or an edge down a block's left side. `.head-split` and
`.head-stack` still close on space.

Ink ramp: `--ink-strong` `0.85`, `--ink` `0.78`, `--ink-soft` `0.7`,
`--ink-meta` `0.62`, `--ink-dim` `0.6`, `--ink-muted` `0.55`, `--ink-faint`
`0.5` (all `rgba(255,255,255,…)`). Named steps only; a one-off alpha stays a
raw literal.

Atmosphere: `--lit` (the spotlight pool, `ellipse 78% 50% at 50% 38%`, gone
by 72% so it fades out before the band's top and bottom edges: no seam
against the section above, `BaseLayout.scss:163–167`), `--field-feather`, `--print-mount`, `--wash` /
`--wash-strong` (the raking light a reached row / cell takes; pure white
alphas, `173–174`),
`--ink-monogram` `0.46` and `--ink-monogram-sm` `0.66`. No glow token and no
page vignette token; the plate vignette is `.scene-vignette`'s own gradient.

**[MUST] No glow anywhere.** Hover and live states are flat colour changes:
an inverted fill for buttons, a border or ink change for rows and fields.

**[MUST] Red is evidence, not mood.** Per the manual it marks details (a dot,
1–2 words in a headline, the year, CTA words, the ticket list's state word)
and, as a large area, only primary CTA buttons and the row reach field. **No red ground**: every `Closer`, the `/partners` CTA and
the newsletter sit on the black `.band` (`BaseLayout.scss:504–507`,
`Closer.astro`). Red is a verb: one word, one button, one state per page. No
red washes behind photographs, no red running text, no other accent hue, no
red-to-other-hue gradients.

**[MUST] One red mark per list.** A list spends red once: the invoice step
numbers are `--ink-muted` (`invoice.scss:39–45`); on the ticket list the
live wave's "On sale" state and its red Buy button are the one red mark —
the row has no lit ground of its own (`Tickets.module.scss`, "the live wave").

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

The ticket list's state word (`.stubState`, "On sale" / "Last chance",
`Tickets.module.scss:48–52`) is `#F11000` on black: 4.82:1, AA at its
`note(--fs-note-sm)` size.

**[MUST] A label on a red button is white Bebas at `--fs-cta`.** Manual
p. 11 sets CTA labels white on red; 4.36:1 clears AA only as large text, and
Bebas has no bold, so the size carries it: `--fs-cta` is `1.5rem` = 24px,
the regular-weight large-text line. The `cta-label` mixin is
`action(var(--fs-cta))` (`_type.scss:32–37`: Bebas caps, tracking 0,
line-height 1). **Never shrink it.** Callers: `.btn-primary`
(`BaseLayout.scss:573`) and the newsletter button
(`NewsletterForm.module.scss:71`); the cookie buttons take its size
(`CookieBanner.scss:72`). The header Tickets is not a red
button: it is a text action (see Component states).

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
| `--font-bebas-neue` | Bebas Neue | 400 | 73–80 | **speaks**: every headline at `--fs-h3` and above (hero, section titles, nav destinations, row titles, speaker names, Bebas prices) and every action: text actions, nav, the header Tickets, buttons, the CTA label |
| `--font-special-elite` | Special Elite | 400 | 89–105 | **tells**: body, lede and long-form reading copy, and every label made of words: section notes, roles, eyebrows, captions, form labels, status words, nav meta, the footer. Never a headline |
| `--font-jetbrains-mono` | JetBrains Mono | 400, 500 | 81–88 | **records**: figures only; prices in data lines, times, indices, serials, counts, codes, the footer folio. 500 only for the press headline's Czech fallback |

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
  (`prose()`, `note()`): the head-rule note, eyebrows, roles, captions, form
  labels, error and pending lines, status words, the ticket state and
  deadline, agenda room and track labels, session chips, sheet kicker, nav
  meta, the footer. **JetBrains Mono records**: figures only (`mono()`):
  prices in data lines, times, row indices and serials, counts, codes, the
  footer folio. **Mono never sets a word-label**; a tracked mono caption was
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
  Every face ships one weight (JetBrains Mono loads 400, 500 and 700;
  `press.scss:108` is the one 500 and 700 has no caller) and no italic;
  emphasis in prose is ink — `strong` / `b` step up to `--color-text` —
  never weight or slant. Don't write `font-style: italic`.

**The ramp [MUST].** Every `font-size` goes through one of these steps; add a
step here before using a new value. **[CURRENT]** ~35 call sites still bypass
it — see Open points.

Poster scale (Bebas), `BaseLayout.scss:61–77`:

| Token | Value | Line | Use |
| --- | --- | --- | --- |
| `--fs-display` | `clamp(3rem, 9.5vw, 9rem)` | 61 | the subpage `<h1>` — **one per page** |
| `--fs-hero` | `clamp(3rem, 9.5vw, 8.5rem)` | 62 | **no caller** since the legal pages moved to `SubpageHero`; the home statement sets its own clamp (`index.scss:49`, `233`) |
| `--fs-h2` | `clamp(2.25rem, min(6vw, 9svh), 5.5rem)` | 66 | the `.head-split` headline (`/agenda`, `/contact`), the FAQ categories, every `Closer` title; the menu's primary links ≥901px |
| `--fs-h3` | `clamp(1.8rem, 3.4vw, 2.6rem)` | 67 | sub-section headline; `NextStep` titles; the menu's secondary links ≥901px; legal `h2` |
| `--fs-head` | `clamp(2.1rem, 3.4vw, 3rem)` | 68 | **the ruled section head** (`.head-rule-title`): every home section, the ticket ledger, the speakers teaser, every `/partners` tier |
| `--fs-card-title` | `1.95rem` | 69 | card / dossier title (invoice, agenda) |
| `--fs-title-compact` | `1.6rem` | 70 | **no caller** |
| `--fs-row` | `clamp(2.1rem, min(5.2vw, 7.5svh), 4.5rem)`; `2.1rem` ≤600px | 75 | row title, **short** list (desks) |
| `--fs-row-sm` | `clamp(1.7rem, min(4vw, 6svh), 3.4rem)`; `1.7rem` ≤600px | 76 | row title, **long** list (sessions, FAQ questions, clippings, the speaker register, the ticket waves and their prices, the home speaker rows) |
| `--fs-row-figure` | `clamp(2.1rem, min(4.2vw, 6svh), 4rem)`; `2.1rem` ≤600px | 77 | the figure opposite a row title |

**[MUST] hero > h2 > head > row-sm at every viewport.** `--fs-h2` and the
row steps carry an `svh` term so a short desktop screen brings them down: a
width-only term let a 1280×720 section head tie the hero, and a list row
outrank its section head (`BaseLayout.scss:63–77`). On the ruled document the
head is `--fs-head` (3rem cap) and the rows under it `--fs-row-sm` (3.4rem
cap, 6svh): the head stays ahead of its rows on the rule because the rows
carry the height term and the head does not; the poster-scale statement
above both is the home `h1` alone.

Text scale, `BaseLayout.scss:81–93`:

| Token | Value | Line | Use |
| --- | --- | --- | --- |
| `--fs-label-xs` | `0.6875rem` (11px) | 81 | micro mono figure: avatar counts, kit file sizes and specs |
| `--fs-label-sm` | `0.74rem` | 82 | mono figure: the session row's time, counts |
| `--fs-label` | `0.78rem` | 83 | mono figure: row indices and serials (the ticket ledger, the speakers teaser), the footer folio, a press clipping's date |
| `--fs-label-lg` | `0.84rem` | 84 | mono figure: the larger index (`NextStep`), agenda times, the invite meta line |
| `--fs-note-sm` | `0.85rem` | 85 | Special Elite note: roles, captions, row metadata (the ticket state word, deadline and alt price; the speaker role; agenda room and track; session chips; `.record-status`) |
| `--fs-note` | `0.95rem` | 86 | Special Elite note: the `.head-rule` note, `.eyebrow`, the hero facts line, the facts `dl`, form labels, the sheet kicker, nav meta, footer links |
| `--fs-action` | `1.3rem` | 87 | Bebas action: the text action (`.action` / `.btn-ghost`), nav toggle, the header Tickets, Sheet close, speaker social links, Desk email, "Clear" |
| `--fs-ui` | `0.95rem` | 88 | small UI prose, help text |
| `--fs-body` | `1.05rem` | 89 | long-form reading copy |
| `--fs-body-lg` | `1.15rem` | 90 | footnotes, short ledes |
| `--fs-lede` | `clamp(1.2rem, 1.6vw, 1.5rem)` | 91 | section ledes, status prose, the `EndLine`, the home facts note and newsletter lede |
| `--fs-title-sm` | `1.45rem` | 92 | small titles, mobile record titles, agenda run-sheet titles, press-kit variant names |
| `--fs-monogram` | `3.4rem` | 93 | initials in an empty photo well |

**[MUST] Mono figures never set under 11px.** `--fs-label-xs` is the floor;
there is no smaller mono step. **[MUST] A note never sets under
`--fs-note-sm`** (13.6px): Special Elite's texture breaks up under 13px
(`_type.scss:11–13`).

**[MUST] Bebas sets at line-height 0.9–1.0, tracking 0, uppercase** (manual
p. 10). Display type uses `--lh-display` (`0.9`, line 97) and
`--track-display` (`0`, line 98), never a per-file `line-height`;
`row-title()` and `action()` set `line-height: 1`, `letter-spacing: 0`
(`_type.scss:24–30`, `75–82`). No Bebas rule carries a `letter-spacing` of
its own (**[CURRENT]** the cookie buttons do, see Open points).
No `text-shadow` on type on the black ground. **[CURRENT]** The one
exception is the home statement set into the photograph: `line-height:
0.88` and a soft black lift (`text-shadow: 0 2px 24px rgba(0,0,0,0.55)`,
`index.scss:34–46`) so the letterforms read on the plate without a scrim; it
is a legibility device for type on a photograph, not a style for type on
black (see Open points).

**[MUST] JetBrains Mono tracks at `0.1em`, `0.15em` or `0.2em`** (manual
p. 10: 0.1–0.2em). A mono figure is never uppercased by CSS: `mono()`'s
`$case` argument has no caller left, and a serial or a time has no case to
force. The `0.2em` step has no caller either since word-labels moved to the
note voice; figures sit at `0.1em` and `0.15em`.

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
| `max-width: 600px` | 19 | the main phone breakpoint |
| `max-width: 900px` | 13 | wide layout collapse; the speaker register drops its portrait (`Speakers.module.scss:97`); the home facts and newsletter go one column, the facts line stacks and drops its middle dots, the venue frame goes 4:3 (`index.scss:288–316`, `HeroOffer.module.scss:30`) |
| `max-width: 860px` | 7 | header / hero |
| `max-width: 720px` | 5 | mid collapse: the ticket row and the home speaker row fold to two columns (`Tickets.module.scss:172`, `SpeakersTeaser.module.scss:74`) |
| `max-width: 500px` | 4 | small phone — 2× `500px` + 2× `31.25em` (`Footer.scss:76,148`) |
| `max-width: 380px` | 1 | narrowest phone (`BaseLayout.scss:46` header padding) |
| `max-width: 599.98px` | 1 | the header Tickets leaves the bar (`Menu.scss:560`) |
| `max-width: 700px` | 2 | `venue.scss:53`, `thank-you.scss:70` |
| `max-width: 1100px` | 1 | the calendar stub folds to two columns (`thank-you.scss:58`) |
| `max-width: 1000px` | 1 | widest collapse (`index.scss:565`) |
| `max-width: 1200px` | 1 | `75em`, `Footer.scss:59` |
| `max-width: 960px` | 1 | `60em`, `Footer.scss:67` |

**[CURRENT]** `min-width` queries exist: `901px` ×6 (`index.scss` ×5, the
menu's two-column overlay `Menu.scss:363`), `601px` ×2 (`Menu.scss:219`,
`invite/member.scss:164`), the press kit's `640px` / `1100px`
(`press/downloads.scss:26`, `30`), and the `1921px` root scale ×3 — see
Open points.

**[MUST] No horizontal-nav breakpoint:** `Menu.astro` is a three-slot bar
with all destinations behind one toggle at every width (`Menu.scss:1–13`).

**[CURRENT]** Two JS-only breakpoints: header auto-hide `760px`
(`Menu.astro:282`), agenda view switch `1024px` (`Agenda.tsx:58`). No
stylesheet uses `760px` any more.

## Z-index & layering

**[MUST]** A new fixed/overlay element joins one of these layers.

| z | Element | Source |
| --- | --- | --- |
| `10060` | a sheet stacked on another sheet (speaker opened from a session) | `SpeakerDetail.module.scss:7` (`--sheet-z`) |
| `10050` | detail sheet (default `--sheet-z`) | `Sheet.module.scss:18` |
| `10001` | fixed site header | `Menu.scss:11` |
| `10001` | `.skip-link` | `BaseLayout.scss:282` |
| `10000` | cookie banner | `CookieBanner.scss:20` |
| `10000` | `.status-bar-cover` (iOS safe-area paint) | `BaseLayout.scss:848` |
| `10` | subpage hero content over its photograph | `SubpageHero.scss:27` |
| `0`–`4` | in-component ordering only (Agenda columns, Tickets wave; the header mark at 2 over the open menu panel at 1, `Menu.scss`; inside a scene: plate, `.scene-vignette` 1 (3 in `SubpageHero`), film grain 2, the home statement 2 over the grain) | local modules, `BaseLayout.scss:781–805` |
| `-1` | a row's full-bleed reach field / wash, under the row's own content | `BaseLayout.scss:690`, `740` |

**[MUST] Grain lives on the photograph.** The film grain is
`.scene:has(> .scene-vignette)::before` (`BaseLayout.scss:793`), z `2` inside
the scene, static, `pointer-events: none`: only a scene that carries a plate
(home hero, subpage hero, invite) takes it. No page-level grain or vignette
overlay.

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
| `0.2s` (dominant, ~68 uses) | the standard control transition: buttons, inputs, links; the text action's colour to `--color-accent-hot` (`BaseLayout.scss:592`, `624`; `_type.scss:105`) |
| `0.15s` | a partner mark lighting (`_logos.scss`), the header's brand slot |
| `0.28s` | the row reach field's colour + opacity fade (`BaseLayout.scss:681`, `691`) |
| `0.3s` | the wash opacity, cookie banner (`BaseLayout.scss:741`, `CookieBanner.scss:24`) |
| `0.32s` | the row pull (`translateX`) and the sheet entry (`BaseLayout.scss:731`, `Sheet.module.scss:23`) |
| `0.6s` | a B&W photograph developing to colour (`venue.scss:32`: venue photos; `Print.module.scss:42`: the speaker print; `index.scss:145`, `206`: the home gallery strip and venue frame) |
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
  reduce` opt-out**, including `scroll-behavior` (`BaseLayout.scss:229–233`),
  controls (`635–641`), row transitions (`759–771`), sheet
  (`Sheet.module.scss:162`), the home gallery and venue frame
  (`index.scss:151–153`, `212–214`).
- **[MUST] No scroll reveal, no per-section entrance.** Sections are simply
  there. The `.reveal` fade-and-rise on every band was removed: the same
  entrance seventeen times spent the page's motion before anything happened.
  **No page-entry animation either: the hero lands still** (the staged
  `fadeInUp` on the hero and the tickets band is gone). Everything moves only
  to show a change (a sheet opening, a row's field). Anything `.js`-gated
  never hides content without that gate.
- **[MUST] One signature motion: a B&W photograph develops to colour on
  hover** (`filter: grayscale(1) …` → `grayscale(0)` over `0.6s`: the venue
  route photos, and the speaker print via `[data-developed]`
  (`Print.module.scss:45`): the one portrait beside the `/speakers` register
  develops while a row of its list is hovered or focused; on `/team` the
  colour bleeds from the cursor; on `/` the venue frame under the facts and
  every photograph in the "Last year" strip, `index.scss:137–153`,
  `195–214`). With the portrait view transition into a sheet, it is the
  site's only decorative motion. The hero plate is still.
- **[MUST] Nothing moves on its own.** The ticker band, the hero countdown
  and the home topic rotor are gone (a ticking readout or a cycling word
  under a still poster was the one thing on the page that moved for its own
  sake; the topics are a "Programme" line in the facts `dl`). The agenda's
  live dot is static: the "Live now" word carries the state. Nothing
  scrolls, nothing marquees: the home gallery is a strip the visitor
  scrolls (`overflow-x: auto`, scroll-snap), never a marquee
  (`index.scss:104–135`). There is no other hover motion: a text action's
  hover is a colour change to `--color-accent-hot`, nothing slides (see
  Component states).
- **[MUST] Animate only `opacity` and `transform`.**
- **[MUST] No `translateX` on the red reach field** (`BaseLayout.scss:679`);
  the pull belongs to the wash.
- **[CURRENT]** The grain is static, not animated (`BaseLayout.scss:793`).

## Component states

**[MUST] Hover paints, focus rings.** Never paint the reach field on `:focus`
— it persists after a sheet closes (`BaseLayout.scss:694–701`). **[MUST]
Hover painting sits under `@media (hover: hover)`**: on touch a tap left the
red field painted (`697`, `705`, `722`).

**[MUST] Two controls site-wide, and no third.** Every action is either the
page's one red fill or a Bebas text action; both set in the action voice.
**No arrow glyph anywhere.** The `→` after a link and the `↗` off-site
marker are deleted everywhere (`a.btn-primary::after`, `.action::after`,
the header Tickets, the speaker teaser's arrow column, Desk, the `/partners`
contact, the invoice and consent links, the press "Read article", the
footer's `.ext`): a glyph renders differently on every system, and a
destination is told by the label. A link and a button in the same control
look the same. A boxed secondary (the old outlined ghost), an underlined
standalone link or a second filled colour is a third control and does not
ship.

`.btn-primary` (`BaseLayout.scss:566–600`):

| State | Treatment |
| --- | --- |
| rest | `--color-accent` fill, white `--color-text` label via `cta-label` (Bebas `--fs-cta` 24px, tracking 0; see Color), 1px accent border, `--radius`, `1.25rem min(2.8rem, 14vw)` padding (the hero's `.hero-cta` `1rem 1.75rem`, the ticket row's `0.85rem 1.3rem`) |
| hover | fill and border → `--color-text`, label → `--color-bg`. No lift, no glow, no shadow |
| focus-visible | `2px solid var(--color-accent-hot)` at `--focus-gap` |
| disabled | not styled globally — see the form buttons below |

`.btn-ghost` / `.action` (`BaseLayout.scss:603–632`): the second control.
Bebas `--fs-action` caps via `action()` (tracking 0, line-height 1) in
`--color-text`, no box, no fill, no underline, no glyph, `border-radius:
0`; padding `0.75rem 0` (vertical only, so the inline edge stays on the
column) with `min-height: 2.75rem` for the 44px target. **Hover and focus
turn the label `--color-accent-hot`** over `0.2s` (`624–631`): the red the
site keeps for a live state, and nothing moves. `.btn-ghost` is kept as the class
name its older callers use (`Closer`, `NextStep`, the cookie Decline, the
`/partners` and `/contact` closers, the ticket row's "Company pays", the
card builders); `.action` is the same thing by its new name: the home "All
partners" and "All N speakers", the `EndLine` link (`EndLine.astro:17`) and
`SubpageHero`'s way-across link (`SubpageHero.astro:51`) take the class
directly. There is no hand-drawn copy of it left.

One red fill per page, and it is the page's decision: the home hero's "Get
tickets" (`.hero-cta`), then the live wave's "Buy" in the ledger, a closer's
primary, the newsletter submit. The header carries none: its Tickets is a
text action (`.header-cta`, `Menu.scss:172–199`: `action()`, no arrow,
`padding: 0.72rem 0`, `min-height: var(--header-tap)`, red on hover and
focus), hidden ≤599.98px and first in the menu; the toggle beside it is the
same type with no box (`.nav-toggle`, `220–248`; on the home hero's first
screen its border is transparent, `206–216`). **[CURRENT]** the bar's centre
slot carries a `note` stamp "Prague · 30 Oct 2026" with a red middle dot
that arrives on scroll (`.header-stamp`, `Menu.scss:127–152`,
`Menu.astro:76`). The same voice sets every in-island action: the Sheet's
`Close` (`Sheet.module.scss:68–74`), the session filters' "Clear"
(`Sessions.module.scss:123`), the speaker sheet's social links
(`SpeakerDetail.module.scss:69–72`, in `--ink-dim` on a `--rule-strong`
underline), the Desk's email and action (`Desk.scss:76–78`), the card
builders' choose and link buttons. The newsletter button follows
`.btn-primary`: white `cta-label` on red, inverted fill on hover, no
shadow, nothing glows or moves (`NewsletterForm.module.scss:62–78`).

**Live state is a red border, nothing more.** The agenda's now line
(`.nowLine`) is a 2px `--color-accent-hot` top border; the session on now
(`.cellLive`) turns its 1px top border `--color-accent`. Neither carries a
shadow (`Agenda.module.scss:517`, `588–590`). The live dot (`.liveDot`,
`579`) is a static 5px red dot, no pulse, no ring.

`.field-row` reach states — **[MUST] chosen by whether the row IS the
control**:

| The row | Rest | Hover | Focus |
| --- | --- | --- | --- |
| **IS** the control (`--link`: sessions, clippings, agenda entries — a real `<button>` / `<a>`) | field at `opacity: 0` | `::before` inset `0 calc(-1 * var(--gutter))`, `--color-accent`, opacity → 1 over `0.28s`; **every** ink goes full black `--on-accent` (`697–703`) | ring `2px solid --color-accent-hot` at `--focus-gap-tight` (4.8:1); if hovered **and** focused the ring inverts to black — red on red is not a ring (`716–727`) |
| **CONTAINS** a control (`--holds`: ticket waves, contact/press desks, `NextStep` rows) | wash at `opacity: 0` | feathered `104deg` white wash → 1, plus `translateX(0.6rem)`; also fires on `:focus-within` (`730–757`) | the inner control carries the ring |

The FAQ `<summary>` is a plain `.field-row`, not `--link`: a red block under
a toggle stayed lit after a tap. Its reach state is the question and marker
in `--color-accent-hot` under `(hover: hover)`, and keyboard focus draws an
inset ring (`outline-offset: -2px`) plus the same red text
(`faq.scss:90–106`).

**[MUST] Red is spent once per list, not once per row.** Resting row labels
are muted typewriter notes in `--ink-muted`; step numbers, row indices
(`--ink-faint`) and separators are muted too (see Color). Exception: the
on-sale wave's state word and its Buy button.

**[MUST] An open `<details>` does not hold the red field** — it opens on
the black ground: no panel, no wash, no feather, only the turned marker and
the answer under its question. Question and answer share one side inset
(`--faq-inset`), so nothing shifts when it opens (`faq.scss:47–70`,
`115–124`).

**[MUST] No opacity-based "inactive" state on content** — status is a word,
not a fade (`BaseLayout.scss:644–649`).

**[CURRENT] Disabled controls:** the newsletter submit (`disabled` until
consent) takes a dedicated `--panel-hover` / 60% white pair, not a fade
(`NewsletterForm.module.scss:80–88`); the invoice submit dims to
`opacity: 0.55` only while in flight (`[aria-disabled='true']`,
`InvoiceForm.module.scss:178–179`); `/partners` marks a not-yet-live CTA with
`aria-disabled="true"` on a `<span>` (`partners.astro:103`). See Open points.

**Loading / empty / error [CURRENT]:** skeleton (`Tickets.module.scss:205–275`,
ruled rows like the ledger so nothing reflows on load) or the `DataState.tsx`
loading pulse, then content or the shared `DataState.tsx` `ErrorState`.
**[MUST]** Every data-backed page ships a `.fallback-note`
(`BaseLayout.scss:452`) — except `/`, see Open points.

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
- **The newsletter form sits on the black ground** like every other
  control; `NewsletterForm.module.scss` carries no second-ground variant.
- **[MUST] The consent checkbox is drawn, not native**
  (`NewsletterForm.module.scss:104–141`): `appearance: none`, a 1.5rem box
  with a 2px border in the ground's ink (`--box-ink`, white), filled with
  that ink and a cut-out tick (`--box-tick`) when checked;
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
  `Print.module.scss:24`, the one plate beside the speaker register and
  beside the home speakers teaser).
- **[CURRENT] Other ratios in use:** `3 / 2` the home
  gallery strip (`index.scss:137–142`), `16 / 9` press clippings on `/contact`
  (`press.scss:65`) and press-kit previews (`press/downloads.scss:46`), `1`
  the session sheet's speaker thumb (`SessionDetail.module.scss:82`). The
  home hero plate has no ratio: `.hero-plate` is `min-height: clamp(26rem,
  58vw, 44rem)` (`34rem` ≤600px) and the photograph fills it
  (`index.scss:11–32`, `318–326`).
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
  plate, no cream tile: open marks on the page ground. On `/partners` each
  tier opens on a `.head-rule` (the tier name at `--fs-head`, the count "N
  partners" as the note; `partners.astro:50–55`), then its marks in **one
  left-set flex row** wrapping when it must, on a steady gap
  (`.logo-grid`, `partners.scss:33–45`). Rank is **one cap height per tier**
  (`--mark-h`): Platinum `4rem`, every other tier `2.6rem`, Community and
  Media `2.2rem` (`3rem` / `2rem` ≤600px); every mark sets `height:
  var(--mark-h); width: auto` through `partner-logo()`. No grid, no
  two-wide cell, no tier box drawn: the column grid with two-wide cells
  left holes. The tier order is the ladder, then Community, then Media.
- **[CURRENT] The home partner wall** (`#partners`, `index.astro:154–181`,
  `index.scss:229–270`): a `.head-rule` "Partners" with no note (a tier
  list is a label of the wall's own contents, not a fact; see Structural
  rules), then one `.partners-row` per tier, top tier first, Community
  last, Media on `/partners` only. No tier labels in the wall: the heights
  carry the ladder. `--mark-h` Platinum `3.5rem`, every other tier `2.4rem`,
  Community `2rem` (`2.8rem` / `2rem` / `1.7rem` ≤600px). The wall ends on
  the `.action` "All partners".
- **[CURRENT] Rank is height, not ink area.** `partnerLogo()` still runs
  `opticalBox()` against the tier's reference box (`CELLS`,
  `partners.ts:105`; `STRIP_SCALE` 1.1 on the home wall), but on both walls
  the box only feeds the `<Image>` `width` / `height` and srcset: the
  rendered size is `--mark-h`. `plated` is a per-partner flag, not a tier
  inversion.
- **[MUST] A missing photograph falls back to initials** at `--ink-monogram` /
  `--ink-monogram-sm` (4.21:1 / 7.71:1, `BaseLayout.scss:157–160`).
- **[MUST] Photography is B&W at high contrast** (manual p. 13). Avatars
  and the session sheet's speaker thumb rest at `contrast(1.3)`
  (`Agenda.module.scss:415`, `Sessions.module.scss:169`, `269`, `288`,
  `SessionDetail.module.scss:100`); the home venue frame at `contrast(1.3)
  brightness(0.8)` (`index.scss:205`). **[CURRENT]** The speaker print, the
  speaker-sheet plate, `/team` and the hero plate rest at
  `contrast(1.12–1.14)`; the home gallery strip at `contrast(1.06)
  brightness(0.78)` (`index.scss:144`); the venue route photos at `1.35`
  (see Open points). Every one of them develops to colour on hover.
- **[MUST] Every `<img>` below the fold is `loading="lazy" decoding="async"`**
  with intrinsic `width`/`height`; above the fold `eager`. Local assets use
  Astro `<Image>` with `layout: 'constrained'`, `responsiveStyles: true`
  (`astro.config.mjs:107–112`).
- **[MUST] Decorative images take `alt=""`** (`contact.astro:76`,
  `press/downloads.astro:60`).
- **[CURRENT]** Imagery is `.webp`; OG card `.jpg` 1200×630
  (`public/og-image.jpg`: "30 OCT 2026" with only "2026" red, the official
  white red-dot logo, a white CTA label on red). **[MUST]** The detective key
  art, `/hero-detective.webp`, is the home hero (full-bleed: `width="100%"`
  and the left feather replaced by a flat mask, `index.astro:49–56`,
  `index.scss:29–32`) and the default subpage plate (`HeroBackground.scss:14`,
  a right-hand 60% with a left feather; `HeroBackground` takes `focus`,
  `src`, `width`, `size` and the two opacities, nothing else); a page about the event swaps in a documentary
  shot from a past edition or of the mill, graded B&W (`docs/product.md`),
  **one plate per route**: `SubpageHero` `plate` (→ `HeroBackground` `src`)
  sets `/speakers` `devfest-2025-03`, `/partners` `devfest-2025-01`,
  `/agenda` `uhelny-mlyn-chimney`, `/venue` `uhelny-mlyn-entrance-tower`
  (all under `public/gallery/`). The detective plate is the home hero's
  alone; `/team` and every other subpage open type-only (`photo={false}`).
  Beyond the plate, `/` carries two photographic blocks and no more: the
  venue frame closing "The event" (`src/assets/venue/uhelny-mlyn-chimney.jpg`
  through `<Image>`, `index.astro:102–111`) and the "Last year" strip of 22
  press photographs (`public/gallery/devfest-2025-01…22.webp`, `alt=""`,
  lazy, `index.astro:125–151`).

## Component conventions

- **[MUST] Astro for layout and static UI; React islands only for behaviour**
  (`HeroOffer`, `NewsletterForm`, `Speakers`, `SpeakersTeaser`, `Sessions`,
  `Agenda`, `Tickets`, `InvoiceForm`).
- **[CURRENT] `client:load` by default;** `NewsletterForm`
  (`index.astro:155`) and the invite page's island use `client:visible`.
  `Tickets` takes `client:load` (`index.astro:105`): the hero's "Get tickets"
  jumps straight to it. **[MUST] An island that renders nothing until data
  resolves takes `client:load`** — a zero-height placeholder never intersects
  (`SpeakersTeaser`, `index.astro:108`).
- **[MUST] Styling location:** islands import a co-located CSS Module; Astro
  components use a sibling `.scss` or global primitives; pages use
  `src/pages/<page>.scss`.
- **[MUST] Global primitives are used by class name, never copied.**
- **[MUST] Anything on more than one page is a component or a primitive.**
- **[MUST] A measured value is decided once, as a token.**

Primitives, all in `BaseLayout.scss`:

| Class | Line | What it is |
| --- | --- | --- |
| `.u-container` | 329 | centred column at `--maxw` with the page gutter |
| `.page-stack` | 432 | every page's `<main>` |
| `.band` (+ `--lit` 492) / `.band-inner` | 476 / 501 | a section's ground, black; `--lit` is the subpage ground. There is no `--accent` variant |
| `.eyebrow` | 337 | plain typewriter note (`note()`, `--ink-muted`) — no decoration, no trailing hairline, never uppercased; the head of a `NextStepList`, the `/thank-you` calendar stub, the invite alias |
| `.head-rule` (+ `.head-rule-title`, `.head-rule-note`) | 348 | **the section head**: a `<header>` with the Bebas `--fs-head` title (`display()`) left and at most one typewriter `note()` in `--ink-muted` right, on their baseline, on a 1px `--color-text` rule (`border-bottom`, `padding-bottom: 0.8rem`) — the first line of the ruled list under it; wraps on a phone. Every home section, the ticket ledger, the speakers teaser and every `/partners` tier open on it. The note carries a fact the visitor needs ("N confirmed", the VAT line) or is left off; never a label of the section's own contents (see Structural rules) |
| `.display` (+ `.red` 381) | 371 | poster headline; `.red` only on the home hero statement (see Structural rules) |
| `.head-split` / `.head-title` / `.head-note` | 387 / 396 / 400 | two-column section head: statement left, one line right (`/agenda`, `/contact`) |
| `.head-stack` | 439 | the one-column section head, closed by space (no hairline); **no caller** today |
| `.print` | 420 | the mounted photograph well at 4:5 |
| `.fallback-note` | 452 | the no-JS / endpoint-down prose |
| `.anchor-target` | 468 | a jump lands on the section head |
| `.closer` family | 509 | the closing statement (see `Closer.astro`), on the black ground |
| `.btn-primary` | 566 | the one red fill; white Bebas `cta-label`, no glyph |
| `.btn-ghost` / `.action` | 606 | the text action: Bebas `--fs-action` caps, no box, no underline, no glyph; red on hover (see Component states) |
| `hairline-link()` | `_type.scss:99` | **the in-prose link**, a mixin only (the old `.hairline-link` class is gone): plain `underline` in `--rule-red` at 3px offset, white, lit to `--color-accent-hot` on hover/focus (SC 1.4.1: colour alone does not mark it). **[MUST]** A link inside running text takes it as is (`faq.scss:137`, `privacy-policy.scss:45`, the ticket footnotes, the forms' consent lines, the hero facts line's venue link, `index.scss:86`); never a red-text variant, red is not running text. A standalone link is an `.action`, never underlined |
| `.field` / `.field-row` (+ `--short` 675, `--link` 680, `--holds` 730) | 651 / 661 | the ruled list and row: `border-bottom: 1px solid var(--rule)` on every row, `--field-step` of vertical padding |
| `.record-status` | 775 | the state word of a wave that cannot be bought ("Sold out", "Unavailable"), a `note(--fs-note-sm)` flush right in the action column |
| `.scene` / `.scene-vignette` | 781 / 782 | a photographed scene: plate, vignette, film grain (`::before`, 793) |
| `.skip-link` / `.sr-only` | 272 / 315 | see Accessibility; the skip link is set in the action voice (279) |
| `.status-bar-cover` | 827 | iOS safe-area paint |

Shared components: `Desk.astro` (one inbox), `SubpageHero.astro` (takes
`focus` and a `plate`), `HeroBackground.astro` (takes a `focus` crop, a
`src` plate, default the detective key art, and an opt-in `width` / `size`),
`Closer.astro` (takes an extra
`class`; `tone` is accepted for its call sites and ignored, every closer
renders on black), `EndLine.astro`, `Menu.astro`, `Footer.astro`, `CookieBanner.astro`,
`NextStep.astro`, `NextStepList.astro`, `DataState.tsx`, `SpeakerPhoto.tsx`,
and
`Sheet.module.scss` (the shared detail-view chrome for `SessionDetail` /
`SpeakerDetail`).

- **`EndLine.astro`** — the last line of a page that asks for no decision,
  in place of a `Closer`: one Special Elite `--fs-lede` line in `--ink-soft`
  and one `.action` (Bebas caps, no glyph, no underline) to the useful
  next step, on one baseline, wrapping under on a phone; `6rem` of air
  above it, inside the last band's inner column (`EndLine.astro`,
  `EndLine.scss`). Ends `/team`, `/attending`, `/invoice`,
  `/thank-you`, `/newsletter-subscription-thank-you`, `/press/downloads`,
  `/faq`.
- **`NextStepList.astro`** — the list and its head: a typewriter `.eyebrow` `h2`
  (`label`, `labelId` for the section's `aria-labelledby`), then a `.field`
  `<ul>`, or `<ol>` when `ordered` (a real sequence). Never a poster head:
  the row titles under it are the larger type. `/404` "Try one of these",
  `/thank-you` "Before you go", `/newsletter-subscription-thank-you` "While
  you wait", `/venue` "The route" (ordered).
- **`NextStep.astro`** — one thing to do, a `.field-row--holds` row inside a
  `NextStepList`. Grid `0.8fr` / `1.2fr`, stacked ≤900px
  (`NextStep.scss:7–12`, `59–63`): left an optional mono `--fs-label-lg`
  index figure in `--ink-faint` (`index`, `01`, visual only — the `<ol>` carries
  the order) over a Bebas `--fs-h3` title; right the Special Elite note
  (`--fs-body`, `--ink`, max `52ch`) with its actions **under** it,
  left-set, ghost by default. The default slot takes media for the step
  (the venue photos).
- **`DataState.tsx`** (`ErrorState` / `EmptyState`) — left-set; **an empty
  state always offers somewhere to go**.
- **`SpeakerPhoto.tsx`** — no URL or a failed load both land on the monogram;
  caller passes classes for the shape.
- **Speakers teaser** (`SpeakersTeaser`, home) — the register's first
  lines. Head: the `.head-rule` "Speakers" with the note "N confirmed";
  then five `.field-row` rows (`TEASER_SIZE`, shuffled once per payload),
  each an `<a>` to `/speakers?speaker=<id>` on a `4rem / 1fr / auto`
  grid: a mono `--fs-label` index figure in `--ink-faint` (tabular,
  `aria-hidden`), the name Bebas `--fs-row-sm` in `--color-text`, and the
  role as a `note(--fs-note-sm)` in `--ink-muted` right-set on one line
  (ellipsis at `32ch`). No arrow column; resting names sit in `--ink-dim`
  and the reached row's name is white; the row's ground stays black (no
  reach field). Beside the rows, on a `minmax(0, 1fr) / 420px` grid, the
  reached row's portrait on the shared print (`Print.module.scss`, 4:5,
  B&W at rest, developing to colour while a row is hovered or focused,
  sticky under the bar, overrunning the gutter) — the same plate as the
  /speakers register. The `.action` "All N speakers" closes the list on
  `0.5rem`. No auto-rotation. ≤900px the portrait goes; ≤720px the
  index goes and the role sits under the name. The teaser opens on
  `--section-y-tight` and closes on no padding of its own; nothing renders
  until the lineup resolves (`SpeakersTeaser.tsx`,
  `SpeakersTeaser.module.scss:6–89`).
- **Speaker register** (`Speakers`, `/speakers`, `Speakers.module.scss`) —
  one row per speaker and one portrait beside the list, no grid of prints.
  The list column and a fixed 420px portrait column (`.lineup`, gap
  `clamp(2rem, 5vw, 5rem)`). The list opens on a 1px `--color-text` top
  rule, like every ruled list's head line, and every row (`.cell`) closes
  on a 1px `--rule`. A row is a `<button>`: the name Bebas `--fs-row-sm` via
  `display()` in `--ink-dim`, the role (`cleanTagline()`) a
  `note(--fs-note-sm)` in `--ink-muted`, right-set on the name's
  baseline, one line cut with an ellipsis at 42% of the row; `0.55rem` of
  padding each side of the rule. The reached row (pointer or focus) lights
  to `--color-text` / `--ink-soft` and puts its speaker on the shared
  `.print`, which is `position: sticky` under the bar
  (`top: calc(var(--header-h) + 2rem)`) and overruns the column by the
  gutter to the viewport edge; it develops while a row is hovered or
  focused and carries the view transition into the sheet for the speaker
  being opened. ≤900px: the register alone, role under the name, no
  portrait (the face is in the sheet). No placeholder row for names still
  to come (removed in #465). Hierarchy by ink on one size, not by size
  (`Speakers.module.scss:7–118`).
- **Speaker sheet** (`SpeakerDetail`) — opens on the name; no "Speaker"
  kicker above it (the session sheet keeps its "Session" kicker). Bio and
  talk line ragged, no hyphens (see Typography). Links are named Bebas
  `--fs-action` text in `--ink-dim` on a `--rule-strong` underline, lit to
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
- **Agenda** (`Agenda`) — a talk is **type on the sheet, not a card**: the
  cell is transparent with one `--rule-strong` hairline across its top
  where it starts, no fill, no box, no radius (`.cell`,
  `Agenda.module.scss:181–207`); reached, it lights and its bottom rule
  draws red. Unfilled time (`.idle`) is transparent too, the room rules
  running through it; only a break (`.band`) is a flat `--panel-lit` strip,
  no hatching, ruled on the top edge only (`Agenda.module.scss:59–71`),
  compressed to 2–3 rows (`NON_TALK_ROWS`, `Agenda.tsx:40`). A speakerless
  "TBA"/"TBD" slot renders as "Slot open": its time and a `note` label on
  `--panel` inside a dashed `--rule-strong` outline, not a control
  (`.slotOpen`, `Agenda.module.scss:301–319`). A cell's speaker names set
  like the Sessions list: Special Elite `--fs-label-lg`, `--ink-soft`,
  sentence case (`.cellSpeakers`, `Agenda.module.scss:286–290`). A speakerless service
  session running ≥180 minutes (the lounge) leaves the grid for a banner
  above it, one `--panel-lit` line each: time, title, room
  (`AllDayStrip`, `Agenda.tsx:224`; `.allDay`, `Agenda.module.scss:322`).
  The narrow layout (≤1024px, JS) is a run sheet: a mono time figure, Bebas
  `--fs-title-sm` title, the room as a `note(--fs-note-sm)`, at a tighter
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
the loud one. On `/` every section opens on a `.head-rule`: the title is
the section's name at `--fs-head` ("The event", "Tickets", "Speakers",
"Last year", "Partners", "Newsletter") and the rule under them is the
list's first line. No numbered eyebrow, no stamp, no poster `h2`.

**[MUST] A head note carries a fact, never a label of the section's own
contents.** The note exists only where it tells the visitor something the
section does not already show: Tickets ("VAT included" / "Prices in CZK" /
"<Wave> is the final wave", `Tickets.tsx:222–224`), Speakers ("N
confirmed"), Last year ("DevFest.cz 2025, in photographs",
`index.astro:129`), each `/partners` tier ("N partners"). The event,
Partners and Newsletter open on the title alone (`index.astro:83–85`,
`157–159`, `188–190`): "Eleventh edition" restated the note under it, the
tier list restated the wall, "A few emails a year" restated the lede. A
note that only names what follows is filler and is left off. Section titles say what the section is; a full stop belongs to
a statement, not a label. One `--fs-display` per page; section heads
left-set; no accent bars down a block's left edge; lists are **ruled**, one
`--rule` under each row and nothing else; detail views are full-bleed
sheets. `Closer.astro` ends
a page that asks for a decision, on the black ground: `/speakers`,
`/agenda`, `/workshops`, `/venue`, `/invite/<member>`. A page that asks for
none ends on an `EndLine` (list above); `/contact` ends on its "Open the
press kit" button, `/partners` on its own `.closer` block on black
(`partners.astro:79`), `/404` on its `NextStepList`, and `/privacy-policy`,
`/code-of-conduct` and `/delete-account` on their content.

**The footer is the open sitemap [MUST].** The menu hides every destination
behind one toggle at every width, so `Footer.astro` lists every page in two
groups, *Attend* and *About*, with the menu's labels. A new route is added to
both.

**Footer anatomy [MUST]:** columns → the bottom line (`© 2026 GUG.cz, z.s.`
left, the folio `Case no. DF-2026` centre, "Open source" right, no off-site
glyph). The footer's base face is Special Elite (`Footer.scss:11`): column
titles, links, the organiser line and the bottom line are notes
(`note()` / `note(--fs-note-sm)`, `Footer.scss:93–94`, `120–121`,
`207–208`, `263`). The folio is the case-file mark the manual prints on
every page and the footer's one mono figure: a `<small class="folio"
aria-hidden="true">` at `mono(--fs-label, 0.1em)` (`Footer.astro:171`,
`Footer.scss:272–274`); decorative, so it stays out of the accessibility
tree. The brand column leads with the official logo
file (`src/assets/logo.png`, a link home, `Footer.astro:79–89`), then the
tagline; no typeset `DEVFEST.CZ` wordmark (it disagreed with the header's
mark). Ground `--color-bg`. The footer opens on a 1px `--rule` top edge,
the document's last rule (`Footer.scss:9`); between its rows, space only
(`Footer.scss:2–22`).

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
		<!-- A page that asks for a decision ends on a Closer instead (on black): -->
		<Closer titleHtml={'…'} note="…" actions={[…]} titleId="…" />
	</main>
</BaseLayout>
```

Decision criteria, picked per page:

- **`plate` vs `photo={false}`.** One plate per route, and the detective
  art is the home hero's: `speakers`, `partners`, `agenda` and `venue` each
  take their own documentary `plate` and `focus` (list under Images).
  `photo={false}` everywhere else, where content starts right below the
  fold: `team`, `faq`, `contact`, `invoice`, `press/downloads`,
  `workshops`, `attending`, `speaker-card`, `404`, the two thank-you pages
  and the three legal pages.
- **Legal pages.** Inside the lit band a `.policy` reading column, left on
  the gutter, max `70ch`, Special Elite `--fs-body`, `h2` at `--fs-h3`
  (`privacy-policy.scss:6–21`, shared by all three). Data tables stack into
  labelled cards ≤600px: each `td` prints its column head from
  `data-label`, the `thead` is visually hidden but kept for assistive tech
  (`privacy-policy.scss:118–170`).
- **`.band--lit`.** The one subpage ground. A `--lit-red` variant existed for
  the people / programme pages but was byte-identical; it was folded in.
- **No red band.** The accent band variant and its ground token are gone
  (`BaseLayout.scss:501–504`). A closer, the `/partners` CTA and the
  newsletter sit on the black `.band`; the red on such a screen is the
  button.
- **The first band's head.** **[MUST]** When the hero already names what the
  band holds (`speakers`, `agenda`, `contact`, `press/downloads`), the band opens straight on its content with an
  `sr-only` `h2`. A second poster headline under the hero ("Who's talking"
  under "Speakers") says the same thing twice. A visible head is for a band
  the hero does not name: the FAQ groups, a second band further down. A
  `NextStep` field is headed by its `NextStepList` typewriter label, not a poster
  head.
- **A way across** goes in the hero as `SubpageHero link`, an `.action`
  under the lede (`SubpageHero.astro:51`, `SubpageHero.scss:57–61`), not in
  a band head: `/agenda` "Browse all talks" (`#talks`; `/sessions` now
  redirects there), `/faq` "Get in touch" (`mailto:`).
- **`.head-rule` vs `.head-split`.** `.head-rule` is the section head: a
  name and one fact on a rule, over a list. `.head-split` stays on the two
  pages whose head carries a sentence, not a fact (`/agenda`, `/contact`).
  `.head-stack` has no caller (see Open points).
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
- **The home page is one ruled document** (`index.astro`, `index.scss`):
  the full-bleed plate with the statement set into it, the facts line with
  the page's one red fill, then five sections on `.head-rule` (The event,
  Tickets, Speakers, Last year, Partners) and the Newsletter. No second
  hero, no numbered eyebrows, nothing that moves on its own. Each section
  is a `.band .sec`: `--section-air: var(--section-y-tight)`, no bottom
  padding, and `clamp(1.75rem, 3vw, 2.5rem)` between the head and what
  follows (`index.scss:93–102`); the ticket ledger and the speakers teaser
  set the same opening on their own roots (`Tickets.module.scss:7–18`,
  `SpeakersTeaser.module.scss:6–11`).
- **The home hero is the plate** (`#hero`, `.hero-plate`, `index.astro:44–62`,
  `index.scss:11–47`). `HeroBackground` runs edge to edge (`width="100%"`;
  `--hero-mask-shape` set to a flat black gradient so the left feather is
  off) under the bar; the plate is as tall as `clamp(26rem, 58vw, 44rem)`
  (`34rem` ≤600px), not the viewport, and ends flush; the vignette and the
  grain ride on it. One thing sits on the photograph and nothing else: the
  statement in the lower left (`h1.hero-statement`, `.display`,
  `clamp(2.8rem, 9.4vw, 8.5rem)`, `clamp(2.6rem, 15vw, 4.2rem)` ≤600px,
  `text-wrap: balance`, the red word and the full stop; see Typography for
  its text-shadow). The "Case file DF-2026 · Public" stamp is gone. No logo
  in the hero (the bar carries the mark), no rotor, no actions on the plate.
- **The facts line** (`.hero-line`, `index.astro:64–77`, `index.scss:51–91`)
  sits under the plate on the page column: left, the typewriter facts
  (`.hero-facts`, `note()` in `--ink-muted`: the date as a `<time>` in
  white, the venue as a maps link in white on the in-prose underline
  (`hairline-link()`: the date beside it is the same white, so colour alone
  cannot mark it), and `HeroOffer` — the wave on sale, "until <date>" when
  it has one, "From <price>" to `#tickets`, in the offer's two greys),
  separated by literal middle dots: `.hero-facts-dot` in the markup
  (`index.astro:67`) and the island's own `.dot`
  (`HeroOffer.tsx:32–34`, `HeroOffer.module.scss:22–33`, because the island
  is a `display: contents` wrapper the page's `::before` cannot reach),
  both `aria-hidden` and hidden ≤900px where the facts stack
  (`index.scss:305–307`); right, the page's one red fill,
  `.btn-primary.hero-cta` "Get tickets" (`padding: 1rem 1.75rem`). ≤900px
  the line stacks and the button runs full measure. No Bebas figures, no
  countdown, no stat row.
- **"The event"** (`index.astro:80–113`, `index.scss:155–223`): the
  `.head-rule` "The event" with no note, then the note left and the facts
  right on a `6fr / 5fr` grid (one column ≤900px). `.facts-note` is
  Special Elite `--fs-lede` at 1.65 in `--ink` on a `44ch` measure and
  reads "The eleventh DevFest.cz: one day in a converted coal mill 25
  minutes north of Prague, for 350 medior and senior developers from
  across CEE." `.facts-list` is a `<dl>` set as a `note()`: the term in
  `--ink-muted`, the value in `--color-text` — Date (a `<time>`), Place,
  Doors ("08:00 — 20:00"), Audience, and **Programme**: the `TOPICS` joined
  by middle dots, the line that replaced the rotor. No photograph in the
  section: the venue is shown on /venue, and the home page's photographs
  are the hero plate, the speaker portrait and the "Last year" strip.
- **"Last year"** (`index.astro:123–151`, `index.scss:104–153`), after
  the speakers teaser: the `.head-rule` "Last year" with the note
  "DevFest.cz 2025, in photographs", then `.gallery-strip`: a horizontal
  strip of 22 press photographs the visitor scrolls (`overflow-x: auto`,
  `scroll-snap-type: x proximity`, `scrollbar-width: thin` in
  `--ink-faint`, the thin scrollbar part of the design), starting on the
  content column and running off the right edge (`padding: 0 var(--gutter)
  1.25rem`, `scroll-padding-inline: var(--gutter)`). It is a focusable
  `role="region"` with an accessible name and an inset focus ring
  (`index.scss:119–122`). Each photograph is `3 / 2`, `clamp(240px, 30vw,
  26.25rem)` tall, B&W at rest and colour on hover, no frame, no caption,
  `alt=""`. Not a marquee: nothing scrolls on its own.
- **The partner wall on `/`** — see Images & media. Its head has no note.
- **The newsletter** (`index.astro:186–200`, `index.scss:272–286`): the
  `.head-rule` "Newsletter" with no note, then the Special Elite
  `--fs-lede` lede in `--ink` (max `36ch`) left and the form right on two
  equal columns (one ≤900px). No poster `h2`.
- **The bar over the home hero.** The hero no longer covers the bar: the
  `data-covers` / `trackHeroCover` mechanism is deleted (there is no logo
  and no button on the plate to double it), so the mark and the Tickets
  action stay in the bar at every scroll position. At the top of the page
  the bar's ground is the scrim only, and the toggle's border is transparent
  so the bar is two Bebas words and the mark (`Menu.scss:206–216`).
- **The ticket ledger** (`Tickets.tsx:216–296`, `Tickets.module.scss`):
  the `.head-rule` "Tickets" whose note is the VAT line ("VAT included" /
  "Prices in CZK") or, once the last wave is on, "<Wave> is the final wave";
  no description, no note paragraph, no stamp. Then one `.field-row
  .field-row--short .field-row--holds` per wave on a `4rem / 1fr / auto /
  auto` grid: `[index · state]` (mono `--fs-label` serial figure in
  `--ink-faint`, `Tickets.module.scss:42`; the live wave's state word "On
  sale" / "Last chance" as a `note(--fs-note-sm)` in `--color-accent-hot`,
  `48–52`), `[wave · deadline]` (Bebas `--fs-row-sm` title; the sale window
  as a `note(--fs-note-sm)` `<time>` in `--ink-meta` when ti.to set one,
  `72–76`), `[price · company figure]` (Bebas `--fs-row-sm` price,
  right-set; the other variant's price as one `note(--fs-note-sm)` line
  under it, `101–105`), and the action column: the live wave's red `Buy`
  (`.btn-primary`, `0.85rem 1.3rem`) beside the "Company pays" Bebas text
  action, or a settled wave's `.record-status` note ("Sold out",
  "Unavailable") flush right on a `12rem` column. The live wave has no lit ground: its
  state word and its Buy are the list's one red mark. ≤720px: two columns,
  the serial and state on one line across the top, the actions across the
  bottom. The skeleton mirrors the ruled rows.
- **The ticket and invoice facts sit where the decision is.** Each row
  prints its price once; another variant's price is one mono data line under
  it ("Company funded 1 452 Kč", a note: it is a sentence with a figure in it). The buttons read "Buy" / "Company pays";
  their accessible names lead with that visible label (WCAG 2.5.3). That is
  the whole of who-pays on a row: no admission line, no explainer under the
  buttons. The tax line is the head's note and is not repeated; the
  footnote under the list (Special Elite `--fs-body-lg` in `--ink-meta`,
  max `70ch`, in-prose links underlined in `--rule-red`) offers the invoice
  and the newsletter (`Tickets.tsx:289–302`). `/invoice`
  names the rate it prices from (no "Estimated"), the 14-day due date
  (`INVOICE_DUE_DAYS`, mirrored in `InvoiceForm.tsx`), that the price holds
  once the invoice is issued, and that one code claims every ticket. Its
  `EndLine` answers invoice questions; it does not send the visitor to card
  checkout.
- **A `<details>` list opens with its first item open** (`faq.astro:91`).
  A section must not reuse the hero's `aria-labelledby` (`landmark-unique`).
- **`Closer` ground.** Every closer renders on the black `.band`
  (`Closer.astro`); the `tone` prop is accepted for its call sites and
  changes nothing. A `Closer` ends a page that asks for a decision
  (buy, register, come); a reference page ends on an `EndLine` (`/faq`:
  "Still stuck?" and a `mailto:` link) or on its content (`privacy-policy`,
  `code-of-conduct`, `delete-account`).
- **`/faq`.** The detective-theme question sits in Essentials
  (`src/content/faq.json`). The category is the page's head on its row,
  Bebas `--fs-h2` (`.faq-cat`, `faq.scss:25–28`); the questions sit a step
  down at `--fs-row-sm` (`.faq-q-text`, `97–101`); an open item opens on
  the black ground, no panel (see Component states).
- **`/venue`.** Both map links on the route ("Station to venue", "Open in
  maps") are ghost buttons (`venue.astro:30–37`): two ways to the same
  place are not two decisions; the page's red is the closer's button.

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
what it is ("The event", "Tickets", "Speakers", "Partners", "Newsletter",
"Agenda", "The team", "Questions", "Become a partner"); a `.head-rule`
note is a fact or absent ("N confirmed", "VAT included", "DevFest.cz 2025,
in photographs"); the home hero carries no case-file stamp, and the only
case dressing left is the footer's folio and the header's scroll-in stamp.
No triads, no em-dash chains, no hype words.

**[CURRENT] Subpage titles** (`SubpageHero titleHtml`): `/speakers`
"Speakers", `/partners` "Partners", `/team` "The team", `/faq` "Questions",
`/agenda` "Agenda", `/venue` "Getting there", `/contact`
"Get in touch", `/press/downloads` "Logos & assets", `/invoice` "Buy on a
company invoice", `/workshops` "Save your seat at a workshop", `/attending`
"I'm attending", `/speaker-card` "I'm speaking", `/thank-you` "You're in",
`/newsletter-subscription-thank-you` "You're on the list", `/404` "Nothing
filed under that", `/privacy-policy` "Privacy Policy", `/code-of-conduct`
"Code of Conduct", `/delete-account` "Delete your app account". Closers:
"Be in the room." (`/speakers`), "Doors open 30 October."
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
  `--focus-gap-lg` (alone in space) (`BaseLayout.scss:138–142`). Commented
  exceptions: agenda cell inset ring, the FAQ question's inset ring
  (`faq.scss:90–93`), and a partner logo's wider `6px` gap on the home wall
  and `/partners` (`index.scss:185–188`, `partners.scss:68–71`).
- **[MUST] Semantics before ARIA.** A row that IS a control is a real
  `<button>` / `<a>` / `<summary>`.
- **[MUST] `.skip-link` is the first focusable element** (`BaseLayout.astro:332`,
  `BaseLayout.scss:272–304`). `html { scroll-padding-top: calc(var(--header-h)
  + 1.5rem); scroll-padding-bottom: 8rem }` keeps targets clear of header and banner.
  `#main-content` has `tabindex="-1"` so `Enter` moves focus, not just the
  fragment; its ring alone is suppressed.
- **[MUST] The cookie banner is second in the DOM**, `Escape` handler on
  `document` (`CookieBanner.astro:89–93`).
- **[MUST] Nothing moves on its own (2.2.2 by construction).** The topic
  rotor is gone; the only loops are the loading skeleton and pulse, both
  stopped under reduced motion.
- **[MUST] Header controls are 44px tap targets.** The mark link and the
  bar's controls take `min-height: var(--header-tap)` (`Menu.scss:89`,
  `188`, `235`); the text actions take `min-height: 2.75rem`
  (`BaseLayout.scss:618`).
- **[MUST] A white label on red is large text or it does not ship.** The
  `cta-label` size (Bebas 24px, regular large text) is the AA floor (see
  Color); where it does not fit, the
  control moves (the header Tickets into the menu under 384px), the label
  never shrinks.
- **[MUST] `.sr-only`** for text in the a11y tree but off screen
  (`BaseLayout.scss:315`).
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
   `aria-disabled` `<span>` (`partners.astro:103`), `.record-status` word.
5. **No `aria-invalid` in `src`.** Errors go through one `aria-live` region.
   Acceptable for two forms, but should be a stated decision.
6. **Orphaned tokens.** `--fs-title-compact` (`BaseLayout.scss:70`) and
   `--fs-hero` (`62`) have no `var()` caller: the legal pages that read
   `--fs-hero` moved to `SubpageHero`, and the home statement sets its own
   clamp (`index.scss:49`). Delete both or give them a caller. (`--fs-wordmark` and
   `--ink-wordmark` went with the footer wordmark.)
7. **`min-width` queries** against a max-width convention: `901px` ×6
   (`index.scss` ×5, `Menu.scss:363`), `601px` ×2 (`Menu.scss:219`,
   `invite/member.scss:164`), `press/downloads.scss:26,30` (`640px` /
   `1100px`).
8. **JS-only breakpoint:** `1024px` (`Agenda.tsx:58`), in no stylesheet.
   The header's `760px` (`Menu.astro:282`) matches no stylesheet query any
   more; the home rows fold at `720px`, the speaker register at `900px`.
9. ~~**Special Elite declares no `subsets`**~~ Resolved: Latin-Ext letters
   fall to JetBrains Mono via the Fonts API `fallbacks` (see Typography).
10. **Split with `CLAUDE.md`.** Rules live here; `CLAUDE.md` points here.
    Nothing enforces it.
11. ~~**`Closer` default `tone="raised"` renders `band--raised`, which has
    no CSS.**~~ Resolved: `Closer.astro` renders every tone on the black
    `.band`; the prop is kept for its call sites and ignored.
12. **The font-size ramp is [MUST] but broken at ~25 call sites:**
    literals in `Menu.scss` (the nav links), `AttendingCard.module.scss`,
    `team.scss`, `invite/member.scss`, and the home statement
    (`index.scss:49`, `233`), 1 relative (`Footer.scss:133`), 3 inherited
    (`Footer.scss:292,296,301`). The same claim in `BaseLayout.scss:80` is
    equally untrue. Fold into the ramp or downgrade to [CURRENT].
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
17. ~~**One section head still carries a full stop:** the final-wave
    title.~~ Resolved: the ticket section has no poster head; the final
    wave is a note under the numbered eyebrow.
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
27. **Photo contrast is mixed.** The home frame and avatars rest at
    `contrast(1.3)`; speaker prints (`Print.module.scss:40`), the speaker
    sheet (`SpeakerDetail.module.scss:40`), `/team` (`team.scss:60`) and
    the hero plate (`HeroBackground.scss:19`) at 1.12–1.14; the venue
    route photos at 1.35. Manual p. 13 also allows speaker portraits in
    colour on black.
29. **`.head-stack` has no caller** since the home gallery head went
    (`BaseLayout.scss:436`); the ruled document made `.head-rule` the
    default and left it nothing. Delete the primitive.
30. **The home statement carries a `text-shadow`** (`index.scss:55`) against
    the Bebas rule's "no text-shadow": a legibility lift for white type set
    into a photograph with no scrim. Decide whether a scrim or a darker
    plate grade replaces it, or state the exception in the rule.
31. **`.btn-ghost` is a stale name.** It draws the text action but every
    caller still says "ghost", and the `--field-border` comment in
    `BaseLayout.scss:101–106` and `CookieBanner.scss:64–68` still describe
    the outlined box it used to be. Rename the callers to `.action` and
    fix the comments.
32. ~~The cookie buttons track a Bebas label.~~ Done: the `letter-spacing` line is gone.
33. ~~One arrow glyph left.~~ Done: the press-kit back link reads "Back to In the news".
34. ~~Dead reduced-motion selectors.~~ Done: `Desk.scss` lists only the live selectors.
35. ~~JetBrains Mono 700 is loaded with no caller.~~ Done: the Fonts API entry loads 400 and 500.
36. **The header stamp is unrecorded elsewhere.** `.header-stamp` ("Prague
    · 30 Oct 2026", a `note` with a red middle dot, fading in on scroll,
    `Menu.scss:127–152`) is the one piece of chrome that fades on its own
    trigger; decide whether it is case dressing worth keeping now the hero
    stamp is gone.
