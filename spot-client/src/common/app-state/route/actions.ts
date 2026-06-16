import { ROUTE_CHANGED } from './actionTypes';

/**
 * Action to signal that the router route has changed.
 *
 * @param location - The new location (a history {@code Location}; some tests
 * pass just a path string or a {@code { pathname }} partial).
 * @returns
 */
export function routeChanged(location: any): any {
    return {
        location,
        type: ROUTE_CHANGED
    };
}
