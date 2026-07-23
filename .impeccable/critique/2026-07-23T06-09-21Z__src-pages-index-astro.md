---
target: whole design + tickets
total_score: 24
max_score: 36
na_heuristics: 7
p0_count: 0
p1_count: 2
timestamp: 2026-07-23T06-09-21Z
slug: src-pages-index-astro
---
⚠️ DEGRADED: single-context (standing session instruction not to spawn sub-agents; treated as user decline)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Skeleton + status words are clear; a failed data load reads as a bare sentence |
| 2 | Match System / Real World | 2 | **Core issue.** The ledger is a *bureaucratic* metaphor. Ticket waves now read like a bank statement, not a festival pass |
| 3 | User Control and Freedom | 3 | Exits fine; ti.to hand-off is one-way but expected |
| 4 | Consistency and Standards | 3 | Highly consistent — but bought by flattening a real difference (tickets are objects, not list rows) |
| 5 | Error Prevention | 3 | Honeypot, validation, disabled states present |
| 6 | Recognition Rather Than Recall | 3 | Status words explicit; hollow numerals are decorative-only |
| 7 | Flexibility and Efficiency | n/a | Persuade surface |
| 8 | Aesthetic and Minimalist Design | 2 | Over-minimised. Austerity is doing the work presence should do |
| 9 | Error Recovery | 2 | Tickets error state is one sentence, no retry |
| 10 | Help and Documentation | 3 | FAQ is strong and well structured |
| **Total** | | **24/36** | **Acceptable (67%)** |

## Design Specificity Verdict

**LLM assessment.** The structure is authored; the surface is not. Nothing here is category-interchangeable in *layout* — the ruled ledger, exhibit numerals and lamp are specific. But the system now expresses one idea (the register) and dropped the other half of its own metaphor (the evidence). A case file contains both ruled paperwork *and* physical objects: photographs, stamped forms, tags, stubs. I kept the paperwork and threw away the objects. What is left reads accurate rather than atmospheric.

**Deterministic scan.** 11 findings, 10 advisory + 1 warning. Zero card / side-tab / pill / container-shadow findings — the structural work held. Remaining: 7 fluid-clamp endpoints off the ramp (Countdown, SessionDetail, SpeakerDetail, Speakers, downloads), 2 undocumented error-red values `rgba(220,110,110,0.95)`, 1 stray `4px` radius in Footer, 1 broken-image false positive (`press-kit.ts:16` is a type string, not markup).

## Overall Impression

The refactor solved a real problem and created a subtler one. The card grid genuinely was generic, and removing it was right. But I equated *"not a card"* with *"no object"*, and the noir lived in the object-ness. Grain, lamp and hollow numerals brought back the **lighting**; they did not bring back the **things being lit**.

Biggest opportunity: stop applying one container language to every content type. Ledger for lists. Objects for objects.

## What's Working

- **The ledger is right for lists.** FAQ, sessions and contact desks genuinely are registers, and they read better than the cards did — scannable, one axis, real hierarchy.
- **Hierarchy through light.** The lit entry beating the closed ones is a real improvement over three equal cards; the live ticket wave finally dominates.
- **The atmosphere layer.** Grain + vignette + single lamp is coherent and cheap, and the exhibit numeral is the strongest period device on the page.

## Priority Issues

**[P1] Tickets use the wrong container language entirely.**
- **Why it matters:** A ticket is a *physical object* — a stub, a pass. Rendering it as a table row strips the one thing that makes a ticket feel purchasable. This is the surface that carries the conversion goal, and it now has the least presence on the page. It is also self-inconsistent: DESIGN.md already sanctions the countdown stub because *"the bounded rectangle IS the depicted object."* A ticket is exactly that argument, and I missed it.
- **Fix:** Rebuild ticket waves as **horizontal ticket stubs** — wide and short, so the height win is kept. Perforation edge, punch notch, mono serial, price set large, red overprint band on the live wave.

**[P1] Object-ness stripped from photographs.**
- **Why it matters:** Speaker and team photos are evidence prints. They kept crop-brackets but lost their mounting, so they now float on flat black.
- **Fix:** Give the photo plate a mount again — not the old matte frame on a panel, but a thin lit edge under the image.

**[P2] The red case-file tab is gone sitewide.**
- **Why it matters:** I converted every category label to mono-on-a-rule for consistency. Folder tabs are the single most literal case-file device, and now nothing on the site is tabbed.
- **Fix:** Reinstate a tab form for *category* labels only (contact desks, press desks) — seated on the rule like a divider tab.

**[P2] Uniform rhythm flattened the scroll.**
- **Why it matters:** Every section is now left-set, same density, same reveal. A studio scroll varies.
- **Fix:** Vary density between sections; let one or two heads centre again.

**[P3] Ramp drift in fluid clamps.**
- **Fix:** 7 clamp endpoints bypass the ramp; map them onto steps.

## Persona Red Flags

**Jordan (First-Timer):** Lands on tickets and sees three rows of text with prices. Nothing signals "this is a thing you buy" except a red button on one row. The word "Ended" beside a price is ambiguous — ended, or ending?

**Casey (Distracted Mobile):** On mobile the ledger collapses to stacked labels; the ticket rows lose their right-hand axis and read as an undifferentiated list. The buy CTA is full-width (good) but arrives after two closed waves.

**Riley (Stress Tester):** Ticket/session/speaker sections render *nothing* when data is absent — the homepage silently loses three sections. The error state is a single sentence with no retry.

## Questions to Consider

- If a visitor screenshotted the tickets section, would they know it was a conference pass and not a pricing table?
- What is the most physical object in this world that we are not yet depicting?
- The countdown stub earned its border. Which other elements are objects we demoted to rows?
