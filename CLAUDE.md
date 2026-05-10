# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# DevFest Website

Conference landing page for DevFest.cz 2026, built with Astro 6 and deployed to Firebase Hosting.

## Tech Stack

- **Framework:** Astro 6 with React islands (`@astrojs/react`)
- **Language:** TypeScript (strict mode)
- **Styling:** SCSS with CSS Modules for React components, global styles in `BaseLayout.astro`
- **Node:** >= 22.12.0

## Commands

| Command           | Action                   |
| ----------------- | ------------------------ |
| `npm run dev`     | Start dev server         |
| `npm run build`   | Build for production     |
| `npm run preview` | Preview production build |

No lint or test scripts are configured — TypeScript strict mode provides type safety.

## Architecture

### Pages & Routing

Three pages under `src/pages/` using Astro file-based routing:
- `/` — Main landing page (hero, countdown timer, newsletter form, footer)
- `/privacy-policy` — GDPR privacy policy
- `/newsletter-subscription-thank-you` — Post-signup confirmation

### Component Model

Static Astro components (`.astro`) for layout and non-interactive UI. React components (`.tsx`) with `client:load` for interactive features:
- `Countdown.tsx` — Live countdown to October 30, 2026, 9:00 AM CET; updates every second
- `NewsletterForm.tsx` — SmartEmailing integration for email capture with GDPR consent checkbox
- `Footer.tsx` — Social links (X, Facebook, Bluesky, LinkedIn, YouTube)
- `CookieBanner.astro` — Cookie consent stored in localStorage; dispatches `cookie-consent-accepted` DOM event

### Firebase Integration (`src/lib/firebase.ts`)

Firebase Analytics is initialized **only after cookie consent** — it listens for the `cookie-consent-accepted` custom event. Firebase Realtime Database is configured but not currently used. Deployment targets the `devfest-public` site in the `devfest-cz-app` project via `firebase.json`.

### ti.to Tickets pipeline

Visitor browsers read ticket data from RTDB `/tickets`. The static build never calls ti.to. Cloud Functions own all ti.to traffic.

```
functions/src/
├── index.ts                # top barrel — `export * from './<domain>/index.js'`
├── lib/admin.ts            # Admin SDK singleton (`db()` returns RTDB)
└── tickets/
    ├── index.ts            # domain barrel
    ├── params.ts           # secrets + string params (single source of truth)
    ├── tito-api.ts         # ti.to HTTP client + `projectRelease()`
    ├── tito-webhook.ts     # `verifyTitoSignature` + header constants + payload type
    ├── slack-client.ts     # `postToSlack()`
    ├── refresh-cache.ts    # `refreshTitoCache`
    ├── notify-purchase.ts  # `titoWebhook`
    └── daily-status.ts     # `dailyTicketStatus`
```

Functions exposed (region `europe-west1`):

| Name | Trigger | Effect |
| ---- | ------- | ------ |
| `refreshTitoCache` | `onSchedule('every 1 hours')` | Fetch releases → write RTDB `/tickets` |
| `titoWebhook` | `onRequest` (`invoker: 'public'`) | Verify `Tito-Signature` HMAC, post `ticket.completed` / `registration.finished` to Slack |
| `dailyTicketStatus` | `onSchedule('every day 09:00', Europe/Prague)` | Fetch live releases from ti.to and post sales summary to Slack |

Browser side: `src/components/Tickets.tsx` subscribes to `/tickets` via `firebase/database`'s `onValue`. `src/lib/tito.ts` holds browser-safe helpers (types, `filterDisplayable`, `checkoutUrl`, `formatPrice`). RTDB rules in `database.rules.json` (not wired into `firebase.json` — paste manually in console).

While the Tickets section is hidden on the site, `/tickets` is also locked down in `database.rules.json` (`.read: false`). Cloud Functions still write via Admin SDK (which bypasses rules), so the cache stays fresh and Slack notifications continue. **When the site launch is ready, flip `tickets.\".read\"` to `true` in the Firebase console (or in `database.rules.json` if you wire it into `firebase.json`).**

Conventions / gotchas:
- New function in existing domain: add file → re-export in `tickets/index.ts`. New domain: new folder same shape + `export * from './<domain>/index.js'` in `src/index.ts`.
- `params.ts` is the single source of truth for secrets/strings. Don't duplicate the table elsewhere.
- TS imports inside `functions/` use `.js` suffixes (NodeNext module resolution).
- `titoWebhook` reads `req.rawBody` (Buffer) for HMAC, not `req.body`.
- Visibility is enforced **at write time** in `refresh-cache.ts` via `isWebsiteVisible()` (`functions/src/tickets/tito-api.ts`). Keep: releases that are `state ∈ {live, on_sale}` AND `accessibility ∈ {public, undefined}` AND `sale_status ∈ {on_sale, sold_out}` (or `sold_out === true`). Drop everything else (drafts/archived/private/protected/paused/not_yet_on_sale/ended). Drops happen before write so unpublished release data never lands in the publicly readable `/tickets` node. The browser's `filterDisplayable` (`src/lib/tito.ts`) mirrors the rule as defence-in-depth.
- Surviving releases render either an "On sale" badge + Buy CTA (`releaseStatus()` returns `purchasable: true`) or a dimmed "Sold out" badge + disabled CTA. Buy URL pattern: `https://ti.to/<account>/<event>/with/<release-slug>`.
- Default Cloud Functions service account has the IAM to write RTDB; no explicit creds needed at runtime.
- The Firebase project (`devfest-cz-app`) is **shared with the mobile app repo**, which deploys its own functions to the same project. To keep deploys isolated, this repo declares `"codebase": "website"` in `firebase.json`. The app repo must use a **different** codebase name (e.g. `app`) and **different function names**, otherwise deploys overwrite each other. `firebase deploy --only functions` only touches codebases declared in the local `firebase.json`.

Deploy steps, secret setup, and ti.to/Slack wiring live in [README.md](README.md).

### Styling Conventions

- Global CSS variables (colors, fonts) defined in `BaseLayout.astro`
- React component styles use `.module.scss` files co-located with each component
- Design uses dark theme (`#050505` bg, `#F0EDE6` text, `#CC0000` accent), film grain overlay, scanlines, and atmospheric red glow animations

### SEO & Metadata

`BaseLayout.astro` handles all meta tags, Open Graph/Twitter Card, and JSON-LD structured data (Event + WebSite schemas). Sitemap auto-generated via `@astrojs/sitemap`.
