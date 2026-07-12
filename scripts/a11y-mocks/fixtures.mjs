/**
 * Deterministic fixture data for the accessibility audit's mock build.
 *
 * The public lineup (speakers / sessions) and ticket cache live behind Firebase
 * reads that are blocked from CI (App Check + IP rules), so the axe sweep would
 * only ever see the "temporarily unavailable" error state — never the real,
 * hydrated content. Under `A11Y_MOCK=1`, astro.config.mjs aliases
 * `firebase/firestore` / `firebase/database` / `firebase/app-check` to the mock
 * modules beside this file, which replay these fixtures into the components'
 * `onSnapshot` / `onValue` callbacks so the ready-state UI (cards, filters,
 * detail dialogs, ticket waves) renders deterministically and gets audited.
 *
 * Shapes mirror the raw Firestore/RTDB documents the parsers expect
 * (`speakerFromDoc`, `sessionFromDoc`, `TicketsCache`).
 */

// Inline SVG portrait — loads with no network so the <img> render path (not the
// monogram fallback) is exercised in headless Chromium.
const PORTRAIT =
	'data:image/svg+xml,' +
	encodeURIComponent(
		'<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500">' +
			'<rect width="400" height="500" fill="#1a1a1a"/>' +
			'<circle cx="200" cy="200" r="90" fill="#333"/>' +
			'<rect x="90" y="320" width="220" height="160" rx="90" fill="#333"/>' +
			'</svg>',
	);

/** Firestore `speakers` collection — raw docs (pre-ordered by `order`). */
export const SPEAKERS = [
	{
		id: 'sp-ada',
		data: {
			order: 0,
			fullName: 'Ada Lovelace',
			tagLine: 'Mathematician & first programmer',
			bio: 'Ada Lovelace wrote the first algorithm intended for a machine.\n\nShe foresaw computers moving beyond pure calculation into general-purpose tools.',
			profilePicture: PORTRAIT,
			links: [
				{ kind: 'github', url: 'https://github.com/example', label: 'GitHub' },
				{ kind: 'x', url: 'https://x.com/example', label: 'X' },
				{ kind: 'web', url: 'https://example.com', label: 'Website' },
			],
			sessions: [
				{ name: 'Building Resilient Systems', description: 'How to design for failure.' },
			],
		},
	},
	{
		id: 'sp-alan',
		data: {
			order: 1,
			fullName: 'Alan Turing',
			tagLine: '',
			bio: '',
			profilePicture: '',
			links: [],
			sessions: [],
		},
	},
	{
		id: 'sp-grace',
		data: {
			order: 2,
			fullName: 'Grace Hopper',
			tagLine: 'Compiler pioneer',
			bio: 'Grace Hopper popularized machine-independent programming languages.',
			profilePicture: PORTRAIT,
			links: [{ kind: 'linkedin', url: 'https://linkedin.com/in/example', label: 'LinkedIn' }],
			sessions: [{ name: 'AI at the Edge', description: '' }],
		},
	},
	{
		id: 'sp-katherine',
		data: {
			order: 3,
			fullName: 'Katherine Johnson',
			tagLine: 'Orbital mechanics',
			bio: 'Katherine Johnson calculated trajectories for the first US crewed spaceflights.',
			profilePicture: PORTRAIT,
			links: [{ kind: 'web', url: 'https://example.org', label: 'Website' }],
			sessions: [],
		},
	},
	{
		id: 'sp-margaret',
		data: {
			order: 4,
			fullName: 'Margaret Hamilton',
			tagLine: 'Software engineering',
			bio: 'Margaret Hamilton led the Apollo onboard flight software team.',
			profilePicture: '',
			links: [],
			sessions: [{ name: 'The Future of Web', description: '' }],
		},
	},
];

/** Firestore `speakers/{id}` lookup for the session-detail speaker enrichment. */
export const SPEAKERS_BY_ID = Object.fromEntries(SPEAKERS.map((s) => [s.id, s]));

/** Firestore `sessions` collection — raw docs (pre-ordered by `order`). */
export const SESSIONS = [
	{
		id: 'ses-resilient',
		data: {
			order: 0,
			title: 'Building Resilient Systems',
			description:
				'Real systems fail in surprising ways. This talk walks through patterns for graceful degradation.\n\nWe cover timeouts, retries with backoff, circuit breakers, and how to test them.',
			room: 'Main Hall',
			isServiceSession: false,
			speakers: [
				{
					id: 'sp-ada',
					fullName: 'Ada Lovelace',
					tagLine: 'Mathematician & first programmer',
					profilePicture: PORTRAIT,
				},
			],
			categories: [
				{ name: 'Track', values: ['Web'] },
				{ name: 'Level', values: ['Intermediate'] },
				{ name: 'Talk length', values: ['30 minutes'] },
			],
		},
	},
	{
		id: 'ses-ai-edge',
		data: {
			order: 1,
			title: 'AI at the Edge',
			description: 'Running inference on-device: quantization, latency budgets, and privacy wins.',
			room: '',
			isServiceSession: false,
			speakers: [
				{ id: 'sp-grace', fullName: 'Grace Hopper', tagLine: 'Compiler pioneer', profilePicture: '' },
				{ id: 'sp-alan', fullName: 'Alan Turing', tagLine: '', profilePicture: '' },
			],
			categories: [
				{ name: 'Track', values: ['AI/ML'] },
				{ name: 'Level', values: ['Advanced'] },
			],
		},
	},
	{
		id: 'ses-future-web',
		data: {
			order: 2,
			title: 'The Future of Web',
			description: '',
			room: 'Room B',
			isServiceSession: false,
			speakers: [
				{
					id: 'sp-margaret',
					fullName: 'Margaret Hamilton',
					tagLine: 'Software engineering',
					profilePicture: '',
				},
			],
			categories: [{ name: 'Track', values: ['Web'] }],
		},
	},
];

/** RTDB `/tickets` cache (`TicketsCache`) — a full pricing-wave roadmap. */
export const TICKETS = {
	accountSlug: 'devfestcz',
	eventSlug: 'devfest-2026',
	fetchedAt: 0,
	releases: [
		{
			id: 1,
			slug: 'early-bird-individual',
			title: 'Early bird — Individual',
			description: null,
			price: '1000',
			tax_exclusive: true,
			currency: 'CZK',
			sale_status: 'on_sale',
			sold_out: false,
			has_sales: true,
			start_at: null,
			end_at: null,
		},
		{
			id: 2,
			slug: 'early-bird-company-funded',
			title: 'Early bird — Company funded',
			description: null,
			price: '1200',
			tax_exclusive: true,
			currency: 'CZK',
			sale_status: 'on_sale',
			sold_out: false,
			has_sales: true,
			start_at: null,
			end_at: null,
		},
		{
			id: 3,
			slug: 'regular-individual',
			title: 'Regular — Individual',
			description: null,
			price: '1500',
			tax_exclusive: true,
			currency: 'CZK',
			sale_status: 'paused',
			sold_out: false,
			has_sales: false,
			start_at: null,
			end_at: null,
		},
		{
			id: 4,
			slug: 'lazy-bird-individual',
			title: 'Lazy bird — Individual',
			description: null,
			price: '2000',
			tax_exclusive: true,
			currency: 'CZK',
			sale_status: 'sold_out',
			sold_out: true,
			has_sales: true,
			start_at: null,
			end_at: null,
		},
	],
};
