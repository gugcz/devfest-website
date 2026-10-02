import type { APIRoute, ImageMetadata } from 'astro';
import { getImage } from 'astro:assets';
import { getCollection } from 'astro:content';

// Credits feed for the mobile app (team + partners). Prerendered by
// `astro build` to `dist/api/credits.json` and served by Hosting as a static
// file — no function, no rewrite. Built from the same collections and image
// masters as /team and /partners, so the app can't disagree with the site.
//
// The app parses this shape as-is; keep the keys stable. Flutter draws neither
// SVG nor AVIF, so every image is rasterised here. Paths stay root-relative;
// the app resolves them against https://devfest.cz. Team `links` are left out
// on purpose: the app doesn't show them and the feed shouldn't publish them.

type Sources = Record<string, { default: ImageMetadata }>;

// Same filename keying as team.astro / partners.astro.
const byFile = (sources: Sources) =>
	new Map(Object.entries(sources).map(([path, mod]) => [path.split('/').pop() as string, mod.default]));

const teamSources = byFile(import.meta.glob<{ default: ImageMetadata }>('../../assets/team/*.webp', { eager: true }));
const partnerSources = byFile(
	import.meta.glob<{ default: ImageMetadata }>('../../assets/partners/**/*', { eager: true })
);

// Partners in /partners page order: the ladder top tier first, then the
// community and media rows; `order` within a tier.
const TIER_RANK = ['diamond', 'platinum', 'gold', 'silver', 'community', 'media'];

const imageUrl = async (
	sources: Map<string, ImageMetadata>,
	file: string | undefined,
	options: { width?: number; height?: number; format: 'png' | 'webp' }
) => {
	const src = file ? sources.get(file.split('/').pop() as string) : undefined;
	return src ? (await getImage({ src, ...options })).src : undefined;
};

export const GET: APIRoute = async () => {
	const team = await Promise.all(
		(await getCollection('team'))
			.sort((a, b) => a.data.order - b.data.order)
			.map(async ({ id, data }) => ({
				id,
				order: data.order,
				name: data.name,
				alias: data.alias,
				role: data.role,
				// B&W portrait, 2× a phone avatar.
				photo: await imageUrl(teamSources, data.photo, { width: 240, format: 'webp' }),
			}))
	);
	const partners = await Promise.all(
		(await getCollection('partners'))
			.sort((a, b) => TIER_RANK.indexOf(a.data.tier) - TIER_RANK.indexOf(b.data.tier) || a.data.order - b.data.order)
			.map(async ({ id, data }) => ({
				id,
				tier: data.tier,
				order: data.order,
				name: data.name,
				url: data.url,
				plated: data.plated ?? false,
				// 2× the site's 76px logo box.
				logo: await imageUrl(partnerSources, data.logo, { height: 152, format: 'png' }),
			}))
	);
	return new Response(JSON.stringify({ team, partners }), {
		headers: { 'Content-Type': 'application/json; charset=utf-8' },
	});
};
