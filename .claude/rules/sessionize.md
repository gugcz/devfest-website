---
paths:
  - "functions/src/sessionize/**"
  - "functions/src/lineup/**"
  - "src/lib/lineup.ts"
  - "src/lib/speakers.ts"
  - "src/lib/sessions.ts"
  - "src/lib/agenda.ts"
---

# Sessionize lineup

Daily sync into Firestore `speakers` (embeds `sessions[]`) and `sessions`
(embeds `speakers[]`); browser reads `/api/lineup`.

- Each collection is one atomic `WriteBatch` (cap 500 ops).
- Delete-guard: `computeDeletePlan` withholds deletes on a truncated fetch and
  pings Slack. `extractSpeakers` throws on empty; an empty session set
  (Speakers-view fallback) is preserved.
- Photos mirrored to Storage (`mirror-images.ts`), idempotent, best-effort.
- `SESSIONIZE_ENDPOINT_ID` must be a JSON API id or URL (embed id returns
  HTML); `parseEndpointId` handles both.
