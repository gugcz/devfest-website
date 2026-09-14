/** Topic set under the hero and in the ticker. No product names (a subject
 * outlives a vendor's naming; products read as a sponsor list). Mobile and
 * web are one entry; accessibility stays in the description. */
export const TOPICS = [
	{ n: '01', name: 'AI Agents', desc: 'Agents that touch real code and real systems.' },
	{ n: '02', name: 'Generative UI', desc: 'LLMs as a product layer, not a demo.' },
	{ n: '03', name: 'Cloud & Backends', desc: 'Where the AI actually runs — access, data, and the bill.' },
	{ n: '04', name: 'Mobile & Web', desc: 'What you ship to a person — on every device, for every user.' },
	{ n: '05', name: 'Humans in Tech', desc: 'Teams, trust, and the part that is not code.' },
] as const;
