# Plan: the venue screens in the darkroom look

Date: 2026-10-19. Branch: `claude/venue-tv-screens-ptiv2h` (PR #423).

## Why

The darkroom redesign (#464) landed on `2026` while `/tv` was still in the
earlier case-file look: a lamp, grain and vignette on the ground, the
detective skyline behind the header, torn paper, rubber stamps, split-flap
titles, mono caps labels and partner marks printed black on paper. Every one
of those is now against the rules in `docs/design.md` (flat black ground, no
grain, nothing moves on its own, mono for figures only, partner marks in
their original colours). The maintainer asked for the whole page in the new
design.

## Decisions

- **Same screens, same fitting.** Room screen (hero + rail), board, credits
  band and portrait keep their layout, their `--u` unit and the measuring
  that keeps every room on the rail. Only the look changes.
- **Flat black table.** No lamp, grain, vignette or skyline (the detective
  photograph belongs to the home hero). A 1px drift every six minutes stays:
  it protects the panel from burn-in and nobody sees it move.
- **Three voices.** Talk titles, room names and speaker names are Bebas;
  every word label (Up next, Other rooms, Live now, the break tag, the
  credits captions, the sign-off) is a Special Elite note; times are mono,
  and a figure inside a note is a mono `.fig`, as on the home page. Talk
  titles stay Bebas on paper too, unlike the agenda slip: a sign read across
  a hall needs the condensed face to fit a title in two lines.
- **Paper where it carries the most.** Speaker portraits are tilted paper
  prints with figures on their edge; Up next and the board's Now column are
  straight paper slips, like the agenda's. Everything else sits on black,
  set apart by space, with no cards and no rules. The live progress is a
  white spine on black and an ink spine on paper.
- **Red is evidence.** "Live now" is a red word with a red dot on black and
  an ink word with a red dot on paper. No red full stop on the heading. The
  page's one grease mark rings the countdown to a talk inside ten minutes
  (the hero's while it is the next talk, else Up next's), or underlines
  "That's a wrap." at the end of the day; never two at once.
- **Nothing moves on its own.** No split-flap, no seconds sweep, no pulse.
  The one exception is the partner loop, which turns a page every 8 s (the
  band is there to show every partner); the page fades in, and the fade is
  off under reduced motion.
- **Partner marks in their colours.** On black, equal-area sized
  (`opticalBox`, through a new `logoBox` export in `src/lib/partners.ts`);
  a `dark` master sits on a white card, as on `/partners`. The GUG.cz logo
  keeps its colours on black.

## Steps

1. `logoBox` in `partners.ts`; `tv.astro` hands each logo its width and
   mono mode, keyed by path.
2. Rewrite `TvScreen.module.scss` and adjust `TvScreen.tsx` markup.
3. Screenshot every state, landscape and portrait.
4. Record the `/tv` exceptions in `docs/design.md`; README text if needed.
5. `npm run verify`, review, push, CI, preview link.
