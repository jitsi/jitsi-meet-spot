import {
    SETUP_COMPLETED,
    SET_AVATAR_URL,
    SET_DISPLAY_NAME,
    SET_IS_PERMANENT_REMOTE_PAIRED,
    SET_IS_SPOT,
    SET_JWT,
    SET_PREFERRED_DEVICES,
    SET_TENANT
} from './action-types';

const DEFAULT_STATE = {
    avatarUrl: '',
    completed: false,
    displayName: undefined,
    isPermanentRemotePaired: false,
    isSpot: false,
    preferredCamera: undefined,
    preferredMic: undefined,
    preferredSpeaker: undefined,
    startParams: {}
};

/**
 * A {@code Reducer} to update the current Redux state for the 'setup' feature.
 * The 'setup' feature tracks whether Spot has been configured.
 *
 * @param {Object} state - The current Redux state for the 'setup' feature.
 * @param {Object} action - The Redux state update payload.
 * @returns {Object}
 */
const setup = (state = DEFAULT_STATE, action) => {
    switch (action.type) {
    case SETUP_COMPLETED:
        return {
            ...state,
            completed: true
        };

    case SET_AVATAR_URL:
        return {
            ...state,
            avatarUrl: action.avatarUrl
        };

    case SET_DISPLAY_NAME:
        return {
            ...state,
            displayName: action.displayName
        };

    case SET_IS_PERMANENT_REMOTE_PAIRED:
        return {
            ...state,
            isPermanentRemotePaired: action.isPermanentRemotePaired
        };

    case SET_IS_SPOT:
        return {
            ...state,
            isSpot: action.isSpot
        };

    case SET_JWT:
        return {
            ...state,
            jwt: action.jwt
        };

    case SET_PREFERRED_DEVICES:
        return {
            ...state,
            preferredCamera: action.cameraLabel,
            preferredMic: action.micLabel,
            preferredSpeaker: action.speakerLabel
        };

    case SET_TENANT:
        return {
            ...state,
            tenant: action.tenant
        };

    default:
        return state;
    }
};

export default setup;
