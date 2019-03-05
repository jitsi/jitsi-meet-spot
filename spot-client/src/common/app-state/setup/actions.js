import {
    SETUP_COMPLETED,
    SET_IS_SPOT,
    SET_SHOW_MEETING_TOOLBAR
} from './action-types';

/**
 * Sets whether or not the current client is acting as a Spot.
 *
 * @param {boolean} isSpot - Whether or not the current client is a Spot
 * instance.
 * @returns {Object}
 */
export function setIsSpot(isSpot) {
    return {
        type: SET_IS_SPOT,
        isSpot
    };
}

/**
 * Signals that the Spot setup flow has been successfully completed and should
 * no longer be displayed.
 *
 * @returns {Object}
 */
export function setSetupCompleted() {
    return {
        type: SETUP_COMPLETED
    };
}

/**
 * Updates the setting for whether or not the Jitsi-Meeting should show a
 * toolbar. The toolbar may be useful to show for debugging the meeting.
 *
 * @param {boolean} visible - Whether or not the toolbar should be displayed.
 * @returns {Object}
 */
export function setMeetingToolbarVisible(visible) {
    return {
        type: SET_SHOW_MEETING_TOOLBAR,
        visible
    };
}
