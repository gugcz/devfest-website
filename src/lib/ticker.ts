import { TOPICS } from './topics';

/**
 * The running band's copy.
 *
 * `EVENT_TOPICS` is the one line every page shares — the conference's subject
 * matter, not the page's. It runs under the hero on the homepage and on every
 * subpage, which is what makes the pages read as one site rather than as a set
 * of separately-designed documents.
 *
 * `/partners` is the deliberate exception: that page is about partnering, not
 * about the programme, so it keeps its own list (see `partners.astro`).
 *
 * Same five subjects as the hero's topic set (`TOPICS` in `topics.ts`), not a
 * second list — no product names here either.
 */
export const EVENT_TOPICS = TOPICS.map((t) => t.name);
