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
Today the root is the teaser of **DevFest.cz 2027**: fall 2027, Prague, no
date or venue announced. **DevFest.cz 2026** (30 October 2026, Uhelný Mlýn in
Libčice nad Vltavou) is a frozen archive at `/2026`. While an edition is on,
the site exists to sell tickets and to carry the agenda, speakers, venue and
practical information; between editions, to keep the domain's audience and
collect newsletter sign-ups. **[inferred]** Success
is ticket sales and newsletter sign-ups; the analytics conversion events are
the ticket CTA, the ti.to thank-you page, the newsletter form and the
company invoice request.

## Positioning

**[inferred]** "The most original developer conference in Prague": one day,
one venue, a curated lineup across AI agents, generative UI, cloud and
backends, mobile and web accessibility, and the humans behind it. A festival
built by a community, not a vendor event.

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
  freezes it into `archive/<year>/` (its lineup and speaker photos
  included) and the root switches to the next edition's teaser
  (`features.edition` off, `config.upcoming`). Every URL the edition owned
  answers 301 to `/<year>/…`; the archive is indexed, in the sitemap and
  linked from every footer. Older editions (2025, 2019, 2018, 2017) still
  live on their own subdomains.
- **The teaser** (the root today): the design's stage over the painted
  aether (the DF27 logo, "Fall 2027" lettered in brass, the tagline, a solid
  "Hear it first" to the newsletter and a framed portal to `/2026`), then what DevFest.cz is, what is announced (when,
  where, language), 2026 in figures (the audience from the config, talks
  and speakers counted from the frozen lineup) with prints from past
  editions, the newsletter, and a footer with every past edition, the
  organiser, the socials and the legal pages. JSON-LD is `Organization` and
  `WebSite`, no `Event`, until the date is known. At the root beside it:
  the privacy policy, the code of conduct, the app's pages (`/app`,
  `/login`, `/delete-account`), the newsletter thank-you, the 404 and
  `/llms.txt`, still in the 2026 noir skin.
- Pages of a dated edition (the 2026 archive, and the root again once the
  next edition has a date): home, agenda (with every talk), speakers, tickets (on home),
  workshops, venue, attending, invoice, partners, press downloads, team, FAQ,
  contact (with press), code of conduct, newsletter thank-you, thank-you, 404,
  privacy policy, delete-account (mobile app), get the app (`/app`), share
  pages per talk and speaker, `/llms.txt`; unlisted `/invite/<member>`,
  `/speaker-card`, `/tv` (venue screens) and `/login/<code>` (the app's
  sign-in link); `/press` and `/sessions` redirect to `/contact#press` and
  `/agenda#talks`. Every section a chapter may not run is behind a feature
  flag in `src/site.config.ts` (edition, tickets, invoice, workshops, app,
  invite, partners, newsletter, attending; `docs/adapting.md`). The 2026
  edition took place on 30 October 2026; its archive at `/2026` carries the
  programme, the speakers, the venue and the partners, with no sale,
  sign-up, app page or newsletter form.
- The 2026 site is a darkroom: photographs are paper prints on a flat black
  table, each with one strip of tape, set down at a small tilt; the facts
  that go with them are straight paper slips and cards. A page carries one
  red grease-pencil mark.
- The event home (while `edition` is on; `/2026` today): a hero with the key art on the right and, over it, the
  statement, the five topics billed under it and the facts (date and venue
  link). While tickets are on sale the facts also carry a ticking
  countdown to the keynote and the wave on sale "from <price>", and the
  red "Get tickets" sits under them; after the day the statement says
  thank you, the countdown and the sale are gone, and the red action under
  the facts is "Stay in the loop", a jump to the newsletter. Then the
  sections, each head with its note (only where it carries a fact) under
  it. The lead sections at poster scale: The eleventh DevFest.cz (a print of the
  mill with the one-line pitch, and its back with date / place / doors /
  audience), Tickets while the `tickets` flag is on (one paper ticket
  slip per wave: the wave on sale first and large with its price, state, Buy / Company pays; spent
  waves crossed out; the invoice route beside the head), Speakers (the
  first prints of the lineup, the opening keynote large, then "All N
  speakers"), Past editions (a contact sheet of eight frames with one
  enlarged). The utility sections follow a step smaller: Partners (a
  labelled row per tier, each mark sized by its tier; "All partners",
  "Become a partner"), Get the app (store badges and a link to `/app`),
  Newsletter (lede and the form on a paper card). No arrow glyphs; the countdown is the only thing that moves on its own.
- Navigation: at 1100px and wider the destinations sit inline in the
  header (Speakers, Agenda, Venue, FAQ, then Partners, Team, Press,
  Contact) beside a red Tickets button while tickets are on sale; narrower, they live behind one
  menu toggle. The footer lists every public page except `/workshops`
  (linked from the agenda), `/press/downloads` (linked from the press
  band) and `/delete-account` (linked from the privacy policy).
- Subpages open on type: a poster-scale title and a factual lede beside
  it, no photograph; every section head's note lines up under the lede's
  column. Speakers and the agenda are paper:
  every speaker a print in running order with room and start time, the
  hosts in their own row; every talk a slip by room and time, each room a
  column under a name that stays in view, the all-day lounge a column of
  its own (one list grouped by time on a phone, the lounge one line above
  it). The
  FAQ is a list of questions, the open one a paper slip with its answer.
  `/speakers` ends on the way to the agenda (and tickets, while on sale),
  with no closing block. `/venue` and `/agenda` close on a thank-you once
  the day is over.
- Static Astro build with React islands only for data-backed behaviour.
  Browser reads come only from cached HTTP endpoints, never the Firebase
  client SDK; writes go through App Check-gated callables.
- **Public repository.** No real attendee, partner or customer data ever
  enters the repo, fixtures or docs.
- Production is the `2026` branch; only the maintainer merges or deploys.
- Copy is English; Czech appears only in quoted press clippings.
- One day. Workshops run alongside the talks with limited seats
  (`/workshops`).

## Brand Commitments

- Name: **DevFest.cz**. Organiser credit: **GUG.cz, z.s.** (rebranded from
  GDG; never "GDG Czech Republic").
- 2027: the aether (`docs/design.md`): ink, ivory, brass ornament, the cold
  aether light only for hover and focus, the DF27 logo, one system sans
  stack (no web font).
- 2026 and the pages still on `BaseLayout.astro`: "noir, but loud", in the
  darkroom (`docs/design-2026.md`): one dark theme, red accent,
  poster-scale Bebas Neue headlines, photographs as paper prints. Only the
  brand faces in `astro.config.ts` may be used there; never add a font.
- The detective key art (`/hero-detective.webp`) is the home hero. Every
  subpage opens on type; a subpage's photographs sit in its bands (venue
  its entrance, contact a 2019 print beside the clippings), graded B&W.
  Never stock or generated imagery.
- The design record of each edition is binding for its pages:
  `docs/design.md` (2027), `docs/design-2026.md` (2026).

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
