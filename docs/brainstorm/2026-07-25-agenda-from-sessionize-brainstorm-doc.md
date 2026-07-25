---
date: 2026-07-25
topic: agenda-from-sessionize
---

# Agenda / Schedule Page from Sessionize

## What We're Building

A new `/agenda` page rendering DevFest.cz 2026 as a **time × room timetable grid**
on desktop, degrading to a **time-ordered list** on mobile. It visualizes
scheduling data (`startsAt`, `endsAt`, `room`) that **already flows into the site
today** — the daily `refreshSessionize` Cloud Function mirrors Sessionize into
Firestore `sessions`/`speakers`, exposed via the cached `/api/lineup` endpoint —
but which **no existing UI renders**. This is a presentation feature over
existing data, not a new data source.

The grid places sessions **proportionally against real clock time** (row height
maps to minutes; each session spans its actual start→end so rooms align
visually). Breaks, lunch, registration, and the keynote render as **full-width
bands** across all room columns. The page **auto-hides** (page + nav link) until
at least one displayable session has a `startsAt`, since Sessionize times are
empty until the org schedules — no manual toggle. It **complements** the existing
`/sessions` browse page; tapping a grid cell reuses the existing
`SessionDetail` modal, and the two pages cross-link. Web agenda is **read-only**
— favoriting / "my schedule" lives in the mobile app, so no accounts, auth, or
localStorage state on the website.

## Why This Approach

**Data source is already solved.** The initial read of "agenda *from Sessionize*"
suggested wiring a new integration, but project research confirmed Sessionize is
already the org's source of truth and the sync/caching pipeline
(`functions/src/sessionize/` → Firestore → `/api/lineup` → `src/lib/lineup.ts`)
is live. The session doc shape already carries `startsAt`/`endsAt`/`room`/
`roomId`/`isServiceSession`/`isPlenumSession`. So the work is almost entirely UI +
exposing a few already-persisted fields through the browser-side `Session` type.

**Time × room grid** was chosen over a time-ordered list or per-room tabs because
DevFest runs parallel tracks and attendees need to compare what's on across rooms
at a glance — the classic conference-schedule mental model. Its known weakness
(mobile) is handled by collapsing to a single time-ordered list below a
breakpoint rather than forcing a matrix onto a phone.

**Proportional (minute-accurate) placement** was chosen over discrete named
time-slots because real Sessionize data has rooms starting/ending at odd offsets
and talks of different lengths (25 vs 45 min). Slot-bucketing misaligns and can't
express duration; a minute-mapped CSS Grid stays truthful and handles overlaps.
The extra layout logic is contained and worth the fidelity.

**Reuse over rebuild.** Complementing `/sessions` and reusing `SessionDetail`
keeps the search/facet UX where it already works and avoids a second detail
surface — the boring, consistent path. Read-only v1 (favoriting deferred to
mobile, per maintainer) removes auth/state/empty-state complexity entirely.

## Key Decisions

- **New `/agenda` page, not a data integration**: Sessionize→Firestore→`/api/lineup`
  is already live; this is a UI over existing fields. Rationale: research showed
  the pipeline and scheduling fields already exist and are unrendered.
- **Layout: time × room grid (desktop)**: parallel-track comparison is the core
  use case for a conference agenda.
- **Mobile: collapse to time-ordered list**: room-labeled single column below a
  breakpoint; a matrix is unusable on a phone and this site is mobile-heavy.
  One shared data model drives both views.
- **Service/plenum sessions shown as full-width bands**: breaks, lunch,
  registration, keynote span all columns. Rationale: a real timetable needs the
  connective tissue; these are currently filtered out of `/sessions` and must be
  opted back in for the agenda.
- **Proportional minute-accurate time placement**: rows map to clock minutes,
  sessions span by actual duration. Rationale: real data has uneven offsets/
  lengths that discrete slots can't represent honestly.
- **Auto-hide until scheduled**: page + nav link appear only once ≥1 displayable
  session has a `startsAt`; no manual flag. Rationale: Sessionize times are empty
  for weeks pre-event; least ongoing maintenance, no half-empty grid.
- **Read-only on web; favoriting lives in the mobile app** (maintainer decision):
  no accounts, auth, or localStorage. Rationale: removes the largest chunk of
  scope; personalization is a mobile concern.
- **Complement `/sessions`, reuse `SessionDetail` modal**: keep browse/search on
  `/sessions`, add the time view on `/agenda`, cross-link, tap-to-open the
  existing modal. Rationale: maximum reuse, minimum new surface.

## Open Questions

Data / model:
- **Field exposure**: browser `Session` type (`src/lib/sessions.ts`) currently
  drops `roomId` and the `/sessions` view filters out service sessions via
  `isDisplayableSession`. The agenda needs `startsAt`/`endsAt`/`room` (present)
  plus service/plenum sessions and possibly `roomId`. Decide in planning: relax
  the browser `Session` shape + provide an agenda-specific filter (keep service
  sessions) without disturbing `/sessions`.
- **Room ordering**: is there a canonical room order/name list from Sessionize,
  or do we derive column order from the data (e.g. first-seen / alphabetical /
  `roomId`)? Affects column stability.
- **Time zone**: `startsAt`/`endsAt` are ISO strings — confirm they're
  Europe/Prague (or carry offset) and render in event-local time, not the
  visitor's browser zone. (Note the site's countdown uses CET.)
- **Overlaps within a single room**: does Sessionize ever schedule two sessions
  in the same room with overlapping times? Decide whether the grid must handle
  side-by-side splitting or can assume one-per-room-per-slot.

UX / detail:
- **Empty-column / gap rendering**: how to render a room column with a gap
  between talks, and whether to visually mark "nothing here."
- **"Now" indicator**: on event day, show a live current-time line? (Small,
  possibly a fast-follow.)
- **Filtering on the agenda**: any track/level filter on the grid, or keep
  filtering entirely on `/sessions`? (Leaning none for v1.)
- **Nav placement + label**: where in `Menu.astro` — "Agenda" vs "Schedule" —
  and adjacency to Sessions.

Ops:
- **Auto-hide mechanism**: computed at build time (Astro static) vs client-side
  after `/api/lineup` fetch. Since content is fetched client-side today,
  the nav link visibility + page empty-state likely both key off the same
  "has any scheduled session" check in the island. Confirm in planning.
