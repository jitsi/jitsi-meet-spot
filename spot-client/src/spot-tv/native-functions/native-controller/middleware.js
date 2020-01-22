
import { SPOT_TV_SET_REMOTE_JOIN_CODE, SPOT_TV_SET_STATE } from 'common/app-state';
import { BOOTSTRAP_COMPLETE } from 'common/app-state/bootstrap';
import { MiddlewareRegistry } from 'common/redux';

import nativeController from './native-controller';

/**
 * The redux middleware for the native-controller feature.
 *
 * @param {Store} store - The redux store.
 * @returns {Function}
 */
MiddlewareRegistry.register(() => next => action => {
    const result = next(action);

    switch (action.type) {
    case BOOTSTRAP_COMPLETE:
        nativeController._sendSpotClientReady();
        break;
    case SPOT_TV_SET_REMOTE_JOIN_CODE:
        nativeController.sendMessage('updateJoinCode', {
            remoteJoinCode: action.remoteJoinCode
        });
        break;
    case SPOT_TV_SET_STATE:
        updateAPIMutedState(action.newState);
        break;
    }

    return result;
});

/**
 * Sends part of the new state through the external API if necessary.
 *
 * @param {Object} newState - The new state.
 * @returns {void}
 */
function updateAPIMutedState(newState) {
    const { audioMuted, videoMuted } = newState;

    audioMuted !== undefined && nativeController.sendMessage('audioMutedState', audioMuted);
    videoMuted !== undefined && nativeController.sendMessage('videoMutedState', videoMuted);
}
