
import { SPOT_TV_SET_REMOTE_JOIN_CODE, SPOT_TV_SET_STATE } from 'common/app-state';
import { BOOTSTRAP_COMPLETE } from 'common/app-state/bootstrap';
import { MiddlewareRegistry } from 'common/redux';
import { SET_LONG_LIVED_PAIRING_CODE_INFO, getLongLivedPairingCodeInfo } from 'spot-tv/backend';
import nativeController from './native-controller';

/**
 * The redux middleware for the native-controller feature.
 *
 * @param {Store} store - The redux store.
 * @returns {Function}
 */
MiddlewareRegistry.register(({ getState }) => next => action => {
    const result = next(action);

    switch (action.type) {
    case BOOTSTRAP_COMPLETE:
        nativeController._sendSpotClientReady();
        sendLongLivedPairingCode(getLongLivedPairingCodeInfo(getState()));
        break;
    case SET_LONG_LIVED_PAIRING_CODE_INFO:
        sendLongLivedPairingCode(action.longLivedPairingCodeInfo);
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
 * Sends the long lived pairing code through the external API when updated.
 *
 * @param {Object} codeInfo - The pairing code info we have on record.
 * @returns {void}
 */
function sendLongLivedPairingCode(codeInfo) {
    nativeController.sendMessage('updateLongLivedPairingCode', {
        longLivedPairingCode: (codeInfo || {}).code
    });
}

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
