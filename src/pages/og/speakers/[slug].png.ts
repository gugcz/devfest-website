/**
 * `/og/speakers/<slug>.png` — the Open Graph card for a speaker page.
 *
 * One PNG per speaker, rendered at build time so it is a plain static file by
 * the time a scraper asks for it (they time out fast and do not retry).
 */
import type { APIRoute } from 'astro';
import { getBuildLineup } from '../../../lib/lineup-build';
import { inlineImage, renderCard } from '../../../lib/og-card';
import { speakerSlugs } from '../../../lib/slug';
import type { Speaker } from '../../../lib/speakers';

export async function getStaticPaths() {
	const { speakers } = await getBuildLineup();
	const slugs = speakerSlugs(speakers);
	return speakers.map((speaker) => ({
		params: { slug: slugs.get(speaker.id)! },
		props: { speaker },
	}));
}

export const GET: APIRoute = async ({ props }) => {
	const { speaker } = props as { speaker: Speaker };

	const png = await renderCard({
		kicker: 'Speaker',
		title: speaker.fullName,
		subtitle: speaker.tagLine,
		// Falls back to the monogram layout when the portrait can't be inlined,
		// which is the same fallback the lineup card uses.
		image: await inlineImage(speaker.profilePicture),
		initialsFor: speaker.fullName,
	});

	return new Response(new Uint8Array(png), {
		headers: {
			'Content-Type': 'image/png',
			// Immutable in practice: the file is rebuilt under the same URL only
			// when the speaker's own details change, and scrapers re-fetch on
			// their own schedule anyway.
			'Cache-Control': 'public, max-age=86400',
		},
	});
};
