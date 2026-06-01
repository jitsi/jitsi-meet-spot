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
export interface IRouteState {
    location: typeof history.location;
}

const route = (state: IRouteState = { location: history.location }, action: any): IRouteState => {
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
