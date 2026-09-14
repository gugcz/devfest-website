---
paths:
  - "functions/src/invoice/**"
  - "src/components/InvoiceForm.tsx"
  - "src/pages/invoice.astro"
---

# Invoices (iDoklad)

`/invoice` → `submitInvoiceCallable` → Firestore `invoices/{id}` →
`processInvoiceTrigger` (iDoklad contact + invoice + email) →
`pollPaidInvoicesScheduled` hourly (no iDoklad webhooks) → paid → 100%-off
ti.to code. Browser never touches Firestore.

- Both stages claim the doc first (`claimInvoiceForIssuing` pending→
  processing, `claimInvoiceForProcessing` invoiced→processing): triggers
  are at-least-once, a replay must never mint a second invoice or code.
- `PaymentStatus`: Unpaid=0, **Paid=1**, PartialPaid=2, **Overpaid=3**.
  Completion flips to `completed`, so each invoice is processed once.
- OAuth client credentials at `https://identity.idoklad.cz/server/connect/token`
  (`scope=idoklad_api`, only `client_id`+`client_secret`; not the v2 endpoint).
  ~2h token, no refresh, cached. API `https://api.idoklad.cz/v3`; responses
  wrapped `{ Data, IsSuccess, Message }`, `unwrap()` peels.
- **`IsSuccess` is the verdict, not HTTP status** — iDoklad returns 200 for
  refusals. Everything goes through `unwrap()`/`apiJson()`.
- Invoice = `GET /IssuedInvoices/Default` → override `PartnerId`/`Items`/
  `DateOfMaturity` → POST (drop readonly `Prices`). Contacts likewise via
  `GET /Contacts/Default`.
- Line `UnitPrice` is net, `PriceType=1`, `VatRateType=1` (21 %) or `2` when
  `INVOICE_VAT_RATE=0`. CZK only, no FX.
- `findOrCreateContact` matches on IČO and PATCHes the submitted email +
  address (non-empty fields only), returning `{ id, emailSynced }`.
  `OtherRecipients` = `[doc.email]` only when `emailSynced` is false.
- `invoiceEmailSent: true` requires iDoklad `IsSuccess: true`. Log field is
  `idokladMessage`, not `message` (logger overwrites it). Addresses masked via
  `maskEmail`.
- Invoice mail: `POST /Mails/IssuedInvoice/Send`, plain-text body
  (`buildInvoiceEmail`). Discount code: Admin API `POST /discount_codes`
  wrapped under `discount_code`, scoped to releases matching
  `INVOICE_RELEASE_MATCH`. Discount mail via Resend, optional.
- `firestore.rules` denies all clients; not wired into `firebase.json`.
- `submitInvoiceCallable` has `enforceAppCheck: true`; `cors` lists
  devfest.cz + PR previews only.
- `invoiceRateLimits` docs carry `expiresAt` for a Firestore TTL policy
  (project config, not code).
- Both mails' copy in `email.ts`; HTML shell in `email-template.ts` (tables,
  inline styles, hex, VML, no webfonts; every interpolation escaped).
