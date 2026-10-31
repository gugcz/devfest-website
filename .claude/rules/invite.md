---
paths:
  - "src/routes/invite/**"
  - "src/routes/og/invite/**"
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
- Visual direction: the darkroom (`invite/member.scss`). The invitation on
  the black table, the member's portrait a 4:5 `.paper` print beside it
  (`1fr / 0.8fr`, max `30rem`, tilted `--tilt-2`), its one tape the
  member's name, its edge "30 / 10 / 26" and the doors time. ≤860px the
  print goes above the type at `min(20rem, 80%)`. Type never sits on the
  photograph: no strip, no scrim. The print's B&W → colour bleed (the
  colour layer fading in once the page loads) is the only effect; reduced
  motion drops the fade, not the colour. Special Elite never runs past ~2
  lines. Under it, the note beside the member's line on a paper slip.
- `Closer.astro` takes an `actions` slot for the tracked island.
- Header's red `Tickets` action is dropped on `/invite/*` (`isInvite`).
