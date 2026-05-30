import { asyncActionRequestStates } from 'common/async-actions';

import { getInMeetingStatus } from '../spot-tv/selectors';

/**
 * A selector which returns the desired audio mute state of any pending audio
 * mute request.
 *
 * @param state - The Redux state.
 * @returns The boolean for the pending audio mute state
 * will be returned if a request is pending, otherwise undefined is returned.
 */
export function getOptimisticAudioMuteState(state: any): boolean | undefined {
    return isAudioMutePending(state)
        ? state.remoteControlService.audioMute.expectedState
        : undefined;
}

/**
 * A selector which returns the desired raise hand state of any pending raise
 * hand request.
 *
 * @param state - The Redux state.
 * @returns The boolean for the pending raise hand state
 * will be returned if a request is pending, otherwise undefined is returned.
 */
export function getOptimisticHandRaisedState(state: any): boolean | undefined {
    return isRaiseHandPending(state)
        ? state.remoteControlService.handRaised.expectedState
        : undefined;
}

/**
 * A selector which returns the desired tile view state of any pending tile
 * view request.
 *
 * @param state - The Redux state.
 * @returns The boolean for the pending tile view state
 * will be returned if a request is pending, otherwise undefined is returned.
 */
export function getOptimisticTileViewState(state: any): boolean | undefined {
    return isTileViewChangePending(state)
        ? state.remoteControlService.tileView.expectedState
        : undefined;
}

/**
 * A selector which returns the desired video mute state of any pending video
 * mute request.
 *
 * @param state - The Redux state.
 * @returns The boolean for the pending video mute state
 * will be returned if a request is pending, otherwise undefined is returned.
 */
export function getOptimisticVideoMuteState(state: any): boolean | undefined {
    return isVideoMutePending(state)
        ? state.remoteControlService.videoMute.expectedState
        : undefined;
}

/**
 * A selector which returns whether or a not an audio mute change command
 * is currently in flight.
 *
 * @param state - The Redux state.
 * @returns
 */
export function isAudioMutePending(state: any): boolean {
    const audioMute = state.remoteControlService.audioMute;

    return Boolean(
        audioMute
            && audioMute.requestState === asyncActionRequestStates.PENDING);
}

/**
 * A selector which returns the whether or not {@code remoteControlService} is
 * currently establishing a connection to a Spot-MUC.
 *
 * @param state - The Redux state.
 * @returns
 */
export function isConnectionPending(state: any): boolean {
    const connect = state.remoteControlService.connect;

    return Boolean(connect && connect.requestState === asyncActionRequestStates.PENDING);
}

/**
 * A selector which returns whether or a not a raise hand change command
 * is currently in flight.
 *
 * @param state - The Redux state.
 * @returns
 */
export function isRaiseHandPending(state: any): boolean {
    const handRaised = state.remoteControlService.handRaised;

    return Boolean(
        handRaised?.requestState === asyncActionRequestStates.PENDING);
}

/**
 * A selector which returns the whether or not {@code remoteControlService} has
 * a valid connection to a Spot-MUC.
 *
 * @param state - The Redux state.
 * @returns
 */
export function isConnectionEstablished(state: any): boolean {
    const connect = state.remoteControlService.connect;

    return Boolean(connect && connect.requestState === asyncActionRequestStates.DONE);
}

/**
 * A selector which returns the whether or not reconnection is scheduled.
 * Reconnection in flight can be determined with a combination of this selector
 * and {@code isConnectionPending}.
 *
 * @param state - The Redux state.
 * @returns
 */
export function isReconnecting(state: any): boolean {
    return Boolean(state.remoteControlService.isReconnectScheduled)
        && !isConnectionEstablished(state);
}

/**
 * A selector which returns whether or a not a tile view change command
 * is currently in flight.
 *
 * @param state - The Redux state.
 * @returns
 */
export function isTileViewChangePending(state: any): boolean {
    const tileView = state.remoteControlService.tileView;

    return Boolean(
        tileView && tileView.requestState === asyncActionRequestStates.PENDING);
}

/**
 * A selector which returns whether or a not an video mute change command
 * is currently in flight.
 *
 * @param state - The Redux state.
 * @returns
 */
export function isVideoMutePending(state: any): boolean {
    const videoMute = state.remoteControlService.videoMute;

    return Boolean(
        videoMute
            && videoMute.requestState === asyncActionRequestStates.PENDING);
}

/**
 * A selector which returns the desired whiteboard state of any pending
 * whiteboard toggle request.
 *
 * @param state - The Redux state.
 * @returns The boolean for the pending whiteboard state
 * will be returned if a request is pending, otherwise undefined is returned.
 */
export function getOptimisticWhiteboardState(state: any): boolean | undefined {
    return isWhiteboardChangePending(state)
        ? state.remoteControlService.whiteboard.expectedState
        : undefined;
}

/**
 * A selector which returns whether or not a whiteboard toggle command
 * is currently in flight.
 *
 * @param state - The Redux state.
 * @returns
 */
export function isWhiteboardChangePending(state: any): boolean {
    const whiteboard = state.remoteControlService.whiteboard;

    return Boolean(
        whiteboard && whiteboard.requestState === asyncActionRequestStates.PENDING);
}

/**
 * A selector which returns whether or a not the local Spot-Remote is
 * actively screensharing wirelessly.
 *
 * @param state - The Redux state.
 * @returns
 */
export function isWirelessScreensharingLocally(state: any): boolean {
    return Boolean(state.remoteControlService.isWirelessScreensharing);
}

/**
 * Tells whether or not the wireless screensharing is pending.
 *
 * @param state - The Redux state.
 * @returns
 */
export function isWirelessScreensharingPending(state: any): boolean {
    const inMeetingState = getInMeetingStatus(state);

    if (inMeetingState.inMeeting) {
        return state.remoteControlService.screenshare === asyncActionRequestStates.PENDING;
    }

    return state.remoteControlService.joinWithScreensharing === 'wireless';
}
