/**
* A selector which returns the current view that is being displayed on Spot-TV.
*
* @param {Object} state - The Redux state.
* @returns {string}
*/
export function getCurrentView(state) {
    return state.spotTv.view;
}

/**
* A selector which returns the current status of various in-meeting features.
*
* @param {Object} state - The Redux state.
* @returns {Object}
*/
export function getInMeetingStatus(state) {
    return {
        audioMuted: state.spotTv.audioMuted,
        inMeeting: state.spotTv.inMeeting,
        kicked: state.spotTv.kicked,
        meetingDisplayName: state.spotTv.meetingDisplayName,
        meetingType: state.spotTv.meetingType,
        needPassword: state.spotTv.needPassword,
        screensharingType: state.spotTv.screensharingType,
        tileView: state.spotTv.tileView,
        videoMuted: state.spotTv.videoMuted,
        wiredScreensharingEnabled:
            state.spotTv.wiredScreensharingEnabled
    };
}

/**
 * Returns the phone number that Spot TV has invited(dial out) into the meeting.
 *
 * @param {Object} state - The Redux state.
 * @returns {?string}
 */
export function getInvitedPhoneNumber(state) {
    return state.spotTv.invitedPhoneNumber;
}

/**
* A selector which returns the join code needed for pairing to a Spot-Remote to
* connect to the same MUC as the Spot-TV.
*
* @param {Object} state - The Redux state.
* @returns {string}
*/
export function getRemoteJoinCode(state) {
    return state.spotTv.remoteJoinCode;
}

/**
 * A selector which returns the remotely configured name to use for the Spot-TV
 * to be displayed while in a meeting.
 *
 * @param {Object} state - The Redux state.
 * @returns {boolean}
 */
export function getRemoteSpotTVRoomName(state) {
    return state.spotTv.roomName;
}

/**
 * Returns a tenant name advertised by Spot TV.
 *
 * @param {Object} state - The Redux state.
 * @returns {?string}
 */
export function getSpotTVTenant(state) {
    return state.spotTv.tenant;
}

/**
* A selector for Spot-Remote which returns whether or not it is currently
* able to communicate with a Spot-TV.
*
* @param {Object} state - The Redux state.
* @returns {boolean}
*/
export function isConnectedToSpot(state) {
    return Boolean(state.spotTv.spotId);
}

/**
 * A selector which returns whether or not the Spot-TV has volume control
 * support.
 *
 * @param {Object} state - The Redux state.
 * @returns {boolean}
 */
export function isVolumeControlSupported(state) {
    return Boolean(state.spotTv.electron);
}
