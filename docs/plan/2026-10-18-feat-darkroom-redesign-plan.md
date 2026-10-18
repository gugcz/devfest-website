# Plan: the darkroom redesign, from the approved mocks to the site

Date: 2026-10-18. Branch: `Design-refresh` (PR #464).

## Why

The maintainer read the ruled-list redesign as "a table": every section was a
small head on a hairline over rows. After ten directions and five
combinations, the approved one is **darkroom**: photographs as paper prints on
a black table, labelled with tape, numbered like frames, marked with one red
grease-pencil stroke per section. Mocks (desktop 1440, tablet 1024, phone
390) for home, speakers, agenda, venue, FAQ, partners, team and contact live
on the design canvas the maintainer reviewed.

## Decisions

- **Paper is white at an opacity**, not a cream hex: the brand manual allows
  only black, white and red, with greys as white or black at an opacity. The
  mocks' warm paper becomes `--paper` (white 94%) and tape `--tape` (white 82%).
- **Section heads lose the rule.** `.head-rule` keeps its name (every page
  uses it) and becomes a poster-scale Bebas title with the note beside it, on
  space instead of a hairline.
- **Headings are literal** (Speakers, Past editions, Newsletter); no puns.
- **Desktop nav is inline** (primary links, then the organisers' tier dimmer,
  then the red Tickets); under 1100px the existing full-screen menu stays.
- **Subpages open on type**: a huge title, a factual lede, at most one print.

## Steps

1. Primitives in `BaseLayout.scss` (`--paper`, `--tape`, `.paper`,
   `.paper-photo`, `.paper-edge`, `.tape`, `.grease`) and the new `.head-rule`.
2. `SubpageHero` as the type-first subpage head with an optional print.
3. Menu (inline desktop links) and Footer (wordmark, four columns, folio).
4. Pages, in parallel, each on its own files:
   home (`index.astro`, newsletter); tickets (`Tickets.tsx`); speakers
   (`SpeakerTile`, `Speakers`, `SpeakersTeaser`); agenda (`Agenda.tsx`);
   venue + FAQ; partners + team + contact/press.
5. Verify every route at 1440 / 1024 / 390 against the mocks with live
   lineup data; `npm run verify` green.
6. Record the system in `docs/design.md` and `.impeccable/design.json`.
