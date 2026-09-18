# Product

<!-- impeccable:product-schema 1 -->

Facts below were read out of the repository (`README.md`, `CLAUDE.md`,
`src/lib/event.ts`, page copy) without a maintainer interview. Every line is
**[inferred]** until the maintainer confirms it; edit in place, do not add a
second product record.

## Platform

web

## Users

- **[inferred]** Developers, geeks and tech enthusiasts in and around Prague
  deciding whether to attend a one-day conference, then buying a ticket.
- **[inferred]** Companies buying several tickets who must pay by bank
  transfer against an invoice (`/invoice`).
- **[inferred]** Speakers, press and partners checking programme, downloads
  and partnership terms (`/speakers`, `/press`, `/partners`).
- **[inferred]** Ticket holders on the day, reading the agenda on a phone
  (`/agenda`, `/attending`).

## Product Purpose

The landing site for **DevFest.cz 2026**, a community-built developer
conference and festival on **30 October 2026** at **Uhelný Mlýn** near Prague,
organised by **GUG.cz, z.s.** The site exists to sell tickets and to carry the
programme, speakers, venue and practical information. **[inferred]** Success
is ticket sales and newsletter sign-ups; the analytics conversion events are
the ticket CTA and the newsletter form.

## Positioning

**[inferred]** "The most original developer conference in Prague": one day,
one venue, a curated lineup across AI agents, generative UI, cloud and
backends, mobile and web accessibility, and the humans behind it. A festival
built by a community, not a vendor event.

## Operating Context

- Tickets are sold on **ti.to**; the site renders releases from a cached
  `/api/tickets` endpoint. Company invoices go through **iDoklad**, paid by
  bank transfer, then redeemed as a 100%-off ti.to code.
- The lineup is authored in **Sessionize** and mirrored daily into Firestore;
  the site reads `/api/lineup`.
- Hosting and functions are **Firebase**, project `devfest-cz-app`, shared
  with the mobile app.
- Analytics is GA4 behind Consent Mode; only consenting visitors are counted.
- **[inferred]** Most visitors arrive on a phone from social or the community
  newsletter; the ticket section must work on a slow mobile connection.

## Capabilities and Constraints

- Pages: home, agenda, sessions, speakers, tickets (on home), attending,
  invoice, partners, press and press downloads, team, FAQ, contact, newsletter
  thank-you, thank-you, 404, privacy policy, per-member `/invite/<member>`.
- Static Astro build with React islands only for data-backed behaviour.
  Browser data comes only from cached HTTP endpoints, never the Firebase
  client SDK.
- **Public repository.** No real attendee, partner or customer data ever
  enters the repo, fixtures or docs.
- Production is the `2026` branch; only the maintainer merges or deploys.
- Copy is English; Czech appears only in quoted press clippings.
- **Undecided:** whether the 2026 edition adds a second day or workshops
  track; nothing in the repo says so.

## Brand Commitments

- Name: **DevFest.cz**. Organiser credit: **GUG.cz, z.s.** (rebranded from
  GDG; never "GDG Czech Republic").
- Visual direction "noir, but loud": one dark theme, red accent, poster-scale
  Bebas Neue headlines. Only the brand faces in `astro.config.mjs` may be
  used; never add a font.
- The hero photograph (`/hero-detective.webp`) is the one plate, reframed per
  page.
- The design system in `DESIGN.md` is binding; `design/devfest.pen` is its
  visual companion.

## Evidence on Hand

- Real speakers and sessions arrive from Sessionize at runtime; local dev and
  a11y use fixtures in `scripts/a11y-mocks/api.mjs`. Do not invent speakers.
- Press clippings and logos under `public/press/`; partner logos under
  `public/partners/`.
- Event facts (date, venue, coordinates, `.ics`) in `src/lib/event.ts`.
- **Absent:** testimonials, attendance figures beyond what page copy states,
  pricing outside ti.to. Do not fabricate any of these.

## Product Principles

1. **One thing per page.** Every page has one action; the closer names it.
2. **Facts over hype.** Figures and dates come from `event.ts` or a live
   endpoint, never from copy.
3. **Works with the endpoint down.** Every data-backed section ships a
   fallback note.
4. **Cheap on a phone.** No client SDK on the critical path; islands are
   small and lazy where they can be.

## Accessibility & Inclusion

WCAG 2.2 AA. `npm run a11y` runs axe over every route at desktop and 375×812
and must report zero violations before a PR touching markup or styles.
Reduced-motion opt-outs on every animation.
