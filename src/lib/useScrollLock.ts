import { useEffect } from 'react';
import { lockScroll } from './scroll-lock';

/**
 * Holds the page still while a dialog is mounted. See `scroll-lock.ts` for why
 * `overflow: hidden` alone doesn't do it and why the lock is counted.
 */
export function useScrollLock(): void {
	useEffect(() => lockScroll(), []);
}
