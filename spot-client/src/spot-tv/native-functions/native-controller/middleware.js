
import { BOOTSTRAP_COMPLETE } from 'common/app-state/bootstrap';
import { setSpotTVState } from 'common/app-state/spot-tv/actions';
import { MiddlewareRegistry } from 'common/redux';

import nativeController from './native-controller';

/**
 * The redux middleware for the native-controller feature.
 *
 * @param {Store} store - The redux store.
 * @returns {Function}
 */
MiddlewareRegistry.register(({ dispatch }) => next => action => {
    const result = next(action);

    switch (action.type) {
    case BOOTSTRAP_COMPLETE:
        nativeController._sendSpotClientReady();

        // Setting up native controller listeners
        nativeController.addMessageListener('setMutedState', newState => {
            setMutedState(newState, dispatch);
        });
        break;
    }

    return result;
});

/**
 * Function to update the muted state initiated by an API command.
 *
 * @param {boolean} newState - The state to set.
 * @param {Dispatch} dispatch - The Redux Dispatch function.
 * @returns {void}
 */
function setMutedState(newState, dispatch) {
    dispatch(setSpotTVState({
        audioMuted: newState
    }));
}
