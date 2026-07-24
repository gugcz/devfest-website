---
title: Server-render speakers & sessions to fix ~30s mobile load
type: fix
date: 2026-07-24
---

## Server-render speakers & sessions to fix ~30s mobile load - Extensive

## Overview

The `/speakers` and `/sessions` grids — and the homepage speaker teaser — hydrate
client-side from Firestore. Because `getFirestoreDb()` eagerly initializes App Check
(reCAPTCHA Enterprise) on the shared FirebaseApp, the Firestore `onSnapshot` read
**blocks on an App Check token**, and minting a reCAPTCHA Enterprise token on a weak
mobile CPU + slow network burns ~30s before content appears (QA report, 2026-07-24).

We move every content read **off the browser to the server**, where the **Admin SDK**
authenticates over IAM/ADC and never passes through the App Check gateway:

- `/speakers` + `/sessions` become **on-demand (SSR)** via the `@astrojs/node`
  adapter; a 2nd-gen Cloud Function (`renderPages`, region `europe-west1`,
  **`minInstances: 1`** so there is no cold start) serves them behind a Firebase
  Hosting rewrite. Responses are CDN-cached; the always-warm instance handles cache
  misses without the ~cold-start latency the fix is meant to remove.
- The homepage stays **prerendered/static**; its speaker teaser roster is fetched at
  **build time** via the same Admin SDK and passed as a prop (a rotating preview wall
  does not need request-time freshness, and `/` — the highest-traffic page — must stay
  pure static).

All three islands become presentation-only (no client Firestore). This is fully
compatible with the intended follow-up of **enforcing App Check on Firestore** — Admin
reads are unaffected — which is why the client read had to move rather than simply
dropping reCAPTCHA.

Approach note: three plan-review passes (simplicity, VGV, flow) recommended SSG over
SSR because the data changes ~daily. The maintainer chose **SSR** deliberately for
request-time freshness and accepts an always-on `minInstances: 1` to remove cold
starts. SSG is recorded as the primary alternative.

Brainstorm: [docs/brainstorm/2026-07-24-speakers-sessions-ssr-brainstorm-doc.md](../brainstorm/2026-07-24-speakers-sessions-ssr-brainstorm-doc.md).

## Problem Statement

- **Symptom:** the `/speakers` grid takes ~30s to render on mobile.
- **Load path** ([Speakers.tsx:76](../../src/components/Speakers.tsx#L76)): static
  "Loading lineup" placeholder → `client:load` island `useEffect` dynamic-imports
  `firebase` + `firebase/firestore` → `getFirestoreDb()` → `getApp()` →
  `initAppCheck()` ([firebase.ts:28](../../src/lib/firebase.ts#L28)) →
  `ReCaptchaEnterpriseProvider` downloads Google's reCAPTCHA Enterprise script, runs
  the device challenge, exchanges for an App Check token → **Firestore `onSnapshot`
  waits for that token** before the first read leaves the device.
- **Why enforcement being off doesn't help:** the client SDK blocks on the token mint
  regardless of whether the *server* enforces it. Enforcement off only stops the
  backend rejecting a missing token.
- **Three affected surfaces, same pattern:**
  - `/speakers` — [Speakers.tsx:76](../../src/components/Speakers.tsx#L76)
  - `/sessions` — [Sessions.tsx:94](../../src/components/Sessions.tsx#L94)
  - homepage `/` teaser — [SpeakersTeaser.tsx:84](../../src/components/SpeakersTeaser.tsx#L84)
    (`client:load` at [index.astro:137](../../src/pages/index.astro#L137)). **Highest-
    traffic page.** Leaving it out would falsify "no reCAPTCHA on the content path" and
    keep `firebase/firestore` in the client bundle.
- **Out of scope:** `Tickets.tsx` is RTDB (`getDb`/`onValue`), not Firestore, and is a
  different product/path.
- **Constraint from the maintainer:** App Check *will* be enforced on Firestore. So the
  reCAPTCHA cost on any client read is intentional and cannot be removed — the read must
  leave the browser.

## Proposed Solution

- `speakers.astro` / `sessions.astro`: `export const prerender = false` (except under
  `A11Y_MOCK`, see Phase 1); frontmatter reads Firestore via a new server-only Admin
  module and passes parsed arrays as serialized props to the islands.
- `index.astro`: stays prerendered; build-time Admin read for the teaser roster →
  prop. Graceful fallback (empty roster → teaser renders nothing) if the build read
  fails, so a credential-less local build still succeeds.
- `Speakers.tsx` / `Sessions.tsx` / `SpeakersTeaser.tsx`: presentation-only. Remove the
  fetch effect + `onSnapshot` + `firebase` imports; derive status from props. Keep all
  interactivity (modal, sessions search/filter, teaser shuffle/rotate/reduced-motion).
- Serve the two on-demand routes with the `renderPages` 2nd-gen function behind Hosting
  rewrites; CDN-cache populated responses, `no-store` (+ 503) on failed/empty reads.

## Technical Approach

### Architecture

```
Browser ─GET /speakers─▶ Firebase Hosting CDN
                            │ cache hit ─▶ cached HTML (no function, no read)
                            │ cache miss ▶ rewrite ─▶ renderPages (2nd-gen fn, europe-west1, minInstances:1)
                                                          │ Astro Node handler renders speakers.astro
                                                          │ frontmatter: firebase-admin reads Firestore
                                                          │ (ADC/IAM — bypasses App Check + rules)
                                                          ▼
                                    populated → 200 + Cache-Control: public, s-maxage=…, SWR
                                    failed/empty → 503 + Cache-Control: no-store

Homepage /  ─▶ prerendered static HTML; teaser roster baked at BUILD via Admin SDK
```

Research-confirmed facts (see References):

- **Astro 7 `output`:** keep `'static'` (default). `'hybrid'` no longer exists; opt the
  two routes out with `prerender = false`. Do **not** switch to `'server'`.
- **Adapter:** `@astrojs/node`, `mode: 'middleware'` → build emits `dist/client/`
  (static + prerendered HTML) and `dist/server/entry.mjs` exporting a Connect-style
  `handler(req, res, next)`.
- **Output layout changes:** static files move `dist/` → `dist/client/`. Hosting
  `"public"` becomes `dist/client`; the SSR function packages `dist/server`. **Audit
  every `dist/` reference** (notably `scripts/a11y.mjs`).
- **Rewrite precedence:** an exact static file beats a rewrite → `prerender = false`
  (no `dist/client/speakers/index.html`) is what lets the rewrite fire.
- **CDN caching:** dynamic responses are `private` (uncached) by default; the handler
  must set `Cache-Control` via `Astro.response.headers.set(...)` (effective only on
  on-demand routes).
- **Admin bypass:** Firestore **rules** bypass is documented and certain. App Check
  bypass is architecturally certain (Admin SDK uses ADC/IAM, never the App Check
  gateway) but not cleanly citable → verification gate before enforcing (Future
  Considerations).

### Server data module — `src/lib/firebase-admin.ts` (new)

Server-only. Mirror the shape/naming of [functions/src/lib/admin.ts](../../functions/src/lib/admin.ts).
Pin `firebase-admin` to the functions' major (`^13`). Add a mechanical client-leak
guard so a stray `.tsx` import fails loudly instead of breaking the client build.

```ts
// src/lib/firebase-admin.ts — server-only; never import from a client island.
import { initializeApp, getApps, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

if (!import.meta.env.SSR) {
	throw new Error('firebase-admin.ts imported into a client bundle — server-only.');
}

const adminApp: App = getApps()[0] ?? initializeApp(); // ambient ADC at runtime
let firestoreInstance: Firestore | null = null;
export function adminFirestore(): Firestore {
	return (firestoreInstance ??= getFirestore(adminApp));
}
```

### Shared cache-header helper — `src/lib/ssr-cache.ts` (new)

One place sets the TTL so `speakers.astro` and `sessions.astro` can't drift, and so the
failed/empty path is never cached:

```ts
// Populated → long edge cache with SWR. Failed/empty → never cache, and 503 so a
// transient Firestore blip isn't pinned at the edge (or indexed by a crawler).
export function applyContentCache(response: Response, ok: boolean): void {
	if (ok) {
		response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
	} else {
		response.headers.set('Cache-Control', 'no-store');
	}
}
```

### On-demand route — `src/pages/speakers.astro` (edit)

```astro
---
// Prerender under A11Y_MOCK so the static a11y harness gets a fixture-filled file;
// on-demand for real builds. (Verify Astro accepts an env-derived const here.)
export const prerender = import.meta.env.A11Y_MOCK === '1';
import { adminFirestore } from '../lib/firebase-admin';
import { applyContentCache } from '../lib/ssr-cache';
import { speakerFromDoc, type Speaker } from '../lib/speakers';
// …existing imports…

let speakers: Speaker[] = [];
let ok = false;
try {
	const snap = await adminFirestore().collection('speakers').orderBy('order').get();
	speakers = snap.docs.map((d) => speakerFromDoc(d.id, d.data()));
	ok = speakers.length > 0;
} catch (err) {
	console.error('[speakers] SSR Firestore read failed:', err);
}
if (!import.meta.env.A11Y_MOCK) {
	applyContentCache(Astro.response, ok);
	if (!ok) Astro.response.status = 503; // Retry-After optional
}
---
…
<Speakers client:load speakers={speakers} failed={!ok} />
```

`sessions.astro` mirrors this with `sessionFromDoc` + moving the existing
`.filter(isDisplayableSession)` to the server map. **Remove** the `<noscript>` "turn on
JavaScript" block and the "hydrates client-side from Firestore" comments in both files —
the grid now ships in the server HTML.

### Homepage teaser — `src/pages/index.astro` (edit, stays prerendered)

```astro
---
// index.astro keeps prerender=true. Build-time roster for the teaser.
import { adminFirestore } from '../lib/firebase-admin';
import { speakerFromDoc, type Speaker } from '../lib/speakers';
let speakers: Speaker[] = [];
try {
	const snap = await adminFirestore().collection('speakers').orderBy('order').get();
	speakers = snap.docs.map((d) => speakerFromDoc(d.id, d.data()));
} catch (err) {
	console.warn('[teaser] build-time speaker read failed; teaser hidden:', err);
}
---
<SpeakersTeaser client:load speakers={speakers} />
```

### Island refactors — presentation-only

- **Speakers.tsx**: delete the fetch `useEffect`, the `onSnapshot`/`getFirestoreDb`
  path, and the "keep dialog in sync with live list" effect. Signature
  `({ speakers, failed }: { speakers: Speaker[]; failed: boolean })`; status derives from
  props. Keep the `SpeakerDetail` modal.
- **Sessions.tsx**: same; keep the entirely client-side search/filter (operates on the
  `sessions` prop).
- **SpeakersTeaser.tsx**: signature `({ speakers }: { speakers: Speaker[] })`; drop the
  fetch effect + firebase imports; keep the shuffle/rotate/hover/reduced-motion logic on
  the prop; keep `return null` when the roster is empty.
- After this, no client Firestore import remains anywhere; `firebase/firestore` drops
  from the client bundle and App Check no longer initializes on any content path (it
  still initializes for the invoice callable + Tickets/RTDB, unchanged).
- **Serialization check:** the parsers coerce to primitives (JSON-safe), but confirm the
  Admin-SDK `.data()` → `speakerFromDoc`/`sessionFromDoc` → island-prop round-trip leaks
  no `Timestamp`/`undefined` (Astro serializes props to JSON).
- **Hydration gap (accept + note):** cards paint from SSR but taps do nothing until
  `client:load` hydrates — better than the old blank state, but note it; no gating UI
  added.

### Prefetch — `astro.config.mjs` / `Menu.astro`

`prefetchAll: true` + `defaultStrategy: 'hover'` would fire the function on every nav
hover over `/speakers` / `/sessions`. Exclude both routes from prefetch
(`data-astro-prefetch="false"` on the [Menu.astro](../../src/components/Menu.astro) links,
and any other links to them) so a hover can't trigger an SSR invocation.

### Deploy wiring

- `astro.config.mjs`: add `adapter: node({ mode: 'middleware' })`; add an `A11Y_MOCK`
  alias for the new `firebase-admin` module → a fixture replayer (see Phase 1 a11y).
- `firebase.json`:
  - `hosting.public` `dist` → `dist/client`.
  - rewrites (object form, explicit region — never the legacy string form, which
    misroutes region):
    ```json
    "rewrites": [
      { "source": "/speakers", "function": { "functionId": "renderPages", "region": "europe-west1", "pinTag": true } },
      { "source": "/sessions", "function": { "functionId": "renderPages", "region": "europe-west1", "pinTag": true } }
    ]
    ```
  - second `functions` array entry: `{ "source": "ssr", "codebase": "website-ssr", "runtime": "nodejs22" }`.
- **`renderPages` function** (`ssr/`, 2nd-gen `onRequest`, `region: 'europe-west1'`,
  `invoker: 'public'`, `minInstances: 1`, `maxInstances: 10` to respect the shared-billing
  cap like [options.ts](../../functions/src/options.ts)). Wraps the built Astro handler:
  `onRequest((req, res) => ssrHandler(req, res, () => { res.statusCode = 404; res.end(); }))`.
  Its `package.json` lists the runtime deps the adapter externalizes: `astro`, `react`,
  `react-dom`, `firebase-admin@^13`, `firebase-functions`. A predeploy runs the website
  build and stages `dist/server` into `ssr/` (the main Phase-2 risk — see Risks; Cloud
  Run standalone is the fallback).
- **CI (deploy ordering):** a rewrite to a not-yet-deployed function 404s, and hosting +
  functions currently deploy in separate workflows. Deploy `renderPages` **and** hosting
  together in one job (functions first), e.g. extend `firebase-hosting-merge.yml` to
  `firebase deploy --only functions:website-ssr,hosting` after `npm run build`
  (it already has the SA secret). Keep `firebase-functions-merge.yml` for the
  `website` codebase; add `ssr/**` to the relevant workflow `paths`. Confirm the
  `website-ssr` codebase name can't collide with the mobile-app repo.

### a11y harness rework — `scripts/a11y.mjs` + `scripts/a11y-mocks/`

`scripts/a11y.mjs` is a **static file server** rooted at `dist/`; it cannot run the Node
SSR handler. Under `A11Y_MOCK=1`:
- `speakers.astro` / `sessions.astro` set `prerender = true` (the env-derived const
  above), so the mock build emits static, fixture-filled HTML.
- `astro.config.mjs` aliases the new `firebase-admin` module to a fixture replayer
  (mirroring the existing client `firebase/firestore` mock) so the build-time reads in
  all three surfaces return `SPEAKERS`/`SESSIONS` from
  [fixtures.mjs](../../scripts/a11y-mocks/fixtures.mjs).
- Repoint `DIST` → `dist/client` in `scripts/a11y.mjs` and keep the trailing-slash
  `PATHS`.
The non-mock Phase-1 "no static file" check is therefore conditional on
`A11Y_MOCK` being unset.

## Implementation Phases

### Phase 1: Adapter + server reads + island refactors + a11y (build-green, locally verifiable)

- **Status:** Done
- **Scope:** Node adapter; `src/lib/firebase-admin.ts` + `src/lib/ssr-cache.ts`;
  `prerender`/Admin fetch/cache-header/`<noscript>` edits in `speakers.astro` +
  `sessions.astro`; build-time teaser read in `index.astro`; refactor all three islands
  to props; prefetch exclusion; a11y mock rework (prerender-under-mock + admin fixture
  alias + `DIST`→`dist/client`). Verifiable via `astro preview` (local ADC/emulator) and
  `npm run a11y`.
- **Files touched:** `astro.config.mjs`, `src/lib/firebase-admin.ts` (new),
  `src/lib/ssr-cache.ts` (new), `src/pages/speakers.astro`, `src/pages/sessions.astro`,
  `src/pages/index.astro`, `src/components/Speakers.tsx`, `src/components/Sessions.tsx`,
  `src/components/SpeakersTeaser.tsx`, `src/components/Menu.astro`, `package.json`
  (`@astrojs/node`, `firebase-admin@^13`), `scripts/a11y.mjs`, `scripts/a11y-mocks/*`.
- **Acceptance criteria:** `npm run build` passes; on a real build no
  `dist/client/{speakers,sessions}/index.html` is emitted; no
  `onSnapshot`/`getFirestoreDb`/`firebase/firestore` in any of the three islands;
  `npm run a11y` passes with populated grids; `astro preview` renders populated
  `/speakers`, `/sessions`, and `/` teaser with no browser Firestore request.
- **Validation:** `npm run build && test ! -e dist/client/speakers/index.html && test ! -e dist/client/sessions/index.html && ! grep -Erq "onSnapshot|getFirestoreDb|firebase/firestore" src/components/Speakers.tsx src/components/Sessions.tsx src/components/SpeakersTeaser.tsx && npm run a11y`

### Phase 2: Production deploy wiring (function + rewrite + hosting path + CI)

- **Status:** Done
- **Scope:** Package the Astro Node handler as the 2nd-gen `renderPages` function
  (`minInstances:1`, `maxInstances:10`, region `europe-west1`), point Hosting at
  `dist/client`, add the two rewrites, and deploy the function + hosting together
  (function first) with the `ssr/**` path trigger. After this, production serves both
  routes via an always-warm SSR function.
- **Files touched:** `firebase.json`, `ssr/` (new: `package.json` + `index.js` wrapper +
  predeploy staging), `.github/workflows/firebase-hosting-merge.yml` (combined deploy),
  workflow `paths`.
- **Acceptance criteria:** `firebase.json` serves `dist/client` and rewrites both routes
  to `renderPages`; a preview-channel/live deploy serves both routes with the grid in the
  initial HTML, a populated response carrying `Cache-Control: public, s-maxage=…`, and a
  failed/empty read returning 503 + `no-store`.
- **Validation:** `grep -q '"dist/client"' firebase.json && grep -q "renderPages" firebase.json` — then manual: 1) deploy; 2) `curl -sI <url>/speakers` shows `cache-control: public, s-maxage=3600…`; 3) `curl -s <url>/speakers` contains speaker names; 4) confirm no `firestore.googleapis.com` request in browser DevTools on `/`, `/speakers`, `/sessions`.

## Alternative Approaches Considered

- **SSG (build-time Admin render) — recommended by all three reviews, not chosen.** Same
  outcome (no client Firestore read, App-Check-compatible) with less infra: no function,
  no cold starts, previews always current (no `pinTag` regression), the a11y harness
  works unchanged. Cost: content refreshes per deploy → wire `refreshSessionize` (daily)
  to a rebuild hook. **Rejected by the maintainer in favor of request-time freshness**,
  accepting `minInstances: 1` to remove cold starts. Remains the fallback if the SSR
  function's dep-packaging proves too painful.
- **SSR runtime = Cloud Run** (standalone adapter + `run` rewrite): sidesteps function
  dep-packaging but adds Artifact Registry + a Cloud Run service, and `pinTag` is
  undocumented for `run` rewrites. Phase-2 fallback.
- **SSR the homepage too** (make `/` on-demand): consistent request-time freshness for
  the teaser, but routes the highest-traffic page through the function. Rejected — the
  homepage stays static with a build-time-baked teaser roster.
- **Static JSON via a public function** the island `fetch()`es: still JS-rendered
  (weaker SEO), reintroduces a homepage loading state. Rejected.
- **Lazy client App Check:** incompatible with enforcing App Check on Firestore.
  Rejected.
- **Firebase `webframeworks` experiment:** auto-regenerates hosting + functions config on
  every deploy — unsafe on a hand-managed shared `firebase.json`. Rejected.

## Success Criteria

```success-criteria
GOAL: /speakers, /sessions, and the homepage speaker teaser render their content server-side (no client Firestore read, no reCAPTCHA on any content path), fixing the ~30s mobile load, while staying compatible with App Check enforcement on Firestore.

SUCCESS CRITERIA:
- Production build succeeds with the Node adapter | verify: npm run build
- No client Firestore read remains on any content surface | verify: ! grep -Erq "onSnapshot|getFirestoreDb|firebase/firestore" src/components/Speakers.tsx src/components/Sessions.tsx src/components/SpeakersTeaser.tsx
- The a11y sweep audits populated grids and passes | verify: npm run a11y
- Content is present in the initial HTML on Slow-4G, with no browser Firestore request | verify: manual 1) astro preview (or deploy) 2) DevTools mobile + Slow 4G on /, /speakers, /sessions 3) content present on first paint; Network shows zero firestore.googleapis.com requests from the browser
- A failed/empty Firestore read is never cached and is not a 200 | verify: manual 1) force the SSR read to fail (bad creds/rules in a staging context) 2) curl -sI /speakers shows cache-control: no-store and HTTP 503
- The SSR routes are excluded from hover-prefetch | verify: manual confirm the /speakers and /sessions nav links carry data-astro-prefetch="false" (no function hit on hover in the Network panel)

NON-GOALS:
- Changing Tickets.tsx / RTDB (different product/path)
- Real-time onSnapshot live updates of the lineup (request-time SSR is fresh enough; daily data)
- Making the homepage on-demand (stays static; teaser roster baked at build)
- Migrating the whole site to SSR or to Firebase App Hosting
- Enabling App Check enforcement on Firestore in production within this PR (gated follow-up, see Future Considerations)

VERIFICATION COMMAND: npm run build && test ! -e dist/client/speakers/index.html && test ! -e dist/client/sessions/index.html && ! grep -Erq "onSnapshot|getFirestoreDb|firebase/firestore" src/components/Speakers.tsx src/components/Sessions.tsx src/components/SpeakersTeaser.tsx && npm run a11y
```

## Success Metrics

- Time-to-content on Slow-4G mobile for `/`, `/speakers`, `/sessions`: ~30s → present in
  the initial HTML.
- Zero `firestore.googleapis.com` requests from the browser on all three surfaces.
- With `minInstances: 1`, cache-miss p95 TTFB stays low (no cold start); CDN cache-hit
  ratio high enough that `renderPages` is invoked ~once per `s-maxage` window per edge
  (spot-check Hosting logs).

## Dependencies & Prerequisites

- Website deps: `@astrojs/node`, `firebase-admin@^13`. SSR function deps: also
  `firebase-functions`.
- Runtime creds: ambient ADC in the deployed function (no key). **Build-time** creds are
  now needed for the homepage teaser bake — CI already has the SA secret; local builds
  without creds fall back to a hidden teaser (graceful).
- SSR function service account needs Firestore read (default compute SA has it).
- Node 22 runtime (matches existing functions).

## Risk Analysis & Mitigation

- **App Check bypass not doc-certain (highest risk).** The fix assumes the Admin read is
  exempt from App Check enforcement — architecturally certain, not cleanly documented.
  Gate production enforcement behind a live staging test (Future Considerations); never
  flip it before that passes.
- **Packaging the Astro server into a function.** The adapter externalizes deps; the
  bundle must ship `dist/server` + runtime deps. Mitigation: dedicated `ssr/` codebase
  with its own `package.json` + a predeploy that builds and stages `dist/server`;
  fallback to Cloud Run (standalone adapter).
- **`pinTag` preview fidelity.** Even with `minInstances`, a preview channel pins the
  **production** `renderPages` version while hosting the PR's new `dist/client` assets →
  the preview's `/speakers` may reference old asset hashes (404'd CSS/JS or hydration
  mismatch) and won't reflect SSR-logic changes. Mitigation: verify SSR-route changes via
  `astro preview` locally; do not trust a preview channel's `/speakers` rendering.
  Document in the PR workflow.
- **Cache poisoning of the error state.** Mitigated by `no-store` + 503 on failed/empty
  reads (never cache "temporarily unavailable").
- **Homepage build-time read.** Adds a build-time Firestore dependency for `/`. Mitigated
  by graceful fallback (empty roster → teaser hidden, build still green). Teaser roster
  is deploy-fresh, not request-fresh (acceptable for a preview wall).
- **Shared Firebase project.** New `website-ssr` codebase + `renderPages` name + rewrite
  must not collide with the mobile-app repo; new codebase needs its own `maxInstances`
  cap. Confirm before first deploy.
- **`dist` → `dist/client` path change.** Breaks any tooling assuming `dist/` — audited:
  `scripts/a11y.mjs` repointed in Phase 1.
- **Direct function URL bypasses the CDN.** `renderPages` is `invoker: 'public'`; the raw
  `run.app`/`cloudfunctions.net` URL is an uncached public read path. Low risk (public
  read-only data) — note it in cost/abuse planning.
- **CSP (report-only).** `firebase.json`'s global `Content-Security-Policy-Report-Only`
  covers function-served HTML too; confirm the SSR HTML + hydrated islands stay within
  `script-src 'self' 'unsafe-inline' …` (report-only, non-blocking).
- **SSR fetch failure = broken page.** `try/catch` in frontmatter → `failed` prop →
  existing "temporarily unavailable" state rendered server-side (never a raw 500).

## Resource Requirements

- One developer; Phase 1 (code) + Phase 2 (infra) are the bulk (~250–350 LOC, mostly
  deletions in the islands + config).
- Firebase console access for the enforcement follow-up and Hosting logs.
- Small always-on cost from `minInstances: 1` on the shared billing project (accepted).

## Future Considerations

- **Enforce App Check on Firestore (gated ops follow-up, no code in this PR).** Verify in
  a staging/preview context that the SSR Admin read is unaffected with enforcement ON
  (load `/speakers` + `/sessions`, confirm grids render and no browser Firestore request),
  then enable in production. Update `CLAUDE.md` / `firestore.rules` header + README App
  Check notes when it lands.
- **Teaser/lineup freshness:** if deploy-fresh teaser (or `s-maxage` staleness on an
  urgent announcement) becomes a problem, add a `refreshSessionize` → redeploy/CDN-purge
  hook (it already runs daily and writes the collections).
- Additional dynamic routes generalize (add `prerender = false` + a rewrite per route).
- Query-string cache fragmentation (`?utm_*`): normalize/ignore for these routes if UTM
  inbound traffic makes misses costly.

## Documentation Plan

- Update `CLAUDE.md`: the speakers/sessions grids are SSR (Admin read, App Check bypass,
  `renderPages` function, `dist/client` hosting path, `website-ssr` codebase); the
  homepage teaser is build-time baked; document the **two Admin runtimes**
  (`functions/src/lib/admin.ts` vs `src/lib/firebase-admin.ts`).
- **PR body:** Summary / Why / Behavior / Files only — **no "Test plan" section**
  (CLAUDE.md + user global prefs). The Validation/Success-Criteria blocks stay in this
  plan, not the PR.

## References & Research

### Internal References

- Load path / App Check init: [src/lib/firebase.ts:24-71](../../src/lib/firebase.ts#L24)
- Islands to refactor: [Speakers.tsx:76](../../src/components/Speakers.tsx#L76), [Sessions.tsx:94](../../src/components/Sessions.tsx#L94), [SpeakersTeaser.tsx:84](../../src/components/SpeakersTeaser.tsx#L84)
- Homepage teaser mount: [index.astro:137](../../src/pages/index.astro#L137)
- Pure parsers reused server-side: [src/lib/speakers.ts:153](../../src/lib/speakers.ts#L153), `src/lib/sessions.ts` (`sessionFromDoc`, `isDisplayableSession`)
- Admin singleton to mirror + instance-cap convention: [functions/src/lib/admin.ts](../../functions/src/lib/admin.ts), [functions/src/options.ts:18](../../functions/src/options.ts#L18)
- Firestore rules (public-read speakers/sessions): [firestore.rules](../../firestore.rules)
- Hosting + functions config: [firebase.json](../../firebase.json)
- Nav links (prefetch): [src/components/Menu.astro](../../src/components/Menu.astro)
- a11y harness + fixtures: [scripts/a11y.mjs](../../scripts/a11y.mjs), [scripts/a11y-mocks/firestore.mjs](../../scripts/a11y-mocks/firestore.mjs), [scripts/a11y-mocks/fixtures.mjs](../../scripts/a11y-mocks/fixtures.mjs)
- Deploy workflows: `.github/workflows/firebase-hosting-merge.yml`, `.github/workflows/firebase-functions-merge.yml`, `.github/workflows/firebase-hosting-pull-request.yml`

### External References

- Astro on-demand rendering: https://docs.astro.build/en/guides/on-demand-rendering/
- `@astrojs/node` adapter (modes, handler shape): https://docs.astro.build/en/guides/integrations-guide/node/
- `Astro.response`: https://docs.astro.build/en/reference/api-reference/#astroresponse
- Firebase Hosting full config (rewrites, precedence): https://firebase.google.com/docs/hosting/full-config
- Serve dynamic content with functions: https://firebase.google.com/docs/hosting/functions
- Manage cache behavior (`s-maxage`, dynamic default `private`): https://firebase.google.com/docs/hosting/manage-cache
- Preview channels + `pinTag`: https://firebase.google.com/docs/hosting/test-preview-deploy
- Admin SDK bypasses rules: https://firebase.google.com/docs/database/admin/start

### Related Work

- Brainstorm doc: [docs/brainstorm/2026-07-24-speakers-sessions-ssr-brainstorm-doc.md](../brainstorm/2026-07-24-speakers-sessions-ssr-brainstorm-doc.md)
- Prior platform work: #252 (adopt Astro 7 platform features), #258 (cookieless Consent Mode)
