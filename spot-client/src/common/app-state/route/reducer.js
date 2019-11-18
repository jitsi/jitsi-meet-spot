import { history } from 'common/history';

import {
    ROUTE_CHANGED
} from './actionTypes';

/**
 * A {@code Reducer} to update the current Redux state for the 'route' feature.
 *
 * @param {Object} state - The current Redux state for the 'route' feature.
 * @param {Object} action - The Redux state update payload.
 * @returns {Object}
 */
const route = (state = { location: history.location }, action) => {
    switch (action.type) {
    case ROUTE_CHANGED:
        return {
            ...state,
            location: action.location
        };

    default:
        return state;
    }
};

export default route;
