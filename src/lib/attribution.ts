/**
 * Carry the campaign a visitor arrived with (`utm_*`) over to ti.to.
 *
 * GA4 attributes the session from the entry URL, but checkout runs on ti.to
 * and its reports only know what the ti.to link carries. ti.to's own
 * attribution is `?source=<code>` (Reports → Sources), so `utm_source`
 * becomes `source`; the raw `utm_*` ride along too.
 *
 * Captured at module load, before `<ClientRouter />` soft-navigates the
 * query string away, and kept in sessionStorage so a full reload or a second
 * tab of the same visit still has it. Campaign names only: no identifier, no
 * cookie, nothing sent anywhere until the visitor clicks through to ti.to.
 */

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;
const STORAGE_KEY = 'devfest:utm';
const TITO_HOST = 'ti.to';

type Campaign = Partial<Record<(typeof UTM_KEYS)[number], string>>;

/** The `utm_*` pairs in a query string, or `null` when there are none. */
export function readCampaign(search: string): Campaign | null {
	const params = new URLSearchParams(search);
	const campaign: Campaign = {};
	for (const key of UTM_KEYS) {
		const value = params.get(key)?.trim();
		if (value) campaign[key] = value.slice(0, 100);
	}
	return Object.keys(campaign).length ? campaign : null;
}

/**
 * `href` with the campaign appended when it points at ti.to. Params the link
 * already carries win (a discount or partner link with its own `source`).
 */
export function withCampaign(href: string, campaign: Campaign | null): string {
	if (!campaign) return href;
	let url: URL;
	try {
		url = new URL(href);
	} catch {
		return href;
	}
	if (url.hostname !== TITO_HOST) return href;
	const pairs: Array<[string, string | undefined]> = [
		['source', campaign.utm_source],
		...UTM_KEYS.map((key): [string, string | undefined] => [key, campaign[key]]),
	];
	for (const [key, value] of pairs) {
		if (value && !url.searchParams.has(key)) url.searchParams.set(key, value);
	}
	return url.toString();
}

function storedCampaign(): Campaign | null {
	try {
		const raw = sessionStorage.getItem(STORAGE_KEY);
		return raw ? (JSON.parse(raw) as Campaign) : null;
	} catch {
		return null;
	}
}

/** Last touch wins: a new campaign URL within the visit replaces the old. */
function captureCampaign(): Campaign | null {
	const fresh = readCampaign(window.location.search);
	if (!fresh) return storedCampaign();
	try {
		sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
	} catch {
		// Storage blocked: the in-memory copy still covers this page's clicks.
	}
	return fresh;
}

let campaign: Campaign | null = null;

/**
 * Rewrite a ti.to link's href just before it is followed. Delegated on the
 * document, so it covers every surface (Tickets, InviteCta, the discount
 * link, the event link) without touching their render: an href that differs
 * between the server and the browser would break island hydration.
 * `pointerdown` catches middle-click and cmd-click, `click` the keyboard.
 */
export function initCampaignLinks(): void {
	if (typeof window === 'undefined') return;
	campaign = captureCampaign();
	if (!campaign) return;
	const rewrite = (event: Event) => {
		const link = (event.target as Element | null)?.closest?.('a[href]');
		if (!(link instanceof HTMLAnchorElement)) return;
		const next = withCampaign(link.href, campaign);
		if (next !== link.href) link.href = next;
	};
	document.addEventListener('pointerdown', rewrite, true);
	document.addEventListener('click', rewrite, true);
}
