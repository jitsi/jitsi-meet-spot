import { getDisplayName } from 'common/app-state';

/**
* A selector which returns the current view that is being displayed on Spot-TV.
*
* @param state - The Redux state.
* @returns
*/
export function getCurrentView(state: any): string {
    return state.spotTv.view;
}

/**
* A selector which returns the current status of various in-meeting features.
*
* @param state - The Redux state.
* @returns
*/
export function getInMeetingStatus(state: any): any {
    return {
        audioMuted: state.spotTv.audioMuted,
        inMeeting: state.spotTv.inMeeting,
        handRaised: state.spotTv.handRaised,
        kicked: state.spotTv.kicked,
        meetingDisplayName: state.spotTv.meetingDisplayName,
        needPassword: state.spotTv.needPassword,
        recordingConsentDialogOpen: state.spotTv.recordingConsentDialogOpen,
        screensharingType: state.spotTv.screensharingType,
        tileView: state.spotTv.tileView,
        videoMuted: state.spotTv.videoMuted,
        waitingForMeetingStart: state.spotTv.waitingForMeetingStart,
        whiteboardOpen: state.spotTv.whiteboardOpen,
        wiredScreensharingEnabled:
            state.spotTv.wiredScreensharingEnabled
    };
}

/**
 * Returns the phone number that Spot TV has invited(dial out) into the meeting.
 *
 * @param state - The Redux state.
 * @returns
 */
export function getInvitedPhoneNumber(state: any): string | undefined {
    return state.spotTv.invitedPhoneNumber;
}

/**
* A selector which returns the join code needed for pairing to a Spot-Remote to
* connect to the same MUC as the Spot-TV.
*
* @param state - The Redux state.
* @returns
*/
export function getRemoteJoinCode(state: any): string {
    return state.spotTv.remoteJoinCode;
}

/**
 * A selector which returns the remotely configured name to use for the Spot-TV
 * to be displayed while in a meeting.
 *
 * @param state - The Redux state.
 * @returns
 */
export function getRemoteSpotTVRoomName(state: any): string | undefined {
    return state.spotTv.roomName;
}

/**
 * A selector which returns either the locally or the remotely configured name to use for the Spot-TV
 * to be displayed while in a meeting.
 *
 * @param state - The Redux state.
 * @returns
 */
export function getSpotRoomName(state: any): string | undefined {
    return getDisplayName(state) || getRemoteSpotTVRoomName(state);
}

/**
 * Returns a tenant name advertised by Spot TV.
 *
 * @param state - The Redux state.
 * @returns
 */
export function getSpotTVTenant(state: any): string | undefined {
    return state.spotTv.tenant;
}

/**
* A selector for Spot-Remote which returns whether or not it is currently
* able to communicate with a Spot-TV.
*
* @param state - The Redux state.
* @returns
*/
export function isConnectedToSpot(state: any): boolean {
    return Boolean(state.spotTv.spotId);
}

/**
 * A selector which returns whether or not the Spot-TV has volume control
 * support.
 *
 * @param state - The Redux state.
 * @returns
 */
export function isVolumeControlSupported(state: any): boolean {
    const { electron, volumeControlSupported } = state.spotTv;

    return Boolean(electron || volumeControlSupported);
}
