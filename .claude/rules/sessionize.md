---
paths:
  - "functions/src/sessionize/**"
  - "functions/src/lineup/**"
  - "src/lib/lineup.ts"
  - "src/lib/speakers.ts"
  - "src/lib/sessions.ts"
  - "src/lib/agenda.ts"
  - "src/lib/lineup-static.ts"
  - "src/lib/share.ts"
  - "src/layouts/Share.astro"
  - "src/pages/speakers/**"
  - "src/pages/talks/**"
---

# Sessionize lineup

Daily sync (`every day 06:15`) into Firestore `speakers` (embeds `sessions[]`), `sessions`
(embeds `speakers[]`) and `rooms`; browser reads `/api/lineup`.

- Speakers come from the All view **plus** the Speakers view
  (`mergeSpeakerRosters`): All lists only speakers of the sessions it
  publishes, so the hosts (session "HOST") and the keynote speaker exist only
  in the Speakers view. Best-effort: if that view fails, the All roster syncs.

- `/agenda` gets a column for every `rooms` doc, even one with no talk yet
  (header says "Talks TBA"), plus any other room a talk sits in. A room's
  standing header note ("Workshops only" on Crime Lab) is `ROOM_NOTES` in
  `src/components/Agenda.tsx`, keyed by the Sessionize room name.

- Each collection is one atomic `WriteBatch` (cap 500 ops).
- Delete-guard: `computeDeletePlan` withholds deletes on a truncated fetch and
  pings Slack. `extractSpeakers` throws on empty; an empty session set
  (Speakers-view fallback) is preserved.
- Photos mirrored to Storage (`mirror-images.ts`), idempotent, best-effort.
- Share pages `/talks/<id>` and `/speakers/<id>` are built from production
  `/api/lineup` at `astro build` (`lineup-static.ts`, never shipped to the
  client; `DEVFEST_LINEUP_URL` overrides, `A11Y_MOCK` builds none). Each
  carries the talk or speaker as text, unfurls its own title/description, is
  indexed and in the sitemap, then forwards a browser to the sheet
  (`/agenda?talk=`, `/speakers?speaker=`). Something added after the last build
  has no page: `404.astro` forwards its link, with the site's own preview.
- `SESSIONIZE_ENDPOINT_ID` must be a JSON API id or URL (embed id returns
  HTML); `parseEndpointId` handles both.
