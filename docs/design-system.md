# Design system

The visual language of devfest.cz: the type roles, the primitives in
`BaseLayout.scss`, and the rules a change must not break. Architecture and
backend conventions live in [CLAUDE.md](../CLAUDE.md).

- Global CSS variables (colors, type ramp, rhythm) live in `BaseLayout.scss`; React components use co-located `.module.scss` files.
- Dark noir palette: `#050505` ground, `#F2EFE9` ink, `#CC0000` / `#FF1111` accent, film-grain + vignette overlays on `body`.

**Type roles — do not mix them up.** Three faces, each with one job:

| Face | Role |
| ---- | ---- |
| **Bebas Neue** | Every headline at `--fs-h3` and above: hero statement, section titles, nav destinations, figures, prices, the footer wordmark. It is condensed, which is why the poster scale works — a three-word statement fits the column at 8rem. |
| **Special Elite** | Body, lede and long-form reading copy (session abstracts, coverage summaries, legal prose). The brand's typewriter voice, kept as texture in the prose, never as a headline (it is wide; it wrapped a three-word title over three lines at `--fs-h2`). |
| **JetBrains Mono** | Labels, eyebrows, meta, counts, buttons, status words. |

**Rules a change must not break.** Each one is a pattern that makes the site
read as generated; re-introducing any of them undoes the pass:

- **No decorated eyebrow.** `.eyebrow` is a plain mono label — no trailing gradient hairline, no flanking rule pair. A decoration repeated on every section of every page is the loudest "template" signal there is.
- **Red text is flat.** `--glow-red` is for things that respond to a pointer (`.btn-primary:hover`) and for live status. Never a text-shadow on an accent word.
- **One lede shape.** Ledes are Special Elite, short, no italic, no red left border.
- **One display element per page** at `--fs-display` (the subpage `<h1>`). Sections run at `--fs-h2`.
- **Section heads are left-set.** A centred eyebrow-over-title-over-lede stack makes six different sections read as the same section.
- **Accent bars down the left edge of a block are banned.**
- Poster type is set through `--lh-display` / `--track-display`, never with a per-file line-height, and carries no `text-shadow`.

Primitives in `BaseLayout.scss`: `.u-container`, `.u-prose`, `.eyebrow`,
`.display` (+ `.red`, `.hollow`), `.facts` / `.fact-figure` / `.fact-label`,
`.band` (+ `--accent`, `--lit`, `--lit-red`) with `.band-inner`,
`.closer` / `.closer-title` / `.closer-note` / `.closer-actions`,
`.btn-primary` / `.btn-ghost`, and the `.field` / `.field-row` family.
`.anchor-target` (`#tickets`, `#newsletter`) cancels a section's own opening air
with a negative `scroll-margin-top` reading `--section-air`, the variable the
section's padding is built from — `scroll-padding-top` can't do it, the air is
inside the target. `--header-h` is the single source for the bar height:
`Menu.scss` and `html { scroll-padding-top }` both read it.
The CSS only decides WHERE a jump lands; `src/lib/anchor.ts` (wired from
`BaseLayout.astro`'s `astro:page-load`) keeps it landed while the islands
resolve and grow the page above the target — without it a deep-linked
`/#newsletter` ends up ~1000px past the heading. Two things there are not
tidy-uppable: the click handler must NOT check `event.defaultPrevented`
(ClientRouter cancels same-page hash links to scroll them itself), and the hold
must be armed BEFORE the landing, because Chromium and WebKit defer the initial
fragment scroll and then animate it through `scroll-behavior: smooth`.
`npm run anchors` measures every landing in Chromium, WebKit and Firefox.

**Open-field rows — every list on the site is the same open field.** A list of
entries is never a stack of cards, and never a ruled ledger: an opening rule
plus a hairline under every row is a TABLE, and one device stamped on six pages
makes them read as one generated component. There are no rules in a list.
Separation is air and type scale; the reach state is what marks an entry.

**The primitive is `.field` / `.field-row` in `BaseLayout.scss`, used by class
name from both `.astro` pages and `.tsx` islands.** Never keep a per-file copy
of the rhythm, the reach states, the `isolation`, the feather mask or the focus
ring — six files did, and the copies had drifted. A caller owns only its own
grid and type:

```
<ul class="field …">                            (the list)
  <li class="field-row field-row--link …">       (the row IS the control)
  <li class="field-row field-row--short field-row--holds …">   (…CONTAINS one)
```

`--field-step` on a row overrides the padding rhythm where a row is title-only
(the agenda's unscheduled list). The spec the primitive implements:

| | value |
| --- | --- |
| opening | **none.** No `border-top`, no `box-shadow` pair. The section head above the list (and its own hairline, if it has one) is the list's top edge |
| row rule | **none.** No `border-bottom`, no `border-top`, on any row |
| lamp | **none — the list carries no light of its own.** `--lamp` on a `::before` inset `-2rem / -gutter` is a full-bleed RECTANGLE inside the section, and the token's warm raking layer lifts `#050505` to about `#0E0C0B` at its top-left, so it drew a hard horizontal step across the whole page 32px above the first rule and another below the last. `--lamp` belongs to the ROOM: the section's `--lit` pool is the light. |
| row padding | fluid, `clamp(…) 0` — no horizontal padding at any breakpoint, including mobile. This is what gives the reach field a band to fill, so it is the rhythm too: `clamp(2.25rem, 3.6vw, 3.25rem)` short list, `clamp(1.9rem, 2.8vw, 2.5rem)` long |
| title | Bebas, uppercase. `--fs-row` (**72px**) for a short list (three ticket waves, three contact desks, two press desks), `--fs-row-sm` (**54px**) for a long one (sessions, FAQ, press clippings, agenda). `--fs-row-figure` for the figure opposite a title |

**The reach state depends on whether the row IS the control.** Two states, and
the difference is not decorative — a red band under something you cannot click
promises a click:

| the row | reach |
| --- | --- |
| **IS** the control — sessions, FAQ questions, press clippings, agenda entries (the whole entry is a `<button>` / `<a>` / `<summary>`) | `::before` inset `0 calc(-1 * var(--gutter))`, `background: var(--color-accent)`, `opacity` 0 → 1 over 0.28s. Every ink in the row goes **full cream `#F7EFE6`**. **No `translateX`** — dragging a band that runs to the viewport edge reads as a rendering fault |
| **CONTAINS** a control — ticket waves (Buy CTA), contact desks and the press desk (addresses) | the warm `104deg` wash at `opacity` 0 → 1, plus `translateX(0.6rem)` |

**Any full-bleed `::before` on a row must be feathered.** With no rules to close
it, an un-masked `inset: 0 calc(-1 * var(--gutter))` box shows its own top and
bottom edges as hard horizontal steps across the page — the same fault the
per-list `--lamp` box had. Warm washes and permanent lit grounds (the on-sale
wave) carry
`mask-image: linear-gradient(180deg, transparent 0%, #000 16%, #000 84%, transparent 100%)`.
The red reach field is the exception: it is meant to read as a band with edges.

**Rows need `isolation: isolate`.** The field/wash sits at `z-index: -1`, which
without a stacking context on the row itself paints behind the *section's*
background and disappears. `.field-row` sets it; a row that adds a SECOND
full-bleed layer of its own (the on-sale ticket wave's lit ground, the open
FAQ item's wash) must use `::after`, or a lower `z-index`, because
`.field-row--link` / `--holds` already own `::before`.

**HOVER paints the field; FOCUS draws a ring instead.** Focus legitimately
persists — closing a session sheet with Esc returns focus to the row that opened
it, which is correct for keyboard and AT users. While focus also painted the
field, that left a full-bleed red band with a cream rectangle round it sitting on
the page after the sheet was gone, indistinguishable from a stuck highlight. The
ring is `outline: 2px solid var(--color-accent-hot)` at offset `2px` (4.96:1 on
`#050505`, clear of the 3:1 in 1.4.11); a row that is both hovered and focused
inverts it to `#F7EFE6`, because red on red is not a ring.

**Detail views are SHEETS, not dialog boxes.** `SessionDetail` and
`SpeakerDetail` were 640px panels with a red keyline and glow, bordered chips for
the tags, hairline dividers between every block and a boxed close button — the
enclosed-card language the redesign removed everywhere else, still running in the
one place a visitor reaches by clicking. They also set their title at `--fs-h3`,
smaller than the 54px row that opened them. A sheet is full-bleed on the section
ground, poster title at `--fs-h2`, no border anywhere, a mono `Close ✕` in a
sticky top bar, and its lists are `.field` rows like everything else.

Both are **portalled to `document.body`** (`createPortal`). They render from
inside an island in `<main>`, and any positioned ancestor with a z-index traps
them in that stacking context — on `/speakers` the fixed site header (z-index
10001) drew straight over the sheet's own 10060 and hid its Close.

**Red is spent once per list, not once per row.** A track kicker on every
session, a `+` marker on every FAQ question and a red outlet label on every
press clipping were each the accent repeated thirty times, which makes it
texture. The resting state of a per-row label is muted mono
(`rgba(240, 237, 230, 0.55)`). Now that reaching a row paints it red, this rule
is stricter, not looser: a resting red label competes with the one state the
colour is for. The single exception is a persistent mark on the ONE row that is
genuinely different — the on-sale ticket wave, which carries a lit ground (not
red text) because it is the only buyable one.

**An OPEN `<details>` does not hold the red field.** FAQ items are independent,
several can be open at once, and four permanent red bands down one page is the
accent as texture again. An open question is marked by the feathered warm wash
and its turned marker; red stays under the pointer.

**Bands — red is a FIELD, not only an accent.** One uninterrupted `#050505`
from the top of a page to the bottom marks no section boundaries and reads as
one block. A section that wants its own ground gets `.band` plus a modifier:

| | ground | use |
| --- | --- | --- |
| `.band` | `--color-bg` | the default |
| `.band--raised` | `#0B0A0A` + hairlines | a section lifted one step out of the dark |
| `.band--accent` | `--color-accent` | **at most one per page**, for the page's next step |

**Ink on `#CC0000` is measured, and alpha is not free** — hierarchy on the
accent field comes from SIZE, never from dimming:

| ink | ratio | verdict |
| --- | --- | --- |
| cream `#F7EFE6` | 5.17:1 | anything, including body copy |
| cream at 85% | 3.95:1 | control boundaries only (1.4.11) |
| cream at 80% | 3.58:1 | fails body copy |
| near-black `#1A0000` | 3.42:1 | large text only — the accent word |
| black `#000000` | 3.57:1 | large text only |

So every label, paragraph and link on a red band is **full cream**, the accent
word inside a `.display` is `#1A0000`, and any form control on that ground
inverts (cream fill, dark ink — a red button on red is invisible). Translucent
field fills are banned there too: a contrast checker resolves the placeholder
against the band behind an `rgba()` fill, so `NewsletterForm.module.scss` uses
an opaque `#9A0000`.

**Shared components, not shared class names.** Anything that appears on more
than one page is a component or a global primitive — never a copied block. The
copies always drift: two pages once kept their own desk markup and by the time
they were merged the address size, the label colour and the column split had all
diverged.

| | |
| --- | --- |
| `Desk.astro` | one inbox: label, name, blurb, addresses on the right axis (or one `action` link). Rendered by `/contact`. Takes `.field-row--holds` — a desk CONTAINS its controls |
| `.field` / `.field-row` | the open-field list and row, above |
| `.head-split` / `.head-title` / `.head-note` | the two-column section head — statement left, one line right. Used by the ticket section, the speakers teaser, the gallery and the `/contact` desks. `--ruled` closes it with a hairline. Compose the title with `.display` |
| `.head-stack` | the ONE-column section head, closed by a hairline. Compose it from `.eyebrow` / `.display` / `.head-title` rather than a per-page heading trio |
| `.page-stack` | every page's `<main>` — the two-line flex column, declared once |
| `.band--lit` / `.band--lit-red` | the subpage ground: the spotlight pool over page black, closed by a hairline at the top. `--lit-red` adds the faint red bleed from the top-right and belongs to the pages about PEOPLE and the programme (`/speakers`, `/sessions`, `/agenda`, `/team`); the administrative pages take the plain pool |
| `.print` | the mounted photograph well at 4:5 — bone keyline, shadow, `--panel-lit` ground. Used by the speaker sheet's plate and the `/team` mugshot |
| `Sheet.module.scss` | the detail-view chrome: ground, entry, sticky bar, close, content measure, kicker, title, block label. `SessionDetail` and `SpeakerDetail` import it alongside their own module and keep only what a session / a speaker actually has |
| `.fallback-note` | the no-JS / endpoint-down prose on a data-backed page |
| `DataState.tsx` | the three non-ready states of a data-backed island — `LoadingState` / `ErrorState` / `EmptyState`. Left-set (matching `.fallback-note`), `role="status"` on loading and `role="alert"` on failure, and an **empty state always offers somewhere to go** |
| `SpeakerPhoto.tsx` | a speaker's photograph, or their initials. Owns ONE decision — no URL, or a URL that fails to load, both land on the monogram — while the caller passes its own classes for the shape |
| `SubpageHero.astro`, `Ticker.astro`, `Closer.astro` | already components; see below |

**Tokens exist so a measured value is decided once.** Never re-pick a value a
token already holds: `--print-mount` (the keyline + shadow under a photograph),
`--ink-monogram` / `--ink-monogram-sm` (the initials shown when a photograph is
missing — every hand-picked copy of that alpha measured under the 3:1 it needed)
and the focus-gap scale. The focus gap is chosen by ONE question: how much
visible edge the control already has (`tight` it has its own boundary, base is
type on the ground, `lg` it stands alone). Two deliberate exceptions carry a
comment saying why — the agenda cell's inset ring and the partner logo's wider
gap.

**`Closer.astro` — every page ends on a statement.** Eyebrow, one `--fs-h2`
line, a note and one or two actions, on `tone="accent" | "raised" | "plain"`. A
subpage that stops at its last list row and hands straight to the footer reads
as unfinished. `/privacy-policy` is the deliberate exception — a legal document
does not get a CTA.

**One photograph, one crop per page.** `HeroBackground` takes a `focus`
(`background-position`), passed through by `SubpageHero`. Subpages running the
identical crop of `/hero-detective.webp` read as one template with the words
swapped, so every page that uses the plate frames a different part of it.
`SubpageHero` also takes `photo={false}` — contact, FAQ, invoice and
press/downloads open on type alone, so the scroll has two kinds of opening.

**The running band (`Ticker`) runs under EVERY hero.** One shared line of the
conference's topics (`EVENT_TOPICS`, `src/lib/ticker.ts`) sits between the hero
and the body on the homepage and on every subpage; `/partners` is the one
exception and keeps its own partnering-specific list. The strip is what carries
the break between hero and content, so the subpage silhouettes are deliberately
alike — variation comes from the hero crops and the body layouts, not from the
page skeleton.

**Subpage bodies sit on `--color-bg`, the same ground `/partners` uses.** Do not
reintroduce a tonal step between a subpage hero and its body — the running band
marks that boundary.

The header (`Menu.astro`) is a three-slot bar — mark, event stamp, actions —
with every destination behind one toggle at **every** width, opening a
full-screen panel. There is no horizontal nav breakpoint.

**The bar is transparent at the top of the page and solid once scrolled.** Two
crossfading pseudo-elements do it: `::before` is the solid `#050505` panel,
`::after` a top-down scrim, swapped on `[data-state='top']`. The event stamp
follows the same state — hidden at the top (the hero already says where and
when), revealed on scroll, via `visibility` so the centre grid slot never
reflows. Scrolled the bar MUST stay opaque: it sits over page content, and a
transparent zone leaks during an iOS Safari URL-bar transition.

**The brand mark follows that state on the home page, at EVERY width.** At the
top of `/` the hero wordmark owns the identity, so the bar's mark is hidden
(`visibility`, so the grid slot holds and nothing jumps); scrolling hands it to
the bar. Never exempt phones from this: a width-dependent top state differs
between a phone and a desktop for no reason a visitor can see. Subpages carry
`data-home="false"`, so their mark is never hidden.

**The partner wall is one grid module.** `.logo-grid` is
`repeat(auto-fill, minmax(min(100%, --cell-min), 1fr))` at one size for every
partner; the tier is carried by its heading and by the order of the sections,
which is what a ladder is for. A tier that does not fill its last row leaves
the rest of the row empty — the rules belong to the CELLS, so nothing hangs a
hairline over dead space.

Equal cells do not make equal-looking logos, so `opticalBox()` in
`partners.astro` gives each mark a box of equal ink **area** shaped to its own
aspect ratio (a 5:1 wordmark ≈190×38, a square glyph ≈76×76) and passes it as
`--logo-w` / `--logo-h`; the raster `sizes` follows that box. Capping width
renders a glyph as a block beside a wordmark; capping height renders the
wordmark as a hairline of type. `plated` stays a per-partner flag (the file
ships with its own background baked in) and gets a larger box — it is **not** a
tier-level inversion, which would move the legibility risk onto the tier that
pays. The media/community rows keep the cream ground: those marks ship dark.

**Forms say which field is wrong, in the field.** `InvoiceForm.tsx` is the
pattern: one `validate()` holding every rule, errors shown on blur or on the
first submit attempt and cleared as they are fixed, `aria-invalid` on the
control, `aria-describedby` pointing at a mono `--color-accent-hot` message
under it (colour is never the only channel), and a failed submit focusing the
first field that needs fixing. **A submit button is never `disabled` for a
missing input** — that takes it out of the tab order and explains nothing;
it stays reachable and answers on activation. `aria-disabled` covers only the
in-flight state, so the button's states key off `[aria-disabled='true']`, not
`:disabled`.

**A component declared in a render body remounts its subtree every render.**
`TextField` lives at module scope in `InvoiceForm.tsx` — inside the component,
every keystroke would unmount the input and the caret would leave the field.

**`/thank-you`, `/newsletter-subscription-thank-you` and `/404` share one
system.** All three run `SubpageHero photo={false}` → `Ticker` → a
`.band--lit` field of `NextStep` rows → `Closer`, and their titles take the
site's em-dash separator like every other page. `/thank-you` carries the four
things that belong on it and nowhere else (calendar, venue, what happens next,
share) and ships an `@media print` block: it is the page someone prints as
proof of purchase, and the site's cream ink on `#050505` prints as invisible
text. Event facts for the calendar links live in `src/lib/event.ts`, alongside
the `.ics` in `public/` — keep them in step with the Event JSON-LD in
`BaseLayout.astro`.

**A `<details>` list opens with its first item open.** One open item, not
more — four open answers is the page's whole content unfolded. A section must
also not reuse the hero's `aria-labelledby`: two regions with one accessible
name is `landmark-unique`, the site's only axe violation.

**The skip link's target carries `tabindex="-1"`.** `#main-content` is a
`div`, and without it `Enter` on the skip link moves the document fragment but
leaves focus in the header — the next `Tab` lands back in the nav and the only
keyboard-only affordance on the site does nothing. The ring is suppressed on
that element alone (a 100vw outline reads as a rendering fault, and it is a
page region, not a control); every control inside keeps its own.

**The cookie banner is second in the DOM, right after the skip link,** and its
`Escape` handler is on `document` so the key works from any focus position,
not only once focus is already inside the banner. Its two choices are
peer-weighted: `Accept` keeps the accent fill (it is how the bar is
findable), every other dimension — type, tracking, padding, height, minimum
footprint — is shared, so the shorter word is not the smaller target.
