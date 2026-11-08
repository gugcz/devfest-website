---
paths:
  - "src/pages/**"
  - "src/routes/**"
  - "src/integrations/**"
  - "src/layouts/**"
  - "src/middleware.ts"
  - "scripts/archive.mjs"
  - "archive/**"
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
- **The root belongs to the next edition** (ADR 0011). With `edition` off
  the home page is `src/routes/teaser.astro` (`TeaserLayout`), stating only
  what `config.upcoming` announces: never a day, a venue or a price. Every
  path the edition owned answers 301 to `/<year>/…` from `firebase.json`
  (`redirects`). Hosting applies redirects before static files: turning
  `edition` back on means deleting the redirect of every path it reclaims.
- **Archives** (`archive/<year>/`) are frozen builds from
  `npm run archive -- <year>`; never edit one by hand. A build under a base
  path works because `src/middleware.ts` rebases root-relative URLs in
  rendered HTML; code the middleware never sees (islands, scripts, absolute
  URLs, `/api/*` reads) uses `withBase()`, `absoluteUrl()`, `liveUrl()` and
  `apiUrl()` from `src/lib/base.ts`. The middleware also gives every link
  between the two builds (live site ↔ archive) `data-astro-reload`, so
  `<ClientRouter />` never swaps one build's page into the other's
  document; and in an archive it points the live-only pages
  (`LIVE_ONLY_PATHS`: privacy policy, code of conduct) at the live site.
- **SEO.** `Head.astro` (shared by `BaseLayout` and `TeaserLayout`): meta,
  OG/Twitter, canonical, JSON-LD. `BaseLayout` adds Event (home only),
  Organization, WebSite, BreadcrumbList; the teaser Organization and
  WebSite only. Title and description name the edition's year.
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
