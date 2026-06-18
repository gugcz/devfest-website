/**
 * Project-wide Cloud Functions defaults.
 *
 * Imported FIRST from `index.ts` so `setGlobalOptions` runs before any
 * function factory (onCall/onRequest/onSchedule) executes — otherwise the
 * defaults wouldn't apply. ES modules evaluate imports in source order, so the
 * leading `import './options.js'` in the barrel guarantees this side effect
 * lands before the domain modules load.
 *
 * `maxInstances` is a cost ceiling: this codebase shares a billing project
 * with the mobile-app team, so a retry storm or the public `titoWebhook` flood
 * path must not be able to fan out unboundedly. Per-function overrides (e.g.
 * the tighter cap on `submitInvoiceRequest`) still win where set.
 */

import { setGlobalOptions } from 'firebase-functions/v2';

setGlobalOptions({ maxInstances: 10 });
