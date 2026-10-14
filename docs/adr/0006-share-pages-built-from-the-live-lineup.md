# 0006. Talk and speaker share pages are built from the live lineup

- Status: accepted
- Date: 2026-10-06
- PR: [#442](https://github.com/gugcz/devfest-website/pull/442)

## Context

A link to one talk or one speaker should unfurl with that talk's or speaker's
own title and description in Slack, social networks and messengers. Link
previewers do not run JavaScript, and the lineup reaches the browser only
through `/api/lineup` ([0001](0001-browser-reads-through-cached-api.md)).

## Decision

- `astro build` reads the public production `/api/lineup` once
  (`src/lib/lineup-static.ts`; `DEVFEST_LINEUP_URL` points it elsewhere) and
  emits static `/talks/<id>` and `/speakers/<id>` pages carrying the meta
  tags, which then forward to the sheet (`/agenda?talk=`,
  `/speakers?speaker=`).
- The read never fails the build: on error no share pages are built.
- `404.astro` forwards share links for anything added since the last build,
  so the link still opens, with the site's own preview.

## Consequences

- A preview is as fresh as the last Hosting deploy, not the 15-minute sync.
- The build needs network access to devfest.cz; the accessibility build
  (`A11Y_MOCK=1`) skips the pages.
