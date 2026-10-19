# Surface brief: home countdown and agenda topics

Mode: Persuade (the home page). Confirmed by the maintainer on 2026-10-19.

- **Job.** A visitor, usually on a phone, decides whether to come. The
  countdown gives the date a pulse; the topics say what the day is about.
- **Countdown.** One item in the hero facts line, right after the date:
  a typed "Keynote in" and the time left as one mono figure
  (`10d 14h 22m 05s`), counting to `EVENT.start`. No boxes, no flip
  clock, no red. Ticks by the second; under reduced motion it drops the
  seconds and refreshes quietly, so nothing ticks. Screen readers get one
  static sentence; the live figure is `aria-hidden`. Before hydration the
  item holds its box. From the keynote to `EVENT.end` it reads "Live now";
  after that it is gone.
- **Agenda topics.** A section after "The eleventh DevFest.cz", before
  Tickets: the head "Agenda" with the text action "Full agenda" (`/agenda`),
  then the five `TOPICS` billed like a poster on the black table, each
  name in Bebas on the left, its line in the typewriter in the side column.
  No cards, no numbers, no tape: topics are not photographs. The
  "Programme" row leaves the event card, so the topics appear once.
- **Words.** Never "programme" on this surface; it is the agenda.
- **Record.** The countdown is the one thing that moves on its own; the
  "Nothing moves on its own" rule in `docs/design.md` is rewritten to say so.
