---
date: 2026-07-24
topic: speakers-sessions-ssr
---

# Server-render the speakers & sessions lineup (fix ~30s mobile load)

## What We're Building

QA reports the `/speakers` grid takes ~30s to appear on mobile. Root cause: the
grid hydrates client-side from Firestore, and `getFirestoreDb()` eagerly
initializes **App Check (reCAPTCHA Enterprise)** on the same FirebaseApp
([`src/lib/firebase.ts`](../../src/lib/firebase.ts) → `getApp()` →
`initAppCheck()`). The Firestore `onSnapshot` read **blocks on the App Check
token**, and minting a reCAPTCHA Enterprise token on a weak mobile CPU + slow
network is what burns the ~30s. `/sessions` shares the identical pattern
([`Sessions.tsx`](../../src/components/Sessions.tsx)) and has the same bug.

We are **enforcing App Check on Firestore** as a deliberate security posture, so
the client-side reCAPTCHA cost is *not* something we want to remove — which means
no browser Firestore read can be fast. The fix is to move the `speakers` /
`sessions` reads **server-side**, where the **Admin SDK bypasses App Check and
security rules entirely**. We will render these two routes **on demand (SSR)**
via an Astro adapter, fetch the collections with `firebase-admin` using the
runtime's ambient service-account credentials, and ship fully-rendered HTML. The
browser never touches Firestore for the lineup, so App Check enforcement stays
fully intact for the paths that need it (the `submitInvoiceRequest` callable),
while mobile gets an instant paint. SSR responses are **CDN-cached** so cold
starts and per-request read cost hit only on a cache miss.

## Why This Approach

Considered three server-side flavors (all bypass App Check via the Admin SDK):

- **SSR request-time (CHOSEN).** Only `/speakers` + `/sessions` render on demand;
  the rest of the site stays static. Always fresh (no rebuild plumbing), ambient
  Admin creds at runtime (no key management), and CDN caching neutralizes the
  cold-start/perf risk so it performs like static for the vast majority of hits.
- **SSG build-time (considered, not chosen).** Lighter (no new runtime, SA secret
  already in the hosting workflow, pure static CDN), but content only refreshes on
  deploy, so it needs a daily rebuild trigger. Rejected in favor of request-time
  freshness. Kept as a fallback if SSR infra proves heavier than expected.
- **Static JSON via public function (considered, not chosen).** Keep the client
  island but `fetch()` a public Cloud Function returning the collections — off the
  Firestore SDK, so no App Check. Rejected: still JS-rendered (weaker SEO) and adds
  a function + hop for no gain over SSR.

The whole site is otherwise static, so SSR is applied as **hybrid rendering** —
two on-demand routes, everything else prerendered — to keep the blast radius tiny.

## Key Decisions

- **Hybrid, not full-site SSR.** `export const prerender = false` on
  `src/pages/speakers.astro` and `src/pages/sessions.astro` only; every other page
  stays static (`output: 'static'` default in Astro 7.1). Minimizes what runs on a
  server.
- **Runtime = `@astrojs/node` behind a 2nd-gen Cloud Function + Firebase Hosting
  `rewrites`.** Keeps the existing classic Hosting site (`devfest-public`) and the
  `dist` static deploy intact; a `rewrites` entry in `firebase.json` sends
  `/speakers` + `/sessions` to the SSR function (region `europe-west1`, isolated in
  the existing `"codebase": "website"`). **Rejected Firebase App Hosting** — it's a
  separate hosting product and migrating the whole site for two routes is
  disproportionate on a shared project.
- **Data via `firebase-admin` with ambient creds.** Add `firebase-admin` to the
  website package; the SSR function reads `speakers` / `sessions` via the Admin SDK
  (default service account → bypasses App Check + Firestore rules). No SA key
  needed at runtime (unlike SSG-in-CI). This is a *separate* admin init from
  `functions/src/lib/admin.ts` (different deployable, built from `src/`).
- **CDN caching is mandatory, not optional.** SSR responses set
  `Cache-Control: public, s-maxage=<~1h>, stale-while-revalidate` so Firebase
  Hosting's CDN serves most visitors an edge-cached response; only cache misses pay
  the render + Firestore read + cold start. Data changes ~daily, so a generous TTL
  is safe. Without this, cold starts could make mobile *worse* — this is the design
  point that makes SSR perform like SSG.
- **Client island becomes presentation-only.** The server passes the fetched
  `speakers` / `sessions` array as props to the hydrated React island; remove the
  `useEffect` + `onSnapshot` fetch from `Speakers.tsx` / `Sessions.tsx`. The detail
  modal keeps its interactivity but reads from props (speaker docs already embed
  bio/links/sessions, so nothing extra to fetch). Drop client-side live updates —
  unneeded for daily data.
- **Removes client Firestore entirely.** After this, no browser code reads
  Firestore (tickets = RTDB, invoice = callable). `firebase/firestore` can leave
  the client bundle, and App Check no longer initializes on the content path at all.
- **Enforcement sequencing.** Flip App Check enforcement ON for Firestore **only
  after** SSR is live and the client Firestore reads are removed — otherwise the
  client grid breaks the instant enforcement is toggled.
- **Graceful failure.** SSR fetch errors render the existing "temporarily
  unavailable" / "announced soon" states server-side (keep the status states),
  rather than throwing a 500.

## Open Questions

- **a11y CI path.** `npm run a11y` currently builds with `A11Y_MOCK=1`, aliasing
  the *client* `firebase/firestore|database|app-check` modules to fixtures
  ([`scripts/a11y-mocks/`](../../scripts/a11y-mocks/)) so axe audits populated
  content. With the read moved server-side, the mock must inject fixture data at
  the **server fetch** boundary instead. How — a build-time env flag that stubs the
  admin fetch, or fixture props? Needs redesign so the axe sweep still sees a
  populated grid.
- **PR preview channels.** `firebase-hosting-pull-request.yml` deploys **hosting
  only**, not functions. A per-PR preview of `/speakers` needs the SSR function
  available — either deploy the function on PR too, rewrite previews to the live
  function, or accept previews render stale/fallback. Decide during planning.
- **Local dev credentials.** `astro dev` runs the SSR route in Node and needs Admin
  creds locally — a service-account file via `GOOGLE_APPLICATION_CREDENTIALS`, or
  the Firestore emulator. Pick the dev-ergonomics story.
- **Adapter wiring specifics.** Exact `@astrojs/node` mode (middleware vs
  standalone) and how the Astro server handler is wrapped in the 2nd-gen function +
  the `firebase.json` `rewrites` shape. Confirm against current Firebase + Astro 7
  guidance during planning.
- **Cold-start budget.** Even CDN-cached, cache-miss cold starts add latency to the
  very metric we're fixing. Confirm acceptable p95 on cache miss; consider min
  instances if needed (cost vs. latency).
- **Shared-project safety.** Confirm the new function name + hosting rewrite don't
  collide with the mobile-app repo's deploys (the `"codebase": "website"` isolation
  should cover this — verify).
