import {
    SETUP_COMPLETED,
    SET_DISPLAY_NAME,
    SET_IS_PERMANENT_REMOTE_PAIRED,
    SET_IS_SPOT,
    SET_JWT,
    SET_PREFERRED_DEVICES,
    SET_PREFERRED_RESOLUTION,
    SET_TENANT
} from './action-types';

interface ISetupState {
    completed: boolean;
    displayName?: string;
    isPermanentRemotePaired: boolean;
    isSpot: boolean;
    jwt?: string;
    preferredCamera?: string;
    preferredMic?: string;
    preferredResolution?: string | number;
    preferredSpeaker?: string;
    startParams: Record<string, any>;
    tenant?: string;
}

const DEFAULT_STATE: ISetupState = {
    completed: false,
    displayName: undefined,
    isPermanentRemotePaired: false,
    isSpot: false,
    preferredCamera: undefined,
    preferredMic: undefined,
    preferredResolution: undefined,
    preferredSpeaker: undefined,
    startParams: {}
};

/**
 * A {@code Reducer} to update the current Redux state for the 'setup' feature.
 * The 'setup' feature tracks whether Spot has been configured.
 *
 * @param state - The current Redux state for the 'setup' feature.
 * @param action - The Redux state update payload.
 * @returns {Object}
 */
const setup = (state: ISetupState = DEFAULT_STATE, action: any): ISetupState => {
    switch (action.type) {
    case SETUP_COMPLETED:
        return {
            ...state,
            completed: true
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
    case SET_PREFERRED_RESOLUTION:
        return {
            ...state,
            preferredResolution: action.resolution
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
