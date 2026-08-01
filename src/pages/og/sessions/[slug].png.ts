/**
 * `/og/sessions/<slug>.png` — the Open Graph card for a session page.
 *
 * One PNG per talk, rendered at build time so it is a plain static file by the
 * time a scraper asks for it.
 */
import type { APIRoute } from 'astro';
import { getBuildLineup } from '../../../lib/lineup-build';
import { inlineImage, renderCard } from '../../../lib/og-card';
import { visitorCategories, type Session } from '../../../lib/sessions';
import { sessionSlugs } from '../../../lib/slug';

export async function getStaticPaths() {
	const { sessions } = await getBuildLineup();
	const slugs = sessionSlugs(sessions);
	return sessions.map((session) => ({
		params: { slug: slugs.get(session.id)! },
		props: { session },
	}));
}

export const GET: APIRoute = async ({ props }) => {
	const { session } = props as { session: Session };

	const names = session.speakers.map((sp) => sp.fullName).filter(Boolean);
	// A single presenter gets their portrait on the plate; with two or more
	// there is no honest way to pick one, so the card runs text-only and the
	// names carry it.
	const solo = session.speakers.length === 1 ? session.speakers[0] : null;

	const png = await renderCard({
		kicker: visitorCategories(session)[0]?.values[0] || 'Session',
		title: session.title,
		subtitle: names.join(' & '),
		image: solo ? await inlineImage(solo.profilePicture) : null,
		initialsFor: solo?.fullName,
	});

	return new Response(new Uint8Array(png), {
		headers: {
			'Content-Type': 'image/png',
			'Cache-Control': 'public, max-age=86400',
		},
	});
};
