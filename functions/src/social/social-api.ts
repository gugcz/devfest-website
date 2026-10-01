/**
 * `socialApi` — `/api/social` serves `{ hashtag, posts }` for the `/tv` venue
 * screens: the Facebook page, the Instagram account and the event hashtag
 * (see `meta.ts`). A source that fails is logged and skipped so one expired
 * permission doesn't blank the column; only when every configured source
 * fails is it a 503.
 */

import { logger } from 'firebase-functions/v2';
import { onRequest } from 'firebase-functions/v2/https';

import { cachedJsonEndpoint } from '../lib/cached-endpoint.js';
import { describeError } from '../lib/errors.js';
import { CACHED_ENDPOINT } from '../options.js';
import { facebookPosts, hashtagPosts, instagramPosts, mergePosts, type SocialPost } from './meta.js';
import { META_IG_USER_ID, META_PAGE_ID, META_PAGE_TOKEN, SOCIAL_HASHTAG } from './params.js';

// Five minutes at the edge: the screens poll every few minutes, and a post
// showing up a few minutes late is fine on a TV.
const CACHE_CONTROL = 'public, max-age=0, s-maxage=300, stale-while-revalidate=120';
const MEMO_TTL_MS = 2 * 60 * 1000;
const MAX_POSTS = 30;

interface SocialPayload {
	hashtag: string;
	posts: SocialPost[];
}

async function loadSocial(): Promise<SocialPayload> {
	const token = META_PAGE_TOKEN.value();
	const pageId = META_PAGE_ID.value().trim();
	const igUserId = META_IG_USER_ID.value().trim();
	const hashtag = SOCIAL_HASHTAG.value().trim().replace(/^#/, '');

	const sources: [string, () => Promise<SocialPost[]>][] = [];
	if (token && pageId) sources.push(['facebook', () => facebookPosts(pageId, token)]);
	if (token && igUserId) sources.push(['instagram', () => instagramPosts(igUserId, token)]);
	if (token && igUserId && hashtag) sources.push(['hashtag', () => hashtagPosts(igUserId, hashtag, token)]);

	const results = await Promise.allSettled(sources.map(([, read]) => read()));
	const groups: SocialPost[][] = [];
	results.forEach((result, i) => {
		if (result.status === 'fulfilled') groups.push(result.value);
		else logger.warn(`socialApi ${sources[i][0]} read failed: ${describeError(result.reason)}`);
	});
	if (sources.length > 0 && groups.length === 0) {
		throw new Error('every social source failed');
	}
	return { hashtag, posts: mergePosts(groups).slice(0, MAX_POSTS) };
}

export const socialApi = onRequest(
	{ ...CACHED_ENDPOINT, secrets: [META_PAGE_TOKEN] },
	cachedJsonEndpoint<SocialPayload>({
		name: 'socialApi',
		cacheControl: CACHE_CONTROL,
		memoTtlMs: MEMO_TTL_MS,
		fallback: { hashtag: '', posts: [] },
		load: loadSocial,
	}),
);
