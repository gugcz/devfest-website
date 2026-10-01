/**
 * The social column on `/tv`: recent posts from DevFest's own Bluesky
 * account. Bluesky's public AppView needs no key and sends CORS headers, so
 * the browser reads it directly; X, LinkedIn and Facebook all need a login or
 * an app token for the same thing. Hashtag search is not public on Bluesky,
 * so this is the account's feed, not a tag wall.
 */

export const BLUESKY_HANDLE = 'devfest.cz';

const FEED_URL = `https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=${BLUESKY_HANDLE}&filter=posts_no_replies&limit=20`;

export interface SocialPost {
	/** AT URI — stable key. */
	id: string;
	text: string;
	/** ISO timestamp the post was made. */
	createdAt: string;
	authorName: string;
	authorHandle: string;
	avatar: string;
	/** First attached image, if any. */
	image: string;
	imageAlt: string;
	/** True for a repost of someone else's post. */
	isRepost: boolean;
}

function str(value: unknown): string {
	return typeof value === 'string' ? value : '';
}

function record(value: unknown): Record<string, unknown> {
	return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
}

function firstImage(embed: Record<string, unknown>): { image: string; imageAlt: string } {
	// `images#view` directly, or nested under `recordWithMedia#view.media`.
	const media = record(embed.media);
	const images = Array.isArray(embed.images) ? embed.images : Array.isArray(media.images) ? media.images : [];
	const first = record(images[0]);
	return { image: str(first.fullsize) || str(first.thumb), imageAlt: str(first.alt) };
}

/** Parse a `getAuthorFeed` response; skips anything without text or image. */
export function postsFromFeed(raw: unknown): SocialPost[] {
	const feed = record(raw).feed;
	if (!Array.isArray(feed)) return [];
	const posts: SocialPost[] = [];
	for (const item of feed) {
		const entry = record(item);
		const post = record(entry.post);
		const author = record(post.author);
		const body = record(post.record);
		const text = str(body.text).trim();
		const { image, imageAlt } = firstImage(record(post.embed));
		if (!text && !image) continue;
		posts.push({
			id: str(post.uri),
			text,
			createdAt: str(body.createdAt) || str(post.indexedAt),
			authorName: str(author.displayName) || str(author.handle),
			authorHandle: str(author.handle),
			avatar: str(author.avatar),
			image,
			imageAlt,
			isRepost: str(record(entry.reason).$type) === 'app.bsky.feed.defs#reasonRepost',
		});
	}
	return posts;
}

export async function fetchSocialPosts(signal?: AbortSignal): Promise<SocialPost[]> {
	const res = await fetch(FEED_URL, { signal });
	if (!res.ok) throw new Error(`bluesky feed failed: ${res.status}`);
	return postsFromFeed(await res.json());
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
