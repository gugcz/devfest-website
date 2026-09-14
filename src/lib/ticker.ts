import { TOPICS } from './topics';

/** The running band's copy. `EVENT_TOPICS` runs under every hero except
 * `/partners` (which keeps its own list). Same subjects as `topics.ts`; no
 * product names. */
export const EVENT_TOPICS = TOPICS.map((t) => t.name);
