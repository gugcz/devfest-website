# Noir design polish

Date: 2026-10-16 · Type: feat · PR: #464

## Goal

Keep the identity (black, white, Evidence Red; Bebas Neue, Special Elite,
JetBrains Mono; the detective key art) and drop what made the site read as
generated: the same section formula on every page, glows, entrance fades, a
stat row, mono labels everywhere and a noir pun in every heading.

## Approach

1. **Research.** Audit the deployed site; collect current "AI tells" and
   reference conference and film sites. Constraints from the brand manual
   v1.0 and `docs/design.md`.
2. **Canvas first.** Compose Home, Speakers, Partners, FAQ and the footer in
   `design/devfest.pen`, then code from the frames.
3. **Subtract.** No glow, rake beam, entrance fades or page vignette; hover
   inverts the fill; photos develop B&W to colour on hover as the one
   decorative motion.
4. **Real material.** Mill and DevFest 2025 photographs replace generic
   atmosphere (graded B&W, never stock or generated).
5. **One look across pages.** Plain subpage titles; Closer only on purchase
   pages, one end line elsewhere; forms and legal pages on the standard
   shell and gutter; event hours and date format from `src/lib/event.ts`.
6. **Copy.** Noir wordplay only in a few earned places; no triads or
   em-dash chains.
7. **Gate.** Impeccable critique and a review pass over the deployed
   preview; fix the findings; `npm run verify`; record in `docs/design.md`,
   `.impeccable/design.json` and `docs/product.md`.

## Brand manual check

- Colours match the manual (#000000, #FFFFFF, #F11000; greys as opacity).
- Partner logos stay in their original colours (manual p. 15); dark-ink
  masters sit on a paper-white card.
- No shadow, glow or outline on the DevFest.cz logo (manual p. 7).
- Open question: full-width flat red bands (newsletter, Closer) versus the
  manual's approved large red areas (title bars, red-toned backgrounds,
  primary CTAs).

## Out of scope

- Light versions of the Dotěkománie and White Whale Media logos.
- Re-syncing the canvas `Mobile` frames, menu, agenda and step pages.
