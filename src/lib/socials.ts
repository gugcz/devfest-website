/** The social profiles (`src/content/socials.json`), in order. Build time only. */
import { getCollection } from 'astro:content';

export interface Social {
	network: string;
	url: string;
	handle?: string;
	label: string;
}

export async function getSocials(): Promise<Social[]> {
	return (await getCollection('socials'))
		.sort((a, b) => a.data.order - b.data.order)
		.map(({ data }) => ({ network: data.network, url: data.url, handle: data.handle, label: data.label }));
}

/** The `@handle` for `twitter:site`, or `undefined` without an X profile. */
export async function twitterHandle(): Promise<string | undefined> {
	return (await getSocials()).find((s) => s.network === 'x')?.handle;
}
