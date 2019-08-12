import { ReducerRegistry } from '../../common/redux';

import {
    SET_PERMANENT_PAIRING_CODE
} from './actionTypes';

ReducerRegistry.register('backend', (state = { }, action) => {
    switch (action.type) {
    case SET_PERMANENT_PAIRING_CODE:
        return {
            ...state,
            permanentPairingCode: action.permanentPairingCode
        };

    default:
        return state;
    }
});
