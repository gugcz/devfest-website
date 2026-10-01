/**
 * The social column on `/tv`: the Facebook page, the Instagram account and
 * the event hashtag from `/api/social` (Meta needs a token, so a function
 * reads it), plus DevFest's Bluesky account read straight from Bluesky's
 * public AppView (no key, CORS-enabled). Either source can fail alone.
 */

export const BLUESKY_HANDLE = 'devfest.cz';

const SOCIAL_ENDPOINT = '/api/social';
const BLUESKY_FEED = `https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=${BLUESKY_HANDLE}&filter=posts_no_replies&limit=20`;

/** Where a post came from; `hashtag` is a public Instagram post with the tag. */
export type SocialNetwork = 'bluesky' | 'facebook' | 'instagram' | 'hashtag';

export interface SocialPost {
	/** Stable key, prefixed by network. */
	id: string;
	network: SocialNetwork;
	text: string;
	/** ISO timestamp the post was made. */
	createdAt: string;
	/** Account name; empty for hashtag posts (Instagram doesn't expose it). */
	author: string;
	/** First image (a video's still); may be empty. */
	image: string;
	imageAlt: string;
}

export interface SocialFeed {
	/** The event hashtag without `#`, '' until configured. */
	hashtag: string;
	posts: SocialPost[];
}

function str(value: unknown): string {
	return typeof value === 'string' ? value : '';
}

function record(value: unknown): Record<string, unknown> {
	return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
}

const META_SOURCES = new Set(['facebook', 'instagram', 'hashtag']);

/** Parse `/api/social` (`functions/src/social/meta.ts` `SocialPost`). */
export function feedFromApi(raw: unknown): SocialFeed {
	const body = record(raw);
	const posts = Array.isArray(body.posts) ? body.posts : [];
	return {
		hashtag: str(body.hashtag),
		posts: posts.flatMap((item): SocialPost[] => {
			const post = record(item);
			const network = str(post.source);
			if (!META_SOURCES.has(network)) return [];
			return [
				{
					id: str(post.id),
					network: network as SocialNetwork,
					text: str(post.text),
					createdAt: str(post.createdAt),
					author: str(post.author),
					image: str(post.image),
					imageAlt: '',
				},
			];
		}),
	};
}

function firstImage(embed: Record<string, unknown>): { image: string; imageAlt: string } {
	// `images#view` directly, or nested under `recordWithMedia#view.media`.
	const media = record(embed.media);
	const images = Array.isArray(embed.images) ? embed.images : Array.isArray(media.images) ? media.images : [];
	const first = record(images[0]);
	return { image: str(first.fullsize) || str(first.thumb), imageAlt: str(first.alt) };
}

/** Parse a Bluesky `getAuthorFeed` response; skips anything without text or image. */
export function postsFromBluesky(raw: unknown): SocialPost[] {
	const feed = record(raw).feed;
	if (!Array.isArray(feed)) return [];
	const posts: SocialPost[] = [];
	for (const item of feed) {
		const post = record(record(item).post);
		const author = record(post.author);
		const body = record(post.record);
		const text = str(body.text).trim();
		const { image, imageAlt } = firstImage(record(post.embed));
		if (!text && !image) continue;
		posts.push({
			id: `bsky:${str(post.uri)}`,
			network: 'bluesky',
			text,
			createdAt: str(body.createdAt) || str(post.indexedAt),
			author: str(author.displayName) || str(author.handle),
			image,
			imageAlt,
		});
	}
	return posts;
}

async function getJson(url: string, signal?: AbortSignal): Promise<unknown> {
	const res = await fetch(url, { signal });
	if (!res.ok) throw new Error(`${url} failed: ${res.status}`);
	return res.json();
}

/** Both sources, newest first. Throws only when both fail. */
export async function fetchSocialFeed(signal?: AbortSignal): Promise<SocialFeed> {
	const [meta, bluesky] = await Promise.allSettled([
		getJson(SOCIAL_ENDPOINT, signal).then(feedFromApi),
		getJson(BLUESKY_FEED, signal).then(postsFromBluesky),
	]);
	if (meta.status === 'rejected' && bluesky.status === 'rejected') throw meta.reason;
	const posts = [
		...(meta.status === 'fulfilled' ? meta.value.posts : []),
		...(bluesky.status === 'fulfilled' ? bluesky.value : []),
	];
	posts.sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0));
	return { hashtag: meta.status === 'fulfilled' ? meta.value.hashtag : '', posts };
}

/** `5 min ago`, `3 h ago`, `2 d ago`. */
export function timeAgo(iso: string, now: number): string {
	const at = Date.parse(iso);
	if (Number.isNaN(at)) return '';
	const minutes = Math.max(0, Math.round((now - at) / 60_000));
	if (minutes < 1) return 'just now';
	if (minutes < 60) return `${minutes} min ago`;
	const hours = Math.round(minutes / 60);
	if (hours < 24) return `${hours} h ago`;
	return `${Math.round(hours / 24)} d ago`;
}
