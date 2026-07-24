/**
 * `renderPages` — 2nd-gen HTTPS function that serves the on-demand `/speakers`
 * and `/sessions` routes. Firebase Hosting rewrites those paths here (see
 * firebase.json), the CDN caches the response, and this function renders only on
 * a cache miss.
 *
 * It wraps the pre-built Astro Node adapter handler. `./server` is the site's
 * `dist/server` output, staged into this dir by the firebase.json `predeploy`
 * step (never committed — see .gitignore). The website build runs on the CI
 * runner (Node ≥ 22.12); this function runtime is nodejs22.
 *
 * Deployed in its own codebase (`website-ssr`) so it stays isolated from the
 * `website` functions and from the mobile-app repo that shares this Firebase
 * project. `maxInstances` mirrors functions/src/options.ts as a shared-billing
 * cost ceiling; `minInstances: 1` keeps one instance warm so a cache miss never
 * pays a cold start (the whole point of the fix).
 */
// ⚠️ The staged ./server bundle is compiled by the ROOT toolchain but runs
// against ssr/package.json's node_modules — keep the shared deps (astro,
// @astrojs/node, react, react-dom, firebase-admin) version-paired with the root
// package.json, or a one-sided bump causes silent runtime version skew.
import { onRequest } from 'firebase-functions/v2/https';
import { handler as astroHandler } from './server/entry.mjs';

export const renderPages = onRequest(
	{
		region: 'europe-west1',
		invoker: 'public',
		minInstances: 1,
		maxInstances: 10,
		memory: '512MiB',
	},
	(req, res) => {
		// The Astro middleware handler is (req, res, next). Nothing follows it, so
		// a request it doesn't match (shouldn't happen — only rewritten paths reach
		// here) falls through to a 404.
		astroHandler(req, res, () => {
			res.statusCode = 404;
			res.setHeader('Content-Type', 'text/plain');
			res.end('Not found');
		});
	},
);
