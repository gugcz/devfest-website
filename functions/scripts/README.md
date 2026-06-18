# Invoice integration — local smoke tests

Verify your keys + the iDoklad / ti.to / Resend wiring **before deploying**.
These run the real client code against the real APIs.

## Setup

```bash
cp functions/.env.example functions/.env
# edit functions/.env — fill in the keys
```

⚠️ **Never commit `functions/.env`** (it is gitignored). Do not paste keys into chat or anywhere shared.

## Run

From the repo root (or `cd functions`):

```bash
npm --prefix functions run check          # read-only readiness — NO side effects
npm --prefix functions run check:idoklad  # iDoklad: OAuth + API (writes gated)
npm --prefix functions run check:tito     # ti.to: resolve releases + price (write gated)
npm --prefix functions run check:resend   # Resend: sends ONE real test email
```

Each command builds first, then runs with Node's native `--env-file=.env`.

## What's safe vs what writes

| Command | Default | With flag |
| ------- | ------- | --------- |
| `check` | read-only | — |
| `check:idoklad` | OAuth + read template | `CREATE=1` → real test contact + invoice · `SEND=1` → emails it to `TEST_EMAIL` |
| `check:tito` | read-only resolve + price | `CREATE_CODE=1` → mints a **real** 100%-off code |
| `check:resend` | **sends a real email** to `TEST_EMAIL` | — |

Examples:

```bash
CREATE=1 npm --prefix functions run check:idoklad          # create test invoice
CREATE=1 SEND=1 npm --prefix functions run check:idoklad   # + email it
CREATE_CODE=1 npm --prefix functions run check:tito        # mint a real test code
```

After write-tests, delete the test invoice/contact in iDoklad and the test code in ti.to.

## Readiness checklist

1. `npm run check` → `READY ✅` (iDoklad auth + a `company funded` release resolves).
2. `CREATE=1 SEND=1 npm run check:idoklad` → invoice created + email received.
3. `npm run check:resend` → discount-code email received (inbox, not spam → domain verified in Resend).
4. `CREATE_CODE=1 npm run check:tito` → code mints; redeem URL works on ti.to.

All four green → ready to deploy. Then set the same values as Cloud Functions
secrets/params (see the root README) — `.env` here is for local testing only.
