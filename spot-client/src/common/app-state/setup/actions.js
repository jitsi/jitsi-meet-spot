import {
    SETUP_COMPLETED,
    SET_AVATAR_URL,
    SET_CUSTOMER_ID,
    SET_DISPLAY_NAME,
    SET_IS_PERMANENT_REMOTE_PAIRED,
    SET_IS_SPOT,
    SET_JWT,
    SET_PREFERRED_DEVICES,
    SET_ROOM_ID,
    SET_TENANT
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
 * Sets the customer ID assigned to the room's owner.
 *
 * @param {string} [customerId] - The customer ID assigned to the room's owner.
 * @returns {Object}
 */
export function setCustomerId(customerId) {
    return {
        type: SET_CUSTOMER_ID,
        customerId
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
 * Sets the JWT used for authentication with the backend services.
 *
 * @param {string} jwt - The JWT string to be stored in the redux store.
 * @returns {Object}
 */
export function setJwt(jwt) {
    return {
        type: SET_JWT,
        jwt
    };
}

/**
 * Sets whether or not any permanent Spot Remote is connected to the Spot TV.
 *
 * @param {boolean} isPermanentRemotePaired - Whether or not a permanent remote
 * is paired.
 * @returns {Object}
 */
export function setIsPermanentRemotePaired(isPermanentRemotePaired) {
    return {
        type: SET_IS_PERMANENT_REMOTE_PAIRED,
        isPermanentRemotePaired
    };
}

/**
 * Stores what audio and video devices should be used when video conferencing.
 *
 * @param {string} cameraLabel - The device label associated with the camera
 * device to use.
 * @param {string} micLabel - The device label associated with the microphone
 * device to use.
 * @param {string} speakerLabel - The device label associated with the speaker
 * device to use.
 * @returns {Object}
 */
export function setPreferredDevices(cameraLabel, micLabel, speakerLabel) {
    return {
        type: SET_PREFERRED_DEVICES,
        cameraLabel,
        micLabel,
        speakerLabel
    };
}

/**
 * Sets the room ID provided by the backend.
 *
 * @param {string} roomId - The room id.
 * @returns {Object}
 */
export function setRoomId(roomId) {
    return {
        type: SET_ROOM_ID,
        roomId
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
 * Stores a tenant advertised by the backend in the Redux state.
 *
 * @param {?string} tenant - A tenant name(if any) to store.
 * @returns {Object}
 */
export function setTenant(tenant) {
    return {
        type: SET_TENANT,
        tenant
    };
}
