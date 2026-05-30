import { ROUTE_CHANGED } from './actionTypes';

/**
 * Action to signal that the router route has changed.
 *
 * @param location - The new location path.
 * @returns
 */
export function routeChanged(location: string): any {
    return {
        location,
        type: ROUTE_CHANGED
    };
}
