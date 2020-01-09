import { MiddlewareRegistry } from 'common/redux';
import { nativeController } from 'spot-tv/native-functions/native-controller';

import { SPOT_TV_SET_STATE } from './action-types';

MiddlewareRegistry.register(() => next => action => {
    const result = next(action);

    switch (action.type) {
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
