/**
 * SHAREABLE LINKS to one talk or one speaker. `/talks/<id>` and
 * `/speakers/<id>` are static pages built from the lineup (see
 * `lineup-static.ts`): they carry the talk's or speaker's own title and
 * description for a link preview, then hand the visitor to the page that
 * opens the sheet (`/agenda?talk=<id>`, `/speakers?speaker=<id>`). A talk
 * added after the last build has no page yet; `404.astro` forwards those.
 */
import { useEffect } from 'react';

/** Query parameter `/agenda` reads to open a talk's sheet. */
export const TALK_PARAM = 'talk';
/** Query parameter `/speakers` reads to open a speaker's sheet. */
export const SPEAKER_PARAM = 'speaker';

/** Sessionize ids: numeric for talks, GUIDs for speakers. Anything else is
 * never turned into a path. */
export function isShareId(id: string): boolean {
	return /^[A-Za-z0-9-]{1,64}$/.test(id);
}

export const talkSharePath = (id: string): string => `/talks/${encodeURIComponent(id)}`;
export const speakerSharePath = (id: string): string => `/speakers/${encodeURIComponent(id)}`;

/** Where a share page (or the 404 fallback) sends a visitor. */
export const talkTarget = (id: string): string => `/agenda?${TALK_PARAM}=${encodeURIComponent(id)}`;
export const speakerTarget = (id: string): string => `/speakers?${SPEAKER_PARAM}=${encodeURIComponent(id)}`;

/**
 * While a sheet is open, the address bar shows its share link
 * (`/talks/<id>`, `/speakers/<id>`), so copying the URL is sharing the talk.
 * No history entry; closing puts the page's own URL back. Reloading the
 * share link lands on the share page, which forwards to the sheet again.
 * A sheet stacked on another restores the one beneath it.
 */
export function useAddressBar(path: string): void {
	useEffect(() => {
		const before = new URL(window.location.href);
		// A sheet opened from `?talk=` / `?speaker=` closes onto the bare page.
		before.searchParams.delete(TALK_PARAM);
		before.searchParams.delete(SPEAKER_PARAM);
		window.history.replaceState(window.history.state, '', path);
		const shown = window.location.pathname;
		return () => {
			// Unmounted by a navigation away (a link in the sheet): the address
			// bar already belongs to the next page.
			if (window.location.pathname !== shown) return;
			window.history.replaceState(window.history.state, '', before);
		};
	}, [path]);
}

/** A description cut on a word, for a link preview. */
export function excerpt(text: string, max = 200): string {
	const flat = text.replace(/\s+/g, ' ').trim();
	if (flat.length <= max) return flat;
	const cut = flat.slice(0, max);
	const space = cut.lastIndexOf(' ');
	return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s.,;:–—-]+$/, '')}…`;
}
