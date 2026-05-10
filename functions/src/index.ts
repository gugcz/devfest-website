/**
 * Top-level barrel for Cloud Functions.
 *
 * Firebase deploys whichever functions are exported from this entry point.
 * Each domain lives in its own folder under `src/` and re-exports its
 * callables; this file just composes them.
 *
 * Add a new domain:
 *   1. Create `src/<domain>/` with handler files.
 *   2. Add a `src/<domain>/index.ts` that re-exports the callables.
 *   3. Append `export * from './<domain>/index.js';` below.
 */

export * from './tickets/index.js';
