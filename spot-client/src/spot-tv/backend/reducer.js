import { ReducerRegistry } from '../../common/redux';

import {
    SET_LONG_LIVED_PAIRING_CODE_INFO,
    SET_PERMANENT_PAIRING_CODE
} from './actionTypes';

ReducerRegistry.register('spot-tv/backend', (state = { }, action) => {
    switch (action.type) {
    case SET_LONG_LIVED_PAIRING_CODE_INFO:
        return {
            ...state,
            longLivedPairingCodeInfo: action.longLivedPairingCodeInfo
        };

    case SET_PERMANENT_PAIRING_CODE:
        return {
            ...state,
            permanentPairingCode: action.permanentPairingCode
        };

    default:
        return state;
    }
});
