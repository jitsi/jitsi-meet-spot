import { BOOTSTRAP_COMPLETE, BOOTSTRAP_STARTED } from './action-types';

interface IBootstrapState {
    complete: boolean;
}

const DEFAULT_STATE: IBootstrapState = {
    complete: false
};

/**
 * A {@code Reducer} to update the current Redux state for the 'bootstrap'
 * feature which tracks if the initial loading of the application has completed.
 *
 * @param state - The current Redux state for the 'bootstrap' feature.
 * @param action - The Redux state update payload.
 * @returns
 */
export default function bootstrapReducer(state: IBootstrapState = DEFAULT_STATE, action: any): IBootstrapState {
    switch (action.type) {
    case BOOTSTRAP_COMPLETE:
        return {
            ...state,
            complete: true
        };
    case BOOTSTRAP_STARTED:
        return {
            ...state,
            complete: false
        };

    default:
        return state;
    }
}
