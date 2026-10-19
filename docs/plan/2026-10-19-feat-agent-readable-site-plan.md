# Plan: an agent can answer from the site

Date: 2026-10-19. Branch: `claude/agentic-ready`.

## Why

ChatGPT, Claude, Perplexity and most link readers fetch HTML and run no
script. Read that way, devfest.cz states the date and the venue, but
`/speakers`, `/agenda` and `/workshops` say "loads with JavaScript", the
tickets section says "Opening the box office", the Event JSON-LD lists no
offer (its one hand-kept wave closed on 30 September), and the only static
pages with a talk or a speaker on them are `noindex` and out of the sitemap.
An assistant asked "who speaks at DevFest.cz" or "how much is a ticket" has
nothing to quote.

## Decisions

- **Build-time HTML, not a second data path.** The build already reads the
  production `/api/lineup` for the share pages (ADR 0006). It also reads
  `/api/tickets` and `/api/workshops` the same way and renders what it reads
  as plain HTML. The browser still reads only `/api/*` (ADR 0001).
- **A `.no-js` block per data page**, hidden under `html.js` (the class
  `BaseLayout` already sets before paint). A visitor with script sees the
  islands exactly as today; a reader without script gets the lineup, the
  programme, the workshops or the prices as text, stamped with the build
  date and pointing to the live source. Replaces the "loads with JavaScript"
  notes when there is data; the notes stay when the build read none.
- **Share pages carry the content and are indexed.** `/talks/<id>` and
  `/speakers/<id>` keep forwarding a browser to the sheet, and their body
  becomes the full talk or speaker (abstract, time, room, speakers; bio,
  talks). `noindex` goes, they get a self canonical and enter the sitemap.
- **Offers from ti.to.** The Event JSON-LD lists the releases on sale at
  build time from `/api/tickets` (gross CZK, as `priceDisplay()` shows),
  replacing the hand-kept `TICKET_WAVES`.
- **`/llms.txt`**, built as a static endpoint: the facts, the ticket waves,
  every page, every speaker and talk with its link. Cheap; whether a given
  assistant reads it is not something we control.
- **No source comments in the output.** The `<!-- -->` comments in `.astro`
  templates ship to every visitor and read as page text to an agent; they
  become `{/* */}`, which Astro drops.

## Steps

1. `src/lib/static-api.ts`: the build-time read (production `/api/*`,
   never throws, `A11Y_MOCK` reads nothing); `lineup-static.ts` uses it and
   also returns rooms; `tickets-static.ts` and the workshops read join it.
2. `.no-js` rule in `BaseLayout.scss`; `SpeakerIndex.astro`,
   `TalkIndex.astro`, `TicketIndex.astro` rendered on `/speakers`,
   `/agenda`, `/workshops` and home.
3. `Share.astro`: content body, indexable, canonical; sitemap filter.
4. Event JSON-LD offers from the build-time tickets.
5. `src/pages/llms.txt.ts`.
6. Template comments to `{/* */}`.
7. ADR 0008, rules (`pages.md`, `sessionize.md`), README key pages.
8. `npm run verify`; check the built HTML as text.
