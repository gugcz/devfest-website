/** Social domain params. Secrets: `firebase functions:secrets:set <NAME>`;
 * non-secret strings: `functions/.env`. Every source is optional: a blank id
 * turns that source off, so the endpoint serves `[]` until Meta is set up. */

import { defineSecret, defineString } from 'firebase-functions/params';

// A Page access token for the DevFest Facebook page that does not expire
// (exchanged from a long-lived user token), from a Meta app with
// `pages_read_engagement`, `instagram_basic` and `instagram_manage_insights`
// (the last one is what hashtag search needs).
export const META_PAGE_TOKEN = defineSecret('META_PAGE_TOKEN');

// Facebook page id — its posts. Blank = no Facebook posts.
export const META_PAGE_ID = defineString('META_PAGE_ID', { default: '' });

// Instagram professional account linked to that page — its posts, and the
// account hashtag search runs as. Blank = no Instagram at all.
export const META_IG_USER_ID = defineString('META_IG_USER_ID', { default: '' });

// The event hashtag, without `#`. Blank = no hashtag search.
export const SOCIAL_HASHTAG = defineString('SOCIAL_HASHTAG', { default: '' });
