/**
 * TEXT A LINK PREVIEW SHOWS: the `<title>`, the description, `og:title`,
 * `og:description` and the image alt. Astro writes every `&` in them as
 * `&amp;`. That is valid HTML, but an unfurler that reads the tag without
 * decoding it shows `conference &amp; festival` (it did on the 2027 home
 * page). HTML needs `&amp;` only where an `&` could start a character
 * reference, so `previewText` escapes it only there (before an ASCII letter,
 * a digit or `#`); `& ` stays bare. `"` (it would end the attribute), `<` and
 * `>` (a scraper that finds `<meta …>` by regex stops at the first `>`) are
 * always escaped. Such an unfurler still shows `Q&amp;A`: a `&` before a
 * letter has to stay escaped.
 */
export function previewText(text: string): string {
	return text
		.replace(/&(?=[\dA-Za-z#])/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

/** The preview `<meta>` tags, by the attribute that names them. */
export type PreviewMetaKey =
	| { name: 'description' | 'twitter:title' | 'twitter:description' | 'twitter:image:alt' }
	| { property: 'og:title' | 'og:description' | 'og:image:alt' };

/** One preview `<meta>` as HTML, its content through `previewText`. */
export function previewMeta(key: PreviewMetaKey, content: string): string {
	const named = 'name' in key ? `name="${key.name}"` : `property="${key.property}"`;
	return `<meta ${named} content="${previewText(content)}" />`;
}
