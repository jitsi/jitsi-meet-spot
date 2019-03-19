import {
    SETUP_COMPLETED,
    SET_AVATAR_URL,
    SET_DISPLAY_NAME,
    SET_IS_SPOT,
    SET_SHOW_MEETING_TOOLBAR
} from './action-types';

/**
 * Updates the preferred avatar URL to use for Spot-TV while in a meeting.
 *
 * @param {string} avatarUrl - The URL to an image.
 * @returns {Object}
 */
export function setAvatarUrl(avatarUrl) {
    return {
        type: SET_AVATAR_URL,
        avatarUrl
    };
}

/**
 * Updates the preferred display name to use for Spot-TV while in a meeting.
 *
 * @param {string} displayName - The display name.
 * @returns {Object}
 */
export function setDisplayName(displayName) {
    return {
        type: SET_DISPLAY_NAME,
        displayName
    };
}

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
