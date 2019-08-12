import { ReducerRegistry } from '../../common/redux';

import {
    SET_LONG_LIVED_PAIRING_CODE_INFO
} from './actionTypes';

ReducerRegistry.register('spot-tv/backend', (state = { }, action) => {
    switch (action.type) {
    case SET_LONG_LIVED_PAIRING_CODE_INFO:
        return {
            ...state,
            longLivedPairingCodeInfo: action.longLivedPairingCodeInfo
        };

    default:
        return state;
    }
});
