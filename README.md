# DevFest.cz 2026

The most original developer conference in Prague is back.

![DevFest.cz 2026](public/og-image.jpg)

DevFest.cz 2026 is a community-built conference and festival for developers, geeks, and tech enthusiasts focusing on Web/Mobile Development, Cybersecurity, AI/ML, and more — happening **October 30, 2026** in Prague, Czech Republic.

## Tech Stack

- **Framework:** [Astro](https://astro.build/) 6
- **Language:** TypeScript (strict mode)
- **Styling:** Sass
- **UI:** React 19 (interactive islands)
- **Backend:** Firebase
- **Node:** >= 22.12.0

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## ti.to Tickets — Cloud Functions + RTDB cache

The "Get your ticket" section is rendered client-side from a Firebase Realtime Database cache. The static build never calls ti.to, and a scheduled Cloud Function keeps the cache fresh.

```
Cloud Scheduler (every 1 h, Europe/Prague)
  └─> Cloud Function `refreshTitoCache` (europe-west1)
        ├─ fetch  https://api.tito.io/v3/<acc>/<evt>/releases
        └─ write  RTDB /tickets = { releases, accountSlug, eventSlug, fetchedAt }

Browser
  └─> Tickets.tsx (client:load)
        └─ subscribe RTDB /tickets via firebase/database onValue
```

The Blaze plan is required for scheduled functions and Secret Manager.

### Configure & deploy the functions

```bash
# Install function deps
npm --prefix functions install

# Set secrets (one-time each)
firebase functions:secrets:set TITO_API_TOKEN          # ti.to admin API
firebase functions:secrets:set TITO_WEBHOOK_SECRET     # ti.to webhook security token
firebase functions:secrets:set SLACK_WEBHOOK_URL       # Slack incoming-webhook URL

# Set ti.to slugs as non-secret params (functions/.env.devfest-cz-app)
echo 'TITO_ACCOUNT_SLUG=your-account' >> functions/.env.devfest-cz-app
echo 'TITO_EVENT_SLUG=your-event'      >> functions/.env.devfest-cz-app

# Deploy
firebase deploy --only functions

# Trigger an immediate ticket-cache refresh (otherwise wait up to an hour)
gcloud functions call refreshTitoCacheNow --region europe-west1
```

The default Cloud Functions service account has the IAM needed to write RTDB; no extra service-account JSON is required at runtime.

### Functions

| Name | Trigger | Purpose |
| ---- | ------- | ------- |
| `refreshTitoCache` | Cloud Scheduler, hourly | Sync ti.to releases → RTDB `/tickets` |
| `refreshTitoCacheNow` | HTTPS, `invoker: private` | Ad-hoc cache refresh for project members |
| `titoWebhook` | HTTPS, public | Verifies `Tito-Signature` and posts purchase notifications to Slack |
| `dailyTicketStatus` | Cloud Scheduler, `09:00 Europe/Prague` | Fetches live releases from ti.to and posts a sales summary to Slack |

Wire up the webhook in ti.to → Customize → Webhook Endpoints:
1. Paste the deployed `titoWebhook` URL.
2. Copy ti.to's security token into `TITO_WEBHOOK_SECRET` (Secret Manager).
3. Subscribe at least to `ticket.completed` and `registration.finished`.

### RTDB rules

`database.rules.json` documents the required rules: `/tickets` publicly readable, everything else locked. Either paste it into the Firebase console, or add `"database": { "rules": "database.rules.json" }` to `firebase.json` and run `firebase deploy --only database`.

### Filtering

Only releases with `state` of `live`/`on_sale` and `sale_status` of `on_sale` or `sold_out` are displayed. Drafts, paused, ended, and not-yet-on-sale releases are filtered out client-side.

## Project Structure

```
src/
  pages/        # File-based routing (.astro pages)
  components/   # Reusable UI components
  layouts/      # Page layouts
public/         # Static assets (images, favicon, etc.)
astro.config.mjs
tsconfig.json
```

## Key Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with countdown and newsletter signup |
| `/privacy-policy` | GDPR privacy policy |
| `/newsletter-subscription-thank-you` | Post-signup confirmation |

## Links

- Website: [devfest.cz](https://devfest.cz)
- Last year's edition: [2025.devfest.cz](https://2025.devfest.cz)
