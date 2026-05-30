import { history } from 'common/history';

import {
    ROUTE_CHANGED
} from './actionTypes';

/**
 * A {@code Reducer} to update the current Redux state for the 'route' feature.
 *
 * @param state - The current Redux state for the 'route' feature.
 * @param action - The Redux state update payload.
 * @returns
 */
const route = (state: any = { location: history.location }, action: any) => {
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
