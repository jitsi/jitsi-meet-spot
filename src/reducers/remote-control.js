const DEFAULT_STATE = {
    localId: null,
    remoteId: null
};

export const REMOTE_CONTROL_SET_LOCAL_ID = 'REMOTE_CONTROL_SET_LOCAL_ID';

/**
 * A {@code Reducer} to update the current Redux state for the 'remoteControl'
 * feature. The 'remoteControl' feature stores information necessary for
 * remote participants to connect and control the current instance of the
 * application.
 *
 * @param {Object} state - The current Redux state for the 'setup' feature.
 * @param {Object} action - The Redux state update payload.
 */
const remoteControl = (state = DEFAULT_STATE, action) => {
    switch (action.type) {
    case REMOTE_CONTROL_SET_LOCAL_ID:
        return {
            ...state,
            localId: action.id
        };

    default:
        return state;
    }
};

/**
 * A selector which returns an id to be used to locate the current instance of
 * the application through a remote control service.
 *
 * @param {Object} state - The Redux state.
 * @returns {string}
 */
export function getLocalRemoteControlId(state) {
    return state.remoteControl.localId;
}

export default remoteControl;
