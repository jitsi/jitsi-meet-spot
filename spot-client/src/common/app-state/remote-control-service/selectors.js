import { getInMeetingStatus } from '../spot-tv/selectors';

import { requestStates, requestTypes } from './constants';

/**
 * A selector which returns the desired audio mute state of any pending audio
 * mute request.
 *
 * @param {Object} state - The Redux state.
 * @returns {boolean|undefined} The boolean for the pending audio mute state
 * will be returned if a request is pending, otherwise undefined is returned.
 */
export function getOptimisticAudioMuteState(state) {
    return isAudioMutePending(state)
        ? state.remoteControlService[requestTypes.AUDIO_MUTE].expectedState
        : undefined;
}

/**
 * A selector which returns the desired video mute state of any pending video
 * mute request.
 *
 * @param {Object} state - The Redux state.
 * @returns {boolean|undefined} The boolean for the pending video mute state
 * will be returned if a request is pending, otherwise undefined is returned.
 */
export function getOptimisticVideoMuteState(state) {
    return isVideoMutePending(state)
        ? state.remoteControlService[requestTypes.VIDEO_MUTE].expectedState
        : undefined;
}

/**
 * A selector which returns the whether or a not an audio mute change command
 * is currently in flight.
 *
 * @param {Object} state - The Redux state.
 * @returns {boolean}
 */
export function isAudioMutePending(state) {
    const audioMute = state.remoteControlService[requestTypes.AUDIO_MUTE];

    return Boolean(audioMute && audioMute.requestState === requestStates.PENDING);
}

/**
 * A selector which returns the whether or not {@code remoteControlService} has
 * a valid connection to a Spot-MUC.
 *
 * @param {Object} state - The Redux state.
 * @returns {boolean}
 */
export function isConnectionEstablished(state) {
    const connection = state.remoteControlService[requestTypes.CONNECTION];

    return Boolean(connection && connection.requestState === requestStates.DONE);
}

/**
 * A selector which returns the whether or not {@code remoteControlService} is
 * actively trying to establish a connection to a Spot-MUC.
 *
 * @param {Object} state - The Redux state.
 * @returns {boolean}
 */
export function isConnectionPending(state) {
    const connection = state.remoteControlService[requestTypes.CONNECTION];

    return Boolean(connection && connection.requestState === requestStates.PENDING);
}

/**
 * A selector which returns the whether or a not an video mute change command
 * is currently in flight.
 *
 * @param {Object} state - The Redux state.
 * @returns {boolean}
 */
export function isVideoMutePending(state) {
    const videoMute = state.remoteControlService[requestTypes.VIDEO_MUTE];

    return Boolean(videoMute && videoMute.requestState === requestStates.PENDING);
}

/**
 * A selector which returns the whether or a not the local Spot-Remote is
 * actively screensharing wirelessly.
 *
 * @param {Object} state - The Redux state.
 * @returns {boolean}
 */
export function isWirelessScreensharingLocally(state) {
    return Boolean(state.remoteControlService.isWirelessScreensharing);
}

/**
 * Tells whether or not the wireless screensharing is pending.
 *
 * @param {Object} state - The Redux state.
 * @returns {boolean}
 */
export function isWirelessScreensharingPending(state) {
    const inMeetingState = getInMeetingStatus(state);

    if (inMeetingState.inMeeting) {
        return state.remoteControlService[requestTypes.SCREENSHARE] === requestStates.PENDING;
    }

    return state.remoteControlService.joinWithScreensharing === 'wireless';
}
