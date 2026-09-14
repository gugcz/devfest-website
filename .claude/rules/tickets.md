---
paths:
  - "functions/src/tickets/**"
  - "src/lib/tito.ts"
  - "src/components/Tickets.tsx"
  - "src/components/InvoiceForm.tsx"
---

# ti.to tickets

Functions own all ti.to traffic; static build never calls it. Browser reads
`/api/tickets`. Helpers in `src/lib/tito.ts`. `database.rules.json` is not
wired into `firebase.json` — paste into the console.

- `ticketsWebhook` reads `req.rawBody` for HMAC.
- ti.to v3.0 has no `sale_status` field — a flag set (`sold_out`, `off_sale`,
  `expired`, `upcoming`, `archived`, `locked`, `secret`). `deriveSaleStatus`
  synthesises one string. Dates: `start_at` / `end_at`.
- Only `secret` releases are dropped (`isWebsiteVisible()` at write time;
  `filterDisplayable` again in the browser). Every other state renders a badge.
  `paused` + zero sales → "Coming soon" (`releaseStatus()`).
- Buy URL: `https://ti.to/<account>/<event>/with/<release-slug>`.
- Project is shared with the mobile app repo: keep `"codebase": "website"`
  and unique function names.
