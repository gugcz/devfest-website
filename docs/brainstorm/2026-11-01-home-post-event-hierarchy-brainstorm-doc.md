---
date: 2026-11-01
topic: home-post-event-hierarchy
---

# Home page hierarchy after the event

## What We're Building

The 2026 edition is over and the ticket sale is off, so `/` lost its one red
action and every section head shouts at the same size. This pass gives the
post-event home page a lead and a single action, inside "noir, but loud":
the hero gets one red button, three sections keep the poster head and the
utility ones step down, the sections are re-ranked for someone who arrives
after the day, and the newsletter form reads in the order it is filled.

Refinement, not redesign: fonts, the hero photograph, red, the topics under
the statement, the darkroom prints and all copy stay. No new section, no
hero explainer, no decorative rules.

## Why This Approach

Three orders were weighed: recap first, people first (speakers under the
hero) and newsletter up (a short jump from the hero CTA). Recap first was
chosen: the hero says "That was…", so the print of the day answers it, then
the people and the photographs; partners, the app and the newsletter are
what a visitor uses, not what they came to see. The hero CTA still reaches
the newsletter by an anchor, so its distance does not matter.

Head sizes reuse the existing ramp (`--fs-section` for poster heads,
`--fs-h2` for the rest) instead of adding a token.

## Key Decisions

- **Hero action:** one red `.btn-primary` "Stay in the loop" to
  `#newsletter`, neutral: it names no year and promises no edition, shown only when the ticket CTA is not (the slot
  `ticketsHref` uses today) and only while the `newsletter` flag is on. It
  is the page's one red fill; the newsletter submit stays black on paper.
- **Section order:** hero, The eleventh DevFest.cz, Speakers, Past
  editions, Partners, Get the app, Newsletter. The tickets slot stays right after the
  event, so with the `tickets` flag on the event still comes before the
  prices (flags untouched).
- **Two head steps:** poster `--fs-section` for The eleventh DevFest.cz,
  Speakers and Past editions; `--fs-h2` for Partners, Get the app and
  Newsletter. Home only; other pages keep their heads.
- **Note proximity (assumption, narrowest reading):** on `/`, a section
  note sits under its title, not in the right column 900px away. The
  global `.head-rule` and the other pages keep the shared right column.
- **320px statement:** the hero size floor drops far enough that
  "CONFERENCE." fits on one line at 320px; nothing changes from 375px up.
  Exact value is measured in the build.
- **Newsletter form:** the consent checkbox moves before the submit, the
  submit is always enabled, and the existing "Please confirm the consent
  checkbox" message shows when it is not ticked. The `disabled` style and
  its design.md entry go.
- **Copy:** no string edits at `index.astro:186`, `:209`, `:301` or
  `SpeakersTeaser.tsx:46` (another branch rewrites them). Moving those
  blocks is unavoidable for the re-rank; the plan keeps each moved block
  byte-identical so a merge resolves cleanly.

## Open Questions

- Does the re-rank collide with the copy branch? Moving the app section
  shifts the line numbers it targets; whichever lands second rebases.
