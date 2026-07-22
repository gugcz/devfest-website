import { defineCollection, z } from 'astro:content';
import { file } from 'astro/loaders';

// ─────────────────────────────────────────────────────────────────────────────
// CONTENT COLLECTIONS — the editorial datasets that used to live inline in the
// pages (FAQ), or in a hand-written module (partners). Each JSON file is an
// array of objects whose `id` is the entry key for the `file()` loader.
//
// IMPORTANT: `getCollection()` gives no ordering guarantee, so every collection
// carries an explicit numeric `order` and the consuming page sorts on it.
// ─────────────────────────────────────────────────────────────────────────────

// FAQ — grouped Q&A. `a` may contain inline HTML (links, <strong>, …); it is
// rendered with set:html AND reused verbatim in the FAQPage JSON-LD, so it must
// stay a raw string (never Markdown-processed).
const faq = defineCollection({
	loader: file('src/content/faq.json'),
	schema: z.object({
		order: z.number().int(),
		label: z.string(),
		items: z
			.array(
				z.object({
					q: z.string(),
					a: z.string(),
				})
			)
			.min(1),
	}),
});

// Team roster. `photo` / `photoColor` are plain filenames-in-a-path; the actual
// image sources live in src/assets/team and are matched by filename in team.astro.
const team = defineCollection({
	loader: file('src/content/team.json'),
	schema: z.object({
		order: z.number().int(),
		name: z.string(),
		alias: z.string(),
		role: z.string().optional(),
		photo: z.string().optional(),
		photoColor: z.string().optional(),
		links: z
			.array(
				z.object({
					kind: z.enum(['linkedin', 'github', 'web', 'instagram', 'email']),
					url: z.string(),
				})
			)
			.optional(),
	}),
});

// Partners — one flat list; `tier` places each logo on the sponsor ladder.
// `media` is deliberately outside the ladder (shown only on /partners).
const partners = defineCollection({
	loader: file('src/content/partners.json'),
	schema: z.object({
		tier: z.enum(['diamond', 'platinum', 'gold', 'silver', 'media']),
		order: z.number().int(),
		name: z.string(),
		logo: z.string(),
		url: z.string().optional(),
	}),
});

export const collections = { faq, team, partners };
