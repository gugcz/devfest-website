# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary: individual developers deciding whether to attend.** Prague- and Czechia-based (plus nearby Central Europe and internationally-mobile visitors) engineers, geeks, and tech enthusiasts weighing a ~2 099–2 999 Kč ticket and a full day away from work. They arrive undecided, often from a social post, a friend's recommendation, or a past edition they remember. Success for this phase (now → 30 October 2026) is **tickets sold in the current wave**.

Secondary audiences the site already serves, but which do not lead:

- **Employers / finance approvers** — the company-funded ticket path and `/invoice` (bank-transfer, iDoklad invoice → 100 %-off ti.to code).
- **Sponsors and partners** — `/partners`, tier ladder, `filip.goszler@gug.cz`.
- **Speakers** — lineup pages fed from Sessionize; CFP is closed for 2026.
- **Press** — `/press`, `/press/downloads` press kit.

## Product Purpose

The public site for **DevFest.cz 2026**, a one-day community developer conference and festival on **30 October 2026** at **Uhelný Mlýn**, Areál Šroubáren 860, 252 66 Libčice nad Vltavou (just north of Prague, ~30 min by train from Praha-Bubny toward Kralupy nad Vltavou, then a ~0.7 km walk).

The site exists to turn interest into a purchased ticket: explain what the day is, show who is speaking and who backs it, and put the current ticket wave in front of the visitor without friction. Everything else (partners, press, team, FAQ, invoices) supports that.

Topic scope: Web technologies, Android & Kotlin, Flutter & Dart, AI/ML, Cloud & DevOps, Security, Open Source.

## Positioning

**Community-built, not corporate.** Run by **GUG.cz, z.s.** — a Czech developer community association — and staffed by volunteers. Capacity is **strictly capped** to keep the day focused; the venue is a converted industrial coal mill rather than a conference centre. That combination (volunteer-run, deliberately small, one day, a real industrial building outside the city) is what a commercial conference in Prague cannot truthfully copy.

DevFest.cz is a returning event with past editions (most recently 2025, archived at `2025.devfest.cz`), so "the most original developer conference in Prague is **back**" is a legitimate frame; a first-edition framing is not.

## Operating Context

- **Deciding:** the visitor is usually on a phone, mid-scroll, not in a buying mindset yet. Date, place, price, and lineup must be answerable in seconds.
- **Buying:** ticket checkout leaves the site for **ti.to** (`https://ti.to/<account>/<event>/with/<release-slug>`). Card only.
- **Company-funded buying:** companies that cannot pay by card request an invoice on `/invoice`, pay by bank transfer against a real iDoklad invoice, and are then sent a 100 %-off ti.to code to claim the tickets. Payment detection is polled hourly (iDoklad has no webhooks), so a paid invoice is claimed up to ~1 h later.
- **Attending:** in person only, all talks in **English**, doors 09:00, day ends ~20:00 CET.
- **Getting there:** train from Prague plus a short walk — travel logistics are a genuine objection the site must answer, not a footnote.
- **Recordings** are published after the conference and announced via newsletter and social channels.

## Capabilities and Constraints

Confirmed product facts:

- **Date/time:** 30 October 2026, 09:00–20:00 (Europe/Prague).
- **Tickets:** sold in three waves — **Early Bird → Regular → Lazy Bird** — price rising each wave. Each wave offers **Individual** and **Company funded** variants; both grant full access. Early Bird from 2 099 Kč incl. VAT; Regular 2 999 Kč incl. VAT. Live wave state is authoritative (ti.to → RTDB), never hardcoded in page copy.
- **CFP:** closed for 2026. Lineup announced progressively.
- **Contacts:** general `devfest@gug.cz`; partners `filip.goszler@gug.cz` (Filip Goszler, Lead); speakers `devfest-speakers@gug.cz`.
- **Language:** the site is **English-only, permanently**. No localization layer is planned; copy is written for a CZ-based but internationally-open audience.

Technical constraints (repo-evident, must be preserved):

- Static **Astro 6** build on Firebase Hosting; **no SSR**. Live data (ticket waves, speakers, sessions) arrives client-side in React islands from Firebase RTDB / Firestore caches written by Cloud Functions. The build never calls ti.to or Sessionize.
- Analytics initialise **only after cookie consent**; App Check runs unconditionally as a security measure.
- Invoice company PII lives in server-only Firestore; the browser only calls a callable function.
- `trailingSlash: 'never'`; JSON-LD (Event, Organization, WebSite, FAQPage) is generated from the same sources as the rendered copy and must not drift from it.

Explicitly undecided / not to be invented:

- Attendee capacity number, per-wave dates for future waves (Lazy Bird has no scheduled start), and the full speaker lineup.

## Brand Commitments

- **Name:** DevFest.cz 2026. Organiser: **GUG.cz, z.s.** (rebranded from GDG Czech Republic — never call it "GDG Czech Republic").
- **Voice:** dry, confident, playful noir. Copy uses detective/mystery framing ("Prague's most original conference is back—and it's brought a few mysteries with it", team members carry noir aliases). Not corporate, not hype-tech.
- **Identity assets:** `public/logo.png`, favicons, `og-image.jpg`, hero photograph `hero-detective.webp`.
- **Typography mandate:** only four fonts may be used sitewide — **Bebas Neue, IM Fell English, JetBrains Mono, Special Elite** (the four loaded in `BaseLayout.astro`). Adding any other typeface violates the brand.
- **Socials:** X `@devfest_cz`, Facebook `DevFestCZ`, Bluesky `devfest.cz`, LinkedIn `company/gugcz`, YouTube.

## Evidence on Hand

Real, usable:

- **Past-edition photography** — 22 images in `public/gallery/devfest-2025-NN.webp`.
- **Team portraits** — `public/team/*.webp`, each in matched black-and-white and colour versions.
- **Partner logos** — `public/partners/{diamond,platinum,gold,silver,media}/`. Current ladder: Diamond (Make, GDG), Platinum (Česká spořitelna), Gold (Wrike, Apify, Alma Career), Silver (Applifting); media partners (White Whale Media, Dotěkománie, Smartmania.cz) are shown on `/partners` only, never on the homepage strip.
- **Press kit** — `public/press-kit/`.
- **Speaker and session data** — Firestore, synced daily from Sessionize.
- **Prior edition site** — `2025.devfest.cz`.

Deliberately absent — **must never be fabricated**: attendance numbers, edition counts, attendee or speaker testimonials, ratings, NPS, company-logo "trusted by" claims, or any statistic. If a number or quote is wanted, it must be supplied by the organisers first.

## Product Principles

1. **The ticket decision is the product.** Every surface either moves a visitor toward buying or removes an objection blocking it. Nothing on the site is allowed to be decorative-only at the cost of that path.
2. **Live data outranks written copy.** Prices, wave names, and availability come from ti.to via the caches. Page copy never restates a price it cannot verify.
3. **Community-built is the differentiator, not an apology.** Volunteer-run, capped, and independent are selling points — presented with confidence, never as a limitation or a plea.
4. **Answer the practical objections early.** Date, price, place, how to get there, what language: a visitor should never have to hunt for the reason not to come.
5. **Claim nothing we cannot show.** With no numbers or testimonials on hand, credibility is carried by real photographs, real partners, and real named people.

## Accessibility & Inclusion

**Hard constraint: WCAG 2.2 Level AA, all criteria, no exceptions.** Confirmed by the organisers as a product requirement, not a nice-to-have. A change that cannot meet AA does not ship.

This explicitly includes the nine criteria new in 2.2, which are easy to miss on a site with fixed chrome and atmosphere layers:

- **2.4.11 Focus Not Obscured (Minimum)** — the fixed header and the fixed cookie banner must never cover a focused element (`scroll-padding-top: 6rem` / `scroll-padding-bottom: 8rem` exist for this; any new fixed chrome must extend them).
- **2.4.12 Focus Appearance** and **2.4.13** — the 2px accent-hot ring at 3px offset is the site-wide focus indicator; nothing may suppress it.
- **2.5.7 Dragging Movements** — no interaction may require a drag without a single-pointer alternative.
- **2.5.8 Target Size (Minimum)** — 24×24 CSS px floor; the system already uses 2.75rem (44px) touch rows and should keep to that.
- **3.2.6 Consistent Help** — the contact route stays in the same relative position across pages.
- **3.3.7 Redundant Entry** and **3.3.8 Accessible Authentication** — relevant to the `/invoice` form; never require re-typing information already given, and never gate on a cognitive-function test.

Standing requirements the atmosphere layer makes non-obvious: all text contrast is measured **through** the vignette and any lit/glow overlay, not against the raw token; decorative layers are `pointer-events: none` and `aria-hidden`; every animation (ticker, gallery marquee, scroll reveals, hover pushes) is neutralised under `prefers-reduced-motion: reduce`; the topic ticker pauses on hover for 2.2.2; and content renders fully without JavaScript.

Inclusion beyond the standard: the site is read by non-native English speakers (a CZ-based audience on an English-only site), so plain language, no idiom-dependent instructions, and spelled-out dates/prices matter as much as the technical criteria.
