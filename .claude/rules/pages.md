---
paths:
  - "src/pages/**"
  - "src/layouts/**"
  - "public/.well-known/**"
  - "astro.config.ts"
---

# Pages, SEO and app links

- Routes are file-based under `src/pages/`; the list is in
  [README.md](../../README.md#key-pages).
- **SEO.** `BaseLayout.astro`: meta, OG/Twitter, JSON-LD (Event, Organization, WebSite, BreadcrumbList).
  Event offers come from `/api/tickets` at build time (`tickets-static.ts`).
  Sitemap via `@astrojs/sitemap`. Share pages and `/invite/*` set their own
  OG image.
- **Readers without script** (assistants, link readers) get the data as
  build-time HTML: `SpeakerIndex`, `TalkIndex`, `TicketIndex` in a `.no-js`
  block under the island, and `/llms.txt` (`src/pages/llms.txt.ts`). A page
  that adds an island over data adds its `.no-js` text too
  ([ADR 0008](../../docs/adr/0008-agent-readable-build-time-html.md)).
- Template comments are `{/* */}`, never `<!-- -->`: HTML comments ship to
  every visitor and read as page text to an agent.
- `public/.well-known/apple-app-site-association` decides which devfest.cz
  links open the iOS app. List only paths the app has a route for.
