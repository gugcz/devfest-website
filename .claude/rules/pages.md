---
paths:
  - "src/pages/**"
  - "src/layouts/**"
  - "public/.well-known/**"
  - "astro.config.mjs"
---

# Pages, SEO and app links

- Routes are file-based under `src/pages/`; the list is in
  [README.md](../../README.md#key-pages).
- **SEO.** `BaseLayout.astro`: meta, OG/Twitter, JSON-LD (Event + WebSite).
  Sitemap via `@astrojs/sitemap`. Share pages and `/invite/*` set their own
  OG image.
- `public/.well-known/apple-app-site-association` decides which devfest.cz
  links open the iOS app. List only paths the app has a route for.
