import {
    REMOTE_CONTROL_SET_JOIN_CODE,
    REMOTE_CONTROL_SET_LOCK,
    REMOTE_CONTROL_SET_MEETING,
    REMOTE_CONTROL_SET_ROOM_NAME,
    REMOTE_CONTROL_SET_SPOT_STATE,
    REMOTE_CONTROL_SPOT_LEFT
} from './action-types';

/**
* Updates the known join code for connecting a remote to a Spot.
*
* @param {string} joinCode - The string necessary for a remote control to
* connect to a spot.
* @returns {Object}
*/
export function setJoinCode(joinCode) {
    return {
        type: REMOTE_CONTROL_SET_JOIN_CODE,
        joinCode
    };
}

/**
* Updates the known lock code necessary to establish a remote control
* connection.
*
* @param {string} lock - The latest lock code string.
* @returns {Object}
*/
export function setLock(lock) {
    return {
        type: REMOTE_CONTROL_SET_LOCK,
        lock
    };
}

/**
* Sets a reference to the in-progress meeting so it can be used elsewhere.
*
* @param {Object} meetingApi - An instance of {@code JitsiMeetExternalAPI}.
* @returns {Object}
*/
export function setMeetingApi(meetingApi) {
    return {
        type: REMOTE_CONTROL_SET_MEETING,
        meetingApi
    };
}

/**
* Updates the known muc room name being joined in order to communicate between
* remote and a Spot instance.
*
* @param {string} roomName - The latest room name.
* @returns {Object}
*/
export function setRoomName(roomName) {
    return {
        type: REMOTE_CONTROL_SET_ROOM_NAME,
        roomName
    };
}

/**
* Signals a Spot has become no longer available to control.
*
* @returns {Object}
*/
export function setSpotLeft() {
    return {
        type: REMOTE_CONTROL_SPOT_LEFT
    };
}

/**
* Signals Spot has changed some part of its status that should be known to
* remote controls.
*
* @param {Object} state - The new state that should be mixed in with the stored
* state.
* @returns {Object}
*/
export function updateSpotState(state) {
    return {
        type: REMOTE_CONTROL_SET_SPOT_STATE,
        state
    };
}
