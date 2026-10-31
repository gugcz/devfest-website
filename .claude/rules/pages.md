---
paths:
  - "src/pages/**"
  - "src/routes/**"
  - "src/integrations/**"
  - "src/layouts/**"
  - "public/.well-known/**"
  - "astro.config.ts"
---

# Pages, SEO and app links

- Routes are file-based under `src/pages/`; the list is in
  [README.md](../../README.md#key-pages). A page a **feature flag** can
  remove lives under `src/routes/` (same nesting, same relative imports) and
  is injected by `src/integrations/feature-routes.ts` only while its flag in
  `src/site.config.ts` is on. A flag off removes the route, its sitemap
  entry, its menu and footer links, its `llms.txt` line, its FAQ items and
  its home-page section; `src/lib/flags.ts` (`enabled`, `enabledOnly`,
  `ticketsHref`, `unlink`) is how a template asks. Flags own routes, links
  and sections, never prose. `npm run flags-off` builds with flags off and
  fails on anything left behind. Flags and what needs what:
  `src/lib/features.ts`.
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
