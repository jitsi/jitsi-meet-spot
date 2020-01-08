
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
        nativeController.addMessageListener('setAudioMutedState', newState => {
            setMutedState('audio', newState, dispatch);
        });

        nativeController.addMessageListener('setVideoMutedState', newState => {
            setMutedState('video', newState, dispatch);
        });
        break;
    }

    return result;
});

/**
 * Function to update the muted state initiated by an API command.
 *
 * @param {string} media - The medie to mute/unmute.
 * @param {boolean} newState - The state to set.
 * @param {Dispatch} dispatch - The Redux Dispatch function.
 * @returns {void}
 */
function setMutedState(media, newState, dispatch) {
    dispatch(setSpotTVState({
        [`${media}Muted`]: newState
    }));
}
