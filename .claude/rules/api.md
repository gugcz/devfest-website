---
paths:
  - "functions/src/lib/cached-endpoint.ts"
  - "functions/src/lineup/**"
  - "functions/src/tickets/tickets-api.ts"
  - "functions/src/workshops/workshops-api.ts"
  - "src/lib/lineup.ts"
  - "src/lib/tito.ts"
  - "src/lib/workshops.ts"
  - "src/components/SpeakerCard.tsx"
  - "scripts/a11y-mocks/**"
  - "firebase.json"
  - "astro.config.mjs"
---

# Browser data access (`/api/*`)

**The browser reads DB data only through cached HTTP functions, never the
client SDK** (client reads blocked on an App Check token, ~30s on mobile;
[ADR 0001](../../docs/adr/0001-browser-reads-through-cached-api.md)).

| Endpoint | Function | Reads | Caller | Edge TTL |
| --- | --- | --- | --- | --- |
| `/api/lineup` | `lineupApi` | Firestore `speakers` + `sessions` + `rooms` | `src/lib/lineup.ts`, `src/lib/lineup-static.ts` (build) | 15min |
| `/api/tickets` | `ticketsApi` | RTDB `/tickets` | `src/lib/tito.ts::fetchTickets`, `src/lib/tickets-static.ts` (build) | 5min |
| `/api/speaker-photo?id=` | `speakerPhotoApi` | Storage `speakers/{id}` or the Sessionize CDN (image bytes) | `src/components/SpeakerCard.tsx` | 1 day |
| `/api/workshops` | `workshopsApi` | RTDB `/workshops` (seat counts only) | `src/lib/workshops.ts::fetchSeats`, `src/lib/workshops-static.ts` (build) | 30s |

- 2nd-gen `onRequest`, public, `europe-west1`, codebase `website`. Edge
  `s-maxage` + in-instance memo (`lib/cached-endpoint.ts`). Failed read →
  `no-store` 503.
- Every endpoint scales to zero (no `minInstances`).
- Writes go through callables, never the client SDK: `submitInvoiceCallable`
  (`/invoice`) and `workshopRegistrationCallable` (`/workshops`).
- `lineupApi` also answers the mobile app's PWA with CORS: one Hosting site
  under `https://app.devfest.cz` and `https://devfest-cz-app.web.app`, plus
  `http://localhost:*`. `corsOrigins` on the spec (`lib/cors.ts`),
  `Vary: Origin` so the CDN keeps one copy per origin. The other endpoints
  stay same-origin.
- Rewrites in `firebase.json` carry **no `pinTag`**: hosting deploys never
  build functions.
- Endpoints return raw docs; the browser parses with `speakerFromDoc` /
  `sessionFromDoc` / `filterDisplayable`.
- Dev and a11y serve `/api/*` from `scripts/a11y-mocks/api.mjs` (a dev server
  has no rewrite table). `DEVFEST_LIVE_API=1 npm run dev` hits deployed
  functions. Only `firebase/app-check` is mocked under `A11Y_MOCK`.
