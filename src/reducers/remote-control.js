const DEFAULT_STATE = {
    localId: null,
    remoteId: null
};

export const REMOTE_CONTROL_SET_LOCAL_ID = 'REMOTE_CONTROL_SET_LOCAL_ID';

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

export default remoteControl;

export function getLocalRemoteControlId(state) {
    return state.remoteControl.localId;
}
