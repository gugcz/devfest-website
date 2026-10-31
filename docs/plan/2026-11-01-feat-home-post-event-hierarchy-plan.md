---
title: "feat(home): one red action and a lead section on the post-event home page"
type: feat
date: 2026-11-01
brainstorm: docs/brainstorm/2026-11-01-home-post-event-hierarchy-brainstorm-doc.md
---

## feat(home): one red action and a lead section on the post-event home page - Standard

**Status:** Done

## Overview

With the sale off, `/` has no primary action and six section heads at one
poster size. This plan gives the hero one red button to the newsletter,
keeps poster scale for three lead sections, steps the utility heads down,
re-ranks the sections for a visitor who arrives after the day, fixes the
320px statement and makes the newsletter form read in fill order.

Refinement inside "noir, but loud" (`docs/design.md`). Home page only.

## Problem Statement / Motivation

Six findings from the 2026-11-01 design review, all on `/` with `tickets`
off:

1. The hero ends on the facts line; ~170px of empty black on a phone, no
   action (`index.astro:116-128`, `index.scss:107`).
2. At 320px the full stop of "CONFERENCE." wraps onto the next line: the
   word is wider than the line at the `--fs-hero` floor (4.5rem,
   `BaseLayout.scss:62`) and the global `overflow-wrap: break-word`
   (`BaseLayout.scss:253`) breaks it.
3. Every H2 uses `--fs-section` (128px desktop, 64px phone, against a 72px
   phone H1); nothing leads.
4. "Get the app" is the second section, above speakers and the gallery.
5. A `.head-rule` note sits in the right column, ~900px from its title at
   1440.
6. The newsletter submit is `disabled` until consent and sits before the
   checkbox (`NewsletterForm.tsx:63-68` vs `:78-85`); the consent message
   at `:23` can never show.

## Proposed Solution

### 1. Hero action (`src/pages/index.astro`)

- Where the ticket CTA renders, render
  `<a href="#newsletter" class="btn-primary hero-cta">Stay in the loop</a>`
  when `!ticketsHref && enabled('newsletter')` (`href` before `class`, as
  the criteria grep). The label is neutral: no year, no promise of an
  edition. The
  ticket CTA keeps its condition, so at most one of the two renders.
- Reuse `.hero-cta` as is. It is the page's one red fill; the newsletter
  submit stays black on paper.

### 2. 320px statement (`src/layouts/BaseLayout.scss:62`)

- Set the `--fs-hero` floor to the largest value at which "CONFERENCE."
  fits the 320px column on one line in Chromium. The vw term and the cap
  stay.
- It must stay above the `--fs-section` floor (4rem) so the hero outranks
  every head at every width. If it cannot, stop and report.

### 3. Two head steps (`src/pages/index.scss`)

- Poster `--fs-section` (unchanged): The eleventh DevFest.cz, Speakers,
  Past editions.
- `--fs-h2`: `#partners-title, #home-app-title, .newsletter-title` in
  `index.scss` (all three live in `index.astro`, so scoped styles reach
  them). No markup change, no new token, the global `.head-rule` untouched.

### 4. Section order (`src/pages/index.astro`)

Hero → The eleventh DevFest.cz → (tickets slot, unchanged, renders only
with the sale on) → Speakers → Past editions → Partners → Get the app →
Newsletter.

- Only the app block moves (from after the event to before the
  newsletter). The tickets slot keeps its place after the event, so a
  build with the `tickets` flag on still shows the event before the prices.
- The app block is cut and pasted byte-identical; the strings the copy
  branch edits (`:186`, `:209`, `:301`, `SpeakersTeaser.tsx:46`) are not
  touched.
- Update the frontmatter comment that lists the page order.

### 5. Note under its title, home only (`src/pages/index.scss`)

- On `/`, every section head is one column at every width, so the note (or
  Partners' actions) sits under its title:
  `.page-stack :global(.head-rule:not(:has(#tickets-heading)))` →
  `grid-template-columns: minmax(0, 1fr)`. `:global` because the Speakers
  head renders inside a React island; the Tickets head is excluded so its
  invoice route stays beside it while the `tickets` flag is on.
- The note keeps its size, colour and `34ch` measure; the existing grid
  `gap` (1rem) separates it from the title.

### 6. Newsletter form (`src/components/NewsletterForm.tsx`, `NewsletterForm.module.scss`)

- Move the consent `<label>` inside the `<form>`, between the email field
  and the submit: DOM and tab order run email → consent → submit.
- Drop `disabled={!consented}` and the button's
  `aria-describedby="newsletter-consent-text"` (the label now sits right
  before it).
- **Guard before hydration:** render the form without `noValidate`; set it
  once the island has hydrated (state flipped in the existing
  `useEffect`). Until then the browser's own `required` on the email and
  the checkbox (now inside the form) blocks a submit without consent. The
  island loads `client:visible`, so this window is real.
- `handleSubmit` checks in fill order: email first, then consent, and
  focuses the first bad field (design.md, Forms & errors). The checkbox
  gets `aria-invalid` while the consent error shows. The message is
  announced by the existing `role="status"` region only; it clears when the
  email or the checkbox changes.
- The drawn checkbox shows focus on `:focus` (not only `:focus-visible`),
  so a scripted focus after a mouse submit is visible.
- `.form` becomes a column at every width: field, consent, button (left,
  natural width; full width ≤500px as today). Delete the dead `:disabled`
  style.

### 7. Anchor measure (`scripts/anchor-measure.mjs:60`)

- The `#newsletter` target clicks
  `.hero-cta[href="#newsletter"], #tickets a[href="#newsletter"]`, so the
  check runs with tickets off.

### 8. Docs (same PR)

- `docs/design.md` through `/impeccable document`, checking these spots:
  red fills (`:403-410`, `:906-913`, `:927`: with tickets off the screen's
  red is the newsletter action); the ramp table (`:581`, `:583`) and the
  poster-scale rule (`:648`): Partners, Get the app and Newsletter on
  `--fs-h2` on `/`; the `--fs-hero` floor (`:580`); breakpoints and forms
  (`:714`, `:1026-1027`): the form is a column at every width; `.head-rule`
  (`:1231`): one column on `/` except Tickets; Component states: remove
  the newsletter `disabled` entry; home anatomy (`:1771-1800`): order, the
  hero action.
- `docs/product.md` (`:82-92`): section order, the heads no longer all
  poster scale, the hero action.
- `docs/adapting.md:74`: the `newsletter` flag also removes the hero
  action.

## Technical Considerations

- **Flags:** `newsletter` off → no hero action; `tickets` on → "Get
  tickets" wins. No flag value changes. `npm run flags-off` must stay
  green (`#newsletter` renders only with its section).
- **Late Speakers island:** `SpeakersTeaser` renders nothing until the
  lineup loads and sits between the hero and `#newsletter`, as it already
  did for the footer's newsletter links. The landing hold in
  `src/lib/anchor.ts` covers it; checked on WebKit below, fixed only if it
  fails.

## Success Criteria

```success-criteria
GOAL: With tickets off, `/` has one red hero action to the newsletter, three poster-scale lead sections in the order event, speakers, gallery, utility heads a step down with notes under their titles, a one-line "CONFERENCE." at 320px, and a newsletter form that reads email, consent, submit and cannot post without consent.

SUCCESS CRITERIA:
- The full gate is green | verify: npm run verify
- The hero renders the red action to #newsletter and no ticket CTA | verify: npm run build && grep -q 'href="#newsletter" class="btn-primary hero-cta"' dist/index.html && ! grep -q 'href="#tickets" class="btn-primary hero-cta"' dist/index.html
- The section heads come in the planned order | verify: node -e "const h=require('fs').readFileSync('dist/index.html','utf8');const ids=['facts-title','gallery-title','partners-title','home-app-title','newsletter-title'].map(i=>h.indexOf('id=\"'+i+'\"'));const t=h.indexOf('SpeakersTeaser');process.exit(ids.every((v,i)=>v>0&&(i===0||v>ids[i-1]))&&t>ids[0]&&t<ids[1]?0:1)"
- The hero link lands on the Newsletter head in every engine | verify: npm run anchors
- No flag changed and the Speakers copy line is untouched | verify: git diff --quiet $(git merge-base origin/2026 HEAD) -- src/site.config.ts src/components/SpeakersTeaser.tsx
- "CONFERENCE." stays on one line at 320px and the hero still outranks the poster heads | verify: manual 1. npm run build && npm run preview. 2. Open / at 320×640 in Chromium. 3. The statement's lines end in "CONFERENCE." with no stray full stop. 4. The h1 computed font-size is larger than the "The eleventh DevFest.cz" h2's.
- Hierarchy reads as planned at 1440 and 390 | verify: manual 1. Open / at 1440×900 and 390×844. 2. "Stay in the loop" is the only red fill under the header and jumps to the Newsletter head. 3. The eleventh DevFest.cz, Speakers and Past editions heads are visibly larger than Partners, Get the app and Newsletter. 4. Every section note and the Partners actions sit directly under their title.
- The form cannot post without consent and reports in fill order | verify: manual 1. Throttle to Slow 3G, open /#newsletter, type an email and press Enter before the island hydrates: the browser blocks the submit on the checkbox. 2. After load, click "Notify me" with an empty email and no tick: focus lands on the email. 3. Fix the email, click again: "Please confirm the consent checkbox to continue." shows, focus is visibly on the checkbox. 4. Tick it: the message clears; submit posts as before.
- The jump survives a late lineup on WebKit | verify: manual 1. ENGINE=webkit API_DELAY_MS=5000 npm run anchors passes.
- The strings the copy branch owns are unchanged | verify: manual 1. git diff $(git merge-base origin/2026 HEAD) -- src/pages/index.astro shows the app note, the "editions since" note and the newsletter lede only as moved or unchanged lines, never edited.
- Impeccable finds nothing new on / | verify: manual 1. /impeccable audit / and triage the design hook output; no new finding stays open.

NON-GOALS:
- Any copy change (the copy branch owns it), including the strings at index.astro:186, :209, :301 and SpeakersTeaser.tsx:46.
- Feature-flag values, the global .head-rule, other pages' heads, new tokens.
- Fonts, the hero photograph, red, the topics list, a hero explainer, any decorative rule.
- New analytics events.

VERIFICATION COMMAND: npm run verify && npm run build && grep -q 'href="#newsletter" class="btn-primary hero-cta"' dist/index.html && ! grep -q 'href="#tickets" class="btn-primary hero-cta"' dist/index.html && npm run anchors && git diff --quiet $(git merge-base origin/2026 HEAD) -- src/site.config.ts src/components/SpeakersTeaser.tsx
```

## Dependencies & Risks

- **Copy branch:** moving the app block shifts the lines it edits; whichever
  PR lands second rebases (one hunk). Flagged in the PR.
- **`--fs-hero` floor:** if "CONFERENCE." needs ≤4rem at 320px, stop (§2).
- **Design rule change:** design.md says section heads stay poster scale;
  this records a home-only exception for the utility sections.

## References & Research

- `src/pages/index.astro:116-128` (hero CTA), `:181-192` (app), `:297-307` (newsletter)
- `src/pages/index.scss:55-62`, `:107-110`, `:393-399`
- `src/layouts/BaseLayout.scss:62`, `:69`, `:253`, `:326-357`
- `src/components/NewsletterForm.tsx:20-31`, `:46`, `:63-85`; `src/pages/index.astro:304` (`client:visible`)
- `scripts/anchor-measure.mjs:58-61`, `src/lib/anchor.ts`
- `src/lib/site-config.ts:33` (`edition`)
- `docs/design.md`: Color (red fills), Typography, Forms & errors (`:1011-1020`), Component states, Anatomy of a page (home)
