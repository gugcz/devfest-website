---
paths:
  - "src/pages/invite/**"
  - "src/pages/og/invite/**"
  - "src/lib/invite.ts"
  - "src/components/InviteCta.tsx"
  - "src/content/team.json"
---

# Invitation pages (`/invite/<member>`)

One unlisted page per `src/content/team.json` entry (slug = `id`).

- Unlisted = `noindex` + out of the sitemap + **linked from nowhere**. Not
  access control.
- Copy in `src/lib/invite.ts` (generic v1; `roleLine` varies by role).
- `InviteCta.tsx` is the only primary action: resolves the ti.to href from
  `/api/tickets`, reports `begin_checkout` with `invite_member` /
  `invite_member_name` (register as GA4 custom dimensions). Fallback href
  `/#tickets` fires no event.
- Visual direction B ("The Plate"): portrait right half, B&W → colour bleed is
  the only effect. Phone: top strip (~48svh) with eyebrow + headline; scrim is
  a legibility condition, don't lighten. Special Elite never sits over a photo
  and never runs past ~2 lines.
- `Closer.astro` takes an `actions` slot for the tracked island.
- Header's red `Tickets` action is dropped on `/invite/*` (`isInvite`).
