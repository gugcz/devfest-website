---
date: 2026-07-07
topic: speakers-lineup
---

# Speakers Lineup

## What We're Building

A dedicated `/speakers` page for DevFest.cz 2026 showing the confirmed speaker
lineup as a film-noir photo grid (matching the `/team` crew cards). Each card is
static and short: headshot, name, tagline (title @ company), and social links —
no bio modal, no per-speaker detail view.

Speaker data is **sourced from Sessionize** (the org's speaker/session platform,
the source of truth) and mirrored into **Cloud Firestore** by a scheduled Cloud
Function that runs **once a day**. The browser reads a public `speakers`
collection live from Firestore. Headshots are served directly from Sessionize's
CDN (`profilePicture` URLs); the noir black-and-white look is a CSS `grayscale`
filter, not Firebase Storage.

## Why This Approach

The upstream is Sessionize, so the write side is a near-exact copy of the
existing `refreshTitoCache` pipeline: a scheduled fetch that normalizes the
Sessionize JSON and writes it to a Firebase datastore for the browser to read.
The one deliberate divergence from the tickets pipeline is the datastore:
**Firestore instead of RTDB.** Firestore is already provisioned (it backs
`invoices`), gives structured per-speaker documents, and makes ordering explicit
and reliable via an `order` field (RTDB object keys have no guaranteed order).
The tradeoff — accepted — is more browser-side setup than reusing the `/tickets`
RTDB read path:

- **Write side** mirrors `functions/src/tickets/` — a new `functions/src/speakers/`
  domain. `functions/src/lib/admin.ts` already exposes `firestore()` (used by the
  invoice pipeline), so the sync function writes speaker docs via the Admin SDK
  (which bypasses security rules). Each run upserts the current Sessionize
  speakers and deletes docs no longer present, keyed by Sessionize speaker id.
- **Read side is new** (this is the cost of choosing Firestore): the client
  Firestore SDK is **not** initialized browser-side today — only Cloud Functions
  use Firestore. `src/lib/firebase.ts` must add `getFirestore` on the existing
  App-Check-initialized app, and `Speakers.tsx` reads the `speakers` collection
  ordered by `order`.
- **Security-critical rule change:** `firestore.rules` currently **denies all**
  client access to protect invoice PII. This must open a **scoped** public read
  on the `speakers` collection **only** (`allow read: if true; allow write: if
  false`) while leaving `invoices` (and the default) denied. Like
  `database.rules.json`, `firestore.rules` is **not** wired into `firebase.json`
  (shared project — auto-deploy would clobber the mobile app's ruleset), so the
  rule change is pasted into the Firebase console by hand.
- **Photos** — Sessionize hosts headshots, so Firebase Storage (an earlier pick,
  made before Sessionize was on the table) is dropped entirely. Zero new infra.

Rejected along the way: static TS array (no live edits), RTDB (user prefers
Firestore's structured docs + explicit ordering; the RTDB read path is more
proven but the user chose Firestore), Firebase Storage for photos (Sessionize CDN
makes it redundant — see verification below), a click-to-expand bio modal
(a11y/focus-trap cost for little gain on a lineup page), and any manual-console or
admin-form write path (the daily Sessionize sync replaces it).

## Verified (this session)

Real Sessionize API responses were fetched to de-risk the design:

- **Endpoint:** `https://sessionize.com/api/v2/{id}/view/Speakers` — no auth, GET,
  server-cached ~5 min. The `{id}` endpoint **must be created as JSON format with
  the Speakers view**; an id created as an embed returns HTML, not JSON (both
  observed live).
- **Speaker fields present:** `id` (GUID), `firstName`, `lastName`, `fullName`,
  `bio`, `tagLine`, `profilePicture`, `isTopSpeaker`, `links[]`
  (`{title, url, linkType}`), `sessions[]` (`{id, name}`), `questionAnswers[]`,
  `categories[]`.
- **`profilePicture` is a usable absolute URL** — e.g.
  `https://cdn.sessionize.com/image/8db9-400o400o1-test4.jpg` (pre-cropped
  400×400). The CDN image returns `HTTP 200 image/jpeg`, `server: BunnyCDN` (CZ1
  edge — Czech-local), `access-control-allow-origin: *`, `cache-control: public,
  max-age≈1yr`, and serves 200 even with a foreign `Origin` header — **no hotlink
  protection**. Direct `<img src>` off the Sessionize CDN is confirmed safe;
  grayscale CSS applies normally.

## Key Decisions

- **Scope: speakers lineup only.** Not a sessions/agenda/schedule view, not
  Call-for-Speakers. The disabled CFP block in `index.astro:81-102` stays out of
  scope. Session titles from Sessionize are available but excluded from v1 cards.
- **Placement: dedicated `/speakers` page** + a nav entry in `Menu.astro`. No
  landing-page teaser for v1.
- **Data store: Firestore `speakers` collection, public read.** Scoped rule opens
  read on `speakers` only; writes blocked (Admin SDK bypasses). Init client
  Firestore SDK in `src/lib/firebase.ts`. Paste `firestore.rules` changes into the
  console by hand (not wired into `firebase.json`).
- **Source of truth: Sessionize, daily scheduled sync.** New `functions/src/
  speakers/` domain mirroring the tickets domain: `params.ts` (Sessionize JSON
  endpoint id), `sessionize-api.ts` (fetch + normalize the Speakers view),
  `refresh-speakers.ts` (`onSchedule` daily, `europe-west1`, upsert Firestore
  `speakers` + delete stale docs), `index.ts` barrel + `export *` from
  `functions/src/index.ts`. TS imports use `.js` suffixes (NodeNext).
- **Photos: Sessionize `profilePicture` URLs, stored on the doc, rendered direct.**
  No Firebase Storage. Noir B&W via CSS `grayscale` (runtime `<img>`, not the
  Astro build-time image pipeline). Verified usable above.
- **Card: static, short info.** Headshot + name + tagline + social links; bio
  omitted/not expanded. Cursor colour-bleed hover to match the approved `/team`
  noir treatment. Mirror `team.scss` `.crew-grid`
  (`repeat(auto-fill, minmax(220px, 1fr))`).
- **Ordering: preserve Sessionize's own order** via an explicit `order` integer
  field (index in the Sessionize array), queried `orderBy('order')`. No keynote
  featuring, no client re-sort — the org controls order in Sessionize.
- **Component: React island `Speakers.tsx`** (`client:visible`) reading Firestore
  (`onSnapshot`/`getDocs` on `collection(db,'speakers')`, `orderBy('order')`),
  with `src/lib/speakers.ts` holding browser-safe types + helpers. Reuse the
  `loading/ready/empty/error` state shape from `Tickets.tsx`; empty state =
  "Lineup announced soon" (echoing current FAQ copy).
- **Design guardrails:** 4 fonts only (Bebas Neue, IM Fell English, JetBrains
  Mono, Special Elite), cinematic film-noir system, no page-only gimmicks.
  Follows the `/team` bar (PR #184).

## Open Questions

- **Sessionize event + JSON endpoint:** Does DevFest.cz 2026 already have a
  Sessionize event, and has a **JSON + Speakers** API endpoint id been created
  (not an embed id)? Hard dependency to build. Provide the id.
- **Endpoint id as string param vs secret:** Sessionize ids are unauthenticated
  but "should be treated as sensitive" per their docs. Decide string param in
  `speakers/params.ts` (consistent with tickets) vs a Secret Manager secret.
- **Sync time:** Pick the daily schedule (e.g. `every day 06:00`, `Europe/Prague`).
- **Stale-doc cleanup strategy:** Confirm the delete-missing approach (query all,
  diff against the fresh Sessionize id set, batch-delete absent docs) vs a
  `syncedAt` marker + sweep. Keyed by Sessionize speaker id as the Firestore doc id.
- **Social link mapping:** Map Sessionize `links[].linkType` (Twitter, LinkedIn,
  blog, company_website, etc.) to the icon set already used in `Footer.tsx`;
  decide fallback for unknown link types.
- **App Check posture on Firestore:** Confirm whether to enforce App Check on the
  `speakers` reads. Tickets keep RTDB enforcement off until traffic is verified —
  decide the same posture here (token attaches; enforcement is a later toggle).
- **Tagline source:** Use Sessionize `tagLine` verbatim, or compose from
  title/company? Confirm what the org fills in.
