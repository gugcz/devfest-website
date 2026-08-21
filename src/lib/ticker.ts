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
 */
export const EVENT_TOPICS = [
	'AI & Machine Learning',
	'Android & Kotlin',
	'Web Technologies',
	'Cloud & DevOps',
	'Flutter & Dart',
	'Security',
	'Open Source',
] as const;
