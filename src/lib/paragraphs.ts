/** Split free text (a bio, an abstract) on blank lines into paragraphs,
 * dropping the empty ones. */
export function paragraphs(text: string): string[] {
	return text.split(/\n{2,}|\r\n\r\n/).filter((p) => p.trim());
}
