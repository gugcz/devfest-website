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

// Side-effect import: applies setGlobalOptions before any function is defined.
// Must stay the first import so the defaults are in place when the domain
// modules' function factories run.
import './options.js';

export * from './tickets/index.js';
export * from './invoice/index.js';
export * from './sessionize/index.js';
export * from './lineup/index.js';
