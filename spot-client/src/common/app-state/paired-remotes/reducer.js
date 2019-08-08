import {
    PAIRED_REMOTE_ADD,
    PAIRED_REMOTE_CLEAR,
    PAIRED_REMOTE_REMOVE
} from './actionTypes';

const DEFAULT_STATE = {
    remotes: {}
};

export const pairedRemotes = (state = DEFAULT_STATE, action) => {
    switch (action.type) {
    case PAIRED_REMOTE_ADD:
        return {
            ...state,
            remotes: {
                ...state.remotes,
                [action.id]: {
                    type: action.remoteType
                }
            }
        };

    case PAIRED_REMOTE_CLEAR:
        return DEFAULT_STATE;

    case PAIRED_REMOTE_REMOVE: {
        const newRemotesState = { ...state.remotes };

        delete newRemotesState[action.id];

        return {
            ...state,
            remotes: newRemotesState
        };
    }
    }

    return state;
};

export default pairedRemotes;
