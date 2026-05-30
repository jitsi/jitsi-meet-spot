import {
    SPOT_TV_CLEAR_STATE,
    SPOT_TV_LEAVE_MEETING,
    SPOT_TV_SET_REMOTE_JOIN_CODE,
    SPOT_TV_SET_STATE
} from './action-types';

/**
 * Removes all knowledge of Spot-TV state.
 *
 * @returns {Object}
 */
export function clearSpotTVState(): any {
    return {
        type: SPOT_TV_CLEAR_STATE
    };
}

/**
 * Action dispatched when a meeting is being left due to an error, not due to
 * a deliberate user action.
 *
 * @param error - The representation of the error.
 * @returns {Object}
 */
export function leaveMeetingWithError(error: string): any {
    return {
        type: SPOT_TV_LEAVE_MEETING,
        error
    };
}

/**
* Updates the known join code for connecting a Spot-Remote to a Spot-TV.
*
* @param remoteJoinCode - The string necessary for a Spot-Remote to
* connect to a Spot-TV.
* @returns {Object}
*/
export function setRemoteJoinCode(remoteJoinCode: string): any {
    return {
        type: SPOT_TV_SET_REMOTE_JOIN_CODE,
        remoteJoinCode
    };
}

/**
 * Generic action arbitrarily updating the known state of Spot-TV.
 *
 * @param newState - The new state to be stored in redux.
 * @returns {Object}
 */
export function setSpotTVState(newState: any): any {
    return {
        type: SPOT_TV_SET_STATE,
        newState
    };
}

/**
 * Extracts a phone number(if any) from the invites passed to the meeting view as part of the URL query and stores it in
 * Spot TV state so that Spot Remotes can display it in the UI.
 *
 * @param invites - An array of invites as specified by Jitsi Meet iframe
 * API.
 * @returns {Object}
 */
export function storePhoneNumberFromInvites(invites?: Array<{ type: string; number: string; }>): any {
    const phone = invites?.find(invite => invite.type === 'phone')?.number;

    return setSpotTVState({ invitedPhoneNumber: phone });
}
