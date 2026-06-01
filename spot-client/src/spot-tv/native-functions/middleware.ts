
import type { RootState } from 'common/app-state';
import { SPOT_TV_SET_REMOTE_JOIN_CODE, SPOT_TV_SET_STATE, getCurrentView } from 'common/app-state';
import { BOOTSTRAP_COMPLETE } from 'common/app-state/bootstrap';
import { MiddlewareRegistry, StateListenerRegistry } from 'common/redux';
import { SET_LONG_LIVED_PAIRING_CODE_INFO, getLongLivedPairingCodeInfo } from 'spot-tv/backend';

import nativeCommands from './native-commands';
import nativeController from './native-controller';

/**
 * State listener to listen to meeting status changes.
 */
StateListenerRegistry.register((state: RootState) => getCurrentView(state) === 'meeting', (inMeeting: boolean) => {
    nativeCommands.sendMeetingStatus(inMeeting ? 1 : 0);
});

/**
 * The redux middleware for the native-controller feature.
 *
 * @param store - The redux store.
 * @returns {Function}
 */
MiddlewareRegistry.register(({ getState }: any) => (next: any) => (action: any) => {
    const result = next(action);

    switch (action.type) {
    case BOOTSTRAP_COMPLETE:
        nativeController._sendSpotClientReady();
        nativeCommands.sendUpdateLongLivedPairingCode((getLongLivedPairingCodeInfo(getState()) || {}).code);
        break;
    case SET_LONG_LIVED_PAIRING_CODE_INFO:
        nativeCommands.sendUpdateLongLivedPairingCode((action.longLivedPairingCodeInfo || {}).code);
        break;
    case SPOT_TV_SET_REMOTE_JOIN_CODE:
        nativeCommands.sendUpdateRemoteJoinCode(action.remoteJoinCode);
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
 * @param newState - The new state.
 * @returns {void}
 */
function updateAPIMutedState(newState: any): void {
    const { audioMuted, videoMuted } = newState;

    if (audioMuted !== undefined) {
        nativeCommands.sendUpdateMutedState('audio', audioMuted);
    }

    if (videoMuted !== undefined) {
        nativeCommands.sendUpdateMutedState('video', videoMuted);
    }
}
