/**
 * Which of our analytics events the ad tags hear, and as what. Pure, so it
 * is tested without a browser; `ads.ts` sends what this returns.
 * Rules: `.claude/rules/analytics.md` ("Ad tags").
 */

/** One call to an ad tag. */
export type AdCall =
	| { tag: 'meta'; event: string; params?: { value: number; currency: string } }
	| { tag: 'linkedin'; conversionId: number };

/** Our event → Meta standard event. Anything not listed stays with GA4. */
const META_EVENTS: Record<string, string> = {
	begin_checkout: 'InitiateCheckout',
	// The ti.to redirect carries no order value, so neither does this.
	ticket_purchase_confirmed: 'Purchase',
	generate_lead: 'Lead',
	sign_up: 'CompleteRegistration',
};

/**
 * `PUBLIC_LINKEDIN_CONVERSION_IDS` (`event:id,event:id`) → a map from our
 * event name to a LinkedIn conversion id. Malformed pairs are dropped.
 */
export function parseConversionIds(raw: string): Record<string, number> {
	const ids: Record<string, number> = {};
	for (const pair of raw.split(',')) {
		const [name, id] = pair.split(':').map((part) => part.trim());
		const parsed = Number(id);
		if (name && Number.isSafeInteger(parsed) && parsed > 0) ids[name] = parsed;
	}
	return ids;
}

/** The ad calls for one of our events: none, one or both tags. A value is
 * sent only with its currency, as GA4 does. */
export function adEventsFor(
	name: string,
	params: Record<string, unknown> | undefined,
	linkedinIds: Record<string, number>,
): AdCall[] {
	const calls: AdCall[] = [];
	const metaEvent = META_EVENTS[name];
	if (metaEvent) {
		const value = params?.value;
		const currency = params?.currency;
		calls.push(
			typeof value === 'number' && Number.isFinite(value) && typeof currency === 'string'
				? { tag: 'meta', event: metaEvent, params: { value, currency } }
				: { tag: 'meta', event: metaEvent },
		);
	}
	const conversionId = linkedinIds[name];
	if (conversionId) calls.push({ tag: 'linkedin', conversionId });
	return calls;
}
