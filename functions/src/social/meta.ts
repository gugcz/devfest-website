/**
 * Meta Graph API reads for the venue screens: the Facebook page's posts, the
 * Instagram account's posts, and recent public Instagram posts with the event
 * hashtag (Graph only returns the last 24 h of those, without the author).
 * LinkedIn has no equivalent outside its partner program.
 */

import { errorBody, fetchWithRetry } from '../lib/http.js';

const GRAPH = 'https://graph.facebook.com/v23.0';
const LIMIT = 12;

export type SocialSource = 'facebook' | 'instagram' | 'hashtag';

/** One post as `/api/social` serves it; mirrored by `src/lib/social.ts`. */
export interface SocialPost {
	id: string;
	source: SocialSource;
	text: string;
	/** ISO timestamp. */
	createdAt: string;
	/** Image URL (a video's thumbnail); may be empty. */
	image: string;
	/** Account name; empty for hashtag posts (Graph doesn't expose it). */
	author: string;
}

function str(value: unknown): string {
	return typeof value === 'string' ? value : '';
}

function list(raw: unknown): Record<string, unknown>[] {
	const data = (raw as { data?: unknown } | null)?.data;
	return Array.isArray(data) ? (data.filter((d) => d && typeof d === 'object') as Record<string, unknown>[]) : [];
}

/** `/{page-id}/posts` → posts with text or a picture. */
export function parseFacebook(raw: unknown, author: string): SocialPost[] {
	return list(raw)
		.map((item) => ({
			id: `fb:${str(item.id)}`,
			source: 'facebook' as const,
			text: str(item.message).trim(),
			createdAt: str(item.created_time),
			image: str(item.full_picture),
			author,
		}))
		.filter((post) => post.id !== 'fb:' && (post.text || post.image));
}

/** `/{ig-user-id}/media` or `/{hashtag-id}/recent_media` → posts. */
export function parseInstagram(raw: unknown, source: 'instagram' | 'hashtag'): SocialPost[] {
	return list(raw)
		.map((item) => ({
			id: `ig:${str(item.id)}`,
			source,
			text: str(item.caption).trim(),
			createdAt: str(item.timestamp),
			// A video's `media_url` is the video; its still is `thumbnail_url`.
			image: str(item.media_type) === 'VIDEO' ? str(item.thumbnail_url) : str(item.media_url),
			author: source === 'instagram' ? str(item.username) : '',
		}))
		.filter((post) => post.id !== 'ig:' && (post.text || post.image));
}

async function graph(path: string, params: Record<string, string>, token: string, label: string): Promise<unknown> {
	const url = `${GRAPH}/${path}?${new URLSearchParams({ ...params, access_token: token })}`;
	const res = await fetchWithRetry(url, {}, { label });
	if (!res.ok) throw new Error(`${label} returned ${res.status}: ${await errorBody(res)}`);
	return res.json();
}

export async function facebookPosts(pageId: string, token: string): Promise<SocialPost[]> {
	const page = (await graph(pageId, { fields: 'name' }, token, 'Facebook page')) as { name?: unknown };
	const raw = await graph(
		`${pageId}/posts`,
		{ fields: 'id,message,created_time,full_picture', limit: String(LIMIT) },
		token,
		'Facebook posts',
	);
	return parseFacebook(raw, str(page.name));
}

const IG_FIELDS = 'id,caption,media_type,media_url,thumbnail_url,timestamp';

export async function instagramPosts(igUserId: string, token: string): Promise<SocialPost[]> {
	const raw = await graph(
		`${igUserId}/media`,
		{ fields: `${IG_FIELDS},username`, limit: String(LIMIT) },
		token,
		'Instagram posts',
	);
	return parseInstagram(raw, 'instagram');
}

export async function hashtagPosts(igUserId: string, hashtag: string, token: string): Promise<SocialPost[]> {
	const found = await graph('ig_hashtag_search', { user_id: igUserId, q: hashtag }, token, 'Instagram hashtag search');
	const tagId = str(list(found)[0]?.id);
	if (!tagId) return [];
	const raw = await graph(
		`${tagId}/recent_media`,
		{ user_id: igUserId, fields: IG_FIELDS, limit: String(LIMIT * 2) },
		token,
		'Instagram hashtag posts',
	);
	return parseInstagram(raw, 'hashtag');
}

/** Newest first, the account's own posts dropped from the hashtag list. */
export function mergePosts(groups: SocialPost[][]): SocialPost[] {
	const seen = new Set<string>();
	const posts: SocialPost[] = [];
	for (const post of groups.flat()) {
		if (seen.has(post.id)) continue;
		seen.add(post.id);
		posts.push(post);
	}
	return posts.sort((a, b) => Date.parse(b.createdAt || '0') - Date.parse(a.createdAt || '0'));
}
