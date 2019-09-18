import {
    SPOT_TV_CLEAR_STATE,
    SPOT_TV_SET_REMOTE_JOIN_CODE,
    SPOT_TV_SET_STATE
} from './action-types';

/**
 * Removes all knowledge of Spot-TV state.
 *
 * @returns {Object}
 */
export function clearSpotTVState() {
    return {
        type: SPOT_TV_CLEAR_STATE
    };
}

/**
* Updates the known join code for connecting a Spot-Remote to a Spot-TV.
*
* @param {string} remoteJoinCode - The string necessary for a Spot-Remote to
* connect to a Spot-TV.
* @returns {Object}
*/
export function setRemoteJoinCode(remoteJoinCode) {
    return {
        type: SPOT_TV_SET_REMOTE_JOIN_CODE,
        remoteJoinCode
    };
}

/**
 * Generic action arbitrarily updating the known state of Spot-TV.
 *
 * @param {Object} newState - The new state to be stored in redux.
 * @returns {Object}
 */
export function setSpotTVState(newState) {
    return {
        type: SPOT_TV_SET_STATE,
        newState
    };
}

/* eslint-disable jsdoc/require-description-complete-sentence */
/**
 * Extracts a phone number(if any) from the invites passed to the meeting view as part of the URL query and stores it in
 * Spot TV state so that Spot Remotes can display it in the UI.
 *
 * @param {Array<{ type: string, number: string }>} [invites] - An array of invites as specified by Jitsi Meet iframe
 * API.
 * @returns {Function}
 */
export function storePhoneNumberFromInvites(invites) {
    return dispatch => {
        const phoneInvites = invites && invites.filter(invite => invite.type === 'phone');
        const phone = phoneInvites && phoneInvites[0] && phoneInvites[0].number;

        dispatch(setSpotTVState({ invitedPhoneNumber: phone }));
    };
}
/* eslint-enable jsdoc/require-description-complete-sentence */
