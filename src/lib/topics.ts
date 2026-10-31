/** The day's topics (`src/content/topics.json`), in order. Build time only. */
import { getCollection } from 'astro:content';

export interface Topic {
	name: string;
	desc: string;
}

export async function getTopics(): Promise<Topic[]> {
	return (await getCollection('topics'))
		.sort((a, b) => a.data.order - b.data.order)
		.map(({ data }) => ({ name: data.name, desc: data.desc }));
}
