import { asyncActionRequestStates } from 'common/async-actions';

import { getInMeetingStatus } from '../spot-tv/selectors';

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
        ? state.remoteControlService.audioMute.expectedState
        : undefined;
}

/**
 * A selector which returns the desired tile view state of any pending tile
 * view request.
 *
 * @param {Object} state - The Redux state.
 * @returns {boolean|undefined} The boolean for the pending tile view state
 * will be returned if a request is pending, otherwise undefined is returned.
 */
export function getOptimisticTileViewState(state) {
    return isTileViewChangePending(state)
        ? state.remoteControlService.tileView.expectedState
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
        ? state.remoteControlService.videoMute.expectedState
        : undefined;
}

/**
 * A selector which returns whether or a not an audio mute change command
 * is currently in flight.
 *
 * @param {Object} state - The Redux state.
 * @returns {boolean}
 */
export function isAudioMutePending(state) {
    const audioMute = state.remoteControlService.audioMute;

    return Boolean(
        audioMute
            && audioMute.requestState === asyncActionRequestStates.PENDING);
}

/**
 * A selector which returns the whether or not {@code remoteControlService} is
 * currently establishing a connection to a Spot-MUC.
 *
 * @param {Object} state - The Redux state.
 * @returns {boolean}
 */
export function isConnectionPending(state) {
    const connect = state.remoteControlService.connect;

    return Boolean(connect && connect.requestState === asyncActionRequestStates.PENDING);
}

/**
 * A selector which returns the whether or not {@code remoteControlService} has
 * a valid connection to a Spot-MUC.
 *
 * @param {Object} state - The Redux state.
 * @returns {boolean}
 */
export function isConnectionEstablished(state) {
    const connect = state.remoteControlService.connect;

    return Boolean(connect && connect.requestState === asyncActionRequestStates.DONE);
}

/**
 * A selector which returns whether or a not a tile view change command
 * is currently in flight.
 *
 * @param {Object} state - The Redux state.
 * @returns {boolean}
 */
export function isTileViewChangePending(state) {
    const tileView = state.remoteControlService.tileView;

    return Boolean(
        tileView && tileView.requestState === asyncActionRequestStates.PENDING);
}

/**
 * A selector which returns whether or a not an video mute change command
 * is currently in flight.
 *
 * @param {Object} state - The Redux state.
 * @returns {boolean}
 */
export function isVideoMutePending(state) {
    const videoMute = state.remoteControlService.videoMute;

    return Boolean(
        videoMute
            && videoMute.requestState === asyncActionRequestStates.PENDING);
}

/**
 * A selector which returns whether or a not the local Spot-Remote is
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
        return state.remoteControlService.screenshare === asyncActionRequestStates.PENDING;
    }

    return state.remoteControlService.joinWithScreensharing === 'wireless';
}
