# 0008. Readers without script get the data as build-time HTML

- Status: accepted
- Date: 2026-10-19
- PR: [#476](https://github.com/gugcz/devfest-website/pull/476)

## Context

Assistants (ChatGPT, Claude, Perplexity), link readers and some crawlers
fetch HTML and run no script. The lineup, the programme, the workshops and
the prices reach the page only through islands reading `/api/*`
([0001](0001-browser-reads-through-cached-api.md)), so read without script
the site named the date and the venue and little else. The Event JSON-LD
offers were a hand-kept list that had gone stale.

## Decision

- `astro build` reads the public production `/api/lineup`, `/api/tickets`
  and `/api/workshops` once (`src/lib/static-api.ts`, extending
  [0006](0006-share-pages-built-from-the-live-lineup.md)). A failed read
  never fails the build; the page renders without that data.
- Each data page renders what the build read as plain HTML under its island,
  in a `.no-js` block that `html.js` hides before paint. A visitor with
  script sees only the island; the browser still reads only `/api/*`.
- The share pages carry the talk or speaker in their body, are indexed and
  are in the sitemap.
- The Event JSON-LD offers come from the ti.to releases on sale at build
  time.
- `/llms.txt` is built from the same reads.

## Consequences

- What a reader without script sees is as fresh as the last Hosting deploy,
  and says so ("as of <date>"); live seat counts stay out of it.
- A price, a sold-out wave or a talk change reaches assistants, and the
  JSON-LD `InStock`, only with the next deploy.
- The share pages still forward a browser to the sheet; a crawler that runs
  script may index the sheet's URL instead. The pages are for readers that
  run none.
- The build needs network access to devfest.cz; the accessibility build
  (`A11Y_MOCK=1`) reads nothing, so axe never sees these blocks.
