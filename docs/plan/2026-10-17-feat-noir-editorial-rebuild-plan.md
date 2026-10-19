# Plan: noir editorial rebuild (direction C)

Date: 2026-10-17 · Branch: `Design-refresh` · PR: #464

## Why

Three parallel reviews of the PR 464 preview (reference research, an
art-direction critique, a brand-manual audit) agree: the site reads as a
template. Black + one red accent + hairlines is itself a recognisable default
now; the difference has to come from grid, type hierarchy, metadata
discipline and content specificity. Concrete tells on the preview: two heroes
in a row on `/`, eight sections with one grammar, red spent as a background
six times, the detective plate on four routes, pun titles on every section,
cards where lists belong (agenda, speakers), a ragged logo wall.

## Direction

Hybrid of "film poster" restraint and the brand manual's case-file marks.

- **Skeleton (restraint).** Lists, not cards. One photo per page. Red is a
  verb: one word, one button, one state per page; no red-toned bands, no red
  closers. Section titles say what the section is; one pun per page at most.
  Prose on a measure (≤ 60ch), ledes ≤ 45ch. Spacing by content, not by one
  `--section-y` template.
- **Marks (manual-native).** Numbered eyebrow `01 — THE EVENT` (index in red,
  label muted) on every section head. Folio line in the footer
  (`CASE NO. DF-2026`). One rubber stamp for a ticket state (sold out).
  Special Elite only as narration under a headline.
- **Kept decisions.** Detective plate and the topic rotor stay on the home
  hero (maintainer's call, 2026-10-03); no hero explainer sentence; no
  decorative hairlines; three faces; brand-manual colours.

## Phases

1. **Foundations** — `.eyebrow-index` primitive, `.stamp` primitive, footer
   folio, `.band--accent` and `--red-toned` retired (closers and the
   newsletter go black), hero no longer forced to 100svh on desktop.
2. **Home** — the facts split (second hero) becomes a numbered lore + facts
   block and the mill photo moves to the venue/agenda hero; ticket ledger
   opens straight under its eyebrow with a sold-out stamp; speakers teaser
   as big names, no roles, portrait bleeding to the edge; one partner wall
   on equal cap height with the tier as a margin label; gallery as one
   full-bleed frame with a mono caption; newsletter as one line on black.
3. **Subpages** — one plate per route (`/venue`, `/agenda` on the mill;
   `/partners` on the crowd; `/speakers` on a stage still); `/speakers` as
   name rows with the portrait on hover; agenda cells without panel fills;
   FAQ hierarchy (category up, questions one step down, open answer with no
   panel); venue map links as text; all closers black.
4. **Copy and record** — section titles literal; `docs/design.md` and
   `.impeccable/design.json` updated; critique pass; verify green; push.

## Out of scope

Workshops, invoice, invite, press and attending pages beyond what the shared
primitives change. Light partner logo assets (need the partners).
