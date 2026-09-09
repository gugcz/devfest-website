/**
 * The audited topic set shown under the hero statement and in the ticker.
 *
 * No product names. The set describes what the conference is about, and a
 * subject outlives the vendor's naming — a track called after a specific
 * model or OS dates the page the moment either is renamed, and reads as a
 * sponsor list rather than a programme. The talks still name the products
 * they are about; the hero and the ticker do not.
 *
 * Mobile and web are one entry, not two. Split, they read as two platform
 * camps and the poster spends two of six lines on the same answer: what you
 * ship to a person. Merged, accessibility stays in the description where it
 * belongs — it is a property of the work, not a track beside it.
 */
export const TOPICS = [
	{ n: '01', name: 'AI Agents', desc: 'Agents that touch real code and real systems.' },
	{ n: '02', name: 'Generative UI', desc: 'LLMs as a product layer, not a demo.' },
	{ n: '03', name: 'Cloud & Backends', desc: 'Where the AI actually runs — access, data, and the bill.' },
	{ n: '04', name: 'Mobile & Web', desc: 'What you ship to a person — on every device, for every user.' },
	{ n: '05', name: 'Humans in Tech', desc: 'Teams, trust, and the part that is not code.' },
] as const;
