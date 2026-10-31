/** The resolved feature flags of this build (`src/site.config.ts`). */
import config from '../site.config';
import { unlinkDisabled, type FeatureFlag } from './features';

export type { FeatureFlag } from './features';

/** Whether the section behind `flag` is part of this build. */
export const enabled = (flag: FeatureFlag): boolean => config.features[flag];

/**
 * The link to the ticket section, or `null` when tickets are off. A template
 * that gets `null` renders no ticket action at all: there is no fallback
 * destination.
 */
export const ticketsHref: string | null = enabled('tickets') ? '/#tickets' : null;

/** Keeps the entries whose `feature` is on (or that name none). */
export function enabledOnly<T extends { feature?: FeatureFlag }>(entries: readonly T[]): T[] {
	return entries.filter((entry) => !entry.feature || enabled(entry.feature));
}

/** Authored HTML with the links of every section that is off unwrapped. */
export const unlink = (html: string): string => unlinkDisabled(html, config.features);
