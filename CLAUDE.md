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
    ├── refresh-cache.ts    # `refreshTitoCache`, `refreshTitoCacheNow`
    ├── notify-purchase.ts  # `titoWebhook`
    └── daily-status.ts     # `dailyTicketStatus`
```

Functions exposed (region `europe-west1`):

| Name | Trigger | Effect |
| ---- | ------- | ------ |
| `refreshTitoCache` | `onSchedule('every 1 hours')` | Fetch releases → write RTDB `/tickets` |
| `refreshTitoCacheNow` | `onRequest` (`invoker: 'private'`) | Same as above, ad-hoc |
| `titoWebhook` | `onRequest` (`invoker: 'public'`) | Verify `Tito-Signature` HMAC, post `ticket.completed` / `registration.finished` to Slack |
| `dailyTicketStatus` | `onSchedule('every day 09:00', Europe/Prague)` | Fetch live releases from ti.to and post sales summary to Slack |

Browser side: `src/components/Tickets.tsx` subscribes to `/tickets` via `firebase/database`'s `onValue`. `src/lib/tito.ts` holds browser-safe helpers (types, `filterDisplayable`, `checkoutUrl`, `formatPrice`). RTDB rules in `database.rules.json` (not wired into `firebase.json` — paste manually in console).

Conventions / gotchas:
- New function in existing domain: add file → re-export in `tickets/index.ts`. New domain: new folder same shape + `export * from './<domain>/index.js'` in `src/index.ts`.
- `params.ts` is the single source of truth for secrets/strings. Don't duplicate the table elsewhere.
- TS imports inside `functions/` use `.js` suffixes (NodeNext module resolution).
- `titoWebhook` reads `req.rawBody` (Buffer) for HMAC, not `req.body`.
- Filter rule for displayed releases (`filterDisplayable` in `src/lib/tito.ts`): `state ∈ {live, on_sale}` AND `accessibility ∈ {public, undefined}`. Drafts/archived are hidden via state; `private` ("Sales link only") and `protected` releases are hidden via accessibility. Any `sale_status` is shown with a status badge (on sale / sold out / paused / coming soon / ended). Buy CTA enabled only when `purchasable` (`releaseStatus()`). Buy URL pattern: `https://ti.to/<account>/<event>/with/<release-slug>`.
- Default Cloud Functions service account has the IAM to write RTDB; no explicit creds needed at runtime.

Deploy steps, secret setup, and ti.to/Slack wiring live in [README.md](README.md).

### Styling Conventions

- Global CSS variables (colors, fonts) defined in `BaseLayout.astro`
- React component styles use `.module.scss` files co-located with each component
- Design uses dark theme (`#050505` bg, `#F0EDE6` text, `#CC0000` accent), film grain overlay, scanlines, and atmospheric red glow animations

### SEO & Metadata

`BaseLayout.astro` handles all meta tags, Open Graph/Twitter Card, and JSON-LD structured data (Event + WebSite schemas). Sitemap auto-generated via `@astrojs/sitemap`.
