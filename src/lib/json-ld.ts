/**
 * Serialiser for every `<script type="application/ld+json">` on the site.
 *
 * `set:html` writes its string verbatim, and `JSON.stringify` does not escape
 * `<`. An HTML parser ends a `<script>` element at the first `</script`
 * sequence in its text, wherever that sequence came from — so a single
 * `</script>` inside any interpolated value terminates the block early, breaks
 * the structured data, and turns whatever follows into live markup.
 *
 * That is not hypothetical here: the lineup graphs interpolate Sessionize free
 * text (speaker bios and taglines, talk titles and abstracts, room names) which
 * speakers write themselves. Escaping `<` as `\u003c` is the standard fix — it
 * is valid JSON, parses back to `<`, and leaves the structured data identical.
 *
 * Use this at EVERY ld+json emit site, including ones whose data looks like it
 * is all in-repo constants today. The point is that the next person to add a
 * field should not have to know which values are trusted.
 */
export function ldJson(value: unknown): string {
	return JSON.stringify(value).replace(/</g, '\\u003c');
}
