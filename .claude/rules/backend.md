---
paths:
  - "functions/**"
---

# Backend conventions (`functions/src/lib/`, `options.ts`)

Failure text is a product surface: it lands in Slack, an invoice's
`errorMessage`, and Cloud Logging.

- New function: file + re-export in `<domain>/index.ts`. New domain: folder +
  `export * from './<domain>/index.js'` in `src/index.ts`.
- `params.ts` per domain; cross-domain params (`SLACK_WEBHOOK_URL`) in
  `lib/params.ts`. Never import a sibling domain's params.
- `.js` import suffixes (NodeNext).
- **`options.ts`** — `setGlobalOptions` (`maxInstances` cost ceiling, shared
  billing project) + presets `SCHEDULED`, `CACHED_ENDPOINT`, `WEBHOOK`,
  `CALLABLE`, `TRIGGER`. Spread a preset; never restate `region`/`timeZone`.
- **`lib/run.ts`** — `runBackground({ name, domain, failureNote }, handler)`
  wraps every scheduled job. Logs start/finish, logs unwrapped cause, alerts
  Slack, rethrows. `failureNote` states blast radius. Alerts fire **on state
  change** (first failure, then "recovered"); streak in RTDB
  `ops/health/{name}`, best-effort.
- **`lib/slack.ts`** — `postToSlack` throws; `notify(domain, url, text)` is
  best-effort, prefixed, never throws. Alerting functions list
  `SLACK_WEBHOOK_URL` in `secrets`.
- **`lib/cached-endpoint.ts`** — `cachedJsonEndpoint({ name, cacheControl,
  memoTtlMs, fallback, load })`, shared body of `/api/*`.
- **`lib/errors.ts`** — `describeError(err)` unwraps `cause`/`code` (undici
  hides `ENOTFOUND` etc. under `fetch failed`; gRPC uses `code`).
  `stageError(stage, err)` labels the failing step. **Never log `err.message`
  directly.**
- **`lib/http.ts`** — `fetchWithRetry` is the only outbound HTTP; bare
  `fetch()` is a bug. Timeout per attempt (15s, 30s iDoklad), 3 attempts on
  network/429/5xx, 4xx never retried. **Non-GET never retries** unless
  `retryUnsafe` (only Slack and iDoklad token). Non-OK returned, not thrown.
  `errorBody(res)` reads a failed body, capped.
