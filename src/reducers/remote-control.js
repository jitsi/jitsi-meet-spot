const DEFAULT_STATE = {
    localId: null,
    lock: null,
    remoteId: null
};

export const REMOTE_CONTROL_SET_LOCK = 'REMOTE_CONTROL_SET_LOCK';

/**
 * A {@code Reducer} to update the current Redux state for the 'remoteControl'
 * feature. The 'remoteControl' feature stores information necessary for
 * remote controllers to connect and control a Spot instance.
 *
 * @param {Object} state - The current Redux state for the 'setup' feature.
 * @param {Object} action - The Redux state update payload.
 * @returns {Object}
 */
const remoteControl = (state = DEFAULT_STATE, action) => {
    switch (action.type) {
    case REMOTE_CONTROL_SET_LOCK:
        return {
            ...state,
            lock: action.lock
        };

    default:
        return state;
    }
};

/**
 * A selector which returns the last known lock code for establishing a remote
 * control connection.
 *
 * @param {Object} state - The Redux state.
 * @returns {string};
 */
export function getCurrentLock(state) {
    return state.remoteControl.lock;
}

/**
 * A selector which returns an id to be used by Spot and remote controls to
 * identify each other through the remote control service.
 *
 * @param {Object} state - The Redux state.
 * @returns {string}
 */
export function getLocalRemoteControlId(state) {
    return state.remoteControl.localId;
}

export default remoteControl;
