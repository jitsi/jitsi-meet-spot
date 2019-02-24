/**
 * A selector which returns the last known lock code for establishing a remote
 * control connection.
 *
 * @param {Object} state - The Redux state.
 * @returns {string}
 */
export function getCurrentLock(state) {
    return state.remoteControl.lock;
}

/**
* A selector which returns the last known room name for establishing a remote
* control connection.
*
* @param {Object} state - The Redux state.
* @returns {string}
*/
export function getCurrentRoomName(state) {
    return state.remoteControl.roomName;
}

/**
* A selector which returns the current view that is being displayed on Spot.
*
* @param {Object} state - The Redux state.
* @returns {string}
*/
export function getCurrentView(state) {
    return state.remoteControl.view;
}

/**
* A selector which returns the current status of various meeting features.
*
* @param {Object} state - The Redux state.
* @returns {Object}
*/
export function getInMeetingStatus(state) {
    return {
        audioMuted: state.remoteControl.audioMuted,
        inMeeting: state.remoteControl.inMeeting,
        isWirelessScreenshareConnectionActive:
            state.remoteControl.isWirelessScreenshareConnectionActive,
        screensharing: state.remoteControl.screensharing,
        videoMuted: state.remoteControl.videoMuted,
        wiredScreensharingEnabled:
            state.remoteControl.wiredScreensharingEnabled
    };
}

/**
* A selector which returns the known join code needed for pairing to a Spot.
*
* @param {Object} state - The Redux state.
* @returns {string}
*/
export function getJoinCode(state) {
    return state.remoteControl.joinCode;
}

/**
* A selector which returns the api (a delegate which is an instance of
* {@code JitsiMeetExternalAPI}) that can be used to directly
* manipulate the meeting.
*
* @param {Object} state - The Redux state.
* @returns {Object|null}
*/
export function getMeetingApi(state) {
    return state.remoteControl.meetingApi;
}

/**
* A selector which returns the JID of the Spot to remotely control.
*
* @param {Object} state - The Redux state.
* @returns {string|null}
*/
export function getSpotId(state) {
    return state.remoteControl.spotId;
}

/**
* A selector which returns an id to be used by Spot and remote controls to
* identify each other through the remote control service.
*
* @param {Object} state - The Redux state.
* @returns {string}
*/
export function getLocalRemoteControlId(state) {
    return state.remoteControl.localId;
}

/**
* A selector which returns whether or not there the application is able to
* send and receive messages from a Spot.
*
* @param {Object} state - The Redux state.
* @returns {boolean}
*/
export function isConnectedToSpot(state) {
    return Boolean(state.remoteControl.spotId);
}
