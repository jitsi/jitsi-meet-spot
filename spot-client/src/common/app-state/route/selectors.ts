import { stripBasename } from 'common/history';

import type { RootState } from '../types';

/**
 * Returns the current route, relative to the app basename so it can be compared
 * against the root-relative {@code ROUTES} constants. (The stored location holds
 * the raw browser pathname, which includes the basename for sub-directory
 * deployments.)
 *
 * @param state - The Redux state.
 * @returns
 */
export function getCurrentRoute(state: RootState): string | undefined {
    const pathname = state.route.location?.pathname;

    return pathname === undefined ? undefined : stripBasename(pathname);
}
