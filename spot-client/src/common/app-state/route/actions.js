import { ROUTE_CHANGED } from './actionTypes';

/**
 * Action to signal that the router route has changed.
 *
 * @param {string} location - The new location path.
 * @returns {Object}
 */
export function routeChanged(location) {
    return {
        location,
        type: ROUTE_CHANGED
    };
}
