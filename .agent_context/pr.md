## Summary

An unlisted personal invitation page for each of the eleven people in `src/content/team.json` — `/invite/<slug>`, built from the approved visual direction B ("The Plate"). DEVF-45.

## Why

The team's personal network is the strongest channel the conference has and it currently has no home: a member shares a generic `devfest.cz` link and the recipient gets marketing, not an invitation. Each page speaks in one member's voice and carries exactly one action.

## Behavior

- **Eleven routes**, slug = the `team.json` entry key, so the roster and the URLs can't drift apart.
- **Unlisted, three ways at once** — `noindex` (BaseLayout also drops the canonical + JSON-LD), excluded from the sitemap, and linked from nowhere on the site. Not access control: the URLs are guessable and nothing here is sensitive.
- **One primary action.** `InviteCta` resolves the ti.to href client-side from the cached `/api/tickets` endpoint (the live wave isn't known at build time) and reports `begin_checkout` with `invite_member` / `invite_member_name`. With no discount code in v1 that click is the only per-member attribution the channel has — checkout runs on ti.to and its redirect carries no source. Before the endpoint answers, and if it never does, the href is `/#tickets`.
- **Copy** is the agreed generic v1 in `src/lib/invite.ts`, with one closing line varying by role so the eleven pages aren't one page with a name swapped. When members write their own paragraphs, only `body` changes.
- **Mobile scrim held.** There is no side-by-side frame under 860px, so the wash over the read zone is what keeps the type off the face — a legibility condition, not a finish. The base plate is the LCP element (`fetchpriority="high"`); the colour layer is the enhancement (`low`).

## Files

- `src/pages/invite/[member].astro` — the route
- `src/lib/invite.ts` — generic v1 copy + the role lines
- `src/components/InviteCta.tsx` — the resolved, tracked CTA
- `src/components/Closer.astro` — optional `actions` slot so the closing repeat can be that island
- `astro.config.mjs` — sitemap exclusion
- `scripts/a11y.mjs` — one invite page added to the sweep

## Verification

- `npm run build` — 26 pages, all eleven invite pages emitted, none in `sitemap-0.xml`, `noindex` present, no canonical.
- `npm run a11y` — 16 pages pass WCAG 2.2 AA (axe-core + the custom control-contrast pass), including `/invite/eliska-cejpova/`.
- Checked in a browser at 1440 and 390: both CTAs resolve to the ti.to target after hydration, mobile scrim holds, the colour bleed runs once.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
