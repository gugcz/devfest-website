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
- **[inferred]** Speakers, press and partners checking the agenda, downloads
  and partnership terms (`/speakers`, `/contact#press`, `/press/downloads`, `/partners`).
- **[inferred]** Ticket holders on the day, reading the agenda on a phone
  (`/agenda`, `/attending`), and saving a seat at a workshop (`/workshops`).

## Product Purpose

The site of **DevFest.cz**, a community-built developer conference and
festival organised by **GUG.cz, z.s.** The root always belongs to the
current or next edition, and every past one lives on at `/<year>`
([ADR 0011](adr/0011-root-for-the-next-edition-archives-under-the-year.md)).
Today the root is **DevFest.cz 2027**: fall 2027, Prague, no date or venue
announced, its agenda, sale and venue behind feature flags until they
are ready. **DevFest.cz 2026** (30 October 2026, Uhelný Mlýn in
Libčice nad Vltavou) is a frozen archive at `/2026`. While an edition is on,
the site exists to sell tickets and to carry the agenda, speakers, venue and
practical information; between editions, to keep the domain's audience and
collect newsletter sign-ups. **[inferred]** Success
is ticket sales and newsletter sign-ups; the analytics conversion events are
the ticket CTA, the ti.to thank-you page, the newsletter form and the
company invoice request.

## Positioning

**[inferred]** A developer conference & festival in Prague (never "Prague's
developer conference"): a curated lineup across AI agents, generative UI,
cloud and backends, mobile and web accessibility, and the humans behind it.
A festival built by a community, not a vendor event. The length of the 2027
edition is not announced; copy never says "one day".

## Operating Context

- Tickets are sold on **ti.to**; the site renders releases from a cached
  `/api/tickets` endpoint. Company invoices go through **iDoklad**, paid by
  bank transfer, then redeemed as a 100%-off ti.to code.
- The lineup is authored in **Sessionize** and mirrored into Firestore once a
  day; the site reads `/api/lineup`.
- Workshop seats are opened by hand in RTDB; ticket holders sign in with the
  mobile app's ticket login to register.
- Hosting and functions are **Firebase**, project `devfest-cz-app`, shared
  with the mobile app.
- Analytics is GA4 behind Consent Mode; only consenting visitors are counted.
  "Cookie settings" (footer, privacy policy §3) withdraws or changes the
  choice at any time.
- **[inferred]** Most visitors arrive on a phone from social or the community
  newsletter; the ticket section must work on a slow mobile connection.

## Capabilities and Constraints

- **The yearly switch.** When an edition is over, `npm run archive`
  freezes it into `archive/<year>/` (its lineup, speaker photos and facts
  included) and `config.event` moves to the next edition, its day, venue and
  audience unset until announced. Feature flags hide what the next edition
  does not have yet (`lineup`, `venue`, `tickets`, `invoice`, `workshops`,
  `invite`, `partners`, `attending`); their paths answer 302 to the
  archive's copy, the per-edition share pages 301. The archive is indexed,
  in the sitemap and linked from every footer. Older editions (2025, 2019,
  2018, 2017) still live on their own subdomains.
- **The home page** (`/`): the design's stage over the painted aether (the
  DF27 logo, "Fall 2027" lettered in brass until there is a day, the
  tagline, a solid portal to the newsletter or, during the sale, to the
  tickets, and a framed portal to `/2026`), then on the veil: what
  DevFest.cz is and what is announced (when, where, language), the sections
  the flags have on (tickets, speakers, partners), 2026 in figures (from the
  archive's facts and frozen lineup) with prints from past editions, the
  app (flag `app`), the newsletter. JSON-LD is `Organization` and `WebSite`, plus `Event`
  once the day is set.
- Pages today: home, FAQ, contact, code of conduct, privacy policy,
  delete-account (the app's store listing), newsletter thank-you, 404,
  `/llms.txt`; `/login/<code>` (the app's sign-in link). The team, the
  press kit and the coverage wait for 2027's (`team`, `press` off; their
  paths redirect to `/2026`). The mobile
  app is not promoted on the web until it carries 2027 (`app` off, `/app`
  redirects home). Behind flags until the edition has them: agenda (with every talk), speakers and the share pages
  per talk and speaker, `/sessions`, `/tv` (venue screens), venue,
  tickets (on home) and `/thank-you`, invoice, workshops, partners,
  attending and `/speaker-card`, `/invite/<member>`; `/calendar.ics` once
  there is a day. Every flag: `src/site.config.ts`, `docs/adapting.md`. The
  2026 edition took place on 30 October 2026; its archive at `/2026`
  carries the agenda, the speakers, the venue and the partners, with no
  sale, sign-up, app page or newsletter form.
- Navigation: the DF27 mark (on the home page only once the stage has
  scrolled away); at 1100px and wider the destinations sit inline in the
  header (Speakers, Agenda, Venue while their flags are on, FAQ, then
  Partners, Team, Press, Contact) beside a brass Tickets button while
  tickets are on sale; narrower, they live behind one menu toggle. The footer lists every public page except `/workshops`
  (linked from the agenda), `/press/downloads` (linked from the press
  band) and `/delete-account` (linked from the privacy policy).
- Subpages open on a centred title and a factual lede, no photograph;
  section heads are brass rubrics. Content sits on the veil, in square ink
  plates where it groups (FAQ answers, contact desks, team members, next
  steps). Every button is the inked portal; every other action is a text
  link in the label voice.
- Static Astro build with React islands only for data-backed behaviour.
  Browser reads come only from cached HTTP endpoints, never the Firebase
  client SDK; writes go through App Check-gated callables.
- **Public repository.** No real attendee, partner or customer data ever
  enters the repo, fixtures or docs.
- Production is the `2026` branch; only the maintainer merges or deploys.
- Copy is English; Czech appears only in quoted press clippings.
- Workshops run alongside the talks with limited seats (`/workshops`). 2026
  was one day; 2027's length is not announced.

## Brand Commitments

- Name: **DevFest.cz**. Organiser credit: **GUG.cz, z.s.** (rebranded from
  GDG; never "GDG Czech Republic").
- The live site is the aether (`docs/design.md`): ink, ivory, brass
  ornament, the cold aether light only for hover and focus, the DF27 logo,
  one system sans stack (no web font). The painting is the home page's
  stage; subpages sit on its palette as a still gradient.
- 2026, "noir, but loud" (`docs/design-2026.md`), binds the `/2026`
  archive and the flagged surfaces not yet reskinned, which stay off until
  they are.
- Photographs are prints: brass-framed, slightly desaturated. Never stock
  or generated imagery.

## Evidence on Hand

- Real speakers and sessions arrive from Sessionize at runtime; local dev and
  a11y use fixtures in `scripts/a11y-mocks/api.mjs`. Do not invent speakers.
- Press clippings are URLs in `src/lib/press-coverage.ts`, read from their
  Open Graph tags at build time; the press kit is in `public/press-kit/`;
  partner logos are in `src/assets/partners/<tier>/`.
- Event facts (date, venue, coordinates, `.ics`) in `src/lib/event.ts`.
- The 2026 lineup as it was on archive day: `archive/2026/api/lineup.json`.
- **Absent:** testimonials, attendance figures beyond what page copy states,
  pricing outside ti.to, photographs of 2026, an aftermovie, and for 2027
  anything beyond "Fall 2027, Prague" (date, venue, prices, call for
  speakers). Do not fabricate any of these.

## Product Principles

1. **One thing per page.** Every page has one action; its last block (a
   closer, an end line or the end of its content) names it.
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
